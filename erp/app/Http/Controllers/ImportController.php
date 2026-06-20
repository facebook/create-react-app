<?php

namespace App\Http\Controllers;

use App\Modules\Finance\Models\Contact;
use App\Modules\HR\Models\Employee;
use App\Modules\Inventory\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class ImportController extends Controller
{
    /**
     * Render the import page.
     */
    public function index()
    {
        return Inertia::render('Import/Index');
    }

    /**
     * Import products from CSV.
     * Columns: name, sku, sale_price, cost_price, category (optional)
     */
    public function products(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $tenantId = $request->user()->tenant_id;
        $path     = $request->file('file')->getRealPath();
        $handle   = fopen($path, 'r');

        $created = 0;
        $updated = 0;
        $skipped = 0;
        $isFirst = true;

        while (($row = fgetcsv($handle)) !== false) {
            // Skip header
            if ($isFirst) {
                $isFirst = false;
                continue;
            }

            // Skip empty rows
            if (count(array_filter($row)) === 0) {
                continue;
            }

            try {
                $name      = trim($row[0] ?? '');
                $sku       = trim($row[1] ?? '');
                $salePrice = isset($row[2]) && $row[2] !== '' ? (float) $row[2] : 0;
                $costPrice = isset($row[3]) && $row[3] !== '' ? (float) $row[3] : 0;

                if ($name === '') {
                    $skipped++;
                    continue;
                }

                // If SKU provided, match on SKU; otherwise generate one
                if ($sku !== '') {
                    $existing = Product::where('tenant_id', $tenantId)
                        ->where('sku', $sku)
                        ->first();
                } else {
                    $sku      = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $name), 0, 10)) . '-' . time();
                    $existing = null;
                }

                if ($existing) {
                    $existing->update([
                        'name'       => $name,
                        'sale_price' => $salePrice,
                        'cost_price' => $costPrice,
                    ]);
                    $updated++;
                } else {
                    Product::create([
                        'tenant_id'  => $tenantId,
                        'name'       => $name,
                        'sku'        => $sku,
                        'sale_price' => $salePrice,
                        'cost_price' => $costPrice,
                        'is_active'  => true,
                    ]);
                    $created++;
                }
            } catch (\Throwable $e) {
                $skipped++;
            }
        }

        fclose($handle);

        $total = $created + $updated;
        return redirect()->route('import.index')
            ->with('success', "Imported {$total} records ({$created} created, {$updated} updated, {$skipped} skipped)");
    }

    /**
     * Import employees from CSV.
     * Columns: first_name, last_name, email, department, position, hire_date
     */
    public function employees(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $tenantId = $request->user()->tenant_id;
        $path     = $request->file('file')->getRealPath();
        $handle   = fopen($path, 'r');

        $created = 0;
        $updated = 0;
        $skipped = 0;
        $isFirst = true;

        while (($row = fgetcsv($handle)) !== false) {
            if ($isFirst) {
                $isFirst = false;
                continue;
            }

            if (count(array_filter($row)) === 0) {
                continue;
            }

            try {
                $firstName = trim($row[0] ?? '');
                $lastName  = trim($row[1] ?? '');
                $email     = trim($row[2] ?? '');
                $position  = trim($row[3] ?? '');  // department column mapped to position
                $jobTitle  = trim($row[4] ?? '');
                $hireDate  = trim($row[5] ?? '');

                if ($firstName === '' || $lastName === '') {
                    $skipped++;
                    continue;
                }

                // If email provided, try to match
                if ($email !== '') {
                    $existing = Employee::where('tenant_id', $tenantId)
                        ->where('email', $email)
                        ->first();
                } else {
                    $existing = null;
                }

                $data = [
                    'first_name' => $firstName,
                    'last_name'  => $lastName,
                    'position'   => $jobTitle ?: $position,
                    'status'     => 'active',
                ];

                if ($email !== '') {
                    $data['email'] = $email;
                }

                if ($hireDate !== '') {
                    // hire_date is an accessor that maps to start_date
                    $data['start_date'] = $hireDate;
                }

                if ($existing) {
                    $existing->update($data);
                    $updated++;
                } else {
                    if (empty($data['start_date'])) {
                        $data['start_date'] = now()->toDateString();
                    }
                    $data['tenant_id'] = $tenantId;
                    Employee::create($data);
                    $created++;
                }
            } catch (\Throwable $e) {
                $skipped++;
            }
        }

        fclose($handle);

        $total = $created + $updated;
        return redirect()->route('import.index')
            ->with('success', "Imported {$total} records ({$created} created, {$updated} updated, {$skipped} skipped)");
    }

    /**
     * Import contacts from CSV.
     * Columns: name, email, phone, type (customer/supplier/both)
     */
    public function contacts(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $tenantId = $request->user()->tenant_id;
        $path     = $request->file('file')->getRealPath();
        $handle   = fopen($path, 'r');

        $created = 0;
        $updated = 0;
        $skipped = 0;
        $isFirst = true;

        $validTypes = ['customer', 'vendor', 'both'];

        while (($row = fgetcsv($handle)) !== false) {
            if ($isFirst) {
                $isFirst = false;
                continue;
            }

            if (count(array_filter($row)) === 0) {
                continue;
            }

            try {
                $name  = trim($row[0] ?? '');
                $email = trim($row[1] ?? '');
                $phone = trim($row[2] ?? '');
                $type  = strtolower(trim($row[3] ?? 'customer'));

                if ($name === '') {
                    $skipped++;
                    continue;
                }

                // Map "supplier" -> "vendor"
                if ($type === 'supplier') {
                    $type = 'vendor';
                }

                if (!in_array($type, $validTypes)) {
                    $type = 'customer';
                }

                // Match on email if provided
                if ($email !== '') {
                    $existing = Contact::where('tenant_id', $tenantId)
                        ->where('email', $email)
                        ->first();
                } else {
                    $existing = null;
                }

                $data = [
                    'name'  => $name,
                    'type'  => $type,
                    'phone' => $phone ?: null,
                ];

                if ($email !== '') {
                    $data['email'] = $email;
                }

                if ($existing) {
                    $existing->update($data);
                    $updated++;
                } else {
                    $data['tenant_id'] = $tenantId;
                    $data['is_active'] = true;
                    Contact::create($data);
                    $created++;
                }
            } catch (\Throwable $e) {
                $skipped++;
            }
        }

        fclose($handle);

        $total = $created + $updated;
        return redirect()->route('import.index')
            ->with('success', "Imported {$total} records ({$created} created, {$updated} updated, {$skipped} skipped)");
    }
}
