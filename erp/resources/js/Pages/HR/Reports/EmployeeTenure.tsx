import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface EmployeeRow {
    id: number;
    name: string;
    department: string;
    hire_date: string;
    tenureMonths: number;
    tenureYears: number;
    bucket: string;
}

interface BucketCounts {
    '<1yr': number;
    '1-3yr': number;
    '3-5yr': number;
    '5+yr': number;
}

interface Props extends PageProps {
    employees: EmployeeRow[];
    buckets: BucketCounts;
}

const BUCKET_COLORS: Record<string, string> = {
    '<1yr':  'bg-blue-100 text-blue-700',
    '1-3yr': 'bg-green-100 text-green-700',
    '3-5yr': 'bg-yellow-100 text-yellow-700',
    '5+yr':  'bg-purple-100 text-purple-700',
};

export default function EmployeeTenure({ employees, buckets }: Props) {
    const bucketList = [
        { label: 'Less than 1 Year', key: '<1yr' as const },
        { label: '1 – 3 Years',      key: '1-3yr' as const },
        { label: '3 – 5 Years',      key: '3-5yr' as const },
        { label: '5+ Years',         key: '5+yr' as const },
    ];

    return (
        <AppLayout>
            <Head title="Employee Tenure" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Employee Tenure</h1>
                    <p className="text-sm text-slate-500 mt-1">{employees.length} active employees</p>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    {bucketList.map((b) => (
                        <div key={b.key} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm text-center">
                            <p className="text-sm text-slate-500">{b.label}</p>
                            <p className="text-3xl font-bold text-slate-900 mt-1">{buckets[b.key]}</p>
                        </div>
                    ))}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Employee</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Department</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Hire Date</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Tenure</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Bucket</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {employees.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">No employee data available.</td>
                                </tr>
                            )}
                            {employees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{emp.name}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{emp.department}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{emp.hire_date}</td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-700">{emp.tenureYears} yr</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${BUCKET_COLORS[emp.bucket] ?? 'bg-slate-100 text-slate-600'}`}>
                                            {emp.bucket}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
