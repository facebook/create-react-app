<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\GoodsReceipt;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GoodsReceiptController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', GoodsReceipt::class);

        $receipts = GoodsReceipt::with('items')
            ->orderByDesc('receipt_date')
            ->paginate(20);

        return Inertia::render('Inventory/GoodsReceipts/Index', compact('receipts'));
    }

    public function create(): Response
    {
        $this->authorize('create', GoodsReceipt::class);

        return Inertia::render('Inventory/GoodsReceipts/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', GoodsReceipt::class);

        $data = $request->validate([
            'supplier_name'      => 'required|string|max:255',
            'receipt_date'       => 'required|date',
            'supplier_reference' => 'nullable|string|max:255',
            'notes'              => 'nullable|string',
            'warehouse_id'       => 'nullable|exists:warehouses,id',
        ]);

        $data['tenant_id']  = app('tenant')->id;
        $data['created_by'] = auth()->id();

        GoodsReceipt::create($data);

        return redirect()->route('inventory.goods-receipts.index');
    }

    public function show(GoodsReceipt $goodsReceipt): Response
    {
        $this->authorize('view', $goodsReceipt);

        $goodsReceipt->load('items.product');

        return Inertia::render('Inventory/GoodsReceipts/Show', compact('goodsReceipt'));
    }

    public function edit(GoodsReceipt $goodsReceipt): Response
    {
        $this->authorize('update', $goodsReceipt);

        return Inertia::render('Inventory/GoodsReceipts/Edit', compact('goodsReceipt'));
    }

    public function update(Request $request, GoodsReceipt $goodsReceipt): RedirectResponse
    {
        $this->authorize('update', $goodsReceipt);

        $data = $request->validate([
            'supplier_name'      => 'required|string|max:255',
            'receipt_date'       => 'required|date',
            'supplier_reference' => 'nullable|string|max:255',
            'notes'              => 'nullable|string',
        ]);

        $goodsReceipt->update($data);

        return redirect()->route('inventory.goods-receipts.index');
    }

    public function destroy(GoodsReceipt $goodsReceipt): RedirectResponse
    {
        $this->authorize('delete', $goodsReceipt);

        $goodsReceipt->delete();

        return redirect()->route('inventory.goods-receipts.index');
    }

    public function confirm(GoodsReceipt $goodsReceipt): RedirectResponse
    {
        $this->authorize('confirm', $goodsReceipt);

        $goodsReceipt->confirm(auth()->id());

        return redirect()->route('inventory.goods-receipts.index');
    }

    public function post(GoodsReceipt $goodsReceipt): RedirectResponse
    {
        $this->authorize('post', $goodsReceipt);

        $goodsReceipt->post();

        return redirect()->route('inventory.goods-receipts.index');
    }

    public function reject(GoodsReceipt $goodsReceipt): RedirectResponse
    {
        $this->authorize('reject', $goodsReceipt);

        $goodsReceipt->reject();

        return redirect()->route('inventory.goods-receipts.index');
    }
}
