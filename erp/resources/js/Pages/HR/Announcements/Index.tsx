import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Paginator } from '@/types/inventory';
import type { HrAnnouncement } from '@/types/hr';

interface Props extends PageProps {
    announcements: Paginator<HrAnnouncement>;
    filters: { target_audience?: string };
}

const PRIORITY_COLORS: Record<string, string> = {
    low:    'bg-slate-100 text-slate-700',
    normal: 'bg-blue-100 text-blue-700',
    high:   'bg-yellow-100 text-yellow-700',
    urgent: 'bg-red-100 text-red-700',
};

export default function AnnouncementsIndex({ announcements, filters }: Props) {
    const { can } = usePermission();

    function setAudience(audience: string) {
        router.get('/hr/announcements', { ...filters, target_audience: audience || undefined }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Announcements" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">HR Announcements</h1>
                        <p className="text-sm text-slate-500 mt-1">{announcements.total} announcements</p>
                    </div>
                    {can('hr.create') && (
                        <Button onClick={() => router.visit('/hr/announcements/create')}>
                            New Announcement
                        </Button>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table
                        columns={[
                            {
                                key: 'title',
                                header: 'Title',
                                render: (r) => (
                                    <Link href={`/hr/announcements/${r.id}`} className="text-indigo-600 hover:underline font-medium">
                                        {r.title}
                                    </Link>
                                ),
                            },
                            {
                                key: 'target_audience',
                                header: 'Audience',
                                render: (r) => (
                                    <span className="capitalize text-slate-700">{r.target_audience}</span>
                                ),
                            },
                            {
                                key: 'priority',
                                header: 'Priority',
                                render: (r) => (
                                    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium capitalize ${PRIORITY_COLORS[r.priority] ?? 'bg-slate-100 text-slate-700'}`}>
                                        {r.priority}
                                    </span>
                                ),
                            },
                            {
                                key: 'is_published',
                                header: 'Status',
                                render: (r) => (
                                    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${r.is_published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                                        {r.is_published ? 'Published' : 'Draft'}
                                    </span>
                                ),
                            },
                            {
                                key: 'publish_at',
                                header: 'Publish At',
                                render: (r) => <span className="text-slate-600">{r.publish_at ?? '—'}</span>,
                            },
                        ]}
                        rows={announcements.data}
                    />
                </div>

                <Pagination paginator={announcements} />
            </div>
        </AppLayout>
    );
}
