<?php

namespace Database\Seeders;

use App\Modules\Core\Models\Tenant;
use App\Modules\Survey\Models\Survey;
use App\Modules\Survey\Models\SurveyQuestion;
use Illuminate\Database\Seeder;

class SurveySeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        if (! $tenant) {
            return;
        }

        // Survey 1 — published customer satisfaction survey
        $satisfaction = Survey::create([
            'tenant_id'   => $tenant->id,
            'title'       => 'Customer Satisfaction Survey — Q2 2026',
            'description' => 'Help us improve by sharing your experience with our products and support team.',
            'status'      => 'published',
            'starts_at'   => '2026-06-01 00:00:00',
            'ends_at'     => '2026-06-30 23:59:59',
        ]);

        // 3 questions for survey 1
        SurveyQuestion::create([
            'survey_id'     => $satisfaction->id,
            'tenant_id'     => $tenant->id,
            'question_text' => 'How satisfied are you with our product overall?',
            'question_type' => 'rating',
            'is_required'   => true,
            'sequence'      => 1,
            'options'       => null,
        ]);

        SurveyQuestion::create([
            'survey_id'     => $satisfaction->id,
            'tenant_id'     => $tenant->id,
            'question_text' => 'Which features do you use most frequently?',
            'question_type' => 'multiple_choice',
            'is_required'   => false,
            'sequence'      => 2,
            'options'       => ['Inventory', 'Finance', 'CRM', 'HR', 'Projects', 'Repairs', 'Subscriptions'],
        ]);

        SurveyQuestion::create([
            'survey_id'     => $satisfaction->id,
            'tenant_id'     => $tenant->id,
            'question_text' => 'Would you recommend our ERP to a colleague or business partner?',
            'question_type' => 'yes_no',
            'is_required'   => true,
            'sequence'      => 3,
            'options'       => null,
        ]);

        // Survey 2 — draft onboarding feedback survey
        Survey::create([
            'tenant_id'   => $tenant->id,
            'title'       => 'Onboarding Experience Feedback',
            'description' => 'We would love to know how your onboarding went and where we can do better.',
            'status'      => 'draft',
        ]);
    }
}
