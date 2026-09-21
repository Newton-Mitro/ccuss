<?php

namespace App\FinancialServices\Controllers;

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Application\CustomerCollectionService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerCollectionController extends Controller
{
    public function __construct(
        private readonly CustomerCollectionService $collectionService,
    ) {
        $this->middleware('permission:financial.accounts.view');
    }

    public function index(): Response
    {
        return Inertia::render('financial-services/collection/index');
    }

    public function search(Request $request): JsonResponse
    {
        $search = $request->string('search')->trim()->value();

        if ($search === '') {
            return response()->json(['data' => []]);
        }

        return response()->json([
            'data' => $this->collectionService->search($this->organizationId($request), $search),
        ]);
    }

    public function summary(Request $request, Customer $customer): JsonResponse
    {
        $this->authorizeOrganization($request, $customer);

        return response()->json($this->collectionService->summary($customer));
    }

    private function organizationId(Request $request): int
    {
        return (int) $request->attributes->get('active_organization')->id;
    }

    private function authorizeOrganization(Request $request, Customer $customer): void
    {
        abort_unless($customer->organization_id === $this->organizationId($request), 404);
    }
}
