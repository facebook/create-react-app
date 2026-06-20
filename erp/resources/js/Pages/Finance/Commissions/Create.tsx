import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { CommissionRule, Invoice } from '@/types/finance';

interface Props extends PageProps {
    rules: Pick<CommissionRule, 'id' | 'name' | 'user_id'>[];
    invoices: Pick<Invoice, 'id' | 'number'>[];
}

export default function CommissionCreate({ rules, invoices }: Props) {
    const [form, setForm] = useState({
        commission_rule_id: '' as number | '',
        invoice_id: '' as number | '',
        notes: '',
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);
        router.post('/finance/commissions', form, {
            onError: (errs) => { setErrors(errs); setProcessing(false); },
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <AppLayout>
            <Head title="New Commission" />
            <div className="mx-auto max-w-2xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">New Commission</h1>
                </div>

                <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Commission Rule *</label>
                        <select
                            value={form.commission_rule_id}
                            onChange={(e) => setForm({ ...form, commission_rule_id: e.target.value ? Number(e.target.value) : '' })}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            required
                        >
                            <option value="">Select rule…</option>
                            {rules.map((r) => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                        {errors.commission_rule_id && <p className="mt-1 text-xs text-red-600">{errors.commission_rule_id}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Invoice *</label>
                        <select
                            value={form.invoice_id}
                            onChange={(e) => setForm({ ...form, invoice_id: e.target.value ? Number(e.target.value) : '' })}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            required
                        >
                            <option value="">Select invoice…</option>
                            {invoices.map((inv) => (
                                <option key={inv.id} value={inv.id}>{inv.number ?? `#${inv.id}`}</option>
                            ))}
                        </select>
                        {errors.invoice_id && <p className="mt-1 text-xs text-red-600">{errors.invoice_id}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Notes</label>
                        <textarea
                            rows={3}
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                        />
                        {errors.notes && <p className="mt-1 text-xs text-red-600">{errors.notes}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <a href="/finance/commissions" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            Cancel
                        </a>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving…' : 'Create Commission'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
