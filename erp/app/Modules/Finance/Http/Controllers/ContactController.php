<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Http\Requests\StoreContactRequest;
use App\Modules\Finance\Http\Resources\ContactResource;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\PriceList;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Contact::class);

        $contacts = Contact::when($request->search, fn ($q) => $q->search($request->search))
            ->when($request->type, fn ($q) => $q->where('type', $request->type))
            ->orderBy('name')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Finance/Contacts/Index', [
            'contacts'    => ContactResource::collection($contacts),
            'filters'     => $request->only(['search', 'type']),
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Contacts', 'href' => route('finance.contacts.index')],
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Contact::class);

        return Inertia::render('Finance/Contacts/Create', [
            'priceLists'  => PriceList::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Contacts', 'href' => route('finance.contacts.index')],
                ['label' => 'New Contact'],
            ],
        ]);
    }

    public function store(StoreContactRequest $request): RedirectResponse
    {
        $this->authorize('create', Contact::class);

        Contact::create([...$request->validated(), 'tenant_id' => auth()->user()->tenant_id]);

        return redirect()->route('finance.contacts.index')
            ->with('success', 'Contact created.');
    }

    public function edit(Contact $contact): Response
    {
        $this->authorize('update', $contact);

        return Inertia::render('Finance/Contacts/Edit', [
            'contact'     => new ContactResource($contact),
            'priceLists'  => PriceList::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Contacts', 'href' => route('finance.contacts.index')],
                ['label' => $contact->name . ' — Edit'],
            ],
        ]);
    }

    public function update(StoreContactRequest $request, Contact $contact): RedirectResponse
    {
        $this->authorize('update', $contact);

        $contact->update($request->validated());

        return redirect()->route('finance.contacts.index')
            ->with('success', 'Contact updated.');
    }

    public function destroy(Contact $contact): RedirectResponse
    {
        $this->authorize('delete', $contact);

        $contact->delete();

        return redirect()->route('finance.contacts.index')
            ->with('success', 'Contact deleted.');
    }
}
