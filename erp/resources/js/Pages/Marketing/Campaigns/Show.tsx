import { Head, Link, useForm } from '@inertiajs/react';
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
    sent_count: number;
    open_count: number;
    click_count: number;
    bounce_count: number;
    open_rate: number;
    click_rate: number;
    sent_at: string | null;
}

interface CampaignSend {
    id: number;
    status: string;
    sent_at: string | null;
    opened_at: string | null;
    subscriber: {
        id: number;
        email: string;
    } | null;
}

interface Props extends PageProps {
    campaign: Campaign;
    sends: CampaignSend[];
}

const statusColors: Record<string, string> = {
    draft:     'bg-slate-100 text-slate-700',
    scheduled: 'bg-blue-100 text-blue-700',
    sending:   'bg-yellow-100 text-yellow-700',
    sent:      'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

const sendStatusColors: Record<string, string> = {
    pending:      'bg-slate-100 text-slate-600',
    sent:         'bg-blue-100 text-blue-700',
    delivered:    'bg-green-100 text-green-700',
    opened:       'bg-indigo-100 text-indigo-700',
    clicked:      'bg-purple-100 text-purple-700',
    bounced:      'bg-red-100 text-red-700',
    unsubscribed: 'bg-orange-100 text-orange-700',
};

export default function CampaignShow({ campaign, sends }: Props) {
    const { post: sendPost, processing: sending } = useForm();
    const { post: cancelPost, processing: cancelling } = useForm();

    function handleSend() {
        if (!confirm('Send this campaign now?')) return;
        sendPost(`/marketing/campaigns/${campaign.id}/send`);
    }

    function handleCancel() {
        if (!confirm('Cancel this campaign?')) return;
        cancelPost(`/marketing/campaigns/${campaign.id}/cancel`);
    }

    return (
        <AppLayout>
            <Head title={campaign.name} />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">{campaign.name}</h1>
                        <p className="mt-1 text-sm text-slate-500">{campaign.subject}</p>
                        <span className={`mt-2 inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${statusColors[campaign.status] ?? statusColors.draft}`}>
                            {campaign.status}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {campaign.status === 'draft' && (
                            <>
                                <Link href={`/marketing/campaigns/${campaign.id}/edit`}>
                                    <Button variant="secondary">Edit</Button>
                                </Link>
                                <Button onClick={handleSend} disabled={sending}>Send Now</Button>
                            </>
                        )}
                        {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
                            <Button variant="secondary" onClick={handleCancel} disabled={cancelling}>Cancel</Button>
                        )}
                        <Link href="/marketing/campaigns" className="text-sm text-slate-500 hover:text-slate-700">Back</Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                    {[
                        { label: 'Recipients', value: campaign.total_recipients },
                        { label: 'Sent',       value: campaign.sent_count },
                        { label: 'Opens',      value: `${campaign.open_count} (${campaign.open_rate}%)` },
                        { label: 'Clicks',     value: `${campaign.click_count} (${campaign.click_rate}%)` },
                        { label: 'Bounces',    value: campaign.bounce_count },
                    ].map((stat) => (
                        <div key={stat.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs font-medium uppercase text-slate-500">{stat.label}</p>
                            <p className="mt-2 text-xl font-bold text-slate-800">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Sends table */}
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-4">
                        <h2 className="text-base font-semibold text-slate-800">Recent Sends</h2>
                    </div>
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Subscriber</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Sent At</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Opened At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {sends.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-400">No sends yet.</td>
                                </tr>
                            )}
                            {sends.map((send) => (
                                <tr key={send.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                        {send.subscriber?.email ?? '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${sendStatusColors[send.status] ?? sendStatusColors.pending}`}>
                                            {send.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{send.sent_at ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{send.opened_at ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
