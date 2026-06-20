import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface VatLine {
    id: number;
    number: string;
    date: string;
    contact: string | null;
    net: number;
    tax: number;
    type: 'invoice' | 'bill';
}

interface Props extends PageProps {
    output_lines: VatLine[];
    input_lines: VatLine[];
    total_output_vat: number;
    total_input_vat: number;
    net_vat: number;
    from: string;
    to: string;
}

function fmt(n: number) {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function VatTable({ lines, label, linkBase }: { lines: VatLine[]; label: string; linkBase: string }) {
    const total = lines.reduce((s, l) => s + l.tax, 0);
    const netTotal = lines.reduce((s, l) => s + l.net, 0);
    return (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-700">{label}</h2>
            </div>
            {lines.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-slate-400">No taxable transactions in this period.</p>
            ) : (
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-2 text-left font-medium">Document</th>
                            <th className="px-4 py-2 text-left font-medium">Date</th>
                            <th className="px-4 py-2 text-left font-medium">Contact</th>
                            <th className="px-4 py-2 text-right font-medium">Net</th>
                            <th className="px-4 py-2 text-right font-medium">Tax</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {lines.map((line) => (
                            <tr key={line.id} className="hover:bg-slate-50">
                                <td className="px-4 py-2.5">
                                    <Link href={`/finance/${linkBase}/${line.id}`} className="font-medium text-indigo-600 hover:underline">
                                        {line.number}
                                    </Link>
                                </td>
                                <td className="px-4 py-2.5 text-slate-500">{line.date}</td>
                                <td className="px-4 py-2.5 text-slate-600">{line.contact ?? '—'}</td>
                                <td className="px-4 py-2.5 text-right text-slate-700">${fmt(line.net)}</td>
                                <td className="px-4 py-2.5 text-right font-medium text-slate-900">${fmt(line.tax)}</td>
                            </tr>
                        ))}
                        <tr className="bg-slate-50 font-semibold border-t border-slate-200">
                            <td colSpan={3} className="px-4 py-2.5 text-slate-700">Totals</td>
                            <td className="px-4 py-2.5 text-right text-slate-700">${fmt(netTotal)}</td>
                            <td className="px-4 py-2.5 text-right text-slate-900">${fmt(total)}</td>
                        </tr>
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default function VatReport({ output_lines, input_lines, total_output_vat, total_input_vat, net_vat, from, to }: Props) {
    const { data, setData, get, processing } = useForm({ from, to });

    function applyFilter(e: React.FormEvent) {
        e.preventDefault();
        get('/finance/reports/vat-report');
    }

    return (
        <AppLayout>
            <Head title="VAT Return Report" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">VAT Return Report</h1>
                </div>

                {/* Date filter */}
                <form onSubmit={applyFilter} className="flex items-end gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">From</label>
                        <input type="date" value={data.from} onChange={(e) => setData('from', e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">To</label>
                        <input type="date" value={data.to} onChange={(e) => setData('to', e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" />
                    </div>
                    <button type="submit" disabled={processing}
                        className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                        Apply
                    </button>
                    <a
                      href={`/finance/reports/vat-report/export?from=${data.from}&to=${data.to}`}
                      className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                    >
                      Export CSV
                    </a>
                </form>

                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Output VAT (Sales)</p>
                        <p className="mt-1 text-2xl font-semibold text-green-600">${fmt(total_output_vat)}</p>
                        <p className="mt-0.5 text-xs text-slate-400">Tax collected from customers</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Input VAT (Purchases)</p>
                        <p className="mt-1 text-2xl font-semibold text-red-500">${fmt(total_input_vat)}</p>
                        <p className="mt-0.5 text-xs text-slate-400">Tax paid to suppliers</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Net VAT Payable</p>
                        <p className={`mt-1 text-2xl font-semibold ${net_vat >= 0 ? 'text-slate-900' : 'text-green-600'}`}>
                            ${fmt(Math.abs(net_vat))}{net_vat < 0 ? ' (refund)' : ''}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">Output minus Input VAT</p>
                    </div>
                </div>

                <VatTable lines={output_lines} label="Output VAT — Sales Invoices" linkBase="invoices" />
                <VatTable lines={input_lines}  label="Input VAT — Purchase Bills"  linkBase="bills" />
            </div>
        </AppLayout>
    );
}
