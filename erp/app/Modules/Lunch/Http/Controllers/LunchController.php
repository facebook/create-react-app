<?php

namespace App\Modules\Lunch\Http\Controllers;

use App\Modules\Lunch\Models\LunchOrder;
use App\Modules\Lunch\Models\LunchProduct;
use App\Modules\Lunch\Models\LunchSupplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Inertia\Inertia;
use Inertia\Response;

class LunchController extends Controller
{
    public function dashboard(): Response
    {
        $today = today()->toDateString();

        $stats = [
            'today_orders'      => LunchOrder::whereDate('order_date', $today)->count(),
            'pending_count'     => LunchOrder::whereDate('order_date', $today)->where('status', 'pending')->count(),
            'confirmed_count'   => LunchOrder::whereDate('order_date', $today)->where('status', 'confirmed')->count(),
            'delivered_count'   => LunchOrder::whereDate('order_date', $today)->where('status', 'delivered')->count(),
            'total_spend_today' => (float) LunchOrder::whereDate('order_date', $today)->sum('total_price'),
        ];

        return Inertia::render('Lunch/Dashboard', compact('stats'));
    }

    public function suppliers(): Response
    {
        $suppliers = LunchSupplier::withCount('products')->paginate(20);

        return Inertia::render('Lunch/Suppliers/Index', ['suppliers' => $suppliers]);
    }

    public function storeSupplier(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'address'     => 'nullable|string',
            'phone'       => 'nullable|string|max:50',
            'email'       => 'nullable|email|max:255',
            'description' => 'nullable|string',
            'is_active'   => 'nullable|boolean',
        ]);

        LunchSupplier::create(array_merge($data, [
            'tenant_id' => app('tenant')->id,
        ]));

        return redirect()->back()->with('success', 'Supplier created successfully.');
    }

    public function products(): Response
    {
        $products = LunchProduct::with('supplier')->paginate(20);

        return Inertia::render('Lunch/Products/Index', ['products' => $products]);
    }

    public function storeProduct(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'lunch_supplier_id' => 'required|exists:lunch_suppliers,id',
            'name'              => 'required|string|max:255',
            'description'       => 'nullable|string',
            'price'             => 'required|numeric|min:0',
            'category'          => 'nullable|string|max:255',
            'is_available'      => 'nullable|boolean',
            'image_url'         => 'nullable|string|max:255',
        ]);

        LunchProduct::create(array_merge($data, [
            'tenant_id' => app('tenant')->id,
        ]));

        return redirect()->back()->with('success', 'Product created successfully.');
    }

    public function orders(Request $request): Response
    {
        $date = $request->input('date', today()->toDateString());

        $orders = LunchOrder::with('product.supplier')
            ->whereDate('order_date', $date)
            ->paginate(20);

        return Inertia::render('Lunch/Orders/Index', [
            'orders' => $orders,
            'date'   => $date,
        ]);
    }

    public function placeOrder(Request $request): JsonResponse
    {
        $data = $request->validate([
            'lunch_product_id' => 'required|exists:lunch_products,id',
            'quantity'         => 'required|integer|min:1|max:10',
            'order_date'       => 'required|date',
            'notes'            => 'nullable|string',
        ]);

        $product = LunchProduct::findOrFail($data['lunch_product_id']);

        LunchOrder::create([
            'tenant_id'        => app('tenant')->id,
            'employee_id'      => auth()->id(),
            'lunch_product_id' => $data['lunch_product_id'],
            'quantity'         => $data['quantity'],
            'order_date'       => $data['order_date'],
            'notes'            => $data['notes'] ?? null,
            'total_price'      => $product->price * $data['quantity'],
            'status'           => 'pending',
        ]);

        return response()->json(['success' => true]);
    }

    public function updateStatus(Request $request, LunchOrder $order): JsonResponse
    {
        $data = $request->validate([
            'status' => 'required|in:confirmed,delivered,cancelled',
        ]);

        $order->update(['status' => $data['status']]);

        return response()->json(['success' => true]);
    }
}
