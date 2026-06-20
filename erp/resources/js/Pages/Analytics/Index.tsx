import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { BarChart } from '@/Components/Charts/BarChart';
import { LineChart } from '@/Components/Charts/LineChart';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';

interface DataPoint { label: string; value: number }

interface InventoryValue {
    total_value: number;
    product_count: number;
    low_stock: number;
}

interface Props extends PageProps {
    revenue_by_month: DataPoint[];
    invoice_by_status: DataPoint[];
    headcount_by_dept: DataPoint[];
    payroll_summary: DataPoint[];
    inventory_value: InventoryValue | null;
}

function fmt(n: number) {
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>
            {children}
        </div>
    );
}

export default function AnalyticsIndex({
    revenue_by_month,
    invoice_by_status,
    headcount_by_dept,
    payroll_summary,
    inventory_value,
}: Props) {
    const { can } = usePermission();

    const totalRevenue = revenue_by_month.reduce((s, d) => s + d.value, 0);
    const totalPayroll = payroll_summary.reduce((s, d) => s + d.value, 0);

    return (
        <AppLayout>
            <Head title="Analytics" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
                    <p className="text-sm text-slate-500 mt-1">Cross-module overview of your organization.</p>
                </div>

                {/* KPI row */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {can('finance.view') && (
                        <>
                            <KpiCard label="Revenue (12 mo)" value={`$${fmt(totalRevenue)}`} color="bg-indigo-500" />
                            <KpiCard label="Invoices" value={String(invoice_by_status.reduce((s, d) => s + d.value, 0))} color="bg-blue-500" />
                        </>
                    )}
                    {can('hr.view') && (
                        <>
                            <KpiCard label="Headcount" value={String(headcount_by_dept.reduce((s, d) => s + d.value, 0))} color="bg-teal-500" />
                            <KpiCard label="Payroll Net (6 runs)" value={`$${fmt(totalPayroll)}`} color="bg-orange-500" />
                        </>
                    )}
                    {can('inventory.view') && inventory_value && (
                        <>
                            <KpiCard label="Inventory Value" value={`$${fmt(inventory_value.total_value)}`} color="bg-emerald-500" />
                            <KpiCard label="Low Stock Items" value={String(inventory_value.low_stock)} color="bg-red-500" />
                        </>
                    )}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {can('finance.view') && (
                        <>
                            <Card title="Revenue by Month (last 12 months)">
                                <LineChart
                                    data={revenue_by_month}
                                    valueFormatter={(n) => `$${fmt(n)}`}
                                />
                            </Card>
                            <Card title="Invoices by Status">
                                <BarChart
                                    data={invoice_by_status}
                                    color="bg-blue-400"
                                />
                            </Card>
                        </>
                    )}
                    {can('hr.view') && (
                        <>
                            <Card title="Headcount by Department">
                                <BarChart
                                    data={headcount_by_dept}
                                    horizontal
                                    color="bg-teal-400"
                                    valueFormatter={(n) => `${n} emp`}
                                />
                            </Card>
                            <Card title="Net Payroll by Run (last 6)">
                                <BarChart
                                    data={payroll_summary}
                                    color="bg-orange-400"
                                    valueFormatter={(n) => `$${fmt(n)}`}
                                />
                            </Card>
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

function KpiCard({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
            <div className={`mb-3 h-1 w-12 rounded-full ${color}`} />
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-1 text-xl font-bold text-slate-900 truncate">{value}</p>
        </div>
    );
}
