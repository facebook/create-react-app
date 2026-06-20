<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\VendorEvaluation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class VendorEvaluationController extends Controller
{
    public function index(Contact $contact): Response
    {
        abort_unless(Gate::allows('finance.view'), 403);

        $evaluations = VendorEvaluation::where('contact_id', $contact->id)
            ->with('evaluator')
            ->latest('evaluation_date')
            ->paginate(25);

        return Inertia::render('Finance/Vendors/Evaluations', [
            'contact'     => $contact,
            'evaluations' => $evaluations,
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Contacts', 'href' => route('finance.contacts.index')],
                ['label' => $contact->name],
                ['label' => 'Evaluations'],
            ],
        ]);
    }

    public function store(Request $request, Contact $contact): RedirectResponse
    {
        abort_unless(Gate::allows('finance.create'), 403);

        $data = $request->validate([
            'evaluation_date'      => ['required', 'date'],
            'quality_rating'       => ['required', 'integer', 'min:1', 'max:5'],
            'delivery_rating'      => ['required', 'integer', 'min:1', 'max:5'],
            'price_rating'         => ['required', 'integer', 'min:1', 'max:5'],
            'communication_rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comments'             => ['nullable', 'string'],
        ]);

        $overall = round(
            ($data['quality_rating'] + $data['delivery_rating'] + $data['price_rating'] + $data['communication_rating']) / 4,
            2
        );

        VendorEvaluation::create(array_merge($data, [
            'tenant_id'      => $contact->tenant_id,
            'contact_id'     => $contact->id,
            'evaluated_by'   => auth()->id(),
            'overall_rating' => $overall,
        ]));

        return redirect()->back()->with('success', 'Evaluation added.');
    }

    public function destroy(Contact $contact, VendorEvaluation $evaluation): RedirectResponse
    {
        abort_unless(Gate::allows('finance.delete'), 403);

        $evaluation->delete();

        return redirect()->back()->with('success', 'Evaluation deleted.');
    }
}
