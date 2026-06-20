import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface ParentOption {
    id: number;
    name: string;
    code: string | null;
}

interface Props extends PageProps {
    parents: ParentOption[];
}

const MONTHS = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
];

export default function CompaniesCreate({ parents }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        tax_id: '',
        currency_code: 'USD',
        fiscal_year_start: 1,
        address: '',
        phone: '',
        email: '',
        website: '',
        industry: '',
        is_active: true as boolean,
        parent_company_id: '' as string | number,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/core/companies');
    }

    const inputCls = 'mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';
    const labelCls = 'block text-sm font-medium text-slate-700';
    const errorCls = 'mt-1 text-xs text-red-600';

    return (
        <AppLayout>
            <Head title="New Company" />
            <div className="max-w-3xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">New Company</h1>
                    <p className="mt-1 text-sm text-slate-500">Register a new company in the system.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    {/* Name + Code */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                className={inputCls}
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                required
                            />
                            {errors.name && <p className={errorCls}>{errors.name}</p>}
                        </div>
                        <div>
                            <label className={labelCls}>Code</label>
                            <input
                                type="text"
                                className={inputCls}
                                value={data.code}
                                onChange={e => setData('code', e.target.value)}
                                placeholder="e.g. ACME"
                                maxLength={20}
                            />
                            {errors.code && <p className={errorCls}>{errors.code}</p>}
                        </div>
                    </div>

                    {/* Tax ID + Currency */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Tax ID / VAT / EIN</label>
                            <input
                                type="text"
                                className={inputCls}
                                value={data.tax_id}
                                onChange={e => setData('tax_id', e.target.value)}
                            />
                            {errors.tax_id && <p className={errorCls}>{errors.tax_id}</p>}
                        </div>
                        <div>
                            <label className={labelCls}>Currency Code</label>
                            <input
                                type="text"
                                className={inputCls}
                                value={data.currency_code}
                                onChange={e => setData('currency_code', e.target.value.toUpperCase())}
                                maxLength={3}
                                placeholder="USD"
                            />
                            {errors.currency_code && <p className={errorCls}>{errors.currency_code}</p>}
                        </div>
                    </div>

                    {/* Fiscal Year Start + Industry */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Fiscal Year Start</label>
                            <select
                                className={inputCls}
                                value={data.fiscal_year_start}
                                onChange={e => setData('fiscal_year_start', Number(e.target.value))}
                            >
                                {MONTHS.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                            {errors.fiscal_year_start && <p className={errorCls}>{errors.fiscal_year_start}</p>}
                        </div>
                        <div>
                            <label className={labelCls}>Industry</label>
                            <input
                                type="text"
                                className={inputCls}
                                value={data.industry}
                                onChange={e => setData('industry', e.target.value)}
                            />
                            {errors.industry && <p className={errorCls}>{errors.industry}</p>}
                        </div>
                    </div>

                    {/* Phone + Email */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Phone</label>
                            <input
                                type="text"
                                className={inputCls}
                                value={data.phone}
                                onChange={e => setData('phone', e.target.value)}
                            />
                            {errors.phone && <p className={errorCls}>{errors.phone}</p>}
                        </div>
                        <div>
                            <label className={labelCls}>Email</label>
                            <input
                                type="email"
                                className={inputCls}
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                            />
                            {errors.email && <p className={errorCls}>{errors.email}</p>}
                        </div>
                    </div>

                    {/* Website + Parent */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Website</label>
                            <input
                                type="text"
                                className={inputCls}
                                value={data.website}
                                onChange={e => setData('website', e.target.value)}
                                placeholder="https://..."
                            />
                            {errors.website && <p className={errorCls}>{errors.website}</p>}
                        </div>
                        <div>
                            <label className={labelCls}>Parent Company</label>
                            <select
                                className={inputCls}
                                value={data.parent_company_id as string}
                                onChange={e => setData('parent_company_id', e.target.value)}
                            >
                                <option value="">None</option>
                                {parents.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}{p.code ? ` (${p.code})` : ''}
                                    </option>
                                ))}
                            </select>
                            {errors.parent_company_id && <p className={errorCls}>{errors.parent_company_id}</p>}
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label className={labelCls}>Address</label>
                        <textarea
                            className={inputCls}
                            rows={3}
                            value={data.address}
                            onChange={e => setData('address', e.target.value)}
                        />
                        {errors.address && <p className={errorCls}>{errors.address}</p>}
                    </div>

                    {/* Active */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={data.is_active}
                            onChange={e => setData('is_active', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="is_active" className={labelCls}>Active</label>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                        <a href="/core/companies" className="text-sm text-slate-600 hover:text-slate-800">
                            Cancel
                        </a>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Company'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
