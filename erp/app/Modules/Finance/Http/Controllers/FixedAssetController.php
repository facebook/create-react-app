<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Http\Requests\StoreFixedAssetRequest;
use App\Modules\Finance\Models\Account;
use App\Modules\Finance\Models\FixedAsset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FixedAssetController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', FixedAsset::class);

        $assets = FixedAsset::orderBy('name')
            ->get()
            ->map(fn ($a) => [
                'id'                       => $a->id,
                'code'                     => $a->code,
                'name'                     => $a->name,
                'category'                 => $a->category,
                'purchase_cost'            => $a->purchase_cost,
                'accumulated_depreciation' => $a->accumulated_depreciation,
                'net_book_value'           => $a->net_book_value,
                'status'                   => $a->status,
            ]);

        return Inertia::render('Finance/FixedAssets/Index', [
            'assets' => $assets,
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Fixed Assets'],
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', FixedAsset::class);

        $assetAccounts = Account::where('type', 'asset')
            ->where('is_active', true)
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        $expenseAccounts = Account::where('type', 'expense')
            ->where('is_active', true)
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        return Inertia::render('Finance/FixedAssets/Create', [
            'assetAccounts'   => $assetAccounts,
            'expenseAccounts' => $expenseAccounts,
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Fixed Assets', 'href' => '/finance/fixed-assets'],
                ['label' => 'New Asset'],
            ],
        ]);
    }

    public function store(StoreFixedAssetRequest $request): RedirectResponse
    {
        $this->authorize('create', FixedAsset::class);

        $asset = FixedAsset::create(array_merge(
            $request->validated(),
            [
                'tenant_id'  => $request->user()->tenant_id,
                'created_by' => $request->user()->id,
            ]
        ));

        $asset->code = 'FA-' . str_pad($asset->id, 5, '0', STR_PAD_LEFT);
        $asset->save();

        return redirect()->route('finance.fixed-assets.show', $asset)
            ->with('success', 'Fixed asset created successfully.');
    }

    public function show(FixedAsset $fixedAsset): Response
    {
        $this->authorize('view', $fixedAsset);

        $entries = $fixedAsset->depreciationEntries()
            ->orderByDesc('period_date')
            ->get()
            ->map(fn ($e) => [
                'id'               => $e->id,
                'period_date'      => $e->period_date->toDateString(),
                'amount'           => (float) $e->amount,
                'journal_entry_id' => $e->journal_entry_id,
            ]);

        return Inertia::render('Finance/FixedAssets/Show', [
            'asset' => [
                'id'                       => $fixedAsset->id,
                'code'                     => $fixedAsset->code,
                'name'                     => $fixedAsset->name,
                'category'                 => $fixedAsset->category,
                'description'              => $fixedAsset->description,
                'purchase_date'            => $fixedAsset->purchase_date->toDateString(),
                'purchase_cost'            => $fixedAsset->purchase_cost,
                'salvage_value'            => $fixedAsset->salvage_value,
                'useful_life_years'        => $fixedAsset->useful_life_years,
                'accumulated_depreciation' => $fixedAsset->accumulated_depreciation,
                'net_book_value'           => $fixedAsset->net_book_value,
                'annual_depreciation'      => $fixedAsset->annual_depreciation,
                'status'                   => $fixedAsset->status,
                'disposal_date'            => $fixedAsset->disposal_date?->toDateString(),
                'disposal_proceeds'        => $fixedAsset->disposal_proceeds,
                'asset_account_id'         => $fixedAsset->asset_account_id,
                'depreciation_account_id'  => $fixedAsset->depreciation_account_id,
            ],
            'entries' => $entries,
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Fixed Assets', 'href' => '/finance/fixed-assets'],
                ['label' => $fixedAsset->name],
            ],
        ]);
    }

    public function depreciate(Request $request, FixedAsset $fixedAsset): RedirectResponse
    {
        $this->authorize('update', $fixedAsset);

        $validated = $request->validate([
            'period_date' => ['required', 'date'],
        ]);

        try {
            $fixedAsset->runDepreciation($validated['period_date']);
        } catch (\DomainException $e) {
            return back()->withErrors(['period_date' => $e->getMessage()]);
        }

        return redirect()->route('finance.fixed-assets.show', $fixedAsset)
            ->with('success', 'Depreciation recorded successfully.');
    }

    public function dispose(Request $request, FixedAsset $fixedAsset): RedirectResponse
    {
        $this->authorize('update', $fixedAsset);

        $validated = $request->validate([
            'disposal_date'     => ['required', 'date'],
            'disposal_proceeds' => ['nullable', 'numeric', 'min:0'],
        ]);

        $fixedAsset->status            = 'disposed';
        $fixedAsset->disposal_date     = $validated['disposal_date'];
        $fixedAsset->disposal_proceeds = $validated['disposal_proceeds'] ?? null;
        $fixedAsset->save();

        return redirect()->route('finance.fixed-assets.show', $fixedAsset)
            ->with('success', 'Asset disposed successfully.');
    }

    public function destroy(FixedAsset $fixedAsset): RedirectResponse
    {
        $this->authorize('delete', $fixedAsset);

        $fixedAsset->delete();

        return redirect()->route('finance.fixed-assets.index')
            ->with('success', 'Fixed asset deleted.');
    }
}
