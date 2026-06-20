<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\ProductTag;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ProductTagAssignmentController extends Controller
{
    public function attach(Request $request, Product $product): RedirectResponse
    {
        $this->authorize('update', $product);

        $validated = $request->validate([
            'tag_id' => 'required|exists:product_tags,id',
        ]);

        $product->tags()->syncWithoutDetaching([$validated['tag_id']]);

        return back()->with('success', 'Tag attached to product.');
    }

    public function detach(Request $request, Product $product, ProductTag $productTag): RedirectResponse
    {
        $this->authorize('update', $product);

        $product->tags()->detach($productTag->id);

        return back()->with('success', 'Tag removed from product.');
    }
}
