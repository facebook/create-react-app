<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\EmailTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EmailTemplateController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $templates = EmailTemplate::where('tenant_id', $tenantId)->get();

        // Augment with defaults for any missing template keys
        $existing = $templates->pluck('key')->all();
        $defaults  = collect(EmailTemplate::$defaultTemplates)
            ->filter(fn ($t, $key) => ! in_array($key, $existing))
            ->map(fn ($t, $key) => array_merge($t, ['key' => $key, 'is_active' => true, 'id' => null]));

        return $this->success([
            'templates' => $templates,
            'defaults'  => $defaults->values(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'key'       => [
                'required', 'string', 'max:100',
                Rule::in(array_keys(EmailTemplate::$defaultTemplates)),
                Rule::unique('email_templates')->where('tenant_id', $tenantId),
            ],
            'name'      => ['required', 'string', 'max:255'],
            'subject'   => ['required', 'string', 'max:500'],
            'body_html' => ['required', 'string'],
            'is_active' => ['boolean'],
        ]);

        $template = EmailTemplate::create([
            ...$data,
            'tenant_id' => $tenantId,
            'variables' => EmailTemplate::$defaultTemplates[$data['key']]['variables'] ?? [],
        ]);

        return $this->success($template, 201);
    }

    public function show(Request $request, EmailTemplate $emailTemplate): JsonResponse
    {
        return $this->success($emailTemplate);
    }

    public function update(Request $request, EmailTemplate $emailTemplate): JsonResponse
    {
        $data = $request->validate([
            'name'      => ['sometimes', 'string', 'max:255'],
            'subject'   => ['sometimes', 'string', 'max:500'],
            'body_html' => ['sometimes', 'string'],
            'is_active' => ['boolean'],
        ]);

        $emailTemplate->update($data);

        return $this->success($emailTemplate->fresh());
    }

    public function destroy(EmailTemplate $emailTemplate): JsonResponse
    {
        $emailTemplate->delete();
        return $this->success(['message' => 'Template deleted. Default will be used.']);
    }

    public function preview(Request $request, EmailTemplate $emailTemplate): JsonResponse
    {
        $vars     = $request->input('variables', []);
        $rendered = $emailTemplate->render($vars);

        return $this->success($rendered);
    }

    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }
}
