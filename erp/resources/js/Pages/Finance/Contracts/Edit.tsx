import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { Contact, Contract } from '@/types/finance';

interface Props extends PageProps {
    contract: Contract;
    contacts: Pick<Contact, 'id' | 'name'>[];
}

export default function ContractEdit({ contract, contacts }: Props) {
    const [form, setForm] = useState({
        title:               contract.title,
        reference:           contract.reference ?? '',
        contact_id:          contract.contact_id ?? ('' as number | ''),
        type:                contract.type,
        status:              contract.status,
        value:               contract.value ?? ('' as number | ''),
        currency_code:       contract.currency_code ?? '',
        start_date:          contract.start_date ?? '',
        end_date:            contract.end_date ?? '',
        auto_renew:          contract.auto_renew,
        renewal_notice_days: contract.renewal_notice_days,
        description:         contract.description ?? '',
        terms:               contract.terms ?? '',
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);
        router.patch(`/finance/contracts/${contract.id}`, form, {
            onError: (errs) => { setErrors(errs); setProcessing(false); },
            onFinish: () => setProcessing(false),
        });
    }

    function field(name: string) {
        return { className: `mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none ${errors[name] ? 'border-red-500' : ''}` };
    }

    return (
        <AppLayout>
            <Head title={`Edit: ${contract.title}`} />
            <div className="mx-auto max-w-3xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Edit Contract</h1>
                    <p className="mt-1 text-sm text-slate-500">{contract.title}</p>
                </div>

                <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700">Title *</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                required
                                {...field('title')}
                            />
                            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Reference / Contract #</label>
                            <input
                                type="text"
                                value={form.reference}
                                onChange={(e) => setForm({ ...form, reference: e.target.value })}
                                {...field('reference')}
                            />
                            {errors.reference && <p className="mt-1 text-xs text-red-600">{errors.reference}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Contact</label>
                            <select
                                value={form.contact_id}
                                onChange={(e) => setForm({ ...form, contact_id: e.target.value ? Number(e.target.value) : '' })}
                                {...field('contact_id')}
                            >
                                <option value="">No contact</option>
                                {contacts.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            {errors.contact_id && <p className="mt-1 text-xs text-red-600">{errors.contact_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Type *</label>
                            <select
                                value={form.type}
                                onChange={(e) => setForm({ ...form, type: e.target.value })}
                                required
                                {...field('type')}
                            >
                                <option value="client">Client</option>
                                <option value="vendor">Vendor</option>
                                <option value="employment">Employment</option>
                                <option value="nda">NDA</option>
                                <option value="other">Other</option>
                            </select>
                            {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Status</label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                                {...field('status')}
                            >
                                <option value="draft">Draft</option>
                                <option value="active">Active</option>
                                <option value="expired">Expired</option>
                                <option value="terminated">Terminated</option>
                            </select>
                            {errors.status && <p className="mt-1 text-xs text-red-600">{errors.status}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Value</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.value}
                                onChange={(e) => setForm({ ...form, value: e.target.value ? Number(e.target.value) : '' })}
                                {...field('value')}
                            />
                            {errors.value && <p className="mt-1 text-xs text-red-600">{errors.value}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Currency Code</label>
                            <input
                                type="text"
                                maxLength={3}
                                value={form.currency_code}
                                onChange={(e) => setForm({ ...form, currency_code: e.target.value.toUpperCase() })}
                                placeholder="USD"
                                {...field('currency_code')}
                            />
                            {errors.currency_code && <p className="mt-1 text-xs text-red-600">{errors.currency_code}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Start Date</label>
                            <input
                                type="date"
                                value={form.start_date}
                                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                                {...field('start_date')}
                            />
                            {errors.start_date && <p className="mt-1 text-xs text-red-600">{errors.start_date}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">End Date</label>
                            <input
                                type="date"
                                value={form.end_date}
                                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                                {...field('end_date')}
                            />
                            {errors.end_date && <p className="mt-1 text-xs text-red-600">{errors.end_date}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Renewal Notice (days)</label>
                            <input
                                type="number"
                                min="0"
                                value={form.renewal_notice_days}
                                onChange={(e) => setForm({ ...form, renewal_notice_days: Number(e.target.value) })}
                                {...field('renewal_notice_days')}
                            />
                            {errors.renewal_notice_days && <p className="mt-1 text-xs text-red-600">{errors.renewal_notice_days}</p>}
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.auto_renew}
                                    onChange={(e) => setForm({ ...form, auto_renew: e.target.checked })}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                Auto Renew
                            </label>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700">Description</label>
                            <textarea
                                rows={3}
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                {...field('description')}
                            />
                            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700">Terms & Conditions</label>
                            <textarea
                                rows={5}
                                value={form.terms}
                                onChange={(e) => setForm({ ...form, terms: e.target.value })}
                                {...field('terms')}
                            />
                            {errors.terms && <p className="mt-1 text-xs text-red-600">{errors.terms}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <a href={`/finance/contracts/${contract.id}`} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            Cancel
                        </a>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving…' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
