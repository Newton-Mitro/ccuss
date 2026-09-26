<?php

namespace App\TreasuryAndCash\Controllers;

use App\Http\Controllers\Controller;
use App\TreasuryAndCash\Application\BranchDayService;
use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Requests\CloseBranchDayRequest;
use App\TreasuryAndCash\Requests\OpenBranchDayRequest;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class BranchDayController extends Controller
{
    public function __construct(
        private readonly BranchDayService $branchDayService,
    ) {
        $this->middleware('permission:branch_days.view')->only(['index']);
        $this->middleware('permission:branch_days.open')->only(['create', 'open']);
        $this->middleware('permission:branch_days.close')->only(['close']);
    }

    public function index(Request $request): Response
    {
        $organization = $request->attributes->get('active_organization');

        $branchDays = $this->branchDayService->listForOrganization(
            $organization->id,
            $request->input('search'),
            $request->input('per_page', 18),
        );

        return Inertia::render('treasury-cash/branch-days/index', [
            'branch_days' => $branchDays,
            'filters' => $request->only(['search', 'per_page', 'page']),
            'auth' => [
                'user' => [
                    'branch_id' => $request->user()?->branch_id,
                ],
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $organization = $request->attributes->get('active_organization');

        return Inertia::render('treasury-cash/branch-days/create', [
            'organization' => $organization,
            'user_branch_id' => $request->user()?->branch_id,
        ]);
    }

    public function open(OpenBranchDayRequest $request): RedirectResponse
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();

        if (!$user?->branch_id) {
            return redirect()->route('branch-days.index')
                ->with('error', 'A branch assignment is required to open a branch day.');
        }

        try {
            $this->branchDayService->open(
                $organization->id,
                $user->branch_id,
                $user->id,
                $request->validated('business_date'),
                $request->validated('opening_note'),
            );
        } catch (\RuntimeException $exception) {
            return back()->withInput()->with('error', $exception->getMessage());
        }

        return redirect()->route('branch-days.index')
            ->with('success', 'Branch day opened successfully.');
    }

    public function close(CloseBranchDayRequest $request, BranchDay $branchDay): RedirectResponse
    {
        $this->authorizeBranchDay($branchDay, $request);

        try {
            $this->branchDayService->close(
                $branchDay,
                $request->user()->id,
                $request->validated('closing_note'),
            );
        } catch (\RuntimeException $exception) {
            return back()->withInput()->with('error', $exception->getMessage());
        }

        return redirect()->route('branch-days.index')
            ->with('success', 'Branch day closed successfully.');
    }

    private function authorizeBranchDay(BranchDay $branchDay, Request $request): void
    {
        abort_unless(
            $branchDay->organization_id === $request->attributes->get('active_organization')->id
            && $branchDay->branch_id === $request->user()->branch_id,
            404,
        );
    }
}
