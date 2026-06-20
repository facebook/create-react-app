<?php

namespace App\Modules\CRM\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\CRM\Models\CrmLead;
use App\Modules\CRM\Models\LeadScoringRule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeadScoringController extends Controller
{
    public function rules(): Response
    {
        $rules = LeadScoringRule::orderByDesc('points')->get();

        return Inertia::render('CRM/LeadScoring/Rules', [
            'rules' => $rules,
        ]);
    }

    public function storeRule(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'field'           => 'required|in:source,stage,tag,email_open,email_click,website_visit',
            'condition_value' => 'nullable|string|max:255',
            'points'          => 'required|integer',
        ]);

        LeadScoringRule::create([
            ...$validated,
            'tenant_id' => auth()->user()->tenant_id,
        ]);

        return back()->with('success', 'Scoring rule created.');
    }

    public function destroyRule(LeadScoringRule $rule): RedirectResponse
    {
        $rule->delete();

        return back()->with('success', 'Rule deleted.');
    }

    public function scores(Request $request): Response
    {
        $leads = CrmLead::where('status', 'open')
            ->orderBy('contact_name')
            ->get()
            ->map(fn ($lead) => [
                'id'            => $lead->id,
                'contact_name'  => $lead->contact_name,
                'company_name'  => $lead->company_name,
                'email'         => $lead->email,
                'source'        => $lead->source,
                'score'         => LeadScoringRule::scoreForLead($lead),
            ])
            ->sortByDesc('score')
            ->values();

        return Inertia::render('CRM/LeadScoring/Scores', [
            'leads' => $leads,
        ]);
    }

    public function scoreForLead(CrmLead $lead): JsonResponse
    {
        return response()->json([
            'lead_id' => $lead->id,
            'score'   => LeadScoringRule::scoreForLead($lead),
        ]);
    }
}
