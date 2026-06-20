<?php

namespace App\Http\Controllers;

use App\Modules\CRM\Models\CrmLead;
use App\Modules\Ecommerce\Models\StoreOrder;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Helpdesk\Models\HelpdeskTicket;
use App\Modules\HR\Models\Employee;
use App\Modules\Inventory\Models\Product;
use App\Modules\PM\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GlobalSearchController extends Controller
{
    private const LIMIT = 5;

    public function __invoke(Request $request): JsonResponse
    {
        $q = trim($request->get('q', ''));

        if (strlen($q) < 2) {
            return response()->json(['results' => []]);
        }

        $tenantId = auth()->user()->tenant_id;
        $like     = "%{$q}%";
        $results  = [];

        // Products (name, sku)
        $products = Product::where('tenant_id', $tenantId)
            ->where(function ($query) use ($like) {
                $query->where('name', 'like', $like)
                      ->orWhere('sku', 'like', $like);
            })
            ->limit(self::LIMIT)
            ->get();

        foreach ($products as $r) {
            $results[] = [
                'id'       => $r->id,
                'title'    => $r->name,
                'subtitle' => $r->sku ?? '',
                'url'      => "/inventory/products/{$r->id}",
                'type'     => 'Product',
            ];
        }

        // Invoices (number, customer name via contact)
        $invoices = Invoice::where('tenant_id', $tenantId)
            ->where(function ($query) use ($like) {
                $query->where('number', 'like', $like)
                      ->orWhereHas('contact', fn ($q) => $q->where('name', 'like', $like));
            })
            ->with('contact')
            ->limit(self::LIMIT)
            ->get();

        foreach ($invoices as $r) {
            $results[] = [
                'id'       => $r->id,
                'title'    => $r->number ?? "Invoice #{$r->id}",
                'subtitle' => $r->contact?->name ?? '',
                'url'      => "/finance/invoices/{$r->id}",
                'type'     => 'Invoice',
            ];
        }

        // Contacts (name, email, phone)
        $contacts = Contact::where('tenant_id', $tenantId)
            ->where(function ($query) use ($like) {
                $query->where('name', 'like', $like)
                      ->orWhere('email', 'like', $like)
                      ->orWhere('phone', 'like', $like);
            })
            ->limit(self::LIMIT)
            ->get();

        foreach ($contacts as $r) {
            $results[] = [
                'id'       => $r->id,
                'title'    => $r->name,
                'subtitle' => $r->email ?? '',
                'url'      => "/finance/contacts/{$r->id}",
                'type'     => 'Contact',
            ];
        }

        // CRM Leads (title, contact_name, company_name)
        $leads = CrmLead::where('tenant_id', $tenantId)
            ->where(function ($query) use ($like) {
                $query->where('title', 'like', $like)
                      ->orWhere('contact_name', 'like', $like)
                      ->orWhere('company_name', 'like', $like);
            })
            ->limit(self::LIMIT)
            ->get();

        foreach ($leads as $r) {
            $results[] = [
                'id'       => $r->id,
                'title'    => $r->title,
                'subtitle' => $r->company_name ?? $r->contact_name ?? '',
                'url'      => "/crm/leads/{$r->id}",
                'type'     => 'Lead',
            ];
        }

        // Helpdesk Tickets (ticket_number, subject, customer_name)
        $tickets = HelpdeskTicket::where('tenant_id', $tenantId)
            ->where(function ($query) use ($like) {
                $query->where('ticket_number', 'like', $like)
                      ->orWhere('subject', 'like', $like)
                      ->orWhere('customer_name', 'like', $like);
            })
            ->limit(self::LIMIT)
            ->get();

        foreach ($tickets as $r) {
            $results[] = [
                'id'       => $r->id,
                'title'    => $r->subject,
                'subtitle' => $r->ticket_number ?? '',
                'url'      => "/helpdesk/tickets/{$r->id}",
                'type'     => 'Ticket',
            ];
        }

        // Employees (first_name/last_name combined, employee_number, email)
        $employees = Employee::where('tenant_id', $tenantId)
            ->where(function ($query) use ($like) {
                $query->where('first_name', 'like', $like)
                      ->orWhere('last_name', 'like', $like)
                      ->orWhere('email', 'like', $like)
                      ->orWhere('employee_number', 'like', $like);
            })
            ->limit(self::LIMIT)
            ->get();

        foreach ($employees as $r) {
            $results[] = [
                'id'       => $r->id,
                'title'    => $r->full_name,
                'subtitle' => $r->employee_number ?? '',
                'url'      => "/hr/employees/{$r->id}",
                'type'     => 'Employee',
            ];
        }

        // PM Projects (name)
        $projects = Project::where('tenant_id', $tenantId)
            ->where('name', 'like', $like)
            ->limit(self::LIMIT)
            ->get();

        foreach ($projects as $r) {
            $results[] = [
                'id'       => $r->id,
                'title'    => $r->name,
                'subtitle' => $r->code ?? '',
                'url'      => "/pm/projects/{$r->id}",
                'type'     => 'Project',
            ];
        }

        // Store Orders (order_number, customer_name)
        $orders = StoreOrder::where('tenant_id', $tenantId)
            ->where(function ($query) use ($like) {
                $query->where('order_number', 'like', $like)
                      ->orWhere('customer_name', 'like', $like);
            })
            ->limit(self::LIMIT)
            ->get();

        foreach ($orders as $r) {
            $results[] = [
                'id'       => $r->id,
                'title'    => $r->order_number ?? "Order #{$r->id}",
                'subtitle' => $r->customer_name ?? '',
                'url'      => "/ecommerce/orders/{$r->id}",
                'type'     => 'Order',
            ];
        }

        return response()->json(['results' => $results]);
    }
}
