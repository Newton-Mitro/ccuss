<?php

namespace App\Branch\Controllers;

use App\Branch\Models\Branch;
use App\Branch\Requests\StoreBranchRequest;
use App\Branch\Requests\UpdateBranchRequest;
use App\Http\Controllers\Controller;
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

        $branches = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('branches/index', [
            'branches' => $branches,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('branches/create');
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
        return Inertia::render('branches/show', [
            'branch' => $branch,
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
