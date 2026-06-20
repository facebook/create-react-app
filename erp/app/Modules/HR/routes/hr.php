<?php

use App\Modules\HR\Http\Controllers\HRDashboardController;

use App\Modules\HR\Http\Controllers\AttendanceController;
use App\Modules\HR\Http\Controllers\DisciplinaryCaseController;
use App\Modules\HR\Http\Controllers\GrievanceController;
use App\Modules\HR\Http\Controllers\DepartmentController;
use App\Modules\HR\Http\Controllers\EmployeeController;
use App\Modules\HR\Http\Controllers\EmployeeLoanController;
use App\Modules\HR\Http\Controllers\EmployeeOnboardingController;
use App\Modules\HR\Http\Controllers\EmployeeOnboardingTrackingController;
use App\Modules\HR\Http\Controllers\EmployeeTrainingRecordController;
use App\Modules\HR\Http\Controllers\ExpenseClaimController;
use App\Modules\HR\Http\Controllers\JobApplicationController;
use App\Modules\HR\Http\Controllers\JobPositionController;
use App\Modules\HR\Http\Controllers\LeaveBalanceController;
use App\Modules\HR\Http\Controllers\LeaveRequestController;
use App\Modules\HR\Http\Controllers\LeaveTypeController;
use App\Modules\HR\Http\Controllers\OnboardingChecklistController;
use App\Modules\HR\Http\Controllers\OnboardingTemplateController;
use App\Modules\HR\Http\Controllers\PayrollController;
use App\Modules\HR\Http\Controllers\PayrollRunController;
use App\Modules\HR\Http\Controllers\PayslipController;
use App\Modules\HR\Http\Controllers\PerformanceReviewController;
use App\Modules\HR\Http\Controllers\TrainingCourseController;
use App\Modules\HR\Http\Controllers\TrainingEnrollmentController;
use App\Modules\HR\Http\Controllers\EmployeeCertificationController;
use App\Modules\HR\Http\Controllers\ShiftAssignmentController;
use App\Modules\HR\Http\Controllers\ShiftTemplateController;
use App\Modules\HR\Http\Controllers\WorkScheduleController;
use App\Modules\HR\Models\ExpenseClaimItem;
use Illuminate\Support\Facades\Route;


Route::middleware(['web','auth','verified'])->prefix('hr')->name('hr.')->group(function() {
    Route::get('dashboard', [HRDashboardController::class, 'index'])->name('dashboard');
});

