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
                ->when($request->filled('search'), function ($query) use ($request): void {
                    $search = $request->string('search')->trim();
                    $query->where(function ($query) use ($search): void {
                        $query->where('source_type', 'like', "%{$search}%")
                            ->orWhere('source_code', 'like', "%{$search}%")
                            ->orWhere('transaction_type', 'like', "%{$search}%")
                            ->orWhereHas('debitAccount', function ($accountQuery) use ($search): void {
                                $accountQuery->where('code', 'like', "%{$search}%")
                                    ->orWhere('name', 'like', "%{$search}%");
                            })
                            ->orWhereHas('creditAccount', function ($accountQuery) use ($search): void {
                                $accountQuery->where('code', 'like', "%{$search}%")
                                    ->orWhere('name', 'like', "%{$search}%");
                            });
                    });
                })
                ->with([
                    'debitAccount:id,code,name,is_control_account,is_cash_account',
                    'creditAccount:id,code,name,is_control_account,is_cash_account',
                ])
                ->orderBy('source_type')
                ->orderBy('source_code')
                ->orderBy('transaction_type')
                ->paginate($request->integer('per_page', 18))
                ->withQueryString(),
            'accounts' => LedgerAccount::query()
                ->where('organization_id', $organizationId)
                ->where('status', true)
                ->orderBy('code')
                ->get(['id', 'code', 'name', 'is_control_account', 'is_cash_account']),
            'sourceTypes' => self::SOURCE_TYPES,
            'filters' => $request->only(['search', 'per_page', 'page']),
        ]);
    }

    public function create(Request $request): Response
    {
        $organizationId = (int) $request->attributes->get('active_organization')->id;

        return Inertia::render('general-accounting/treasury-gl-mappings/form', [
            ...$this->formProps($organizationId),
        ]);
    }

    public function edit(Request $request, TreasuryGlMapping $mapping): Response
    {
        $organizationId = (int) $request->attributes->get('active_organization')->id;
        $this->authorizeMapping($mapping, $organizationId);

        return Inertia::render('general-accounting/treasury-gl-mappings/form', [
            ...$this->formProps($organizationId),
            'mapping' => $mapping->load([
                'debitAccount:id,code,name,is_control_account,is_cash_account',
                'creditAccount:id,code,name,is_control_account,is_cash_account',
            ]),
        ]);
    }

    public function show(Request $request, TreasuryGlMapping $mapping): Response
    {
        $this->authorizeMapping(
            $mapping,
            (int) $request->attributes->get('active_organization')->id,
        );

        return Inertia::render('general-accounting/treasury-gl-mappings/show', [
            'mapping' => $mapping->load([
                'debitAccount:id,code,name,is_control_account,is_cash_account',
                'creditAccount:id,code,name,is_control_account,is_cash_account',
            ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $organizationId = $request->attributes->get('active_organization')->id;
        $data = $this->validatedMappingData($request, $organizationId);

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

    public function update(Request $request, TreasuryGlMapping $mapping): RedirectResponse
    {
        $organizationId = $request->attributes->get('active_organization')->id;
        $this->authorizeMapping($mapping, $organizationId);
        $data = $this->validatedMappingData($request, $organizationId, $mapping);

        $mapping->update([
            ...$data,
            'status' => $request->boolean('status', true),
        ]);

        return redirect()->route('treasury-gl-mappings.index')->with('success', 'Treasury GL mapping updated.');
    }

    public function destroy(Request $request, TreasuryGlMapping $mapping): RedirectResponse
    {
        $this->authorizeMapping(
            $mapping,
            $request->attributes->get('active_organization')->id,
        );

        $mapping->delete();

        return redirect()->route('treasury-gl-mappings.index')->with('success', 'Treasury GL mapping deleted.');
    }

    private function validatedMappingData(
        Request $request,
        int $organizationId,
        ?TreasuryGlMapping $mapping = null,
    ): array {
        $request->merge([
            'source_code' => strtoupper(trim((string) $request->input('source_code'))),
            'transaction_type' => strtoupper(trim((string) $request->input('transaction_type'))),
        ]);

        $transactionTypeRules = ['required', 'string', 'max:50'];
        if ($mapping) {
            $sourceType = $request->input('source_type');
            $sourceCode = $request->input('source_code');
            $transactionTypeRules[] = Rule::unique(
                'gl_account_mappings',
                'transaction_type',
            )
                ->where(fn ($query) => $query
                    ->where('organization_id', $organizationId)
                    ->where('source_type', $sourceType)
                    ->where('source_code', $sourceCode))
                ->ignore($mapping->id);
        }

        $data = $request->validate([
            'source_type' => ['required', 'string', Rule::in(self::SOURCE_TYPES)],
            'source_code' => ['required', 'string', 'max:100'],
            'transaction_type' => $transactionTypeRules,
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
            'status' => ['sometimes', 'boolean'],
        ]);

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

        unset($data['status']);

        return $data;
    }

    private function authorizeMapping(TreasuryGlMapping $mapping, int $organizationId): void
    {
        abort_unless(
            $mapping->organization_id === $organizationId
                && in_array($mapping->source_type, self::SOURCE_TYPES, true),
            404,
        );
    }

    private function formProps(int $organizationId): array
    {
        return [
            'accounts' => LedgerAccount::query()
                ->where('organization_id', $organizationId)
                ->where('status', true)
                ->orderBy('code')
                ->get(['id', 'code', 'name', 'is_control_account', 'is_cash_account']),
            'sourceTypes' => self::SOURCE_TYPES,
        ];
    }
}
