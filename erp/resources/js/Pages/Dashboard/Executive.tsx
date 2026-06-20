import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface RevenueTrendPoint {
    month: string;
    revenue: number;
}

interface ActivityItem {
    type: 'Invoice' | 'Lead' | 'Ticket' | 'Order';
    title: string;
    status: string;
    created_at: string | null;
    url: string;
}

interface Props extends PageProps {
    monthly_revenue: number;
    monthly_expenses: number;
    outstanding_invoices_count: number;
    outstanding_invoices_total: number;
    overdue_invoices_count: number;
    low_stock_count: number;
    open_purchase_orders: number;
    active_manufacturing_orders: number;
    total_employees: number;
    pending_leave_requests: number;
    open_helpdesk_tickets: number;
    open_leads: number;
    open_opportunities: number;
    pipeline_value: number;
    revenue_trend: RevenueTrendPoint[];
    recent_activity: ActivityItem[];
}

function currency(n: number): string {
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function timeAgo(iso: string | null): string {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

interface KpiCardProps {
    label: string;
    value: string | number;
    subValue?: string;
    colorClass?: string;
    bgClass?: string;
}

function KpiCard({ label, value, subValue, colorClass = 'text-slate-900', bgClass = 'bg-white' }: KpiCardProps) {
    return (
        <div className={`${bgClass} rounded-xl border border-slate-200 px-5 py-4 shadow-sm`}>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
            <p className={`mt-1 text-2xl font-bold ${colorClass}`}>{value}</p>
            {subValue && <p className="mt-0.5 text-sm text-slate-500">{subValue}</p>}
        </div>
    );
}

const TYPE_BADGE: Record<string, string> = {
    Invoice: 'bg-blue-100 text-blue-700',
    Lead:    'bg-green-100 text-green-700',
    Ticket:  'bg-orange-100 text-orange-700',
    Order:   'bg-purple-100 text-purple-700',
};

export default function Executive({
    monthly_revenue,
    monthly_expenses,
    outstanding_invoices_count,
    outstanding_invoices_total,
    overdue_invoices_count,
    low_stock_count,
    open_purchase_orders,
    active_manufacturing_orders,
    total_employees,
    pending_leave_requests,
    open_helpdesk_tickets,
    open_leads,
    open_opportunities,
    pipeline_value,
    revenue_trend,
    recent_activity,
}: Props) {
    const today = new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    // Bar chart math
    const maxRevenue = Math.max(...revenue_trend.map((p) => p.revenue), 1);

    return (
        <AppLayout>
            <Head title="Executive Dashboard" />

            {/* Page header */}
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Executive Dashboard</h1>
                    <p className="mt-0.5 text-sm text-slate-500">{today}</p>
                </div>
            </div>

            {/* ── Financial KPIs ──────────────────────────────────────────── */}
            <section className="mb-6">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Financial</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <KpiCard
                        label="Monthly Revenue"
                        value={`$${currency(monthly_revenue)}`}
                        colorClass="text-green-700"
                    />
                    <KpiCard
                        label="Monthly Expenses"
                        value={`$${currency(monthly_expenses)}`}
                        colorClass="text-red-600"
                    />
                    <KpiCard
                        label="Outstanding Invoices"
                        value={outstanding_invoices_count}
                        subValue={`$${currency(outstanding_invoices_total)} due`}
                        colorClass={outstanding_invoices_count > 0 ? 'text-orange-600' : 'text-slate-900'}
                    />
                    <KpiCard
                        label="Overdue Invoices"
                        value={overdue_invoices_count}
                        colorClass={overdue_invoices_count > 0 ? 'text-red-600' : 'text-slate-900'}
                    />
                </div>
            </section>

            {/* ── Operations KPIs ─────────────────────────────────────────── */}
            <section className="mb-6">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Operations</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <KpiCard
                        label="Low Stock Items"
                        value={low_stock_count}
                        colorClass={low_stock_count > 0 ? 'text-yellow-700' : 'text-slate-900'}
                    />
                    <KpiCard
                        label="Active Mfg Orders"
                        value={active_manufacturing_orders}
                        colorClass="text-blue-700"
                    />
                    <KpiCard
                        label="Open Purchase Orders"
                        value={open_purchase_orders}
                        colorClass="text-slate-700"
                    />
                </div>
            </section>

            {/* ── People & Pipeline ────────────────────────────────────────── */}
            <section className="mb-6">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">People & Pipeline</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <KpiCard
                        label="Total Employees"
                        value={total_employees}
                        colorClass="text-slate-700"
                    />
                    <KpiCard
                        label="Pending Leave"
                        value={pending_leave_requests}
                        colorClass={pending_leave_requests > 0 ? 'text-yellow-700' : 'text-slate-900'}
                    />
                    <KpiCard
                        label="Support Tickets"
                        value={open_helpdesk_tickets}
                        subValue={`${open_leads} open leads`}
                        colorClass={open_helpdesk_tickets > 0 ? 'text-orange-600' : 'text-slate-900'}
                    />
                    <KpiCard
                        label="Pipeline Value"
                        value={`$${currency(pipeline_value)}`}
                        subValue={`${open_opportunities} opportunities`}
                        colorClass="text-green-700"
                    />
                </div>
            </section>

            {/* ── Revenue Trend ────────────────────────────────────────────── */}
            <section className="mb-6">
                <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                    <h2 className="mb-4 text-sm font-semibold text-slate-700">Revenue Trend (Last 6 Months)</h2>
                    <div className="flex h-40 items-end gap-3">
                        {revenue_trend.map((point) => {
                            const heightPct = maxRevenue > 0 ? (point.revenue / maxRevenue) * 100 : 0;
                            return (
                                <div key={point.month} className="flex flex-1 flex-col items-center gap-1">
                                    <span className="text-xs text-slate-500">
                                        ${point.revenue >= 1000
                                            ? (point.revenue / 1000).toFixed(1) + 'k'
                                            : point.revenue.toFixed(0)}
                                    </span>
                                    <div className="w-full rounded-t-sm bg-indigo-500" style={{ height: `${Math.max(heightPct, 2)}%` }} />
                                    <span className="text-xs text-slate-400">{point.month.split(' ')[0]}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── Recent Activity ──────────────────────────────────────────── */}
            <section>
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-5 py-3">
                        <h2 className="text-sm font-semibold text-slate-700">Recent Activity</h2>
                    </div>
                    {recent_activity.length === 0 ? (
                        <p className="px-5 py-6 text-center text-sm text-slate-400">No recent activity</p>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {recent_activity.map((item, idx) => (
                                <li key={idx} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50">
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_BADGE[item.type] ?? 'bg-slate-100 text-slate-600'}`}>
                                        {item.type}
                                    </span>
                                    <span className="flex-1 truncate text-sm text-slate-700">{item.title}</span>
                                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500 capitalize">
                                        {item.status}
                                    </span>
                                    <span className="text-xs text-slate-400">{timeAgo(item.created_at)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>
        </AppLayout>
    );
}
