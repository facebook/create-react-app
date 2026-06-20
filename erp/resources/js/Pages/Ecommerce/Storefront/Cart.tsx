import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';

interface Store {
    store_name: string;
    store_slug: string;
    currency_code: string;
}

interface CartItem {
    id: number;
    store_product_id: number;
    product_name: string;
    product_sku: string | null;
    quantity: number;
    unit_price: number;
    line_total: number;
}

interface Props {
    store: Store;
    cartItems: CartItem[];
}

export default function StorefrontCart({ store, cartItems }: Props) {
    const [couponCode, setCouponCode] = useState('');
    const [couponResult, setCouponResult] = useState<{ valid: boolean; discount_amount: number; message: string } | null>(null);
    const [applyingCoupon, setApplyingCoupon] = useState(false);

    const subtotal = cartItems.reduce((sum, item) => sum + item.line_total, 0);
    const discount = couponResult?.valid ? (couponResult.discount_amount) : 0;
    const total = subtotal - discount;

    const applyCoupon = async () => {
        setApplyingCoupon(true);
        try {
            const response = await fetch(`/store/${store.store_slug}/coupon/validate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ code: couponCode, subtotal }),
            });
            const data = await response.json();
            setCouponResult(data);
        } catch {
            setCouponResult({ valid: false, discount_amount: 0, message: 'Error applying coupon.' });
        } finally {
            setApplyingCoupon(false);
        }
    };

    const updateQuantity = (item: CartItem, newQty: number) => {
        router.patch(`/store/${store.store_slug}/cart/${item.id}`, { quantity: newQty });
    };

    const removeItem = (item: CartItem) => {
        router.delete(`/store/${store.store_slug}/cart/${item.id}`);
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                        <Link href={`/store/${store.store_slug}`} className="text-xl font-bold text-gray-900 hover:text-indigo-600">
                            {store.store_name}
                        </Link>
                    </div>
                </header>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
                    <p className="text-gray-500 mb-6">Add some products to get started.</p>
                    <Link href={`/store/${store.store_slug}/products`} className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <Link href={`/store/${store.store_slug}`} className="text-xl font-bold text-gray-900 hover:text-indigo-600">
                        {store.store_name}
                    </Link>
                    <nav className="flex items-center gap-6 text-sm">
                        <Link href={`/store/${store.store_slug}/products`} className="text-gray-600 hover:text-gray-900">Products</Link>
                    </nav>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Shopping Cart</h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Table */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {cartItems.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-4">
                                                <div className="font-medium text-gray-900 text-sm">{item.product_name}</div>
                                                {item.product_sku && <div className="text-xs text-gray-400 font-mono">{item.product_sku}</div>}
                                            </td>
                                            <td className="px-4 py-4 text-right text-sm text-gray-600">
                                                {store.currency_code} {item.unit_price.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => updateQuantity(item, item.quantity - 1)}
                                                        className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                                                    >-</button>
                                                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item, item.quantity + 1)}
                                                        className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                                                    >+</button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right text-sm font-medium text-gray-900">
                                                {store.currency_code} {item.line_total.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <button
                                                    onClick={() => removeItem(item)}
                                                    className="text-red-500 hover:text-red-700 text-xs"
                                                >Remove</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex justify-between items-center">
                            <Link href={`/store/${store.store_slug}/products`} className="text-sm text-indigo-600 hover:text-indigo-800">
                                ← Continue Shopping
                            </Link>
                            <button
                                onClick={() => router.delete(`/store/${store.store_slug}/cart`)}
                                className="text-sm text-gray-500 hover:text-red-600"
                            >
                                Clear Cart
                            </button>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>

                            <div className="space-y-2 mb-4 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>{store.currency_code} {subtotal.toFixed(2)}</span>
                                </div>
                                {couponResult?.valid && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Coupon Discount</span>
                                        <span>-{store.currency_code} {discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold text-gray-900">
                                    <span>Total</span>
                                    <span>{store.currency_code} {total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Coupon */}
                            <div className="mb-4">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Coupon Code</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        placeholder="Enter code"
                                        className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                    <button
                                        onClick={applyCoupon}
                                        disabled={applyingCoupon || !couponCode}
                                        className="px-3 py-1.5 bg-gray-800 text-white text-sm rounded hover:bg-gray-700 disabled:opacity-50"
                                    >
                                        Apply
                                    </button>
                                </div>
                                {couponResult && (
                                    <p className={`mt-1 text-xs ${couponResult.valid ? 'text-green-600' : 'text-red-600'}`}>
                                        {couponResult.message}
                                    </p>
                                )}
                            </div>

                            <Link
                                href={`/store/${store.store_slug}/checkout`}
                                className="block w-full text-center bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition"
                            >
                                Proceed to Checkout
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
