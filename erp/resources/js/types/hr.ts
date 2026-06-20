export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'intern';
export type EmployeeStatus = 'active' | 'on_leave' | 'terminated';
export type SalaryType = 'hourly' | 'monthly';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type PayrollStatus = 'draft' | 'processed' | 'paid';

export interface Department {
    id: number;
    name: string;
    description?: string;
    is_active?: boolean;
    employees_count?: number;
    created_at?: string;
}

export interface Employee {
    id: number;
    employee_number?: string;
    code?: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email?: string;
    phone?: string;
    position?: string;
    job_title?: string;
    employment_type: EmploymentType;
    status: EmployeeStatus;
    start_date?: string;
    hire_date?: string;
    end_date?: string | null;
    termination_date?: string | null;
    salary_type?: SalaryType;
    salary_amount?: number | string;
    salary?: number | string;
    department_id?: number | null;
    user_id?: number | null;
    department?: { id: number; name: string } | null;
    user?: { id: number; name: string } | null;
    leave_requests?: LeaveRequest[];
    created_at?: string;
}

export interface LeaveType {
    id: number;
    name: string;
    days_per_year?: number;
    is_paid?: boolean;
    is_active?: boolean;
}

export interface LeaveRequest {
    id: number;
    employee_id?: number;
    employee?: { id: number; full_name: string } | null;
    leave_type_id?: number | null;
    leave_type?: string;
    type?: string;
    start_date: string;
    end_date: string;
    days: number;
    reason?: string;
    notes?: string;
    status: LeaveStatus;
    approved_by?: number | null;
    approved_at?: string | null;
    reviewed_by?: number | null;
    reviewed_at?: string | null;
    approver?: string | null;
    created_at?: string;
}

export interface PayrollItem {
    id: number;
    employee?: { id: number; full_name: string; position?: string } | null;
    gross_salary: number | string;
    deductions: number | string;
    net_salary: number | string;
    notes?: string;
}

export interface PayrollRun {
    id: number;
    period_label?: string;
    period_start: string;
    period_end: string;
    status: PayrollStatus;
    notes?: string;
    total_gross?: number | string;
    total_deductions?: number | string;
    total_net?: number | string;
    employee_count?: number;
    processed_at?: string | null;
    items_count?: number;
    items?: PayrollItem[];
    creator?: string | null;
    created_at?: string;
}

export interface OnboardingTemplateTask {
    id: number;
    title: string;
    description: string | null;
    due_days: number;
    sort_order: number;
}

export interface OnboardingTemplate {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    tasks?: OnboardingTemplateTask[];
    tasks_count?: number;
    onboardings_count?: number;
    created_at: string;
}

export interface EmployeeOnboardingTask {
    id: number;
    title: string;
    description: string | null;
    due_date: string | null;
    completed_at: string | null;
    is_completed: boolean;
    sort_order: number;
}

export interface EmployeeOnboarding {
    id: number;
    employee_id: number;
    template_id: number | null;
    title: string;
    status: 'in_progress' | 'completed' | 'cancelled';
    started_at: string;
    completed_at: string | null;
    progress: number;
    tasks?: EmployeeOnboardingTask[];
    created_at: string;
}

export interface PerformanceReviewGoal {
    id: number;
    title: string;
    description: string | null;
    achieved: boolean;
    achievement_notes: string | null;
}

export interface PerformanceReviewCompetency {
    id: number;
    name: string;
    rating: number | null;
    notes: string | null;
}

export interface PerformanceReview {
    id: number;
    employee_id: number;
    reviewer_id: number | null;
    period_start: string;
    period_end: string;
    status: 'draft' | 'in_review' | 'completed';
    overall_rating: number | null;
    comments: string | null;
    completed_at: string | null;
    average_competency_rating: number | null;
    employee?: Employee;
    reviewer?: { id: number; name: string } | null;
    goals?: PerformanceReviewGoal[];
    competencies?: PerformanceReviewCompetency[];
    created_at: string;
}

export interface TrainingCourse {
    id: number;
    title: string;
    category: string | null;
    description: string | null;
    provider: string | null;
    type?: 'internal' | 'external' | 'online' | 'certification';
    duration_hours: number | null;
    cost: number | null;
    is_mandatory: boolean;
    is_active: boolean;
    enrollments_count?: number;
    training_records_count?: number;
    created_at?: string;
}

export interface EmployeeTrainingRecord {
    id: number;
    employee_id: number;
    training_course_id: number | null;
    course_title: string;
    completed_date: string;
    expiry_date: string | null;
    score: number | null;
    passed: boolean;
    certificate_number: string | null;
    notes: string | null;
    is_expired: boolean;
    is_expiring: boolean;
    employee?: Employee;
    training_course?: TrainingCourse | null;
    created_at: string;
}

