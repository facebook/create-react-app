import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import { useState } from 'react';

interface DocumentFolder {
    id: number;
    name: string;
    document_count: number;
    children: DocumentFolder[];
}

interface Document {
    id: number;
    title: string;
    description: string | null;
    file_name: string;
    file_size: number | null;
    mime_type: string | null;
    version: number;
    tags: string[] | null;
    created_at: string;
    folder: DocumentFolder | null;
}

interface Paginated {
    data: Document[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props extends PageProps {
    documents: Paginated;
    folders: DocumentFolder[];
    filters: { folder_id?: string; search?: string };
}

function formatFileSize(bytes: number | null): string {
    if (bytes === null) return '-';
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return bytes + ' B';
}

function FolderTree({
    folders,
    activeFolderId,
    onSelect,
}: {
    folders: DocumentFolder[];
    activeFolderId?: string;
    onSelect: (id: number | null) => void;
}) {
    return (
        <ul className="space-y-1">
            {folders.map(folder => (
                <li key={folder.id}>
                    <button
                        onClick={() => onSelect(folder.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between hover:bg-slate-100 ${String(folder.id) === activeFolderId ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-700'}`}
                    >
                        <span>{folder.name}</span>
                        <span className="text-xs text-slate-400">{folder.document_count}</span>
                    </button>
                    {folder.children && folder.children.length > 0 && (
                        <div className="ml-4 mt-1">
                            <FolderTree
                                folders={folder.children}
                                activeFolderId={activeFolderId}
                                onSelect={onSelect}
                            />
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );
}

export default function DocumentsIndex({ documents, folders, filters }: Props) {
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [showFolderForm, setShowFolderForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters.search ?? '');

    const uploadForm = useForm({
        title:       '',
        description: '',
        folder_id:   '' as string,
        file_path:   '',
        tags:        '',
    });

    const folderForm = useForm({
        name:      '',
        parent_id: '' as string,
    });

    function handleUpload(e: React.FormEvent) {
        e.preventDefault();
        const tagsArray = uploadForm.data.tags
            ? uploadForm.data.tags.split(',').map(t => t.trim()).filter(Boolean)
            : [];
        uploadForm.transform(data => ({
            ...data,
            folder_id: data.folder_id || null,
            tags:      tagsArray,
        }));
        uploadForm.post('/documents', {
            onSuccess: () => {
                uploadForm.reset();
                setShowUploadForm(false);
            },
        });
    }

    function handleCreateFolder(e: React.FormEvent) {
        e.preventDefault();
        folderForm.transform(data => ({
            ...data,
            parent_id: data.parent_id || null,
        }));
        folderForm.post('/documents/folders', {
            onSuccess: () => {
                folderForm.reset();
                setShowFolderForm(false);
            },
        });
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/documents', { ...filters, search: searchQuery || undefined }, { preserveState: true, replace: true });
    }

    function selectFolder(id: number | null) {
        router.get('/documents', { folder_id: id ?? undefined }, { preserveState: true, replace: true });
    }

    function deleteDocument(id: number) {
        if (confirm('Delete this document?')) {
            router.delete(`/documents/${id}`);
        }
    }

    return (
        <AppLayout>
            <Head title="Documents" />
            <div className="flex gap-6">
                {/* Sidebar */}
                <aside className="w-56 shrink-0">
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-semibold text-slate-700">Folders</h2>
                            <button
                                onClick={() => setShowFolderForm(!showFolderForm)}
                                className="text-xs text-indigo-600 hover:underline"
                            >
                                + New
                            </button>
                        </div>

                        {showFolderForm && (
                            <form onSubmit={handleCreateFolder} className="mb-3 space-y-2">
                                <input
                                    type="text"
                                    value={folderForm.data.name}
                                    onChange={e => folderForm.setData('name', e.target.value)}
                                    placeholder="Folder name"
                                    className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none"
                                />
                                <select
                                    value={folderForm.data.parent_id}
                                    onChange={e => folderForm.setData('parent_id', e.target.value)}
                                    className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none"
                                >
                                    <option value="">No parent</option>
                                    {folders.map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                                <div className="flex gap-1">
                                    <button type="submit" disabled={folderForm.processing} className="rounded bg-indigo-600 px-2 py-1 text-xs text-white hover:bg-indigo-700">
                                        Create
                                    </button>
                                    <button type="button" onClick={() => setShowFolderForm(false)} className="text-xs text-slate-500">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}

                        <button
                            onClick={() => selectFolder(null)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 ${!filters.folder_id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-700 hover:bg-slate-100'}`}
                        >
                            All Documents
                        </button>

                        <FolderTree
                            folders={folders}
                            activeFolderId={filters.folder_id}
                            onSelect={selectFolder}
                        />
                    </div>
                </aside>

                {/* Main content */}
                <div className="flex-1 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900">Documents</h1>
                            <p className="text-sm text-slate-500 mt-1">{documents.total} records</p>
                        </div>
                        <Button onClick={() => setShowUploadForm(!showUploadForm)}>Upload Document</Button>
                    </div>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search by title or tag..."
                            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <Button type="submit">Search</Button>
                    </form>

                    {/* Upload form */}
                    {showUploadForm && (
                        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                            <h2 className="text-lg font-medium text-slate-800 mb-4">Upload Document</h2>
                            <form onSubmit={handleUpload} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                                        <input
                                            type="text"
                                            value={uploadForm.data.title}
                                            onChange={e => uploadForm.setData('title', e.target.value)}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            placeholder="Document title"
                                        />
                                        {uploadForm.errors.title && <p className="text-red-600 text-xs mt-1">{uploadForm.errors.title}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Folder</label>
                                        <select
                                            value={uploadForm.data.folder_id}
                                            onChange={e => uploadForm.setData('folder_id', e.target.value)}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        >
                                            <option value="">No folder</option>
                                            {folders.map(f => (
                                                <option key={f.id} value={f.id}>{f.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                        <textarea
                                            value={uploadForm.data.description}
                                            onChange={e => uploadForm.setData('description', e.target.value)}
                                            rows={2}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">File Path *</label>
                                        <input
                                            type="text"
                                            value={uploadForm.data.file_path}
                                            onChange={e => uploadForm.setData('file_path', e.target.value)}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            placeholder="/uploads/document.pdf"
                                        />
                                        {uploadForm.errors.file_path && <p className="text-red-600 text-xs mt-1">{uploadForm.errors.file_path}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma-separated)</label>
                                        <input
                                            type="text"
                                            value={uploadForm.data.tags}
                                            onChange={e => uploadForm.setData('tags', e.target.value)}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            placeholder="invoice, finance, 2024"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button type="submit" disabled={uploadForm.processing}>Upload</Button>
                                    <button type="button" onClick={() => setShowUploadForm(false)} className="text-sm text-slate-600 hover:text-slate-800">Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Documents table */}
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">Title</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">Folder</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">Size</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">Version</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">Tags</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">Uploaded</th>
                                    <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {documents.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-center text-slate-400 py-8">No documents found.</td>
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
                                        <td className="px-4 py-3 text-slate-500">v{doc.version}</td>
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
                                        <td className="px-4 py-3 text-right space-x-2">
                                            <Link href={`/documents/${doc.id}`} className="text-xs text-indigo-600 hover:underline">View</Link>
                                            <button
                                                onClick={() => deleteDocument(doc.id)}
                                                className="text-xs text-red-600 hover:text-red-800"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {documents.last_page > 1 && (
                        <div className="flex gap-2 justify-end">
                            {Array.from({ length: documents.last_page }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => router.get('/documents', { ...filters, page }, { preserveState: true })}
                                    className={`px-3 py-1 rounded text-sm border ${page === documents.current_page ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
