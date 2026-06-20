import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface PLRow {
    id: number;
    name: string;
    code: string;
    current: number;
    prior: number;
    change: number;
}

interface Props {
    incomeRows: PLRow[];
    expenseRows: PLRow[];
    totalCurrentIncome: number;
    totalPriorIncome: number;
    totalCurrentExpenses: number;
    totalPriorExpenses: number;
    netCurrentProfit: number;
    netPriorProfit: number;
    currentFrom: string;
    currentTo: string;
    priorFrom: string;
    priorTo: string;
}

export default function ComparativeProfitLoss(props: Props) {
    const [cf, setCf] = useState(props.currentFrom);
    const [ct, setCt] = useState(props.currentTo);
    const [pf, setPf] = useState(props.priorFrom);
    const [pt, setPt] = useState(props.priorTo);

    const round = (n: number) => Math.round(n * 100) / 100;
    const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2 });
    const chg = (n: number) => (n >= 0 ? `+${fmt(n)}` : fmt(n));

    function reload() {
        router.get(
            '/finance/reports/comparative-profit-loss',
            { current_from: cf, current_to: ct, prior_from: pf, prior_to: pt },
            { preserveState: true },
        );
    }

    const Section = ({
        title,
        rows,
        totalCurrent,
        totalPrior,
    }: {
        title: string;
        rows: PLRow[];
        totalCurrent: number;
        totalPrior: number;
    }) => (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-4">
            <div className="bg-slate-800 px-4 py-2">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wide">{title}</h3>
            </div>
            <table className="w-full text-sm">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Account</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-slate-600">Current Period</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-slate-600">Prior Period</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-slate-600">Change</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {rows.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-4 py-4 text-center text-slate-400 text-xs">
                                No activity
                            </td>
                        </tr>
                    )}
                    {rows.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50">
                            <td className="px-4 py-2 text-slate-700">
                                {r.code ? `${r.code} · ` : ''}
                                {r.name}
                            </td>
                            <td className="px-4 py-2 text-right">{fmt(r.current)}</td>
                            <td className="px-4 py-2 text-right text-slate-500">{fmt(r.prior)}</td>
                            <td
                                className={`px-4 py-2 text-right text-xs font-medium ${r.change >= 0 ? 'text-green-700' : 'text-red-700'}`}
                            >
                                {chg(r.change)}
                            </td>
                        </tr>
                    ))}
                    <tr className="bg-slate-50 font-semibold">
                        <td className="px-4 py-2 text-slate-800">Total {title}</td>
                        <td className="px-4 py-2 text-right text-slate-800">{fmt(totalCurrent)}</td>
                        <td className="px-4 py-2 text-right text-slate-500">{fmt(totalPrior)}</td>
                        <td
                            className={`px-4 py-2 text-right text-xs font-semibold ${totalCurrent - totalPrior >= 0 ? 'text-green-700' : 'text-red-700'}`}
                        >
                            {chg(round(totalCurrent - totalPrior))}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );

    return (
        <AppLayout>
            <Head title="Comparative P&L" />
            <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <h1 className="text-2xl font-bold text-slate-800">Comparative Profit &amp; Loss</h1>
                    <a
                        href={`/finance/reports/comparative-profit-loss/export?current_from=${cf}&current_to=${ct}&prior_from=${pf}&prior_to=${pt}`}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                        Export CSV
                    </a>
                </div>

                {/* Date filters */}
                <div className="bg-white border border-slate-200 rounded-lg p-4 grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 mb-2 uppercase">Current Period</p>
                        <div className="flex gap-2">
                            <input
                                type="date"
                                value={cf}
                                onChange={(e) => setCf(e.target.value)}
                                className="rounded border border-slate-300 px-2 py-1 text-sm flex-1"
                            />
                            <span className="text-slate-400 self-center">—</span>
                            <input
                                type="date"
                                value={ct}
                                onChange={(e) => setCt(e.target.value)}
                                className="rounded border border-slate-300 px-2 py-1 text-sm flex-1"
                            />
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 mb-2 uppercase">Prior Period</p>
                        <div className="flex gap-2">
                            <input
                                type="date"
                                value={pf}
                                onChange={(e) => setPf(e.target.value)}
                                className="rounded border border-slate-300 px-2 py-1 text-sm flex-1"
                            />
                            <span className="text-slate-400 self-center">—</span>
                            <input
                                type="date"
                                value={pt}
                                onChange={(e) => setPt(e.target.value)}
                                className="rounded border border-slate-300 px-2 py-1 text-sm flex-1"
                            />
                        </div>
                    </div>
                    <div className="col-span-2">
                        <button
                            onClick={reload}
                            className="rounded bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                <Section
                    title="Income"
                    rows={props.incomeRows}
                    totalCurrent={props.totalCurrentIncome}
                    totalPrior={props.totalPriorIncome}
                />
                <Section
                    title="Expenses"
                    rows={props.expenseRows}
                    totalCurrent={props.totalCurrentExpenses}
                    totalPrior={props.totalPriorExpenses}
                />

                {/* Net profit */}
                <div className="bg-slate-800 rounded-xl p-4 grid grid-cols-3 gap-4 text-white">
                    <div>
                        <p className="text-xs text-slate-300">Current Net Profit</p>
                        <p
                            className={`text-2xl font-bold mt-1 ${props.netCurrentProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}
                        >
                            {fmt(props.netCurrentProfit)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-300">Prior Net Profit</p>
                        <p
                            className={`text-2xl font-bold mt-1 ${props.netPriorProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}
                        >
                            {fmt(props.netPriorProfit)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-300">Change</p>
                        <p
                            className={`text-2xl font-bold mt-1 ${props.netCurrentProfit - props.netPriorProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}
                        >
                            {chg(round(props.netCurrentProfit - props.netPriorProfit))}
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
