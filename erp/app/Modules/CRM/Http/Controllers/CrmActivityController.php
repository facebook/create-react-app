<?php

namespace App\Modules\CRM\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\CRM\Models\CrmActivity;
use App\Modules\CRM\Models\CrmLead;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CrmActivityController extends Controller
{
    public function store(Request $request, CrmLead $lead): RedirectResponse
    {
        $validated = $request->validate([
            'type'         => 'required|in:call,meeting,email,task,note',
            'subject'      => 'required|string|max:255',
            'description'  => 'nullable|string',
            'scheduled_at' => 'nullable|date',
            'assigned_to'  => 'nullable|exists:users,id',
        ]);

        $lead->activities()->create([
            ...$validated,
            'tenant_id'  => auth()->user()->tenant_id,
            'created_by' => auth()->id(),
        ]);

        return back()->with('success', 'Activity added.');
    }

    public function markDone(CrmActivity $activity): RedirectResponse
    {
        $activity->markDone();

        return back()->with('success', 'Activity marked as done.');
    }

    public function destroy(CrmActivity $activity): RedirectResponse
    {
        $activity->delete();

        return back()->with('success', 'Activity deleted.');
    }
}
