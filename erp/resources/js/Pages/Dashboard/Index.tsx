import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Badge } from '@/Components/Common/Badge';
import { useAuth } from '@/Hooks/useAuth';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';

interface Stats {
    products_count?: number | null;
    low_stock_count?: number | null;
    pending_pos_count?: number | null;
    open_invoices_count?: number | null;
    open_invoices_total?: number | null;
    revenue_mtd?: number | null;
    employees_count?: number | null;
    pending_leaves_count?: number | null;
    users_count?: number | null;
}

interface RecentInvoice {
    id: number;
    number: string;
    contact: string;
    status: string;
    issue_date?: string;
}

interface RecentPo {
    id: number;
    supplier: string;
    status: string;
    date?: string;
}

interface Props extends PageProps {
    stats: Stats;
    recentInvoices: RecentInvoice[];
    recentPos: RecentPo[];
}

function fmt(n: number | null | undefined): string {
    if (n === null || n === undefined) return '—';
    return n.toLocaleString();
}

function fmtCurrency(n: number | null | undefined): string {
    if (n === null || n === undefined) return '—';
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const INVOICE_COLORS: Record<string, string> = {
    draft:     'bg-slate-100 text-slate-600',
    sent:      'bg-blue-100 text-blue-700',
    paid:      'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
};

const PO_COLORS: Record<string, string> = {
    draft:      'bg-slate-100 text-slate-600',
    submitted:  'bg-amber-100 text-amber-700',
    approved:   'bg-blue-100 text-blue-700',
    received:   'bg-green-100 text-green-700',
    cancelled:  'bg-red-100 text-red-600',
};

export default function Dashboard({ stats, recentInvoices, recentPos }: Props) {
    const { user } = useAuth();
    const { can } = usePermission();

    return (
        <AppLayout>
            <Head title="Dashboard" />

            {/* Welcome banner */}
            <div className="mb-6 rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">
                            Welcome back, {user?.name}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Here's what's happening in your organization today.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {user?.roles.map((role) => (
                            <Badge key={role} color="indigo">{role}</Badge>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats grid */}
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {can('inventory.view') && (
                    <>
                        <StatCard label="Products" value={fmt(stats.products_count)} color="bg-emerald-500"
                            href="/inventory/products" />
                        <StatCard label="Low Stock" value={fmt(stats.low_stock_count)} color="bg-red-500"
                            href="/inventory/products" />
                        <StatCard label="Pending POs" value={fmt(stats.pending_pos_count)} color="bg-amber-500"
                            href="/inventory/purchase-orders" />
                    </>
                )}
                {can('finance.view') && (
                    <>
                        <StatCard label="Open Invoices" value={fmt(stats.open_invoices_count)} color="bg-blue-500"
                            href="/finance/invoices" />
                        <StatCard label="Open Total" value={fmtCurrency(stats.open_invoices_total)} color="bg-violet-500"
                            href="/finance/invoices" />
                        <StatCard label="Revenue MTD" value={fmtCurrency(stats.revenue_mtd)} color="bg-indigo-500"
                            href="/finance/invoices" />
                    </>
                )}
                {can('hr.view') && (
                    <>
                        <StatCard label="Employees" value={fmt(stats.employees_count)} color="bg-teal-500"
                            href="/hr/employees" />
                        <StatCard label="Pending Leaves" value={fmt(stats.pending_leaves_count)} color="bg-orange-500"
                            href="/hr/leave" />
                    </>
                )}
                {can('users.view') && (
                    <StatCard label="Users" value={fmt(stats.users_count)} color="bg-pink-500"
                        href="/admin/users" />
                )}
            </div>

            {/* Recent activity */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {can('finance.view') && recentInvoices.length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
                            <h3 className="text-sm font-semibold text-slate-700">Recent Invoices</h3>
                            <Link href="/finance/invoices" className="text-xs text-indigo-600 hover:text-indigo-800">
                                View all
                            </Link>
                        </div>
                        <ul className="divide-y divide-slate-100">
                            {recentInvoices.map((inv) => (
                                <li key={inv.id}>
                                    <Link href={`/finance/invoices/${inv.id}`}
                                        className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{inv.number}</p>
                                            <p className="text-xs text-slate-500">{inv.contact}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-slate-400">{inv.issue_date}</span>
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${INVOICE_COLORS[inv.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                                {inv.status}
                                            </span>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {can('inventory.view') && recentPos.length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
                            <h3 className="text-sm font-semibold text-slate-700">Recent Purchase Orders</h3>
                            <Link href="/inventory/purchase-orders" className="text-xs text-indigo-600 hover:text-indigo-800">
                                View all
                            </Link>
                        </div>
                        <ul className="divide-y divide-slate-100">
                            {recentPos.map((po) => (
                                <li key={po.id}>
                                    <Link href={`/inventory/purchase-orders/${po.id}`}
                                        className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">PO #{po.id}</p>
                                            <p className="text-xs text-slate-500">{po.supplier}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-slate-400">{po.date}</span>
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${PO_COLORS[po.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                                {po.status}
                                            </span>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

interface StatCardProps {
    label: string;
    value: string;
    color: string;
    href: string;
}

function StatCard({ label, value, color, href }: StatCardProps) {
    return (
        <Link href={href} className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow block">
            <div className={`mb-3 h-1 w-12 rounded-full ${color}`} />
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        </Link>
    );
}
