import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { Invoice, Bill } from '@/types/finance';
import { useState, useEffect, useCallback } from 'react';

type OpenItem = (Invoice | Bill) & {
    total?: number;
    amount_paid?: number;
    amount_due?: number;
    contact?: { id: number; name: string } | null;
};

interface Props extends PageProps {
    openItems: OpenItem[];
    type: 'received' | 'made';
}

interface PaymentRow {
    id: number;
    amount: string;
    selected: boolean;
}

export default function BatchPaymentCreate({ openItems, type }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        reference: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'bank_transfer' as string,
        type,
        notes: '',
        payments: [] as Array<{ id: number; amount: number }>,
    });

    const [rows, setRows] = useState<PaymentRow[]>(() =>
        openItems.map((item) => ({
            id: item.id,
            amount: String(((item.total ?? 0) - (item.amount_paid ?? 0)).toFixed(2)),
            selected: false,
        }))
    );

    const [selectAll, setSelectAll] = useState(false);

    const updatePayments = useCallback((updatedRows: PaymentRow[]) => {
        const selected = updatedRows
            .filter((r) => r.selected && parseFloat(r.amount) > 0)
            .map((r) => ({ id: r.id, amount: parseFloat(r.amount) }));
        setData('payments', selected);
    }, [setData]);

    function handleSelectAll() {
        const newVal = !selectAll;
        setSelectAll(newVal);
        const updated = rows.map((r) => ({ ...r, selected: newVal }));
        setRows(updated);
        updatePayments(updated);
    }

    function handleRowSelect(id: number) {
        const updated = rows.map((r) => r.id === id ? { ...r, selected: !r.selected } : r);
        setRows(updated);
        setSelectAll(updated.every((r) => r.selected));
        updatePayments(updated);
    }

    function handleAmountChange(id: number, amount: string) {
        const updated = rows.map((r) => r.id === id ? { ...r, amount } : r);
        setRows(updated);
        updatePayments(updated);
    }

    const total = rows
        .filter((r) => r.selected)
        .reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/finance/batch-payments');
    }

    const typeLabel = type === 'received' ? 'Receive from Customers' : 'Pay Suppliers';

    return (
        <AppLayout>
            <Head title={`New Batch Payment — ${typeLabel}`} />
            <div className="space-y-6 max-w-5xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">New Batch Payment</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Type:{' '}
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                                type === 'received' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                            }`}>
                                {type}
                            </span>
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Payment Details */}
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-6 grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Reference <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.reference}
                                onChange={(e) => setData('reference', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g. BATCH-001"
                            />
                            {errors.reference && <p className="mt-1 text-xs text-red-600">{errors.reference}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Payment Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={data.payment_date}
                                onChange={(e) => setData('payment_date', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            {errors.payment_date && <p className="mt-1 text-xs text-red-600">{errors.payment_date}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Payment Method <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.payment_method}
                                onChange={(e) => setData('payment_method', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="cheque">Cheque</option>
                                <option value="cash">Cash</option>
                                <option value="card">Card</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                            <input
                                type="text"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Optional notes..."
                            />
                        </div>
                    </div>

                    {/* Open Items Table */}
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                            <h2 className="text-sm font-medium text-slate-700">
                                {type === 'received' ? 'Open Invoices' : 'Outstanding Bills'}
                            </h2>
                        </div>
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                                        <input
                                            type="checkbox"
                                            checked={selectAll}
                                            onChange={handleSelectAll}
                                            className="rounded border-slate-300"
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Reference</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Due Date</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Outstanding</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Amount to Pay</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {openItems.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                                            No open {type === 'received' ? 'invoices' : 'bills'} found.
                                        </td>
                                    </tr>
                                )}
                                {openItems.map((item, idx) => {
                                    const row = rows[idx];
                                    const outstanding = (item.total ?? 0) - (item.amount_paid ?? 0);
                                    return (
                                        <tr key={item.id} className={row?.selected ? 'bg-indigo-50' : 'hover:bg-slate-50'}>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={row?.selected ?? false}
                                                    onChange={() => handleRowSelect(item.id)}
                                                    className="rounded border-slate-300"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                                {'number' in item ? item.number : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">
                                                {item.contact?.name ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">
                                                {item.due_date ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-slate-900 font-medium">
                                                {outstanding.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <input
                                                    type="number"
                                                    min="0.01"
                                                    step="0.01"
                                                    max={outstanding}
                                                    value={row?.amount ?? ''}
                                                    onChange={(e) => handleAmountChange(item.id, e.target.value)}
                                                    disabled={!row?.selected}
                                                    className="w-28 rounded-md border border-slate-300 px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400"
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Total & Submit */}
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-600">
                            {errors.payments && <p className="text-red-600">{errors.payments}</p>}
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-xs text-slate-500">Total Payment</p>
                                <p className="text-xl font-semibold text-slate-900">{total.toFixed(2)}</p>
                            </div>
                            <Button type="submit" disabled={processing || data.payments.length === 0}>
                                {processing ? 'Recording...' : 'Record Batch Payment'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
