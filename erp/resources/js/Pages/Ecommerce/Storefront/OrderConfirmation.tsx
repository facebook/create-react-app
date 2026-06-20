import { Link } from '@inertiajs/react';

interface Store {
    store_name: string;
    store_slug: string;
    currency_code: string;
}

interface OrderItem {
    product_name: string;
    quantity: number;
    unit_price: number;
    line_total: number;
}

interface Order {
    id: number;
    order_number: string | null;
    customer_name: string;
    customer_email: string;
    total: number;
    payment_method: string | null;
    items: OrderItem[];
}

interface Props {
    store: Store;
    order: Order;
}

export default function OrderConfirmation({ store, order }: Props) {
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link href={`/store/${store.store_slug}`} className="text-xl font-bold text-gray-900 hover:text-indigo-600">
                        {store.store_name}
                    </Link>
                </div>
            </header>

            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank You!</h1>
                <p className="text-lg text-gray-600 mb-1">Your order has been placed successfully.</p>
                <p className="text-sm text-gray-500 mb-8">A confirmation will be sent to <strong>{order.customer_email}</strong></p>

                {/* Order Number */}
                <div className="bg-indigo-50 rounded-lg p-4 mb-8 inline-block">
                    <p className="text-sm text-indigo-600 font-medium">Order Number</p>
                    <p className="text-2xl font-bold text-indigo-800">{order.order_number ?? `#${order.id}`}</p>
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-left">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-900">Order Summary</h2>
                    </div>
                    <div className="px-6 py-4">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100 pb-2">
                                    <th className="text-left pb-2">Product</th>
                                    <th className="text-right pb-2">Qty</th>
                                    <th className="text-right pb-2">Price</th>
                                    <th className="text-right pb-2">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {order.items.map((item, i) => (
                                    <tr key={i}>
                                        <td className="py-2 text-gray-900">{item.product_name}</td>
                                        <td className="py-2 text-right text-gray-600">{item.quantity}</td>
                                        <td className="py-2 text-right text-gray-600">
                                            {store.currency_code} {item.unit_price.toFixed(2)}
                                        </td>
                                        <td className="py-2 text-right font-medium text-gray-900">
                                            {store.currency_code} {item.line_total.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 border-t border-gray-100 flex justify-between font-semibold text-gray-900">
                        <span>Total</span>
                        <span>{store.currency_code} {order.total.toFixed(2)}</span>
                    </div>
                    {order.payment_method && (
                        <div className="px-6 py-3 bg-gray-50 rounded-b-lg text-sm text-gray-500">
                            Payment method: <span className="font-medium text-gray-700">{order.payment_method.replace(/_/g, ' ')}</span>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-center gap-4">
                    <Link
                        href={`/store/${store.store_slug}`}
                        className="bg-indigo-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}
