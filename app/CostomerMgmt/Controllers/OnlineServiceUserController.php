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

        return Inertia::render('customer-mgmt/online-service-users/index', [
            'onlineClients' => $onlineClients,
            'filters' => $filters,
        ]);
    }

    public function create(): Response
    {
        $customers = Customer::select('id', 'name', 'customer_no')->get();

        return Inertia::render('customer-mgmt/online-service-users/create', [
            'customers' => $customers,
        ]);
    }

    public function store(StoreOnlineClientRequest $request): RedirectResponse
    {
        $data = $request->validated();

        // ✅ Extra controller-level check: email or phone must exist
        if (empty($data['email']) && empty($data['phone'])) {
            return redirect()
                ->back()
                ->withErrors(['contact' => 'Either email or phone must be provided.'])
                ->withInput();
        }

        $data['password'] = Hash::make($data['password']);

        OnlineServiceUser::create($data);

        return redirect()
            ->route('online-service-users.index')
            ->with('success', 'Online client created successfully.');
    }


    public function show(OnlineServiceUser $onlineServiceUser): Response
    {
        return Inertia::render('customer-mgmt/online-service-users/show', [
            'onlineServiceUser' => $onlineServiceUser->load('customer'),
        ]);
    }

    public function edit(OnlineServiceUser $onlineServiceUser): Response
    {
        return Inertia::render('customer-mgmt/online-service-users/edit', [
            'onlineServiceUser' => $onlineServiceUser->load('customer'),
        ]);
    }

    public function update(UpdateOnlineClientRequest $request, OnlineServiceUser $onlineServiceUser): RedirectResponse
    {
        $data = $request->validated();

        // ✅ Controller-level check: email or phone must exist
        if (empty($data['email']) && empty($data['phone'])) {
            return redirect()
                ->back()
                ->withErrors(['contact' => 'Either email or phone must be provided.'])
                ->withInput();
        }

        // Re-hash password if provided
        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $onlineServiceUser->update($data);

        return redirect()
            ->route('online-service-users.index')
            ->with('success', 'Online client updated successfully.');
    }


    public function destroy(OnlineServiceUser $onlineServiceUser): RedirectResponse
    {
        $onlineServiceUser->delete();

        return redirect()
            ->route('online-service-users.index')
            ->with('success', 'Online client deleted successfully.');
    }
}