export interface JobPosition {
    id: number;
    title: string;
    department: string | null;
    department_id: number | null;
    location: string | null;
    employment_type: 'full_time' | 'part_time' | 'contract' | 'internship';
    description: string | null;
    requirements: string | null;
    salary_min: number | null;
    salary_max: number | null;
    openings: number;
    is_active: boolean;
    is_open: boolean;
    status: 'draft' | 'open' | 'closed' | 'on_hold';
    application_count: number;
    open_applications_count: number;
    applications_count?: number;
    posted_at: string | null;
    closes_at: string | null;
    closed_at: string | null;
    department_obj?: Department;
    applications?: JobApplication[];
    created_at: string;
}

export interface JobApplication {
    id: number;
    job_position_id: number;
    applicant_name: string;
    applicant_email: string;
    applicant_phone: string | null;
    status: 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
    stage: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
    cover_letter: string | null;
    resume_url: string | null;
    source: string | null;
    notes: string | null;
    rating: number | null;
    is_active: boolean;
    reviewed_by: number | null;
    reviewed_at: string | null;
    rejected_at: string | null;
    hired_at: string | null;
    position?: JobPosition;
    job_position?: JobPosition;
    created_at: string;
}

export interface AttendanceRecord {
    id: number;
    employee_id: number;
    work_date: string;
    clock_in: string | null;
    clock_out: string | null;
    break_minutes: number;
    status: 'present' | 'absent' | 'half_day' | 'holiday' | 'leave';
    notes: string | null;
    worked_hours: number | null;
    is_late: boolean;
    employee?: Employee;
    created_at: string;
}

export interface WorkSchedule {
    id: number;
    name: string;
    timezone: string;
    hours_per_week: number;
    is_active: boolean;
    description: string | null;
    shift_count: number;
    shifts?: WorkScheduleShift[];
    // Legacy fields
    is_default?: boolean;
    monday_start?: string | null;
    monday_end?: string | null;
    tuesday_start?: string | null;
    tuesday_end?: string | null;
    wednesday_start?: string | null;
    wednesday_end?: string | null;
    thursday_start?: string | null;
    thursday_end?: string | null;
    friday_start?: string | null;
    friday_end?: string | null;
    saturday_start?: string | null;
    saturday_end?: string | null;
    sunday_start?: string | null;
    sunday_end?: string | null;
    created_at?: string;
}

export interface WorkScheduleShift {
    id: number;
    work_schedule_id: number;
    day_of_week: string;
    start_time: string;
    end_time: string;
    break_minutes: number;
    hours: number;
}

export interface EmployeeSchedule {
    id: number;
    employee_id: number;
    work_schedule_id: number;
    effective_from: string;
    effective_to: string | null;
    is_active: boolean;
    is_current: boolean;
    employee?: Employee;
    schedule?: WorkSchedule;
}

export interface LoanRepayment {
    id: number;
    employee_loan_id: number;
    amount: number;
    payment_date: string;
    notes: string | null;
    created_at: string;
}

export interface EmployeeLoan {
    id: number;
    employee_id: number;
    type: 'loan' | 'advance';
    amount: number;
    outstanding_balance: number;
    interest_rate: number;
    status: 'pending' | 'active' | 'completed' | 'cancelled';
    approved_by: number | null;
    approved_at: string | null;
    disbursed_at: string | null;
    purpose: string | null;
    notes: string | null;
    repayment_start_date: string | null;
    total_repaid: number;
    is_fully_repaid: boolean;
    employee?: Employee;
    repayments?: LoanRepayment[];
    created_at: string;
}

export interface ShiftTemplate {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
    break_minutes: number;
    days_of_week: number[] | null;
    color: string;
    is_active: boolean;
    duration_hours: number;
    assignments_count?: number;
    created_at: string;
}

export interface ShiftAssignment {
    id: number;
    shift_template_id: number;
    employee_id: number;
    assigned_date: string;
    notes: string | null;
    status: 'scheduled' | 'completed' | 'absent' | 'swapped';
    is_upcoming: boolean;
    shift_template?: ShiftTemplate;
    employee?: { id: number; first_name: string; last_name: string };
    created_at: string;
}

export interface ExpenseClaimItem {
    id: number;
    expense_claim_id: number;
    category: string;
    description: string;
    amount: number;
    expense_date: string;
    receipt_reference: string | null;
}

