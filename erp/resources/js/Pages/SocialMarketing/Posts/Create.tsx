import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';
import { FormEvent } from 'react';

interface SocialAccount {
    id: number;
    platform: string;
    account_name: string;
    account_handle: string | null;
}

interface Props extends PageProps {
    accounts: SocialAccount[];
}

const platforms = ['facebook', 'twitter', 'linkedin', 'instagram', 'youtube', 'tiktok'];

const platformEmoji: Record<string, string> = {
    facebook:  '📘',
    twitter:   '🐦',
    linkedin:  '💼',
    instagram: '📸',
    youtube:   '▶️',
    tiktok:    '🎵',
};

export default function CreatePost({ accounts }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        content:            '',
        platforms:          [] as string[],
        social_account_ids: [] as number[],
        scheduled_at:       '',
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post('/social-marketing/posts');
    }

    function togglePlatform(platform: string) {
        setData(
            'platforms',
            data.platforms.includes(platform)
                ? data.platforms.filter((p) => p !== platform)
                : [...data.platforms, platform],
        );
    }

    function toggleAccount(accountId: number) {
        setData(
            'social_account_ids',
            data.social_account_ids.includes(accountId)
                ? data.social_account_ids.filter((id) => id !== accountId)
                : [...data.social_account_ids, accountId],
        );
    }

    const charCount = data.content.length;
    const charLimit = 2000;

    return (
        <AppLayout>
            <Head title="Create Social Post" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Create Social Post</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        {/* Content */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    Post Content
                                </label>
                                <div className="relative mt-1">
                                    <textarea
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                        rows={6}
                                        maxLength={charLimit}
                                        placeholder="What would you like to share?"
                                        className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none resize-none"
                                    />
                                    <span className={`absolute bottom-2 right-2 text-xs ${charCount > charLimit * 0.9 ? 'text-red-500' : 'text-slate-400'}`}>
                                        {charCount}/{charLimit}
                                    </span>
                                </div>
                                {errors.content && <p className="mt-1 text-xs text-red-600">{errors.content}</p>}
                            </div>

                            {/* Platforms */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Platforms</label>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {platforms.map((platform) => (
                                        <label
                                            key={platform}
                                            className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                                                data.platforms.includes(platform)
                                                    ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={data.platforms.includes(platform)}
                                                onChange={() => togglePlatform(platform)}
                                            />
                                            <span>{platformEmoji[platform]}</span>
                                            <span className="capitalize">{platform}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.platforms && <p className="mt-1 text-xs text-red-600">{errors.platforms}</p>}
                            </div>

                            {/* Accounts */}
                            {accounts.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Post to Accounts</label>
                                    <div className="mt-2 space-y-2">
                                        {accounts.map((account) => (
                                            <label key={account.id} className="flex cursor-pointer items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={data.social_account_ids.includes(account.id)}
                                                    onChange={() => toggleAccount(account.id)}
                                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="text-lg">{platformEmoji[account.platform] ?? '🌐'}</span>
                                                <span className="text-sm text-slate-700">
                                                    {account.account_name}
                                                    {account.account_handle && (
                                                        <span className="ml-1 text-slate-500">@{account.account_handle}</span>
                                                    )}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Schedule */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    Schedule At (optional)
                                </label>
                                <input
                                    type="datetime-local"
                                    value={data.scheduled_at}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        // Convert to Y-m-d H:i:s format
                                        setData('scheduled_at', val ? val.replace('T', ' ') + ':00' : '');
                                    }}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none sm:max-w-xs"
                                />
                                {errors.scheduled_at && <p className="mt-1 text-xs text-red-600">{errors.scheduled_at}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <a
                            href="/social-marketing/posts"
                            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </a>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {processing
                                ? 'Saving...'
                                : data.scheduled_at
                                    ? 'Schedule Post'
                                    : 'Save as Draft'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
