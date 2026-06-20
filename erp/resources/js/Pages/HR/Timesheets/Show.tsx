import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { Table } from '@/Components/Common/Table';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Timesheet } from '@/types/hr';

interface Props extends PageProps {
    timesheet: Timesheet;
}

const STATUS_COLORS: Record<string, string> = {
    draft:     'bg-slate-100 text-slate-700',
    submitted: 'bg-blue-100 text-blue-700',
    approved:  'bg-green-100 text-green-700',
    rejected:  'bg-red-100 text-red-700',
};

export default function TimesheetShow({ timesheet: ts }: Props) {
    const { can } = usePermission();

    const entryForm = useForm({
        work_date:   '',
        hours:       '' as string | number,
        project:     '',
        description: '',
    });

    function handleAddEntry(e: React.FormEvent) {
        e.preventDefault();
        entryForm.post(`/hr/timesheets/${ts.id}/entries`, {
            onSuccess: () => entryForm.reset(),
        });
    }

    function handleSubmit() {
        if (confirm('Submit this timesheet for approval?')) {
            router.post(`/hr/timesheets/${ts.id}/submit`);
        }
    }

    function handleApprove() {
        if (confirm('Approve this timesheet?')) {
            router.post(`/hr/timesheets/${ts.id}/approve`);
        }
    }

    function handleReject() {
        if (confirm('Reject this timesheet?')) {
            router.post(`/hr/timesheets/${ts.id}/reject`);
        }
    }

    return (
        <AppLayout>
            <Head title={`Timesheet #${ts.id}`} />
            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            Timesheet #{ts.id}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {ts.employee ? `${ts.employee.first_name} ${ts.employee.last_name}` : '—'} &mdash;
                            {' '}{ts.week_start} to {ts.week_end}
                        </p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <span className={`inline-flex items-center rounded px-2.5 py-1 text-sm font-medium capitalize ${STATUS_COLORS[ts.status] ?? 'bg-slate-100 text-slate-700'}`}>
                            {ts.status}
                        </span>
                        <Link href="/hr/timesheets">
                            <Button variant="secondary">Back</Button>
                        </Link>
                    </div>
                </div>

                {/* Details */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <dl className="grid grid-cols-2 gap-4">
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Employee</dt>
                            <dd className="mt-1 text-sm text-slate-900">
                                {ts.employee ? `${ts.employee.first_name} ${ts.employee.last_name}` : '—'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Week</dt>
                            <dd className="mt-1 text-sm text-slate-900">{ts.week_start} &mdash; {ts.week_end}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Hours</dt>
                            <dd className="mt-1 text-sm text-slate-900 font-semibold">{ts.total_hours}h</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Status</dt>
                            <dd className="mt-1">
                                <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[ts.status] ?? ''}`}>
                                    {ts.status}
                                </span>
                            </dd>
                        </div>
                        {ts.notes && (
                            <div className="col-span-2">
                                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Notes</dt>
                                <dd className="mt-1 text-sm text-slate-900 whitespace-pre-wrap">{ts.notes}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                {/* Entries table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-200">
                        <h2 className="text-lg font-semibold text-slate-900">Time Entries</h2>
                    </div>
                    <Table
                        columns={[
                            { key: 'work_date',   header: 'Date',        render: (e) => <span>{e.work_date}</span> },
                            { key: 'hours',       header: 'Hours',       render: (e) => <span>{e.hours}h</span> },
                            { key: 'project',     header: 'Project',     render: (e) => <span>{e.project ?? '—'}</span> },
                            { key: 'description', header: 'Description', render: (e) => <span className="text-slate-600">{e.description ?? '—'}</span> },
                        ]}
                        rows={ts.entries ?? []}
                    />
                </div>

                {/* Add entry form */}
                {can('hr.create') && ts.is_editable && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Add Time Entry</h2>
                        <form onSubmit={handleAddEntry} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={entryForm.data.work_date}
                                        onChange={(e) => entryForm.setData('work_date', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                    {entryForm.errors.work_date && <p className="mt-1 text-xs text-red-600">{entryForm.errors.work_date}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Hours</label>
                                    <input
                                        type="number"
                                        step="0.25"
                                        min="0.25"
                                        max="24"
                                        value={entryForm.data.hours}
                                        onChange={(e) => entryForm.setData('hours', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                    {entryForm.errors.hours && <p className="mt-1 text-xs text-red-600">{entryForm.errors.hours}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Project <span className="text-slate-400">(optional)</span></label>
                                <input
                                    type="text"
                                    value={entryForm.data.project}
                                    onChange={(e) => entryForm.setData('project', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="Project name…"
                                />
                                {entryForm.errors.project && <p className="mt-1 text-xs text-red-600">{entryForm.errors.project}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description <span className="text-slate-400">(optional)</span></label>
                                <textarea
                                    value={entryForm.data.description}
                                    onChange={(e) => entryForm.setData('description', e.target.value)}
                                    rows={2}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="What did you work on?"
                                />
                                {entryForm.errors.description && <p className="mt-1 text-xs text-red-600">{entryForm.errors.description}</p>}
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={entryForm.processing}>
                                    {entryForm.processing ? 'Adding…' : 'Add Entry'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Action buttons */}
                {can('hr.create') && (
                    <div className="flex gap-3 justify-end">
                        {ts.status === 'draft' && (
                            <Button type="button" onClick={handleSubmit}>
                                Submit for Approval
                            </Button>
                        )}
                        {ts.status === 'submitted' && (
                            <>
                                <Button type="button" onClick={handleApprove}>
                                    Approve
                                </Button>
                                <Button type="button" variant="secondary" onClick={handleReject}>
                                    Reject
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