Route::middleware(['web', 'auth', 'verified'])->prefix('hr')->name('hr.')->group(function () {

    // Departments — full CRUD
    Route::resource('departments', DepartmentController::class);

    // Employees
    Route::post('employees/{employee}/terminate', [EmployeeController::class, 'terminate'])
        ->name('employees.terminate');
    Route::resource('employees', EmployeeController::class)->names([
        'index'   => 'employees.index',
        'create'  => 'employees.create',
        'store'   => 'employees.store',
        'show'    => 'employees.show',
        'edit'    => 'employees.edit',
        'update'  => 'employees.update',
        'destroy' => 'employees.destroy',
    ]);

    // Leave Types
    Route::resource('leave-types', LeaveTypeController::class)->except(['show', 'create', 'edit']);

    // Leave Requests (new spec-compliant routes)
    Route::post('leave-requests/{leaveRequest}/approve', [LeaveRequestController::class, 'approve'])
        ->name('leave-requests.approve');
    Route::post('leave-requests/{leaveRequest}/reject', [LeaveRequestController::class, 'reject'])
        ->name('leave-requests.reject');
    Route::post('leave-requests/{leaveRequest}/cancel', [LeaveRequestController::class, 'cancel'])
        ->name('leave-requests.cancel');
    Route::resource('leave-requests', LeaveRequestController::class)->except(['edit', 'update']);

    // Leave Balances
    Route::resource('leave-balances', LeaveBalanceController::class)->only(['index', 'update']);

    // Legacy leave routes (for backward compat with existing tests)
    Route::get('leave', [LeaveRequestController::class, 'legacyIndex'])->name('leave.index');
    Route::post('leave', [LeaveRequestController::class, 'legacyStore'])->name('leave.store');
    Route::patch('leave/{leaveRequest}/approve', [LeaveRequestController::class, 'approve'])
        ->name('leave.approve');
    Route::patch('leave/{leaveRequest}/reject', [LeaveRequestController::class, 'reject'])
        ->name('leave.reject');

    // Payroll Runs (new spec-compliant routes)
    Route::post('payroll-runs/{payrollRun}/process', [PayrollRunController::class, 'process'])
        ->name('payroll-runs.process');
    Route::resource('payroll-runs', PayrollRunController::class)->except(['edit', 'update']);

    // Payslips — PDF download
    Route::get('payslips/{payslip}/pdf',            [PayslipController::class, 'pdf'])->name('payslips.pdf');
    Route::get('payroll-runs/{payrollRun}/payslips', [PayslipController::class, 'index'])->name('payroll-runs.payslips.index');
    Route::get('payslips/{payslip}',                [PayslipController::class, 'show'])->name('payslips.show');

    // Payroll — custom actions BEFORE resource
    Route::post('payroll/{payrollRun}/generate',   [PayrollController::class, 'generate'])->name('payroll.generate');
    Route::post('payroll/{payrollRun}/approve',    [PayrollController::class, 'approve'])->name('payroll.approve');
    Route::post('payroll/{payrollRun}/mark-paid',  [PayrollController::class, 'markPaid'])->name('payroll.mark-paid');
    Route::patch('payroll/{payrollRun}/process',   [PayrollController::class, 'process'])->name('payroll.process');
    Route::resource('payroll', PayrollController::class)->except(['edit', 'update']);

    // Onboarding Templates
    Route::resource('onboarding-templates', OnboardingTemplateController::class)->except(['edit', 'update']);

    // Employee Onboardings (nested under employees)
    Route::prefix('employees/{employee}')->name('employees.')->group(function () {
        Route::resource('onboardings', EmployeeOnboardingController::class)->except(['edit', 'update']);
        Route::post('onboardings/{onboarding}/complete', [EmployeeOnboardingController::class, 'complete'])->name('onboardings.complete');
        Route::post('onboardings/{onboarding}/tasks/{task}/complete', [EmployeeOnboardingController::class, 'completeTask'])->name('onboardings.tasks.complete');
        Route::post('onboardings/{onboarding}/tasks/{task}/uncomplete', [EmployeeOnboardingController::class, 'uncompleteTask'])->name('onboardings.tasks.uncomplete');
    });

    // Performance Reviews
    Route::post('performance-reviews/{performanceReview}/submit',        [PerformanceReviewController::class, 'submit'])->name('performance-reviews.submit');
    Route::post('performance-reviews/{performanceReview}/acknowledge',   [PerformanceReviewController::class, 'acknowledge'])->name('performance-reviews.acknowledge');
    Route::post('performance-reviews/{performanceReview}/kpis',          [PerformanceReviewController::class, 'addKpi'])->name('performance-reviews.kpis.add');
    Route::patch('performance-reviews/{performanceReview}/kpis/{kpi}',   [PerformanceReviewController::class, 'updateKpi'])->name('performance-reviews.kpis.update');
    Route::delete('performance-reviews/{performanceReview}/kpis/{kpi}',  [PerformanceReviewController::class, 'removeKpi'])->name('performance-reviews.kpis.remove');
    Route::resource('performance-reviews', PerformanceReviewController::class)->except(['edit', 'update']);

    // Expense Claims — custom actions BEFORE resource
    Route::post('expense-claims/{expenseClaim}/submit',     [ExpenseClaimController::class, 'submit'])->name('expense-claims.submit');
    Route::post('expense-claims/{expenseClaim}/approve',    [ExpenseClaimController::class, 'approve'])->name('expense-claims.approve');
    Route::post('expense-claims/{expenseClaim}/reject',     [ExpenseClaimController::class, 'reject'])->name('expense-claims.reject');
    Route::post('expense-claims/{expenseClaim}/mark-paid',  [ExpenseClaimController::class, 'markPaid'])->name('expense-claims.mark-paid');
    Route::post('expense-claims/{expenseClaim}/items',      [ExpenseClaimController::class, 'addItem'])->name('expense-claims.items.add');
    Route::delete('expense-claims/{expenseClaim}/items/{item}', [ExpenseClaimController::class, 'removeItem'])->name('expense-claims.items.remove');
    Route::resource('expense-claims', ExpenseClaimController::class)->except(['edit', 'update']);

    // Training Courses — enroll BEFORE resource
    Route::post('training-courses/{trainingCourse}/enroll', [TrainingCourseController::class, 'enroll'])->name('training-courses.enroll');
    Route::resource('training-courses', TrainingCourseController::class)->except(['edit', 'update']);
    Route::resource('training-records', EmployeeTrainingRecordController::class)->except(['edit', 'update']);

    // Training Enrollments — complete/fail BEFORE resource
    Route::post('training-enrollments/{trainingEnrollment}/complete', [TrainingEnrollmentController::class, 'complete'])->name('training-enrollments.complete');
    Route::post('training-enrollments/{trainingEnrollment}/fail',     [TrainingEnrollmentController::class, 'fail'])->name('training-enrollments.fail');
    Route::resource('training-enrollments', TrainingEnrollmentController::class)->only(['index', 'show']);

    // Employee Certifications
    Route::resource('employee-certifications', EmployeeCertificationController::class)->only(['index', 'store', 'destroy']);

    // Job Positions
    Route::post('job-positions/{jobPosition}/publish', [JobPositionController::class, 'publish'])->name('job-positions.publish');
    Route::post('job-positions/{jobPosition}/close',   [JobPositionController::class, 'close'])->name('job-positions.close');
    Route::resource('job-positions', JobPositionController::class)->except(['edit', 'update']);

    // Job Applications
    Route::patch('job-applications/{jobApplication}/advance', [JobApplicationController::class, 'advance'])->name('job-applications.advance');
    Route::post('job-applications/{jobApplication}/advance',  [JobApplicationController::class, 'advance'])->name('job-applications.advance.post');
    Route::post('job-applications/{jobApplication}/hire',     [JobApplicationController::class, 'hire'])->name('job-applications.hire');
    Route::post('job-applications/{jobApplication}/reject',   [JobApplicationController::class, 'reject'])->name('job-applications.reject');
    Route::resource('job-applications', JobApplicationController::class)->except(['edit', 'update']);

    // Attendance
    Route::resource('attendance', AttendanceController::class)->except(['edit']);

    // Work Schedules
    Route::resource('work-schedules', WorkScheduleController::class)->except(['edit', 'update']);

    // Shift Templates
    Route::resource('shift-templates', ShiftTemplateController::class)->except(['edit', 'update']);

    // Shift Assignments — markStatus BEFORE resource
    Route::patch('shift-assignments/{shiftAssignment}/status', [ShiftAssignmentController::class, 'markStatus'])->name('shift-assignments.status');
    Route::resource('shift-assignments', ShiftAssignmentController::class)->except(['edit', 'update', 'show']);

    // Onboarding Checklists
    Route::resource('onboarding-checklists', OnboardingChecklistController::class)->except(['edit', 'update']);

    // Employee Onboardings (checklist-based)
    Route::post('employee-onboardings/{employeeOnboarding}/tasks/{progress}/complete', [EmployeeOnboardingTrackingController::class, 'completeTask'])->name('employee-onboardings.tasks.complete');
    Route::post('employee-onboardings/{employeeOnboarding}/tasks/{progress}/skip',     [EmployeeOnboardingTrackingController::class, 'skipTask'])->name('employee-onboardings.tasks.skip');
    Route::resource('employee-onboardings', EmployeeOnboardingTrackingController::class)->except(['edit', 'update']);

    // Employee Loans
    Route::post('employee-loans/{employeeLoan}/approve',    [EmployeeLoanController::class, 'approve'])->name('employee-loans.approve');
    Route::post('employee-loans/{employeeLoan}/cancel',     [EmployeeLoanController::class, 'cancel'])->name('employee-loans.cancel');
    Route::post('employee-loans/{employeeLoan}/repayments', [EmployeeLoanController::class, 'addRepayment'])->name('employee-loans.repayments.add');
    Route::resource('employee-loans', EmployeeLoanController::class)->except(['edit', 'update']);
    // Disciplinary Cases
    Route::post('disciplinary-cases/{disciplinaryCase}/schedule-hearing', [DisciplinaryCaseController::class, 'scheduleHearing'])->name('disciplinary-cases.schedule-hearing');
    Route::post('disciplinary-cases/{disciplinaryCase}/resolve',          [DisciplinaryCaseController::class, 'resolve'])->name('disciplinary-cases.resolve');
    Route::post('disciplinary-cases/{disciplinaryCase}/close',            [DisciplinaryCaseController::class, 'close'])->name('disciplinary-cases.close');
    Route::resource('disciplinary-cases', DisciplinaryCaseController::class)->except(['edit', 'update']);

    // Grievances
    Route::patch('grievances/{grievance}/assign',  [GrievanceController::class, 'assign'])->name('grievances.assign');
    Route::post('grievances/{grievance}/resolve',  [GrievanceController::class, 'resolve'])->name('grievances.resolve');
    Route::post('grievances/{grievance}/close',    [GrievanceController::class, 'close'])->name('grievances.close');
    Route::resource('grievances', GrievanceController::class)->except(['edit', 'update']);
});


