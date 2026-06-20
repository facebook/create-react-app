import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';

interface Product { id: number; name: string; sku: string; price: number; }
interface CartItem { product_id: number; name: string; qty: number; price: number; }
interface Session { id: number; name: string; status: string; }

interface Props {
    session: Session | null;
}

export default function Terminal({ session }: Props) {
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [search, setSearch] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('cash');
    const [amountPaid, setAmountPaid] = useState('');
    const [processing, setProcessing] = useState(false);
    const [lastReceipt, setLastReceipt] = useState<{ order_id: number; receipt_number: string; change_given: number } | null>(null);

    useEffect(() => {
        fetchProducts(search);
    }, [search]);

    const fetchProducts = (q: string) => {
        axios.get('/pos/terminal/products', { params: { search: q } })
            .then(r => setProducts(r.data))
            .catch(() => {});
    };

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(i => i.product_id === product.id);
            if (existing) {
                return prev.map(i => i.product_id === product.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { product_id: product.id, name: product.name, qty: 1, price: product.price }];
        });
    };

    const updateQty = (product_id: number, qty: number) => {
        if (qty <= 0) {
            setCart(prev => prev.filter(i => i.product_id !== product_id));
        } else {
            setCart(prev => prev.map(i => i.product_id === product_id ? { ...i, qty } : i));
        }
    };

    const subtotal = cart.reduce((sum, i) => sum + i.qty * i.price, 0);
    const change = parseFloat(amountPaid || '0') - subtotal;

    const handleCheckout = () => {
        if (!session || cart.length === 0) return;
        setProcessing(true);
        axios.post('/pos/terminal/checkout', {
            session_id: session.id,
            items: cart,
            payment_method: paymentMethod,
            amount_paid: parseFloat(amountPaid || String(subtotal)),
        })
        .then(r => {
            setLastReceipt(r.data);
            setCart([]);
            setAmountPaid('');
        })
        .catch(() => alert('Checkout failed'))
        .finally(() => setProcessing(false));
    };

    if (!session) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">No Open Session</h2>
                    <p className="text-gray-500 mb-6">Open a POS session to start selling.</p>
                    <a href="/pos/sessions/create" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                        Open Session
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Product Grid */}
            <div className="flex-1 flex flex-col">
                <div className="bg-white border-b p-3">
                    <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-700">POS Terminal — {session.name}</span>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="ml-auto border rounded px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <a href="/pos/sessions-list" className="text-sm text-blue-600 hover:underline">Sessions</a>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 content-start">
                    {products.map(p => (
                        <button
                            key={p.id}
                            onClick={() => addToCart(p)}
                            className="bg-white rounded-lg border hover:border-blue-500 hover:shadow p-3 text-left transition"
                        >
                            <div className="font-medium text-gray-800 text-sm">{p.name}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{p.sku}</div>
                            <div className="text-blue-600 font-bold mt-2">${p.price.toFixed(2)}</div>
                        </button>
                    ))}
                    {products.length === 0 && (
                        <div className="col-span-full text-center text-gray-400 py-12">No products found</div>
                    )}
                </div>
            </div>

            {/* Cart */}
            <div className="w-80 bg-white border-l flex flex-col">
                <div className="p-4 border-b font-semibold text-gray-700">
                    Cart ({cart.reduce((s, i) => s + i.qty, 0)} items)
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {cart.map(item => (
                        <div key={item.product_id} className="flex items-center gap-2 p-2 rounded bg-gray-50 border text-sm">
                            <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{item.name}</div>
                                <div className="text-gray-500">${item.price.toFixed(2)} each</div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => updateQty(item.product_id, item.qty - 1)} className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 text-sm">-</button>
                                <span className="w-6 text-center">{item.qty}</span>
                                <button onClick={() => updateQty(item.product_id, item.qty + 1)} className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 text-sm">+</button>
                            </div>
                            <div className="font-semibold w-16 text-right">${(item.qty * item.price).toFixed(2)}</div>
                        </div>
                    ))}
                    {cart.length === 0 && <p className="text-center text-gray-400 py-8 text-sm">Cart is empty</p>}
                </div>

                {lastReceipt && (
                    <div className="p-3 bg-green-50 border-t border-green-200 text-sm text-green-700">
                        <div className="font-semibold">Sale complete! {lastReceipt.receipt_number}</div>
                        <div>Change: ${lastReceipt.change_given.toFixed(2)}</div>
                        <a href={`/pos/terminal/${session.id}/receipt/${lastReceipt.order_id}`} className="text-green-600 underline text-xs">
                            View Receipt
                        </a>
                    </div>
                )}

                {/* Payment */}
                <div className="p-4 border-t space-y-3">
                    <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex gap-1">
                        {(['cash', 'card', 'mobile'] as const).map(m => (
                            <button
                                key={m}
                                onClick={() => setPaymentMethod(m)}
                                className={`flex-1 py-1.5 rounded text-sm capitalize ${paymentMethod === m ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                    {paymentMethod === 'cash' && (
                        <input
                            type="number"
                            placeholder="Amount paid"
                            value={amountPaid}
                            onChange={e => setAmountPaid(e.target.value)}
                            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    )}
                    {paymentMethod === 'cash' && parseFloat(amountPaid || '0') > 0 && (
                        <div className="text-sm text-gray-600">
                            Change: <span className={`font-bold ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>${Math.abs(change).toFixed(2)}</span>
                        </div>
                    )}
                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || processing}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold text-sm"
                    >
                        {processing ? 'Processing...' : 'Checkout'}
                    </button>
                </div>
            </div>
        </div>
    );
}
