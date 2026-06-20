import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';
import { useState } from 'react';

interface Document {
    id: number;
    title: string;
    file_name: string;
    file_size: number | null;
    version: number;
    tags: string[] | null;
    created_at: string;
    folder: { id: number; name: string } | null;
}

interface Paginated {
    data: Document[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props extends PageProps {
    documents: Paginated;
    query: string;
}

function formatFileSize(bytes: number | null): string {
    if (bytes === null) return '-';
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return bytes + ' B';
}

export default function DocumentSearch({ documents, query }: Props) {
    const [searchQuery, setSearchQuery] = useState(query);

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/documents/search', { q: searchQuery || undefined }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Search Documents" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Search Documents</h1>
                    {query && <p className="text-sm text-slate-500 mt-1">{documents.total} results for "{query}"</p>}
                </div>

                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search by title or tag..."
                        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        autoFocus
                    />
                    <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                        Search
                    </button>
                </form>

                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Title</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Folder</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Size</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Tags</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {documents.data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center text-slate-400 py-8">
                                        {query ? 'No documents matched your search.' : 'Enter a query to search.'}
                                    </td>
                                </tr>
                            )}
                            {documents.data.map(doc => (
                                <tr key={doc.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <Link href={`/documents/${doc.id}`} className="font-medium text-indigo-600 hover:underline">
                                            {doc.title}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">{doc.folder?.name ?? '-'}</td>
                                    <td className="px-4 py-3 text-slate-500">{formatFileSize(doc.file_size)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {(doc.tags ?? []).map(tag => (
                                                <span key={tag} className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">
                                        {new Date(doc.created_at).toLocaleDateString()}
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
