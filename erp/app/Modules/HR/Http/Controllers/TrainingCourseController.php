<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\TrainingCourse;
use App\Modules\HR\Models\TrainingEnrollment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TrainingCourseController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', TrainingCourse::class);

        $courses = TrainingCourse::withCount('enrollments')
            ->orderBy('title')
            ->paginate(20);

        return Inertia::render('HR/TrainingCourses/Index', compact('courses'));
    }

    public function create(): Response
    {
        $this->authorize('create', TrainingCourse::class);

        return Inertia::render('HR/TrainingCourses/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', TrainingCourse::class);

        $data = $request->validate([
            'title'          => 'required|string|max:255',
            'category'       => 'nullable|string|max:255',
            'provider'       => 'nullable|string|max:255',
            'type'           => 'nullable|in:internal,external,online,certification',
            'duration_hours' => 'nullable|integer|min:0',
            'cost'           => 'nullable|numeric|min:0',
            'description'    => 'nullable|string',
            'is_mandatory'   => 'boolean',
            'is_active'      => 'boolean',
        ]);

        $course = TrainingCourse::create([
            'tenant_id' => auth()->user()->tenant_id,
            ...$data,
        ]);

        return redirect()->route('hr.training-courses.show', $course)
            ->with('success', 'Training course created.');
    }

    public function show(TrainingCourse $trainingCourse): Response
    {
        $this->authorize('view', $trainingCourse);

        $trainingCourse->load(['enrollments.employee']);

        return Inertia::render('HR/TrainingCourses/Show', [
            'course' => $trainingCourse,
        ]);
    }

    public function destroy(TrainingCourse $trainingCourse): RedirectResponse
    {
        $this->authorize('delete', $trainingCourse);

        $trainingCourse->delete();

        return redirect()->route('hr.training-courses.index')
            ->with('success', 'Training course deleted.');
    }

    public function enroll(Request $request, TrainingCourse $trainingCourse): RedirectResponse
    {
        $this->authorize('create', TrainingCourse::class);

        $data = $request->validate([
            'employee_id'    => 'required|exists:employees,id',
            'scheduled_date' => 'nullable|date',
        ]);

        TrainingEnrollment::create([
            'tenant_id'          => auth()->user()->tenant_id,
            'training_course_id' => $trainingCourse->id,
            'employee_id'        => $data['employee_id'],
            'enrolled_date'      => now()->toDateString(),
            'scheduled_date'     => $data['scheduled_date'] ?? null,
            'status'             => 'enrolled',
            'enrolled_by'        => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Employee enrolled.');
    }
}
