<?php

namespace App\CostomerMgmt\Controllers;

use App\CostomerMgmt\Models\Customer;
use App\CostomerMgmt\Models\OnlineServiceClient;
use App\CostomerMgmt\Requests\StoreOnlineClientRequest;
use App\CostomerMgmt\Requests\UpdateOnlineClientRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Hash;

class OnlineServiceClientController extends Controller
{
    public function index(): Response
    {
        $filters = request()->only('search', 'per_page', 'page');
        $perPage = $filters['per_page'] ?? 10;

        $search = $filters['search'] ?? '';
        $query = OnlineServiceClient::with('customer')
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

        $onlineServiceClients = $query->paginate($perPage)->withQueryString();

        return Inertia::render('customer-mgmt/online-service-clients/index', [
            'onlineServiceClients' => $onlineServiceClients,
            'filters' => $filters,
        ]);
    }

    public function create(): Response
    {
        $customers = Customer::select('id', 'name', 'customer_no')->get();

        return Inertia::render('customer-mgmt/online-service-clients/create', [
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

        OnlineServiceClient::create($data);

        return redirect()
            ->route('online-service-clients.index')
            ->with('success', 'Online service client created successfully.');
    }


    public function show(OnlineServiceClient $onlineServiceClient): Response
    {
        return Inertia::render('customer-mgmt/online-service-clients/show', [
            'onlineServiceClient' => $onlineServiceClient->load('customer'),
        ]);
    }

    public function edit(OnlineServiceClient $onlineServiceClient): Response
    {
        return Inertia::render('customer-mgmt/online-service-clients/edit', [
            'onlineServiceClient' => $onlineServiceClient->load('customer'),
        ]);
    }

    public function update(UpdateOnlineClientRequest $request, OnlineServiceClient $onlineServiceClient): RedirectResponse
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

        $onlineServiceClient->update($data);

        return redirect()
            ->route('online-service-clients.index')
            ->with('success', 'Online service client updated successfully.');
    }


    public function destroy(OnlineServiceClient $onlineServiceClient): RedirectResponse
    {
        $onlineServiceClient->delete();

        return redirect()
            ->route('online-service-clients.index')
            ->with('success', 'Online service client deleted successfully.');
    }
}
