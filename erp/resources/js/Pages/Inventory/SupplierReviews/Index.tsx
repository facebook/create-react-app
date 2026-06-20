import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { SupplierReview, Supplier, Paginator } from '@/types/inventory';

interface Props extends PageProps {
    reviews: Paginator<SupplierReview>;
    suppliers: { id: number; name: string }[];
    filters: { supplier_id?: string };
}

function StarRating({ score }: { score: number }) {
    return (
        <span className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className={s <= score ? 'text-amber-400' : 'text-slate-200'}>★</span>
            ))}
            <span className="ml-1 text-xs text-slate-600">({score})</span>
        </span>
    );
}

export default function SupplierReviewsIndex({ reviews, suppliers, filters }: Props) {
    const { can } = usePermission();

    const { data, setData, post, processing, reset, errors } = useForm({
        supplier_id: '',
        review_date: new Date().toISOString().split('T')[0],
        quality_score: '4',
        delivery_score: '4',
        communication_score: '4',
        price_score: '4',
        notes: '',
    });

    function handleFilter(e: React.ChangeEvent<HTMLSelectElement>) {
        router.get('/inventory/supplier-reviews', { supplier_id: e.target.value || undefined }, {
            preserveState: true, replace: true,
        });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/inventory/supplier-reviews', { onSuccess: () => reset() });
    }

    return (
        <AppLayout>
            <Head title="Supplier Reviews" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Supplier Reviews</h1>
                        <p className="text-sm text-slate-500 mt-1">{reviews.total} reviews total</p>
                    </div>
                </div>

                {can('inventory.create') && (
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-4">
                        <h2 className="text-base font-medium text-slate-800 mb-3">Add Review</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-slate-600 mb-1">Supplier</label>
                                <select
                                    value={data.supplier_id}
                                    onChange={(e) => setData('supplier_id', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    required
                                >
                                    <option value="">Select supplier...</option>
                                    {suppliers.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                                {errors.supplier_id && <p className="text-xs text-red-600 mt-1">{errors.supplier_id}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Review Date</label>
                                <input
                                    type="date"
                                    value={data.review_date}
                                    onChange={(e) => setData('review_date', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            {(['quality_score', 'delivery_score', 'communication_score', 'price_score'] as const).map((field) => (
                                <div key={field}>
                                    <label className="block text-xs font-medium text-slate-600 mb-1 capitalize">
                                        {field.replace('_score', '').replace('_', ' ')} Score
                                    </label>
                                    <select
                                        value={data[field]}
                                        onChange={(e) => setData(field, e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    >
                                        {[1, 2, 3, 4, 5].map((n) => (
                                            <option key={n} value={n}>{n}</option>
                                        ))}
                                    </select>
                                    {errors[field] && <p className="text-xs text-red-600 mt-1">{errors[field]}</p>}
                                </div>
                            ))}
                            <div className="col-span-2 md:col-span-4">
                                <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
                                <input
                                    type="text"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Optional notes..."
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="col-span-2 md:col-span-4 flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Add Review'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-4 py-3">
                        <select
                            value={filters.supplier_id ?? ''}
                            onChange={handleFilter}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="">All Suppliers</option>
                            {suppliers.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <Table
                        columns={[
                            { key: 'supplier', header: 'Supplier', render: (r) => r.supplier?.name ?? '—' },
                            { key: 'review_date', header: 'Date', render: (r) => r.review_date },
                            { key: 'quality_score', header: 'Quality', render: (r) => <StarRating score={r.quality_score} /> },
                            { key: 'delivery_score', header: 'Delivery', render: (r) => <StarRating score={r.delivery_score} /> },
                            { key: 'communication_score', header: 'Communication', render: (r) => <StarRating score={r.communication_score} /> },
                            { key: 'price_score', header: 'Price', render: (r) => <StarRating score={r.price_score} /> },
                            { key: 'overall_score', header: 'Overall', render: (r) => (
                                <span className="font-semibold text-indigo-600">{r.overall_score.toFixed(1)}</span>
                            )},
                            { key: 'notes', header: 'Notes', render: (r) => r.notes
                                ? <span className="text-sm text-slate-600 truncate max-w-xs block">{r.notes}</span>
                                : <span className="text-slate-400">—</span>
                            },
                            { key: 'actions', header: '', render: (r) => can('inventory.delete') ? (
                                <button
                                    onClick={() => {
                                        if (confirm('Delete this review?')) {
                                            router.delete(`/inventory/supplier-reviews/${r.id}`);
                                        }
                                    }}
                                    className="text-xs text-red-600 hover:text-red-800"
                                >
                                    Delete
                                </button>
                            ) : null },
                        ]}
                        data={reviews.data}
                        emptyMessage="No reviews found."
                    />
                    <Pagination paginator={reviews} />
                </div>
            </div>
        </AppLayout>
    );
}
