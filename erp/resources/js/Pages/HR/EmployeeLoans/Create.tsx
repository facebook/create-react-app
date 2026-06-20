import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    employees: { id: number; full_name: string }[];
}

export default function EmployeeLoansCreate({ employees }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        employee_id:          '' as string | number,
        type:                 'loan' as 'loan' | 'advance',
        amount:               '',
        interest_rate:        '',
        purpose:              '',
        repayment_start_date: '',
        notes:                '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/hr/employee-loans');
    }

    return (
        <AppLayout>
            <Head title="New Loan / Advance" />
            <div className="mx-auto max-w-2xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">New Loan / Advance</h1>
                    <p className="text-sm text-slate-500 mt-1">Create a salary advance or loan for an employee.</p>
                </div>

                <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                    {/* Employee */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Employee</label>
                        <select
                            value={data.employee_id}
                            onChange={(e) => setData('employee_id', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="">Select employee…</option>
                            {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                            ))}
                        </select>
                        {errors.employee_id && <p className="mt-1 text-xs text-red-600">{errors.employee_id}</p>}
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                        <select
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value as 'loan' | 'advance')}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="loan">Loan</option>
                            <option value="advance">Advance</option>
                        </select>
                        {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type}</p>}
                    </div>

                    {/* Amount + Interest Rate row */}
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
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Interest Rate (%) <span className="text-slate-400">(optional)</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={data.interest_rate}
                                onChange={(e) => setData('interest_rate', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="0.00"
                            />
                            {errors.interest_rate && <p className="mt-1 text-xs text-red-600">{errors.interest_rate}</p>}
                        </div>
                    </div>

                    {/* Purpose */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Purpose <span className="text-slate-400">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={data.purpose}
                            onChange={(e) => setData('purpose', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="e.g. Medical emergency"
                        />
                        {errors.purpose && <p className="mt-1 text-xs text-red-600">{errors.purpose}</p>}
                    </div>

                    {/* Repayment Start Date */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Repayment Start Date <span className="text-slate-400">(optional)</span>
                        </label>
                        <input
                            type="date"
                            value={data.repayment_start_date}
                            onChange={(e) => setData('repayment_start_date', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {errors.repayment_start_date && <p className="mt-1 text-xs text-red-600">{errors.repayment_start_date}</p>}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Notes <span className="text-slate-400">(optional)</span>
                        </label>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows={3}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {errors.notes && <p className="mt-1 text-xs text-red-600">{errors.notes}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Link href="/hr/employee-loans">
                            <Button type="button" variant="secondary">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving…' : 'Create Loan'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