// Timesheet Management — custom actions BEFORE resource
use App\Modules\HR\Http\Controllers\TimesheetController;
Route::middleware(['web', 'auth', 'verified'])->prefix('hr')->name('hr.')->group(function () {
    Route::post('timesheets/{timesheet}/submit',  [TimesheetController::class, 'submit'])->name('timesheets.submit');
    Route::post('timesheets/{timesheet}/approve', [TimesheetController::class, 'approve'])->name('timesheets.approve');
    Route::post('timesheets/{timesheet}/reject',  [TimesheetController::class, 'reject'])->name('timesheets.reject');
    Route::post('timesheets/{timesheet}/entries', [TimesheetController::class, 'addEntry'])->name('timesheets.entries.store');
    Route::resource('timesheets', TimesheetController::class)->only(['index', 'create', 'store', 'show', 'destroy']);
});


// Employee Benefits Administration — custom actions BEFORE resource
use App\Modules\HR\Http\Controllers\BenefitPlanController;
use App\Modules\HR\Http\Controllers\EmployeeBenefitController;
Route::middleware(['web', 'auth', 'verified'])->prefix('hr')->name('hr.')->group(function () {
    Route::resource('benefit-plans', BenefitPlanController::class)->only(['index', 'store', 'show', 'destroy']);

    Route::post('employee-benefits/{employeeBenefit}/waive', [EmployeeBenefitController::class, 'waive'])->name('employee-benefits.waive');
    Route::post('employee-benefits/{employeeBenefit}/end',   [EmployeeBenefitController::class, 'end'])->name('employee-benefits.end');
    Route::resource('employee-benefits', EmployeeBenefitController::class)->only(['index', 'store', 'destroy']);
});