export interface ExpenseClaim {
    id: number;
    employee_id: number;
    title: string;
    description: string | null;
    status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
    total_amount: number;
    total_items: number;
    submitted_at: string | null;
    approved_by: number | null;
    approved_at: string | null;
    paid_at: string | null;
    rejection_reason: string | null;
    notes: string | null;
    employee?: { id: number; first_name: string; last_name: string };
    approved_by_user?: { id: number; name: string } | null;
    items?: ExpenseClaimItem[];
    created_at: string;
}

export interface PerformanceKpi {
    id: number;
    performance_review_id: number;
    name: string;
    description: string | null;
    target_score: number;
    actual_score: number;
    weight: number;
    notes: string | null;
    achievement_percent: number | null;
}

export interface PerformanceReviewV2 {
    id: number;
    employee_id: number;
    reviewer_id: number | null;
    review_period: string;
    review_date: string;
    status: 'draft' | 'submitted' | 'acknowledged';
    overall_rating: number | null;
    strengths: string | null;
    improvements: string | null;
    goals: string | null;
    reviewer_notes: string | null;
    average_kpi_score: number | null;
    employee?: { id: number; first_name: string; last_name: string };
    reviewer?: { id: number; name: string } | null;
    kpis?: PerformanceKpi[];
    created_at: string;
}

export interface Payslip {
    id: number;
    payroll_run_id: number;
    employee_id: number;
    gross_amount: number;
    total_deductions: number;
    net_amount: number;
    tax_amount: number;
    notes: string | null;
    effective_tax_rate: number;
    employee?: { id: number; first_name: string; last_name: string };
}

export interface PayrollRunV2 {
    id: number;
    period_start: string;
    period_end: string;
    run_date: string;
    status: 'draft' | 'processing' | 'approved' | 'paid';
    total_gross: number;
    total_deductions: number;
    total_net: number;
    notes: string | null;
    approved_by: number | null;
    approved_at: string | null;
    payslips?: Payslip[];
    created_at: string;
}

export interface OnboardingTask {
    id: number;
    onboarding_checklist_id: number;
    title: string;
    description: string | null;
    category: string | null;
    due_day_offset: number;
    is_required: boolean;
    sort_order: number;
}

export interface OnboardingChecklist {
    id: number;
    name: string;
    department: string | null;
    description: string | null;
    is_active: boolean;
    tasks_count?: number;
    tasks?: OnboardingTask[];
}

export interface OnboardingProgress {
    id: number;
    employee_onboarding_id: number;
    onboarding_task_id: number;
    status: 'pending' | 'completed' | 'skipped';
    notes: string | null;
    completed_at: string | null;
    task?: OnboardingTask;
}

export interface EmployeeOnboardingV2 {
    id: number;
    employee_id: number;
    onboarding_checklist_id: number;
    start_date: string;
    status: 'in_progress' | 'completed' | 'cancelled';
    completion_percent: number;
    completed_at: string | null;
    employee?: Employee;
    checklist?: OnboardingChecklist;
    progress?: OnboardingProgress[];
}

export interface LeaveTypeV2 {
    id: number;
    name: string;
    code: string | null;
    default_days: number;
    is_paid: boolean;
    is_active: boolean;
    requires_approval: boolean;
    description: string | null;
}

export interface LeaveRequestV2 {
    id: number;
    employee_id: number;
    leave_type_id: number;
    start_date: string;
    end_date: string;
    days_requested: number;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    reason: string | null;
    rejection_reason: string | null;
    approved_at: string | null;
    employee?: Employee;
    leave_type?: LeaveType;
    approver?: { id: number; name: string } | null;
}

export interface LeaveBalance {
    id: number;
    employee_id: number;
    leave_type_id: number;
    year: number;
    allocated_days: number;
    used_days: number;
    pending_days: number;
    remaining_days: number;
    employee?: Employee;
    leave_type?: LeaveType;
}

export interface TrainingEnrollment {
    id: number;
    employee_id: number;
    training_course_id: number;
    enrolled_date: string;
    scheduled_date: string | null;
    completed_date: string | null;
    status: 'enrolled' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
    score: number | null;
    notes: string | null;
    is_completed: boolean;
    employee?: Employee;
    course?: TrainingCourse;
}

export interface EmployeeCertification {
    id: number;
    employee_id: number;
    name: string;
    issuing_body: string | null;
    certificate_number: string | null;
    issued_date: string;
    expiry_date: string | null;
    is_verified: boolean;
    is_expired: boolean;
    is_expiring: boolean;
    employee?: Employee;
}

