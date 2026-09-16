<?php

namespace App\GeneralAccounting\Controllers;

use App\GeneralAccounting\Application\LedgerAccountService;
use App\GeneralAccounting\Models\AccountGroup;
use App\GeneralAccounting\Models\LedgerAccount;
use App\GeneralAccounting\Requests\StoreLedgerAccountRequest;
use App\GeneralAccounting\Requests\UpdateLedgerAccountRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LedgerAccountController extends Controller
{
    public function __construct(
        private readonly LedgerAccountService $accountService,
    ) {
    }

    public function index(Request $request): Response
    {
        $accounts = $this->organizationQuery($request)
            ->with(['group', 'parent', 'children'])
            ->orderBy('code')
            ->paginate($request->integer('per_page', 50))
            ->withQueryString();

        return Inertia::render('general-accounting/chart-of-accounts/index', [
            'glAccounts' => $accounts,
            'accountGroups' => $this->accountGroups($request),
            'filters' => $request->only(['search', 'per_page', 'page', 'view']),
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('general-accounting/chart-of-accounts/create-ledger-account-page', [
            'accountGroups' => $this->accountGroups($request),
            'parents' => $this->organizationQuery($request)->orderBy('code')->get(),
        ]);
    }

    public function store(StoreLedgerAccountRequest $request)
    {
        try {
            $data = $request->validated();
            $data['organization_id'] = $request->attributes->get('active_organization')->id;
            $this->accountService->create($data);
        } catch (\InvalidArgumentException | \RuntimeException $exception) {
            return back()->withInput()->with('error', $exception->getMessage());
        }

        return redirect()->route('ledger-accounts.index')->with('success', 'Ledger account created successfully.');
    }

    public function show(Request $request, LedgerAccount $ledgerAccount): Response
    {
        $this->authorizeOrganization($request, $ledgerAccount);

        return Inertia::render('general-accounting/chart-of-accounts/show-ledger-account-page', [
            'ledger' => $ledgerAccount->load(['group', 'parent', 'children']),
        ]);
    }

    public function edit(Request $request, LedgerAccount $ledgerAccount): Response
    {
        $this->authorizeOrganization($request, $ledgerAccount);

        return Inertia::render('general-accounting/chart-of-accounts/edit-ledger-account-page', [
            'ledger' => $ledgerAccount,
            'accountGroups' => $this->accountGroups($request),
            'parents' => $this->organizationQuery($request)->where('id', '!=', $ledgerAccount->id)->orderBy('code')->get(),
        ]);
    }

    public function update(UpdateLedgerAccountRequest $request, LedgerAccount $ledgerAccount)
    {
        $this->authorizeOrganization($request, $ledgerAccount);

        try {
            $this->accountService->update($ledgerAccount, $request->validated());
        } catch (\InvalidArgumentException | \RuntimeException $exception) {
            return back()->withInput()->with('error', $exception->getMessage());
        }

        return redirect()->route('ledger-accounts.index')->with('success', 'Ledger account updated successfully.');
    }

    public function destroy(Request $request, LedgerAccount $ledgerAccount)
    {
        $this->authorizeOrganization($request, $ledgerAccount);

        try {
            $this->accountService->delete($ledgerAccount);
        } catch (\RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return redirect()->route('ledger-accounts.index')->with('success', 'Ledger account deleted successfully.');
    }

    public function ledgerSearch(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('search', ''));

        $accounts = $this->organizationQuery($request)
            ->when($search !== '', fn($query) => $query
                ->where('name', 'like', "%{$search}%")
                ->orWhere('code', 'like', "%{$search}%"))
            ->where('status', true)
            ->orderBy('code')
            ->limit(25)
            ->get(['id', 'code', 'name', 'type', 'normal_balance']);

        return response()->json(['data' => $accounts]);
    }

    private function accountGroups(Request $request)
    {
        return AccountGroup::query()
            ->where('organization_id', $request->attributes->get('active_organization')->id)
            ->orderBy('code')
            ->get();
    }

    private function organizationQuery(Request $request)
    {
        return LedgerAccount::query()->where(
            'organization_id',
            $request->attributes->get('active_organization')->id,
        );
    }

    private function authorizeOrganization(Request $request, LedgerAccount $account): void
    {
        abort_unless(
            $account->organization_id === $request->attributes->get('active_organization')->id,
            404,
        );
    }
}
