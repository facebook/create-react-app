import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { DisciplinaryCase } from '@/types/hr';

interface Props extends PageProps {
    disciplinaryCase: DisciplinaryCase;
}

const STATUS_COLORS: Record<string, string> = {
    open:                'bg-blue-100 text-blue-700',
    under_investigation: 'bg-yellow-100 text-yellow-700',
    hearing_scheduled:   'bg-purple-100 text-purple-700',
    resolved:            'bg-green-100 text-green-700',
    closed:              'bg-slate-100 text-slate-700',
};

const SEVERITY_COLORS: Record<string, string> = {
    minor:    'bg-slate-100 text-slate-700',
    moderate: 'bg-yellow-100 text-yellow-700',
    major:    'bg-orange-100 text-orange-700',
    gross:    'bg-red-100 text-red-700',
};

const OUTCOMES = [
    { value: 'warning', label: 'Warning' },
    { value: 'final_warning', label: 'Final Warning' },
    { value: 'suspension', label: 'Suspension' },
    { value: 'dismissal', label: 'Dismissal' },
    { value: 'no_action', label: 'No Action' },
];

const STATUS_STEPS = ['open', 'under_investigation', 'hearing_scheduled', 'resolved', 'closed'];

export default function DisciplinaryCaseShow({ disciplinaryCase: dc }: Props) {
    const { can } = usePermission();

    const hearingForm = useForm({ hearing_date: '' });
    const resolveForm = useForm({ outcome: 'warning', outcome_notes: '' });

    function handleScheduleHearing(e: React.FormEvent) {
        e.preventDefault();
        hearingForm.post(`/hr/disciplinary-cases/${dc.id}/schedule-hearing`);
    }

    function handleResolve(e: React.FormEvent) {
        e.preventDefault();
        resolveForm.post(`/hr/disciplinary-cases/${dc.id}/resolve`);
    }

    function handleClose() {
        if (confirm('Close this case?')) {
            router.post(`/hr/disciplinary-cases/${dc.id}/close`);
        }
    }

    const currentStep = STATUS_STEPS.indexOf(dc.status);

    return (
        <AppLayout>
            <Head title={`Disciplinary Case ${dc.reference ?? `#${dc.id}`}`} />
            <div className="mx-auto max-w-3xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            {dc.reference ?? `Case #${dc.id}`}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Disciplinary Case Details
                        </p>
                    </div>
                    <Link href="/hr/disciplinary-cases">
                        <Button variant="secondary">Back</Button>
                    </Link>
                </div>

                {/* Status Timeline */}
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        {STATUS_STEPS.map((step, i) => (
                            <div key={step} className="flex flex-1 items-center">
                                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${i <= currentStep ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                    {i + 1}
                                </div>
                                <span className={`ml-1 text-xs capitalize hidden sm:inline ${i <= currentStep ? 'text-indigo-700' : 'text-slate-400'}`}>
                                    {step.replace('_', ' ')}
                                </span>
                                {i < STATUS_STEPS.length - 1 && (
                                    <div className={`mx-2 h-0.5 flex-1 ${i < currentStep ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Case Details */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900">Case Details</h2>
                    <dl className="grid grid-cols-2 gap-4">
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Employee</dt>
                            <dd className="mt-1 text-sm text-slate-900">
                                {dc.employee ? `${dc.employee.first_name} ${dc.employee.last_name}` : '—'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Incident Type</dt>
                            <dd className="mt-1 text-sm text-slate-900 capitalize">{dc.incident_type.replace('_', ' ')}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Severity</dt>
                            <dd className="mt-1">
                                <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium capitalize ${SEVERITY_COLORS[dc.severity] ?? ''}`}>
                                    {dc.severity}
                                </span>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Status</dt>
                            <dd className="mt-1">
                                <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[dc.status] ?? ''}`}>
                                    {dc.status.replace('_', ' ')}
                                </span>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Incident Date</dt>
                            <dd className="mt-1 text-sm text-slate-900">{dc.incident_date}</dd>
                        </div>
                        {dc.hearing_date && (
                            <div>
                                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Hearing Date</dt>
                                <dd className="mt-1 text-sm text-slate-900">{dc.hearing_date}</dd>
                            </div>
                        )}
                        {dc.outcome && (
                            <div>
                                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Outcome</dt>
                                <dd className="mt-1 text-sm text-slate-900 capitalize">{dc.outcome.replace('_', ' ')}</dd>
                            </div>
                        )}
                        {dc.resolved_date && (
                            <div>
                                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Resolved Date</dt>
                                <dd className="mt-1 text-sm text-slate-900">{dc.resolved_date}</dd>
                            </div>
                        )}
                    </dl>
                    <div>
                        <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Description</dt>
                        <dd className="mt-1 text-sm text-slate-900 whitespace-pre-wrap">{dc.description}</dd>
                    </div>
                    {dc.outcome_notes && (
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Outcome Notes</dt>
                            <dd className="mt-1 text-sm text-slate-900 whitespace-pre-wrap">{dc.outcome_notes}</dd>
                        </div>
                    )}
                </div>

                {/* Actions */}
                {can('hr.create') && dc.is_open && (
                    <div className="space-y-4">
                        {/* Schedule Hearing */}
                        {dc.status !== 'hearing_scheduled' && (
                            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                                <h2 className="text-lg font-semibold text-slate-900 mb-4">Schedule Hearing</h2>
                                <form onSubmit={handleScheduleHearing} className="flex items-end gap-3">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Hearing Date</label>
                                        <input
                                            type="date"
                                            value={hearingForm.data.hearing_date}
                                            onChange={(e) => hearingForm.setData('hearing_date', e.target.value)}
                                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        />
                                        {hearingForm.errors.hearing_date && (
                                            <p className="mt-1 text-xs text-red-600">{hearingForm.errors.hearing_date}</p>
                                        )}
                                    </div>
                                    <Button type="submit" disabled={hearingForm.processing}>
                                        Schedule
                                    </Button>
                                </form>
                            </div>
                        )}

                        {/* Resolve */}
                        {!['resolved', 'closed'].includes(dc.status) && (
                            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                                <h2 className="text-lg font-semibold text-slate-900 mb-4">Resolve Case</h2>
                                <form onSubmit={handleResolve} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Outcome</label>
                                        <select
                                            value={resolveForm.data.outcome}
                                            onChange={(e) => resolveForm.setData('outcome', e.target.value)}
                                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        >
                                            {OUTCOMES.map((o) => (
                                                <option key={o.value} value={o.value}>{o.label}</option>
                                            ))}
                                        </select>
                                        {resolveForm.errors.outcome && (
                                            <p className="mt-1 text-xs text-red-600">{resolveForm.errors.outcome}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Notes <span className="text-slate-400">(optional)</span></label>
                                        <textarea
                                            value={resolveForm.data.outcome_notes}
                                            onChange={(e) => resolveForm.setData('outcome_notes', e.target.value)}
                                            rows={3}
                                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={resolveForm.processing}>
                                            Resolve Case
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Close */}
                        <div className="flex justify-end">
                            <Button type="button" variant="secondary" onClick={handleClose}>
                                Close Case
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
