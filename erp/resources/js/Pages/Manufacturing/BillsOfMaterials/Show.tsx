import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Product {
    id: number;
    name: string;
    sku: string;
}

interface BomLine {
    id: number;
    sequence: number;
    component: Product;
    quantity: number;
    uom: string | null;
    is_optional: boolean;
    notes: string | null;
}

interface Bom {
    id: number;
    name: string;
    code: string | null;
    type: string;
    type_label: string;
    version: number;
    qty_per_bom: number;
    uom: string | null;
    is_active: boolean;
    notes: string | null;
    product: Product;
    lines: BomLine[];
}

interface Props extends PageProps {
    bom: Bom;
}

const typeBadgeClass: Record<string, string> = {
    manufacture:    'bg-indigo-100 text-indigo-800',
    kit:            'bg-green-100 text-green-800',
    subcontracting: 'bg-yellow-100 text-yellow-800',
};

export default function BomShow({ bom }: Props) {
    return (
        <AppLayout>
            <Head title={`BOM: ${bom.name}`} />
            <div className="max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            {bom.product.name} — {bom.name}
                        </h1>
                        <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${typeBadgeClass[bom.type] ?? 'bg-slate-100 text-slate-800'}`}>
                            {bom.type_label}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/manufacturing/boms/${bom.id}/edit`}>
                            <Button>Edit</Button>
                        </Link>
                        <Link href="/manufacturing/boms">
                            <Button variant="secondary">Back</Button>
                        </Link>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">Code</dt>
                            <dd className="mt-1 text-sm text-slate-900">{bom.code ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">Version</dt>
                            <dd className="mt-1 text-sm text-slate-900">v{bom.version}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">Qty per BOM</dt>
                            <dd className="mt-1 text-sm text-slate-900">{bom.qty_per_bom} {bom.uom ?? ''}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">Status</dt>
                            <dd className="mt-1">
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${bom.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                                    {bom.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </dd>
                        </div>
                        {bom.notes && (
                            <div className="col-span-2">
                                <dt className="text-xs font-medium uppercase text-slate-500">Notes</dt>
                                <dd className="mt-1 text-sm text-slate-900">{bom.notes}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-4">
                        <h2 className="text-base font-semibold text-slate-800">Components ({bom.lines.length})</h2>
                    </div>
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">#</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Component</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Qty</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">UOM</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Optional</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {bom.lines.map((line, i) => (
                                <tr key={line.id}>
                                    <td className="px-4 py-3 text-sm text-slate-600">{line.sequence}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{line.component.name}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{line.quantity}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{line.uom ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        {line.is_optional && (
                                            <span className="inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">Optional</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {bom.lines.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-500">No components defined.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
