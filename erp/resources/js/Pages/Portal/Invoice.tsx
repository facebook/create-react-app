import { Head, Link } from '@inertiajs/react';

interface InvoiceItem {
    id: number;
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
    line_total?: number;
}

interface InvoiceDetail {
    id: number;
    number?: string;
    issue_date: string;
    due_date?: string | null;
    status: string;
    notes?: string | null;
    subtotal?: number;
    tax_total?: number;
    total?: number;
    amount_due?: number;
    items: InvoiceItem[];
}

interface Contact {
    id: number;
    name: string;
}

interface Props {
    token: string;
    invoice: InvoiceDetail;
    contact: Contact;
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

export default function PortalInvoice({ token, invoice, contact }: Props) {
    const invLabel = invoice.number ?? `INV-${invoice.id}`;

    return (
        <>
            <Head title={`Invoice ${invLabel} — Customer Portal`} />

            <div className="min-h-screen bg-gray-50">
                {/* Nav bar */}
                <nav className="bg-white border-b border-gray-200 shadow-sm">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-800">Customer Portal</span>
                        <span className="text-sm text-gray-500">{contact.name}</span>
                    </div>
                </nav>

                <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    {/* Back link */}
                    <Link
                        href={`/portal/${token}`}
                        className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 hover:underline mb-6"
                    >
                        &larr; Back to portal
                    </Link>

                    <div className="bg-white shadow rounded-lg p-6 sm:p-8">
                        {/* Invoice header */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{invLabel}</h1>
                                <div className="mt-2 space-y-1 text-sm text-gray-600">
                                    <div><span className="font-medium">Issue Date:</span> {invoice.issue_date}</div>
                                    {invoice.due_date && (
                                        <div><span className="font-medium">Due Date:</span> {invoice.due_date}</div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-start">
                                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${STATUS_COLORS[invoice.status] ?? 'bg-gray-100 text-gray-700'}`}>
                                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                </span>
                            </div>
                        </div>

                        {/* Line items */}
                        <div className="mb-8">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tax %</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {invoice.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 text-right">{item.quantity}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 text-right">{fmt(item.unit_price)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 text-right">{item.tax_rate}%</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{fmt(item.line_total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end">
                            <div className="w-64 space-y-2 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>{fmt(invoice.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax</span>
                                    <span>{fmt(invoice.tax_total)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2">
                                    <span>Total</span>
                                    <span>{fmt(invoice.total)}</span>
                                </div>
                                <div className="flex justify-between text-indigo-700 font-semibold">
                                    <span>Amount Due</span>
                                    <span>{fmt(invoice.amount_due)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {invoice.notes && (
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <h3 className="text-sm font-medium text-gray-700 mb-1">Notes</h3>
                                <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.notes}</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}
