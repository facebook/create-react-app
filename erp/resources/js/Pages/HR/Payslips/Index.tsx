import React from 'react';
import { Link } from '@inertiajs/react';
import DataGrid, { Column } from '@/Components/DataGrid';

interface PayslipLine { id: number; name: string; category: string; amount: string; }
interface Employee { id: number; first_name: string; last_name: string; employee_number: string; department?: { name: string }; }
interface Payslip {
    id: number;
    employee_id: number;
    gross_amount: string;
    total_deductions: string;
    net_amount: string;
    tax_amount: string;
    employee: Employee;
    lines: PayslipLine[];
}
interface PayrollRun { id: number; status: string; period_start: string; period_end: string; }

const COLUMNS: Column<Record<string, unknown>>[] = [
    { key: 'employee_number', label: 'Emp #', sortable: true, render: (r) => (r.employee as Employee).employee_number },
    { key: 'name', label: 'Employee', sortable: true, render: (r) => { const e = r.employee as Employee; return `${e.first_name} ${e.last_name}`; } },
    { key: 'department', label: 'Department', render: (r) => (r.employee as Employee).department?.name ?? '—' },
    { key: 'gross_amount', label: 'Gross', sortable: true, render: (r) => `$${parseFloat(r.gross_amount as string).toFixed(2)}` },
    { key: 'total_deductions', label: 'Deductions', render: (r) => `$${parseFloat(r.total_deductions as string).toFixed(2)}` },
    { key: 'net_amount', label: 'Net Pay', sortable: true, render: (r) => (
        <span className="font-semibold text-green-700">${parseFloat(r.net_amount as string).toFixed(2)}</span>
    )},
];

export default function PayslipsIndex({
    payrollRun,
    payslips,
}: {
    payrollRun: PayrollRun;
    payslips: Payslip[];
}) {
    const totalGross = payslips.reduce((s, p) => s + parseFloat(p.gross_amount), 0);
    const totalNet   = payslips.reduce((s, p) => s + parseFloat(p.net_amount), 0);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/hr/payroll-runs" className="text-blue-600 hover:underline text-sm">← Payroll Runs</Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Payslips</h1>
                    <p className="text-sm text-gray-500">
                        {new Date(payrollRun.period_start).toLocaleDateString()} — {new Date(payrollRun.period_end).toLocaleDateString()}
                    </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{payrollRun.status}</span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="text-sm text-gray-500">Employees</div>
                    <div className="text-2xl font-bold text-gray-800">{payslips.length}</div>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="text-sm text-gray-500">Total Gross</div>
                    <div className="text-2xl font-bold text-gray-800">${totalGross.toFixed(2)}</div>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="text-sm text-gray-500">Total Net</div>
                    <div className="text-2xl font-bold text-green-700">${totalNet.toFixed(2)}</div>
                </div>
            </div>

            <DataGrid
                columns={COLUMNS}
                rows={payslips as unknown as Record<string, unknown>[]}
                rowKey={(r) => (r as unknown as Payslip).id}
                selectable
                pageSize={50}
                emptyMessage="No payslips generated yet."
                actions={(r) => {
                    const p = r as unknown as Payslip;
                    return (
                        <div className="flex gap-2">
                            <Link href={`/hr/payslips/${p.id}`} className="text-blue-600 hover:underline text-xs">View</Link>
                            <a href={`/hr/payslips/${p.id}/pdf`} target="_blank" rel="noreferrer" className="text-gray-600 hover:underline text-xs">PDF</a>
                        </div>
                    );
                }}
            />
        </div>
    );
}
