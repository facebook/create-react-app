import { Link } from '@inertiajs/react';

interface Store {
    store_name: string;
    store_slug: string;
    currency_code: string;
}

interface StoreProduct {
    id: number;
    store_price: number;
    compare_price: number | null;
    is_featured: boolean;
    short_description: string | null;
    product: { name: string; sku: string | null } | null;
    category: { name: string } | null;
}

interface PaginatedProducts {
    data: StoreProduct[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    store: Store;
    products: PaginatedProducts;
    filters: { category_id?: string };
}

export default function StorefrontProducts({ store, products, filters }: Props) {
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <Link href={`/store/${store.store_slug}`} className="text-xl font-bold text-gray-900 hover:text-indigo-600">
                        {store.store_name}
                    </Link>
                    <nav className="flex items-center gap-6 text-sm">
                        <Link href={`/store/${store.store_slug}/products`} className="text-indigo-600 font-medium">Products</Link>
                        <Link href={`/store/${store.store_slug}/checkout`} className="text-gray-600 hover:text-gray-900">Checkout</Link>
                    </nav>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">All Products ({products.total})</h2>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.data.map(sp => (
                        <div key={sp.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="h-40 bg-gray-100 flex items-center justify-center">
                                <svg className="h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="p-4">
                                {sp.is_featured && (
                                    <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded mb-1">Featured</span>
                                )}
                                <h3 className="font-medium text-gray-900 mb-1">{sp.product?.name ?? 'Product'}</h3>
                                {sp.short_description && (
                                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{sp.short_description}</p>
                                )}
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="font-bold text-gray-900">
                                        {store.currency_code} {sp.store_price.toFixed(2)}
                                    </span>
                                    {sp.compare_price != null && sp.compare_price > sp.store_price && (
                                        <span className="text-sm text-gray-400 line-through">
                                            {store.currency_code} {sp.compare_price.toFixed(2)}
                                        </span>
                                    )}
                                </div>
                                <Link
                                    href={`/store/${store.store_slug}/products/${sp.id}`}
                                    className="block text-center bg-indigo-600 text-white text-sm font-medium py-2 rounded hover:bg-indigo-700 transition"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {products.data.length === 0 && (
                    <p className="text-center text-gray-400 py-12">No products available.</p>
                )}
            </div>
        </div>
    );
}
