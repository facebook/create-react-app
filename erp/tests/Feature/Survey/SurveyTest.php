<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Survey\Models\Survey;
use App\Modules\Survey\Models\SurveyQuestion;
use App\Modules\Survey\Models\SurveyResponse;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Survey Corp', 'slug' => 'survey-corp-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->actingAs($this->user);
    app()->instance('tenant', $this->tenant);
});

// Helper to create a survey
function makeSurvey(array $attrs = []): Survey
{
    return Survey::create(array_merge([
        'tenant_id'  => test()->tenant->id,
        'title'      => 'Test Survey ' . uniqid(),
        'status'     => 'draft',
        'created_by' => test()->user->id,
    ], $attrs));
}

// Helper to add a question to a survey
function makeSurveyQuestion(Survey $survey, array $attrs = []): SurveyQuestion
{
    return SurveyQuestion::create(array_merge([
        'survey_id'     => $survey->id,
        'tenant_id'     => $survey->tenant_id,
        'question_text' => 'Question ' . uniqid(),
        'question_type' => 'text',
        'is_required'   => true,
        'sequence'      => 0,
    ], $attrs));
}

// 1. Lists surveys
it('lists surveys', function () {
    makeSurvey();
    $this->get('/surveys')->assertOk();
});

// 2. Creates a survey
it('creates a survey', function () {
    $this->post('/surveys', [
        'title'       => 'Customer Feedback',
        'description' => 'Tell us how we did.',
    ])->assertRedirect();

    $survey = Survey::where('title', 'Customer Feedback')->first();
    expect($survey)->not->toBeNull();
    expect($survey->status)->toBe('draft');
});

// 3. Shows a survey
it('shows a survey', function () {
    $survey = makeSurvey();
    $this->get("/surveys/{$survey->id}")->assertOk();
});

// 4. Publishes a survey
it('publishes a survey', function () {
    $survey = makeSurvey(['status' => 'draft']);
    $this->post("/surveys/{$survey->id}/publish")->assertRedirect();

    expect($survey->fresh()->status)->toBe('published');
});

// 5. Closes a survey
it('closes a survey', function () {
    $survey = makeSurvey(['status' => 'published', 'starts_at' => now()]);
    $this->post("/surveys/{$survey->id}/close")->assertRedirect();

    expect($survey->fresh()->status)->toBe('closed');
});

// 6. Adds a question
it('adds a question to a survey', function () {
    $survey = makeSurvey(['status' => 'draft']);
    $this->post("/surveys/{$survey->id}/questions", [
        'question_text' => 'How satisfied are you?',
        'question_type' => 'rating',
        'is_required'   => true,
    ])->assertRedirect();

    $question = SurveyQuestion::where('survey_id', $survey->id)->first();
    expect($question)->not->toBeNull();
    expect($question->question_text)->toBe('How satisfied are you?');
});

// 7. Submits a response
it('submits a response to an open survey', function () {
    $survey   = makeSurvey(['status' => 'published', 'starts_at' => now()]);
    $question = makeSurveyQuestion($survey);

    $this->post("/surveys/{$survey->id}/respond", [
        'respondent_name'  => 'Jane Doe',
        'respondent_email' => 'jane@example.com',
        'answers'          => [
            [
                'question_id' => $question->id,
                'answer_text' => 'Great service!',
            ],
        ],
    ])->assertRedirect();

    $response = SurveyResponse::where('survey_id', $survey->id)->first();
    expect($response)->not->toBeNull();
    expect($response->submitted_at)->not->toBeNull();
});

// 8. Cannot respond to a closed survey
it('cannot respond to a closed survey', function () {
    $survey = makeSurvey(['status' => 'closed', 'ends_at' => now()->subMinute()]);

    $this->post("/surveys/{$survey->id}/respond", [
        'respondent_name' => 'John',
    ])->assertStatus(422);
});

// 9. Gets results
it('gets survey results', function () {
    $survey = makeSurvey(['status' => 'published', 'starts_at' => now()]);
    makeSurveyQuestion($survey);

    $this->get("/surveys/{$survey->id}/results")->assertOk();
});

// 10. Removes a question
it('removes a question from a survey', function () {
    $survey   = makeSurvey(['status' => 'draft']);
    $question = makeSurveyQuestion($survey);

    $this->delete("/surveys/{$survey->id}/questions/{$question->id}")->assertRedirect();

    expect(SurveyQuestion::find($question->id))->toBeNull();
});
