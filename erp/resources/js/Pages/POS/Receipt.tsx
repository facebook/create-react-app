import React from 'react';
import { Link } from '@inertiajs/react';

interface OrderItem { id: number; name: string; qty: number; unit_price: number; line_total: number; }
interface Order {
    id: number;
    receipt_number: string;
    customer_name: string | null;
    subtotal: number;
    discount_amount: number;
    tax_amount: number;
    total: number;
    amount_paid: number;
    change_given: number;
    payment_method: string;
    status: string;
    created_at: string;
    items: OrderItem[];
}
interface Session { id: number; name: string; }

export default function Receipt({ order, session }: { order: Order; session: Session }) {
    return (
        <div className="min-h-screen bg-gray-100 flex items-start justify-center pt-10 pb-10">
            <div className="bg-white rounded-xl shadow-lg w-80 p-6">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Receipt</h1>
                    <p className="text-sm text-gray-500 mt-1">{session.name}</p>
                    <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString()}</p>
                </div>

                <div className="border-t border-b py-3 mb-3">
                    <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Receipt #{order.receipt_number}</div>
                    {order.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm py-1">
                            <span className="text-gray-700">{item.name} × {item.qty}</span>
                            <span className="font-medium">${item.line_total.toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                <div className="space-y-1 text-sm mb-4">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span>
                    </div>
                    {order.discount_amount > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>Discount</span><span>-${order.discount_amount.toFixed(2)}</span>
                        </div>
                    )}
                    {order.tax_amount > 0 && (
                        <div className="flex justify-between text-gray-600">
                            <span>Tax</span><span>${order.tax_amount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total</span><span>${order.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Paid ({order.payment_method})</span><span>${order.amount_paid.toFixed(2)}</span>
                    </div>
                    {order.change_given > 0 && (
                        <div className="flex justify-between text-gray-600">
                            <span>Change</span><span>${order.change_given.toFixed(2)}</span>
                        </div>
                    )}
                </div>

                {order.customer_name && (
                    <p className="text-xs text-gray-500 text-center mb-4">Customer: {order.customer_name}</p>
                )}

                <p className="text-center text-xs text-gray-400 mb-6">Thank you for your purchase!</p>

                <div className="flex gap-2">
                    <button
                        onClick={() => window.print()}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700"
                    >
                        Print
                    </button>
                    <Link href="/pos/terminal" className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm text-center hover:bg-gray-200">
                        New Sale
                    </Link>
                </div>
            </div>
        </div>
    );
}
