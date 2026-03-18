<?php

namespace App\SystemAdministration\Controllers;

use App\Http\Controllers\Controller;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Requests\StoreBranchRequest;
use App\SystemAdministration\Requests\UpdateBranchRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BranchController extends Controller
{
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
                $request->input('per_page', 10)
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
        Branch::create($request->validated());

        return redirect()
            ->route('branches.index')
            ->with('success', 'Branch created successfully.');
    }

    public function show(Branch $branch): Response
    {
        return Inertia::render('system-administration/branches/show', [
            'branch' => $branch->load('manager'),
        ]);
    }

    public function edit(Branch $branch): Response
    {
        return Inertia::render('branches/edit', [
            'branch' => $branch->load('manager'),
        ]);
    }

    public function update(UpdateBranchRequest $request, Branch $branch)
    {
        $branch->update($request->validated());

        return redirect()
            ->route('branches.index')
            ->with('success', 'Branch updated successfully.');
    }

    public function destroy(Branch $branch)
    {
        $branch->delete();

        return redirect()
            ->route('branches.index')
            ->with('success', 'Branch deleted successfully.');
    }
}