export interface DisciplinaryCase {
    id: number;
    employee_id: number;
    reference: string | null;
    incident_type: 'misconduct' | 'poor_performance' | 'attendance' | 'policy_violation' | 'other';
    incident_date: string;
    description: string;
    severity: 'minor' | 'moderate' | 'major' | 'gross';
    status: 'open' | 'under_investigation' | 'hearing_scheduled' | 'resolved' | 'closed';
    outcome: string | null;
    outcome_notes: string | null;
    hearing_date: string | null;
    resolved_date: string | null;
    is_open: boolean;
    employee?: Employee;
    handled_by_user?: { id: number; name: string } | null;
}

export interface Grievance {
    id: number;
    employee_id: number;
    reference: string | null;
    category: 'harassment' | 'discrimination' | 'working_conditions' | 'pay' | 'management' | 'other';
    description: string;
    status: 'submitted' | 'under_review' | 'hearing_scheduled' | 'resolved' | 'closed';
    resolution: string | null;
    is_anonymous: boolean;
    assigned_to: number | null;
    submitted_date: string;
    resolved_date: string | null;
    employee?: Employee;
    assigned_to_user?: { id: number; name: string } | null;
}

export interface TimesheetEntry {
    id: number;
    timesheet_id: number;
    work_date: string;
    hours: number;
    project: string | null;
    description: string | null;
}

export interface Timesheet {
    id: number;
    employee_id: number;
    week_start: string;
    week_end: string;
    status: 'draft' | 'submitted' | 'approved' | 'rejected';
    total_hours: number;
    approved_by: number | null;
    approved_at: string | null;
    notes: string | null;
    is_editable: boolean;
    is_approved: boolean;
    employee?: Employee;
    entries?: TimesheetEntry[];
}

export interface BenefitPlan {
    id: number;
    name: string;
    type: 'health' | 'dental' | 'vision' | 'life' | 'retirement' | 'other';
    description: string | null;
    employee_cost: number;
    employer_cost: number;
    total_cost: number;
    is_active: boolean;
}

export interface EmployeeBenefit {
    id: number;
    employee_id: number;
    benefit_plan_id: number;
    enrolled_at: string;
    ended_at: string | null;
    status: 'active' | 'waived' | 'ended';
    notes: string | null;
    is_active: boolean;
    monthly_cost: number;
    employee?: Employee;
    plan?: BenefitPlan;
}

export interface ReviewRating {
    id: number;
    performance_review_id: number;
    competency: string;
    rating: number;
    notes: string | null;
}

export interface PerformanceReviewPhase96 {
    id: number;
    employee_id: number;
    reviewer_id: number;
    period: string;
    review_date: string;
    status: 'draft' | 'submitted' | 'acknowledged';
    overall_rating: number | null;
    strengths: string | null;
    improvements: string | null;
    goals: string | null;
    employee_comments: string | null;
    is_complete: boolean;
    average_rating: number;
    submitted_at: string | null;
    acknowledged_at: string | null;
    employee?: Employee;
    ratings?: ReviewRating[];
}

export interface EmployeeDocument {
    id: number;
    employee_id: number;
    document_type: string;
    document_name: string;
    document_number: string | null;
    file_url: string | null;
    issued_date: string | null;
    expiry_date: string | null;
    is_verified: boolean;
    is_expired: boolean;
    is_expiring_soon: boolean;
    employee?: Employee;
}

export interface SkillDefinition {
    id: number;
    name: string;
    category: string | null;
    is_active: boolean;
}

export interface EmployeeSkill {
    id: number;
    employee_id: number;
    skill_name: string;
    proficiency_level: number;
    proficiency_label: string;
    is_verified: boolean;
    acquired_date: string | null;
    employee?: Employee;
    definition?: SkillDefinition;
}

export interface HrAnnouncement {
    id: number;
    title: string;
    body: string;
    target_audience: string;
    department_id: number | null;
    is_published: boolean;
    is_active: boolean;
    priority: string;
    publish_at: string | null;
    expire_at: string | null;
}

export interface EmployeeExit {
    id: number;
    employee_id: number;
    exit_date: string;
    exit_type: string;
    reason: string | null;
    equipment_returned: boolean;
    access_revoked: boolean;
    status: string;
    is_pending: boolean;
    is_complete: boolean;
    employee?: Employee;
}

export interface EmployeePositionChange {
    id: number;
    employee_id: number;
    change_type: string;
    from_title: string | null;
    to_title: string | null;
    from_salary: number | null;
    to_salary: number | null;
    salary_change: number;
    effective_date: string;
    is_approved: boolean;
    reason: string | null;
    employee?: Employee;
}

export interface SalaryGrade {
    id: number;
    name: string;
    code: string | null;
    min_salary: number;
    mid_salary: number | null;
    max_salary: number;
    currency: string;
    is_active: boolean;
    salary_range: string;
    midpoint: number;
}
