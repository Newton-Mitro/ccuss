<?php

namespace App\CostomerMgmt\Controllers;

use App\CostomerMgmt\Models\Customer;
use App\CostomerMgmt\Models\OnlineServiceUser;
use App\CostomerMgmt\Requests\StoreOnlineClientRequest;
use App\CostomerMgmt\Requests\UpdateOnlineClientRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Hash;

class OnlineServiceUserController extends Controller
{
    public function index(): Response
    {
        $filters = request()->only('search', 'per_page', 'page');
        $perPage = $filters['per_page'] ?? 10;

        // If search is empty, return empty paginator
        // if (empty($filters['search'])) {
        //     $onlineClients = OnlineUser::query()->whereRaw('0 = 1')->paginate($perPage);
        //     return Inertia::render('customer-management/online-clients/index', [
        //         'onlineClients' => $onlineClients,
        //         'filters' => $filters,
        //     ]);
        // }

        $search = $filters['search'] ?? '';
        $query = OnlineServiceUser::with('customer')
            ->latest()
            ->where(function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%")
                            ->orWhere('customer_no', 'like', "%{$search}%");
                    });
            });

        $onlineClients = $query->paginate($perPage)->withQueryString();

        return Inertia::render('customer-management/online-clients/index', [
            'onlineClients' => $onlineClients,
            'filters' => $filters,
        ]);
    }

    public function create(): Response
    {
        $customers = Customer::select('id', 'name', 'customer_no')->get();

        return Inertia::render('customer-management/online-clients/create', [
            'customers' => $customers,
        ]);
    }

    public function store(StoreOnlineClientRequest $request): RedirectResponse
    {
        $data = $request->validated();

        // ✅ Hash the password before saving
        $data['password'] = Hash::make($data['password']);

        // ✅ Check uniqueness for customer
        $exists = OnlineServiceUser::where('customer_id', $data['customer_id'])->exists();
        if ($exists) {
            return redirect()
                ->back()
                ->withErrors(['customer_id' => 'This customer already has an online account.'])
                ->withInput();
        }

        OnlineServiceUser::create($data);

        return redirect()
            ->route('online-clients.index')
            ->with('success', 'Online client created successfully.');
    }

    public function show(OnlineServiceUser $onlineClient): Response
    {
        return Inertia::render('customer-management/online-clients/show', [
            'onlineClient' => $onlineClient->load('customer'),
        ]);
    }

    public function edit(OnlineServiceUser $onlineClient): Response
    {
        return Inertia::render('customer-management/online-clients/edit', [
            'onlineClient' => $onlineClient->load('customer'),
        ]);
    }

    public function update(UpdateOnlineClientRequest $request, OnlineServiceUser $onlineClient): RedirectResponse
    {
        $data = $request->validated();

        // ✅ Re-hash password if provided
        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        // ✅ Prevent assigning same customer to multiple online users
        $exists = OnlineServiceUser::where('customer_id', $data['customer_id'])
            ->where('id', '!=', $onlineClient->id)
            ->exists();

        if ($exists) {
            return redirect()
                ->back()
                ->withErrors(['customer_id' => 'This customer already has another online user account.'])
                ->withInput();
        }

        $onlineClient->update($data);

        return redirect()
            ->route('online-clients.index')
            ->with('success', 'Online client updated successfully.');
    }

    public function destroy(OnlineServiceUser $onlineClient): RedirectResponse
    {
        $onlineClient->delete();

        return redirect()
            ->route('online-clients.index')
            ->with('success', 'Online client deleted successfully.');
    }
}
