<?php

namespace App\SystemAdministration\Controllers;

use App\Http\Controllers\Controller;
use App\SystemAdministration\Application\BranchService;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Requests\StoreBranchRequest;
use App\SystemAdministration\Requests\UpdateBranchRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BranchController extends Controller
{
    public function __construct(
        private readonly BranchService $branchService,
    ) {
    }

    public function index(Request $request): Response
    {
        $query = Branch::query()->where(
            'organization_id',
            $request->attributes->get('active_organization')->id,
        );

        // ✅ Optional search filter
        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('code', 'like', "%{$search}%");
        }

        $branches = $query->latest()
            ->paginate(
                $request->input('per_page', 18)
            )->withQueryString();

        return Inertia::render('system-administration/branches/index', [
            'branches' => $branches,
            'filters' => $request->only(['search', 'per_page', 'page']),
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('system-administration/branches/create', [
            'organization' => $request->attributes->get('active_organization'),
        ]);
    }

    public function store(StoreBranchRequest $request)
    {
        try {
            $data = $request->validated();
            $data['organization_id'] = $request->attributes->get('active_organization')->id;
            $branch = $this->branchService->createBranch($data);
        } catch (\InvalidArgumentException | \RuntimeException $e) {
            return back()->withInput()->with('error', $e->getMessage());
        }

        return redirect()
            ->route('organizations.show', $branch->organization_id)
            ->with('success', $branch->name . ' Branch created successfully.');
    }

    public function show(Branch $branch): Response
    {
        $this->authorizeOrganization($branch);

        return Inertia::render('system-administration/branches/show', [
            'branch' => $branch->load(['manager', 'organization']),
        ]);
    }

    public function edit(Branch $branch): Response
    {
        $this->authorizeOrganization($branch);

        return Inertia::render('system-administration/branches/edit', [
            'branch' => $branch->load(['manager', 'organization']),
        ]);
    }

    public function update(UpdateBranchRequest $request, Branch $branch)
    {
        $this->authorizeOrganization($branch);

        try {
            $branch = $this->branchService->updateBranch($branch, $request->validated());
        } catch (\InvalidArgumentException | \RuntimeException $e) {
            return back()->withInput()->with('error', $e->getMessage());
        }

        return redirect()
            ->route('organizations.show', $branch->organization_id)
            ->with('success', $branch->name . ' Branch updated successfully.');
    }

    public function destroy(Branch $branch)
    {
        $this->authorizeOrganization($branch);

        $this->branchService->deleteBranch($branch);

        return redirect()
            ->route('organizations.show', $branch->organization_id)
            ->with('success', $branch->name . ' Branch deleted successfully.');
    }

    private function authorizeOrganization(Branch $branch): void
    {
        abort_unless(
            $branch->organization_id === request()->attributes->get('active_organization')->id,
            404,
        );
    }
}
