<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\Contact;
use App\Modules\Inventory\Models\Product;
use App\Modules\HR\Models\Employee;
use App\Modules\CRM\Models\CrmLead;
use App\Modules\PM\Models\Project;
use App\Modules\Inventory\Models\PurchaseOrder;

class SearchController extends ApiController
{
    public function search(Request $request): JsonResponse
    {
        $request->validate(['q' => 'required|string|min:2|max:100']);
        $q = $request->q;
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
        $results = [];

        // Invoices
        Invoice::where('tenant_id', $tenantId)
            ->where(function ($query) use ($q) {
                $query->where('number', 'like', "%{$q}%")
                    ->orWhereHas('contact', fn ($q2) => $q2->where('name', 'like', "%{$q}%"));
            })
            ->limit(5)->get()
            ->each(function ($inv) use (&$results) {
                $results[] = [
                    'module'   => 'invoice',
                    'id'       => $inv->id,
                    'title'    => "Invoice #{$inv->number}",
                    'subtitle' => $inv->status,
                    'url'      => "/finance/invoices/{$inv->id}",
                ];
            });

        // Contacts
        Contact::where('tenant_id', $tenantId)
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%");
            })
            ->limit(5)->get()
            ->each(function ($c) use (&$results) {
                $results[] = [
                    'module'   => 'contact',
                    'id'       => $c->id,
                    'title'    => $c->name,
                    'subtitle' => $c->type,
                    'url'      => "/finance/contacts/{$c->id}",
                ];
            });

        // Products
        Product::where('tenant_id', $tenantId)
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                    ->orWhere('sku', 'like', "%{$q}%");
            })
            ->limit(5)->get()
            ->each(function ($p) use (&$results) {
                $results[] = [
                    'module'   => 'product',
                    'id'       => $p->id,
                    'title'    => $p->name,
                    'subtitle' => $p->sku,
                    'url'      => "/inventory/products/{$p->id}",
                ];
            });

        // Employees
        Employee::where('tenant_id', $tenantId)
            ->where(function ($query) use ($q) {
                $query->where('first_name', 'like', "%{$q}%")
                    ->orWhere('last_name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%");
            })
            ->limit(5)->get()
            ->each(function ($e) use (&$results) {
                $results[] = [
                    'module'   => 'employee',
                    'id'       => $e->id,
                    'title'    => "{$e->first_name} {$e->last_name}",
                    'subtitle' => $e->email,
                    'url'      => "/hr/employees/{$e->id}",
                ];
            });

        // CRM Leads
        CrmLead::where('tenant_id', $tenantId)
            ->where(function ($query) use ($q) {
                $query->where('contact_name', 'like', "%{$q}%")
                    ->orWhere('company_name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%")
                    ->orWhere('reference', 'like', "%{$q}%");
            })
            ->limit(5)->get()
            ->each(function ($l) use (&$results) {
                $results[] = [
                    'module'   => 'lead',
                    'id'       => $l->id,
                    'title'    => $l->contact_name ?? $l->company_name ?? $l->reference,
                    'subtitle' => $l->status ?? '',
                    'url'      => "/crm/leads/{$l->id}",
                ];
            });

        // Projects
        Project::where('tenant_id', $tenantId)
            ->where('name', 'like', "%{$q}%")
            ->limit(5)->get()
            ->each(function ($p) use (&$results) {
                $results[] = [
                    'module'   => 'project',
                    'id'       => $p->id,
                    'title'    => $p->name,
                    'subtitle' => $p->status,
                    'url'      => "/pm/projects/{$p->id}",
                ];
            });

        // Purchase Orders
        PurchaseOrder::where('tenant_id', $tenantId)
            ->where('po_number', 'like', "%{$q}%")
            ->limit(5)->get()
            ->each(function ($po) use (&$results) {
                $results[] = [
                    'module'   => 'purchase_order',
                    'id'       => $po->id,
                    'title'    => "PO #{$po->po_number}",
                    'subtitle' => $po->status,
                    'url'      => "/purchase/orders/{$po->id}",
                ];
            });

        return $this->success(['query' => $q, 'results' => $results, 'total' => count($results)]);
    }
}
