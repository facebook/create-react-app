import { router } from '@inertiajs/react';

interface Review {
    id: number;
    reviewer_name: string;
    rating: number;
    title: string | null;
    body: string | null;
    is_approved: boolean;
    created_at: string;
    product: { id: number; name: string } | null;
}

interface Props {
    reviews: {
        data: Review[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: {
        rating?: string;
        is_approved?: string;
    };
}

function StarRating({ rating }: { rating: number }) {
    return (
        <span className="text-yellow-400">
            {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
        </span>
    );
}

export default function ReviewsIndex({ reviews, filters }: Props) {
    const approveReview = (id: number) => {
        router.post(`/ecommerce/reviews/${id}/approve`);
    };

    const deleteReview = (id: number) => {
        if (confirm('Delete this review?')) {
            router.delete(`/ecommerce/reviews/${id}`);
        }
    };

    const applyFilter = (key: string, value: string) => {
        router.get('/ecommerce/reviews', { ...filters, [key]: value }, { preserveState: true });
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
                <div className="flex gap-3">
                    <select
                        value={filters.rating ?? ''}
                        onChange={e => applyFilter('rating', e.target.value)}
                        className="rounded border border-gray-300 px-3 py-1.5 text-sm"
                    >
                        <option value="">All Ratings</option>
                        {[5, 4, 3, 2, 1].map(r => (
                            <option key={r} value={r}>{r} Star{r !== 1 ? 's' : ''}</option>
                        ))}
                    </select>
                    <select
                        value={filters.is_approved ?? ''}
                        onChange={e => applyFilter('is_approved', e.target.value)}
                        className="rounded border border-gray-300 px-3 py-1.5 text-sm"
                    >
                        <option value="">All Status</option>
                        <option value="1">Approved</option>
                        <option value="0">Pending</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reviewer</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {reviews.data.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">No reviews found.</td>
                            </tr>
                        )}
                        {reviews.data.map((review) => (
                            <tr key={review.id}>
                                <td className="px-4 py-3 text-sm text-gray-900">{review.product?.name ?? '—'}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{review.reviewer_name}</td>
                                <td className="px-4 py-3"><StarRating rating={review.rating} /></td>
                                <td className="px-4 py-3 text-sm text-gray-600">{review.title ?? '—'}</td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${review.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {review.is_approved ? 'Approved' : 'Pending'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right flex gap-2 justify-end">
                                    {!review.is_approved && (
                                        <button
                                            onClick={() => approveReview(review.id)}
                                            className="text-green-600 hover:text-green-800 text-xs font-medium"
                                        >Approve</button>
                                    )}
                                    <button
                                        onClick={() => deleteReview(review.id)}
                                        className="text-red-500 hover:text-red-700 text-xs"
                                    >Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
