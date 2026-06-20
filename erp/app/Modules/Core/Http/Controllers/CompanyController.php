<?php

namespace App\Modules\Core\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Core\Models\Company;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CompanyController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', Company::class);

        $companies = Company::with('parent')
            ->withCount('subsidiaries')
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Core/Companies/Index', [
            'companies' => $companies,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Company::class);

        $parents = Company::select('id', 'name', 'code')->get();

        return Inertia::render('Core/Companies/Create', [
            'parents' => $parents,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Company::class);

        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'code'              => 'nullable|string|max:20',
            'tax_id'            => 'nullable|string|max:100',
            'currency_code'     => 'nullable|string|size:3',
            'fiscal_year_start' => 'nullable|integer|min:1|max:12',
            'address'           => 'nullable|string',
            'phone'             => 'nullable|string|max:50',
            'email'             => 'nullable|email|max:255',
            'website'           => 'nullable|string|max:255',
            'industry'          => 'nullable|string|max:100',
            'is_active'         => 'boolean',
            'parent_company_id' => 'nullable|exists:companies,id',
        ]);

        $validated['created_by'] = auth()->id();

        Company::create($validated);

        return redirect()->route('core.companies.index')
            ->with('success', 'Company created successfully.');
    }

    public function show(Company $company): Response
    {
        $this->authorize('view', $company);

        $company->load(['parent', 'subsidiaries', 'users']);

        return Inertia::render('Core/Companies/Show', [
            'company' => $company,
        ]);
    }

    public function edit(Company $company): Response
    {
        $this->authorize('update', $company);

        $parents = Company::select('id', 'name', 'code')
            ->where('id', '!=', $company->id)
            ->get();

        return Inertia::render('Core/Companies/Edit', [
            'company' => $company,
            'parents' => $parents,
        ]);
    }

    public function update(Request $request, Company $company): RedirectResponse
    {
        $this->authorize('update', $company);

        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'code'              => 'nullable|string|max:20',
            'tax_id'            => 'nullable|string|max:100',
            'currency_code'     => 'nullable|string|size:3',
            'fiscal_year_start' => 'nullable|integer|min:1|max:12',
            'address'           => 'nullable|string',
            'phone'             => 'nullable|string|max:50',
            'email'             => 'nullable|email|max:255',
            'website'           => 'nullable|string|max:255',
            'industry'          => 'nullable|string|max:100',
            'is_active'         => 'boolean',
            'parent_company_id' => 'nullable|exists:companies,id',
        ]);

        $company->update($validated);

        return redirect()->route('core.companies.show', $company)
            ->with('success', 'Company updated successfully.');
    }

    public function destroy(Company $company): RedirectResponse
    {
        $this->authorize('delete', $company);

        $company->delete();

        return redirect()->route('core.companies.index')
            ->with('success', 'Company deleted successfully.');
    }
}
