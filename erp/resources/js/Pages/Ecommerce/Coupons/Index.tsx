import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';

interface Coupon {
    id: number;
    code: string;
    type: 'fixed' | 'percentage';
    value: number;
    min_order_amount: number;
    max_uses: number | null;
    uses_count: number;
    valid_from: string | null;
    valid_until: string | null;
    is_active: boolean;
    created_at: string;
}

interface Props {
    coupons: {
        data: Coupon[];
        links: { url: string | null; label: string; active: boolean }[];
    };
}

export default function CouponsIndex({ coupons }: Props) {
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        type: 'percentage' as 'fixed' | 'percentage',
        value: '',
        min_order_amount: '',
        max_uses: '',
        valid_from: '',
        valid_until: '',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/ecommerce/coupons', {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    const deleteCoupon = (id: number) => {
        if (confirm('Delete this coupon?')) {
            router.delete(`/ecommerce/coupons/${id}`);
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm"
                >
                    {showForm ? 'Cancel' : 'New Coupon'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">New Coupon</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                            <input
                                type="text"
                                value={data.code}
                                onChange={e => setData('code', e.target.value.toUpperCase())}
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm uppercase"
                                required
                            />
                            {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                            <select
                                value={data.type}
                                onChange={e => setData('type', e.target.value as 'fixed' | 'percentage')}
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Value *</label>
                            <input
                                type="number"
                                value={data.value}
                                onChange={e => setData('value', e.target.value)}
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Amount</label>
                            <input
                                type="number"
                                value={data.min_order_amount}
                                onChange={e => setData('min_order_amount', e.target.value)}
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label>
                            <input
                                type="number"
                                value={data.max_uses}
                                onChange={e => setData('max_uses', e.target.value)}
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                                min="1"
                                placeholder="Unlimited"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                            <input
                                type="date"
                                value={data.valid_from}
                                onChange={e => setData('valid_from', e.target.value)}
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                            <input
                                type="date"
                                value={data.valid_until}
                                onChange={e => setData('valid_until', e.target.value)}
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={e => setData('is_active', e.target.checked)}
                                className="rounded"
                            />
                            <label htmlFor="is_active" className="text-sm text-gray-700">Active</label>
                        </div>
                        <div className="md:col-span-3 flex gap-3">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 text-sm disabled:opacity-50"
                            >
                                {processing ? 'Creating...' : 'Create Coupon'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uses</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valid Until</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {coupons.data.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">No coupons yet.</td>
                            </tr>
                        )}
                        {coupons.data.map((coupon) => (
                            <tr key={coupon.id}>
                                <td className="px-4 py-3 font-mono font-semibold text-sm text-gray-900">{coupon.code}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 capitalize">{coupon.type}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                    {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                    {coupon.uses_count}{coupon.max_uses !== null ? ` / ${coupon.max_uses}` : ''}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">{coupon.valid_until ?? '—'}</td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${coupon.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {coupon.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        onClick={() => deleteCoupon(coupon.id)}
                                        className="text-red-500 hover:text-red-700 text-xs"
                                    >Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
