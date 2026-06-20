import React from 'react';
import { Link } from '@inertiajs/react';

interface ScoredLead {
    id: number;
    contact_name: string;
    company_name: string | null;
    email: string;
    source: string | null;
    score: number;
}

function ScoreBadge({ score }: { score: number }) {
    let cls = 'bg-gray-100 text-gray-600';
    if (score >= 50) cls = 'bg-green-100 text-green-700';
    else if (score >= 20) cls = 'bg-blue-100 text-blue-700';
    else if (score > 0) cls = 'bg-yellow-100 text-yellow-700';

    return (
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${cls}`}>
            {score} pts
        </span>
    );
}

export default function LeadScores({ leads }: { leads: ScoredLead[] }) {
    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Lead Scores</h1>
                    <p className="text-sm text-gray-500 mt-1">Leads ranked by their current score.</p>
                </div>
                <Link href="/crm/scoring/rules" className="text-blue-600 hover:underline text-sm">Manage Rules</Link>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium w-10">#</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Contact</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Company</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Source</th>
                            <th className="px-4 py-3 text-center text-gray-600 font-medium">Score</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {leads.map((lead, idx) => (
                            <tr key={lead.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3 text-gray-400 text-center font-mono text-xs">{idx + 1}</td>
                                <td className="px-4 py-3">
                                    <div className="font-medium text-gray-800">{lead.contact_name}</div>
                                    <div className="text-xs text-gray-400">{lead.email}</div>
                                </td>
                                <td className="px-4 py-3 text-gray-600">{lead.company_name ?? '—'}</td>
                                <td className="px-4 py-3 text-gray-500">{lead.source ?? '—'}</td>
                                <td className="px-4 py-3 text-center">
                                    <ScoreBadge score={lead.score} />
                                </td>
                                <td className="px-4 py-3">
                                    <Link href={`/crm/leads/${lead.id}`} className="text-blue-600 hover:underline text-xs">View Lead</Link>
                                </td>
                            </tr>
                        ))}
                        {leads.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No open leads.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
