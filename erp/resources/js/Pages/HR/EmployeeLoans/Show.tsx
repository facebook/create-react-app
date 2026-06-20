import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { Table } from '@/Components/Common/Table';
import type { PageProps } from '@/types';
import type { EmployeeLoan, LoanRepayment } from '@/types/hr';

interface Props extends PageProps {
    loan: EmployeeLoan;
    can: {
        create: boolean;
        delete: boolean;
    };
}

type LoanStatus = 'pending' | 'active' | 'completed' | 'cancelled';

function StatusBadge({ status }: { status: LoanStatus }) {
    const classes: Record<LoanStatus, string> = {
        pending:   'bg-amber-100 text-amber-800',
        active:    'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${classes[status]}`}>
            {status}
        </span>
    );
}

export default function EmployeeLoanShow({ loan, can: permCan }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        amount:       '',
        payment_date: '',
        notes:        '',
    });

    function handleApprove() {
        if (!confirm('Approve this loan?')) return;
        router.post(`/hr/employee-loans/${loan.id}/approve`);
    }

    function handleCancel() {
        if (!confirm('Cancel this loan?')) return;
        router.post(`/hr/employee-loans/${loan.id}/cancel`);
    }

    function handleDelete() {
        if (!confirm('Delete this loan? This cannot be undone.')) return;
        router.delete(`/hr/employee-loans/${loan.id}`);
    }

    function handleRepaymentSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(`/hr/employee-loans/${loan.id}/repayments`, {
            onSuccess: () => reset(),
        });
    }

    return (
        <AppLayout>
            <Head title={`Loan #${loan.id}`} />
            <div className="mx-auto max-w-3xl space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            {loan.type === 'loan' ? 'Loan' : 'Advance'} #{loan.id}
                        </h1>
                        <div className="mt-1 flex items-center gap-3">
                            <StatusBadge status={loan.status} />
                            {loan.is_fully_repaid && (
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                    Fully Repaid
                                </span>
                            )}
                            <span className="text-sm text-slate-500">
                                {loan.employee?.full_name ?? '—'}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {permCan.create && loan.status === 'pending' && (
                            <>
                                <Button onClick={handleApprove}>Approve</Button>
                                <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
                            </>
                        )}
                        {permCan.delete && loan.status === 'pending' && (
                            <Button variant="danger" onClick={handleDelete}>Delete</Button>
                        )}
                    </div>
                </div>

                {/* Loan Details */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-base font-semibold text-slate-900 mb-4">Loan Details</h2>
                    <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
                        {[
                            { label: 'Employee',     value: loan.employee?.full_name ?? '—' },
                            { label: 'Type',         value: <span className="capitalize">{loan.type}</span> },
                            { label: 'Amount',       value: Number(loan.amount).toFixed(2) },
                            { label: 'Outstanding',  value: Number(loan.outstanding_balance).toFixed(2) },
                            { label: 'Total Repaid', value: Number(loan.total_repaid).toFixed(2) },
                            { label: 'Interest Rate', value: `${Number(loan.interest_rate).toFixed(2)}%` },
                            { label: 'Status',       value: <StatusBadge status={loan.status} /> },
                            { label: 'Repayment Start', value: loan.repayment_start_date ?? '—' },
                            { label: 'Approved At',  value: loan.approved_at ? new Date(loan.approved_at).toLocaleDateString() : '—' },
                            { label: 'Disbursed At', value: loan.disbursed_at ? new Date(loan.disbursed_at).toLocaleDateString() : '—' },
                        ].map(({ label, value }) => (
                            <div key={label}>
                                <dt className="text-xs text-slate-500">{label}</dt>
                                <dd className="mt-0.5 text-sm font-medium text-slate-800">{value}</dd>
                            </div>
                        ))}
                    </dl>
                    {loan.purpose && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <dt className="text-xs text-slate-500 mb-1">Purpose</dt>
                            <dd className="text-sm text-slate-700">{loan.purpose}</dd>
                        </div>
                    )}
                    {loan.notes && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <dt className="text-xs text-slate-500 mb-1">Notes</dt>
                            <dd className="text-sm text-slate-700">{loan.notes}</dd>
                        </div>
                    )}
                </div>

                {/* Repayments Table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="text-base font-semibold text-slate-900">Repayments</h2>
                    </div>
                    <Table<LoanRepayment>
                        columns={[
                            {
                                key: 'payment_date',
                                header: 'Date',
                                render: (r) => <span className="text-sm text-slate-700">{r.payment_date}</span>,
                            },
                            {
                                key: 'amount',
                                header: 'Amount',
                                render: (r) => (
                                    <span className="text-sm font-medium text-slate-900">
                                        {Number(r.amount).toFixed(2)}
                                    </span>
                                ),
                            },
                            {
                                key: 'notes',
                                header: 'Notes',
                                render: (r) => <span className="text-sm text-slate-500">{r.notes ?? '—'}</span>,
                            },
                        ]}
                        data={loan.repayments ?? []}
                        emptyMessage="No repayments recorded yet."
                    />
                </div>

                {/* Add Repayment Form */}
                {permCan.create && loan.status === 'active' && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-slate-900 mb-4">Record Repayment</h2>
                        <form onSubmit={handleRepaymentSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="0.00"
                                    />
                                    {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Payment Date</label>
                                    <input
                                        type="date"
                                        value={data.payment_date}
                                        onChange={(e) => setData('payment_date', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                    {errors.payment_date && <p className="mt-1 text-xs text-red-600">{errors.payment_date}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Notes <span className="text-slate-400">(optional)</span>
                                </label>
                                <textarea
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={2}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {errors.notes && <p className="mt-1 text-xs text-red-600">{errors.notes}</p>}
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving…' : 'Record Repayment'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                <Link href="/hr/employee-loans">
                    <Button variant="secondary">Back to Loans</Button>
                </Link>
            </div>
        </AppLayout>
    );
}
