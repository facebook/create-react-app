<?php

namespace App\Modules\Survey\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Survey\Models\Survey;
use App\Modules\Survey\Models\SurveyAnswer;
use App\Modules\Survey\Models\SurveyQuestion;
use App\Modules\Survey\Models\SurveyResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SurveyController extends Controller
{
    public function index(Request $request): Response
    {
        $surveys = Survey::when($request->status, fn ($q) => $q->where('status', $request->status))
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Survey/Index', [
            'surveys' => $surveys,
            'filters' => $request->only(['status']),
        ]);
    }

    public function show(Survey $survey): Response
    {
        $survey->load('questions');

        return Inertia::render('Survey/Show', [
            'survey'        => $survey,
            'responseCount' => $survey->responseCount(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $survey = Survey::create([
            ...$validated,
            'tenant_id'  => auth()->user()->tenant_id,
            'created_by' => auth()->id(),
            'status'     => 'draft',
        ]);

        return redirect()->route('surveys.show', $survey)->with('success', 'Survey created.');
    }

    public function update(Request $request, Survey $survey): RedirectResponse
    {
        abort_if($survey->status !== 'draft', 403, 'Only draft surveys can be updated.');

        $validated = $request->validate([
            'title'       => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'starts_at'   => 'nullable|date',
            'ends_at'     => 'nullable|date',
        ]);

        $survey->update($validated);

        return redirect()->route('surveys.show', $survey)->with('success', 'Survey updated.');
    }

    public function destroy(Survey $survey): RedirectResponse
    {
        abort_if($survey->status !== 'draft', 403, 'Only draft surveys can be deleted.');

        $survey->delete();

        return redirect()->route('surveys.index')->with('success', 'Survey deleted.');
    }

    public function publish(Survey $survey): RedirectResponse
    {
        $survey->publish();

        return redirect()->back()->with('success', 'Survey published.');
    }

    public function close(Survey $survey): RedirectResponse
    {
        $survey->close();

        return redirect()->back()->with('success', 'Survey closed.');
    }

    public function addQuestion(Request $request, Survey $survey): RedirectResponse
    {
        abort_if($survey->status !== 'draft', 403, 'Questions can only be added to draft surveys.');

        $validated = $request->validate([
            'question_text' => 'required|string',
            'question_type' => 'required|in:text,single_choice,multiple_choice,rating,yes_no',
            'is_required'   => 'boolean',
            'sequence'      => 'integer',
            'options'       => 'nullable|array',
            'options.*'     => 'string',
        ]);

        $survey->questions()->create([
            ...$validated,
            'tenant_id' => $survey->tenant_id,
        ]);

        return redirect()->back()->with('success', 'Question added.');
    }

    public function removeQuestion(Survey $survey, SurveyQuestion $question): RedirectResponse
    {
        abort_if($question->survey_id !== $survey->id, 404);

        $question->delete();

        return redirect()->back()->with('success', 'Question removed.');
    }

    public function respond(Request $request, Survey $survey): RedirectResponse
    {
        abort_unless($survey->isOpen(), 422, 'This survey is not open for responses.');

        $validated = $request->validate([
            'respondent_name'  => 'nullable|string|max:255',
            'respondent_email' => 'nullable|email|max:255',
            'answers'          => 'nullable|array',
            'answers.*.question_id'    => 'required|exists:survey_questions,id',
            'answers.*.answer_text'    => 'nullable|string',
            'answers.*.answer_options' => 'nullable|array',
        ]);

        $response = SurveyResponse::create([
            'survey_id'        => $survey->id,
            'tenant_id'        => $survey->tenant_id,
            'respondent_name'  => $validated['respondent_name'] ?? null,
            'respondent_email' => $validated['respondent_email'] ?? null,
        ]);

        foreach ($validated['answers'] ?? [] as $answerData) {
            SurveyAnswer::create([
                'survey_response_id' => $response->id,
                'survey_question_id' => $answerData['question_id'],
                'tenant_id'          => $survey->tenant_id,
                'answer_text'        => $answerData['answer_text'] ?? null,
                'answer_options'     => $answerData['answer_options'] ?? null,
            ]);
        }

        $response->submit();

        return redirect()->back()->with('success', 'Response submitted.');
    }

    public function results(Survey $survey): Response
    {
        $survey->load('questions.answers');

        $questionStats = $survey->questions->map(function (SurveyQuestion $question) {
            $answers = $question->answers;

            $stats = match ($question->question_type) {
                'text' => [
                    'type'    => 'text',
                    'answers' => $answers->pluck('answer_text')->filter()->values(),
                ],
                'single_choice', 'multiple_choice' => [
                    'type'   => $question->question_type,
                    'counts' => collect($question->options ?? [])->mapWithKeys(function ($option) use ($answers) {
                        $count = $answers->filter(function ($answer) use ($option) {
                            $opts = $answer->answer_options ?? [];
                            return in_array($option, $opts, true) || $answer->answer_text === $option;
                        })->count();
                        return [$option => $count];
                    }),
                ],
                'rating' => [
                    'type'    => 'rating',
                    'average' => $answers->whereNotNull('answer_text')->avg('answer_text'),
                    'count'   => $answers->count(),
                ],
                'yes_no' => [
                    'type' => 'yes_no',
                    'yes'  => $answers->filter(fn ($a) => strtolower($a->answer_text ?? '') === 'yes')->count(),
                    'no'   => $answers->filter(fn ($a) => strtolower($a->answer_text ?? '') === 'no')->count(),
                ],
                default => ['type' => 'unknown', 'answers' => []],
            };

            return [
                'id'            => $question->id,
                'question_text' => $question->question_text,
                'question_type' => $question->question_type,
                'stats'         => $stats,
            ];
        });

        return Inertia::render('Survey/Results', [
            'survey'        => $survey,
            'questionStats' => $questionStats,
            'responseCount' => $survey->responseCount(),
        ]);
    }
}
