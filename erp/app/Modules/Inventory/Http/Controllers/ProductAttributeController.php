<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Modules\Inventory\Models\ProductAttribute;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductAttributeController
{
    public function index()
    {
        $this->authorize('viewAny', ProductAttribute::class);
        $attributes = ProductAttribute::paginate(20);
        return Inertia::render('Inventory/ProductAttributes/Index', ['attributes' => $attributes]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', ProductAttribute::class);
        $data = $request->validate([
            'name'    => 'required|string|max:100',
            'type'    => 'required|in:text,select,color,number',
            'options' => 'nullable|array',
            'options.*' => 'string',
        ]);
        $data['tenant_id'] = app('tenant')->id;
        ProductAttribute::create($data);
        return back()->with('success', 'Attribute created.');
    }

    public function update(Request $request, ProductAttribute $productAttribute)
    {
        $this->authorize('update', $productAttribute);
        $data = $request->validate([
            'name'    => 'required|string|max:100',
            'type'    => 'required|in:text,select,color,number',
            'options' => 'nullable|array',
            'options.*' => 'string',
        ]);
        $productAttribute->update($data);
        return back()->with('success', 'Attribute updated.');
    }

    public function destroy(ProductAttribute $productAttribute)
    {
        $this->authorize('delete', $productAttribute);
        $productAttribute->delete();
        return back()->with('success', 'Attribute deleted.');
    }

    private function authorize(string $ability, $model): void
    {
        if (auth()->user()->cannot($ability, $model)) {
            abort(403);
        }
    }
}
