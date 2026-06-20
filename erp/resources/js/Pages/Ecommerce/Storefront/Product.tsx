import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';

interface Store {
    store_name: string;
    store_slug: string;
    currency_code: string;
}

interface StoreProductDetail {
    id: number;
    store_price: number;
    compare_price: number | null;
    is_featured: boolean;
    short_description: string | null;
    long_description: string | null;
    meta_title: string | null;
    meta_description: string | null;
    discount_percent: number;
    product: { name: string; sku: string | null } | null;
    category: { name: string } | null;
}

interface Review {
    id: number;
    reviewer_name: string;
    rating: number;
    title: string | null;
    body: string | null;
    created_at: string;
}

interface Props {
    store: Store;
    storeProduct: StoreProductDetail;
    reviews?: Review[];
}

function StarRating({ rating }: { rating: number }) {
    return (
        <span className="text-yellow-400">
            {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
        </span>
    );
}

export default function StorefrontProduct({ store, storeProduct, reviews = [] }: Props) {
    const productName = storeProduct.product?.name ?? 'Product';
    const [showReviewForm, setShowReviewForm] = useState(false);

    const { data, setData, post, processing, errors, reset, wasSuccessful } = useForm({
        reviewer_name: '',
        reviewer_email: '',
        rating: '5',
        title: '',
        body: '',
    });

    const handleReviewSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/store/${store.store_slug}/products/${storeProduct.id}/reviews`, {
            onSuccess: () => {
                reset();
                setShowReviewForm(false);
            },
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <Link href={`/store/${store.store_slug}`} className="text-xl font-bold text-gray-900 hover:text-indigo-600">
                        {store.store_name}
                    </Link>
                    <nav className="flex items-center gap-6 text-sm">
                        <Link href={`/store/${store.store_slug}/products`} className="text-gray-600 hover:text-gray-900">Products</Link>
                        <Link href={`/store/${store.store_slug}/checkout`} className="text-gray-600 hover:text-gray-900">Checkout</Link>
                    </nav>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Link href={`/store/${store.store_slug}/products`} className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
                    ← Back to Products
                </Link>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                        {/* Image */}
                        <div className="h-80 md:h-auto bg-gray-100 flex items-center justify-center">
                            <svg className="h-24 w-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>

                        {/* Details */}
                        <div className="p-8">
                            {storeProduct.category && (
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{storeProduct.category.name}</p>
                            )}
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">{productName}</h1>
                            {storeProduct.product?.sku && (
                                <p className="text-xs text-gray-400 font-mono mb-4">SKU: {storeProduct.product.sku}</p>
                            )}

                            {storeProduct.short_description && (
                                <p className="text-sm text-gray-600 mb-4">{storeProduct.short_description}</p>
                            )}

                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-3xl font-bold text-gray-900">
                                    {store.currency_code} {storeProduct.store_price.toFixed(2)}
                                </span>
                                {storeProduct.compare_price != null && storeProduct.compare_price > storeProduct.store_price && (
                                    <>
                                        <span className="text-xl text-gray-400 line-through">
                                            {store.currency_code} {storeProduct.compare_price.toFixed(2)}
                                        </span>
                                        <span className="bg-red-100 text-red-700 text-sm font-medium px-2 py-0.5 rounded">
                                            -{storeProduct.discount_percent}%
                                        </span>
                                    </>
                                )}
                            </div>

                            <Link
                                href={`/store/${store.store_slug}/checkout`}
                                className="block w-full text-center bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition"
                            >
                                Buy Now
                            </Link>
                        </div>
                    </div>

                    {storeProduct.long_description && (
                        <div className="p-8 border-t border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                            <div className="prose prose-sm text-gray-600 whitespace-pre-line">
                                {storeProduct.long_description}
                            </div>
                        </div>
                    )}

                    {/* Reviews Section */}
                    <div className="p-8 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Customer Reviews {reviews.length > 0 && <span className="text-gray-400 font-normal text-sm">({reviews.length})</span>}
                            </h2>
                            <button
                                onClick={() => setShowReviewForm(!showReviewForm)}
                                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                                {showReviewForm ? 'Cancel' : 'Write a Review'}
                            </button>
                        </div>

                        {showReviewForm && (
                            <div className="bg-gray-50 rounded-lg p-5 mb-6 border border-gray-200">
                                <h3 className="font-medium text-gray-900 mb-3">Write a Review</h3>
                                <form onSubmit={handleReviewSubmit} className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                            <input
                                                type="text"
                                                value={data.reviewer_name}
                                                onChange={e => setData('reviewer_name', e.target.value)}
                                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                                                required
                                            />
                                            {errors.reviewer_name && <p className="text-red-500 text-xs mt-1">{errors.reviewer_name}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input
                                                type="email"
                                                value={data.reviewer_email}
                                                onChange={e => setData('reviewer_email', e.target.value)}
                                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Rating *</label>
                                        <select
                                            value={data.rating}
                                            onChange={e => setData('rating', e.target.value)}
                                            className="rounded border border-gray-300 px-3 py-2 text-sm"
                                        >
                                            {[5, 4, 3, 2, 1].map(r => (
                                                <option key={r} value={r}>{r} Star{r !== 1 ? 's' : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                        <input
                                            type="text"
                                            value={data.title}
                                            onChange={e => setData('title', e.target.value)}
                                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                                            placeholder="Summarize your experience"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
                                        <textarea
                                            value={data.body}
                                            onChange={e => setData('body', e.target.value)}
                                            rows={3}
                                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                                            placeholder="Tell others about your experience..."
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        {processing ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {reviews.length === 0 ? (
                            <p className="text-gray-400 text-sm">No reviews yet. Be the first to review this product.</p>
                        ) : (
                            <div className="space-y-4">
                                {reviews.map((review) => (
                                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <StarRating rating={review.rating} />
                                            <span className="font-medium text-sm text-gray-900">{review.reviewer_name}</span>
                                            <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
                                        </div>
                                        {review.title && <p className="font-medium text-sm text-gray-800 mb-1">{review.title}</p>}
                                        {review.body && <p className="text-sm text-gray-600">{review.body}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
