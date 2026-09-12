<?php

namespace App\SystemAdministration\Controllers;

use App\Http\Controllers\Controller;
use App\SystemAdministration\Application\BranchService;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Requests\StoreBranchRequest;
use App\SystemAdministration\Requests\UpdateBranchRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
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
        $query = Branch::query();

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

    public function create(): Response
    {
        return Inertia::render('system-administration/branches/create');
    }

    public function store(StoreBranchRequest $request)
    {
        try {
            $branch = $this->branchService->createBranch($request->validated());
        } catch (\InvalidArgumentException | \RuntimeException $e) {
            return back()->withInput()->with('error', $e->getMessage());
        }

        return redirect()
            ->route('branches.index')
            ->with('success', $branch->name . ' Branch created successfully.');
    }

    public function show(Branch $branch): Response
    {
        return Inertia::render('system-administration/branches/show', [
            'branch' => $branch->load('manager'),
        ]);
    }

    public function edit(Branch $branch): Response
    {
        return Inertia::render('system-administration/branches/edit', [
            'branch' => $branch->load('manager'),
        ]);
    }

    public function update(UpdateBranchRequest $request, Branch $branch)
    {
        try {
            $branch = $this->branchService->updateBranch($branch, $request->validated());
        } catch (\InvalidArgumentException | \RuntimeException $e) {
            return back()->withInput()->with('error', $e->getMessage());
        }

        return redirect()
            ->route('branches.index')
            ->with('success', $branch->name . ' Branch updated successfully.');
    }

    public function destroy(Branch $branch)
    {
        $this->branchService->deleteBranch($branch);

        return redirect()
            ->route('branches.index')
            ->with('success', $branch->name . ' Branch deleted successfully.');
    }
}
