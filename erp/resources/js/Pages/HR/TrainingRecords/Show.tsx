import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { EmployeeTrainingRecord } from '@/types/hr';

interface Props extends PageProps {
    trainingRecord: EmployeeTrainingRecord;
}

function ExpiryBadge({ record }: { record: EmployeeTrainingRecord }) {
    if (!record.expiry_date) return null;
    if (record.is_expired) {
        return (
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-700">
                Expired
            </span>
        );
    }
    if (record.is_expiring) {
        return (
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-700">
                Expiring Soon
            </span>
        );
    }
    return (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-700">
            Valid
        </span>
    );
}

export default function TrainingRecordShow({ trainingRecord }: Props) {
    const { can } = usePermission();

    function handleDelete() {
        if (confirm('Delete this training record?')) {
            router.delete(`/hr/training-records/${trainingRecord.id}`);
        }
    }

    const employeeName = trainingRecord.employee
        ? `${trainingRecord.employee.first_name} ${trainingRecord.employee.last_name}`
        : '—';

    return (
        <AppLayout>
            <Head title={`Training Record — ${trainingRecord.course_title}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <nav className="text-sm text-slate-500 mb-1">
                            <Link href="/hr/training-records" className="hover:text-indigo-600">Training Records</Link>
                            {' / '}
                            <span>{trainingRecord.course_title}</span>
                        </nav>
                        <h1 className="text-2xl font-semibold text-slate-900">{trainingRecord.course_title}</h1>
                        <p className="text-sm text-slate-500 mt-0.5">{employeeName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExpiryBadge record={trainingRecord} />
                        {can('hr.delete') && (
                            <Button variant="danger" onClick={handleDelete}>Delete</Button>
                        )}
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Employee</dt>
                            <dd className="mt-1 text-sm text-slate-900">{employeeName}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Course</dt>
                            <dd className="mt-1 text-sm text-slate-900">
                                {trainingRecord.training_course ? (
                                    <Link href={`/hr/training-courses/${trainingRecord.training_course.id}`} className="text-indigo-600 hover:underline">
                                        {trainingRecord.course_title}
                                    </Link>
                                ) : trainingRecord.course_title}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Completed Date</dt>
                            <dd className="mt-1 text-sm text-slate-900">{trainingRecord.completed_date}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Expiry Date</dt>
                            <dd className="mt-1 text-sm text-slate-900">{trainingRecord.expiry_date ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Score</dt>
                            <dd className="mt-1 text-sm text-slate-900">
                                {trainingRecord.score != null ? `${trainingRecord.score}%` : '—'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Passed</dt>
                            <dd className="mt-1">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${trainingRecord.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {trainingRecord.passed ? 'Yes' : 'No'}
                                </span>
                            </dd>
                        </div>
                        {trainingRecord.certificate_number && (
                            <div>
                                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Certificate #</dt>
                                <dd className="mt-1 text-sm text-slate-900">{trainingRecord.certificate_number}</dd>
                            </div>
                        )}
                        {trainingRecord.notes && (
                            <div className="col-span-2 sm:col-span-3">
                                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Notes</dt>
                                <dd className="mt-1 text-sm text-slate-900 whitespace-pre-line">{trainingRecord.notes}</dd>
                            </div>
                        )}
                    </dl>
                </div>
            </div>
        </AppLayout>
    );
}
