import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface RentalAgreement {
    id: number;
    customer_name: string;
    customer_email: string | null;
    start_date: string;
    end_date: string | null;
    daily_rate: string | number;
    deposit: string | number;
    status: 'active' | 'returned' | 'overdue' | 'cancelled';
    notes: string | null;
    returned_at: string | null;
}

interface RentalItem {
    id: number;
    name: string;
    description: string | null;
    category: string | null;
    daily_rate: string | number;
    serial_number: string | null;
    status: 'available' | 'rented' | 'maintenance';
    agreements: RentalAgreement[];
}

interface Props extends PageProps {
    item: RentalItem;
}

const STATUS_BADGE: Record<string, string> = {
    available:   'bg-green-100 text-green-700',
    rented:      'bg-blue-100 text-blue-700',
    maintenance: 'bg-yellow-100 text-yellow-700',
};

const AGREEMENT_STATUS_BADGE: Record<string, string> = {
    active:    'bg-green-100 text-green-700',
    returned:  'bg-slate-100 text-slate-600',
    overdue:   'bg-red-100 text-red-700',
    cancelled: 'bg-red-100 text-red-700',
};

export default function RentalShow({ item }: Props) {
    function handleReturn() {
        if (!confirm(`Mark "${item.name}" as returned?`)) return;
        router.post(`/rental/items/${item.id}/return`, {});
    }

    return (
        <AppLayout>
            <Head title={`Rental — ${item.name}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">{item.name}</h1>
                        <p className="text-sm text-slate-500 mt-1">{item.category ?? 'No category'}</p>
                    </div>
                    <div className="flex gap-2">
                        <a
                            href="/rental/items"
                            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Back to Items
                        </a>
                        {item.status === 'rented' && (
                            <Button variant="secondary" onClick={handleReturn}>
                                Return Item
                            </Button>
                        )}
                    </div>
                </div>

                {/* Item details */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Status</p>
                            <span className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[item.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Daily Rate</p>
                            <p className="mt-1 text-sm font-medium text-slate-800">${Number(item.daily_rate).toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Serial Number</p>
                            <p className="mt-1 text-sm text-slate-800">{item.serial_number ?? '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Category</p>
                            <p className="mt-1 text-sm text-slate-800">{item.category ?? '—'}</p>
                        </div>
                    </div>

                    {item.description && (
                        <div className="mt-4">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Description</p>
                            <p className="mt-1 text-sm text-slate-700">{item.description}</p>
                        </div>
                    )}
                </div>

                {/* Recent agreements */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-4 py-3">
                        <h2 className="text-sm font-semibold text-slate-800">Recent Agreements</h2>
                    </div>
                    {item.agreements.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-slate-400">No agreements found.</div>
                    ) : (
                        <table className="min-w-full divide-y divide-slate-100 text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    {['Customer', 'Start', 'End', 'Daily Rate', 'Status'].map((h) => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {item.agreements.map((ag) => (
                                    <tr key={ag.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3">
                                            <p className="text-slate-800">{ag.customer_name}</p>
                                            {ag.customer_email && <p className="text-xs text-slate-400">{ag.customer_email}</p>}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{ag.start_date}</td>
                                        <td className="px-4 py-3 text-slate-600">{ag.end_date ?? '—'}</td>
                                        <td className="px-4 py-3 text-slate-600">${Number(ag.daily_rate).toFixed(2)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${AGREEMENT_STATUS_BADGE[ag.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                                {ag.status.charAt(0).toUpperCase() + ag.status.slice(1)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
