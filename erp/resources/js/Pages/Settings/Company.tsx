import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Tenant {
    id: number;
    name: string;
    slug: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    currency_code: string;
    timezone: string;
    date_format: string;
    logo_path: string | null;
}

interface Props extends PageProps {
    tenant: Tenant;
    timezones: string[];
    currencies: string[];
    dateFormats: Record<string, string>;
}

export default function CompanySettings({ tenant, timezones, currencies, dateFormats }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        name:          tenant.name,
        email:         tenant.email ?? '',
        phone:         tenant.phone ?? '',
        address:       tenant.address ?? '',
        city:          tenant.city ?? '',
        country:       tenant.country ?? '',
        currency_code: tenant.currency_code,
        timezone:      tenant.timezone,
        date_format:   tenant.date_format,
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);

    function submitSettings(e: React.FormEvent) {
        e.preventDefault();
        patch('/settings/company');
    }

    function submitLogo(e: React.FormEvent) {
        e.preventDefault();
        if (!logoFile) return;
        const form = new FormData();
        form.append('logo', logoFile);
        router.post('/settings/company/logo', form);
    }

    return (
        <AppLayout>
            <Head title="Company Settings" />
            <div className="max-w-2xl space-y-8">
                <h1 className="text-2xl font-semibold text-slate-900">Company Settings</h1>

                <form onSubmit={submitSettings} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                    <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">Company Profile</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Company Name *</label>
                            <input type="text" required value={data.name} onChange={(e) => setData('name', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" />
                            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                            <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
                            <input type="text" value={data.phone} onChange={(e) => setData('phone', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">City</label>
                            <input type="text" value={data.city} onChange={(e) => setData('city', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Country</label>
                            <input type="text" value={data.country} onChange={(e) => setData('country', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Address</label>
                        <textarea rows={3} value={data.address} onChange={(e) => setData('address', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" />
                    </div>

                    <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2 pt-2">Localisation</h2>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Base Currency *</label>
                            <select value={data.currency_code} onChange={(e) => setData('currency_code', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none">
                                {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Timezone *</label>
                            <select value={data.timezone} onChange={(e) => setData('timezone', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none">
                                {timezones.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Date Format *</label>
                            <select value={data.date_format} onChange={(e) => setData('date_format', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none">
                                {Object.entries(dateFormats).map(([fmt, label]) => (
                                    <option key={fmt} value={fmt}>{label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={processing}>{processing ? 'Saving…' : 'Save Settings'}</Button>
                    </div>
                </form>

                {/* Logo upload */}
                <form onSubmit={submitLogo} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">Company Logo</h2>
                    {tenant.logo_path && (
                        <img src={`/storage/${tenant.logo_path}`} alt="Company logo" className="h-16 object-contain rounded" />
                    )}
                    <div>
                        <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                            className="text-sm text-slate-600" />
                        <p className="mt-1 text-xs text-slate-400">PNG, JPG, GIF or SVG · max 1 MB</p>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" variant="secondary" disabled={!logoFile}>Upload Logo</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
