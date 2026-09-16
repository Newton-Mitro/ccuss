<?php

namespace App\GeneralAccounting\Controllers;

use App\GeneralAccounting\Application\VoucherService;
use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\LedgerAccount;
use App\GeneralAccounting\Models\Voucher;
use App\GeneralAccounting\Requests\StoreVoucherRequest;
use App\GeneralAccounting\Requests\UpdateVoucherRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VoucherController extends Controller
{
    public function __construct(
        private readonly VoucherService $voucherService,
    ) {
    }

    public function index(Request $request): Response
    {
        $vouchers = $this->organizationQuery($request)
            ->with(['fiscalPeriod', 'creator'])
            ->when($request->filled('status'), fn($query) => $query->where('status', $request->string('status')->upper()))
            ->when($request->filled('voucher_type'), fn($query) => $query->where('voucher_type', $request->string('voucher_type')->upper()))
            ->latest('voucher_date')
            ->latest('id')
            ->paginate($request->integer('per_page', 18))
            ->withQueryString();

        return Inertia::render('general-accounting/vouchers/index', [
            'vouchers' => $vouchers,
            'filters' => $request->only(['status', 'voucher_type', 'per_page', 'page']),
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('general-accounting/vouchers/create/journal_voucher_entry_page', [
            'fiscalPeriods' => $this->fiscalPeriods($request),
            'accounts' => $this->accounts($request),
        ]);
    }

    public function store(StoreVoucherRequest $request)
    {
        try {
            $voucher = $this->voucherService->createDraft(
                $request->validated(),
                $request->attributes->get('active_organization')->id,
                $request->user()->id,
            );
        } catch (\InvalidArgumentException | \RuntimeException $exception) {
            return back()->withInput()->with('error', $exception->getMessage());
        }

        return redirect()->route('vouchers.show', $voucher)->with('success', 'Voucher draft created successfully.');
    }

    public function show(Request $request, Voucher $voucher): Response
    {
        $this->authorizeOrganization($request, $voucher);

        return Inertia::render('general-accounting/vouchers/show', [
            'voucher' => $voucher->load(['entries.account', 'fiscalYear', 'fiscalPeriod', 'creator', 'poster']),
        ]);
    }

    public function edit(Request $request, Voucher $voucher): Response
    {
        $this->authorizeOrganization($request, $voucher);

        return Inertia::render('general-accounting/vouchers/edit/debit_voucher_edit_page', [
            'voucher' => $voucher->load('entries.account'),
            'fiscalPeriods' => $this->fiscalPeriods($request),
            'accounts' => $this->accounts($request),
        ]);
    }

    public function update(UpdateVoucherRequest $request, Voucher $voucher)
    {
        $this->authorizeOrganization($request, $voucher);

        try {
            $this->voucherService->updateDraft(
                $voucher,
                $request->validated(),
                $request->attributes->get('active_organization')->id,
            );
        } catch (\InvalidArgumentException | \RuntimeException $exception) {
            return back()->withInput()->with('error', $exception->getMessage());
        }

        return redirect()->route('vouchers.show', $voucher)->with('success', 'Voucher draft updated successfully.');
    }

    public function post(Request $request, Voucher $voucher)
    {
        $this->authorizeOrganization($request, $voucher);

        try {
            $this->voucherService->post(
                $voucher->load(['entries', 'fiscalPeriod']),
                $request->attributes->get('active_organization')->id,
                $request->user()->id,
            );
        } catch (\InvalidArgumentException | \RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()->with('success', 'Voucher posted successfully.');
    }

    public function cancel(Request $request, Voucher $voucher)
    {
        $this->authorizeOrganization($request, $voucher);

        try {
            $this->voucherService->cancel(
                $voucher,
                $request->attributes->get('active_organization')->id,
            );
        } catch (\RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()->with('success', 'Voucher cancelled successfully.');
    }

    public function reverse(Request $request, Voucher $voucher)
    {
        $this->authorizeOrganization($request, $voucher);

        try {
            $reversal = $this->voucherService->reverse(
                $voucher->load(['entries', 'fiscalPeriod']),
                $request->attributes->get('active_organization')->id,
                $request->user()->id,
            );
        } catch (\InvalidArgumentException | \RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return redirect()->route('vouchers.show', $reversal)->with('success', 'Voucher reversed successfully.');
    }

    private function fiscalPeriods(Request $request)
    {
        return FiscalPeriod::query()
            ->whereHas('fiscalYear', fn($query) => $query->where(
                'organization_id',
                $request->attributes->get('active_organization')->id,
            ))
            ->where('status', 'OPEN')
            ->with('fiscalYear')
            ->orderByDesc('start_date')
            ->get();
    }

    private function accounts(Request $request)
    {
        return LedgerAccount::query()
            ->where('organization_id', $request->attributes->get('active_organization')->id)
            ->where('status', true)
            ->orderBy('code')
            ->get(['id', 'code', 'name', 'type', 'normal_balance']);
    }

    private function organizationQuery(Request $request)
    {
        return Voucher::query()->where(
            'organization_id',
            $request->attributes->get('active_organization')->id,
        );
    }

    private function authorizeOrganization(Request $request, Voucher $voucher): void
    {
        abort_unless(
            $voucher->organization_id === $request->attributes->get('active_organization')->id,
            404,
        );
    }
}
