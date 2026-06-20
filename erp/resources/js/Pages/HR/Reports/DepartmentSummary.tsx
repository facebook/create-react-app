import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Department {
    id: number;
    name: string;
    count: number;
    avgTenure: number;
    percentage: number;
}

interface Props extends PageProps {
    departments: Department[];
    totalEmployees: number;
}

export default function DepartmentSummary({ departments, totalEmployees }: Props) {
    return (
        <AppLayout>
            <Head title="Department Summary" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Department Summary</h1>
                    <p className="text-sm text-slate-500 mt-1">{totalEmployees} active employees across {departments.length} departments</p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Department</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Headcount</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">% of Company</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Avg Tenure</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {departments.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">No department data available.</td>
                                </tr>
                            )}
                            {departments.map((dept) => (
                                <tr key={dept.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{dept.name}</td>
                                    <td className="px-4 py-3 text-sm text-right font-medium text-slate-900">{dept.count}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-slate-100 rounded-full h-2">
                                                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${dept.percentage}%` }} />
                                            </div>
                                            <span className="text-xs text-slate-600 w-10 text-right">{dept.percentage}%</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-600">{dept.avgTenure} mo</td>
                                </tr>
                            ))}
                        </tbody>
                        {departments.length > 0 && (
                            <tfoot className="bg-slate-50 border-t border-slate-200">
                                <tr>
                                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">Total</td>
                                    <td className="px-4 py-3 text-sm text-right font-semibold text-slate-900">{totalEmployees}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">100%</td>
                                    <td className="px-4 py-3" />
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
