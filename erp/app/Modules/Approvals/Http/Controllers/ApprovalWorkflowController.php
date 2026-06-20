<?php

namespace App\Modules\Approvals\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Approvals\Models\ApprovalStep;
use App\Modules\Approvals\Models\ApprovalWorkflow;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class ApprovalWorkflowController extends Controller
{
    public function index(): Response
    {
        $workflows = ApprovalWorkflow::withoutGlobalScopes()
            ->where('tenant_id', auth()->user()->tenant_id)
            ->withCount('steps')
            ->orderBy('name')
            ->get();

        return Inertia::render('Approvals/Workflows/Index', [
            'workflows' => $workflows,
        ]);
    }

    public function create(): Response
    {
        $users = User::where('tenant_id', auth()->user()->tenant_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        $roles = Role::orderBy('name')->pluck('name');

        return Inertia::render('Approvals/Workflows/Create', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'entity_type' => 'required|string|in:purchase_order,expense,leave_request,bill,manufacturing_order',
            'min_amount'  => 'nullable|numeric|min:0',
            'max_amount'  => 'nullable|numeric|min:0',
            'is_active'   => 'boolean',
            'steps'       => 'array|min:1',
            'steps.*.name'          => 'required|string|max:255',
            'steps.*.approver_id'   => 'nullable|exists:users,id',
            'steps.*.approver_role' => 'nullable|string|max:100',
            'steps.*.is_required'   => 'boolean',
        ]);

        $workflow = ApprovalWorkflow::create([
            'tenant_id'   => auth()->user()->tenant_id,
            'name'        => $data['name'],
            'entity_type' => $data['entity_type'],
            'min_amount'  => $data['min_amount'] ?? null,
            'max_amount'  => $data['max_amount'] ?? null,
            'is_active'   => $data['is_active'] ?? true,
        ]);

        foreach ($data['steps'] ?? [] as $index => $stepData) {
            ApprovalStep::create([
                'workflow_id'   => $workflow->id,
                'step_number'   => $index + 1,
                'name'          => $stepData['name'],
                'approver_id'   => $stepData['approver_id'] ?? null,
                'approver_role' => $stepData['approver_role'] ?? null,
                'is_required'   => $stepData['is_required'] ?? true,
            ]);
        }

        return redirect()->route('approvals.workflows.index')
            ->with('success', 'Workflow created successfully.');
    }

    public function show(ApprovalWorkflow $workflow): Response
    {
        $workflow->load('steps.approver');

        return Inertia::render('Approvals/Workflows/Show', [
            'workflow' => $workflow,
        ]);
    }

    public function edit(ApprovalWorkflow $workflow): Response
    {
        $workflow->load('steps');

        $users = User::where('tenant_id', auth()->user()->tenant_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        $roles = Role::orderBy('name')->pluck('name');

        return Inertia::render('Approvals/Workflows/Edit', [
            'workflow' => $workflow,
            'users'    => $users,
            'roles'    => $roles,
        ]);
    }

    public function update(Request $request, ApprovalWorkflow $workflow): RedirectResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'entity_type' => 'required|string|in:purchase_order,expense,leave_request,bill,manufacturing_order',
            'min_amount'  => 'nullable|numeric|min:0',
            'max_amount'  => 'nullable|numeric|min:0',
            'is_active'   => 'boolean',
            'steps'       => 'array|min:1',
            'steps.*.name'          => 'required|string|max:255',
            'steps.*.approver_id'   => 'nullable|exists:users,id',
            'steps.*.approver_role' => 'nullable|string|max:100',
            'steps.*.is_required'   => 'boolean',
        ]);

        $workflow->update([
            'name'        => $data['name'],
            'entity_type' => $data['entity_type'],
            'min_amount'  => $data['min_amount'] ?? null,
            'max_amount'  => $data['max_amount'] ?? null,
            'is_active'   => $data['is_active'] ?? true,
        ]);

        // Sync steps: delete existing, recreate
        $workflow->steps()->delete();

        foreach ($data['steps'] ?? [] as $index => $stepData) {
            ApprovalStep::create([
                'workflow_id'   => $workflow->id,
                'step_number'   => $index + 1,
                'name'          => $stepData['name'],
                'approver_id'   => $stepData['approver_id'] ?? null,
                'approver_role' => $stepData['approver_role'] ?? null,
                'is_required'   => $stepData['is_required'] ?? true,
            ]);
        }

        return redirect()->route('approvals.workflows.show', $workflow)
            ->with('success', 'Workflow updated successfully.');
    }

    public function destroy(ApprovalWorkflow $workflow): RedirectResponse
    {
        $workflow->delete();

        return redirect()->route('approvals.workflows.index')
            ->with('success', 'Workflow deleted successfully.');
    }
}
