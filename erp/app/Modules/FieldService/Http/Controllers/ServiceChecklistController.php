<?php

namespace App\Modules\FieldService\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\FieldService\Models\ServiceChecklist;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServiceChecklistController extends Controller
{
    public function index(): Response
    {
        $checklists = ServiceChecklist::withCount('items')
            ->orderBy('name')
            ->get();

        return Inertia::render('FieldService/Checklists/Index', [
            'checklists' => $checklists,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'description'       => 'nullable|string',
            'is_active'         => 'boolean',
            'items'             => 'nullable|array',
            'items.*.label'     => 'required_with:items|string|max:255',
            'items.*.sequence'  => 'nullable|integer|min:0',
        ]);

        $checklist = ServiceChecklist::create([
            'tenant_id'   => auth()->user()->tenant_id,
            'name'        => $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_active'   => $validated['is_active'] ?? true,
        ]);

        if (!empty($validated['items'])) {
            foreach ($validated['items'] as $index => $item) {
                $checklist->items()->create([
                    'label'    => $item['label'],
                    'sequence' => $item['sequence'] ?? $index,
                ]);
            }
        }

        return redirect()->back()->with('success', 'Checklist created.');
    }

    public function update(Request $request, ServiceChecklist $checklist): RedirectResponse
    {
        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'description'       => 'nullable|string',
            'is_active'         => 'boolean',
            'items'             => 'nullable|array',
            'items.*.label'     => 'required_with:items|string|max:255',
            'items.*.sequence'  => 'nullable|integer|min:0',
        ]);

        $checklist->update([
            'name'        => $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_active'   => $validated['is_active'] ?? $checklist->is_active,
        ]);

        // Sync items
        $checklist->items()->delete();
        if (!empty($validated['items'])) {
            foreach ($validated['items'] as $index => $item) {
                $checklist->items()->create([
                    'label'    => $item['label'],
                    'sequence' => $item['sequence'] ?? $index,
                ]);
            }
        }

        return redirect()->back()->with('success', 'Checklist updated.');
    }

    public function destroy(ServiceChecklist $checklist): RedirectResponse
    {
        $checklist->delete();

        return redirect()->back()->with('success', 'Checklist deleted.');
    }
}
