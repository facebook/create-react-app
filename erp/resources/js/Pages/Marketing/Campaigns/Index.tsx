import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Campaign {
    id: number;
    name: string;
    subject: string;
    status: string;
    list_name: string | null;
    total_recipients: number;
    open_rate: number;
    click_rate: number;
    sent_at: string | null;
}

interface Props extends PageProps {
    campaigns: Campaign[];
}

const statusColors: Record<string, string> = {
    draft:     'bg-slate-100 text-slate-700',
    scheduled: 'bg-blue-100 text-blue-700',
    sending:   'bg-yellow-100 text-yellow-700',
    sent:      'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

export default function CampaignsIndex({ campaigns }: Props) {
    return (
        <AppLayout>
            <Head title="Campaigns" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Campaigns</h1>
                        <p className="mt-1 text-sm text-slate-500">{campaigns.length} campaigns</p>
                    </div>
                    <Link href="/marketing/campaigns/create"><Button>New Campaign</Button></Link>
                </div>

                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Subject</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">List</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Recipients</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Open Rate</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Click Rate</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Sent At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {campaigns.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-400">No campaigns yet.</td>
                                </tr>
                            )}
                            {campaigns.map((c) => (
                                <tr key={c.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <Link href={`/marketing/campaigns/${c.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                            {c.name}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">{c.subject}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${statusColors[c.status] ?? statusColors.draft}`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{c.list_name ?? '—'}</td>
                                    <td className="px-4 py-3 text-right text-sm text-slate-700">{c.total_recipients}</td>
                                    <td className="px-4 py-3 text-right text-sm text-slate-700">{c.open_rate}%</td>
                                    <td className="px-4 py-3 text-right text-sm text-slate-700">{c.click_rate}%</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{c.sent_at ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
