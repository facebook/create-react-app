<?php

namespace App\Modules\Core\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Core\Models\SsoProvider;
use App\Modules\Core\Models\Tenant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SsoController extends Controller
{
    // Show SSO configuration page (admin only)
    public function configure(): \Inertia\Response
    {
        $providers = SsoProvider::withoutGlobalScopes()
            ->where('tenant_id', app('tenant')->id)
            ->get();

        return Inertia::render('Settings/Sso', ['providers' => $providers]);
    }

    // Create/update an SSO provider
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'provider_type'     => 'required|in:saml,oauth2,oidc',
            'is_active'         => 'boolean',
            'entity_id'         => 'nullable|string|max:500',
            'sso_url'           => 'nullable|url|max:500',
            'slo_url'           => 'nullable|url|max:500',
            'idp_certificate'   => 'nullable|string',
            'client_id'         => 'nullable|string|max:500',
            'client_secret'     => 'nullable|string|max:500',
            'authorization_url' => 'nullable|url|max:500',
            'token_url'         => 'nullable|url|max:500',
            'userinfo_url'      => 'nullable|url|max:500',
            'email_attribute'   => 'nullable|string|max:100',
            'name_attribute'    => 'nullable|string|max:100',
            'metadata_url'      => 'nullable|url|max:500',
        ]);

        SsoProvider::create(['tenant_id' => app('tenant')->id] + $validated);

        return redirect()->route('sso.configure')->with('success', 'SSO provider saved.');
    }

    public function update(Request $request, SsoProvider $provider): RedirectResponse
    {
        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'provider_type'     => 'required|in:saml,oauth2,oidc',
            'is_active'         => 'boolean',
            'entity_id'         => 'nullable|string|max:500',
            'sso_url'           => 'nullable|url|max:500',
            'slo_url'           => 'nullable|url|max:500',
            'idp_certificate'   => 'nullable|string',
            'client_id'         => 'nullable|string|max:500',
            'client_secret'     => 'nullable|string|max:500',
            'authorization_url' => 'nullable|url|max:500',
            'token_url'         => 'nullable|url|max:500',
            'userinfo_url'      => 'nullable|url|max:500',
            'email_attribute'   => 'nullable|string|max:100',
            'name_attribute'    => 'nullable|string|max:100',
            'metadata_url'      => 'nullable|url|max:500',
        ]);

        $provider->update($validated);

        return redirect()->route('sso.configure')->with('success', 'SSO provider updated.');
    }

    public function destroy(SsoProvider $provider): RedirectResponse
    {
        $provider->delete();

        return redirect()->route('sso.configure')->with('success', 'SSO provider deleted.');
    }

    // Initiate SAML SSO — redirect to IdP
    public function initiate(SsoProvider $provider): \Symfony\Component\HttpFoundation\Response
    {
        if (!$provider->is_active || $provider->provider_type !== 'saml') {
            abort(400, 'This SSO provider is not active or is not a SAML provider.');
        }

        $authnRequest = $provider->buildAuthnRequest();
        $encoded      = base64_encode($authnRequest);
        $redirectUrl  = $provider->sso_url . '?SAMLRequest=' . urlencode($encoded);

        return redirect($redirectUrl);
    }

    // SAML Assertion Consumer Service — receive IdP response
    public function acs(Request $request, SsoProvider $provider): RedirectResponse
    {
        if (!$provider->is_active) {
            abort(400, 'SSO provider is not active.');
        }

        $samlResponse = $request->input('SAMLResponse');
        if (!$samlResponse) {
            return redirect('/login')->withErrors(['sso' => 'No SAML response received.']);
        }

        try {
            $attributes = $provider->parseSamlResponse($samlResponse);
        } catch (\Throwable $e) {
            return redirect('/login')->withErrors(['sso' => 'SSO authentication failed: ' . $e->getMessage()]);
        }

        // Find or create user
        $user = User::firstOrCreate(
            ['email' => $attributes['email']],
            [
                'name'      => $attributes['name'],
                'tenant_id' => $provider->tenant_id,
                'password'  => bcrypt(Str::random(32)),
            ]
        );

        Auth::login($user, remember: true);

        return redirect('/dashboard');
    }

    // SP Metadata XML
    public function metadata(SsoProvider $provider): Response
    {
        $entityId = htmlspecialchars($provider->getSpEntityId());
        $acsUrl   = htmlspecialchars($provider->getAcsUrl());

        $xml = <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="{$entityId}">
  <md:SPSSODescriptor AuthnRequestsSigned="false" WantAssertionsSigned="true"
      protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
        Location="{$acsUrl}" index="1"/>
  </md:SPSSODescriptor>
</md:EntityDescriptor>
XML;

        return response($xml, 200, ['Content-Type' => 'application/xml']);
    }
}
