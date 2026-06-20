import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Stage    { id: number; name: string }
interface User     { id: number; name: string }
interface Activity {
    id: number; type: string; subject: string; description: string | null;
    scheduled_at: string | null; completed_at: string | null; is_done: boolean;
    assignee: User | null;
}
interface Lead {
    id: number; reference: string | null; title: string; type: string; status: string;
    priority: string; expected_revenue: number; probability: number;
    expected_close_date: string | null; contact_name: string | null; company_name: string | null;
    email: string | null; phone: string | null; website: string | null; source: string | null;
    description: string | null; lost_reason: string | null; won_at: string | null;
    stage: Stage | null; assignee: User | null; activities: Activity[];
}
interface Props extends PageProps { lead: Lead; stages: Stage[]; users: User[] }

const statusBadge: Record<string,string> = {
    open: 'bg-blue-100 text-blue-700', won: 'bg-green-100 text-green-700', lost: 'bg-red-100 text-red-700',
};
const activityIcon: Record<string,string> = {
    call:'📞', meeting:'📅', email:'✉️', task:'✅', note:'📝',
};

function fmt(n: number) {
    return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
}

export default function LeadsShow({ lead, stages, users }: Props) {
    const activityForm = useForm({
        type: 'call', subject: '', description: '', scheduled_at: '', assigned_to: '',
    });
    const lostForm = useForm({ lost_reason: '' });

    const inputCls = 'mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';
    const labelCls = 'block text-sm font-medium text-slate-700';

    function markWon() {
        if (confirm('Mark this lead as won?')) {
            router.post(`/crm/leads/${lead.id}/mark-won`);
        }
    }

    function markLost() {
        lostForm.post(`/crm/leads/${lead.id}/mark-lost`);
    }

    function convert() {
        router.post(`/crm/leads/${lead.id}/convert`);
    }

    function submitActivity(e: React.FormEvent) {
        e.preventDefault();
        activityForm.post(`/crm/leads/${lead.id}/activities`, { onSuccess: () => activityForm.reset() });
    }

    return (
        <AppLayout>
            <Head title={lead.title} />
            <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold text-slate-900">{lead.title}</h1>
                            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[lead.status] ?? statusBadge.open}`}>{lead.status}</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{lead.reference ?? `#${lead.id}`} · {lead.type}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {lead.status === 'open' && lead.type === 'lead' && (
                            <Button type="button" onClick={convert}>Convert to Opportunity</Button>
                        )}
                        {lead.status === 'open' && (
                            <>
                                <button onClick={markWon} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">Mark Won</button>
                                <button onClick={() => lostForm.post(`/crm/leads/${lead.id}/mark-lost`)}
                                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Mark Lost</button>
                            </>
                        )}
                        <Link href={`/crm/leads/${lead.id}/edit`} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Edit</Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Details card */}
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-base font-semibold text-slate-800 mb-4">Details</h2>
                            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                                {[
                                    ['Contact', lead.contact_name],
                                    ['Company', lead.company_name],
                                    ['Email', lead.email],
                                    ['Phone', lead.phone],
                                    ['Website', lead.website],
                                    ['Source', lead.source],
                                    ['Stage', lead.stage?.name],
                                    ['Assigned To', lead.assignee?.name],
                                    ['Expected Revenue', lead.expected_revenue ? fmt(lead.expected_revenue) : null],
                                    ['Probability', lead.probability ? `${lead.probability}%` : null],
                                    ['Close Date', lead.expected_close_date],
                                    ['Priority', lead.priority],
                                ].map(([label, value]) => value ? (
                                    <div key={label as string}>
                                        <dt className="text-xs font-medium uppercase text-slate-500">{label}</dt>
                                        <dd className="mt-1 text-sm text-slate-900">{value}</dd>
                                    </div>
                                ) : null)}
                            </dl>
                            {lead.description && (
                                <div className="mt-4 border-t border-slate-100 pt-4">
                                    <p className="text-xs font-medium uppercase text-slate-500 mb-1">Description</p>
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{lead.description}</p>
                                </div>
                            )}
                            {lead.lost_reason && (
                                <div className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">
                                    <strong>Lost reason:</strong> {lead.lost_reason}
                                </div>
                            )}
                        </div>

                        {/* Activities */}
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-200 px-6 py-4">
                                <h2 className="text-base font-semibold text-slate-800">Activities</h2>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {lead.activities.length === 0 && (
                                    <p className="px-6 py-8 text-center text-sm text-slate-400">No activities yet</p>
                                )}
                                {lead.activities.map((act) => (
                                    <div key={act.id} className="flex items-start gap-3 px-6 py-4">
                                        <span className="text-lg">{activityIcon[act.type] ?? '•'}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900">{act.subject}</p>
                                            {act.description && <p className="text-xs text-slate-500 mt-0.5">{act.description}</p>}
                                            <p className="text-xs text-slate-400 mt-1">
                                                {act.scheduled_at ?? 'No date'}{act.assignee ? ` · ${act.assignee.name}` : ''}
                                            </p>
                                        </div>
                                        {!act.is_done && (
                                            <button
                                                onClick={() => router.post(`/crm/activities/${act.id}/mark-done`)}
                                                className="text-xs text-green-600 hover:text-green-800 font-medium"
                                            >Done</button>
                                        )}
                                        {act.is_done && <span className="text-xs text-slate-400">Done</span>}
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-slate-200 px-6 py-4">
                                <h3 className="text-sm font-medium text-slate-700 mb-3">Log Activity</h3>
                                <form onSubmit={submitActivity} className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className={labelCls}>Type</label>
                                            <select className={inputCls} value={activityForm.data.type} onChange={e => activityForm.setData('type', e.target.value)}>
                                                {['call','meeting','email','task','note'].map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelCls}>Scheduled At</label>
                                            <input type="datetime-local" className={inputCls} value={activityForm.data.scheduled_at} onChange={e => activityForm.setData('scheduled_at', e.target.value)} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Subject <span className="text-red-500">*</span></label>
                                        <input type="text" className={inputCls} value={activityForm.data.subject} onChange={e => activityForm.setData('subject', e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Notes</label>
                                        <textarea rows={2} className={inputCls} value={activityForm.data.description} onChange={e => activityForm.setData('description', e.target.value)} />
                                    </div>
                                    <Button type="submit" disabled={activityForm.processing}>Log</Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
