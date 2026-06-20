import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import { useState } from 'react';

interface SignRequestSigner {
    id: number;
    signer_name: string;
    signer_email: string;
    status: 'pending' | 'signed' | 'declined';
}

interface SignRequest {
    id: number;
    title: string;
    document_path: string;
    document_name: string;
    status: 'draft' | 'sent' | 'completed' | 'cancelled';
    message: string | null;
    created_at: string;
    signers: SignRequestSigner[];
}

interface Paginated {
    data: SignRequest[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props extends PageProps {
    signRequests: Paginated;
    filters: { status?: string };
}

interface SignerFormRow {
    name: string;
    email: string;
    sequence: number;
}

const statusBadge: Record<string, string> = {
    draft:     'bg-slate-100 text-slate-700',
    sent:      'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

export default function SignIndex({ signRequests, filters }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [signerRows, setSignerRows] = useState<SignerFormRow[]>([{ name: '', email: '', sequence: 1 }]);

    const { data, setData, post, processing, reset, errors } = useForm({
        title:         '',
        document_name: '',
        document_path: '',
        message:       '',
    });

    function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        post('/sign', {
            data: {
                ...data,
                signers: signerRows.filter(s => s.name.trim() || s.email.trim()).map(s => ({
                    name:     s.name,
                    email:    s.email,
                    sequence: s.sequence,
                })),
            },
            onSuccess: () => {
                reset();
                setSignerRows([{ name: '', email: '', sequence: 1 }]);
                setShowForm(false);
            },
        });
    }

    function filterStatus(value: string) {
        router.get('/sign', { ...filters, status: value || undefined }, { preserveState: true, replace: true });
    }

    function sendRequest(id: number) {
        router.post(`/sign/${id}/send`);
    }

    function cancelRequest(id: number) {
        if (confirm('Cancel this signing request?')) {
            router.post(`/sign/${id}/cancel`);
        }
    }

    function addSignerRow() {
        setSignerRows([...signerRows, { name: '', email: '', sequence: signerRows.length + 1 }]);
    }

    function removeSignerRow(index: number) {
        setSignerRows(signerRows.filter((_, i) => i !== index));
    }

    function updateSignerRow(index: number, field: keyof SignerFormRow, value: string | number) {
        const next = [...signerRows];
        (next[index] as Record<string, string | number>)[field] = value;
        setSignerRows(next);
    }

    function signedCount(signers: SignRequestSigner[]) {
        return signers.filter(s => s.status === 'signed').length;
    }

    return (
        <AppLayout>
            <Head title="Sign Requests" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Sign Requests</h1>
                        <p className="text-sm text-slate-500 mt-1">{signRequests.total} records</p>
                    </div>
                    <Button onClick={() => setShowForm(!showForm)}>New Request</Button>
                </div>

                {showForm && (
                    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                        <h2 className="text-lg font-medium text-slate-800 mb-4">Create Sign Request</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="Document title"
                                    />
                                    {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Document Name *</label>
                                    <input
                                        type="text"
                                        value={data.document_name}
                                        onChange={e => setData('document_name', e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="filename.pdf"
                                    />
                                    {errors.document_name && <p className="text-red-600 text-xs mt-1">{errors.document_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Document Path *</label>
                                    <input
                                        type="text"
                                        value={data.document_path}
                                        onChange={e => setData('document_path', e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="/documents/filename.pdf"
                                    />
                                    {errors.document_path && <p className="text-red-600 text-xs mt-1">{errors.document_path}</p>}
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                                    <textarea
                                        value={data.message}
                                        onChange={e => setData('message', e.target.value)}
                                        rows={2}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="Optional message to signers"
                                    />
                                </div>
                            </div>

                            {/* Signers */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-slate-700">Signers</label>
                                    <button
                                        type="button"
                                        onClick={addSignerRow}
                                        className="text-xs text-indigo-600 hover:underline"
                                    >
                                        + Add Signer
                                    </button>
                                </div>
                                {signerRows.map((row, i) => (
                                    <div key={i} className="flex gap-2 mb-2 items-center">
                                        <input
                                            type="text"
                                            value={row.name}
                                            onChange={e => updateSignerRow(i, 'name', e.target.value)}
                                            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            placeholder="Name"
                                        />
                                        <input
                                            type="email"
                                            value={row.email}
                                            onChange={e => updateSignerRow(i, 'email', e.target.value)}
                                            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            placeholder="Email"
                                        />
                                        <input
                                            type="number"
                                            value={row.sequence}
                                            onChange={e => updateSignerRow(i, 'sequence', parseInt(e.target.value) || 0)}
                                            className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            placeholder="Seq"
                                        />
                                        {signerRows.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeSignerRow(i)}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <Button type="submit" disabled={processing}>Create</Button>
                                <button type="button" onClick={() => setShowForm(false)} className="text-sm text-slate-600 hover:text-slate-800">Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Filter */}
                <div className="flex gap-3">
                    <select
                        value={filters.status ?? ''}
                        onChange={e => filterStatus(e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                        <option value="">All Statuses</option>
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Title</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Document</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Signers</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Created</th>
                                <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {signRequests.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center text-slate-400 py-8">No sign requests found.</td>
                                </tr>
                            )}
                            {signRequests.data.map(req => (
                                <tr key={req.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <Link href={`/sign/${req.id}`} className="font-medium text-indigo-600 hover:underline">
                                            {req.title}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{req.document_name}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[req.status]}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">
                                        {signedCount(req.signers)}/{req.signers.length} signed
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">
                                        {new Date(req.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        {req.status === 'draft' && (
                                            <button
                                                onClick={() => sendRequest(req.id)}
                                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                Send
                                            </button>
                                        )}
                                        {req.status === 'sent' && (
                                            <button
                                                onClick={() => cancelRequest(req.id)}
                                                className="text-xs text-red-600 hover:text-red-800 font-medium"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        <Link href={`/sign/${req.id}`} className="text-xs text-indigo-600 hover:underline">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {signRequests.last_page > 1 && (
                    <div className="flex gap-2 justify-end">
                        {Array.from({ length: signRequests.last_page }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => router.get('/sign', { ...filters, page }, { preserveState: true })}
                                className={`px-3 py-1 rounded text-sm border ${page === signRequests.current_page ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
