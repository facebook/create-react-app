import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface SignRequestSigner {
    id: number;
    signer_name: string;
    signer_email: string;
    status: 'pending' | 'signed' | 'declined';
    signed_at: string | null;
    declined_at: string | null;
    sequence: number;
}

interface SignRequest {
    id: number;
    title: string;
    document_path: string;
    document_name: string;
    status: 'draft' | 'sent' | 'completed' | 'cancelled';
    message: string | null;
    created_at: string;
    completed_at: string | null;
    signers: SignRequestSigner[];
    creator: { id: number; name: string } | null;
}

interface Props extends PageProps {
    signRequest: SignRequest;
}

const statusBadge: Record<string, string> = {
    draft:     'bg-slate-100 text-slate-700',
    sent:      'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

const signerStatusBadge: Record<string, string> = {
    pending:  'bg-yellow-100 text-yellow-700',
    signed:   'bg-green-100 text-green-700',
    declined: 'bg-red-100 text-red-700',
};

export default function SignShow({ signRequest }: Props) {
    const { data, setData, post, processing, reset, errors } = useForm({
        signer_name:  '',
        signer_email: '',
        sequence:     0,
    });

    function handleAddSigner(e: React.FormEvent) {
        e.preventDefault();
        post(`/sign/${signRequest.id}/signers`, {
            onSuccess: () => reset(),
        });
    }

    function sendRequest() {
        router.post(`/sign/${signRequest.id}/send`);
    }

    function cancelRequest() {
        if (confirm('Cancel this signing request?')) {
            router.post(`/sign/${signRequest.id}/cancel`);
        }
    }

    function signDocument(signerId: number) {
        router.post(`/sign/${signRequest.id}/signers/${signerId}/sign`);
    }

    function declineDocument(signerId: number) {
        if (confirm('Decline to sign this document?')) {
            router.post(`/sign/${signRequest.id}/signers/${signerId}/decline`);
        }
    }

    function removeSigner(signerId: number) {
        if (confirm('Remove this signer?')) {
            router.delete(`/sign/${signRequest.id}/signers/${signerId}`);
        }
    }

    return (
        <AppLayout>
            <Head title={signRequest.title} />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <Link href="/sign" className="text-sm text-slate-500 hover:text-slate-700">Sign Requests</Link>
                            <span className="text-slate-400">/</span>
                            <h1 className="text-2xl font-semibold text-slate-900">{signRequest.title}</h1>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[signRequest.status]}`}>
                                {signRequest.status}
                            </span>
                            <span className="text-sm text-slate-500">
                                {signRequest.document_name}
                            </span>
                            {signRequest.creator && (
                                <span className="text-xs text-slate-400">by {signRequest.creator.name}</span>
                            )}
                            {signRequest.completed_at && (
                                <span className="text-xs text-slate-400">
                                    Completed: {new Date(signRequest.completed_at).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                        {signRequest.message && (
                            <p className="text-sm text-slate-600 mt-2 max-w-lg">{signRequest.message}</p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {signRequest.status === 'draft' && signRequest.signers.length > 0 && (
                            <Button onClick={sendRequest}>Send for Signature</Button>
                        )}
                        {signRequest.status === 'sent' && (
                            <button
                                onClick={cancelRequest}
                                className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>

                {/* Signers Table */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-200">
                        <h2 className="text-lg font-medium text-slate-800">
                            Signers ({signRequest.signers.filter(s => s.status === 'signed').length}/{signRequest.signers.length} signed)
                        </h2>
                    </div>

                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Email</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Signed At</th>
                                <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {signRequest.signers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center text-slate-400 py-8">No signers added yet.</td>
                                </tr>
                            )}
                            {signRequest.signers.map(signer => (
                                <tr key={signer.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-800">{signer.signer_name}</td>
                                    <td className="px-4 py-3 text-slate-600">{signer.signer_email}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${signerStatusBadge[signer.status]}`}>
                                            {signer.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">
                                        {signer.signed_at ? new Date(signer.signed_at).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        {signer.status === 'pending' && signRequest.status === 'sent' && (
                                            <>
                                                <button
                                                    onClick={() => signDocument(signer.id)}
                                                    className="text-xs text-green-600 hover:text-green-800 font-medium"
                                                >
                                                    Sign
                                                </button>
                                                <button
                                                    onClick={() => declineDocument(signer.id)}
                                                    className="text-xs text-red-600 hover:text-red-800 font-medium"
                                                >
                                                    Decline
                                                </button>
                                            </>
                                        )}
                                        {signRequest.status === 'draft' && (
                                            <button
                                                onClick={() => removeSigner(signer.id)}
                                                className="text-xs text-slate-500 hover:text-red-600 font-medium"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Add Signer Form (only if draft) */}
                {signRequest.status === 'draft' && (
                    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                        <h3 className="text-base font-medium text-slate-800 mb-4">Add Signer</h3>
                        <form onSubmit={handleAddSigner} className="flex gap-3 items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={data.signer_name}
                                    onChange={e => setData('signer_name', e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="Signer name"
                                />
                                {errors.signer_name && <p className="text-red-600 text-xs mt-1">{errors.signer_name}</p>}
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    value={data.signer_email}
                                    onChange={e => setData('signer_email', e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="signer@example.com"
                                />
                                {errors.signer_email && <p className="text-red-600 text-xs mt-1">{errors.signer_email}</p>}
                            </div>
                            <div className="w-24">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Sequence</label>
                                <input
                                    type="number"
                                    value={data.sequence}
                                    onChange={e => setData('sequence', parseInt(e.target.value) || 0)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <Button type="submit" disabled={processing}>Add Signer</Button>
                        </form>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
