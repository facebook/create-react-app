import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { useForm } from '@inertiajs/react';

interface StoreSettings {
    id: number;
    store_name: string;
    store_slug: string;
    description: string | null;
    currency_code: string;
    is_active: boolean;
    logo_path: string | null;
    primary_color: string;
    allow_guest_checkout: boolean;
}

interface Props {
    settings: StoreSettings;
}

export default function EcommerceSettings({ settings }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        store_name:           settings.store_name,
        store_slug:           settings.store_slug,
        description:          settings.description ?? '',
        currency_code:        settings.currency_code,
        is_active:            settings.is_active,
        logo_path:            settings.logo_path ?? '',
        primary_color:        settings.primary_color,
        allow_guest_checkout: settings.allow_guest_checkout,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/ecommerce/settings');
    };

    return (
        <AppLayout title="Store Settings">
            <div className="p-6 max-w-2xl">
                <h1 className="text-2xl font-semibold text-slate-900 mb-6">Store Settings</h1>

                <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Store Name</label>
                        <input
                            type="text"
                            value={data.store_name}
                            onChange={e => setData('store_name', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {errors.store_name && <p className="mt-1 text-sm text-red-600">{errors.store_name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Store Slug</label>
                        <input
                            type="text"
                            value={data.store_slug}
                            onChange={e => setData('store_slug', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {errors.store_slug && <p className="mt-1 text-sm text-red-600">{errors.store_slug}</p>}
                        <p className="mt-1 text-xs text-slate-500">
                            Store URL: <span className="font-mono text-indigo-600">/store/{data.store_slug}</span>
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            rows={3}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Currency Code</label>
                            <input
                                type="text"
                                maxLength={3}
                                value={data.currency_code}
                                onChange={e => setData('currency_code', e.target.value.toUpperCase())}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            {errors.currency_code && <p className="mt-1 text-sm text-red-600">{errors.currency_code}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Primary Color</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={data.primary_color}
                                    onChange={e => setData('primary_color', e.target.value)}
                                    className="h-9 w-16 rounded border border-slate-300 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={data.primary_color}
                                    onChange={e => setData('primary_color', e.target.value)}
                                    className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={e => setData('is_active', e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                            />
                            <span className="text-sm font-medium text-slate-700">Store is Active</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.allow_guest_checkout}
                                onChange={e => setData('allow_guest_checkout', e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                            />
                            <span className="text-sm font-medium text-slate-700">Allow Guest Checkout</span>
                        </label>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
