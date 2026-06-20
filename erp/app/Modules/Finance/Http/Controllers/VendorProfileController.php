<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\VendorProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class VendorProfileController extends Controller
{
    public function show(Contact $contact): Response
    {
        abort_unless(Gate::allows('finance.view'), 403);

        $profile = VendorProfile::firstOrCreate(
            ['contact_id' => $contact->id],
            [
                'tenant_id'          => $contact->tenant_id,
                'payment_terms_days' => 30,
            ]
        );

        $profile->load('contact');

        return Inertia::render('Finance/Vendors/Profile', [
            'contact' => $contact,
            'profile' => array_merge($profile->toArray(), [
                'is_over_credit_limit' => $profile->is_over_credit_limit,
            ]),
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Contacts', 'href' => route('finance.contacts.index')],
                ['label' => $contact->name],
                ['label' => 'Vendor Profile'],
            ],
        ]);
    }

    public function update(Request $request, Contact $contact): RedirectResponse
    {
        abort_unless(Gate::allows('finance.create'), 403);

        $data = $request->validate([
            'credit_limit'         => ['nullable', 'numeric', 'min:0'],
            'payment_terms_days'   => ['required', 'integer', 'min:0', 'max:365'],
            'preferred_currency'   => ['nullable', 'string', 'size:3'],
            'bank_name'            => ['nullable', 'string', 'max:255'],
            'bank_account_number'  => ['nullable', 'string', 'max:100'],
            'bank_routing_number'  => ['nullable', 'string', 'max:100'],
            'notes'                => ['nullable', 'string'],
        ]);

        VendorProfile::updateOrCreate(
            ['contact_id' => $contact->id],
            array_merge($data, ['tenant_id' => $contact->tenant_id])
        );

        return redirect()->back()->with('success', 'Vendor profile updated.');
    }
}
