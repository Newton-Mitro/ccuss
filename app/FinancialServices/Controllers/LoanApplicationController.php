<?php

namespace App\FinancialServices\Controllers;

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Application\LoanApplicationService;
use App\FinancialServices\Application\LoanProtectionClaimService;
use App\FinancialServices\Application\LoanScheduleService;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\LoanApplication;
use App\FinancialServices\Models\LoanApplicationSupportingDocument;
use App\FinancialServices\Models\LoanArrear;
use App\FinancialServices\Models\LoanCollateral;
use App\FinancialServices\Models\LoanGuarantor;
use App\FinancialServices\Models\LoanProduct;
use App\FinancialServices\Models\LoanProtectionClaim;
use App\FinancialServices\Models\LoanProtectionProduct;
use App\FinancialServices\Models\LoanSchedule;
use App\FinancialServices\Requests\ApproveLoanProtectionClaimRequest;
use App\FinancialServices\Requests\DecideLoanApplicationRequest;
use App\FinancialServices\Requests\StoreLoanApplicationRequest;
use App\FinancialServices\Requests\StoreLoanCollateralRequest;
use App\FinancialServices\Requests\StoreLoanGuarantorRequest;
use App\FinancialServices\Requests\StoreLoanProtectionClaimRequest;
use App\FinancialServices\Requests\StoreLoanProtectionRequest;
use App\Http\Controllers\Controller;
use App\SystemAdministration\Application\ApprovalNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class LoanApplicationController extends Controller
{
    public function __construct(
        private readonly LoanApplicationService $service,
        private readonly LoanScheduleService $scheduleService,
        private readonly LoanProtectionClaimService $claimService,
        private readonly ApprovalNotificationService $approvalNotifications,
    ) {
        $this->middleware('permission:financial.loan-applications.view')->only(['index', 'show']);
        $this->middleware('permission:financial.loan-applications.documents.view')->only(['downloadSupportingDocument', 'downloadProtectionClaimDocument']);
        $this->middleware('permission:financial.loan-applications.create')->only(['create', 'store', 'submit', 'submitProtectionClaim']);
        $this->middleware('permission:financial.loan-applications.update')->only(['edit', 'update']);
        $this->middleware('permission:financial.loan-applications.manage')->only(['review', 'approve', 'reject', 'createLoanAccount', 'generateSchedule', 'addScheduleInstallment', 'updateScheduleInstallment', 'cancelScheduleInstallment', 'assessArrears', 'resolveArrear', 'storeCollateral', 'verifyCollateral', 'releaseCollateral', 'storeGuarantor', 'decideGuarantor', 'storeProtection', 'activateProtection', 'cancelProtection', 'approveProtectionClaim', 'rejectProtectionClaim']);
    }

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $status = $request->string('status')->upper()->toString();
        $applications = $this->service->queryForOrganization($this->organizationId($request))
            ->with(['customer:id,name,customer_no', 'product:id,code,name'])
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('application_no', 'like', "%{$search}%")
                        ->orWhereHas('customer', fn ($customerQuery) => $customerQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('customer_no', 'like', "%{$search}%"))
                        ->orWhereHas('product', fn ($productQuery) => $productQuery
                            ->where('code', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%"));
                });
            })
            ->when($status !== '' && $status !== 'ALL', fn ($query) => $query->where('status', $status))
            ->latest('id')
            ->paginate($request->integer('per_page', 18))
            ->withQueryString();

        return Inertia::render('financial-services/loan-applications/index', [
            'applications' => $applications,
            'filters' => $request->only(['search', 'status', 'per_page', 'page']),
            'can_update' => $request->user()->hasPermission('financial.loan-applications.update'),
            'can_manage_protection_products' => $request->user()->hasPermission('financial.loan-protection-products.manage'),
        ]);
    }

    public function create(Request $request): Response
    {
        $organizationId = $this->organizationId($request);

        return Inertia::render('financial-services/loan-applications/form', [
            'customers' => Customer::query()->where('organization_id', $organizationId)->orderBy('name')->get(['id', 'customer_no', 'name']),
            'products' => LoanProduct::query()->where('organization_id', $organizationId)->where('status', true)->orderBy('code')->get(['id', 'code', 'name']),
            'protectionProducts' => LoanProtectionProduct::query()->where('organization_id', $organizationId)->where('status', true)->orderBy('code')->get(['id', 'code', 'name', 'description', 'monthly_rate_percent', 'status']),
            'application' => null,
            'can_view_supporting_documents' => $request->user()->hasPermission('financial.loan-applications.documents.view'),
        ]);
    }

    public function edit(Request $request, LoanApplication $loanApplication): Response
    {
        $this->authorizeOrganization($request, $loanApplication);
        abort_unless($loanApplication->status === 'DRAFT', 404);
        $organizationId = $this->organizationId($request);
        $canViewSupportingDocuments = $request->user()->hasPermission('financial.loan-applications.documents.view');
        $application = $loanApplication->load(['incomeDetails', 'expenseDetails', 'jobHistories', 'assetDetails', 'educations', 'loanProtectionProduct']);
        $protectionProducts = LoanProtectionProduct::query()
            ->where('organization_id', $organizationId)
            ->where(function ($query) use ($loanApplication): void {
                $query->where('status', true)
                    ->orWhere('id', $loanApplication->loan_protection_product_id);
            })
            ->orderBy('code')
            ->get(['id', 'code', 'name', 'description', 'monthly_rate_percent', 'status']);
        if ($canViewSupportingDocuments) {
            $application->load('supportingDocuments');
        }

        return Inertia::render('financial-services/loan-applications/form', [
            'customers' => Customer::query()->where('organization_id', $organizationId)->orderBy('name')->get(['id', 'customer_no', 'name']),
            'products' => LoanProduct::query()->where('organization_id', $organizationId)->where('status', true)->orderBy('code')->get(['id', 'code', 'name']),
            'protectionProducts' => $protectionProducts,
            'application' => $application,
            'can_view_supporting_documents' => $canViewSupportingDocuments,
        ]);
    }

    public function store(StoreLoanApplicationRequest $request)
    {
        $application = $this->service->create($request->validated(), $this->organizationId($request));

        return redirect()->route('loan-applications.show', $application)->with('success', 'Loan application saved as draft.');
    }

    public function update(StoreLoanApplicationRequest $request, LoanApplication $loanApplication)
    {
        $this->authorizeOrganization($request, $loanApplication);
        $this->service->updateDraft($loanApplication, $request->validated());

        return redirect()->route('loan-applications.show', $loanApplication)->with('success', 'Draft loan application updated.');
    }

    public function show(Request $request, LoanApplication $loanApplication): Response
    {
        $this->authorizeOrganization($request, $loanApplication);
        $canViewSupportingDocuments = $request->user()->hasPermission('financial.loan-applications.documents.view');
        $application = $loanApplication->load(['customer', 'product', 'loanAccount.protectionPolicy.product', 'loanAccount.protectionClaims.payoutAccount', 'loanAccount.disbursements.financialTransaction', 'loanAccount.repayments.financialTransaction', 'loanAccount.repayments.allocations.component', 'loanAccount.schedules.components', 'loanAccount.arrears', 'collaterals', 'guarantors.customer', 'incomeDetails', 'expenseDetails', 'jobHistories', 'assetDetails', 'educations']);
        if ($canViewSupportingDocuments) {
            $application->load('supportingDocuments');
        }

        return Inertia::render('financial-services/loan-applications/show', [
            'application' => $application,
            'can_view_supporting_documents' => $canViewSupportingDocuments,
            'can_submit_protection_claim' => $request->user()->hasPermission('financial.loan-applications.create'),
            'can_manage_protection_claims' => $request->user()->hasPermission('financial.loan-applications.manage'),
            'can_manage_schedule' => $request->user()->hasPermission('financial.loan-applications.manage'),
            'can_create_disbursement' => $request->user()->hasPermission('financial.transactions.create'),
            'payout_accounts' => $request->user()->hasPermission('financial.transactions.create')
                || $request->user()->hasPermission('financial.loan-applications.manage')
                ? FinancialAccount::query()
                    ->where('organization_id', $this->organizationId($request))
                    ->whereIn('account_type', ['CASH', 'BANK'])
                    ->whereIn('status', ['PENDING', 'ACTIVE'])
                    ->orderBy('account_no')
                    ->get(['id', 'account_no', 'name', 'account_type'])
                : [],
            'guarantorCustomers' => Customer::query()
                ->where('organization_id', $this->organizationId($request))
                ->where('id', '!=', $loanApplication->customer_id)
                ->orderBy('name')
                ->get(['id', 'customer_no', 'name']),
        ]);
    }

    public function submit(Request $request, LoanApplication $loanApplication)
    {
        $this->authorizeOrganization($request, $loanApplication);
        $this->service->submit($loanApplication);
        $this->approvalNotifications->notifyOrganizationUsers(
            $this->organizationId($request),
            ['financial.loan-applications.view', 'financial.loan-applications.manage'],
            $request->user()->id,
            'Loan application submitted for review',
            "Loan application {$loanApplication->application_no} is ready for review.",
            route('loan-applications.show', $loanApplication, false),
            'approval.requested',
        );

        return back()->with('success', 'Loan application submitted for review.');
    }

    public function downloadSupportingDocument(Request $request, LoanApplication $loanApplication, LoanApplicationSupportingDocument $document)
    {
        $this->authorizeOrganization($request, $loanApplication);
        abort_unless($document->loan_application_id === $loanApplication->id, 404);
        abort_unless(Storage::disk('local')->exists($document->file_path), 404);
        $stream = Storage::disk('local')->readStream($document->file_path);
        abort_unless(is_resource($stream), 404);

        return response()->streamDownload(static function () use ($stream): void {
            fpassthru($stream);
            fclose($stream);
        }, $document->file_name, ['Content-Type' => $document->mime_type ?? 'application/octet-stream']);
    }

    public function submitProtectionClaim(StoreLoanProtectionClaimRequest $request, LoanApplication $loanApplication)
    {
        $this->authorizeOrganization($request, $loanApplication);
        $this->claimService->submit($loanApplication, $request->validated(), $request->user()->id);
        $this->approvalNotifications->notifyOrganizationUsers(
            $this->organizationId($request),
            ['financial.loan-applications.view', 'financial.loan-applications.manage'],
            $request->user()->id,
            'Credit-life claim awaiting review',
            "A credit-life claim for loan application {$loanApplication->application_no} is ready for review.",
            route('loan-applications.show', $loanApplication, false),
            'approval.requested',
        );

        return back()->with('success', 'Credit-life claim submitted for review.');
    }

    public function approveProtectionClaim(ApproveLoanProtectionClaimRequest $request, LoanApplication $loanApplication, LoanProtectionClaim $claim)
    {
        $this->authorizeOrganization($request, $loanApplication);
        $this->claimService->approve($loanApplication, $claim, $request->validated(), $this->organizationId($request), $request->user()->id);
        $this->notifyLoanDecision($request, $loanApplication, 'approved');

        return back()->with('success', 'Claim approved and a pending loan settlement transaction was created.');
    }

    public function rejectProtectionClaim(Request $request, LoanApplication $loanApplication, LoanProtectionClaim $claim)
    {
        $this->authorizeOrganization($request, $loanApplication);
        $validated = $request->validate(['decision_note' => ['required', 'string', 'max:2000']]);
        $this->claimService->reject($loanApplication, $claim, $validated['decision_note'], $request->user()->id);
        $this->notifyLoanDecision($request, $loanApplication, 'rejected');

        return back()->with('success', 'Credit-life claim rejected.');
    }

    public function downloadProtectionClaimDocument(Request $request, LoanApplication $loanApplication, LoanProtectionClaim $claim)
    {
        $this->authorizeOrganization($request, $loanApplication);
        abort_unless($claim->loanAccount?->loan_application_id === $loanApplication->id, 404);
        abort_unless(Storage::disk('local')->exists($claim->death_certificate_path), 404);
        $stream = Storage::disk('local')->readStream($claim->death_certificate_path);
        abort_unless(is_resource($stream), 404);

        return response()->streamDownload(static function () use ($stream): void {
            fpassthru($stream);
            fclose($stream);
        }, $claim->death_certificate_name, ['Content-Type' => 'application/octet-stream']);
    }

    public function review(Request $request, LoanApplication $loanApplication)
    {
        $this->authorizeOrganization($request, $loanApplication);
        $this->service->startReview($loanApplication);

        return back()->with('success', 'Loan application moved to review.');
    }

    public function approve(DecideLoanApplicationRequest $request, LoanApplication $loanApplication)
    {
        $this->authorizeOrganization($request, $loanApplication);
        $this->service->approve($loanApplication, $request->validated(), $request->user()->id);
        $this->notifyLoanDecision($request, $loanApplication, 'approved');

        return back()->with('success', 'Loan application approved.');
    }

    public function reject(DecideLoanApplicationRequest $request, LoanApplication $loanApplication)
    {
        $this->authorizeOrganization($request, $loanApplication);
        $this->service->reject($loanApplication, $request->validated());
        $this->notifyLoanDecision($request, $loanApplication, 'rejected');

        return back()->with('success', 'Loan application rejected.');
    }

    private function notifyLoanDecision(Request $request, LoanApplication $loanApplication, string $decision): void
    {
        $this->approvalNotifications->notifyOrganizationUsers(
            $this->organizationId($request),
            ['financial.loan-applications.view', 'financial.loan-applications.manage'],
            $request->user()->id,
            "Loan application {$decision}",
            "Loan application {$loanApplication->application_no} was {$decision}.",
            route('loan-applications.show', $loanApplication, false),
            "approval.{$decision}",
        );
    }

    public function createLoanAccount(Request $request, LoanApplication $loanApplication)
    {
        $this->authorizeOrganization($request, $loanApplication);
        $loanAccount = $this->service->createLoanAccount($loanApplication);

        return back()->with('success', "Loan account {$loanAccount->loan_no} created successfully.");
    }

    public function generateSchedule(Request $request, LoanApplication $loanApplication)
    {
        $this->authorizeOrganization($request, $loanApplication);
        abort_unless($loanApplication->loanAccount, 422, 'Create the loan account before generating a schedule.');
        $this->scheduleService->generate($loanApplication->loanAccount, $request->only(['frequency', 'term_months', 'start_date']));

        return back()->with('success', 'Loan repayment schedule generated successfully.');
    }

    public function addScheduleInstallment(Request $request, LoanApplication $loanApplication)
    {
        $this->authorizeOrganization($request, $loanApplication);
        abort_unless($loanApplication->loanAccount, 422, 'Create the loan account before adding an installment.');
        $data = $request->validate([
            'due_date' => ['required', 'date'],
            'scheduled_principal' => ['nullable', 'numeric', 'min:0'],
            'scheduled_interest' => ['nullable', 'numeric', 'min:0'],
            'scheduled_fee' => ['nullable', 'numeric', 'min:0'],
            'scheduled_protection_fee' => ['nullable', 'numeric', 'min:0'],
        ]);

        try {
            $this->scheduleService->addInstallment($loanApplication->loanAccount, $data);
        } catch (RuntimeException $exception) {
            return back()->withErrors(['schedule' => $exception->getMessage()]);
        }

        return back()->with('success', 'Repayment installment added successfully.');
    }

    public function updateScheduleInstallment(Request $request, LoanApplication $loanApplication, LoanSchedule $schedule)
    {
        $this->authorizeOrganization($request, $loanApplication);
        abort_unless($loanApplication->loanAccount, 422, 'Create the loan account before managing installments.');
        $data = $request->validate([
            'due_date' => ['required', 'date'],
            'scheduled_principal' => ['nullable', 'numeric', 'min:0'],
            'scheduled_interest' => ['nullable', 'numeric', 'min:0'],
            'scheduled_fee' => ['nullable', 'numeric', 'min:0'],
            'scheduled_protection_fee' => ['nullable', 'numeric', 'min:0'],
        ]);

        try {
            $this->scheduleService->updateInstallment($loanApplication->loanAccount, $schedule, $data);
        } catch (RuntimeException $exception) {
            return back()->withErrors(['schedule' => $exception->getMessage()]);
        }

        return back()->with('success', 'Repayment installment updated successfully.');
    }

    public function cancelScheduleInstallment(Request $request, LoanApplication $loanApplication, LoanSchedule $schedule)
    {
        $this->authorizeOrganization($request, $loanApplication);
        abort_unless($loanApplication->loanAccount, 422, 'Create the loan account before managing installments.');

        try {
            $this->scheduleService->cancelInstallment(
                $loanApplication->loanAccount,
                $schedule,
                $request->user()->id,
            );
        } catch (RuntimeException $exception) {
            return back()->withErrors(['schedule' => $exception->getMessage()]);
        }

        return back()->with('success', 'Repayment installment cancelled successfully.');
    }

    public function assessArrears(Request $request, LoanApplication $loanApplication)
    {
        $this->authorizeOrganization($request, $loanApplication);
        abort_unless($loanApplication->loanAccount, 422, 'Create the loan account before assessing arrears.');
        $this->scheduleService->assessArrears($loanApplication->loanAccount, $request->string('as_of_date')->value() ?: null);

        return back()->with('success', 'Loan arrears assessed successfully.');
    }

    public function resolveArrear(Request $request, LoanApplication $loanApplication, LoanArrear $arrear)
    {
        $this->authorizeOrganization($request, $loanApplication);
        abort_unless($arrear->loanAccount?->application_id === $loanApplication->id, 404);
        $this->scheduleService->resolveArrear(
            $arrear,
            $request->string('resolution')->upper()->value(),
            $request->user()->id,
            $request->string('note')->value() ?: null,
        );

        return back()->with('success', 'Loan arrear resolution recorded.');
    }

    public function storeCollateral(StoreLoanCollateralRequest $request, LoanApplication $loanApplication)
    {
        $this->authorizeOrganization($request, $loanApplication);
        $this->service->addCollateral($loanApplication, $request->validated());

        return back()->with('success', 'Loan collateral added successfully.');
    }

    public function verifyCollateral(Request $request, LoanApplication $loanApplication, LoanCollateral $collateral)
    {
        $this->authorizeOrganization($request, $loanApplication);
        $approved = $request->boolean('approved');
        $this->service->verifyCollateral($loanApplication, $collateral, $approved, $request->string('notes')->value() ?: null);

        return back()->with('success', $approved ? 'Collateral verified.' : 'Collateral rejected.');
    }

    public function releaseCollateral(Request $request, LoanApplication $loanApplication, LoanCollateral $collateral)
    {
        $this->authorizeOrganization($request, $loanApplication);
        $this->service->releaseCollateral($loanApplication, $collateral, $request->string('notes')->value() ?: null);

        return back()->with('success', 'Collateral released.');
    }

    public function storeGuarantor(StoreLoanGuarantorRequest $request, LoanApplication $loanApplication)
    {
        $this->authorizeOrganization($request, $loanApplication);
        $this->service->addGuarantor($loanApplication, $request->integer('customer_id'), $request->string('notes')->value() ?: null);

        return back()->with('success', 'Guarantor invitation created.');
    }

    public function decideGuarantor(Request $request, LoanApplication $loanApplication, LoanGuarantor $guarantor)
    {
        $this->authorizeOrganization($request, $loanApplication);
        $this->service->decideGuarantor($loanApplication, $guarantor, $request->boolean('accepted'), $request->string('notes')->value() ?: null);

        return back()->with('success', 'Guarantor decision recorded.');
    }

    public function storeProtection(StoreLoanProtectionRequest $request, LoanApplication $loanApplication)
    {
        $this->authorizeOrganization($request, $loanApplication);
        $this->service->configureProtection($loanApplication, $request->validated());

        return back()->with('success', 'Protection policy saved.');
    }

    public function activateProtection(Request $request, LoanApplication $loanApplication)
    {
        $this->authorizeOrganization($request, $loanApplication);
        $this->service->setProtectionStatus($loanApplication, 'ACTIVE');

        return back()->with('success', 'Protection policy activated.');
    }

    public function cancelProtection(Request $request, LoanApplication $loanApplication)
    {
        $this->authorizeOrganization($request, $loanApplication);
        $this->service->setProtectionStatus($loanApplication, 'CANCELLED');

        return back()->with('success', 'Protection policy cancelled.');
    }

    private function organizationId(Request $request): int
    {
        return (int) $request->attributes->get('active_organization')->id;
    }

    private function authorizeOrganization(Request $request, LoanApplication $application): void
    {
        abort_unless($application->organization_id === $this->organizationId($request), 404);
    }
}
