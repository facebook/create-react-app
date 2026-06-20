import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Paginator } from '@/types/inventory';
import type { JobApplication, JobPosition } from '@/types/hr';

interface Props extends PageProps {
    applications: Paginator<JobApplication>;
    positions?: JobPosition[];
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

function AddApplicationForm({ positions }: { positions?: JobPosition[] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        job_position_id: '',
        applicant_name: '',
        applicant_email: '',
        applicant_phone: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/hr/job-applications', { onSuccess: () => reset() });
    }

    return (
        <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Submit Application</h2>
            <div className="flex flex-wrap gap-3 items-end">
                {positions && positions.length > 0 && (
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Position *</label>
                        <select
                            value={data.job_position_id}
                            onChange={(e) => setData('job_position_id', e.target.value)}
                            className="rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                        >
                            <option value="">Select position…</option>
                            {positions.map((p) => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </select>
                        {errors.job_position_id && <p className="text-xs text-red-600 mt-1">{errors.job_position_id}</p>}
                    </div>
                )}
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Name *</label>
                    <input type="text" value={data.applicant_name} onChange={(e) => setData('applicant_name', e.target.value)}
                        className="rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                        placeholder="Full name" />
                    {errors.applicant_name && <p className="text-xs text-red-600 mt-1">{errors.applicant_name}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Email *</label>
                    <input type="email" value={data.applicant_email} onChange={(e) => setData('applicant_email', e.target.value)}
                        className="rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                        placeholder="email@example.com" />
                    {errors.applicant_email && <p className="text-xs text-red-600 mt-1">{errors.applicant_email}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
                    <input type="text" value={data.applicant_phone} onChange={(e) => setData('applicant_phone', e.target.value)}
                        className="rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                        placeholder="+1 555 000 0000" />
                </div>
                <Button type="submit" disabled={processing}>
                    {processing ? 'Submitting…' : 'Submit'}
                </Button>
            </div>
        </form>
    );
}

export default function JobApplicationsIndex({ applications, positions }: Props) {
    const { can } = usePermission();

    return (
        <AppLayout>
            <Head title="Job Applications" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Job Applications</h1>
                        <p className="text-sm text-slate-500 mt-1">{applications.total} applications</p>
                    </div>
                </div>

                {can('hr.create') && <AddApplicationForm positions={positions} />}

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table
                        columns={[
                            {
                                key: 'applicant_name',
                                header: 'Applicant',
                                render: (r) => (
                                    <Link href={`/hr/job-applications/${r.id}`} className="font-medium text-slate-900 hover:text-indigo-600">
                                        {r.applicant_name}
                                    </Link>
                                ),
                            },
                            {
                                key: 'applicant_email',
                                header: 'Email',
                                render: (r) => <span className="text-sm text-slate-700">{r.applicant_email}</span>,
                            },
                            {
                                key: 'job_position',
                                header: 'Position',
                                render: (r) => (
                                    <span className="text-sm text-slate-700">{r.position?.title ?? r.job_position?.title ?? '—'}</span>
                                ),
                            },
                            {
                                key: 'status',
                                header: 'Status',
                                render: (r) => <StatusBadge status={r.status ?? r.stage ?? 'new'} />,
                            },
                            {
                                key: 'rating',
                                header: 'Rating',
                                render: (r) => <span className="text-sm text-slate-700">{r.rating ?? '—'}</span>,
                            },
                            {
                                key: 'actions',
                                header: '',
                                render: (r) => (
                                    <Link href={`/hr/job-applications/${r.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                                        View
                                    </Link>
                                ),
                            },
                        ]}
                        data={applications.data}
                        emptyMessage="No applications found."
                    />
                    <Pagination paginator={applications} />
                </div>
            </div>
        </AppLayout>
    );
}
