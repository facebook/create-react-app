import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Paginator } from '@/types/inventory';
import type { JobPosition } from '@/types/hr';

interface Props extends PageProps {
    positions: Paginator<JobPosition>;
}

const STATUS_COLORS: Record<string, string> = {
    draft:   'bg-slate-100 text-slate-700',
    open:    'bg-green-100 text-green-700',
    closed:  'bg-red-100 text-red-700',
    on_hold: 'bg-amber-100 text-amber-700',
};

function StatusBadge({ position }: { position: JobPosition }) {
    if (position.is_active !== undefined) {
        const label = position.is_active ? 'Active' : 'Inactive';
        const cls   = position.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700';
        return (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
                {label}
            </span>
        );
    }
    const s = position.status ?? 'draft';
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[s] ?? 'bg-slate-100 text-slate-700'}`}>
            {s.replace('_', ' ')}
        </span>
    );
}

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
    full_time:  'Full Time',
    part_time:  'Part Time',
    contract:   'Contract',
    internship: 'Internship',
};

function AddPositionForm() {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        employment_type: 'full_time',
        department: '',
        openings: 1,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/hr/job-positions', { onSuccess: () => reset() });
    }

    return (
        <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Add Job Position</h2>
            <div className="flex flex-wrap gap-3 items-end">
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
                    <input
                        type="text"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        className="rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                        placeholder="e.g. Software Engineer"
                    />
                    {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Type *</label>
                    <select
                        value={data.employment_type}
                        onChange={(e) => setData('employment_type', e.target.value)}
                        className="rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    >
                        <option value="full_time">Full Time</option>
                        <option value="part_time">Part Time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
                    <input
                        type="text"
                        value={data.department}
                        onChange={(e) => setData('department', e.target.value)}
                        className="rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                        placeholder="e.g. Engineering"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Openings</label>
                    <input
                        type="number"
                        min={1}
                        value={data.openings}
                        onChange={(e) => setData('openings', parseInt(e.target.value) || 1)}
                        className="w-20 rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                </div>
                <Button type="submit" disabled={processing}>
                    {processing ? 'Adding…' : 'Add Position'}
                </Button>
            </div>
        </form>
    );
}

export default function JobPositionsIndex({ positions }: Props) {
    const { can } = usePermission();

    return (
        <AppLayout>
            <Head title="Job Positions" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Job Positions</h1>
                        <p className="text-sm text-slate-500 mt-1">{positions.total} positions</p>
                    </div>
                </div>

                {can('hr.create') && <AddPositionForm />}

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table
                        columns={[
                            {
                                key: 'title',
                                header: 'Title',
                                render: (r) => (
                                    <Link href={`/hr/job-positions/${r.id}`} className="font-medium text-slate-900 hover:text-indigo-600">
                                        {r.title}
                                    </Link>
                                ),
                            },
                            {
                                key: 'department',
                                header: 'Department',
                                render: (r) => (
                                    <span className="text-sm text-slate-700">{r.department ?? r.department_obj?.name ?? '—'}</span>
                                ),
                            },
                            {
                                key: 'employment_type',
                                header: 'Type',
                                render: (r) => (
                                    <span className="text-sm text-slate-700">{EMPLOYMENT_TYPE_LABELS[r.employment_type] ?? r.employment_type}</span>
                                ),
                            },
                            {
                                key: 'openings',
                                header: 'Openings',
                                render: (r) => (
                                    <span className="text-sm text-slate-700">{r.openings}</span>
                                ),
                            },
                            {
                                key: 'applications_count',
                                header: 'Applications',
                                render: (r) => (
                                    <span className="text-sm text-slate-700">{r.application_count ?? r.applications_count ?? 0}</span>
                                ),
                            },
                            {
                                key: 'status',
                                header: 'Status',
                                render: (r) => <StatusBadge position={r} />,
                            },
                            {
                                key: 'actions',
                                header: '',
                                render: (r) => (
                                    <Link href={`/hr/job-positions/${r.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                                        View
                                    </Link>
                                ),
                            },
                        ]}
                        data={positions.data}
                        emptyMessage="No job positions found."
                    />
                    <Pagination paginator={positions} />
                </div>
            </div>
        </AppLayout>
    );
}
