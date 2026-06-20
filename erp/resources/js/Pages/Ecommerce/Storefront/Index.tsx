import { Link } from '@inertiajs/react';

interface Store {
    store_name: string;
    store_slug: string;
    description: string | null;
    primary_color: string;
    currency_code: string;
}

interface FeaturedProduct {
    id: number;
    store_price: number;
    compare_price: number | null;
    short_description: string | null;
    product: {
        name: string;
        sku: string | null;
    } | null;
}

interface Props {
    store: Store;
    featuredProducts: FeaturedProduct[];
}

export default function StorefrontIndex({ store, featuredProducts }: Props) {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">{store.store_name}</h1>
                    <nav className="flex items-center gap-6 text-sm">
                        <Link href={`/store/${store.store_slug}/products`} className="text-gray-600 hover:text-gray-900">
                            All Products
                        </Link>
                        <Link href={`/store/${store.store_slug}/checkout`} className="text-gray-600 hover:text-gray-900">
                            Checkout
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero */}
            <div className="bg-indigo-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <h2 className="text-4xl font-bold mb-4">{store.store_name}</h2>
                    {store.description && (
                        <p className="text-lg text-indigo-100 max-w-2xl mx-auto">{store.description}</p>
                    )}
                    <div className="mt-8">
                        <Link
                            href={`/store/${store.store_slug}/products`}
                            className="inline-block bg-white text-indigo-600 font-semibold px-6 py-3 rounded-lg hover:bg-indigo-50 transition"
                        >
                            Shop Now
                        </Link>
                    </div>
                </div>
            </div>

            {/* Featured Products */}
            {featuredProducts.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6">Featured Products</h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {featuredProducts.map(sp => (
                            <div key={sp.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                {/* Image placeholder */}
                                <div className="h-48 bg-gray-100 flex items-center justify-center">
                                    <svg className="h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="p-4">
                                    <h4 className="font-medium text-gray-900 mb-1">{sp.product?.name ?? 'Product'}</h4>
                                    {sp.short_description && (
                                        <p className="text-sm text-gray-500 mb-2 line-clamp-2">{sp.short_description}</p>
                                    )}
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-lg font-bold text-gray-900">
                                            {store.currency_code} {sp.store_price.toFixed(2)}
                                        </span>
                                        {sp.compare_price != null && sp.compare_price > sp.store_price && (
                                            <span className="text-sm text-gray-400 line-through">
                                                {store.currency_code} {sp.compare_price.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/store/${store.store_slug}/products/${sp.id}`}
                                            className="flex-1 text-center bg-indigo-600 text-white text-sm font-medium py-2 rounded hover:bg-indigo-700 transition"
                                        >
                                            View
                                        </Link>
                                        <Link
                                            href={`/store/${store.store_slug}/checkout`}
                                            className="flex-1 text-center bg-white text-indigo-600 border border-indigo-600 text-sm font-medium py-2 rounded hover:bg-indigo-50 transition"
                                        >
                                            Buy Now
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {featuredProducts.length === 0 && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-gray-400">
                    <p className="text-lg">No featured products yet.</p>
                    <Link href={`/store/${store.store_slug}/products`} className="mt-4 inline-block text-indigo-600 hover:underline">
                        Browse all products
                    </Link>
                </div>
            )}

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-400">
                    &copy; {new Date().getFullYear()} {store.store_name}. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
