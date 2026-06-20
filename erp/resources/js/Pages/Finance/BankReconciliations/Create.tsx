import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { useState } from 'react';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    bankAccounts: { id: number; name: string; bank_name: string }[];
}

export default function BankReconciliationsCreate({ bankAccounts }: Props) {
    const [form, setForm] = useState({
        bank_account_id: '',
        statement_date: '',
        statement_balance: '',
        notes: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        router.post('/finance/bank-reconciliations', form as any);
    }

    return (
        <AppLayout>
            <Head title="New Reconciliation" />
            <div className="max-w-2xl mx-auto space-y-6">
                <h1 className="text-2xl font-semibold text-slate-900">New Bank Reconciliation</h1>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Bank Account</label>
                            <select
                                value={form.bank_account_id}
                                onChange={e => setForm({ ...form, bank_account_id: e.target.value })}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                required
                            >
                                <option value="">Select account...</option>
                                {bankAccounts.map(a => (
                                    <option key={a.id} value={a.id}>{a.name} — {a.bank_name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Statement Date</label>
                            <input
                                type="date"
                                value={form.statement_date}
                                onChange={e => setForm({ ...form, statement_date: e.target.value })}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Statement Balance</label>
                            <input
                                type="number"
                                step="0.01"
                                value={form.statement_balance}
                                onChange={e => setForm({ ...form, statement_balance: e.target.value })}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                            <textarea
                                value={form.notes}
                                onChange={e => setForm({ ...form, notes: e.target.value })}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                rows={3}
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button type="submit">Create Reconciliation</Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
