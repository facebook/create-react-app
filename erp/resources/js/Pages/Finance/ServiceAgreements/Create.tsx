import { Head, Link } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { Contact } from '@/types/finance';

interface Props extends PageProps {
    contacts: Contact[];
}

export default function ServiceAgreementCreate({ contacts }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title:          '',
        contact_id:     '',
        agreement_type: 'maintenance' as 'maintenance' | 'support' | 'sla' | 'retainer',
        billing_cycle:  'monthly' as 'monthly' | 'quarterly' | 'annually' | 'one_time',
        start_date:     '',
        end_date:       '',
        value:          '',
        auto_renew:     false,
        description:    '',
        terms:          '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/finance/service-agreements');
    }

    return (
        <AppLayout>
            <Head title="New Service Agreement" />
            <div className="mx-auto max-w-2xl space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">New Service Agreement</h1>
                    <Link href="/finance/service-agreements"><Button variant="secondary">Back</Button></Link>
                </div>
                <form onSubmit={submit} className="space-y-6">
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Contact</label>
                            <select
                                value={data.contact_id}
                                onChange={(e) => setData('contact_id', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            >
                                <option value="">None</option>
                                {contacts.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Agreement Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.agreement_type}
                                    onChange={(e) => setData('agreement_type', e.target.value as typeof data.agreement_type)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                >
                                    <option value="maintenance">Maintenance</option>
                                    <option value="support">Support</option>
                                    <option value="sla">SLA</option>
                                    <option value="retainer">Retainer</option>
                                </select>
                                {errors.agreement_type && <p className="mt-1 text-xs text-red-500">{errors.agreement_type}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Billing Cycle <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.billing_cycle}
                                    onChange={(e) => setData('billing_cycle', e.target.value as typeof data.billing_cycle)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                >
                                    <option value="monthly">Monthly</option>
                                    <option value="quarterly">Quarterly</option>
                                    <option value="annually">Annually</option>
                                    <option value="one_time">One Time</option>
                                </select>
                                {errors.billing_cycle && <p className="mt-1 text-xs text-red-500">{errors.billing_cycle}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e) => setData('end_date', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Value</label>
                            <input
                                type="number"
                                min={0}
                                step={0.01}
                                value={data.value}
                                onChange={(e) => setData('value', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            />
                            {errors.value && <p className="mt-1 text-xs text-red-500">{errors.value}</p>}
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={data.auto_renew}
                                    onChange={(e) => setData('auto_renew', e.target.checked)}
                                    className="rounded border-slate-300 text-indigo-600"
                                />
                                Auto Renew
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Terms</label>
                            <textarea
                                value={data.terms}
                                onChange={(e) => setData('terms', e.target.value)}
                                rows={3}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Link href="/finance/service-agreements"><Button type="button" variant="secondary">Cancel</Button></Link>
                        <Button type="submit" disabled={processing}>Create Agreement</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
