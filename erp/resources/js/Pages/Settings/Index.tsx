import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Settings {
    company_name: string;
    currency: string;
    timezone: string;
    fiscal_year_start: string;
}

interface Props extends PageProps {
    settings: Settings;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR', 'BRL'];

const TIMEZONES = [
    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'America/Toronto', 'America/Vancouver', 'America/Sao_Paulo',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Amsterdam',
    'Asia/Dubai', 'Asia/Kolkata', 'Asia/Singapore', 'Asia/Tokyo', 'Asia/Shanghai',
    'Australia/Sydney', 'Pacific/Auckland',
];

export default function SettingsIndex({ settings }: Props) {
    const [form, setForm] = useState<Settings>(settings);
    const [errors, setErrors] = useState<Partial<Record<keyof Settings, string>>>({});

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setErrors({});
        router.put('/settings', form as unknown as Record<string, string>, {
            onError: (errs) => setErrors(errs as typeof errors),
        });
    }

    return (
        <AppLayout>
            <Head title="Settings" />
            <div className="max-w-xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
                    <p className="text-sm text-slate-500 mt-1">Configure your organization's preferences.</p>
                </div>

                <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                            Company Name <span className="text-red-500">*</span>
                        </label>
                        <input value={form.company_name}
                            onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                        {errors.company_name && <p className="text-xs text-red-500 mt-1">{errors.company_name}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                            Currency <span className="text-red-500">*</span>
                        </label>
                        <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
                            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        {errors.currency && <p className="text-xs text-red-500 mt-1">{errors.currency}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                            Timezone <span className="text-red-500">*</span>
                        </label>
                        <select value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
                            {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                        </select>
                        {errors.timezone && <p className="text-xs text-red-500 mt-1">{errors.timezone}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                            Fiscal Year Start <span className="text-slate-400 font-normal">(MM-DD)</span>
                        </label>
                        <input value={form.fiscal_year_start}
                            onChange={(e) => setForm({ ...form, fiscal_year_start: e.target.value })}
                            placeholder="01-01"
                            maxLength={5}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                        {errors.fiscal_year_start && <p className="text-xs text-red-500 mt-1">{errors.fiscal_year_start}</p>}
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button type="submit">Save Settings</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
