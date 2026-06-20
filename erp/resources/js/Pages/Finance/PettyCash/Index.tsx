import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PettyCashFund } from '@/types/finance';

interface Props {
    funds: {
        data: PettyCashFund[];
        current_page: number;
        last_page: number;
    };
}

export default function Index({ funds }: Props) {
    return (
        <AppLayout>
            <Head title="Petty Cash" />
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Petty Cash Funds</h1>
                    <Link
                        href="/finance/petty-cash/create"
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        New Fund
                    </Link>
                </div>
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Currency</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Authorized</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Balance</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Status</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {funds.data.map((fund) => (
                                <tr key={fund.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{fund.name}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{fund.currency}</td>
                                    <td className="px-4 py-3 text-right text-sm text-slate-900">
                                        {fund.authorized_amount.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm">
                                        <span className={fund.is_low_balance ? 'font-semibold text-red-600' : 'text-slate-900'}>
                                            {fund.current_balance.toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span
                                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                                fund.is_active
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-slate-100 text-slate-600'
                                            }`}
                                        >
                                            {fund.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm">
                                        <Link
                                            href={`/finance/petty-cash/${fund.id}`}
                                            className="text-indigo-600 hover:text-indigo-800"
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {funds.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                                        No petty cash funds found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
