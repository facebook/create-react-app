import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { Table } from '@/Components/Common/Table';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { TrainingCourse, TrainingEnrollment } from '@/types/hr';

interface Props extends PageProps {
    course: TrainingCourse & { enrollments: TrainingEnrollment[] };
}

const STATUS_COLORS: Record<string, string> = {
    enrolled:    'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    completed:   'bg-green-100 text-green-700',
    failed:      'bg-red-100 text-red-700',
    cancelled:   'bg-slate-100 text-slate-500',
};

export default function TrainingCourseShow({ course }: Props) {
    const { can } = usePermission();
    const enrollForm = useForm({ employee_id: '', scheduled_date: '' });

    function handleDelete() {
        if (confirm('Delete this training course?')) {
            router.delete(`/hr/training-courses/${course.id}`);
        }
    }

    function submitEnroll(e: React.FormEvent) {
        e.preventDefault();
        enrollForm.post(`/hr/training-courses/${course.id}/enroll`, {
            onSuccess: () => enrollForm.reset(),
        });
    }

    return (
        <AppLayout>
            <Head title={course.title} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <nav className="text-sm text-slate-500 mb-1">
                            <Link href="/hr/training-courses" className="hover:text-indigo-600">Training Courses</Link>
                            {' / '}
                            <span>{course.title}</span>
                        </nav>
                        <h1 className="text-2xl font-semibold text-slate-900">{course.title}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {can('hr.delete') && (
                            <Button variant="danger" onClick={handleDelete}>Delete</Button>
                        )}
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Category</dt>
                            <dd className="mt-1 text-sm text-slate-900">{course.category ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Provider</dt>
                            <dd className="mt-1 text-sm text-slate-900">{course.provider ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Duration</dt>
                            <dd className="mt-1 text-sm text-slate-900">
                                {course.duration_hours != null ? `${course.duration_hours}h` : '—'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Cost</dt>
                            <dd className="mt-1 text-sm text-slate-900">
                                {course.cost != null ? `$${Number(course.cost).toFixed(2)}` : '—'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Mandatory</dt>
                            <dd className="mt-1">
                                {course.is_mandatory ? (
                                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700">Required</span>
                                ) : (
                                    <span className="text-sm text-slate-500">Optional</span>
                                )}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Status</dt>
                            <dd className="mt-1">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${course.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {course.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </dd>
                        </div>
                        {course.description && (
                            <div className="col-span-2 sm:col-span-3">
                                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Description</dt>
                                <dd className="mt-1 text-sm text-slate-900 whitespace-pre-line">{course.description}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                {can('hr.create') && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-slate-900 mb-4">Enroll Employee</h2>
                        <form onSubmit={submitEnroll} className="flex items-end gap-3">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Employee ID</label>
                                <input
                                    type="number"
                                    value={enrollForm.data.employee_id}
                                    onChange={(e) => enrollForm.setData('employee_id', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="Employee ID"
                                />
                                {enrollForm.errors.employee_id && <p className="mt-1 text-xs text-red-600">{enrollForm.errors.employee_id}</p>}
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Scheduled Date</label>
                                <input
                                    type="date"
                                    value={enrollForm.data.scheduled_date}
                                    onChange={(e) => enrollForm.setData('scheduled_date', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <Button type="submit" disabled={enrollForm.processing}>Enroll</Button>
                        </form>
                    </div>
                )}

                <div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-3">Enrollments</h2>
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                        <Table
                            columns={[
                                {
                                    key: 'employee',
                                    header: 'Employee',
                                    render: (e) => (
                                        <span className="text-sm text-slate-900">
                                            {e.employee ? `${e.employee.first_name} ${e.employee.last_name}` : '—'}
                                        </span>
                                    ),
                                },
                                {
                                    key: 'status',
                                    header: 'Status',
                                    render: (e) => (
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[e.status] ?? 'bg-slate-100 text-slate-700'}`}>
                                            {e.status.replace('_', ' ')}
                                        </span>
                                    ),
                                },
                                {
                                    key: 'score',
                                    header: 'Score',
                                    render: (e) => <span className="text-sm text-slate-700">{e.score != null ? `${e.score}%` : '—'}</span>,
                                },
                                {
                                    key: 'actions',
                                    header: '',
                                    render: (e) => (
                                        <Link href={`/hr/training-enrollments/${e.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                                            View
                                        </Link>
                                    ),
                                },
                            ]}
                            data={course.enrollments ?? []}
                            emptyMessage="No enrollments yet."
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
