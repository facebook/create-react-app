<?php

namespace App\Http\Controllers;

use App\Modules\Core\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CompanySettingsController extends Controller
{
    private function authorizeAdmin(Request $request): void
    {
        if (! $request->user()->hasAnyRole(['super-admin', 'admin'])) {
            abort(403);
        }
    }

    public function show(Request $request)
    {
        $this->authorizeAdmin($request);

        $tenant = Tenant::findOrFail($request->user()->tenant_id);

        $timezones  = \DateTimeZone::listIdentifiers();
        $currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'SGD',
                       'AED', 'SAR', 'BRL', 'MXN', 'ZAR', 'NOK', 'SEK', 'DKK', 'NZD', 'HKD'];
        $dateFormats = [
            'Y-m-d'   => now()->format('Y-m-d')   . ' (YYYY-MM-DD)',
            'd/m/Y'   => now()->format('d/m/Y')   . ' (DD/MM/YYYY)',
            'm/d/Y'   => now()->format('m/d/Y')   . ' (MM/DD/YYYY)',
            'd-m-Y'   => now()->format('d-m-Y')   . ' (DD-MM-YYYY)',
            'd M Y'   => now()->format('d M Y')   . ' (DD Mon YYYY)',
        ];

        return Inertia::render('Settings/Company', [
            'tenant'      => $tenant->only([
                'id', 'name', 'slug', 'email', 'phone', 'address', 'city',
                'country', 'currency_code', 'timezone', 'date_format', 'logo_path',
            ]),
            'timezones'   => $timezones,
            'currencies'  => $currencies,
            'dateFormats' => $dateFormats,
        ]);
    }

    public function update(Request $request)
    {
        $this->authorizeAdmin($request);

        $tenant = Tenant::findOrFail($request->user()->tenant_id);

        $data = $request->validate([
            'name'          => 'required|string|max:191',
            'email'         => 'nullable|email|max:191',
            'phone'         => 'nullable|string|max:50',
            'address'       => 'nullable|string|max:500',
            'city'          => 'nullable|string|max:100',
            'country'       => 'nullable|string|max:100',
            'currency_code' => 'required|string|size:3',
            'timezone'      => 'required|string|timezone',
            'date_format'   => 'required|string|in:Y-m-d,d/m/Y,m/d/Y,d-m-Y,d M Y',
        ]);

        $tenant->update($data);

        return back()->with('success', 'Company settings saved.');
    }

    public function uploadLogo(Request $request)
    {
        $this->authorizeAdmin($request);

        $request->validate(['logo' => 'required|image|mimes:png,jpg,jpeg,gif,svg|max:1024']);

        $tenant = Tenant::findOrFail($request->user()->tenant_id);

        // Delete old logo if exists
        if ($tenant->logo_path && Storage::disk('public')->exists($tenant->logo_path)) {
            Storage::disk('public')->delete($tenant->logo_path);
        }

        $path = $request->file('logo')->store('logos', 'public');
        $tenant->update(['logo_path' => $path]);

        return back()->with('success', 'Logo uploaded.');
    }
}
