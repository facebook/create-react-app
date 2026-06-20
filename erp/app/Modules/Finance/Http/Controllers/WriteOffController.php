<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\WriteOff;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WriteOffController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', WriteOff::class);
        $writeOffs = WriteOff::where('tenant_id', app('tenant')->id)
            ->latest()
            ->paginate(20);
        return Inertia::render('Finance/WriteOffs/Index', compact('writeOffs'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', WriteOff::class);
        $validated = $request->validate([
            'customer_id'    => 'nullable|exists:contacts,id',
            'invoice_id'     => 'nullable',
            'amount'         => 'required|numeric|min:0.01',
            'currency'       => 'nullable|string|max:3',
            'write_off_date' => 'required|date',
            'reason'         => 'required|string|max:255',
            'notes'          => 'nullable|string',
        ]);
        $validated['tenant_id']  = app('tenant')->id;
        $validated['created_by'] = auth()->id();
        WriteOff::create($validated);
        return back()->with('success', 'Write-off created.');
    }

    public function show(WriteOff $writeOff): Response
    {
        $this->authorize('view', $writeOff);
        return Inertia::render('Finance/WriteOffs/Show', compact('writeOff'));
    }

    public function approve(WriteOff $writeOff): RedirectResponse
    {
        $this->authorize('update', $writeOff);
        $writeOff->approve(auth()->id());
        return back()->with('success', 'Write-off approved.');
    }

    public function reverse(WriteOff $writeOff): RedirectResponse
    {
        $this->authorize('update', $writeOff);
        $writeOff->reverse();
        return back()->with('success', 'Write-off reversed.');
    }

    public function destroy(WriteOff $writeOff): RedirectResponse
    {
        $this->authorize('delete', $writeOff);
        $writeOff->delete();
        return back()->with('success', 'Write-off deleted.');
    }
}
