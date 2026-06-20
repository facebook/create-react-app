import React from 'react';
import { Head, router } from '@inertiajs/react';

interface ProfitCenter {
    id: number;
    code: string;
    name: string;
    type: string;
    status: string;
    budget: number | null;
    description: string | null;
    children: { id: number; code: string; name: string }[];
}

export default function Show({ profitCenter }: { profitCenter: ProfitCenter }) {
    return (
        <>
            <Head title={profitCenter.name} />
            <div className="p-6 max-w-2xl">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">{profitCenter.name}</h1>
                        <p className="text-gray-500 font-mono">{profitCenter.code} · <span className="capitalize">{profitCenter.type}</span></p>
                    </div>
                    <div className="space-x-2">
                        {profitCenter.status === 'active' ? (
                            <button onClick={() => router.post(`/finance/profit-centers/${profitCenter.id}/deactivate`)} className="bg-yellow-500 text-white px-4 py-2 rounded">Deactivate</button>
                        ) : (
                            <button onClick={() => router.post(`/finance/profit-centers/${profitCenter.id}/activate`)} className="bg-green-600 text-white px-4 py-2 rounded">Activate</button>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div><span className="font-medium">Status:</span> <span className="capitalize">{profitCenter.status}</span></div>
                    <div><span className="font-medium">Budget:</span> {profitCenter.budget != null ? profitCenter.budget.toLocaleString() : '—'}</div>
                </div>
                {profitCenter.description && <p className="text-gray-600 mb-6">{profitCenter.description}</p>}
                {profitCenter.children.length > 0 && (
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Sub-Centers</h2>
                        <ul className="list-disc list-inside">
                            {profitCenter.children.map(c => <li key={c.id}>{c.code} — {c.name}</li>)}
                        </ul>
                    </div>
                )}
            </div>
        </>
    );
}
