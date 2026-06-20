<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\EmployeeSurvey;
use App\Modules\HR\Models\SurveyResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeSurveyController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', EmployeeSurvey::class);
        $surveys = EmployeeSurvey::where('tenant_id', app('tenant')->id)
            ->latest()
            ->paginate(20);
        return Inertia::render('HR/Surveys/Index', compact('surveys'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', EmployeeSurvey::class);
        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'description'  => 'nullable|string',
            'start_date'   => 'nullable|date',
            'end_date'     => 'nullable|date|after_or_equal:start_date',
            'is_anonymous' => 'nullable|boolean',
        ]);
        $validated['tenant_id']  = app('tenant')->id;
        $validated['created_by'] = auth()->id();
        EmployeeSurvey::create($validated);
        return back()->with('success', 'Survey created.');
    }

    public function show(EmployeeSurvey $survey): Response
    {
        $this->authorize('view', $survey);
        return Inertia::render('HR/Surveys/Show', compact('survey'));
    }

    public function publish(EmployeeSurvey $survey): RedirectResponse
    {
        $this->authorize('update', $survey);
        $survey->publish();
        return back()->with('success', 'Survey published.');
    }

    public function close(EmployeeSurvey $survey): RedirectResponse
    {
        $this->authorize('update', $survey);
        $survey->close();
        return back()->with('success', 'Survey closed.');
    }

    public function respond(Request $request, EmployeeSurvey $survey): RedirectResponse
    {
        $validated = $request->validate([
            'answers'     => 'required|array',
            'employee_id' => 'nullable|exists:employees,id',
        ]);
        SurveyResponse::create([
            'tenant_id'          => app('tenant')->id,
            'employee_survey_id' => $survey->id,
            'employee_id'        => $validated['employee_id'] ?? null,
            'answers'            => $validated['answers'],
            'submitted_at'       => now(),
        ]);
        return back()->with('success', 'Response submitted.');
    }

    public function destroy(EmployeeSurvey $survey): RedirectResponse
    {
        $this->authorize('delete', $survey);
        $survey->delete();
        return back()->with('success', 'Survey deleted.');
    }
}
