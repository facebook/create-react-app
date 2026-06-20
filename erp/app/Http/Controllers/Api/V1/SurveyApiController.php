<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Survey\Models\Survey;
use App\Modules\Survey\Models\SurveyAnswer;
use App\Modules\Survey\Models\SurveyQuestion;
use App\Modules\Survey\Models\SurveyResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SurveyApiController extends ApiController
{
    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }

    // ── Surveys ───────────────────────────────────────────────────────────────

    public function surveys(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $surveys = Survey::where('tenant_id', $tenantId)
            ->withCount('questions', 'responses')
            ->when($request->query('status'), fn ($q, $s) => $q->where('status', $s))
            ->latest()
            ->get();

        return $this->success($surveys);
    }

    public function showSurvey(Request $request, int $id): JsonResponse
    {
        $survey = Survey::with(['questions' => fn ($q) => $q->orderBy('sequence')])
            ->withCount('responses')
            ->findOrFail($id);

        return $this->success($survey);
    }

    public function storeSurvey(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'starts_at'   => 'nullable|date',
            'ends_at'     => 'nullable|date|after_or_equal:starts_at',
            'questions'   => 'nullable|array',
            'questions.*.question_text' => 'required_with:questions|string',
            'questions.*.question_type' => ['required_with:questions', 'string', 'in:text,single_choice,multiple_choice,rating,yes_no'],
            'questions.*.is_required'   => 'nullable|boolean',
            'questions.*.sequence'      => 'nullable|integer|min:1',
            'questions.*.options'       => 'nullable|array',
        ]);

        $questions = $validated['questions'] ?? [];

        $survey = Survey::create([
            'tenant_id'   => $tenantId,
            'title'       => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status'      => 'draft',
            'starts_at'   => $validated['starts_at'] ?? null,
            'ends_at'     => $validated['ends_at'] ?? null,
            'created_by'  => $request->user()->id,
        ]);

        foreach ($questions as $i => $q) {
            SurveyQuestion::create([
                'tenant_id'     => $tenantId,
                'survey_id'     => $survey->id,
                'question_text' => $q['question_text'],
                'question_type' => $q['question_type'],
                'is_required'   => $q['is_required'] ?? true,
                'sequence'      => $q['sequence'] ?? ($i + 1),
                'options'       => $q['options'] ?? null,
            ]);
        }

        return $this->success($survey->load('questions'), 201);
    }

    public function updateSurvey(Request $request, int $id): JsonResponse
    {
        $survey = Survey::findOrFail($id);

        if ($survey->status === 'closed') {
            return $this->error('Closed surveys cannot be edited.', 422);
        }

        $validated = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'starts_at'   => 'nullable|date',
            'ends_at'     => 'nullable|date',
        ]);

        $survey->update($validated);

        return $this->success($survey->fresh()->load('questions'));
    }

    public function destroySurvey(int $id): JsonResponse
    {
        $survey = Survey::findOrFail($id);
        $survey->delete();

        return $this->success(['message' => 'Survey deleted.']);
    }

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    public function publishSurvey(int $id): JsonResponse
    {
        $survey = Survey::findOrFail($id);

        if ($survey->status !== 'draft') {
            return $this->error('Only draft surveys can be published.', 422);
        }

        $survey->publish();

        return $this->success($survey->fresh());
    }

    public function closeSurvey(int $id): JsonResponse
    {
        $survey = Survey::findOrFail($id);

        if ($survey->status !== 'published') {
            return $this->error('Only published surveys can be closed.', 422);
        }

        $survey->close();

        return $this->success($survey->fresh());
    }

    // ── Questions ─────────────────────────────────────────────────────────────

    public function addQuestion(Request $request, int $id): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        $survey   = Survey::findOrFail($id);

        $data = $request->validate([
            'question_text' => ['required', 'string'],
            'question_type' => ['required', 'in:text,single_choice,multiple_choice,rating,yes_no'],
            'is_required'   => ['boolean'],
            'sequence'      => ['nullable', 'integer', 'min:1'],
            'options'       => ['nullable', 'array'],
        ]);

        $question = SurveyQuestion::create([
            'tenant_id'     => $tenantId,
            'survey_id'     => $survey->id,
            'question_text' => $data['question_text'],
            'question_type' => $data['question_type'],
            'is_required'   => $data['is_required'] ?? true,
            'sequence'      => $data['sequence'] ?? ($survey->questions()->count() + 1),
            'options'       => $data['options'] ?? null,
        ]);

        return $this->success($question, 201);
    }

    public function updateQuestion(Request $request, int $id, int $questionId): JsonResponse
    {
        $question = SurveyQuestion::where('survey_id', $id)->findOrFail($questionId);

        $data = $request->validate([
            'question_text' => ['sometimes', 'string'],
            'question_type' => ['sometimes', 'in:text,single_choice,multiple_choice,rating,yes_no'],
            'is_required'   => ['boolean'],
            'sequence'      => ['nullable', 'integer', 'min:1'],
            'options'       => ['nullable', 'array'],
        ]);

        $question->update($data);

        return $this->success($question->fresh());
    }

    public function deleteQuestion(int $id, int $questionId): JsonResponse
    {
        $question = SurveyQuestion::where('survey_id', $id)->findOrFail($questionId);
        $question->delete();

        return $this->success(['message' => 'Question deleted.']);
    }

    // ── Responses ─────────────────────────────────────────────────────────────

    public function submitResponse(Request $request, int $id): JsonResponse
    {
        $survey   = Survey::findOrFail($id);
        $tenantId = $this->tenantId($request);

        $validated = $request->validate([
            'respondent_name'              => ['nullable', 'string', 'max:255'],
            'respondent_email'             => ['nullable', 'email', 'max:255'],
            'answers'                      => ['required', 'array'],
            'answers.*.survey_question_id' => ['required', 'integer', 'exists:survey_questions,id'],
            'answers.*.answer_text'        => ['nullable', 'string'],
            'answers.*.answer_options'     => ['nullable', 'array'],
        ]);

        $response = SurveyResponse::create([
            'tenant_id'        => $tenantId,
            'survey_id'        => $survey->id,
            'respondent_name'  => $validated['respondent_name'] ?? null,
            'respondent_email' => $validated['respondent_email'] ?? null,
            'submitted_at'     => now(),
        ]);

        foreach ($validated['answers'] as $answer) {
            SurveyAnswer::create([
                'tenant_id'          => $tenantId,
                'survey_response_id' => $response->id,
                'survey_question_id' => $answer['survey_question_id'],
                'answer_text'        => $answer['answer_text'] ?? null,
                'answer_options'     => $answer['answer_options'] ?? null,
            ]);
        }

        return $this->success($response->load('answers'), 201);
    }

    // ── Analytics ─────────────────────────────────────────────────────────────

    public function surveyResults(int $id): JsonResponse
    {
        $survey = Survey::with(['questions.answers'])->findOrFail($id);

        $totalResponses = $survey->responseCount();

        $questionResults = $survey->questions->map(function (SurveyQuestion $question) use ($totalResponses) {
            $answers      = $question->answers;
            $answerCount  = $answers->count();

            $summary = match ($question->question_type) {
                'rating' => [
                    'average' => $answerCount > 0
                        ? round($answers->avg(fn ($a) => (float) $a->answer_text), 2)
                        : null,
                    'count'   => $answerCount,
                ],
                'yes_no', 'single_choice', 'multiple_choice' => [
                    'distribution' => $answers
                        ->flatMap(fn ($a) => $a->answer_options ?? [$a->answer_text])
                        ->filter()
                        ->countBy()
                        ->toArray(),
                    'count' => $answerCount,
                ],
                default => ['count' => $answerCount],
            };

            return [
                'question_id'   => $question->id,
                'question_text' => $question->question_text,
                'question_type' => $question->question_type,
                'answer_count'  => $answerCount,
                'summary'       => $summary,
            ];
        });

        return $this->success([
            'survey_id'       => $survey->id,
            'title'           => $survey->title,
            'status'          => $survey->status,
            'total_responses' => $totalResponses,
            'questions'       => $questionResults,
        ]);
    }
}
