<?php

namespace App\Modules\Ecommerce\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Ecommerce\Models\StoreSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StoreSettingsController extends Controller
{
    public function show(): Response
    {
        $tenantId = auth()->user()->tenant_id;

        $settings = StoreSettings::firstOrCreate(
            ['tenant_id' => $tenantId],
            [
                'store_name'           => 'My Store',
                'store_slug'           => 'my-store-' . $tenantId,
                'currency_code'        => 'USD',
                'is_active'            => true,
                'primary_color'        => '#4f46e5',
                'allow_guest_checkout' => true,
            ]
        );

        return Inertia::render('Ecommerce/Settings', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $tenantId = auth()->user()->tenant_id;

        $data = $request->validate([
            'store_name'           => 'required|string|max:255',
            'store_slug'           => 'required|string|max:255|alpha_dash',
            'description'          => 'nullable|string',
            'currency_code'        => 'required|string|size:3',
            'is_active'            => 'boolean',
            'logo_path'            => 'nullable|string|max:255',
            'primary_color'        => 'nullable|string|max:7',
            'allow_guest_checkout' => 'boolean',
        ]);

        $settings = StoreSettings::where('tenant_id', $tenantId)->firstOrFail();
        $settings->update($data);

        return redirect()->back()->with('success', 'Store settings updated.');
    }
}
