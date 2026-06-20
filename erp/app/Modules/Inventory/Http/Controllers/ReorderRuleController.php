<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\ReorderRule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReorderRuleController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ReorderRule::class);

        $rules = ReorderRule::with(['product'])
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Inventory/ReorderRules/Index', [
            'rules' => $rules,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', ReorderRule::class);

        return Inertia::render('Inventory/ReorderRules/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', ReorderRule::class);

        $validated = $request->validate([
            'product_id'       => 'required|exists:products,id',
            'reorder_point'    => 'required|numeric|min:0',
            'reorder_quantity'  => 'required|numeric|min:0',
            'warehouse_id'     => 'nullable|exists:warehouses,id',
            'max_stock_level'  => 'nullable|numeric|min:0',
            'rule_type'        => 'nullable|string|in:fixed,dynamic',
            'is_active'        => 'nullable|boolean',
        ]);

        ReorderRule::create([
            'tenant_id'  => app('tenant')->id,
            'created_by' => auth()->id(),
            ...$validated,
        ]);

        return redirect()->route('inventory.reorder-rules.index')
            ->with('success', 'Reorder rule created.');
    }

    public function show(ReorderRule $reorderRule): Response
    {
        $this->authorize('view', $reorderRule);

        $reorderRule->load(['product']);

        return Inertia::render('Inventory/ReorderRules/Show', [
            'rule' => $reorderRule,
        ]);
    }

    public function edit(ReorderRule $reorderRule): Response
    {
        $this->authorize('update', $reorderRule);

        $reorderRule->load(['product']);

        return Inertia::render('Inventory/ReorderRules/Edit', [
            'rule' => $reorderRule,
        ]);
    }

    public function update(Request $request, ReorderRule $reorderRule): RedirectResponse
    {
        $this->authorize('update', $reorderRule);

        $validated = $request->validate([
            'product_id'       => 'required|exists:products,id',
            'reorder_point'    => 'required|numeric|min:0',
            'reorder_quantity'  => 'required|numeric|min:0',
            'warehouse_id'     => 'nullable|exists:warehouses,id',
            'max_stock_level'  => 'nullable|numeric|min:0',
            'rule_type'        => 'nullable|string|in:fixed,dynamic',
            'is_active'        => 'nullable|boolean',
        ]);

        $reorderRule->update($validated);

        return redirect()->route('inventory.reorder-rules.index')
            ->with('success', 'Reorder rule updated.');
    }

    public function destroy(ReorderRule $reorderRule): RedirectResponse
    {
        $this->authorize('delete', $reorderRule);

        $reorderRule->delete();

        return redirect()->route('inventory.reorder-rules.index')
            ->with('success', 'Reorder rule deleted.');
    }

    public function trigger(ReorderRule $reorderRule): RedirectResponse
    {
        $this->authorize('trigger', $reorderRule);

        $reorderRule->trigger();

        return back()->with('success', 'Reorder rule triggered.');
    }

    public function pause(ReorderRule $reorderRule): RedirectResponse
    {
        $this->authorize('pause', $reorderRule);

        $reorderRule->pause();

        return back()->with('success', 'Reorder rule paused.');
    }

    public function resume(ReorderRule $reorderRule): RedirectResponse
    {
        $this->authorize('resume', $reorderRule);

        $reorderRule->resume();

        return back()->with('success', 'Reorder rule resumed.');
    }
}
