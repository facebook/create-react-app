import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Supplier {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    supplier: Supplier;
}

interface Order {
    id: number;
    quantity: number;
    order_date: string;
    status: string;
    total_price: number;
    notes: string | null;
    product: Product;
}

interface PaginatedOrders {
    data: Order[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props extends PageProps {
    orders: PaginatedOrders;
    date: string;
}

const statusColors: Record<string, string> = {
    pending:   'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-500',
};

export default function OrdersIndex({ orders, date }: Props) {
    const placeForm = useForm({
        lunch_product_id: '',
        quantity: '1',
        order_date: date,
        notes: '',
    });

    const submitOrder = (e: React.FormEvent) => {
        e.preventDefault();
        placeForm.post('/lunch/orders', {
            onSuccess: () => placeForm.reset(),
        });
    };

    const updateStatus = (orderId: number, status: string) => {
        router.patch(`/lunch/orders/${orderId}/status`, { status });
    };

    const filterByDate = (e: React.ChangeEvent<HTMLInputElement>) => {
        router.get('/lunch/orders', { date: e.target.value }, { preserveState: true });
    };

    return (
        <AppLayout>
            <Head title="Lunch Orders" />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Lunch Orders</h1>
                        <p className="mt-1 text-sm text-gray-500">View and manage lunch orders.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Date</label>
                        <input
                            type="date"
                            defaultValue={date}
                            onChange={filterByDate}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Place Order Form */}
                <div className="bg-white rounded-xl shadow p-6 mb-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Place an Order</h2>
                    <form onSubmit={submitOrder} className="flex flex-wrap gap-3 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product ID *</label>
                            <input
                                type="number"
                                value={placeForm.data.lunch_product_id}
                                onChange={(e) => placeForm.setData('lunch_product_id', e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="ID"
                            />
                            {placeForm.errors.lunch_product_id && (
                                <p className="text-red-500 text-xs mt-1">{placeForm.errors.lunch_product_id}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={placeForm.data.quantity}
                                onChange={(e) => placeForm.setData('quantity', e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {placeForm.errors.quantity && (
                                <p className="text-red-500 text-xs mt-1">{placeForm.errors.quantity}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Order Date *</label>
                            <input
                                type="date"
                                value={placeForm.data.order_date}
                                onChange={(e) => placeForm.setData('order_date', e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {placeForm.errors.order_date && (
                                <p className="text-red-500 text-xs mt-1">{placeForm.errors.order_date}</p>
                            )}
                        </div>
                        <div>
                            <button
                                type="submit"
                                disabled={placeForm.processing}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition"
                            >
                                {placeForm.processing ? 'Placing...' : 'Place Order'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                        No orders for this date.
                                    </td>
                                </tr>
                            ) : (
                                orders.data.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{order.product.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{order.product.supplier.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{order.quantity}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">${Number(order.total_price).toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {order.status === 'pending' && (
                                                    <button
                                                        onClick={() => updateStatus(order.id, 'confirmed')}
                                                        className="text-xs text-indigo-600 hover:underline"
                                                    >
                                                        Confirm
                                                    </button>
                                                )}
                                                {order.status === 'confirmed' && (
                                                    <button
                                                        onClick={() => updateStatus(order.id, 'delivered')}
                                                        className="text-xs text-green-600 hover:underline"
                                                    >
                                                        Deliver
                                                    </button>
                                                )}
                                                {(order.status === 'pending' || order.status === 'confirmed') && (
                                                    <button
                                                        onClick={() => updateStatus(order.id, 'cancelled')}
                                                        className="text-xs text-red-500 hover:underline"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
