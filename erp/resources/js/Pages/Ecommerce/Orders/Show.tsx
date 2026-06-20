import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { Link, router } from '@inertiajs/react';

interface OrderItem {
    id: number;
    product_name: string;
    product_sku: string | null;
    quantity: number;
    unit_price: number;
    line_total: number;
}

interface Order {
    id: number;
    order_number: string | null;
    status: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string | null;
    shipping_address: string | null;
    billing_address: string | null;
    subtotal: number;
    discount_amount: number;
    shipping_amount: number;
    tax_amount: number;
    total: number;
    payment_method: string | null;
    payment_status: string;
    notes: string | null;
    processed_by: { name: string } | null;
    created_at: string;
    items: OrderItem[];
}

interface Props {
    order: Order;
}

const statusColors: Record<string, string> = {
    pending:    'bg-yellow-100 text-yellow-800',
    confirmed:  'bg-blue-100 text-blue-800',
    processing: 'bg-indigo-100 text-indigo-800',
    shipped:    'bg-purple-100 text-purple-800',
    delivered:  'bg-green-100 text-green-800',
    cancelled:  'bg-red-100 text-red-800',
    refunded:   'bg-slate-100 text-slate-800',
};

const paymentColors: Record<string, string> = {
    pending:  'bg-yellow-100 text-yellow-800',
    paid:     'bg-green-100 text-green-800',
    failed:   'bg-red-100 text-red-800',
    refunded: 'bg-slate-100 text-slate-800',
};

export default function OrderShow({ order }: Props) {
    const action = (url: string) => {
        if (confirm('Are you sure?')) {
            router.post(url);
        }
    };

    return (
        <AppLayout title={`Order ${order.order_number ?? order.id}`}>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-4 mb-1">
                            <Link href="/ecommerce/orders" className="text-sm text-slate-500 hover:text-slate-700">← Orders</Link>
                            <h1 className="text-2xl font-semibold text-slate-900">
                                {order.order_number ?? `Order #${order.id}`}
                            </h1>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status] ?? 'bg-slate-100 text-slate-800'}`}>
                                {order.status}
                            </span>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${paymentColors[order.payment_status] ?? 'bg-slate-100 text-slate-800'}`}>
                                {order.payment_status}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500">{new Date(order.created_at).toLocaleString()}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                        {order.status === 'pending' && (
                            <Button onClick={() => action(`/ecommerce/orders/${order.id}/confirm`)} variant="secondary" size="sm">
                                Confirm
                            </Button>
                        )}
                        {order.payment_status === 'pending' && (
                            <Button onClick={() => action(`/ecommerce/orders/${order.id}/mark-paid`)} size="sm">
                                Mark Paid
                            </Button>
                        )}
                        {(order.status === 'confirmed' || order.status === 'processing') && (
                            <Button onClick={() => action(`/ecommerce/orders/${order.id}/ship`)} variant="secondary" size="sm">
                                Ship
                            </Button>
                        )}
                        {order.status === 'shipped' && (
                            <Button onClick={() => action(`/ecommerce/orders/${order.id}/deliver`)} variant="secondary" size="sm">
                                Deliver
                            </Button>
                        )}
                        {!['cancelled','delivered','refunded'].includes(order.status) && (
                            <Button onClick={() => action(`/ecommerce/orders/${order.id}/cancel`)} variant="danger" size="sm">
                                Cancel
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Customer Info */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
                        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Customer</h2>
                        <div className="space-y-1 text-sm text-slate-700">
                            <p className="font-medium">{order.customer_name}</p>
                            <p className="text-slate-500">{order.customer_email}</p>
                            {order.customer_phone && <p className="text-slate-500">{order.customer_phone}</p>}
                        </div>
                    </div>

                    {/* Shipping */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
                        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Shipping Address</h2>
                        <p className="text-sm text-slate-600 whitespace-pre-line">{order.shipping_address ?? '—'}</p>
                    </div>

                    {/* Payment */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
                        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Payment</h2>
                        <div className="space-y-1 text-sm text-slate-700">
                            <p>Method: <span className="font-medium">{order.payment_method ?? '—'}</span></p>
                            <p>Status: <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${paymentColors[order.payment_status] ?? ''}`}>{order.payment_status}</span></p>
                            {order.billing_address && (
                                <div className="mt-2">
                                    <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Billing Address</p>
                                    <p className="whitespace-pre-line">{order.billing_address}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                    <div className="px-6 py-4 border-b border-slate-200">
                        <h2 className="text-base font-semibold text-slate-900">Items</h2>
                    </div>
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">SKU</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Qty</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Unit Price</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {order.items.map(item => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.product_name}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500 font-mono">{item.product_sku ?? '—'}</td>
                                    <td className="px-6 py-4 text-sm text-slate-700 text-right">{item.quantity}</td>
                                    <td className="px-6 py-4 text-sm text-slate-700 text-right">${item.unit_price.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900 text-right">${item.line_total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
                        <div className="w-64 space-y-1 text-sm">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span>${order.subtotal.toFixed(2)}</span>
                            </div>
                            {order.discount_amount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span>-${order.discount_amount.toFixed(2)}</span>
                                </div>
                            )}
                            {order.shipping_amount > 0 && (
                                <div className="flex justify-between text-slate-600">
                                    <span>Shipping</span>
                                    <span>${order.shipping_amount.toFixed(2)}</span>
                                </div>
                            )}
                            {order.tax_amount > 0 && (
                                <div className="flex justify-between text-slate-600">
                                    <span>Tax</span>
                                    <span>${order.tax_amount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-semibold text-slate-900 border-t border-slate-200 pt-1">
                                <span>Total</span>
                                <span>${order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {order.notes && (
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
                        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Notes</h2>
                        <p className="text-sm text-slate-600">{order.notes}</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
