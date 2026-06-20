import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';

interface Product {
    id: number;
    name: string;
    sku: string;
    sale_price: number;
}

interface CartItem {
    product_id: number | null;
    product_name: string;
    product_sku: string;
    quantity: number;
    unit_price: number;
    discount_percent: number;
    line_total: number;
}

interface Session {
    id: number;
    name: string;
    status: string;
    opened_at: string | null;
    opening_cash: number;
    total_sales: number;
    warehouse: { id: number; name: string } | null;
    opened_by: { id: number; name: string } | null;
}

interface RecentOrder {
    id: number;
    receipt_number: string | null;
    customer_name: string | null;
    total: number;
    payment_method: string;
    status: string;
    created_at: string;
}

interface Props {
    session: Session;
    products: Product[];
    recentOrders: RecentOrder[];
}

const statusColors: Record<string, string> = {
    completed: 'bg-green-100 text-green-800',
    pending:   'bg-yellow-100 text-yellow-800',
    refunded:  'bg-red-100 text-red-800',
    voided:    'bg-slate-100 text-slate-800',
};

export default function SessionShow({ session, products, recentOrders }: Props) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [discountPercent, setDiscountPercent] = useState(0);
    const [taxPercent, setTaxPercent] = useState(0);
    const [customerName, setCustomerName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'digital_wallet'>('cash');
    const [amountPaid, setAmountPaid] = useState('');

    const { post, processing } = useForm();

    const addToCart = (product: Product) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.product_id === product.id);
            if (existing) {
                return prev.map((i) =>
                    i.product_id === product.id
                        ? { ...i, quantity: i.quantity + 1, line_total: (i.quantity + 1) * i.unit_price }
                        : i
                );
            }
            return [...prev, {
                product_id: product.id,
                product_name: product.name,
                product_sku: product.sku,
                quantity: 1,
                unit_price: product.sale_price,
                discount_percent: 0,
                line_total: product.sale_price,
            }];
        });
    };

    const removeFromCart = (productId: number | null, index: number) => {
        setCart((prev) => prev.filter((_, i) => i !== index));
    };

    const updateQty = (index: number, qty: number) => {
        if (qty <= 0) return;
        setCart((prev) => prev.map((item, i) =>
            i === index
                ? { ...item, quantity: qty, line_total: qty * item.unit_price * (1 - item.discount_percent / 100) }
                : item
        ));
    };

    const subtotal = cart.reduce((sum, i) => sum + i.line_total, 0);
    const discountAmount = subtotal * (discountPercent / 100);
    const taxAmount = (subtotal - discountAmount) * (taxPercent / 100);
    const grandTotal = subtotal - discountAmount + taxAmount;
    const paid = parseFloat(amountPaid) || 0;
    const change = Math.max(0, paid - grandTotal);

    const completeSale = () => {
        if (cart.length === 0) return;
        const formData = {
            session_id: session.id,
            customer_name: customerName || null,
            discount_amount: discountAmount,
            tax_amount: taxAmount,
            amount_paid: paid,
            payment_method: paymentMethod,
            items: cart,
        };

        post('/pos/orders', {
            data: formData as any,
            onSuccess: () => {
                setCart([]);
                setDiscountPercent(0);
                setTaxPercent(0);
                setCustomerName('');
                setAmountPaid('');
            },
        });
    };

    return (
        <AppLayout title={`Session: ${session.name}`}>
            <div className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-semibold text-slate-900">{session.name}</h1>
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${session.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                            {session.status}
                        </span>
                    </div>
                    {session.status === 'open' && (
                        <a href={`/pos/sessions/${session.id}/z-report`}>
                            <Button variant="danger">Close Session</Button>
                        </a>
                    )}
                </div>

                <div className="flex gap-4 h-[calc(100vh-220px)]">
                    {/* Product Grid */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                            {products.map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className="rounded-lg border border-slate-200 bg-white p-3 text-left hover:border-indigo-300 hover:bg-indigo-50 transition-colors shadow-sm"
                                >
                                    <p className="text-sm font-medium text-slate-900 line-clamp-2">{product.name}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{product.sku}</p>
                                    <p className="text-sm font-bold text-indigo-600 mt-1">${Number(product.sale_price).toFixed(2)}</p>
                                </button>
                            ))}
                            {products.length === 0 && (
                                <div className="col-span-4 py-8 text-center text-slate-500">No products available</div>
                            )}
                        </div>
                    </div>

                    {/* Cart Panel */}
                    <div className="w-80 flex flex-col bg-white rounded-lg border border-slate-200 shadow-sm">
                        <div className="p-3 border-b border-slate-200 font-semibold text-slate-900">Cart</div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {cart.length === 0 && (
                                <p className="text-center text-slate-400 py-8 text-sm">Add products to cart</p>
                            )}
                            {cart.map((item, index) => (
                                <div key={index} className="flex items-center gap-2 rounded-md border border-slate-100 p-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-slate-900 truncate">{item.product_name}</p>
                                        <p className="text-xs text-slate-500">${item.unit_price.toFixed(2)} each</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => updateQty(index, item.quantity - 1)}
                                            className="h-6 w-6 rounded border border-slate-300 text-sm flex items-center justify-center hover:bg-slate-100"
                                        >-</button>
                                        <span className="text-xs w-6 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQty(index, item.quantity + 1)}
                                            className="h-6 w-6 rounded border border-slate-300 text-sm flex items-center justify-center hover:bg-slate-100"
                                        >+</button>
                                    </div>
                                    <p className="text-xs font-semibold w-14 text-right">${item.line_total.toFixed(2)}</p>
                                    <button
                                        onClick={() => removeFromCart(item.product_id, index)}
                                        className="text-slate-400 hover:text-red-500 text-xs"
                                    >✕</button>
                                </div>
                            ))}
                        </div>

                        {/* Totals & Payment */}
                        <div className="p-3 border-t border-slate-200 space-y-2">
                            <div>
                                <label className="text-xs text-slate-500">Customer Name</label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Optional"
                                    className="w-full rounded border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="text-xs text-slate-500">Discount %</label>
                                    <input type="number" min="0" max="100" step="0.1"
                                        value={discountPercent}
                                        onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                                        className="w-full rounded border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-slate-500">Tax %</label>
                                    <input type="number" min="0" max="100" step="0.1"
                                        value={taxPercent}
                                        onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                                        className="w-full rounded border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-red-600">
                                        <span>Discount</span><span>-${discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                {taxAmount > 0 && (
                                    <div className="flex justify-between text-slate-600">
                                        <span>Tax</span><span>+${taxAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-base text-slate-900 border-t border-slate-200 pt-1">
                                    <span>Total</span><span>${grandTotal.toFixed(2)}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500">Payment Method</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                                    className="w-full rounded border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="cash">Cash</option>
                                    <option value="card">Card</option>
                                    <option value="digital_wallet">Digital Wallet</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500">Amount Paid ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={amountPaid}
                                    onChange={(e) => setAmountPaid(e.target.value)}
                                    className="w-full rounded border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            {paid > 0 && (
                                <div className="flex justify-between text-xs font-semibold text-green-700">
                                    <span>Change</span><span>${change.toFixed(2)}</span>
                                </div>
                            )}
                            <Button
                                onClick={completeSale}
                                loading={processing}
                                disabled={cart.length === 0}
                                className="w-full"
                            >
                                Complete Sale
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                {recentOrders.length > 0 && (
                    <div className="rounded-lg bg-white shadow-sm border border-slate-200">
                        <div className="px-6 py-3 border-b border-slate-200">
                            <h2 className="text-sm font-semibold text-slate-900">Recent Orders This Session</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Receipt</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Customer</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Total</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Payment</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-2 text-xs font-medium text-indigo-600">
                                                <a href={`/pos/orders/${order.id}`}>{order.receipt_number ?? `#${order.id}`}</a>
                                            </td>
                                            <td className="px-4 py-2 text-xs text-slate-700">{order.customer_name ?? '—'}</td>
                                            <td className="px-4 py-2 text-xs text-slate-700">${order.total.toFixed(2)}</td>
                                            <td className="px-4 py-2 text-xs text-slate-700 capitalize">{order.payment_method.replace('_', ' ')}</td>
                                            <td className="px-4 py-2">
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[order.status] ?? 'bg-slate-100 text-slate-800'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
