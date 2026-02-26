<?php

namespace App\Accounting\Controllers;

use App\Accounting\Models\FiscalPeriod;
use App\Accounting\Models\FiscalYear;
use App\Accounting\Models\LedgerAccount;
use App\Accounting\Models\Voucher;
use App\Accounting\Models\VoucherLine;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LedgerAccountController extends Controller
{
    /**
     * AJAX search for ledger accounts
     */
    public function ledgerSearch(Request $request)
    {
        $search = trim($request->input('search', ''));

        if ($search === '') {
            return response()->json([]);
        }

        $ledgers = LedgerAccount::query()
            ->whereNotNull('parent_id')           // only leaf or sub-accounts
            ->where('is_active', true)            // only active accounts
            ->where('is_control_account', false)  // exclude control accounts
            ->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            })
            ->orderBy('code')
            ->limit(20)
            ->get();

        return response()->json($ledgers);
    }

    public function cashLedgerList()
    {
        // Find Cash control account
        $cashControl = LedgerAccount::where('name', 'Cash')
            ->where('is_control_account', true)
            ->where('is_active', true)
            ->first();

        if (!$cashControl) {
            return response()->json([]);
        }

        $ledgers = LedgerAccount::query()
            ->where('parent_id', $cashControl->id)   // only Cash children
            ->where('is_active', true)
            ->where('is_control_account', false)
            ->orderBy('code')
            ->get();

        return response()->json($ledgers);
    }

    /**
     * Index page
     */
    public function index(): Response
    {
        $glAccounts = LedgerAccount::query()
            ->whereNull('parent_id')
            ->with('childrenRecursive')
            ->orderBy('code')
            ->get();

        $groupAccounts = LedgerAccount::query()
            ->where('is_control_account', true)
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        $fiscalYears = FiscalYear::query()
            ->orderBy('code', 'desc')
            ->get(['id', 'code']);

        $fiscalPeriods = FiscalPeriod::query()
            ->orderBy('period_name')
            ->get(['id', 'period_name']);

        return Inertia::render('accounting/ledger-accounts/index', [
            'glAccounts' => $glAccounts,
            'groupAccounts' => $groupAccounts,
            'fiscalYears' => $fiscalYears,
            'fiscalPeriods' => $fiscalPeriods,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    /**
     * Create new ledger account
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|string|max:50|unique:ledger_accounts,code',
            'name' => 'required|string|max:100',
            'type' => 'required|in:ASSET,LIABILITY,EQUITY,INCOME,EXPENSE',
            'is_control_account' => 'boolean',
            'parent_id' => 'nullable|exists:ledger_accounts,id',
            'opening_balance' => 'nullable|numeric|min:0',
            'fiscal_year_id' => 'required|exists:fiscal_years,id',
            'fiscal_period_id' => 'required|exists:fiscal_periods,id',
        ]);

        // Wrap everything in a transaction
        DB::transaction(function () use ($data, $request) {
            // Prevent setting a parent on a control account
            if (!empty($data['is_control_account']) && !empty($data['parent_id'])) {
                throw new \Exception('Control accounts cannot have a parent.');
            }

            // Create the ledger account
            $account = LedgerAccount::create([
                ...$data,
                'is_leaf' => empty($data['is_control_account']),
            ]);

            // Update parent's leaf status
            if ($account->parent_id) {
                LedgerAccount::where('id', $account->parent_id)->update(['is_leaf' => false]);
            }

            // Optional: create opening balance voucher
            if (!empty($data['opening_balance']) && $account->is_leaf) {
                $openingVoucher = Voucher::create([
                    'voucher_type' => 'JOURNAL_OR_NON_CASH',
                    'voucher_no' => 'OPEN-' . strtoupper($account->code),
                    'narration' => 'Opening balance for ' . $account->name,
                    'status' => Voucher::STATUS_POSTED,
                    'fiscal_year_id' => $data['fiscal_year_id'],
                    'fiscal_period_id' => $data['fiscal_period_id'],
                    'created_by' => auth()->id(),
                    'posted_by' => auth()->id(),
                    'posted_at' => now(),
                ]);

                // Ledger line for the new account
                VoucherLine::create([
                    'voucher_id' => $openingVoucher->id,
                    'ledger_account_id' => $account->id,
                    'debit' => in_array($account->type, ['ASSET', 'EXPENSE']) ? $data['opening_balance'] : 0,
                    'credit' => in_array($account->type, ['LIABILITY', 'EQUITY', 'INCOME']) ? $data['opening_balance'] : 0,
                ]);

                // Counterbalance entry
                $openingEquity = LedgerAccount::where('code', '9999')->firstOrFail(); // Opening Balances Equity
                VoucherLine::create([
                    'voucher_id' => $openingVoucher->id,
                    'ledger_account_id' => $openingEquity->id,
                    'debit' => in_array($account->type, ['LIABILITY', 'EQUITY', 'INCOME']) ? $data['opening_balance'] : 0,
                    'credit' => in_array($account->type, ['ASSET', 'EXPENSE']) ? $data['opening_balance'] : 0,
                ]);
            }
        });

        return back()->with('success', 'Account created successfully.');
    }

    /**
     * Update existing ledger account
     */
    public function update(Request $request, LedgerAccount $ledgerAccount)
    {
        $rules = [
            'name' => 'required|string|max:100',
            'type' => 'required|in:ASSET,LIABILITY,EQUITY,INCOME,EXPENSE',
            'is_control_account' => 'boolean',
            'parent_id' => [
                'nullable',
                'exists:ledger_accounts,id',
                function ($attribute, $value, $fail) use ($ledgerAccount) {
                    if ($value == $ledgerAccount->id) {
                        $fail('Parent account cannot be self.');
                    }
                }
            ],
            'opening_balance' => 'nullable|numeric|min:0',
            'fiscal_year_id' => 'required|exists:fiscal_years,id',
            'fiscal_period_id' => 'required|exists:fiscal_periods,id',
        ];

        if ($request->code !== $ledgerAccount->code) {
            $rules['code'] = [
                'required',
                'string',
                'max:50',
                Rule::unique('ledger_accounts', 'code')->ignore($ledgerAccount->id),
            ];
        }

        $data = $request->validate($rules);

        DB::transaction(function () use ($ledgerAccount, $data) {
            // Prevent parent on control account
            if (!empty($data['is_control_account']) && !empty($data['parent_id'])) {
                throw new \Exception('Control accounts cannot have a parent.');
            }

            // Update ledger account
            $ledgerAccount->update($data);

            // Update leaf status for parent accounts
            if ($ledgerAccount->parent_id) {
                LedgerAccount::where('id', $ledgerAccount->parent_id)->update(['is_leaf' => false]);
            }
            if ($ledgerAccount->children()->count() === 0 && !$ledgerAccount->is_control_account) {
                $ledgerAccount->update(['is_leaf' => true]);
            }

            // Handle opening balance
            if ($ledgerAccount->is_leaf) {
                $openingVoucher = Voucher::firstOrCreate(
                    [
                        'voucher_no' => 'OPEN-' . strtoupper($ledgerAccount->code),
                        'voucher_type' => 'JOURNAL_OR_NON_CASH',
                    ],
                    [
                        'narration' => 'Opening balance for ' . $ledgerAccount->name,
                        'status' => Voucher::STATUS_POSTED,
                        'fiscal_year_id' => $data['fiscal_year_id'],
                        'fiscal_period_id' => $data['fiscal_period_id'],
                        'created_by' => auth()->id(),
                        'posted_by' => auth()->id(),
                        'posted_at' => now(),
                    ]
                );

                // Update or create voucher line for this account
                $line = $openingVoucher->lines()->firstOrNew([
                    'ledger_account_id' => $ledgerAccount->id,
                ]);
                $line->debit = in_array($ledgerAccount->type, ['ASSET', 'EXPENSE']) ? $data['opening_balance'] ?? 0 : 0;
                $line->credit = in_array($ledgerAccount->type, ['LIABILITY', 'EQUITY', 'INCOME']) ? $data['opening_balance'] ?? 0 : 0;
                $line->save();

                // Counterbalance entry
                $openingEquity = LedgerAccount::where('code', '9999')->firstOrFail(); // Opening Balances Equity
                $counter = $openingVoucher->lines()->firstOrNew([
                    'ledger_account_id' => $openingEquity->id,
                ]);
                $counter->debit = in_array($ledgerAccount->type, ['LIABILITY', 'EQUITY', 'INCOME']) ? $data['opening_balance'] ?? 0 : 0;
                $counter->credit = in_array($ledgerAccount->type, ['ASSET', 'EXPENSE']) ? $data['opening_balance'] ?? 0 : 0;
                $counter->save();
            }
        });

        return back()->with('success', 'Account updated successfully.');
    }

    /**
     * Delete ledger account
     */
    public function destroy(LedgerAccount $ledgerAccount)
    {
        if ($ledgerAccount->children()->exists()) {
            return back()->with('error', 'Cannot delete account with children.');
        }

        $parent = $ledgerAccount->parent;
        $ledgerAccount->delete();

        // If parent has no more children, mark it as leaf
        if ($parent && $parent->children()->count() === 0) {
            $parent->update(['is_leaf' => true]);
        }

        return back()->with('success', 'Account deleted successfully.');
    }
}