// Work Schedules & Shifts — custom actions BEFORE resource
use App\Modules\HR\Http\Controllers\EmployeeScheduleController;
Route::middleware(['web', 'auth', 'verified'])->prefix('hr')->name('hr.')->group(function () {
    Route::post('work-schedules/{workSchedule}/shifts', [WorkScheduleController::class, 'addShift'])->name('work-schedules.shifts.store');
    Route::resource('employee-schedules', EmployeeScheduleController::class)->only(['index', 'store', 'destroy']);
});

// Employee Documents
use App\Modules\HR\Http\Controllers\EmployeeDocumentController;
Route::middleware(['web', 'auth', 'verified'])->prefix('hr')->name('hr.')->group(function () {
    Route::post('employee-documents/{employeeDocument}/verify', [EmployeeDocumentController::class, 'verify'])->name('employee-documents.verify');
    Route::resource('employee-documents', EmployeeDocumentController::class)->only(['index', 'store', 'show', 'destroy']);
});

// Employee Skills
use App\Modules\HR\Http\Controllers\EmployeeSkillController;
use App\Modules\HR\Http\Controllers\SkillDefinitionController;
Route::middleware(['web', 'auth', 'verified'])->prefix('hr')->name('hr.')->group(function () {
    Route::post('employee-skills/{employeeSkill}/verify', [EmployeeSkillController::class, 'verify'])->name('employee-skills.verify');
    Route::resource('employee-skills',   EmployeeSkillController::class)->only(['index', 'store', 'show', 'destroy']);
    Route::resource('skill-definitions', SkillDefinitionController::class)->only(['index', 'store', 'destroy']);
});

