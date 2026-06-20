<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\DocumentTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DocumentTemplateController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', DocumentTemplate::class);

        $query = DocumentTemplate::orderByDesc('created_at');

        if ($request->filled('type')) {
            $query->forType($request->type);
        }

        $templates = $query->paginate(15)->withQueryString();

        return Inertia::render('Finance/DocumentTemplates/Index', [
            'templates' => $templates,
            'filter'    => ['type' => $request->get('type', '')],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', DocumentTemplate::class);

        return Inertia::render('Finance/DocumentTemplates/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', DocumentTemplate::class);

        $data = $request->validate([
            'name'       => ['required', 'string', 'max:255'],
            'type'       => ['required', Rule::in(['invoice', 'quote', 'letter', 'receipt', 'purchase_order'])],
            'subject'    => ['nullable', 'string', 'max:255'],
            'body'       => ['required', 'string'],
            'variables'  => ['nullable', 'array'],
            'is_default' => ['boolean'],
            'is_active'  => ['boolean'],
        ]);

        $template = DocumentTemplate::create([
            'tenant_id'  => auth()->user()->tenant_id,
            'name'       => $data['name'],
            'type'       => $data['type'],
            'subject'    => $data['subject'] ?? null,
            'body'       => $data['body'],
            'variables'  => $data['variables'] ?? null,
            'is_default' => $data['is_default'] ?? false,
            'is_active'  => $data['is_active'] ?? true,
        ]);

        return redirect()->route('finance.document-templates.show', $template)
            ->with('success', 'Document template created.');
    }

    public function show(DocumentTemplate $documentTemplate): Response
    {
        $this->authorize('view', $documentTemplate);

        return Inertia::render('Finance/DocumentTemplates/Show', [
            'template' => $documentTemplate,
        ]);
    }

    public function edit(DocumentTemplate $documentTemplate): Response
    {
        $this->authorize('create', DocumentTemplate::class);

        return Inertia::render('Finance/DocumentTemplates/Edit', [
            'template' => $documentTemplate,
        ]);
    }

    public function update(Request $request, DocumentTemplate $documentTemplate): RedirectResponse
    {
        $this->authorize('create', DocumentTemplate::class);

        $data = $request->validate([
            'name'       => ['required', 'string', 'max:255'],
            'type'       => ['required', Rule::in(['invoice', 'quote', 'letter', 'receipt', 'purchase_order'])],
            'subject'    => ['nullable', 'string', 'max:255'],
            'body'       => ['required', 'string'],
            'variables'  => ['nullable', 'array'],
            'is_default' => ['boolean'],
            'is_active'  => ['boolean'],
        ]);

        $documentTemplate->update($data);

        return redirect()->route('finance.document-templates.show', $documentTemplate)
            ->with('success', 'Document template updated.');
    }

    public function destroy(DocumentTemplate $documentTemplate): RedirectResponse
    {
        $this->authorize('delete', $documentTemplate);

        $documentTemplate->delete();

        return redirect()->route('finance.document-templates.index')
            ->with('success', 'Document template deleted.');
    }

    public function preview(Request $request): JsonResponse
    {
        $this->authorize('viewAny', DocumentTemplate::class);

        $request->validate([
            'type' => ['required', Rule::in(['invoice', 'quote', 'letter', 'receipt', 'purchase_order'])],
            'data' => ['nullable', 'json'],
        ]);

        $template = DocumentTemplate::forType($request->type)->active()->firstOrFail();

        $data = $request->filled('data') ? json_decode($request->data, true) : [];

        return response()->json(['html' => $template->render($data)]);
    }
}
