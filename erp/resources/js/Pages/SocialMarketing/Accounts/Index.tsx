import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';
import { router } from '@inertiajs/react';
import { FormEvent } from 'react';

interface SocialAccount {
    id: number;
    platform: string;
    account_name: string;
    account_handle: string | null;
    avatar_url: string | null;
    is_connected: boolean;
    is_active: boolean;
    followers_count: number;
    following_count: number;
    last_synced_at: string | null;
}

interface Props extends PageProps {
    accounts: SocialAccount[];
}

const platformEmoji: Record<string, string> = {
    facebook:  '📘',
    twitter:   '🐦',
    linkedin:  '💼',
    instagram: '📸',
    youtube:   '▶️',
    tiktok:    '🎵',
};

const platforms = ['facebook', 'twitter', 'linkedin', 'instagram', 'youtube', 'tiktok'];

export default function AccountsIndex({ accounts }: Props) {
    const { data, setData, post, processing, reset, errors } = useForm({
        platform:        'facebook',
        account_name:    '',
        account_handle:  '',
        followers_count: '',
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post('/social-marketing/accounts', {
            onSuccess: () => reset(),
        });
    }

    function handleToggle(account: SocialAccount) {
        router.post(`/social-marketing/accounts/${account.id}/toggle`);
    }

    return (
        <AppLayout>
            <Head title="Social Accounts" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Social Accounts</h1>
                </div>

                {/* Account Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {accounts.map((account) => (
                        <div key={account.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{platformEmoji[account.platform] ?? '🌐'}</span>
                                    <div>
                                        <p className="font-semibold text-slate-800">{account.account_name}</p>
                                        {account.account_handle && (
                                            <p className="text-sm text-slate-500">@{account.account_handle}</p>
                                        )}
                                    </div>
                                </div>
                                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                                    account.is_connected
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                }`}>
                                    {account.is_connected ? 'Connected' : 'Disconnected'}
                                </span>
                            </div>
                            <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                                <span>{account.followers_count.toLocaleString()} followers</span>
                            </div>
                            <div className="mt-3">
                                <button
                                    onClick={() => handleToggle(account)}
                                    className={`w-full rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                                        account.is_connected
                                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                                            : 'border-green-200 text-green-600 hover:bg-green-50'
                                    }`}
                                >
                                    {account.is_connected ? 'Disconnect' : 'Reconnect'}
                                </button>
                            </div>
                        </div>
                    ))}

                    {accounts.length === 0 && (
                        <div className="col-span-3 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
                            <p className="text-sm text-slate-400">No accounts connected yet.</p>
                        </div>
                    )}
                </div>

                {/* Add Account Form */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-base font-semibold text-slate-800">Add Account</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Platform</label>
                            <select
                                value={data.platform}
                                onChange={(e) => setData('platform', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            >
                                {platforms.map((p) => (
                                    <option key={p} value={p}>
                                        {platformEmoji[p]} {p.charAt(0).toUpperCase() + p.slice(1)}
                                    </option>
                                ))}
                            </select>
                            {errors.platform && <p className="mt-1 text-xs text-red-600">{errors.platform}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Account Name</label>
                            <input
                                type="text"
                                value={data.account_name}
                                onChange={(e) => setData('account_name', e.target.value)}
                                placeholder="My Business Page"
                                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            />
                            {errors.account_name && <p className="mt-1 text-xs text-red-600">{errors.account_name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Handle (optional)</label>
                            <input
                                type="text"
                                value={data.account_handle}
                                onChange={(e) => setData('account_handle', e.target.value)}
                                placeholder="@mybusiness"
                                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {processing ? 'Adding...' : 'Add Account'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
