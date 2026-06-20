<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\VendorEvaluation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VendorPerformanceController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $vendors = Contact::where('tenant_id', $tenantId)
            ->vendors()
            ->with(['vendorEvaluations' => fn ($q) => $q->latest('evaluation_date')->limit(10)])
            ->get()
            ->map(fn ($v) => $this->buildScore($v))
            ->sortByDesc('avg_overall')
            ->values();

        return $this->success($vendors);
    }

    public function show(Request $request, Contact $contact): JsonResponse
    {
        $contact->load('vendorEvaluations.evaluator:id,name');
        return $this->success($this->buildScore($contact, detailed: true));
    }

    public function evaluate(Request $request, Contact $contact): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'evaluation_date'      => ['required', 'date'],
            'quality_rating'       => ['required', 'integer', 'min:1', 'max:5'],
            'delivery_rating'      => ['required', 'integer', 'min:1', 'max:5'],
            'price_rating'         => ['required', 'integer', 'min:1', 'max:5'],
            'communication_rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comments'             => ['nullable', 'string', 'max:1000'],
        ]);

        $overall = round(
            ($data['quality_rating'] + $data['delivery_rating'] + $data['price_rating'] + $data['communication_rating']) / 4,
            2
        );

        $evaluation = VendorEvaluation::create([
            ...$data,
            'tenant_id'    => $tenantId,
            'contact_id'   => $contact->id,
            'evaluated_by' => $request->user()->id,
            'overall_rating' => $overall,
        ]);

        return $this->success($evaluation, 201);
    }

    public function scorecard(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        $from     = $request->get('from', now()->subYear()->toDateString());
        $to       = $request->get('to', now()->toDateString());

        $evaluations = VendorEvaluation::where('tenant_id', $tenantId)
            ->whereDate('evaluation_date', '>=', $from)
            ->whereDate('evaluation_date', '<=', $to)
            ->with('contact:id,name')
            ->get();

        $byVendor = $evaluations->groupBy('contact_id')->map(fn ($group) => [
            'vendor_id'          => $group->first()->contact_id,
            'vendor_name'        => $group->first()->contact?->name,
            'evaluations'        => $group->count(),
            'avg_quality'        => round($group->avg('quality_rating'), 2),
            'avg_delivery'       => round($group->avg('delivery_rating'), 2),
            'avg_price'          => round($group->avg('price_rating'), 2),
            'avg_communication'  => round($group->avg('communication_rating'), 2),
            'avg_overall'        => round($group->avg('overall_rating'), 2),
        ])->sortByDesc('avg_overall')->values();

        return $this->success([
            'period'   => ['from' => $from, 'to' => $to],
            'vendors'  => $byVendor,
            'total_evaluations' => $evaluations->count(),
        ]);
    }

    private function buildScore(Contact $contact, bool $detailed = false): array
    {
        $evals = $contact->vendorEvaluations;
        $score = [
            'vendor_id'          => $contact->id,
            'vendor_name'        => $contact->name,
            'evaluation_count'   => $evals->count(),
            'avg_overall'        => $evals->count() ? round($evals->avg('overall_rating'), 2) : null,
            'avg_quality'        => $evals->count() ? round($evals->avg('quality_rating'), 2) : null,
            'avg_delivery'       => $evals->count() ? round($evals->avg('delivery_rating'), 2) : null,
            'avg_price'          => $evals->count() ? round($evals->avg('price_rating'), 2) : null,
            'avg_communication'  => $evals->count() ? round($evals->avg('communication_rating'), 2) : null,
            'last_evaluated'     => $evals->max('evaluation_date'),
        ];

        if ($detailed) {
            $score['evaluations'] = $evals->values();
        }

        return $score;
    }

    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }
}
