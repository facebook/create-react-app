<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\JobOfferLetter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JobOfferController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', JobOfferLetter::class);

        $offers = JobOfferLetter::orderByDesc('created_at')->paginate(20);

        return Inertia::render('HR/JobOffers/Index', compact('offers'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', JobOfferLetter::class);

        $data = $request->validate([
            'candidate_name'     => ['required', 'string', 'max:255'],
            'candidate_email'    => ['required', 'email'],
            'position_title'     => ['required', 'string', 'max:255'],
            'offered_salary'     => ['nullable', 'numeric', 'min:0'],
            'proposed_start_date'=> ['nullable', 'date'],
            'offer_expiry_date'  => ['nullable', 'date'],
            'offer_terms'        => ['nullable', 'string'],
        ]);

        JobOfferLetter::create([
            'tenant_id'  => auth()->user()->tenant_id,
            'created_by' => auth()->id(),
            ...$data,
        ]);

        return redirect()->route('hr.job-offers.index')->with('success', 'Job offer letter created.');
    }

    public function show(JobOfferLetter $jobOffer): Response
    {
        $this->authorize('view', $jobOffer);

        return Inertia::render('HR/JobOffers/Show', compact('jobOffer'));
    }

    public function send(JobOfferLetter $jobOffer): RedirectResponse
    {
        $this->authorize('update', $jobOffer);

        $jobOffer->send();

        return back()->with('success', 'Offer letter sent.');
    }

    public function accept(JobOfferLetter $jobOffer): RedirectResponse
    {
        $this->authorize('update', $jobOffer);

        $jobOffer->accept();

        return back()->with('success', 'Offer letter accepted.');
    }

    public function decline(JobOfferLetter $jobOffer): RedirectResponse
    {
        $this->authorize('update', $jobOffer);

        $jobOffer->decline();

        return back()->with('success', 'Offer letter declined.');
    }

    public function destroy(JobOfferLetter $jobOffer): RedirectResponse
    {
        $this->authorize('delete', $jobOffer);

        $jobOffer->delete();

        return back()->with('success', 'Offer letter deleted.');
    }
}
