import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Company {
    id: number;
    name: string;
    code: string | null;
    tax_id: string | null;
    currency_code: string;
    fiscal_year_start: number;
    address: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    industry: string | null;
    is_active: boolean;
    parent: { id: number; name: string; code: string | null } | null;
    subsidiaries: { id: number; name: string; code: string | null; is_active: boolean }[];
}

interface Props extends PageProps {
    company: Company;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function CompanyShow({ company }: Props) {
    return (
        <AppLayout>
            <Head title={company.name} />
            <div className="space-y-6 max-w-3xl">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">{company.name}</h1>
                        {company.code && <p className="text-sm text-slate-500 mt-0.5">Code: {company.code}</p>}
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/core/companies/${company.id}/edit`}>
                            <Button>Edit</Button>
                        </Link>
                        <Link href="/core/companies">
                            <Button variant="secondary">Back</Button>
                        </Link>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-slate-700 mb-4">Company Details</h2>
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Currency</dt>
                            <dd className="mt-0.5 text-slate-700">{company.currency_code}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Fiscal Year Start</dt>
                            <dd className="mt-0.5 text-slate-700">{MONTHS[(company.fiscal_year_start - 1)] ?? company.fiscal_year_start}</dd>
                        </div>
                        {company.tax_id && (
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Tax ID</dt>
                                <dd className="mt-0.5 text-slate-700">{company.tax_id}</dd>
                            </div>
                        )}
                        {company.industry && (
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Industry</dt>
                                <dd className="mt-0.5 text-slate-700">{company.industry}</dd>
                            </div>
                        )}
                        {company.phone && (
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Phone</dt>
                                <dd className="mt-0.5 text-slate-700">{company.phone}</dd>
                            </div>
                        )}
                        {company.email && (
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Email</dt>
                                <dd className="mt-0.5 text-slate-700">{company.email}</dd>
                            </div>
                        )}
                        {company.website && (
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Website</dt>
                                <dd className="mt-0.5 text-slate-700">{company.website}</dd>
                            </div>
                        )}
                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Status</dt>
                            <dd className="mt-0.5">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${company.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {company.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </dd>
                        </div>
                        {company.parent && (
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Parent Company</dt>
                                <dd className="mt-0.5">
                                    <Link href={`/core/companies/${company.parent.id}`} className="text-indigo-600 hover:text-indigo-800">
                                        {company.parent.name}{company.parent.code ? ` (${company.parent.code})` : ''}
                                    </Link>
                                </dd>
                            </div>
                        )}
                    </dl>
                    {company.address && (
                        <div className="mt-4 border-t border-slate-100 pt-3">
                            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-1">Address</dt>
                            <dd className="text-sm text-slate-700 whitespace-pre-wrap">{company.address}</dd>
                        </div>
                    )}
                </div>

                {company.subsidiaries.length > 0 && (
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-100">
                            <h2 className="text-sm font-semibold text-slate-700">Subsidiaries ({company.subsidiaries.length})</h2>
                        </div>
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Code</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {company.subsidiaries.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3">
                                            <Link href={`/core/companies/${sub.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                                {sub.name}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{sub.code ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${sub.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {sub.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
