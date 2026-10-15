<?php

namespace App\GeneralAccounting\Controllers;

use App\GeneralAccounting\Models\LedgerAccount;
use App\GeneralAccounting\Models\TreasuryGlMapping;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TreasuryGlMappingController extends Controller
{
    private const SOURCE_TYPES = [
        'BANK_ACCOUNT',
        'CASH_LOCATION',
        'PETTY_CASH_TRANSACTION',
    ];

    public function __construct()
    {
        $this->middleware('permission:accounting.treasury_mappings.manage');
    }

    public function index(Request $request): Response
    {
        $organizationId = $request->attributes->get('active_organization')->id;

        return Inertia::render('general-accounting/treasury-gl-mappings/index', [
            'mappings' => TreasuryGlMapping::query()
                ->where('organization_id', $organizationId)
                ->whereIn('source_type', self::SOURCE_TYPES)
                ->with([
                    'debitAccount:id,code,name,is_control_account,is_cash_account',
                    'creditAccount:id,code,name,is_control_account,is_cash_account',
                ])
                ->orderBy('source_type')
                ->orderBy('source_code')
                ->orderBy('transaction_type')
                ->get(),
            'accounts' => LedgerAccount::query()
                ->where('organization_id', $organizationId)
                ->where('status', true)
                ->orderBy('code')
                ->get(['id', 'code', 'name', 'is_control_account', 'is_cash_account']),
            'sourceTypes' => self::SOURCE_TYPES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $organizationId = $request->attributes->get('active_organization')->id;
        $data = $request->validate([
            'source_type' => ['required', 'string', Rule::in(self::SOURCE_TYPES)],
            'source_code' => ['required', 'string', 'max:100'],
            'transaction_type' => ['required', 'string', 'max:50'],
            'debit_account_id' => [
                'required',
                'integer',
                Rule::exists('accounts', 'id')->where(fn ($query) => $query
                    ->where('organization_id', $organizationId)
                    ->where('status', true)),
            ],
            'credit_account_id' => [
                'required',
                'integer',
                'different:debit_account_id',
                Rule::exists('accounts', 'id')->where(fn ($query) => $query
                    ->where('organization_id', $organizationId)
                    ->where('status', true)),
            ],
        ]);

        $data['source_code'] = strtoupper(trim($data['source_code']));
        $data['transaction_type'] = strtoupper(trim($data['transaction_type']));

        if ($data['source_type'] === 'CASH_LOCATION') {
            if (! in_array($data['transaction_type'], ['DEPOSIT', 'WITHDRAWAL'], true)) {
                throw ValidationException::withMessages([
                    'transaction_type' => 'Cash location mappings support deposits and withdrawals.',
                ]);
            }

            $cashAccountId = $data['transaction_type'] === 'DEPOSIT'
                ? $data['debit_account_id']
                : $data['credit_account_id'];
            $isCashControlAccount = LedgerAccount::query()
                ->where('organization_id', $organizationId)
                ->where('status', true)
                ->where('is_cash_account', true)
                ->where('is_control_account', true)
                ->whereKey($cashAccountId)
                ->exists();

            if (! $isCashControlAccount) {
                $field = $data['transaction_type'] === 'DEPOSIT'
                    ? 'debit_account_id'
                    : 'credit_account_id';

                throw ValidationException::withMessages([
                    $field => 'The cash side must use an active ledger account marked as both a cash account and a control account.',
                ]);
            }
        }

        TreasuryGlMapping::query()->updateOrCreate(
            [
                'organization_id' => $organizationId,
                'source_type' => $data['source_type'],
                'source_code' => $data['source_code'],
                'transaction_type' => $data['transaction_type'],
            ],
            [
                'debit_account_id' => $data['debit_account_id'],
                'credit_account_id' => $data['credit_account_id'],
                'status' => true,
            ],
        );

        return redirect()->route('treasury-gl-mappings.index')->with('success', 'Treasury GL mapping saved.');
    }

    public function destroy(Request $request, TreasuryGlMapping $mapping): RedirectResponse
    {
        abort_unless(
            $mapping->organization_id === $request->attributes->get('active_organization')->id
            && in_array($mapping->source_type, self::SOURCE_TYPES, true),
            404,
        );

        $mapping->delete();

        return redirect()->route('treasury-gl-mappings.index')->with('success', 'Treasury GL mapping deleted.');
    }
}