// HR Announcements
use App\Modules\HR\Http\Controllers\HrAnnouncementController;
Route::middleware(['web', 'auth', 'verified'])->prefix('hr')->name('hr.')->group(function () {
    Route::post('announcements/{announcement}/publish', [HrAnnouncementController::class, 'publish'])->name('announcements.publish');
    Route::post('announcements/{announcement}/archive', [HrAnnouncementController::class, 'archive'])->name('announcements.archive');
    Route::resource('announcements', HrAnnouncementController::class)->only(['index', 'store', 'show', 'destroy']);
});

// Employee Exits
use App\Modules\HR\Http\Controllers\EmployeeExitController;
Route::middleware(['web', 'auth', 'verified'])->prefix('hr')->name('hr.')->group(function () {
    Route::post('employee-exits/{employeeExit}/complete',    [EmployeeExitController::class, 'complete'])->name('employee-exits.complete');
    Route::post('employee-exits/{employeeExit}/in-progress', [EmployeeExitController::class, 'markInProgress'])->name('employee-exits.in-progress');
    Route::resource('employee-exits', EmployeeExitController::class)->only(['index', 'store', 'show', 'destroy']);
});

// Employee Position Changes
use App\Modules\HR\Http\Controllers\EmployeePositionChangeController;
Route::middleware(['web', 'auth', 'verified'])->prefix('hr')->name('hr.')->group(function () {
    Route::post('position-changes/{positionChange}/approve', [EmployeePositionChangeController::class, 'approve'])->name('position-changes.approve');
    Route::resource('position-changes', EmployeePositionChangeController::class)->only(['index', 'store', 'show', 'destroy']);
});

// Salary Structures
use App\Modules\HR\Http\Controllers\SalaryStructureController;
Route::middleware(['web', 'auth', 'verified'])->prefix('hr')->name('hr.')->group(function () {
    Route::post('salary-structures/{salaryStructure}/rules', [SalaryStructureController::class, 'storeRule'])->name('salary-structures.rules.store');
    Route::delete('salary-structures/{salaryStructure}/rules/{rule}', [SalaryStructureController::class, 'destroyRule'])->name('salary-structures.rules.destroy');
    Route::resource('salary-structures', SalaryStructureController::class)->except(['create', 'edit']);
});

// Salary Grades
use App\Modules\HR\Http\Controllers\SalaryGradeController;
Route::middleware(['web', 'auth', 'verified'])->prefix('hr')->name('hr.')->group(function () {
    Route::resource('salary-grades', SalaryGradeController::class)->except(['create', 'edit']);
});

// Overtime Requests
use App\Modules\HR\Http\Controllers\OvertimeRequestController;
Route::middleware(['web', 'auth', 'verified'])->prefix('hr')->name('hr.')->group(function () {
    Route::post('overtime-requests/{overtimeRequest}/approve', [OvertimeRequestController::class, 'approve'])->name('overtime-requests.approve');
    Route::post('overtime-requests/{overtimeRequest}/reject',  [OvertimeRequestController::class, 'reject'])->name('overtime-requests.reject');
    Route::post('overtime-requests/{overtimeRequest}/cancel',  [OvertimeRequestController::class, 'cancel'])->name('overtime-requests.cancel');
    Route::resource('overtime-requests', OvertimeRequestController::class)->only(['index', 'store', 'show', 'destroy']);
});

