import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface Kpis {
    revenue_this_month: number;
    expenses_this_month: number;
    outstanding_ar: number;
    outstanding_ap: number;
    overdue_count: number;
}

interface MonthPoint {
    month: string;
    revenue: number;
    expenses: number;
}

interface RecentInvoice {
    id: number;
    number: string;
    contact: string | null;
    total: number;
    amount_due: number;
    status: string;
    issue_date: string;
}

interface LowStockItem {
    id: number;
    sku: string;
    name: string;
    quantity: number;
}

interface ModuleStats {
    open_invoices: number;
    open_bills: number;
    pending_pos: number;
    active_projects: number;
    open_tickets: number;
    pending_approvals: number;
    active_employees: number;
    total_products: number;
}

interface ActivityItem {
    type: string;
    label: string;
    status: string;
    at: string;
}

interface Props extends PageProps {
    kpis: Kpis;
    monthly_chart: MonthPoint[];
    recent_invoices: RecentInvoice[];
    low_stock: LowStockItem[];
    module_stats: ModuleStats;
    activity_feed: ActivityItem[];
}

const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600',
    sent: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    partially_paid: 'bg-amber-100 text-amber-700',
    overdue: 'bg-red-100 text-red-700',
    cancelled: 'bg-slate-100 text-slate-400',
    approved: 'bg-violet-100 text-violet-700',
};

