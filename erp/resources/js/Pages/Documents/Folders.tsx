import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface DocumentFolder {
    id: number;
    name: string;
    document_count: number;
    children: DocumentFolder[];
}

interface Props extends PageProps {
    folders: DocumentFolder[];
}

export default function DocumentFolders({ folders }: Props) {
    return (
        <AppLayout>
            <Head title="Document Folders" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Document Folders</h1>
                    </div>
                    <Link href="/documents" className="text-sm text-indigo-600 hover:underline">
                        Back to Documents
                    </Link>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Documents</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Sub-folders</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {folders.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="text-center text-slate-400 py-8">No folders found.</td>
                                </tr>
                            )}
                            {folders.map(folder => (
                                <tr key={folder.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-800">{folder.name}</td>
                                    <td className="px-4 py-3 text-slate-500">{folder.document_count}</td>
                                    <td className="px-4 py-3 text-slate-500">{folder.children.length}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
