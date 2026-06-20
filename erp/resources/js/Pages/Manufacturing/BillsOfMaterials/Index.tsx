import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Product {
    id: number;
    name: string;
    sku: string;
}

interface Bom {
    id: number;
    code: string | null;
    name: string;
    type: string;
    type_label: string;
    version: number;
    is_active: boolean;
    qty_per_bom: number;
    uom: string | null;
    lines_count: number;
    product: Product;
}

interface Paginator<T> {
    data: T[];
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
    from: number;
    to: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props extends PageProps {
    boms: Paginator<Bom>;
    filters: { search?: string };
}

const typeBadgeClass: Record<string, string> = {
    manufacture:    'bg-indigo-100 text-indigo-800',
    kit:            'bg-green-100 text-green-800',
    subcontracting: 'bg-yellow-100 text-yellow-800',
};

export default function BomIndex({ boms, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/manufacturing/boms', { search }, { preserveState: true, replace: true });
    }

    function handleDelete(id: number) {
        if (confirm('Delete this BOM?')) {
            router.delete(`/manufacturing/boms/${id}`);
        }
    }

    return (
        <AppLayout>
            <Head title="Bills of Materials" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Bills of Materials</h1>
                        <p className="text-sm text-slate-500 mt-1">{boms.total} BOMs total</p>
                    </div>
                    <Link href="/manufacturing/boms/create">
                        <Button>New BOM</Button>
                    </Link>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-4 py-3">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search BOMs..."
                                className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                            />
                            <Button type="submit" variant="secondary" size="sm">Search</Button>
                        </form>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Product</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Code</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Version</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Components</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {boms.data.map((bom) => (
                                    <tr key={bom.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                            <Link href={`/manufacturing/boms/${bom.id}`} className="hover:text-indigo-600">
                                                {bom.product.name}
                                                <span className="ml-1 font-normal text-slate-500">— {bom.name}</span>
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{bom.code ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${typeBadgeClass[bom.type] ?? 'bg-slate-100 text-slate-800'}`}>
                                                {bom.type_label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">v{bom.version}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{bom.lines_count}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${bom.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                                                {bom.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex gap-2">
                                                <Link href={`/manufacturing/boms/${bom.id}/edit`} className="text-indigo-600 hover:text-indigo-800">Edit</Link>
                                                <button onClick={() => handleDelete(bom.id)} className="text-red-600 hover:text-red-800">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {boms.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">No BOMs found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
