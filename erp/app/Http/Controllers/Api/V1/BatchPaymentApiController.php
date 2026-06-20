<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Finance\Models\BatchPayment;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BatchPaymentApiController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        $batches  = BatchPayment::where('tenant_id', $tenantId)
            ->withCount('payments')
            ->when($request->input('type'), fn ($q, $t) => $q->where('type', $t))
            ->orderByDesc('payment_date')
            ->get();

        return $this->success($batches);
    }

    public function store(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'payment_date'   => ['required', 'date'],
            'payment_method' => ['required', 'in:bank_transfer,cheque,cash,card,other'],
            'type'           => ['required', 'in:received,made'],
            'notes'          => ['nullable', 'string'],
            'payments'       => ['required', 'array', 'min:1'],
            'payments.*.invoice_id' => ['required', 'integer', 'exists:invoices,id'],
            'payments.*.amount'     => ['required', 'numeric', 'min:0.01'],
            'payments.*.reference'  => ['nullable', 'string', 'max:100'],
        ]);

        $totalAmount = collect($data['payments'])->sum('amount');
        $ref         = 'BATCH-' . strtoupper(uniqid());

        $batch = DB::transaction(function () use ($tenantId, $data, $totalAmount, $ref) {
            $batch = BatchPayment::create([
                'tenant_id'      => $tenantId,
                'reference'      => $ref,
                'payment_date'   => $data['payment_date'],
                'payment_method' => $data['payment_method'],
                'type'           => $data['type'],
                'total_amount'   => $totalAmount,
                'notes'          => $data['notes'] ?? null,
            ]);

            foreach ($data['payments'] as $paymentData) {
                Payment::create([
                    'tenant_id'       => $tenantId,
                    'invoice_id'      => $paymentData['invoice_id'],
                    'batch_payment_id' => $batch->id,
                    'amount'          => $paymentData['amount'],
                    'payment_date'    => $data['payment_date'],
                    'method'          => $data['payment_method'],
                    'reference'       => $paymentData['reference'] ?? $ref,
                    'notes'           => $data['notes'] ?? null,
                ]);
            }

            return $batch;
        });

        return $this->success($batch->load('payments.invoice:id,number,contact_id'), 201);
    }

    public function show(BatchPayment $batchPayment): JsonResponse
    {
        $batchPayment->load('payments.invoice:id,number,contact_id');

        return $this->success($batchPayment);
    }

    public function destroy(BatchPayment $batchPayment): JsonResponse
    {
        DB::transaction(function () use ($batchPayment) {
            $batchPayment->payments()->delete();
            $batchPayment->delete();
        });

        return $this->success(['message' => 'Batch payment deleted.']);
    }

    public function summary(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $stats = BatchPayment::where('tenant_id', $tenantId)
            ->selectRaw('type, COUNT(*) as batch_count, SUM(total_amount) as total')
            ->groupBy('type')
            ->get()
            ->keyBy('type');

        return $this->success([
            'total_received'       => (float) ($stats['received']->total ?? 0),
            'total_made'           => (float) ($stats['made']->total ?? 0),
            'batch_count_received' => (int) ($stats['received']->batch_count ?? 0),
            'batch_count_made'     => (int) ($stats['made']->batch_count ?? 0),
        ]);
    }

    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }
}
