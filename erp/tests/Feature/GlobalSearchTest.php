<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\CRM\Models\CrmLead;
use App\Modules\Ecommerce\Models\StoreOrder;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Helpdesk\Models\HelpdeskTicket;
use App\Modules\HR\Models\Employee;
use App\Modules\Inventory\Models\Product;
use App\Modules\PM\Models\Project;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Search Co', 'slug' => 'search-co-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
});

test('search returns 200 with results key', function () {
    $this->actingAs($this->admin)
        ->getJson('/search?q=test')
        ->assertStatus(200)
        ->assertJsonStructure(['results']);
});

test('short query returns empty results', function () {
    $this->actingAs($this->admin)
        ->getJson('/search?q=a')
        ->assertStatus(200)
        ->assertJson(['results' => []]);
});

test('product search by name returns product result', function () {
    Product::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Widget Alpha',
        'sku'       => 'WGT-001',
    ]);

    $response = $this->actingAs($this->admin)
        ->getJson('/search?q=Widget')
        ->assertStatus(200);

    $results = $response->json('results');
    $types   = collect($results)->pluck('type')->all();

    expect($types)->toContain('Product');

    $product = collect($results)->firstWhere('type', 'Product');
    expect($product['title'])->toBe('Widget Alpha');
    expect($product['subtitle'])->toBe('WGT-001');
    expect($product['url'])->toContain('/inventory/products/');
});

test('invoice search by number returns invoice result', function () {
    $contact = Contact::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Acme Corp',
        'type'      => 'customer',
    ]);

    Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $contact->id,
        'number'     => 'INV-2026-0042',
        'issue_date' => now()->toDateString(),
    ]);

    $response = $this->actingAs($this->admin)
        ->getJson('/search?q=INV-2026-0042')
        ->assertStatus(200);

    $results = $response->json('results');
    $types   = collect($results)->pluck('type')->all();

    expect($types)->toContain('Invoice');

    $invoice = collect($results)->firstWhere('type', 'Invoice');
    expect($invoice['title'])->toBe('INV-2026-0042');
    expect($invoice['url'])->toContain('/finance/invoices/');
});

test('contact search by name returns contact result', function () {
    Contact::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Jane Supplier',
        'email'     => 'jane@supplier.com',
        'type'      => 'supplier',
    ]);

    $response = $this->actingAs($this->admin)
        ->getJson('/search?q=Jane')
        ->assertStatus(200);

    $results = $response->json('results');
    $types   = collect($results)->pluck('type')->all();

    expect($types)->toContain('Contact');

    $contact = collect($results)->firstWhere('type', 'Contact');
    expect($contact['title'])->toBe('Jane Supplier');
    expect($contact['url'])->toContain('/finance/contacts/');
});

test('lead search by title returns lead result', function () {
    CrmLead::create([
        'tenant_id'    => $this->tenant->id,
        'title'        => 'Enterprise Deal Alpha',
        'contact_name' => 'Bob Smith',
        'created_by'   => $this->admin->id,
    ]);

    $response = $this->actingAs($this->admin)
        ->getJson('/search?q=Enterprise')
        ->assertStatus(200);

    $results = $response->json('results');
    $types   = collect($results)->pluck('type')->all();

    expect($types)->toContain('Lead');

    $lead = collect($results)->firstWhere('type', 'Lead');
    expect($lead['title'])->toBe('Enterprise Deal Alpha');
    expect($lead['url'])->toContain('/crm/leads/');
});

test('ticket search by subject returns ticket result', function () {
    HelpdeskTicket::create([
        'tenant_id'     => $this->tenant->id,
        'subject'       => 'Login issue reported',
        'ticket_number' => 'TKT-00099',
        'status'        => 'open',
        'created_by'    => $this->admin->id,
    ]);

    $response = $this->actingAs($this->admin)
        ->getJson('/search?q=Login+issue')
        ->assertStatus(200);

    $results = $response->json('results');
    $types   = collect($results)->pluck('type')->all();

    expect($types)->toContain('Ticket');

    $ticket = collect($results)->firstWhere('type', 'Ticket');
    expect($ticket['title'])->toBe('Login issue reported');
    expect($ticket['url'])->toContain('/helpdesk/tickets/');
});

test('employee search by name returns employee result', function () {
    Employee::create([
        'tenant_id'       => $this->tenant->id,
        'first_name'      => 'Alice',
        'last_name'       => 'Johnson',
        'employee_number' => 'EMP-777',
        'email'           => 'alice.johnson@example.com',
        'start_date'      => now()->toDateString(),
    ]);

    $response = $this->actingAs($this->admin)
        ->getJson('/search?q=Alice')
        ->assertStatus(200);

    $results = $response->json('results');
    $types   = collect($results)->pluck('type')->all();

    expect($types)->toContain('Employee');

    $emp = collect($results)->firstWhere('type', 'Employee');
    expect($emp['title'])->toContain('Alice');
    expect($emp['url'])->toContain('/hr/employees/');
});

test('multi-type search returns results from multiple types', function () {
    Product::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Apex Widget',
        'sku'       => 'APX-001',
    ]);

    Contact::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Apex Consulting',
        'type'      => 'customer',
    ]);

    CrmLead::create([
        'tenant_id'  => $this->tenant->id,
        'title'      => 'Apex Opportunity',
        'created_by' => $this->admin->id,
    ]);

    $response = $this->actingAs($this->admin)
        ->getJson('/search?q=Apex')
        ->assertStatus(200);

    $results = $response->json('results');
    $types   = collect($results)->pluck('type')->unique()->values()->all();

    expect(count($types))->toBeGreaterThanOrEqual(2);
    expect($types)->toContain('Product');
    expect($types)->toContain('Contact');
});

test('unauthenticated search redirects to login', function () {
    $this->get('/search?q=test')
        ->assertRedirect('/login');
});
