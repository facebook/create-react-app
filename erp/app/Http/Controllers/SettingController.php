<?php

namespace App\Http\Controllers;

use App\Modules\Core\Models\TenantSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    private const KEYS = ['company_name', 'currency', 'timezone', 'fiscal_year_start'];

    private const DEFAULTS = [
        'company_name'      => '',
        'currency'          => 'USD',
        'timezone'          => 'UTC',
        'fiscal_year_start' => '01-01',
    ];

    public function edit(): Response
    {
        if (! auth()->user()->hasAnyRole(['super-admin', 'admin'])) {
            abort(403);
        }

        $tenantId = auth()->user()->tenant_id;
        $settings = collect(self::KEYS)->mapWithKeys(fn ($key) => [
            $key => TenantSetting::getValue($tenantId, $key, self::DEFAULTS[$key]),
        ])->all();

        return Inertia::render('Settings/Index', [
            'settings'    => $settings,
            'breadcrumbs' => [['label' => 'Settings', 'href' => route('settings.edit')]],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        if (! auth()->user()->hasAnyRole(['super-admin', 'admin'])) {
            abort(403);
        }

        $data = $request->validate([
            'company_name'      => ['required', 'string', 'max:255'],
            'currency'          => ['required', 'string', 'size:3'],
            'timezone'          => ['required', 'string', 'max:64'],
            'fiscal_year_start' => ['required', 'regex:/^\d{2}-\d{2}$/'],
        ]);

        $tenantId = auth()->user()->tenant_id;
        foreach ($data as $key => $value) {
            TenantSetting::setValue($tenantId, $key, $value);
        }

        return back()->with('success', 'Settings saved.');
    }
}
