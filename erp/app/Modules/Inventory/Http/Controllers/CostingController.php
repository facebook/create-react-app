<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\CostingLayer;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\ProductCostSnapshot;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CostingController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', CostingLayer::class);

        $products = Product::withCount(['costingLayers' => fn ($q) => $q->where('quantity_remaining', '>', 0)])
            ->orderBy('name')
            ->paginate(20);

        $filters = $request->only(['product_id']);

        return Inertia::render('Inventory/Costing/Index', compact('products', 'filters'));
    }

    public function layers(Request $request, Product $product): Response
    {
        $this->authorize('view', CostingLayer::class);

        $layers = CostingLayer::forProduct($product->id)
            ->withRemaining()
            ->fifo()
            ->paginate(20);

        return Inertia::render('Inventory/Costing/Layers', compact('product', 'layers'));
    }

    public function addLayer(Request $request): RedirectResponse
    {
        $this->authorize('create', CostingLayer::class);

        $data = $request->validate([
            'product_id'     => 'required|exists:products,id',
            'costing_method' => 'required|in:fifo,avco',
            'quantity'       => 'required|numeric|min:0.0001',
            'unit_cost'      => 'required|numeric|min:0',
            'received_at'    => 'nullable|date',
            'reference_type' => 'nullable|string|max:50',
        ]);

        CostingLayer::create([
            'tenant_id'          => auth()->user()->tenant_id,
            'product_id'         => $data['product_id'],
            'costing_method'     => $data['costing_method'],
            'quantity_received'  => $data['quantity'],
            'quantity_remaining' => $data['quantity'],
            'unit_cost'          => $data['unit_cost'],
            'received_at'        => $data['received_at'] ?? now(),
            'reference_type'     => $data['reference_type'] ?? null,
        ]);

        return back()->with('success', 'Costing layer added.');
    }

    public function snapshot(Request $request): RedirectResponse
    {
        $this->authorize('create', CostingLayer::class);

        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        ProductCostSnapshot::takeSnapshot(auth()->user()->tenant_id, $data['product_id']);

        return back()->with('success', 'Snapshot taken.');
    }

    public function report(Request $request): Response
    {
        $this->authorize('viewAny', CostingLayer::class);

        /** @var \App\Models\User $user */
        $user = auth()->user();

        $products = Product::withCount(['costingLayers' => fn ($q) => $q->where('quantity_remaining', '>', 0)])
            ->orderBy('name')
            ->limit(50)
            ->get();

        $rows = $products->map(fn ($product) => [
            'product'      => $product,
            'average_cost' => CostingLayer::getAverageCost($user->tenant_id, $product->id),
            'layers_count' => $product->costing_layers_count,
        ])->all();

        return Inertia::render('Inventory/Costing/Report', compact('rows'));
    }
}
