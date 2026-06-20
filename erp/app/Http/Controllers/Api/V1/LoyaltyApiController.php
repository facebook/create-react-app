<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Finance\Models\LoyaltyEnrollment;
use App\Modules\Finance\Models\LoyaltyProgram;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LoyaltyApiController extends ApiController
{
    // ── Programs ──────────────────────────────────────────────────────────────

    public function indexPrograms(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        $programs = LoyaltyProgram::where('tenant_id', $tenantId)
            ->withCount('enrollments')
            ->get();

        return $this->success($programs);
    }

    public function storeProgram(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'name'                      => ['required', 'string', 'max:100'],
            'description'               => ['nullable', 'string'],
            'points_per_currency_unit'  => ['required', 'numeric', 'min:0.0001'],
            'points_to_currency_rate'   => ['required', 'numeric', 'min:0.000001'],
            'minimum_redemption_points' => ['nullable', 'integer', 'min:1'],
        ]);

        $program = LoyaltyProgram::create([
            ...$data,
            'tenant_id' => $tenantId,
            'is_active' => true,
        ]);

        return $this->success($program, 201);
    }

    public function updateProgram(Request $request, LoyaltyProgram $loyaltyProgram): JsonResponse
    {
        $data = $request->validate([
            'name'                      => ['sometimes', 'string', 'max:100'],
            'points_per_currency_unit'  => ['numeric', 'min:0.0001'],
            'points_to_currency_rate'   => ['numeric', 'min:0.000001'],
            'minimum_redemption_points' => ['integer', 'min:1'],
            'is_active'                 => ['boolean'],
        ]);

        $loyaltyProgram->update($data);

        return $this->success($loyaltyProgram->fresh());
    }

    // ── Enrollments ───────────────────────────────────────────────────────────

    public function enroll(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'loyalty_program_id' => ['required', 'integer', 'exists:loyalty_programs,id'],
            'contact_id'         => ['required', 'integer', 'exists:contacts,id'],
        ]);

        $enrollment = LoyaltyEnrollment::firstOrCreate(
            ['loyalty_program_id' => $data['loyalty_program_id'], 'contact_id' => $data['contact_id']],
            [
                'tenant_id'             => $tenantId,
                'points_balance'        => 0,
                'total_points_earned'   => 0,
                'total_points_redeemed' => 0,
                'enrolled_at'           => now(),
            ]
        );

        return $this->success($enrollment->load('contact:id,name', 'program:id,name'), 201);
    }

    public function balance(Request $request, int $contactId): JsonResponse
    {
        $tenantId    = $this->tenantId($request);
        $enrollments = LoyaltyEnrollment::where('tenant_id', $tenantId)
            ->where('contact_id', $contactId)
            ->with('program:id,name,points_to_currency_rate')
            ->get();

        return $this->success($enrollments->map(fn ($e) => [
            'program_id'            => $e->loyalty_program_id,
            'program_name'          => $e->program?->name,
            'points_balance'        => $e->points_balance,
            'total_points_earned'   => $e->total_points_earned,
            'total_points_redeemed' => $e->total_points_redeemed,
            'redemption_value'      => $e->program
                ? $e->program->calculateRedemptionValue($e->points_balance)
                : null,
        ]));
    }

    // ── Transactions ──────────────────────────────────────────────────────────

    public function earnPoints(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'loyalty_program_id' => ['required', 'integer', 'exists:loyalty_programs,id'],
            'contact_id'         => ['required', 'integer', 'exists:contacts,id'],
            'amount'             => ['required', 'numeric', 'min:0.01'],
            'description'        => ['nullable', 'string'],
            'reference_id'       => ['nullable', 'integer'],
        ]);

        $program    = LoyaltyProgram::where('tenant_id', $tenantId)->findOrFail($data['loyalty_program_id']);
        $enrollment = LoyaltyEnrollment::where('contact_id', $data['contact_id'])
            ->where('loyalty_program_id', $program->id)
            ->firstOrFail();

        $points = $program->calculatePointsEarned((float) $data['amount']);
        $tx     = $enrollment->earnPoints($points, $data['description'] ?? '', $data['reference_id'] ?? null);

        return $this->success([
            'transaction'  => $tx,
            'points_earned' => $points,
            'new_balance'  => $enrollment->fresh()->points_balance,
        ]);
    }

    public function redeemPoints(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'loyalty_program_id' => ['required', 'integer', 'exists:loyalty_programs,id'],
            'contact_id'         => ['required', 'integer', 'exists:contacts,id'],
            'points'             => ['required', 'integer', 'min:1'],
            'description'        => ['nullable', 'string'],
        ]);

        $program    = LoyaltyProgram::where('tenant_id', $tenantId)->findOrFail($data['loyalty_program_id']);
        $enrollment = LoyaltyEnrollment::where('contact_id', $data['contact_id'])
            ->where('loyalty_program_id', $program->id)
            ->firstOrFail();

        if ($enrollment->points_balance < $data['points']) {
            return $this->error('Insufficient points balance.', 422);
        }

        if ($program->minimum_redemption_points && $data['points'] < $program->minimum_redemption_points) {
            return $this->error("Minimum redemption is {$program->minimum_redemption_points} points.", 422);
        }

        $redemptionValue = $program->calculateRedemptionValue($data['points']);
        $enrollment->redeemPoints($data['points'], $data['description'] ?? '');

        return $this->success([
            'points_redeemed'  => $data['points'],
            'redemption_value' => $redemptionValue,
            'new_balance'      => $enrollment->fresh()->points_balance,
        ]);
    }

    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }
}
