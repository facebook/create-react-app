<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\EmployeeTrainingRecord;
use App\Modules\HR\Models\TrainingCourse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeTrainingRecordController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', EmployeeTrainingRecord::class);

        $records = EmployeeTrainingRecord::with(['employee', 'trainingCourse'])
            ->orderByDesc('completed_date')
            ->paginate(25);

        return Inertia::render('HR/TrainingRecords/Index', compact('records'));
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', EmployeeTrainingRecord::class);

        $employees = Employee::where('status', 'active')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name']);

        $courses = TrainingCourse::where('is_active', true)
            ->orderBy('title')
            ->get(['id', 'title']);

        $employeeId = $request->get('employee_id');
        $courseId   = $request->get('training_course_id');

        return Inertia::render('HR/TrainingRecords/Create', compact('employees', 'courses', 'employeeId', 'courseId'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', EmployeeTrainingRecord::class);

        $data = $request->validate([
            'employee_id'        => 'required|exists:employees,id',
            'training_course_id' => 'nullable|exists:training_courses,id',
            'course_title'       => 'required|string|max:255',
            'completed_date'     => 'required|date',
            'expiry_date'        => 'nullable|date|after_or_equal:completed_date',
            'score'              => 'nullable|numeric|min:0',
            'passed'             => 'boolean',
            'certificate_number' => 'nullable|string|max:255',
            'notes'              => 'nullable|string',
        ]);

        // Snapshot course_title from selected course if not provided or if course is selected
        if (!empty($data['training_course_id'])) {
            $course = TrainingCourse::find($data['training_course_id']);
            if ($course) {
                $data['course_title'] = $course->title;
            }
        }

        $record = EmployeeTrainingRecord::create([
            'tenant_id' => auth()->user()->tenant_id,
            ...$data,
        ]);

        return redirect()->route('hr.training-records.show', $record)
            ->with('success', 'Training record created.');
    }

    public function show(EmployeeTrainingRecord $trainingRecord): Response
    {
        $this->authorize('view', $trainingRecord);

        $trainingRecord->load(['employee', 'trainingCourse']);

        return Inertia::render('HR/TrainingRecords/Show', compact('trainingRecord'));
    }

    public function destroy(EmployeeTrainingRecord $trainingRecord): RedirectResponse
    {
        $this->authorize('delete', $trainingRecord);

        $trainingRecord->delete();

        return redirect()->route('hr.training-records.index')
            ->with('success', 'Training record deleted.');
    }
}
