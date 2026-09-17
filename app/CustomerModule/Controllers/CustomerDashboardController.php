<?php

namespace App\CustomerModule\Controllers;

use App\CustomerModule\Models\Customer;
use App\CustomerModule\Models\CustomerAddress;
use App\CustomerModule\Models\CustomerFamilyRelation;
use App\CustomerModule\Models\CustomerIntroducer;
use App\CustomerModule\Models\KycDocument;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerDashboardController
{
    public function index(Request $request): Response
    {
        $organizationId = $request->attributes->get('active_organization')->id;
        $customerIds = Customer::query()
            ->where('organization_id', $organizationId)
            ->select('id');

        return Inertia::render('customer-kyc/dashboard', [
            'stats' => [
                'customers' => Customer::where('organization_id', $organizationId)->count(),
                'activeCustomers' => Customer::where('organization_id', $organizationId)
                    ->where('status', Customer::STATUS_ACTIVE)
                    ->count(),
                'pendingCustomers' => Customer::where('organization_id', $organizationId)
                    ->where('status', Customer::STATUS_PENDING)
                    ->count(),
                'pendingAddresses' => CustomerAddress::whereIn('customer_id', $customerIds)
                    ->where('verification_status', CustomerAddress::STATUS_PENDING)
                    ->count(),
                'pendingFamilyRelations' => CustomerFamilyRelation::whereIn('customer_id', $customerIds)
                    ->where('verification_status', CustomerFamilyRelation::STATUS_PENDING)
                    ->count(),
                'pendingIntroducers' => CustomerIntroducer::whereIn('introduced_customer_id', $customerIds)
                    ->where('verification_status', CustomerIntroducer::STATUS_PENDING)
                    ->count(),
                'pendingDocuments' => KycDocument::whereIn('customer_id', $customerIds)
                    ->where('verification_status', KycDocument::STATUS_PENDING)
                    ->count(),
            ],
        ]);
    }
}
