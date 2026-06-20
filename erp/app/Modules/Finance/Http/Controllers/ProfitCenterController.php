<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Modules\Finance\Models\ProfitCenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfitCenterController
{
    public function index(): Response
    {
        $profitCenters = ProfitCenter::with('parent', 'manager')
            ->orderBy('code')
            ->paginate(20);

        return Inertia::render('Finance/ProfitCenters/Index', compact('profitCenters'));
    }

    public function create(): Response
    {
        $parents = ProfitCenter::orderBy('name')->get(['id', 'name', 'code']);
        return Inertia::render('Finance/ProfitCenters/Create', compact('parents'));
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'code'        => 'required|string|max:50|unique:profit_centers,code',
            'name'        => 'required|string|max:255',
            'type'        => 'required|string|in:profit,cost,investment',
            'parent_id'   => 'nullable|exists:profit_centers,id',
            'manager_id'  => 'nullable|exists:users,id',
            'budget'      => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
        ]);

        $data['tenant_id'] = app('tenant')->id;

        ProfitCenter::create($data);

        return redirect()->route('finance.profit-centers.index');
    }

    public function show(ProfitCenter $profitCenter): Response
    {
        $profitCenter->load('parent', 'children', 'manager');
        return Inertia::render('Finance/ProfitCenters/Show', compact('profitCenter'));
    }

    public function edit(ProfitCenter $profitCenter): Response
    {
        $parents = ProfitCenter::where('id', '!=', $profitCenter->id)->orderBy('name')->get(['id', 'name', 'code']);
        return Inertia::render('Finance/ProfitCenters/Edit', compact('profitCenter', 'parents'));
    }

    public function update(Request $request, ProfitCenter $profitCenter): RedirectResponse
    {
        $data = $request->validate([
            'code'        => 'required|string|max:50|unique:profit_centers,code,' . $profitCenter->id,
            'name'        => 'required|string|max:255',
            'type'        => 'required|string|in:profit,cost,investment',
            'parent_id'   => 'nullable|exists:profit_centers,id',
            'manager_id'  => 'nullable|exists:users,id',
            'budget'      => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
        ]);

        $profitCenter->update($data);

        return redirect()->route('finance.profit-centers.index');
    }

    public function destroy(ProfitCenter $profitCenter): RedirectResponse
    {
        $profitCenter->delete();
        return redirect()->route('finance.profit-centers.index');
    }

    public function activate(ProfitCenter $profitCenter): RedirectResponse
    {
        $profitCenter->activate();
        return redirect()->route('finance.profit-centers.index');
    }

    public function deactivate(ProfitCenter $profitCenter): RedirectResponse
    {
        $profitCenter->deactivate();
        return redirect()->route('finance.profit-centers.index');
    }
}
