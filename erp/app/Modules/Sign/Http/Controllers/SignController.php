<?php

namespace App\Modules\Sign\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Sign\Models\SignRequest;
use App\Modules\Sign\Models\SignRequestSigner;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SignController extends Controller
{
    public function index(Request $request): Response
    {
        $signRequests = SignRequest::when($request->status, fn ($q) => $q->where('status', $request->status))
            ->with(['signers', 'creator'])
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Sign/Index', [
            'signRequests' => $signRequests,
            'filters'      => $request->only(['status']),
        ]);
    }

    public function show(SignRequest $signRequest): Response
    {
        $signRequest->load(['signers', 'creator']);

        return Inertia::render('Sign/Show', [
            'signRequest' => $signRequest,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title'         => 'required|string|max:255',
            'document_path' => 'required|string|max:255',
            'document_name' => 'required|string|max:255',
            'message'       => 'nullable|string',
            'signers'       => 'nullable|array',
            'signers.*.name'     => 'required_with:signers|string|max:255',
            'signers.*.email'    => 'required_with:signers|email|max:255',
            'signers.*.sequence' => 'nullable|integer',
        ]);

        $signRequest = SignRequest::create([
            'title'         => $validated['title'],
            'document_path' => $validated['document_path'],
            'document_name' => $validated['document_name'],
            'message'       => $validated['message'] ?? null,
            'tenant_id'     => auth()->user()->tenant_id,
            'created_by'    => auth()->id(),
            'status'        => 'draft',
        ]);

        foreach ($validated['signers'] ?? [] as $signerData) {
            $signer = new SignRequestSigner([
                'sign_request_id' => $signRequest->id,
                'tenant_id'       => $signRequest->tenant_id,
                'signer_name'     => $signerData['name'],
                'signer_email'    => $signerData['email'],
                'sequence'        => $signerData['sequence'] ?? 0,
                'status'          => 'pending',
            ]);
            $signer->token = $signer->generateToken();
            $signer->save();
        }

        return redirect()->route('sign.show', $signRequest)->with('success', 'Sign request created.');
    }

    public function destroy(SignRequest $signRequest): RedirectResponse
    {
        abort_if(
            ! in_array($signRequest->status, ['draft', 'cancelled']),
            403,
            'Only draft or cancelled requests can be deleted.'
        );

        $signRequest->delete();

        return redirect()->route('sign.index')->with('success', 'Sign request deleted.');
    }

    public function send(SignRequest $signRequest): RedirectResponse
    {
        $signRequest->send();

        return redirect()->back()->with('success', 'Sign request sent.');
    }

    public function cancel(SignRequest $signRequest): RedirectResponse
    {
        $signRequest->cancel();

        return redirect()->back()->with('success', 'Sign request cancelled.');
    }

    public function addSigner(Request $request, SignRequest $signRequest): RedirectResponse
    {
        abort_if($signRequest->status !== 'draft', 403, 'Signers can only be added to draft requests.');

        $validated = $request->validate([
            'signer_name'  => 'required|string|max:255',
            'signer_email' => 'required|email|max:255',
            'sequence'     => 'nullable|integer',
        ]);

        $signer = new SignRequestSigner([
            'sign_request_id' => $signRequest->id,
            'tenant_id'       => $signRequest->tenant_id,
            'signer_name'     => $validated['signer_name'],
            'signer_email'    => $validated['signer_email'],
            'sequence'        => $validated['sequence'] ?? 0,
            'status'          => 'pending',
        ]);
        $signer->token = $signer->generateToken();
        $signer->save();

        return redirect()->back()->with('success', 'Signer added.');
    }

    public function removeSigner(SignRequest $signRequest, SignRequestSigner $signer): RedirectResponse
    {
        abort_if($signRequest->status !== 'draft', 403, 'Signers can only be removed from draft requests.');

        $signer->delete();

        return redirect()->back()->with('success', 'Signer removed.');
    }

    public function sign(SignRequest $signRequest, SignRequestSigner $signer): RedirectResponse
    {
        $signer->sign();

        return redirect()->back()->with('success', 'Signed successfully.');
    }

    public function decline(SignRequest $signRequest, SignRequestSigner $signer): RedirectResponse
    {
        $signer->decline();

        return redirect()->back()->with('success', 'Declined.');
    }
}
