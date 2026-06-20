<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Survey\Models\Survey;
use App\Modules\Survey\Models\SurveyQuestion;
use App\Modules\Survey\Models\SurveyResponse;
use App\Modules\Survey\Models\SurveyAnswer;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Survey Co', 'slug' => 'survey-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

function buildSurvey(string $status = 'draft'): Survey
{
    return Survey::create([
        'tenant_id'  => test()->tenant->id,
        'title'      => 'Customer Satisfaction ' . uniqid(),
        'description'=> 'Rate your experience',
        'status'     => $status,
        'created_by' => test()->user->id,
    ]);
}

function buildSurveyQuestion(Survey $survey, string $type = 'text'): SurveyQuestion
{
    return SurveyQuestion::create([
        'tenant_id'     => test()->tenant->id,
        'survey_id'     => $survey->id,
        'question_text' => 'How satisfied are you? ' . uniqid(),
        'question_type' => $type,
        'is_required'   => true,
        'sequence'      => 1,
    ]);
}

test('can create a survey with questions', function () {
    $this->withToken($this->token)
        ->postJson('/api/v1/surveys', [
            'title'       => 'Product Feedback',
            'description' => 'Tell us about the product',
            'questions'   => [
                ['question_text' => 'Overall rating', 'question_type' => 'rating', 'sequence' => 1],
                ['question_text' => 'Would you recommend?', 'question_type' => 'yes_no', 'sequence' => 2],
            ],
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.title', 'Product Feedback')
        ->assertJsonPath('data.status', 'draft')
        ->assertJsonStructure(['data' => ['questions']]);
});

test('can list surveys', function () {
    buildSurvey('draft');
    buildSurvey('published');

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/surveys')
        ->assertStatus(200);

    expect(count($response->json('data')))->toBeGreaterThanOrEqual(2);
});

test('can filter surveys by status', function () {
    buildSurvey('draft');
    buildSurvey('published');

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/surveys?status=published')
        ->assertStatus(200);

    foreach ($response->json('data') as $item) {
        expect($item['status'])->toBe('published');
    }
});

test('can view a survey with question count', function () {
    $survey = buildSurvey();
    buildSurveyQuestion($survey);

    $this->withToken($this->token)
        ->getJson("/api/v1/surveys/{$survey->id}")
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['id', 'title', 'status', 'questions']]);
});

test('can update a survey', function () {
    $survey = buildSurvey();

    $this->withToken($this->token)
        ->putJson("/api/v1/surveys/{$survey->id}", ['title' => 'Updated Title'])
        ->assertStatus(200)
        ->assertJsonPath('data.title', 'Updated Title');
});

test('can publish a draft survey', function () {
    $survey = buildSurvey('draft');

    $this->withToken($this->token)
        ->postJson("/api/v1/surveys/{$survey->id}/publish")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'published');
});

test('cannot publish an already published survey', function () {
    $survey = buildSurvey('published');

    $this->withToken($this->token)
        ->postJson("/api/v1/surveys/{$survey->id}/publish")
        ->assertStatus(422);
});

test('can close a published survey', function () {
    $survey = buildSurvey('published');

    $this->withToken($this->token)
        ->postJson("/api/v1/surveys/{$survey->id}/close")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'closed');
});

test('can add a question to a survey', function () {
    $survey = buildSurvey();

    $this->withToken($this->token)
        ->postJson("/api/v1/surveys/{$survey->id}/questions", [
            'question_text' => 'What is your age group?',
            'question_type' => 'single_choice',
            'options'       => ['18-25', '26-35', '36-50', '50+'],
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.question_type', 'single_choice');
});

test('can update a question', function () {
    $survey   = buildSurvey();
    $question = buildSurveyQuestion($survey);

    $this->withToken($this->token)
        ->putJson("/api/v1/surveys/{$survey->id}/questions/{$question->id}", [
            'question_text' => 'Updated question text',
        ])
        ->assertStatus(200)
        ->assertJsonPath('data.question_text', 'Updated question text');
});

test('can delete a question', function () {
    $survey   = buildSurvey();
    $question = buildSurveyQuestion($survey);

    $this->withToken($this->token)
        ->deleteJson("/api/v1/surveys/{$survey->id}/questions/{$question->id}")
        ->assertStatus(200);

    expect(SurveyQuestion::find($question->id))->toBeNull();
});

test('can submit a response with answers', function () {
    $survey   = buildSurvey('published');
    $question = buildSurveyQuestion($survey, 'text');

    $this->withToken($this->token)
        ->postJson("/api/v1/surveys/{$survey->id}/respond", [
            'respondent_name'  => 'Jane Doe',
            'respondent_email' => 'jane@example.com',
            'answers'          => [
                ['survey_question_id' => $question->id, 'answer_text' => 'Very satisfied'],
            ],
        ])
        ->assertStatus(201)
        ->assertJsonStructure(['data' => ['answers']]);
});

test('can view survey results with analytics', function () {
    $survey   = buildSurvey('published');
    $question = buildSurveyQuestion($survey, 'rating');

    $response = SurveyResponse::create([
        'tenant_id'    => $this->tenant->id,
        'survey_id'    => $survey->id,
        'submitted_at' => now(),
    ]);

    SurveyAnswer::create([
        'tenant_id'          => $this->tenant->id,
        'survey_response_id' => $response->id,
        'survey_question_id' => $question->id,
        'answer_text'        => '4',
    ]);

    $result = $this->withToken($this->token)
        ->getJson("/api/v1/surveys/{$survey->id}/results")
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['survey_id', 'total_responses', 'questions']]);

    expect($result->json('data.total_responses'))->toBe(1);
});

test('can delete a survey', function () {
    $survey = buildSurvey();

    $this->withToken($this->token)
        ->deleteJson("/api/v1/surveys/{$survey->id}")
        ->assertStatus(200);

    expect(Survey::withTrashed()->find($survey->id)?->deleted_at)->not->toBeNull();
});

test('requires authentication', function () {
    $this->getJson('/api/v1/surveys')->assertStatus(401);
});
