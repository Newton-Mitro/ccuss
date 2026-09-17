<?php

namespace App\FinancialServices\Controllers;

use App\FinancialServices\Models\FinancialProduct;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FinancialProductPolicyController extends Controller
{
    public function index(Request $request): Response
    {
        $products = FinancialProduct::query()
            ->where('organization_id', $this->organizationId($request))
            ->with('policy')
            ->orderBy('category')
            ->orderBy('name')
            ->get();

        return Inertia::render('financial-services/product-policies/index', [
            'products' => $products,
        ]);
    }

    private function organizationId(Request $request): int
    {
        return (int) $request->attributes->get('active_organization')->id;
    }
}