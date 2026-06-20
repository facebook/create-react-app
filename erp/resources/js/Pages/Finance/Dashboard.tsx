import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface RecentInvoice {
    id: number;
    number: string;
    contact: string | null;
    total: number;
    amount_due: number;
    status: string;
    issue_date: string;
}

interface RecentBill {
    id: number;
    status: string;
    total: number;
    amount_due: number;
    issue_date: string;
}

interface Props extends PageProps {
    openInvoices: number;
    openInvoicesTotal: number;
    overdueCount: number;
    unpaidBills: number;
    totalContacts: number;
    revenueThisMonth: number;
    recentInvoices: RecentInvoice[];
    recentBills: RecentBill[];
}

function KpiCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
            <p className={`mt-1 text-2xl font-semibold ${color ?? 'text-slate-900'}`}>{value}</p>
        </div>
    );
}

function fmt(n: number) {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const INV_STATUS_COLORS: Record<string, string> = {
    draft:          'bg-slate-100 text-slate-600',
    sent:           'bg-blue-100 text-blue-700',
    paid:           'bg-green-100 text-green-700',
    partially_paid: 'bg-amber-100 text-amber-700',
    overdue:        'bg-red-100 text-red-700',
    cancelled:      'bg-slate-100 text-slate-400',
};

const BILL_STATUS_COLORS: Record<string, string> = {
    draft:     'bg-slate-100 text-slate-600',
    submitted: 'bg-blue-100 text-blue-700',
    approved:  'bg-violet-100 text-violet-700',
    paid:      'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

export default function FinanceDashboard({
    openInvoices, openInvoicesTotal, overdueCount, unpaidBills,
    totalContacts, revenueThisMonth, recentInvoices, recentBills,
}: Props) {
    return (
        <AppLayout>
            <Head title="Finance Dashboard" />
            <div className="space-y-6">
                <h1 className="text-2xl font-semibold text-slate-900">Finance Dashboard</h1>

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                    <KpiCard label="Revenue This Month"  value={`$${fmt(revenueThisMonth)}`}    color="text-green-600" />
                    <KpiCard label="Open Invoices"       value={openInvoices}                    color={openInvoices > 0 ? 'text-blue-600' : 'text-slate-900'} />
                    <KpiCard label="Outstanding AR"      value={`$${fmt(openInvoicesTotal)}`}    color={overdueCount > 0 ? 'text-amber-600' : 'text-slate-900'} />
                    <KpiCard label="Overdue Invoices"    value={overdueCount}                    color={overdueCount > 0 ? 'text-red-600' : 'text-slate-900'} />
                    <KpiCard label="Unpaid Bills (AP)"   value={`$${fmt(unpaidBills)}`}          color={unpaidBills > 0 ? 'text-orange-600' : 'text-slate-900'} />
                    <KpiCard label="Total Contacts"      value={totalContacts} />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Recent Invoices */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                            <h2 className="text-sm font-semibold text-slate-700">Recent Invoices</h2>
                            <Link href="/finance/invoices" className="text-xs text-indigo-600 hover:underline">View all</Link>
                        </div>
                        {recentInvoices.length === 0 ? (
                            <p className="px-5 py-8 text-center text-sm text-slate-400">No invoices yet.</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="px-5 py-2 text-left text-xs font-medium text-slate-400">Invoice</th>
                                        <th className="px-5 py-2 text-right text-xs font-medium text-slate-400">Total</th>
                                        <th className="px-5 py-2 text-left text-xs font-medium text-slate-400">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {recentInvoices.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-slate-50">
                                            <td className="px-5 py-3">
                                                <Link href={`/finance/invoices/${inv.id}`} className="font-medium text-indigo-600 hover:underline">
                                                    {inv.number}
                                                </Link>
                                                <div className="text-xs text-slate-400">{inv.contact ?? '—'}</div>
                                            </td>
                                            <td className="px-5 py-3 text-right text-slate-700">${fmt(inv.total)}</td>
                                            <td className="px-5 py-3">
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${INV_STATUS_COLORS[inv.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                                    {inv.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Recent Bills */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                            <h2 className="text-sm font-semibold text-slate-700">Recent Bills</h2>
                            <Link href="/finance/bills" className="text-xs text-indigo-600 hover:underline">View all</Link>
                        </div>
                        {recentBills.length === 0 ? (
                            <p className="px-5 py-8 text-center text-sm text-slate-400">No bills yet.</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="px-5 py-2 text-left text-xs font-medium text-slate-400">Bill #</th>
                                        <th className="px-5 py-2 text-right text-xs font-medium text-slate-400">Total</th>
                                        <th className="px-5 py-2 text-right text-xs font-medium text-slate-400">Due</th>
                                        <th className="px-5 py-2 text-left text-xs font-medium text-slate-400">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {recentBills.map((bill) => (
                                        <tr key={bill.id} className="hover:bg-slate-50">
                                            <td className="px-5 py-3">
                                                <Link href={`/finance/bills/${bill.id}`} className="font-medium text-indigo-600 hover:underline">
                                                    #{bill.id}
                                                </Link>
                                                <div className="text-xs text-slate-400">{bill.issue_date}</div>
                                            </td>
                                            <td className="px-5 py-3 text-right text-slate-700">${fmt(bill.total)}</td>
                                            <td className="px-5 py-3 text-right text-slate-700">${fmt(bill.amount_due)}</td>
                                            <td className="px-5 py-3">
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${BILL_STATUS_COLORS[bill.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                                    {bill.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
