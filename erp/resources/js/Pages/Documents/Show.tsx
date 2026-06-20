import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import { useState } from 'react';

interface DocumentFolder {
    id: number;
    name: string;
}

interface DocumentVersion {
    id: number;
    version: number;
    file_name: string;
    file_size: number | null;
    notes: string | null;
    created_at: string;
    uploader: { id: number; name: string } | null;
}

interface Document {
    id: number;
    title: string;
    description: string | null;
    file_name: string;
    file_path: string;
    file_size: number | null;
    mime_type: string | null;
    version: number;
    tags: string[] | null;
    created_at: string;
    folder: DocumentFolder | null;
    versions: DocumentVersion[];
    uploader: { id: number; name: string } | null;
}

interface Props extends PageProps {
    document: Document;
}

function formatFileSize(bytes: number | null): string {
    if (bytes === null) return '-';
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return bytes + ' B';
}

export default function DocumentShow({ document: doc }: Props) {
    const [showVersionForm, setShowVersionForm] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        file_path: '',
        file_name: '',
        notes:     '',
    });

    function handleAddVersion(e: React.FormEvent) {
        e.preventDefault();
        post(`/documents/${doc.id}/versions`, {
            onSuccess: () => {
                reset();
                setShowVersionForm(false);
            },
        });
    }

    return (
        <AppLayout>
            <Head title={doc.title} />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <Link href="/documents" className="text-sm text-slate-500 hover:text-slate-700">Documents</Link>
                            <span className="text-slate-400">/</span>
                            <h1 className="text-2xl font-semibold text-slate-900">{doc.title}</h1>
                        </div>
                        {doc.description && (
                            <p className="text-sm text-slate-500 mt-1">{doc.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                            {doc.folder && (
                                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                                    {doc.folder.name}
                                </span>
                            )}
                            <span className="text-xs text-slate-500">Version v{doc.version}</span>
                            <span className="text-xs text-slate-500">{formatFileSize(doc.file_size)}</span>
                            {doc.uploader && (
                                <span className="text-xs text-slate-500">Uploaded by {doc.uploader.name}</span>
                            )}
                        </div>
                        {doc.tags && doc.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {doc.tags.map(tag => (
                                    <span key={tag} className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => setShowVersionForm(!showVersionForm)}>Add Version</Button>
                    </div>
                </div>

                {/* Add Version Form */}
                {showVersionForm && (
                    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                        <h2 className="text-lg font-medium text-slate-800 mb-4">Add New Version</h2>
                        <form onSubmit={handleAddVersion} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">File Path *</label>
                                    <input
                                        type="text"
                                        value={data.file_path}
                                        onChange={e => setData('file_path', e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="/uploads/document-v2.pdf"
                                    />
                                    {errors.file_path && <p className="text-red-600 text-xs mt-1">{errors.file_path}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">File Name *</label>
                                    <input
                                        type="text"
                                        value={data.file_name}
                                        onChange={e => setData('file_name', e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="document-v2.pdf"
                                    />
                                    {errors.file_name && <p className="text-red-600 text-xs mt-1">{errors.file_name}</p>}
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                                    <textarea
                                        value={data.notes}
                                        onChange={e => setData('notes', e.target.value)}
                                        rows={2}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="What changed in this version?"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button type="submit" disabled={processing}>Add Version</Button>
                                <button type="button" onClick={() => setShowVersionForm(false)} className="text-sm text-slate-600 hover:text-slate-800">Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Version History */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200">
                        <h2 className="text-lg font-medium text-slate-800">Version History</h2>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Version</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">File Name</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Size</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Notes</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Uploaded By</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {doc.versions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center text-slate-400 py-8">No version history.</td>
                                </tr>
                            )}
                            {doc.versions.map(ver => (
                                <tr key={ver.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-800">v{ver.version}</td>
                                    <td className="px-4 py-3 text-slate-600">{ver.file_name}</td>
                                    <td className="px-4 py-3 text-slate-500">{formatFileSize(ver.file_size)}</td>
                                    <td className="px-4 py-3 text-slate-500">{ver.notes ?? '-'}</td>
                                    <td className="px-4 py-3 text-slate-500">{ver.uploader?.name ?? '-'}</td>
                                    <td className="px-4 py-3 text-slate-500">
                                        {new Date(ver.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
