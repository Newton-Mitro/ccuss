<?php

namespace App\CostomerManagement\OnlineClient\Controllers;

use App\CostomerManagement\Customer\Models\Customer;
use App\CostomerManagement\OnlineClient\Models\OnlineClient;
use App\CostomerManagement\OnlineClient\Requests\StoreOnlineClientRequest;
use App\CostomerManagement\OnlineClient\Requests\UpdateOnlineClientRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Hash;

class OnlineClientController extends Controller
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
        $query = OnlineClient::with('customer')
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
        $exists = OnlineClient::where('customer_id', $data['customer_id'])->exists();
        if ($exists) {
            return redirect()
                ->back()
                ->withErrors(['customer_id' => 'This customer already has an online account.'])
                ->withInput();
        }

        OnlineClient::create($data);

        return redirect()
            ->route('online-clients.index')
            ->with('success', 'Online client created successfully.');
    }

    public function show(OnlineClient $onlineClient): Response
    {
        return Inertia::render('customer-management/online-clients/show', [
            'onlineClient' => $onlineClient->load('customer'),
        ]);
    }

    public function edit(OnlineClient $onlineClient): Response
    {
        return Inertia::render('customer-management/online-clients/edit', [
            'onlineClient' => $onlineClient->load('customer'),
        ]);
    }

    public function update(UpdateOnlineClientRequest $request, OnlineClient $onlineClient): RedirectResponse
    {
        $data = $request->validated();

        // ✅ Re-hash password if provided
        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        // ✅ Prevent assigning same customer to multiple online users
        $exists = OnlineClient::where('customer_id', $data['customer_id'])
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

    public function destroy(OnlineClient $onlineClient): RedirectResponse
    {
        $onlineClient->delete();

        return redirect()
            ->route('online-clients.index')
            ->with('success', 'Online client deleted successfully.');
    }
}
