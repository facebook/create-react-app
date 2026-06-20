<?php

namespace App\Modules\Planning\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Planning\Models\Shift;
use App\Modules\Planning\Models\ShiftSwap;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlanningController extends Controller
{
    public function index(Request $request): Response
    {
        $shifts = Shift::with('employee')
            ->when($request->employee_id, fn ($q) => $q->where('employee_id', $request->employee_id))
            ->when($request->week, function ($q) use ($request) {
                $week = Carbon::parse($request->week)->startOfWeek();
                $q->whereBetween('starts_at', [$week, $week->copy()->endOfWeek()]);
            })
            ->orderBy('starts_at')
            ->get();

        $users = User::orderBy('name')->get(['id', 'name', 'email']);

        return Inertia::render('Planning/Index', [
            'shifts'  => $shifts,
            'users'   => $users,
            'filters' => $request->only(['employee_id', 'week']),
        ]);
    }

    public function schedule(Request $request): Response
    {
        $weekStart = $request->week
            ? Carbon::parse($request->week)->startOfWeek()
            : Carbon::now()->startOfWeek();

        $weekEnd = $weekStart->copy()->endOfWeek();

        $shifts = Shift::with('employee')
            ->whereBetween('starts_at', [$weekStart, $weekEnd])
            ->orderBy('starts_at')
            ->get();

        $grouped = $shifts->groupBy('employee_id');

        $users = User::orderBy('name')->get(['id', 'name', 'email']);

        return Inertia::render('Planning/Schedule', [
            'shifts'     => $shifts,
            'grouped'    => $grouped,
            'users'      => $users,
            'weekStart'  => $weekStart->toDateString(),
            'weekEnd'    => $weekEnd->toDateString(),
        ]);
    }

    public function show(Shift $shift): Response
    {
        $shift->load(['employee', 'swaps.requester', 'swaps.target']);

        return Inertia::render('Planning/Show', [
            'shift' => $shift,
            'users' => User::orderBy('name')->get(['id', 'name', 'email']),
        ]);
    }

    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'employee_id'    => 'required|exists:users,id',
            'title'          => 'required|string|max:255',
            'starts_at'      => 'required|date',
            'ends_at'        => 'required|date|after:starts_at',
            'break_minutes'  => 'nullable|integer|min:0',
            'notes'          => 'nullable|string',
        ]);

        $shift = new Shift($validated);

        if ($shift->overlapsWithUserShifts()) {
            return response()->json(['message' => 'Shift overlaps with an existing shift for this employee.'], 422);
        }

        $shift->save();

        return redirect()->route('planning.index')->with('success', 'Shift created.');
    }

    public function update(Request $request, Shift $shift): RedirectResponse
    {
        if ($shift->status !== 'scheduled') {
            return back()->withErrors(['status' => 'Only scheduled shifts can be updated.']);
        }

        $validated = $request->validate([
            'employee_id'   => 'sometimes|exists:users,id',
            'title'         => 'sometimes|string|max:255',
            'starts_at'     => 'sometimes|date',
            'ends_at'       => 'sometimes|date|after:starts_at',
            'break_minutes' => 'nullable|integer|min:0',
            'notes'         => 'nullable|string',
        ]);

        $shift->update($validated);

        return redirect()->route('planning.show', $shift)->with('success', 'Shift updated.');
    }

    public function destroy(Shift $shift): RedirectResponse
    {
        if (!in_array($shift->status, ['scheduled', 'cancelled'])) {
            return back()->withErrors(['status' => 'Only scheduled or cancelled shifts can be deleted.']);
        }

        $shift->delete();

        return redirect()->route('planning.index')->with('success', 'Shift deleted.');
    }

    public function confirm(Shift $shift): RedirectResponse
    {
        $shift->confirm();

        return back()->with('success', 'Shift confirmed.');
    }

    public function complete(Shift $shift): RedirectResponse
    {
        $shift->complete();

        return back()->with('success', 'Shift completed.');
    }

    public function cancel(Shift $shift): RedirectResponse
    {
        $shift->cancel();

        return back()->with('success', 'Shift cancelled.');
    }

    public function requestSwap(Request $request, Shift $shift): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'requested_to' => 'required|exists:users,id',
            'reason'       => 'nullable|string',
        ]);

        if ($validated['requested_to'] == $shift->employee_id) {
            return response()->json(['message' => 'Cannot swap with the same employee.'], 422);
        }

        ShiftSwap::create([
            'shift_id'     => $shift->id,
            'requested_by' => $shift->employee_id,
            'requested_to' => $validated['requested_to'],
            'reason'       => $validated['reason'] ?? null,
        ]);

        return back()->with('success', 'Swap requested.');
    }

    public function approveSwap(Shift $shift, ShiftSwap $swap): RedirectResponse
    {
        $swap->approve();

        return back()->with('success', 'Swap approved.');
    }

    public function rejectSwap(Shift $shift, ShiftSwap $swap): RedirectResponse
    {
        $swap->reject();

        return back()->with('success', 'Swap rejected.');
    }
}
