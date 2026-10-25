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
        $genderCounts = Customer::query()
            ->where('organization_id', $organizationId)
            ->where('type', Customer::TYPE_INDIVIDUAL)
            ->selectRaw('gender, COUNT(*) as total')
            ->groupBy('gender')
            ->pluck('total', 'gender');
        $statusCounts = Customer::query()
            ->where('organization_id', $organizationId)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');
        $stats = [
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
        ];

        return Inertia::render('customers-kyc/dashboard', [
            'charts' => [
                'demographics' => [
                    'male' => (int) ($genderCounts['MALE'] ?? 0),
                    'female' => (int) ($genderCounts['FEMALE'] ?? 0),
                    'other' => (int) ($genderCounts['OTHER'] ?? 0),
                    'organization' => Customer::query()
                        ->where('organization_id', $organizationId)
                        ->where('type', Customer::TYPE_ORGANIZATION)
                        ->count(),
                ],
                'statuses' => [
                    'active' => (int) ($statusCounts[Customer::STATUS_ACTIVE] ?? 0),
                    'pending' => (int) ($statusCounts[Customer::STATUS_PENDING] ?? 0),
                    'inactive' => (int) ($statusCounts[Customer::STATUS_INACTIVE] ?? 0),
                    'suspended' => (int) ($statusCounts[Customer::STATUS_SUSPENDED] ?? 0),
                    'closed' => (int) ($statusCounts[Customer::STATUS_CLOSED] ?? 0),
                ],
                'pendingApprovals' => [
                    'customers' => $stats['pendingCustomers'],
                    'addresses' => $stats['pendingAddresses'],
                    'familyRelations' => $stats['pendingFamilyRelations'],
                    'introducers' => $stats['pendingIntroducers'],
                    'documents' => $stats['pendingDocuments'],
                ],
            ],
            'stats' => $stats,
        ]);
    }
}
