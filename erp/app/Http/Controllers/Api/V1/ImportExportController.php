<?php

namespace App\Http\Controllers\Api\V1;

use App\Exports\ContactsExport;
use App\Exports\InvoicesExport;
use App\Exports\ProductsExport;
use App\Imports\ContactsImport;
use App\Imports\ProductsImport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ImportExportController
{
    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }

    public function exportProducts(Request $request)
    {
        return Excel::download(new ProductsExport($this->tenantId($request)), 'products.xlsx');
    }

    public function exportContacts(Request $request)
    {
        return Excel::download(new ContactsExport($this->tenantId($request)), 'contacts.xlsx');
    }

    public function exportInvoices(Request $request)
    {
        return Excel::download(new InvoicesExport($this->tenantId($request)), 'invoices.xlsx');
    }

    public function importProducts(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,xlsx',
        ]);

        Excel::import(new ProductsImport($this->tenantId($request)), $request->file('file'));

        return response()->json(['success' => true, 'message' => 'Products imported successfully.']);
    }

    public function importContacts(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,xlsx',
        ]);

        Excel::import(new ContactsImport($this->tenantId($request)), $request->file('file'));

        return response()->json(['success' => true, 'message' => 'Contacts imported successfully.']);
    }
}
