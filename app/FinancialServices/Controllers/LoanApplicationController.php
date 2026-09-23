<?php

namespace App\FinancialServices\Controllers;

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Application\LoanApplicationService;
use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\LoanApplication;
use App\FinancialServices\Requests\DecideLoanApplicationRequest;
use App\FinancialServices\Requests\StoreLoanApplicationRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LoanApplicationController extends Controller
{
    public function __construct(private readonly LoanApplicationService $service)
    {
        $this->middleware('permission:financial.loan-applications.view')->only(['index', 'show']);
        $this->middleware('permission:financial.loan-applications.create')->only(['create', 'store', 'submit']);
        $this->middleware('permission:financial.loan-applications.manage')->only(['review', 'approve', 'reject', 'createLoanAccount']);
    }

    public function index(Request $request): Response
    {
        $applications = $this->service->queryForOrganization($this->organizationId($request))
            ->with(['customer:id,name,customer_no', 'product:id,code,name'])
            ->when($request->filled('status'), fn($query) => $query->where('status', $request->string('status')->upper()))
            ->latest('id')
            ->paginate($request->integer('per_page', 18))
            ->withQueryString();

        return Inertia::render('financial-services/loan-applications/index', [
            'applications' => $applications,
            'filters' => $request->only(['status', 'per_page', 'page']),
        ]);
    }

    public function create(Request $request): Response
    {
        $organizationId = $this->organizationId($request);

        return Inertia::render('financial-services/loan-applications/form', [
            'customers' => Customer::query()->where('organization_id', $organizationId)->orderBy('name')->get(['id', 'customer_no', 'name']),
            'products' => FinancialProduct::query()->where('organization_id', $organizationId)->where('category', 'LOAN')->where('status', true)->orderBy('code')->get(['id', 'code', 'name']),
        ]);
    }

    public function store(StoreLoanApplicationRequest $request)
    {
        $application = $this->service->create($request->validated(), $this->organizationId($request));

        return redirect()->route('loan-applications.show', $application)->with('success', 'Loan application saved as draft.');
    }

    public function show(Request $request, LoanApplication $loanApplication): Response
    {
        $this->authorizeOrganization($request, $loanApplication);

        return Inertia::render('financial-services/loan-applications/show', [
            'application' => $loanApplication->load(['customer', 'product', 'loanAccount']),
        ]);
    }

    public function submit(Request $request, LoanApplication $loanApplication)
    {
        $this->authorizeOrganization($request, $loanApplication);
        $this->service->submit($loanApplication);

        return back()->with('success', 'Loan application submitted for review.');
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

        return back()->with('success', 'Loan application approved.');
    }

    public function reject(DecideLoanApplicationRequest $request, LoanApplication $loanApplication)
    {
        $this->authorizeOrganization($request, $loanApplication);
        $this->service->reject($loanApplication, $request->validated());

        return back()->with('success', 'Loan application rejected.');
    }

    public function createLoanAccount(Request $request, LoanApplication $loanApplication)
    {
        $this->authorizeOrganization($request, $loanApplication);
        $loanAccount = $this->service->createLoanAccount($loanApplication);

        return back()->with('success', "Loan account {$loanAccount->loan_no} created successfully.");
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