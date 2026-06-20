import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { Supplier, SupplierReview, SupplierContract } from '@/types/inventory';

interface Props extends PageProps {
    supplier: Supplier & {
        reviews: SupplierReview[];
        contracts: SupplierContract[];
    };
}

const statusColors: Record<string, string> = {
    active:     'bg-green-100 text-green-700',
    expired:    'bg-slate-100 text-slate-500',
    terminated: 'bg-red-100 text-red-600',
};

function StarDisplay({ rating }: { rating: number }) {
    return (
        <span className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className={s <= Math.round(rating) ? 'text-amber-400 text-lg' : 'text-slate-200 text-lg'}>★</span>
            ))}
            <span className="ml-1 text-sm font-medium text-slate-700">{rating.toFixed(1)}</span>
        </span>
    );
}

export default function SupplierShow({ supplier }: Props) {
    return (
        <AppLayout>
            <Head title={`Supplier: ${supplier.name}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">{supplier.name}</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {supplier.is_active
                                ? <span className="text-green-600 font-medium">Active</span>
                                : <span className="text-slate-400">Inactive</span>
                            }
                        </p>
                    </div>
                    <Link href={`/inventory/suppliers/${supplier.id}/edit`}>
                        <Button variant="secondary">Edit Supplier</Button>
                    </Link>
                </div>

                {/* Supplier Info */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {supplier.contact_person && (
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Contact</p>
                            <p className="text-sm font-medium text-slate-800 mt-1">{supplier.contact_person}</p>
                        </div>
                    )}
                    {supplier.email && (
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Email</p>
                            <p className="text-sm font-medium text-slate-800 mt-1">{supplier.email}</p>
                        </div>
                    )}
                    {supplier.phone && (
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Phone</p>
                            <p className="text-sm font-medium text-slate-800 mt-1">{supplier.phone}</p>
                        </div>
                    )}
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Average Rating</p>
                        <div className="mt-1">
                            {supplier.average_rating != null
                                ? <StarDisplay rating={supplier.average_rating} />
                                : <span className="text-sm text-slate-400">No reviews yet</span>
                            }
                        </div>
                    </div>
                </div>

                {/* Reviews */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                        <h2 className="text-base font-medium text-slate-800">
                            Reviews ({supplier.reviews.length})
                        </h2>
                        <Link href="/inventory/supplier-reviews">
                            <Button variant="secondary">Add Review</Button>
                        </Link>
                    </div>
                    {supplier.reviews.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-slate-400 text-center">No reviews yet.</p>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {supplier.reviews.map((review) => (
                                <div key={review.id} className="px-4 py-3 flex items-center gap-6">
                                    <span className="text-xs text-slate-500 w-24 shrink-0">{review.review_date}</span>
                                    <div className="flex gap-4 text-xs text-slate-600">
                                        <span>Quality: <strong>{review.quality_score}</strong></span>
                                        <span>Delivery: <strong>{review.delivery_score}</strong></span>
                                        <span>Communication: <strong>{review.communication_score}</strong></span>
                                        <span>Price: <strong>{review.price_score}</strong></span>
                                    </div>
                                    <span className="ml-auto font-semibold text-indigo-600 text-sm">
                                        {review.overall_score?.toFixed(1)} avg
                                    </span>
                                    {review.notes && (
                                        <span className="text-xs text-slate-500 max-w-xs truncate">{review.notes}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Contracts */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                        <h2 className="text-base font-medium text-slate-800">
                            Contracts ({supplier.contracts.length})
                        </h2>
                        <Link href="/inventory/supplier-contracts">
                            <Button variant="secondary">Add Contract</Button>
                        </Link>
                    </div>
                    {supplier.contracts.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-slate-400 text-center">No contracts yet.</p>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {supplier.contracts.map((contract) => (
                                <div key={contract.id} className={`px-4 py-3 flex items-center gap-4 ${contract.is_expiring ? 'bg-amber-50' : ''}`}>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-900">{contract.title}</p>
                                        {contract.contract_number && (
                                            <p className="text-xs text-slate-500">#{contract.contract_number}</p>
                                        )}
                                    </div>
                                    <span className="text-xs text-slate-500">
                                        {contract.start_date} — {contract.end_date ?? 'Open-ended'}
                                    </span>
                                    {contract.value != null && (
                                        <span className="text-sm font-medium text-slate-700">
                                            ${contract.value.toLocaleString()}
                                        </span>
                                    )}
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[contract.status] ?? ''}`}>
                                        {contract.status}
                                    </span>
                                    {contract.is_expiring && (
                                        <span className="text-xs text-amber-600 font-medium">
                                            {contract.days_remaining}d left
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
