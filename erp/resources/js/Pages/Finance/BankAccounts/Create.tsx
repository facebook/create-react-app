import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

const CURRENCY_CODES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'SGD', 'NZD'];

export default function BankAccountCreate(_props: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        bank_name: '',
        account_number: '',
        currency_code: 'USD',
        opening_balance: '0',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/finance/bank-accounts');
    }

    return (
        <AppLayout>
            <Head title="New Bank Account" />
            <div className="mx-auto max-w-xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">New Bank Account</h1>
                    <p className="text-sm text-slate-500 mt-1">Add a bank account to track transactions and reconcile.</p>
                </div>

                <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Account Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="e.g. Main Checking Account"
                            required
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Bank Name</label>
                        <input
                            type="text"
                            value={data.bank_name}
                            onChange={(e) => setData('bank_name', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="e.g. First National Bank"
                        />
                        {errors.bank_name && <p className="mt-1 text-xs text-red-600">{errors.bank_name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Account Number</label>
                        <input
                            type="text"
                            value={data.account_number}
                            onChange={(e) => setData('account_number', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="e.g. 123456789"
                        />
                        {errors.account_number && <p className="mt-1 text-xs text-red-600">{errors.account_number}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Currency <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={data.currency_code}
                            onChange={(e) => setData('currency_code', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            {CURRENCY_CODES.map((code) => (
                                <option key={code} value={code}>{code}</option>
                            ))}
                        </select>
                        {errors.currency_code && <p className="mt-1 text-xs text-red-600">{errors.currency_code}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Opening Balance <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={data.opening_balance}
                            onChange={(e) => setData('opening_balance', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {errors.opening_balance && <p className="mt-1 text-xs text-red-600">{errors.opening_balance}</p>}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <a href="/finance/bank-accounts" className="text-sm text-slate-600 hover:text-slate-800">Cancel</a>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Account'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
