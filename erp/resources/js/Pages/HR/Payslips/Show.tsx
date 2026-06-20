import React from 'react';
import { Link } from '@inertiajs/react';

interface PayslipLine { id: number; name: string; code: string; category: string; amount: string; sequence: number; }
interface Employee { id: number; first_name: string; last_name: string; employee_number: string; position?: string; department?: { name: string }; }
interface PayrollRun { id: number; status: string; period_start: string; period_end: string; payment_date?: string; }
interface Payslip {
    id: number;
    gross_amount: string;
    total_deductions: string;
    net_amount: string;
    tax_amount: string;
    notes?: string;
    employee: Employee;
    payroll_run: PayrollRun;
    lines: PayslipLine[];
}

function Amount({ value, className }: { value: string; className?: string }) {
    return <span className={className}>${parseFloat(value).toFixed(2)}</span>;
}

export default function PayslipShow({ payslip }: { payslip: Payslip }) {
    const employee = payslip.employee;
    const run      = payslip.payroll_run;
    const earnings  = payslip.lines.filter((l) => l.category === 'earning');
    const deductions = payslip.lines.filter((l) => l.category === 'deduction');

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link href={`/hr/payroll-runs/${run.id}/payslips`} className="text-blue-600 hover:underline text-sm">← Payslips</Link>
                <h1 className="text-2xl font-bold text-gray-800">Payslip #{payslip.id}</h1>
                <div className="ml-auto flex gap-2">
                    <a href={`/hr/payslips/${payslip.id}/pdf`} target="_blank" rel="noreferrer"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center gap-1">
                        Download PDF
                    </a>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden mb-6">
                {/* Header */}
                <div className="px-6 py-5 border-b flex justify-between items-start bg-gray-50">
                    <div>
                        <div className="text-lg font-bold text-gray-800">{employee.first_name} {employee.last_name}</div>
                        <div className="text-sm text-gray-500 mt-0.5">{employee.position ?? '—'} · {employee.department?.name ?? '—'}</div>
                        <div className="text-xs text-gray-400 mt-0.5">Emp #{employee.employee_number}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-500">Pay Period</div>
                        <div className="font-medium text-gray-700">
                            {new Date(run.period_start).toLocaleDateString()} — {new Date(run.period_end).toLocaleDateString()}
                        </div>
                        {run.payment_date && (
                            <div className="text-xs text-gray-400 mt-1">
                                Pay date: {new Date(run.payment_date).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                </div>

                {/* Earnings / Deductions */}
                <div className="grid grid-cols-2 gap-0 divide-x">
                    <div className="p-6">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Earnings</h3>
                        <table className="w-full text-sm">
                            <tbody>
                                {earnings.map((l) => (
                                    <tr key={l.id} className="border-b border-gray-50">
                                        <td className="py-2 text-gray-700">{l.name}</td>
                                        <td className="py-2 text-right font-medium"><Amount value={l.amount} /></td>
                                    </tr>
                                ))}
                                {earnings.length === 0 && (
                                    <tr><td colSpan={2} className="py-2 text-gray-400 text-xs">Basic salary</td></tr>
                                )}
                            </tbody>
                            <tfoot>
                                <tr className="border-t-2 border-gray-200">
                                    <td className="py-2 font-semibold text-gray-800">Gross Pay</td>
                                    <td className="py-2 text-right font-bold text-gray-800">
                                        <Amount value={payslip.gross_amount} />
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <div className="p-6">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Deductions</h3>
                        <table className="w-full text-sm">
                            <tbody>
                                {deductions.map((l) => (
                                    <tr key={l.id} className="border-b border-gray-50">
                                        <td className="py-2 text-gray-700">{l.name}</td>
                                        <td className="py-2 text-right font-medium text-red-600"><Amount value={l.amount} /></td>
                                    </tr>
                                ))}
                                {deductions.length === 0 && payslip.tax_amount !== '0.00' && (
                                    <tr className="border-b border-gray-50">
                                        <td className="py-2 text-gray-700">Income Tax</td>
                                        <td className="py-2 text-right font-medium text-red-600"><Amount value={payslip.tax_amount} /></td>
                                    </tr>
                                )}
                                {deductions.length === 0 && payslip.tax_amount === '0.00' && (
                                    <tr><td colSpan={2} className="py-2 text-gray-400 text-xs">No deductions</td></tr>
                                )}
                            </tbody>
                            <tfoot>
                                <tr className="border-t-2 border-gray-200">
                                    <td className="py-2 font-semibold text-gray-800">Total Deductions</td>
                                    <td className="py-2 text-right font-bold text-red-600">
                                        <Amount value={payslip.total_deductions} />
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Net Pay */}
                <div className="px-6 py-5 bg-green-50 border-t flex items-center justify-between">
                    <div className="text-gray-700 font-medium">Net Pay</div>
                    <div className="text-3xl font-bold text-green-700">
                        <Amount value={payslip.net_amount} />
                    </div>
                </div>

                {payslip.notes && (
                    <div className="px-6 py-4 border-t text-sm text-gray-500">
                        <span className="font-medium">Notes:</span> {payslip.notes}
                    </div>
                )}
            </div>
        </div>
    );
}
