<?php

namespace App\GeneralAccounting\Controllers;

use App\GeneralAccounting\Models\Party;
use App\GeneralAccounting\Requests\StorePartyRequest;
use App\GeneralAccounting\Requests\UpdatePartyRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PartyController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:accounting.parties.view')->only('index');
        $this->middleware('permission:accounting.parties.create')->only(['create', 'store']);
        $this->middleware('permission:accounting.parties.update')->only(['edit', 'update']);
        $this->middleware('permission:accounting.parties.delete')->only('destroy');
    }

    public function index(Request $request): Response
    {
        $parties = $this->organizationQuery($request)
            ->when($request->filled('search'), function ($query) use ($request): void {
                $search = $request->string('search')->trim();
                $query->where(function ($query) use ($search): void {
                    $query->where('code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->paginate($request->integer('per_page', 18))
            ->withQueryString();

        return Inertia::render('general-accounting/parties/index', [
            'parties' => $parties,
            'filters' => $request->only(['search', 'per_page', 'page']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('general-accounting/parties/form');
    }

    public function store(StorePartyRequest $request)
    {
        Party::create([
            ...$request->validated(),
            'organization_id' => $request->attributes->get('active_organization')->id,
        ]);

        return redirect()->route('parties.index')->with('success', 'Party created successfully.');
    }

    public function edit(Request $request, Party $party): Response
    {
        $this->authorizeOrganization($request, $party);

        return Inertia::render('general-accounting/parties/form', ['party' => $party]);
    }

    public function update(UpdatePartyRequest $request, Party $party)
    {
        $this->authorizeOrganization($request, $party);
        $party->update($request->validated());

        return redirect()->route('parties.index')->with('success', 'Party updated successfully.');
    }

    public function destroy(Request $request, Party $party)
    {
        $this->authorizeOrganization($request, $party);

        if ($party->voucherEntries()->exists()) {
            return back()->with('error', 'A party referenced by voucher entries cannot be deleted.');
        }

        $party->delete();

        return redirect()->route('parties.index')->with('success', 'Party deleted successfully.');
    }

    private function organizationQuery(Request $request)
    {
        return Party::query()->where(
            'organization_id',
            $request->attributes->get('active_organization')->id,
        );
    }

    private function authorizeOrganization(Request $request, Party $party): void
    {
        abort_unless(
            $party->organization_id === $request->attributes->get('active_organization')->id,
            404,
        );
    }
}