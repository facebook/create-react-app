import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { Link } from '@inertiajs/react';
import type { PageProps } from '@/types';

export default function LoyaltyCreate(_props: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        points_per_currency_unit: '1',
        points_to_currency_rate: '0.01',
        minimum_redemption_points: '100',
        is_active: true as boolean,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/finance/loyalty-programs');
    }

    return (
        <AppLayout>
            <Head title="New Loyalty Program" />
            <div className="mx-auto max-w-2xl space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-800">New Loyalty Program</h1>
                    <Link href="/finance/loyalty-programs">
                        <Button variant="secondary">Cancel</Button>
                    </Link>
                </div>

                <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Name</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            Points per $ (e.g. 1 point per $1)
                        </label>
                        <input
                            type="number"
                            step="0.0001"
                            min="0.0001"
                            value={data.points_per_currency_unit}
                            onChange={(e) => setData('points_per_currency_unit', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.points_per_currency_unit && (
                            <p className="mt-1 text-xs text-red-600">{errors.points_per_currency_unit}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            Redemption rate (e.g. 0.01 = 1¢ per point)
                        </label>
                        <input
                            type="number"
                            step="0.000001"
                            min="0.000001"
                            value={data.points_to_currency_rate}
                            onChange={(e) => setData('points_to_currency_rate', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.points_to_currency_rate && (
                            <p className="mt-1 text-xs text-red-600">{errors.points_to_currency_rate}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            Minimum Redemption Points
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={data.minimum_redemption_points}
                            onChange={(e) => setData('minimum_redemption_points', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.minimum_redemption_points && (
                            <p className="mt-1 text-xs text-red-600">{errors.minimum_redemption_points}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Description</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={3}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600"
                        />
                        <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
                            Active
                        </label>
                    </div>

                    <div className="pt-2">
                        <Button type="submit" disabled={processing}>
                            Create Program
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
