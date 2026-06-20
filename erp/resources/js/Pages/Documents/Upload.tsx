import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import axios from 'axios';
import FileDropzone from '@/Components/FileDropzone';

interface Folder { id: number; name: string; }
interface UploadedDoc { id: number; title: string; file_name: string; file_size: number; url: string; }

export default function DocumentsUpload({ folders }: { folders: Folder[] }) {
    const [folderId, setFolderId] = useState('');
    const [uploaded, setUploaded] = useState<UploadedDoc[]>([]);

    const handleUpload = async (files: File[]) => {
        for (const file of files) {
            const form = new FormData();
            form.append('file', file);
            if (folderId) form.append('folder_id', folderId);

            const response = await axios.post('/documents/upload', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setUploaded((prev) => [...prev, response.data]);
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/documents" className="text-blue-600 hover:underline text-sm">← Documents</Link>
                <h1 className="text-2xl font-bold text-gray-800">Upload Documents</h1>
            </div>

            <div className="bg-white rounded-xl shadow p-6 mb-6">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload to Folder (optional)</label>
                    <select
                        value={folderId}
                        onChange={(e) => setFolderId(e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        <option value="">No folder (root)</option>
                        {folders.map((f) => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                    </select>
                </div>

                <FileDropzone
                    onUpload={handleUpload}
                    maxSizeMb={50}
                    multiple
                    label="Drop files here or click to browse"
                    hint="Supports all file types — PDF, Word, Excel, images, and more"
                />
            </div>

            {uploaded.length > 0 && (
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Uploaded Files</h2>
                    <ul className="space-y-2">
                        {uploaded.map((doc) => (
                            <li key={doc.id} className="flex items-center gap-3 text-sm">
                                <span className="text-green-500 text-lg">✓</span>
                                <div className="flex-1">
                                    <div className="font-medium text-gray-800">{doc.file_name}</div>
                                    <div className="text-xs text-gray-400">{(doc.file_size / 1024).toFixed(1)} KB</div>
                                </div>
                                <Link href={doc.url} className="text-blue-600 hover:underline text-xs">View</Link>
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={() => router.visit('/documents')}
                        className="mt-4 text-sm text-blue-600 hover:underline"
                    >
                        Go to Documents →
                    </button>
                </div>
            )}
        </div>
    );
}
