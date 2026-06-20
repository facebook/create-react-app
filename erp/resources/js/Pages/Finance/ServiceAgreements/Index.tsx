import { Head, Link } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { ServiceAgreement } from '@/types/finance';

interface Paginator<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props extends PageProps {
    agreements: Paginator<ServiceAgreement>;
    filters: { status?: string };
}

const statusColors: Record<string, string> = {
    draft:      'bg-slate-100 text-slate-600',
    active:     'bg-green-50 text-green-700',
    expired:    'bg-red-50 text-red-700',
    terminated: 'bg-slate-100 text-slate-600',
};

export default function ServiceAgreementIndex({ agreements, filters }: Props) {
    const { data, setData, get } = useForm({ status: filters.status ?? '' });

    function applyFilter() {
        get('/finance/service-agreements', { preserveScroll: true, preserveState: true });
    }

    return (
        <AppLayout>
            <Head title="Service Agreements" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Service Agreements</h1>
                    <Link href="/finance/service-agreements/create"><Button>New Agreement</Button></Link>
                </div>

                {/* Filters */}
                <div className="flex gap-3 items-end">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                        <select
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                        >
                            <option value="">All</option>
                            <option value="draft">Draft</option>
                            <option value="active">Active</option>
                            <option value="expired">Expired</option>
                            <option value="terminated">Terminated</option>
                        </select>
                    </div>
                    <Button type="button" variant="secondary" onClick={applyFilter}>Filter</Button>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">End Date</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Days Remaining</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Value</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {agreements.data.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-400">
                                        No service agreements yet.
                                    </td>
                                </tr>
                            )}
                            {agreements.data.map((agreement) => (
                                <tr key={agreement.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                        {agreement.title}
                                        {agreement.is_expiring && (
                                            <span className="ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-50 text-yellow-700">
                                                Expiring Soon
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        {agreement.contact?.name ?? '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600 capitalize">
                                        {agreement.agreement_type}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[agreement.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                            {agreement.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        {agreement.end_date ?? '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-600">
                                        {agreement.days_remaining != null ? agreement.days_remaining : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-600">
                                        {agreement.value != null ? Number(agreement.value).toFixed(2) : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right">
                                        <Link href={`/finance/service-agreements/${agreement.id}`} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {agreements.last_page > 1 && (
                    <div className="flex justify-center gap-1">
                        {agreements.links.map((link, i) => (
                            link.url ? (
                                <Link
                                    key={i}
                                    href={link.url}
                                    className={`px-3 py-1 rounded text-sm ${link.active ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span
                                    key={i}
                                    className="px-3 py-1 rounded text-sm text-slate-400"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            )
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
