<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\PurchaseOrder;
use App\Modules\Inventory\Models\PurchaseOrderItem;
use App\Modules\Inventory\Models\Supplier;
use App\Modules\Inventory\Models\Warehouse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReorderController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Product::class);
        $tenantId = $request->user()->tenant_id;

        $suggestions = Product::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->where('reorder_point', '>', 0)
            ->with(['stockLevels', 'preferredSupplier', 'category'])
            ->get()
            ->filter(fn ($p) => $p->needsReorder())
            ->map(fn ($p) => [
                'id'                    => $p->id,
                'sku'                   => $p->sku,
                'name'                  => $p->name,
                'category'              => $p->category?->name,
                'total_stock'           => round($p->total_stock, 4),
                'reorder_point'         => round((float) $p->reorder_point, 4),
                'reorder_quantity'      => round((float) $p->reorder_quantity, 4),
                'preferred_supplier'    => $p->preferredSupplier?->name,
                'preferred_supplier_id' => $p->preferred_supplier_id,
                'cost_price'            => (float) $p->cost_price,
            ])
            ->values();

        $suppliers  = Supplier::where('tenant_id', $tenantId)->orderBy('name')->get(['id', 'name']);
        $warehouses = Warehouse::where('tenant_id', $tenantId)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Inventory/Reorder/Index', [
            'suggestions' => $suggestions,
            'suppliers'   => $suppliers,
            'warehouses'  => $warehouses,
        ]);
    }

    public function createPurchaseOrder(Request $request)
    {
        $this->authorize('create', Product::class);

        $data = $request->validate([
            'supplier_id'          => 'required|exists:suppliers,id',
            'warehouse_id'         => 'required|exists:warehouses,id',
            'items'                => 'required|array|min:1',
            'items.*.product_id'   => 'required|exists:products,id',
            'items.*.quantity'     => 'required|numeric|min:0.001',
            'items.*.unit_cost'    => 'required|numeric|min:0',
        ]);

        $tenantId = $request->user()->tenant_id;

        $po = PurchaseOrder::create([
            'tenant_id'    => $tenantId,
            'supplier_id'  => $data['supplier_id'],
            'warehouse_id' => $data['warehouse_id'],
            'status'       => 'draft',
            'created_by'   => $request->user()->id,
        ]);

        foreach ($data['items'] as $item) {
            PurchaseOrderItem::create([
                'purchase_order_id' => $po->id,
                'product_id'        => $item['product_id'],
                'quantity'          => $item['quantity'],
                'unit_cost'         => $item['unit_cost'],
                'received_quantity' => 0,
            ]);
        }

        return redirect("/inventory/purchase-orders/{$po->id}")
            ->with('success', 'Purchase order created from reorder suggestions.');
    }
}
