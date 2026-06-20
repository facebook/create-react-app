import React from 'react';
import { Link } from '@inertiajs/react';

interface Session {
    id: number;
    name: string;
    status: string;
    opened_at: string;
    closed_at: string | null;
    total_sales: number;
    opening_cash: number;
    opened_by: { name: string } | null;
    closed_by: { name: string } | null;
}

interface Paginated<T> { data: T[]; current_page: number; last_page: number; }

export default function Sessions({ sessions }: { sessions: Paginated<Session> }) {
    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">POS Sessions</h1>
                <div className="flex gap-3">
                    <Link href="/pos/terminal" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                        Open Terminal
                    </Link>
                    <Link href="/pos/sessions/create" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                        + New Session
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Session</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Opened By</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Opened At</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Closed At</th>
                            <th className="px-4 py-3 text-right text-gray-600 font-medium">Total Sales</th>
                            <th className="px-4 py-3 text-center text-gray-600 font-medium">Status</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.data.map(s => (
                            <tr key={s.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium">{s.name}</td>
                                <td className="px-4 py-3 text-gray-600">{s.opened_by?.name ?? '—'}</td>
                                <td className="px-4 py-3 text-gray-600">{new Date(s.opened_at).toLocaleString()}</td>
                                <td className="px-4 py-3 text-gray-600">{s.closed_at ? new Date(s.closed_at).toLocaleString() : '—'}</td>
                                <td className="px-4 py-3 text-right font-medium">${(s.total_sales ?? 0).toFixed(2)}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${s.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {s.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <Link href={`/pos/sessions/${s.id}`} className="text-blue-600 hover:underline text-xs">View</Link>
                                </td>
                            </tr>
                        ))}
                        {sessions.data.length === 0 && (
                            <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No sessions yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
