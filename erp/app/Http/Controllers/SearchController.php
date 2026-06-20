<?php

namespace App\Http\Controllers;

use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Invoice;
use App\Modules\HR\Models\Employee;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\PurchaseOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    private const LIMIT = 5;

    public function __invoke(Request $request): JsonResponse
    {
        $query = trim($request->get('q', ''));

        if (strlen($query) < 2) {
            return response()->json(['results' => []]);
        }

        $user    = auth()->user();
        $results = [];

        if ($user->can('finance.view')) {
            foreach (Invoice::where('number', 'like', "%{$query}%")->with('contact')->limit(self::LIMIT)->get() as $inv) {
                $results[] = ['type' => 'Invoice', 'label' => $inv->number ?? "Invoice #{$inv->id}", 'sub' => $inv->contact?->name ?? '', 'href' => "/finance/invoices/{$inv->id}"];
            }

            foreach (Contact::search($query)->limit(self::LIMIT)->get() as $c) {
                $results[] = ['type' => 'Contact', 'label' => $c->name, 'sub' => $c->email ?? '', 'href' => "/finance/contacts"];
            }
        }

        if ($user->can('inventory.view')) {
            foreach (Product::search($query)->limit(self::LIMIT)->get() as $p) {
                $results[] = ['type' => 'Product', 'label' => $p->name, 'sub' => $p->sku ?? '', 'href' => "/inventory/products/{$p->id}"];
            }

            foreach (PurchaseOrder::with('supplier')->where('id', 'like', "%{$query}%")->orWhereHas('supplier', fn ($q) => $q->where('name', 'like', "%{$query}%"))->limit(self::LIMIT)->get() as $po) {
                $results[] = ['type' => 'Purchase Order', 'label' => "PO #{$po->id}", 'sub' => $po->supplier?->name ?? '', 'href' => "/inventory/purchase-orders/{$po->id}"];
            }
        }

        if ($user->can('hr.view')) {
            foreach (Employee::search($query)->limit(self::LIMIT)->get() as $emp) {
                $results[] = ['type' => 'Employee', 'label' => $emp->full_name, 'sub' => $emp->position ?? '', 'href' => "/hr/employees/{$emp->id}"];
            }
        }

        return response()->json(['results' => $results]);
    }
}
