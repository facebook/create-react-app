import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';

interface Store {
    store_name: string;
    store_slug: string;
    currency_code: string;
}

interface CartItem {
    store_product_id?: number;
    product_name: string;
    product_sku?: string;
    quantity: number;
    unit_price: number;
    line_total: number;
}

interface Props {
    store: Store;
    cartItems: CartItem[];
}

export default function StorefrontCheckout({ store, cartItems }: Props) {
    const [couponCode, setCouponCode] = useState('');
    const [couponResult, setCouponResult] = useState<{ valid: boolean; discount_amount: number; message: string } | null>(null);
    const [applyingCoupon, setApplyingCoupon] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        customer_name:    '',
        customer_email:   '',
        customer_phone:   '',
        shipping_address: '',
        billing_address:  '',
        notes:            '',
        payment_method:   'cash_on_delivery' as string,
        coupon_code:      '',
        discount_amount:  0,
        items: cartItems.length > 0 ? cartItems : [
            {
                store_product_id: undefined as number | undefined,
                product_name: 'Sample Product',
                product_sku: '',
                quantity: 1,
                unit_price: 0,
                line_total: 0,
            }
        ],
    });

    const subtotal = data.items.reduce((sum, item) => sum + item.line_total, 0);
    const discount = couponResult?.valid ? couponResult.discount_amount : 0;
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
            const result = await response.json();
            setCouponResult(result);
            if (result.valid) {
                setData('coupon_code', couponCode);
                setData('discount_amount', result.discount_amount);
            }
        } catch {
            setCouponResult({ valid: false, discount_amount: 0, message: 'Error applying coupon.' });
        } finally {
            setApplyingCoupon(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/store/${store.store_slug}/checkout`);
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
                    </nav>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Checkout</h2>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
                                <h3 className="font-semibold text-gray-900">Customer Information</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                    <input
                                        type="text"
                                        value={data.customer_name}
                                        onChange={e => setData('customer_name', e.target.value)}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                    {errors.customer_name && <p className="mt-1 text-sm text-red-600">{errors.customer_name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                    <input
                                        type="email"
                                        value={data.customer_email}
                                        onChange={e => setData('customer_email', e.target.value)}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                    {errors.customer_email && <p className="mt-1 text-sm text-red-600">{errors.customer_email}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={data.customer_phone}
                                        onChange={e => setData('customer_phone', e.target.value)}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
                                <h3 className="font-semibold text-gray-900">Addresses</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
                                    <textarea
                                        value={data.shipping_address}
                                        onChange={e => setData('shipping_address', e.target.value)}
                                        rows={3}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Billing Address</label>
                                    <textarea
                                        value={data.billing_address}
                                        onChange={e => setData('billing_address', e.target.value)}
                                        rows={3}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
                                <h3 className="font-semibold text-gray-900">Payment</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                                    <select
                                        value={data.payment_method}
                                        onChange={e => setData('payment_method', e.target.value)}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="cash_on_delivery">Cash on Delivery</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="card">Card</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                    <textarea
                                        value={data.notes}
                                        onChange={e => setData('notes', e.target.value)}
                                        rows={2}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Any special instructions..."
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                            >
                                {processing ? 'Placing Order...' : 'Place Order'}
                            </button>
                        </form>
                    </div>

                    {/* Cart Summary */}
                    <div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
                            <div className="space-y-2 mb-4">
                                {data.items.map((item, i) => (
                                    <div key={i} className="flex justify-between text-sm text-gray-600">
                                        <span>{item.product_name} × {item.quantity}</span>
                                        <span>{store.currency_code} {item.line_total.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-1 border-t border-gray-100 pt-3 text-sm">
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
                                <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t border-gray-100">
                                    <span>Total</span>
                                    <span>{store.currency_code} {total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Coupon Code */}
                            <div className="mt-4">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Coupon Code</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={e => setCouponCode(e.target.value)}
                                        placeholder="Enter code"
                                        className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                    <button
                                        type="button"
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
