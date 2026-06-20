import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { HrAnnouncement } from '@/types/hr';

interface Props extends PageProps {
    announcement: HrAnnouncement & {
        created_by_user?: { id: number; name: string } | null;
        department?: { id: number; name: string } | null;
    };
}

const PRIORITY_COLORS: Record<string, string> = {
    low:    'bg-slate-100 text-slate-700',
    normal: 'bg-blue-100 text-blue-700',
    high:   'bg-yellow-100 text-yellow-700',
    urgent: 'bg-red-100 text-red-700',
};

export default function AnnouncementShow({ announcement }: Props) {
    const { can } = usePermission();

    function handlePublish() {
        router.post(`/hr/announcements/${announcement.id}/publish`);
    }

    function handleArchive() {
        router.post(`/hr/announcements/${announcement.id}/archive`);
    }

    function handleDelete() {
        if (confirm('Delete this announcement?')) {
            router.delete(`/hr/announcements/${announcement.id}`);
        }
    }

    return (
        <AppLayout>
            <Head title={announcement.title} />
            <div className="space-y-6 max-w-3xl">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">{announcement.title}</h1>
                        <div className="flex gap-2 mt-2">
                            <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium capitalize ${PRIORITY_COLORS[announcement.priority] ?? 'bg-slate-100 text-slate-700'}`}>
                                {announcement.priority}
                            </span>
                            <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${announcement.is_published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                                {announcement.is_published ? 'Published' : 'Draft'}
                            </span>
                        </div>
                    </div>
                    {can('hr.create') && (
                        <div className="flex gap-2">
                            {!announcement.is_published && (
                                <Button onClick={handlePublish}>Publish</Button>
                            )}
                            {announcement.is_published && (
                                <Button onClick={handleArchive}>Archive</Button>
                            )}
                            {can('hr.delete') && (
                                <Button onClick={handleDelete}>Delete</Button>
                            )}
                        </div>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-medium text-slate-700">Target Audience:</span>{' '}
                            <span className="capitalize text-slate-600">{announcement.target_audience}</span>
                        </div>
                        {announcement.publish_at && (
                            <div>
                                <span className="font-medium text-slate-700">Publish At:</span>{' '}
                                <span className="text-slate-600">{announcement.publish_at}</span>
                            </div>
                        )}
                        {announcement.expire_at && (
                            <div>
                                <span className="font-medium text-slate-700">Expires At:</span>{' '}
                                <span className="text-slate-600">{announcement.expire_at}</span>
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 className="font-medium text-slate-700 mb-2">Content</h2>
                        <p className="text-slate-600 whitespace-pre-wrap">{announcement.body}</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