function fmt(n: number) {
    return n.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function KpiCard({
    label,
    value,
    sub,
    color,
}: {
    label: string;
    value: string;
    sub?: string;
    color?: string;
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {label}
            </p>
            <p
                className={`mt-1 text-2xl font-semibold ${
                    color ?? 'text-slate-900'
                }`}
            >
                {value}
            </p>
            {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
        </div>
    );
}

const MODULE_STAT_CARDS = [
    { key: 'open_invoices', label: 'Open Invoices', icon: '🧾' },
    { key: 'open_bills', label: 'Open Bills', icon: '📄' },
    { key: 'pending_pos', label: 'Pending POs', icon: '📦' },
    { key: 'active_projects', label: 'Active Projects', icon: '🏗️' },
    { key: 'open_tickets', label: 'Open Tickets', icon: '🎫' },
    { key: 'pending_approvals', label: 'Pending Approvals', icon: '✅' },
    { key: 'active_employees', label: 'Active Employees', icon: '👥' },
    { key: 'total_products', label: 'Total Products', icon: '🏷️' },
] as const;

const TYPE_BADGE: Record<string, string> = {
    invoice: 'bg-indigo-100 text-indigo-700',
    po: 'bg-amber-100 text-amber-700',
    payroll: 'bg-green-100 text-green-700',
};

function relativeTime(at: string): string {
    const diff = Date.now() - new Date(at).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

export default function Dashboard({
    kpis,
    monthly_chart,
    recent_invoices,
    low_stock,
    module_stats,
    activity_feed,
}: Props) {
    return (
        <AppLayout>
            <Head title="Dashboard" />
            <div className="space-y-6">
                <h1 className="text-2xl font-semibold text-slate-900">
                    Dashboard
                </h1>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <KpiCard
                        label="Revenue This Month"
                        value={`$${fmt(kpis.revenue_this_month)}`}
                        color="text-green-600"
                    />
                    <KpiCard
                        label="Expenses This Month"
                        value={`$${fmt(kpis.expenses_this_month)}`}
                        color="text-red-500"
                    />
                    <KpiCard
                        label="Outstanding AR"
                        value={`$${fmt(kpis.outstanding_ar)}`}
                        sub={
                            kpis.overdue_count > 0
                                ? `${kpis.overdue_count} overdue`
                                : undefined
                        }
                        color={
                            kpis.overdue_count > 0
                                ? 'text-amber-600'
                                : 'text-slate-900'
                        }
                    />
                    <KpiCard
                        label="Outstanding AP"
                        value={`$${fmt(kpis.outstanding_ap)}`}
                    />
                </div>

                {/* Revenue vs Expenses Chart */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-4 text-sm font-semibold text-slate-700">
                        Revenue vs Expenses — Last 12 Months
                    </h2>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart
                            data={monthly_chart}
                            margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#f1f5f9"
                            />
                            <XAxis
                                dataKey="month"
                                tick={{ fontSize: 11, fill: '#94a3b8' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: '#94a3b8' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                formatter={v =>
                                    typeof v === 'number'
                                        ? `$${fmt(v)}`
                                        : String(v)
                                }
                            />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Bar
                                dataKey="revenue"
                                name="Revenue"
                                fill="#4ade80"
                                radius={[3, 3, 0, 0]}
                            />
                            <Bar
                                dataKey="expenses"
                                name="Expenses"
                                fill="#f87171"
                                radius={[3, 3, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Recent Invoices */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                            <h2 className="text-sm font-semibold text-slate-700">
                                Recent Invoices
                            </h2>
                            <Link
                                href="/finance/invoices"
                                className="text-xs text-indigo-600 hover:underline"
                            >
                                View all
                            </Link>
                        </div>
                        {recent_invoices.length === 0 ? (
                            <p className="px-5 py-8 text-center text-sm text-slate-400">
                                No invoices yet.
                            </p>
                        ) : (
                            <table className="w-full text-sm">
                                <tbody className="divide-y divide-slate-50">
                                    {recent_invoices.map(inv => (
                                        <tr
                                            key={inv.id}
                                            className="hover:bg-slate-50"
                                        >
                                            <td className="px-5 py-3">
                                                <Link
                                                    href={`/finance/invoices/${inv.id}`}
                                                    className="font-medium text-indigo-600 hover:underline"
                                                >
                                                    {inv.number}
                                                </Link>
                                                <div className="text-xs text-slate-400">
                                                    {inv.contact ?? '—'}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-right text-slate-700">
                                                ${fmt(inv.total)}
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                                        STATUS_COLORS[
                                                            inv.status
                                                        ] ??
                                                        'bg-slate-100 text-slate-600'
                                                    }`}
                                                >
                                                    {inv.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Low Stock Alerts */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                            <h2 className="text-sm font-semibold text-slate-700">
                                Low Stock Alerts
                            </h2>
                            <Link
                                href="/inventory/products"
                                className="text-xs text-indigo-600 hover:underline"
                            >
                                View all
                            </Link>
                        </div>
                        {low_stock.length === 0 ? (
                            <p className="px-5 py-8 text-center text-sm text-slate-400">
                                All stock levels are healthy.
                            </p>
                        ) : (
                            <table className="w-full text-sm">
                                <tbody className="divide-y divide-slate-50">
                                    {low_stock.map(item => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-slate-50"
                                        >
                                            <td className="px-5 py-3">
                                                <Link
                                                    href={`/inventory/products/${item.id}`}
                                                    className="font-medium text-slate-800 hover:text-indigo-600"
                                                >
                                                    {item.name}
                                                </Link>
                                                <div className="text-xs font-mono text-slate-400">
                                                    {item.sku}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                        item.quantity <= 0
                                                            ? 'bg-red-100 text-red-700'
                                                            : 'bg-amber-100 text-amber-700'
                                                    }`}
                                                >
                                                    {item.quantity.toFixed(2)}{' '}
                                                    units
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Module Overview */}
                <div>
                    <h2 className="mb-3 text-sm font-semibold text-slate-700">
                        Module Overview
                    </h2>
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {MODULE_STAT_CARDS.map(({ key, label, icon }) => (
                            <div
                                key={key}
                                className="rounded-lg border bg-white p-4 shadow-sm flex items-center gap-3"
                            >
                                <span className="text-2xl leading-none">
                                    {icon}
                                </span>
                                <div>
                                    <p className="text-xs text-slate-400">
                                        {label}
                                    </p>
                                    <p className="text-xl font-semibold text-slate-900">
                                        {module_stats[key]}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-5 py-3">
                        <h2 className="text-sm font-semibold text-slate-700">
                            Recent Activity
                        </h2>
                    </div>
                    {activity_feed.length === 0 ? (
                        <p className="px-5 py-8 text-center text-sm text-slate-400">
                            No recent activity.
                        </p>
                    ) : (
                        <ul className="divide-y divide-slate-50">
                            {activity_feed.map((item, idx) => (
                                <li
                                    key={idx}
                                    className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50"
                                >
                                    <span
                                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                            TYPE_BADGE[item.type] ??
                                            'bg-slate-100 text-slate-600'
                                        }`}
                                    >
                                        {item.type}
                                    </span>
                                    <span className="flex-1 text-sm text-slate-800">
                                        {item.label}
                                    </span>
                                    <span
                                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                            STATUS_COLORS[item.status] ??
                                            'bg-slate-100 text-slate-600'
                                        }`}
                                    >
                                        {item.status}
                                    </span>
                                    <span className="text-xs text-slate-400 whitespace-nowrap">
                                        {relativeTime(item.at)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
