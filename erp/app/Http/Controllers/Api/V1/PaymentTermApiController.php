<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Finance\Models\PaymentSchedule;
use App\Modules\Finance\Models\PaymentScheduleItem;
use App\Modules\Finance\Models\PaymentTerm;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentTermApiController extends ApiController
{
    // ── Payment Terms ─────────────────────────────────────────────────────────

    public function indexTerms(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        $terms    = PaymentTerm::where('tenant_id', $tenantId)
            ->when($request->boolean('active_only'), fn ($q) => $q->where('is_active', true))
            ->orderBy('days')
            ->get();

        return $this->success($terms->map(fn ($t) => [
            'id'              => $t->id,
            'name'            => $t->name,
            'days'            => $t->days,
            'discount_days'   => $t->discount_days,
            'discount_percent' => $t->discount_percent,
            'has_early_discount' => $t->has_early_discount,
            'display_label'   => $t->display_label,
            'description'     => $t->description,
            'is_active'       => $t->is_active,
        ]));
    }

    public function storeTerm(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'name'             => ['required', 'string', 'max:100'],
            'days'             => ['required', 'integer', 'min:0'],
            'discount_days'    => ['nullable', 'integer', 'min:0'],
            'discount_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'description'      => ['nullable', 'string'],
        ]);

        $term = PaymentTerm::create([...$data, 'tenant_id' => $tenantId, 'is_active' => true]);

        return $this->success($term, 201);
    }

    public function updateTerm(Request $request, PaymentTerm $paymentTerm): JsonResponse
    {
        $data = $request->validate([
            'name'             => ['sometimes', 'string', 'max:100'],
            'days'             => ['sometimes', 'integer', 'min:0'],
            'discount_days'    => ['nullable', 'integer', 'min:0'],
            'discount_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'description'      => ['nullable', 'string'],
            'is_active'        => ['boolean'],
        ]);

        $paymentTerm->update($data);

        return $this->success($paymentTerm->fresh());
    }

    public function destroyTerm(PaymentTerm $paymentTerm): JsonResponse
    {
        $paymentTerm->delete();
        return $this->success(['message' => 'Payment term deleted.']);
    }

    // ── Payment Schedules ─────────────────────────────────────────────────────

    public function indexSchedules(Request $request): JsonResponse
    {
        $tenantId  = $this->tenantId($request);
        $schedules = PaymentSchedule::where('tenant_id', $tenantId)
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->with('items')
            ->orderByDesc('created_at')
            ->paginate(20);

        return $this->paginated($schedules);
    }

    public function storeSchedule(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'name'           => ['required', 'string', 'max:255'],
            'total_amount'   => ['required', 'numeric', 'min:0.01'],
            'currency'       => ['nullable', 'string', 'max:3'],
            'frequency'      => ['required', 'string', 'in:weekly,monthly,quarterly,yearly,custom'],
            'installments'   => ['required', 'integer', 'min:1', 'max:120'],
            'start_date'     => ['required', 'date'],
            'reference_type' => ['nullable', 'string', 'max:50'],
            'reference_id'   => ['nullable', 'integer'],
            'notes'          => ['nullable', 'string'],
        ]);

        $schedule = PaymentSchedule::create([
            ...$data,
            'tenant_id'  => $tenantId,
            'created_by' => $request->user()->id,
            'status'     => 'active',
        ]);

        $schedule->schedule_number = $schedule->generateScheduleNumber();
        $schedule->save();

        $this->generateInstallments($schedule);

        return $this->success($schedule->load('items'), 201);
    }

    public function showSchedule(PaymentSchedule $paymentSchedule): JsonResponse
    {
        return $this->success($paymentSchedule->load('items'));
    }

    public function markInstallmentPaid(Request $request, PaymentSchedule $paymentSchedule, int $itemId): JsonResponse
    {
        $item = PaymentScheduleItem::where('payment_schedule_id', $paymentSchedule->id)
            ->findOrFail($itemId);

        $data = $request->validate([
            'paid_date' => ['nullable', 'date'],
        ]);

        $item->markPaid($data['paid_date'] ?? null);
        $paymentSchedule->recalculatePaidAmount();

        return $this->success([
            'item'     => $item->fresh(),
            'schedule' => $paymentSchedule->fresh(),
        ]);
    }

    public function pauseSchedule(PaymentSchedule $paymentSchedule): JsonResponse
    {
        $paymentSchedule->pause();
        return $this->success($paymentSchedule->fresh());
    }

    public function cancelSchedule(PaymentSchedule $paymentSchedule): JsonResponse
    {
        $paymentSchedule->cancel();
        return $this->success($paymentSchedule->fresh());
    }

    private function generateInstallments(PaymentSchedule $schedule): void
    {
        $installmentAmount = round((float) $schedule->total_amount / $schedule->installments, 2);
        $startDate         = now()->parse($schedule->start_date);

        for ($i = 1; $i <= $schedule->installments; $i++) {
            $dueDate = match ($schedule->frequency) {
                'weekly'    => $startDate->copy()->addWeeks($i - 1),
                'quarterly' => $startDate->copy()->addMonths(($i - 1) * 3),
                'yearly'    => $startDate->copy()->addYears($i - 1),
                default     => $startDate->copy()->addMonths($i - 1),  // monthly / custom
            };

            PaymentScheduleItem::create([
                'payment_schedule_id' => $schedule->id,
                'installment_number'  => $i,
                'amount'              => $i === $schedule->installments
                    ? (float) $schedule->total_amount - ($installmentAmount * ($schedule->installments - 1))
                    : $installmentAmount,
                'due_date'            => $dueDate->toDateString(),
                'status'              => 'pending',
            ]);
        }
    }

    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }
}
