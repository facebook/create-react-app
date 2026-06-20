<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\TrainingEnrollment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TrainingEnrollmentController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', TrainingEnrollment::class);

        $query = TrainingEnrollment::with(['employee', 'course']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        $enrollments = $query->latest()->paginate(20);

        return Inertia::render('HR/TrainingEnrollments/Index', compact('enrollments'));
    }

    public function show(TrainingEnrollment $trainingEnrollment): Response
    {
        $this->authorize('view', $trainingEnrollment);

        $trainingEnrollment->load(['employee', 'course']);

        return Inertia::render('HR/TrainingEnrollments/Show', [
            'enrollment' => $trainingEnrollment,
        ]);
    }

    public function complete(Request $request, TrainingEnrollment $trainingEnrollment): RedirectResponse
    {
        $this->authorize('update', $trainingEnrollment);

        $data = $request->validate([
            'score' => 'nullable|numeric|min:0|max:100',
            'notes' => 'nullable|string',
        ]);

        $trainingEnrollment->complete(
            isset($data['score']) ? (float) $data['score'] : null,
            $data['notes'] ?? null
        );

        return redirect()->back()->with('success', 'Enrollment marked as completed.');
    }

    public function fail(Request $request, TrainingEnrollment $trainingEnrollment): RedirectResponse
    {
        $this->authorize('update', $trainingEnrollment);

        $data = $request->validate([
            'notes' => 'nullable|string',
        ]);

        $trainingEnrollment->fail($data['notes'] ?? null);

        return redirect()->back()->with('success', 'Enrollment marked as failed.');
    }
}
