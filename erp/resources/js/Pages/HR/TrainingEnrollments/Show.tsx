import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { TrainingEnrollment } from '@/types/hr';

interface Props extends PageProps {
    enrollment: TrainingEnrollment;
}

const STATUS_COLORS: Record<string, string> = {
    enrolled:    'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    completed:   'bg-green-100 text-green-700',
    failed:      'bg-red-100 text-red-700',
    cancelled:   'bg-slate-100 text-slate-500',
};

export default function TrainingEnrollmentShow({ enrollment }: Props) {
    const { can } = usePermission();

    const completeForm = useForm({ score: '', notes: '' });
    const failForm = useForm({ notes: '' });

    function submitComplete(e: React.FormEvent) {
        e.preventDefault();
        completeForm.post(`/hr/training-enrollments/${enrollment.id}/complete`);
    }

    function submitFail(e: React.FormEvent) {
        e.preventDefault();
        failForm.post(`/hr/training-enrollments/${enrollment.id}/fail`);
    }

    return (
        <AppLayout>
            <Head title="Training Enrollment" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <nav className="text-sm text-slate-500 mb-1">
                            <Link href="/hr/training-enrollments" className="hover:text-indigo-600">Enrollments</Link>
                            {' / '}
                            <span>#{enrollment.id}</span>
                        </nav>
                        <h1 className="text-2xl font-semibold text-slate-900">Training Enrollment</h1>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Employee</dt>
                            <dd className="mt-1 text-sm text-slate-900">
                                {enrollment.employee ? `${enrollment.employee.first_name} ${enrollment.employee.last_name}` : '—'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Course</dt>
                            <dd className="mt-1 text-sm text-slate-900">{enrollment.course?.title ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Status</dt>
                            <dd className="mt-1">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[enrollment.status] ?? 'bg-slate-100 text-slate-700'}`}>
                                    {enrollment.status.replace('_', ' ')}
                                </span>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Enrolled Date</dt>
                            <dd className="mt-1 text-sm text-slate-900">{enrollment.enrolled_date}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Scheduled Date</dt>
                            <dd className="mt-1 text-sm text-slate-900">{enrollment.scheduled_date ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Completed Date</dt>
                            <dd className="mt-1 text-sm text-slate-900">{enrollment.completed_date ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Score</dt>
                            <dd className="mt-1 text-sm text-slate-900">{enrollment.score != null ? `${enrollment.score}%` : '—'}</dd>
                        </div>
                        {enrollment.notes && (
                            <div className="col-span-2 sm:col-span-3">
                                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Notes</dt>
                                <dd className="mt-1 text-sm text-slate-900 whitespace-pre-line">{enrollment.notes}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                {can('hr.create') && enrollment.status !== 'completed' && enrollment.status !== 'failed' && enrollment.status !== 'cancelled' && (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-base font-semibold text-slate-900 mb-4">Mark as Completed</h2>
                            <form onSubmit={submitComplete} className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Score (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={completeForm.data.score}
                                        onChange={(e) => completeForm.setData('score', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                                    <textarea
                                        rows={3}
                                        value={completeForm.data.notes}
                                        onChange={(e) => completeForm.setData('notes', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                                <Button type="submit" disabled={completeForm.processing}>Mark Completed</Button>
                            </form>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-base font-semibold text-slate-900 mb-4">Mark as Failed</h2>
                            <form onSubmit={submitFail} className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                                    <textarea
                                        rows={3}
                                        value={failForm.data.notes}
                                        onChange={(e) => failForm.setData('notes', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                                <Button type="submit" variant="danger" disabled={failForm.processing}>Mark Failed</Button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
