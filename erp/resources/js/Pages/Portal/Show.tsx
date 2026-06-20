import { Head, Link } from '@inertiajs/react';

interface Invoice {
    id: number;
    number?: string;
    issue_date: string;
    due_date?: string | null;
    status: string;
    total?: number;
    amount_due?: number;
}

interface Contact {
    id: number;
    name: string;
}

interface Props {
    token: string;
    contact: Contact;
    invoices: Invoice[];
}

const STATUS_COLORS: Record<string, string> = {
    sent:      'bg-blue-100 text-blue-800',
    partial:   'bg-yellow-100 text-yellow-800',
    paid:      'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    draft:     'bg-gray-100 text-gray-800',
};

function fmt(n?: number | null): string {
    if (n === undefined || n === null) return '—';
    return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

export default function PortalShow({ token, contact, invoices }: Props) {
    return (
        <>
            <Head title={`Customer Portal — ${contact.name}`} />

            <div className="min-h-screen bg-gray-50">
                {/* Nav bar */}
                <nav className="bg-white border-b border-gray-200 shadow-sm">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-800">Customer Portal</span>
                        <span className="text-sm text-gray-500">{contact.name}</span>
                    </div>
                </nav>

                <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Invoices</h1>

                    {invoices.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            No invoices found.
                        </div>
                    ) : (
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Due</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {invoices.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Link
                                                    href={`/portal/${token}/invoices/${inv.id}`}
                                                    className="text-indigo-600 hover:text-indigo-800 hover:underline"
                                                >
                                                    {inv.number ?? `INV-${inv.id}`}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{inv.issue_date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{inv.due_date ?? '—'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{fmt(inv.total)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{fmt(inv.amount_due)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[inv.status] ?? 'bg-gray-100 text-gray-700'}`}>
                                                    {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
