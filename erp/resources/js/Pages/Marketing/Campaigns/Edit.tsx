import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface MailingList {
    id: number;
    name: string;
}

interface Campaign {
    id: number;
    name: string;
    subject: string;
    preview_text: string | null;
    from_name: string | null;
    from_email: string | null;
    mailing_list_id: number | null;
    body_html: string;
    body_text: string | null;
}

interface Props extends PageProps {
    campaign: Campaign;
    mailingLists: MailingList[];
}

interface FormData {
    name: string;
    subject: string;
    preview_text: string;
    from_name: string;
    from_email: string;
    mailing_list_id: string;
    body_html: string;
    body_text: string;
    [key: string]: string;
}

export default function CampaignEdit({ campaign, mailingLists }: Props) {
    const { data, setData, put, processing, errors } = useForm<FormData>({
        name:            campaign.name,
        subject:         campaign.subject,
        preview_text:    campaign.preview_text ?? '',
        from_name:       campaign.from_name ?? '',
        from_email:      campaign.from_email ?? '',
        mailing_list_id: campaign.mailing_list_id?.toString() ?? '',
        body_html:       campaign.body_html,
        body_text:       campaign.body_text ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(`/marketing/campaigns/${campaign.id}`);
    }

    return (
        <AppLayout>
            <Head title="Edit Campaign" />
            <div className="space-y-6 max-w-4xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Edit Campaign</h1>
                    <Link href={`/marketing/campaigns/${campaign.id}`} className="text-sm text-slate-500 hover:text-slate-700">Back</Link>
                </div>

                <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Campaign Name</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Subject</label>
                            <input
                                type="text"
                                value={data.subject}
                                onChange={e => setData('subject', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            />
                            {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Preview Text</label>
                            <input
                                type="text"
                                value={data.preview_text}
                                onChange={e => setData('preview_text', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">From Name</label>
                            <input
                                type="text"
                                value={data.from_name}
                                onChange={e => setData('from_name', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">From Email</label>
                            <input
                                type="email"
                                value={data.from_email}
                                onChange={e => setData('from_email', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Mailing List</label>
                            <select
                                value={data.mailing_list_id}
                                onChange={e => setData('mailing_list_id', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            >
                                <option value="">— None —</option>
                                {mailingLists.map((l) => (
                                    <option key={l.id} value={l.id}>{l.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">HTML Body</label>
                        <textarea
                            value={data.body_html}
                            onChange={e => setData('body_html', e.target.value)}
                            rows={12}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono focus:border-indigo-500 focus:outline-none"
                        />
                        {errors.body_html && <p className="mt-1 text-xs text-red-600">{errors.body_html}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Plain Text Body</label>
                        <textarea
                            value={data.body_text}
                            onChange={e => setData('body_text', e.target.value)}
                            rows={5}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Link href={`/marketing/campaigns/${campaign.id}`}>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={processing}>Save Changes</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