// Employee Surveys
use App\Modules\HR\Http\Controllers\EmployeeSurveyController;
Route::middleware(['web', 'auth', 'verified'])->prefix('hr')->name('hr.')->group(function () {
    Route::post('surveys/{survey}/publish',  [EmployeeSurveyController::class, 'publish'])->name('surveys.publish');
    Route::post('surveys/{survey}/close',    [EmployeeSurveyController::class, 'close'])->name('surveys.close');
    Route::post('surveys/{survey}/respond',  [EmployeeSurveyController::class, 'respond'])->name('surveys.respond');
    Route::resource('surveys', EmployeeSurveyController::class)->only(['index', 'store', 'show', 'destroy']);
});


// Flexible Work Arrangements
use App\Modules\HR\Http\Controllers\FlexibleWorkController;
Route::middleware(['web', 'auth', 'verified'])->prefix('hr')->name('hr.')->group(function () {
    Route::post('flexible-work/{flexibleWork}/approve', [FlexibleWorkController::class, 'approve'])->name('flexible-work.approve');
    Route::post('flexible-work/{flexibleWork}/reject',  [FlexibleWorkController::class, 'reject'])->name('flexible-work.reject');
    Route::resource('flexible-work', FlexibleWorkController::class)->only(['index', 'store', 'show', 'destroy']);
});

// Job Offer Letters
use App\Modules\HR\Http\Controllers\JobOfferController;
Route::middleware(['web', 'auth', 'verified'])->prefix('hr')->name('hr.')->group(function () {
    Route::post('job-offers/{jobOffer}/send',    [JobOfferController::class, 'send'])->name('job-offers.send');
    Route::post('job-offers/{jobOffer}/accept',  [JobOfferController::class, 'accept'])->name('job-offers.accept');
    Route::post('job-offers/{jobOffer}/decline', [JobOfferController::class, 'decline'])->name('job-offers.decline');
    Route::resource('job-offers', JobOfferController::class)->only(['index', 'store', 'show', 'destroy']);
});

// Training Sessions
use App\Modules\HR\Http\Controllers\TrainingSessionController;
Route::middleware(['web', 'auth', 'verified'])->prefix('hr')->name('hr.')->group(function () {
    Route::post('training-sessions/{training_session}/start',    [TrainingSessionController::class, 'start'])->name('training-sessions.start');
    Route::post('training-sessions/{training_session}/complete', [TrainingSessionController::class, 'complete'])->name('training-sessions.complete');
    Route::post('training-sessions/{training_session}/cancel',   [TrainingSessionController::class, 'cancel'])->name('training-sessions.cancel');
    Route::resource('training-sessions', TrainingSessionController::class);
});

// Competency Frameworks
use App\Modules\HR\Http\Controllers\CompetencyFrameworkController;
Route::middleware(['web', 'auth', 'verified'])->prefix('hr')->name('hr.')->group(function () {
    Route::post('competency-frameworks/{competency_framework}/activate', [CompetencyFrameworkController::class, 'activate'])->name('competency-frameworks.activate');
    Route::post('competency-frameworks/{competency_framework}/archive',  [CompetencyFrameworkController::class, 'archive'])->name('competency-frameworks.archive');
    Route::resource('competency-frameworks', CompetencyFrameworkController::class);
});

// Employee Goals
use App\Modules\HR\Http\Controllers\EmployeeGoalController;
Route::middleware(['web', 'auth', 'verified'])->prefix('hr')->name('hr.')->group(function () {
    Route::post('employee-goals/{employee_goal}/complete',        [EmployeeGoalController::class, 'complete'])->name('employee-goals.complete');
    Route::post('employee-goals/{employee_goal}/miss',            [EmployeeGoalController::class, 'miss'])->name('employee-goals.miss');
    Route::post('employee-goals/{employee_goal}/cancel',          [EmployeeGoalController::class, 'cancel'])->name('employee-goals.cancel');
    Route::post('employee-goals/{employee_goal}/update-progress', [EmployeeGoalController::class, 'updateProgress'])->name('employee-goals.update-progress');
    Route::resource('employee-goals', EmployeeGoalController::class);
});

