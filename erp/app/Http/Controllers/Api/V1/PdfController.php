<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Finance\Models\Invoice;
use App\Modules\HR\Models\PayrollRun;
use App\Modules\Purchase\Models\Po;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PdfController extends ApiController
{
    /**
     * GET /api/v1/pdf/invoices/{id}
     * Generate and download an invoice PDF.
     */
    public function invoice(Request $request, int $id): mixed
    {
        $invoice = Invoice::with(['items', 'contact'])->findOrFail($id);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        if ((int) $invoice->tenant_id !== (int) $tenantId) {
            abort(403, 'Access denied.');
        }

        $items = $invoice->items;

        $pdf = Pdf::loadView('pdfs.invoice', compact('invoice', 'items'));

        return $pdf->download("invoice-{$invoice->number}.pdf");
    }

    /**
     * GET /api/v1/pdf/purchase-orders/{id}
     * Generate and download a purchase order PDF.
     */
    public function purchaseOrder(Request $request, int $id): mixed
    {
        $po = Po::with(['lines', 'vendor'])->findOrFail($id);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        if ((int) $po->tenant_id !== (int) $tenantId) {
            abort(403, 'Access denied.');
        }

        $pdf = Pdf::loadView('pdfs.purchase-order', compact('po'));

        return $pdf->download("po-{$po->po_number}.pdf");
    }

    /**
     * GET /api/v1/pdf/payslips/{id}
     * Generate and download a payslip PDF.
     */
    public function payslip(Request $request, int $id): mixed
    {
        $payrollRun = PayrollRun::findOrFail($id);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        if ((int) $payrollRun->tenant_id !== (int) $tenantId) {
            abort(403, 'Access denied.');
        }

        $pdf = Pdf::loadView('pdfs.payslip', compact('payrollRun'));

        return $pdf->download("payslip-{$payrollRun->id}.pdf");
    }
}
