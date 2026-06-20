<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\BatchPayment;
use App\Modules\Finance\Models\Bill;
use App\Modules\Finance\Models\BillPayment;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\Payment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BatchPaymentController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', BatchPayment::class);

        $batches = BatchPayment::withCount('payments')
            ->orderByDesc('payment_date')
            ->paginate(25);

        return Inertia::render('Finance/BatchPayments/Index', compact('batches'));
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', BatchPayment::class);

        $type = $request->get('type', 'received');

        if ($type === 'received') {
            $openItems = Invoice::with('contact')
                ->whereIn('status', ['sent', 'partial'])
                ->orderBy('due_date')
                ->get(['id', 'number', 'contact_id', 'due_date', 'currency_code', 'status']);
        } else {
            $openItems = Bill::with('contact')
                ->whereIn('status', ['received', 'partial'])
                ->orderBy('due_date')
                ->get(['id', 'number', 'contact_id', 'due_date', 'currency_code', 'status']);
        }

        // Load items and payments for computed totals
        $openItems->load(['items', 'payments']);

        return Inertia::render('Finance/BatchPayments/Create', compact('openItems', 'type'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', BatchPayment::class);

        $data = $request->validate([
            'reference'         => 'required|string|max:100|unique:batch_payments,reference',
            'payment_date'      => 'required|date',
            'payment_method'    => 'required|in:bank_transfer,cheque,cash,card,other',
            'type'              => 'required|in:received,made',
            'notes'             => 'nullable|string',
            'payments'          => 'required|array|min:1',
            'payments.*.id'     => 'required|integer',
            'payments.*.amount' => 'required|numeric|min:0.01',
        ]);

        DB::transaction(function () use ($data) {
            $totalAmount = collect($data['payments'])->sum('amount');

            $batch = BatchPayment::create([
                'tenant_id'      => auth()->user()->tenant_id,
                'reference'      => $data['reference'],
                'payment_date'   => $data['payment_date'],
                'payment_method' => $data['payment_method'],
                'type'           => $data['type'],
                'total_amount'   => $totalAmount,
                'notes'          => $data['notes'] ?? null,
            ]);

            foreach ($data['payments'] as $p) {
                if ($data['type'] === 'received') {
                    $invoice = Invoice::with(['items', 'payments'])->findOrFail($p['id']);
                    $outstanding = $invoice->total - $invoice->amount_paid;
                    $amount = min((float) $p['amount'], $outstanding);

                    if ($amount <= 0) {
                        continue;
                    }

                    Payment::create([
                        'tenant_id'        => auth()->user()->tenant_id,
                        'invoice_id'       => $invoice->id,
                        'amount'           => $amount,
                        'payment_date'     => $data['payment_date'],
                        'method'           => $data['payment_method'],
                        'reference'        => $data['reference'],
                        'batch_payment_id' => $batch->id,
                    ]);

                    // Reload to get updated amount_paid
                    $invoice->load(['items', 'payments']);
                    if ($invoice->amount_due <= 0 && $invoice->canTransitionTo('paid')) {
                        $invoice->transitionTo('paid');
                    } elseif ($invoice->amount_paid > 0 && $invoice->canTransitionTo('partial')) {
                        $invoice->transitionTo('partial');
                    }
                } else {
                    $bill = Bill::with(['items', 'payments'])->findOrFail($p['id']);
                    $outstanding = $bill->total - $bill->amount_paid;
                    $amount = min((float) $p['amount'], $outstanding);

                    if ($amount <= 0) {
                        continue;
                    }

                    BillPayment::create([
                        'tenant_id'    => auth()->user()->tenant_id,
                        'bill_id'      => $bill->id,
                        'amount'       => $amount,
                        'payment_date' => $data['payment_date'],
                        'method'       => $data['payment_method'],
                        'reference'    => $data['reference'],
                    ]);

                    // Reload to get updated amount_paid
                    $bill->load(['items', 'payments']);
                    if ($bill->amount_due <= 0 && $bill->canTransitionTo('paid')) {
                        $bill->transitionTo('paid');
                    } elseif ($bill->amount_paid > 0 && $bill->canTransitionTo('partial')) {
                        $bill->transitionTo('partial');
                    }
                }
            }
        });

        return redirect()->route('finance.batch-payments.index')
            ->with('success', 'Batch payment recorded.');
    }

    public function show(BatchPayment $batchPayment): Response
    {
        $this->authorize('view', $batchPayment);

        $batchPayment->load('payments.invoice');

        return Inertia::render('Finance/BatchPayments/Show', compact('batchPayment'));
    }

    public function destroy(BatchPayment $batchPayment): RedirectResponse
    {
        $this->authorize('delete', $batchPayment);

        $batchPayment->delete();

        return redirect()->route('finance.batch-payments.index')
            ->with('success', 'Batch payment deleted.');
    }
}
