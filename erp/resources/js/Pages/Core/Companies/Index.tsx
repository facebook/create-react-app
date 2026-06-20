import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { Paginator } from '@/types/inventory';

interface Company {
    id: number;
    name: string;
    code: string | null;
    industry: string | null;
    currency_code: string;
    fiscal_year_start: number;
    is_active: boolean;
    subsidiaries_count: number;
    parent: { id: number; name: string; code: string | null } | null;
}

interface Props extends PageProps {
    companies: Paginator<Company>;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function CompaniesIndex({ companies }: Props) {
    return (
        <AppLayout>
            <Head title="Companies" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Companies</h1>
                        <p className="mt-1 text-sm text-slate-500">{companies.total} total companies</p>
                    </div>
                    <Link href="/core/companies/create">
                        <Button>New Company</Button>
                    </Link>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Name / Code</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Industry</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Currency</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Fiscal Year</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Parent Company</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Subsidiaries</th>
                                <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {companies.data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                                        No companies found. Create your first company.
                                    </td>
                                </tr>
                            ) : (
                                companies.data.map((company) => (
                                    <tr key={company.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-900">{company.name}</div>
                                            {company.code && (
                                                <div className="text-xs text-slate-500">{company.code}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{company.industry ?? '—'}</td>
                                        <td className="px-4 py-3 text-slate-600">{company.currency_code}</td>
                                        <td className="px-4 py-3 text-slate-600">
                                            {MONTHS[(company.fiscal_year_start - 1) % 12]}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                            {company.parent ? (
                                                <Link
                                                    href={`/core/companies/${company.parent.id}`}
                                                    className="text-indigo-600 hover:underline"
                                                >
                                                    {company.parent.name}
                                                    {company.parent.code && ` (${company.parent.code})`}
                                                </Link>
                                            ) : '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {company.is_active ? (
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{company.subsidiaries_count}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/core/companies/${company.id}`}
                                                    className="text-sm text-indigo-600 hover:text-indigo-800"
                                                >
                                                    View
                                                </Link>
                                                <Link
                                                    href={`/core/companies/${company.id}/edit`}
                                                    className="text-sm text-slate-600 hover:text-slate-800"
                                                >
                                                    Edit
                                                </Link>
                                                <Link
                                                    href={`/core/companies/${company.id}/edit`}
                                                    className={`text-sm ${company.is_active ? 'text-amber-600 hover:text-amber-800' : 'text-green-600 hover:text-green-800'}`}
                                                >
                                                    {company.is_active ? 'Deactivate' : 'Activate'}
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {companies.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm text-slate-600">
                        <span>
                            Showing {companies.from}–{companies.to} of {companies.total}
                        </span>
                        <div className="flex gap-2">
                            {companies.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url ?? '#'}
                                    className={[
                                        'rounded px-3 py-1',
                                        link.active
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white border border-slate-200 hover:bg-slate-50',
                                        !link.url ? 'pointer-events-none opacity-40' : '',
                                    ].join(' ')}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