// Succession Plans
use App\Modules\HR\Http\Controllers\SuccessionPlanController;
Route::middleware(['web', 'auth', 'verified'])->prefix('hr')->name('hr.')->group(function () {
    Route::post('succession-plans/{succession_plan}/complete',   [SuccessionPlanController::class, 'complete'])->name('succession-plans.complete');
    Route::post('succession-plans/{succession_plan}/deactivate', [SuccessionPlanController::class, 'deactivate'])->name('succession-plans.deactivate');
    Route::resource('succession-plans', SuccessionPlanController::class);
});

// Mentorship Programs
use App\Modules\HR\Http\Controllers\MentorshipProgramController;
Route::middleware(['web', 'auth', 'verified'])->prefix('hr')->name('hr.')->group(function () {
    Route::post('mentorship-programs/{mentorship_program}/complete',   [MentorshipProgramController::class, 'complete'])->name('mentorship-programs.complete');
    Route::post('mentorship-programs/{mentorship_program}/pause',      [MentorshipProgramController::class, 'pause'])->name('mentorship-programs.pause');
    Route::post('mentorship-programs/{mentorship_program}/resume',     [MentorshipProgramController::class, 'resume'])->name('mentorship-programs.resume');
    Route::post('mentorship-programs/{mentorship_program}/cancel',     [MentorshipProgramController::class, 'cancel'])->name('mentorship-programs.cancel');
    Route::post('mentorship-programs/{mentorship_program}/log-session',[MentorshipProgramController::class, 'logSession'])->name('mentorship-programs.log-session');
    Route::resource('mentorship-programs', MentorshipProgramController::class);
});

// Interview Schedules
use App\Modules\HR\Http\Controllers\InterviewScheduleController;
Route::middleware(['web', 'auth', 'verified'])->prefix('hr')->name('hr.')->group(function () {
    Route::post('interview-schedules/{interview_schedule}/confirm',  [InterviewScheduleController::class, 'confirm'])->name('interview-schedules.confirm');
    Route::post('interview-schedules/{interview_schedule}/complete', [InterviewScheduleController::class, 'complete'])->name('interview-schedules.complete');
    Route::post('interview-schedules/{interview_schedule}/cancel',   [InterviewScheduleController::class, 'cancel'])->name('interview-schedules.cancel');
    Route::post('interview-schedules/{interview_schedule}/no-show',  [InterviewScheduleController::class, 'noShow'])->name('interview-schedules.no-show');
    Route::resource('interview-schedules', InterviewScheduleController::class);
});

// Employee Emergency Contacts
use App\Modules\HR\Http\Controllers\EmployeeEmergencyContactController;
Route::middleware(['web', 'auth', 'verified'])->prefix('hr')->name('hr.')->group(function () {
    Route::post('employees/{employee}/emergency-contacts/{emergency_contact}/mark-primary',
        [EmployeeEmergencyContactController::class, 'markPrimary']
    )->name('employees.emergency-contacts.mark-primary');
    Route::resource('employees.emergency-contacts', EmployeeEmergencyContactController::class)
        ->shallow();
});

// HR Reports
use App\Modules\HR\Http\Controllers\HRReportController;
Route::middleware(['web', 'auth', 'verified'])->prefix('hr/reports')->name('hr.reports.')->group(function () {
    Route::get('headcount',          [HRReportController::class, 'headcount'])->name('headcount');
    Route::get('leave-summary',      [HRReportController::class, 'leaveSummary'])->name('leave-summary');
    Route::get('department-summary', [HRReportController::class, 'departmentSummary'])->name('department-summary');
    Route::get('employee-tenure',    [HRReportController::class, 'employeeTenure'])->name('employee-tenure');
});
