import { Head, useForm } from '@inertiajs/react';
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
    parent_company_id: number | null;
}

interface ParentOption {
    id: number;
    name: string;
    code: string | null;
}

interface Props extends PageProps {
    company: Company;
    parents: ParentOption[];
}

const MONTHS = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' },   { value: 4, label: 'April' },
    { value: 5, label: 'May' },     { value: 6, label: 'June' },
    { value: 7, label: 'July' },    { value: 8, label: 'August' },
    { value: 9, label: 'September' },{ value: 10, label: 'October' },
    { value: 11, label: 'November' },{ value: 12, label: 'December' },
];

export default function CompaniesEdit({ company, parents }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: company.name,
        code: company.code ?? '',
        tax_id: company.tax_id ?? '',
        currency_code: company.currency_code,
        fiscal_year_start: company.fiscal_year_start,
        address: company.address ?? '',
        phone: company.phone ?? '',
        email: company.email ?? '',
        website: company.website ?? '',
        industry: company.industry ?? '',
        is_active: company.is_active,
        parent_company_id: company.parent_company_id ?? ('' as string | number),
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(`/core/companies/${company.id}`);
    }

    const inputCls = 'mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';
    const labelCls = 'block text-sm font-medium text-slate-700';
    const errorCls = 'mt-1 text-xs text-red-600';

    return (
        <AppLayout>
            <Head title={`Edit — ${company.name}`} />
            <div className="max-w-3xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Edit Company</h1>
                    <p className="mt-1 text-sm text-slate-500">{company.name}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Name <span className="text-red-500">*</span></label>
                            <input type="text" className={inputCls} value={data.name} onChange={e => setData('name', e.target.value)} required />
                            {errors.name && <p className={errorCls}>{errors.name}</p>}
                        </div>
                        <div>
                            <label className={labelCls}>Code</label>
                            <input type="text" className={inputCls} value={data.code} onChange={e => setData('code', e.target.value)} maxLength={20} />
                            {errors.code && <p className={errorCls}>{errors.code}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Tax ID / VAT / EIN</label>
                            <input type="text" className={inputCls} value={data.tax_id} onChange={e => setData('tax_id', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelCls}>Currency Code</label>
                            <input type="text" className={inputCls} value={data.currency_code} onChange={e => setData('currency_code', e.target.value.toUpperCase())} maxLength={3} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Fiscal Year Start</label>
                            <select className={inputCls} value={data.fiscal_year_start} onChange={e => setData('fiscal_year_start', Number(e.target.value))}>
                                {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Industry</label>
                            <input type="text" className={inputCls} value={data.industry} onChange={e => setData('industry', e.target.value)} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Phone</label>
                            <input type="text" className={inputCls} value={data.phone} onChange={e => setData('phone', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelCls}>Email</label>
                            <input type="email" className={inputCls} value={data.email} onChange={e => setData('email', e.target.value)} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Website</label>
                            <input type="text" className={inputCls} value={data.website} onChange={e => setData('website', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelCls}>Parent Company</label>
                            <select className={inputCls} value={data.parent_company_id as string} onChange={e => setData('parent_company_id', e.target.value)}>
                                <option value="">None</option>
                                {parents.filter(p => p.id !== company.id).map(p => (
                                    <option key={p.id} value={p.id}>{p.name}{p.code ? ` (${p.code})` : ''}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={labelCls}>Address</label>
                        <textarea className={inputCls} rows={3} value={data.address} onChange={e => setData('address', e.target.value)} />
                    </div>

                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="is_active" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                        <label htmlFor="is_active" className={labelCls}>Active</label>
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                        <a href={`/core/companies/${company.id}`} className="text-sm text-slate-600 hover:text-slate-800">Cancel</a>
                        <Button type="submit" disabled={processing}>{processing ? 'Saving...' : 'Save Changes'}</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
