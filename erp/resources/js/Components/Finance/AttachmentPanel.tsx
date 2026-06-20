import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/Common/Button';
import type { Attachment } from '@/types/finance';

interface Props {
    attachments: Attachment[];
    modelType: string;
    modelId: number;
    canDelete?: boolean;
}

export default function AttachmentPanel({ attachments, modelType, modelId, canDelete = true }: Props) {
    const { data, setData, post, processing, reset } = useForm<{ file: File | null }>({ file: null });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!data.file) return;
        post(`/finance/attachments/${modelType}/${modelId}`, {
            forceFormData: true,
            onSuccess: () => reset(),
        });
    }

    function formatSize(bytes: number | null): string {
        if (!bytes) return '';
        return bytes < 1024 ? `${bytes} B` : `${Math.round(bytes / 1024)} KB`;
    }

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">Attachments</h3>

            {attachments.length === 0 && (
                <p className="text-sm text-slate-400">No attachments yet.</p>
            )}

            <ul className="divide-y divide-slate-100">
                {attachments.map((a) => (
                    <li key={a.id} className="flex items-center justify-between py-2 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-slate-700 font-medium">{a.filename}</span>
                            {a.size && <span className="text-slate-400">{formatSize(a.size)}</span>}
                        </div>
                        <div className="flex items-center gap-3">
                            <a
                                href={`/finance/attachments/${a.id}/download`}
                                className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                            >
                                Download
                            </a>
                            {canDelete && (
                                <form method="POST" action={`/finance/attachments/${a.id}`} onSubmit={(e) => {
                                    e.preventDefault();
                                    if (confirm('Delete attachment?')) (e.target as HTMLFormElement).submit();
                                }}>
                                    <input type="hidden" name="_method" value="DELETE" />
                                    <button type="submit" className="text-red-500 hover:text-red-700 text-xs">Delete</button>
                                </form>
                            )}
                        </div>
                    </li>
                ))}
            </ul>

            <form onSubmit={handleSubmit} className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.csv,.xlsx,.docx,.doc"
                    onChange={(e) => setData('file', e.target.files?.[0] ?? null)}
                    className="text-sm text-slate-600 file:mr-3 file:rounded file:border-0 file:bg-indigo-50 file:px-3 file:py-1 file:text-xs file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <Button type="submit" disabled={processing || !data.file}>
                    {processing ? 'Uploading…' : 'Attach'}
                </Button>
            </form>
        </div>
    );
}
