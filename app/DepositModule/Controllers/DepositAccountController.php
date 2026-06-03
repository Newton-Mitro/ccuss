<?php

namespace App\DepositModule\Controllers;

use App\CustomerModule\Models\Customer;
use App\CustomerModule\Models\KycProfile;
use App\CustomerModule\Requests\StoreCustomerRequest;
use App\CustomerModule\Requests\UpdateCustomerRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class DepositAccountController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Customer::with(['photo', 'kycProfile']);

        if ($search = $request->input('search')) {
            $query->where(
                fn($q) =>
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('customer_no', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
            );
        }

        if ($kycStatus = $request->input('kyc_status')) {
            if ($kycStatus !== 'all') {
                $query->where('kyc_status', $kycStatus);
            }
        }

        $customers = $query->latest()
            ->paginate($request->input('per_page', 18))
            ->withQueryString();

        return Inertia::render('customer-kyc/customers/list_customer_page', [
            'paginated_data' => $customers,
            'filters' => $request->only(['search', 'kyc_status', 'per_page', 'page']),
        ]);
    }

    /* ==========================
     * Create Customer Page
     * ========================== */
    public function create(): Response
    {
        return Inertia::render('deposit-module/accounts/account_opening_page');
    }

}