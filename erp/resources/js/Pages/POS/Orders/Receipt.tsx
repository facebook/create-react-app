import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { Link, router } from '@inertiajs/react';

interface OrderItem {
    id: number;
    product_name: string;
    product_sku: string | null;
    quantity: number;
    unit_price: number;
    discount_percent: number;
    line_total: number;
}

interface Order {
    id: number;
    receipt_number: string | null;
    customer_name: string | null;
    customer_email: string | null;
    subtotal: number;
    discount_amount: number;
    tax_amount: number;
    total: number;
    amount_paid: number;
    change_given: number;
    payment_method: string;
    status: string;
    created_at: string;
    session: { id: number; name: string } | null;
    items: OrderItem[];
}

interface Props {
    order: Order;
}

const statusColors: Record<string, string> = {
    completed: 'bg-green-100 text-green-800',
    pending:   'bg-yellow-100 text-yellow-800',
    refunded:  'bg-red-100 text-red-800',
    voided:    'bg-slate-100 text-slate-800',
};

export default function Receipt({ order }: Props) {
    const handleRefund = () => {
        if (confirm('Are you sure you want to refund this order?')) {
            router.post(`/pos/orders/${order.id}/refund`);
        }
    };

    return (
        <AppLayout title={`Receipt ${order.receipt_number ?? '#' + order.id}`}>
            <div className="p-6 max-w-lg">
                {/* Actions */}
                <div className="flex items-center gap-3 mb-4 print:hidden">
                    {order.session && (
                        <Link href={`/pos/sessions/${order.session.id}`}>
                            <Button variant="secondary">Back to Register</Button>
                        </Link>
                    )}
                    <Link href="/pos/orders">
                        <Button variant="secondary">All Orders</Button>
                    </Link>
                    <Button variant="secondary" onClick={() => window.print()}>Print</Button>
                    {order.status === 'completed' && (
                        <Button variant="danger" onClick={handleRefund}>Refund</Button>
                    )}
                </div>

                {/* Receipt */}
                <div className="rounded-lg bg-white shadow-sm border border-slate-200 p-6 space-y-4 print:shadow-none print:border-none">
                    {/* Header */}
                    <div className="text-center border-b border-slate-200 pb-4">
                        <h1 className="text-xl font-bold text-slate-900">POS System</h1>
                        {order.session && (
                            <p className="text-sm text-slate-500">{order.session.name}</p>
                        )}
                        <p className="text-lg font-semibold text-slate-800 mt-2">
                            {order.receipt_number ?? `#${order.id}`}
                        </p>
                        <p className="text-sm text-slate-500">{new Date(order.created_at).toLocaleString()}</p>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold mt-2 ${statusColors[order.status] ?? 'bg-slate-100 text-slate-800'}`}>
                            {order.status}
                        </span>
                    </div>

                    {/* Customer */}
                    {order.customer_name && (
                        <div>
                            <p className="text-sm font-medium text-slate-700">Customer: {order.customer_name}</p>
                            {order.customer_email && (
                                <p className="text-sm text-slate-500">{order.customer_email}</p>
                            )}
                        </div>
                    )}

                    {/* Items */}
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="py-1 text-left font-medium text-slate-700">Item</th>
                                <th className="py-1 text-right font-medium text-slate-700">Qty</th>
                                <th className="py-1 text-right font-medium text-slate-700">Price</th>
                                <th className="py-1 text-right font-medium text-slate-700">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {order.items.map((item) => (
                                <tr key={item.id}>
                                    <td className="py-1.5">
                                        <p className="text-slate-900">{item.product_name}</p>
                                        {item.product_sku && <p className="text-xs text-slate-400">{item.product_sku}</p>}
                                        {item.discount_percent > 0 && (
                                            <p className="text-xs text-red-500">-{item.discount_percent}% disc</p>
                                        )}
                                    </td>
                                    <td className="py-1.5 text-right text-slate-700">{item.quantity}</td>
                                    <td className="py-1.5 text-right text-slate-700">${item.unit_price.toFixed(2)}</td>
                                    <td className="py-1.5 text-right font-medium text-slate-900">${item.line_total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="border-t border-slate-200 pt-3 space-y-1 text-sm">
                        <div className="flex justify-between text-slate-600">
                            <span>Subtotal</span>
                            <span>${order.subtotal.toFixed(2)}</span>
                        </div>
                        {order.discount_amount > 0 && (
                            <div className="flex justify-between text-red-600">
                                <span>Discount</span>
                                <span>-${order.discount_amount.toFixed(2)}</span>
                            </div>
                        )}
                        {order.tax_amount > 0 && (
                            <div className="flex justify-between text-slate-600">
                                <span>Tax</span>
                                <span>+${order.tax_amount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-base text-slate-900 border-t border-slate-200 pt-1">
                            <span>Total</span>
                            <span>${order.total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Payment */}
                    <div className="border-t border-slate-200 pt-3 space-y-1 text-sm">
                        <div className="flex justify-between text-slate-600">
                            <span>Payment Method</span>
                            <span className="capitalize">{order.payment_method.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>Amount Paid</span>
                            <span>${order.amount_paid.toFixed(2)}</span>
                        </div>
                        {order.change_given > 0 && (
                            <div className="flex justify-between font-semibold text-green-700">
                                <span>Change</span>
                                <span>${order.change_given.toFixed(2)}</span>
                            </div>
                        )}
                    </div>

                    <div className="text-center pt-2 text-xs text-slate-400">Thank you for your purchase!</div>
                </div>
            </div>
        </AppLayout>
    );
}
