import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { JobApplication } from '@/types/hr';

interface Props extends PageProps {
    application: JobApplication;
}

const STATUS_COLORS: Record<string, string> = {
    new:       'bg-blue-100 text-blue-700',
    applied:   'bg-blue-100 text-blue-700',
    screening: 'bg-purple-100 text-purple-700',
    interview: 'bg-amber-100 text-amber-700',
    offer:     'bg-orange-100 text-orange-700',
    hired:     'bg-green-100 text-green-700',
    rejected:  'bg-red-100 text-red-700',
};

function StatusBadge({ status }: { status: string }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[status] ?? 'bg-slate-100 text-slate-700'}`}>
            {status}
        </span>
    );
}

function StarRating({ rating }: { rating: number | null }) {
    if (rating === null) return <span className="text-sm text-slate-400">Not rated</span>;
    return (
        <span className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
                <svg key={n} className={`h-5 w-5 ${n <= rating ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </span>
    );
}

function AdvanceForm({ application }: { application: JobApplication }) {
    const { data, setData, post, processing, errors } = useForm({ status: '' });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(`/hr/job-applications/${application.id}/advance`);
    }

    return (
        <form onSubmit={submit} className="flex items-end gap-3">
            <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Advance to Status *</label>
                <select value={data.status} onChange={(e) => setData('status', e.target.value)}
                    className="rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm">
                    <option value="">Select status…</option>
                    <option value="screening">Screening</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                </select>
                {errors.status && <p className="text-xs text-red-600 mt-1">{errors.status}</p>}
            </div>
            <Button type="submit" disabled={processing}>
                {processing ? 'Updating…' : 'Advance'}
            </Button>
        </form>
    );
}

function RejectForm({ application }: { application: JobApplication }) {
    const { data, setData, post, processing } = useForm({ notes: '' });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (confirm('Reject this application?')) {
            post(`/hr/job-applications/${application.id}/reject`);
        }
    }

    return (
        <form onSubmit={submit} className="space-y-3">
            <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Notes (optional)</label>
                <input type="text" value={data.notes} onChange={(e) => setData('notes', e.target.value)}
                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    placeholder="Brief notes…" />
            </div>
            <button type="submit" disabled={processing}
                className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 border border-red-200 disabled:opacity-50">
                {processing ? 'Rejecting…' : 'Reject Application'}
            </button>
        </form>
    );
}

export default function ShowJobApplication({ application }: Props) {
    const { can } = usePermission();
    const appStatus = application.status ?? application.stage ?? 'new';
    const isActive  = !['hired', 'rejected'].includes(appStatus);

    function hireApplicant() {
        if (confirm('Hire this applicant?')) {
            router.post(`/hr/job-applications/${application.id}/hire`);
        }
    }

    function deleteApplication() {
        if (confirm('Delete this application? This cannot be undone.')) {
            router.delete(`/hr/job-applications/${application.id}`);
        }
    }

    const positionTitle = application.position?.title ?? application.job_position?.title ?? 'Unknown Position';

    return (
        <AppLayout>
            <Head title={`Application — ${application.applicant_name}`} />
            <div className="max-w-4xl space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold text-slate-900">{application.applicant_name}</h1>
                            <StatusBadge status={appStatus} />
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{positionTitle}</p>
                    </div>
                    <a href="/hr/job-applications" className="text-sm text-slate-600 hover:text-slate-900">← Back</a>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email</dt>
                            <dd className="mt-1 text-sm text-slate-900">{application.applicant_email}</dd>
                        </div>
                        {application.applicant_phone && (
                            <div>
                                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Phone</dt>
                                <dd className="mt-1 text-sm text-slate-900">{application.applicant_phone}</dd>
                            </div>
                        )}
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Rating</dt>
                            <dd className="mt-1"><StarRating rating={application.rating} /></dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Applied</dt>
                            <dd className="mt-1 text-sm text-slate-900">{application.created_at}</dd>
                        </div>
                        {application.reviewed_at && (
                            <div>
                                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Reviewed At</dt>
                                <dd className="mt-1 text-sm text-slate-900">{application.reviewed_at}</dd>
                            </div>
                        )}
                        {application.hired_at && (
                            <div>
                                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Hired At</dt>
                                <dd className="mt-1 text-sm text-slate-900">{application.hired_at}</dd>
                            </div>
                        )}
                        {application.rejected_at && (
                            <div>
                                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Rejected At</dt>
                                <dd className="mt-1 text-sm text-slate-900">{application.rejected_at}</dd>
                            </div>
                        )}
                    </dl>

                    {application.cover_letter && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Cover Letter</dt>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{application.cover_letter}</p>
                        </div>
                    )}

                    {application.notes && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Notes</dt>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{application.notes}</p>
                        </div>
                    )}
                </div>

                {can('hr.create') && isActive && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                        <h2 className="text-base font-semibold text-slate-900">Actions</h2>
                        <AdvanceForm application={application} />
                        <div className="pt-4 border-t border-slate-100">
                            <h3 className="text-sm font-medium text-slate-700 mb-3">Hire Applicant</h3>
                            <Button onClick={hireApplicant} className="bg-green-600 hover:bg-green-700 mr-3">
                                Hire
                            </Button>
                        </div>
                        <div className="pt-4 border-t border-slate-100">
                            <h3 className="text-sm font-medium text-slate-700 mb-3">Reject Application</h3>
                            <RejectForm application={application} />
                        </div>
                    </div>
                )}

                {can('hr.delete') && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-slate-900 mb-4">Danger Zone</h2>
                        <button onClick={deleteApplication}
                            className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 border border-red-200">
                            Delete Application
                        </button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
