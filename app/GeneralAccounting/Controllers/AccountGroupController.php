<?php

namespace App\GeneralAccounting\Controllers;

use App\GeneralAccounting\Application\AccountGroupService;
use App\GeneralAccounting\Models\AccountGroup;
use App\GeneralAccounting\Requests\StoreAccountGroupRequest;
use App\GeneralAccounting\Requests\UpdateAccountGroupRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountGroupController extends Controller
{
    public function __construct(
        private readonly AccountGroupService $groupService,
    ) {
        $this->middleware('permission:accounting.coa.view')->only(['index']);
        $this->middleware('permission:accounting.coa.create')->only(['create', 'store']);
        $this->middleware('permission:accounting.coa.update')->only(['edit', 'update']);
        $this->middleware('permission:accounting.coa.delete')->only(['destroy']);
    }

    public function index(Request $request): Response
    {
        $groups = $this->organizationQuery($request)
            ->withCount(['children', 'accounts'])
            ->orderBy('code')
            ->get();

        return Inertia::render('general-accounting/chart-of-accounts/groups/index', [
            'accountGroups' => $groups,
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('general-accounting/chart-of-accounts/groups/form', [
            'parents' => $this->organizationQuery($request)->orderBy('code')->get(),
        ]);
    }

    public function store(StoreAccountGroupRequest $request)
    {
        try {
            $data = $request->validated();
            $data['organization_id'] = $request->attributes->get('active_organization')->id;
            $this->groupService->create($data);
        } catch (\InvalidArgumentException | \RuntimeException $exception) {
            return back()->withInput()->with('error', $exception->getMessage());
        }

        return redirect()->route('account-groups.index')->with('success', 'Account group created successfully.');
    }

    public function edit(Request $request, AccountGroup $accountGroup): Response
    {
        $this->authorizeOrganization($request, $accountGroup);

        return Inertia::render('general-accounting/chart-of-accounts/groups/form', [
            'accountGroup' => $accountGroup,
            'parents' => $this->organizationQuery($request)
                ->where('id', '!=', $accountGroup->id)
                ->orderBy('code')
                ->get(),
        ]);
    }

    public function update(UpdateAccountGroupRequest $request, AccountGroup $accountGroup)
    {
        $this->authorizeOrganization($request, $accountGroup);

        try {
            $this->groupService->update($accountGroup, $request->validated());
        } catch (\InvalidArgumentException | \RuntimeException $exception) {
            return back()->withInput()->with('error', $exception->getMessage());
        }

        return redirect()->route('account-groups.index')->with('success', 'Account group updated successfully.');
    }

    public function destroy(Request $request, AccountGroup $accountGroup)
    {
        $this->authorizeOrganization($request, $accountGroup);

        try {
            $this->groupService->delete($accountGroup);
        } catch (\RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return redirect()->route('account-groups.index')->with('success', 'Account group deleted successfully.');
    }

    public function reorder(Request $request, AccountGroup $accountGroup)
    {
        $this->authorizeOrganization($request, $accountGroup);

        $data = $request->validate([
            'parent_id' => ['nullable', 'integer', 'exists:account_groups,id'],
        ]);

        if (($data['parent_id'] ?? null) !== null && (int) $data['parent_id'] === $accountGroup->id) {
            return back()->with('error', 'A group cannot be its own parent.');
        }

        $accountGroup->parent_id = $data['parent_id'] ?? null;
        $accountGroup->level = $this->parentLevel($accountGroup->parent_id);
        $accountGroup->save();

        return redirect()->route('ledger-accounts.index')->with('success', 'Account group moved successfully.');
    }

    private function organizationQuery(Request $request)
    {
        return AccountGroup::query()->where(
            'organization_id',
            $request->attributes->get('active_organization')->id,
        );
    }

    private function authorizeOrganization(Request $request, AccountGroup $group): void
    {
        abort_unless(
            $group->organization_id === $request->attributes->get('active_organization')->id,
            404,
        );
    }

    private function parentLevel(?int $parentId): int
    {
        if ($parentId === null) {
            return 0;
        }

        return (int) AccountGroup::query()->whereKey($parentId)->value('level') + 1;
    }
}
