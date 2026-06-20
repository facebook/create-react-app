import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';

interface Currency { id: number; code: string; name: string; symbol: string; is_base: boolean; }
interface InvoiceSummary { currency_code: string; total_amount: string; count: number; base_amount: number | null; }
interface ExchangeRate { from_currency: string; to_currency: string; base_currency: string; quote_currency: string; rate: number; effective_date: string; }

export default function ConsolidationReport({ baseCurrency, currencies, invoiceSummary, recentRates }) {
  const [converter, setConverter] = useState({ amount: '', from: '', to: '', date: '' });
  const [convertResult, setConvertResult] = useState<null | { result: number | null; rate: number | null }>(null);
  const [converting, setConverting] = useState(false);

  const doConvert = async () => {
    setConverting(true);
    try {
      const res = await axios.get('/finance/multi-currency/convert', { params: converter });
      setConvertResult(res.data);
    } finally { setConverting(false); }
  };

  const totalBase = invoiceSummary.reduce((sum, r) => sum + (r.base_amount ?? 0), 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/finance/exchange-rates" className="text-blue-600 hover:underline text-sm">← Exchange Rates</Link>
        <h1 className="text-2xl font-bold text-gray-800">Multi-Currency Consolidation</h1>
        {baseCurrency && (
          <span className="ml-auto text-sm text-gray-500">Base currency: <strong>{baseCurrency.code}</strong></span>
        )}
      </div>

      {/* Currency Converter */}
      <div className="bg-white rounded-xl shadow p-5 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">Live Currency Converter</h2>
        <div className="grid grid-cols-4 gap-3">
          <input type="number" placeholder="Amount" value={converter.amount}
            onChange={e => setConverter(c => ({ ...c, amount: e.target.value }))}
            className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          <select value={converter.from} onChange={e => setConverter(c => ({ ...c, from: e.target.value }))}
            className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
            <option value="">From currency</option>
            {currencies.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
          </select>
          <select value={converter.to} onChange={e => setConverter(c => ({ ...c, to: e.target.value }))}
            className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
            <option value="">To currency</option>
            {currencies.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
          </select>
          <button onClick={doConvert} disabled={converting || !converter.amount || !converter.from || !converter.to}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50">
            {converting ? 'Converting…' : 'Convert'}
          </button>
        </div>
        {convertResult && (
          <div className="mt-3 p-3 bg-blue-50 rounded text-sm">
            <span className="font-semibold">{converter.amount} {converter.from}</span>
            {' = '}
            <span className="font-bold text-blue-700">{convertResult.result?.toFixed(4) ?? 'N/A'} {converter.to}</span>
            {convertResult.rate && (
              <span className="text-gray-500 ml-2">(rate: {convertResult.rate})</span>
            )}
          </div>
        )}
      </div>

      {/* Invoice Summary */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Paid Invoices by Currency</h2>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-gray-500">
              <th className="pb-2">Currency</th>
              <th className="pb-2 text-right">Total</th>
              <th className="pb-2 text-right">Base ({baseCurrency?.code ?? '—'})</th>
            </tr></thead>
            <tbody>
              {invoiceSummary.map(row => (
                <tr key={row.currency_code} className="border-b hover:bg-gray-50">
                  <td className="py-2 font-medium">{row.currency_code}</td>
                  <td className="py-2 text-right">{parseFloat(row.total_amount).toLocaleString()}</td>
                  <td className="py-2 text-right text-green-700">{row.base_amount != null ? row.base_amount.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '—'}</td>
                </tr>
              ))}
              {invoiceSummary.length === 0 && (
                <tr><td colSpan={3} className="py-4 text-center text-gray-400">No paid invoices.</td></tr>
              )}
            </tbody>
            {invoiceSummary.length > 0 && (
              <tfoot><tr className="border-t-2 font-semibold">
                <td className="py-2" colSpan={2}>Total ({baseCurrency?.code ?? 'Base'})</td>
                <td className="py-2 text-right text-green-700">{totalBase.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr></tfoot>
            )}
          </table>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Active Currencies</h2>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-gray-500">
              <th className="pb-2">Code</th><th className="pb-2">Name</th><th className="pb-2">Symbol</th><th className="pb-2">Base</th>
            </tr></thead>
            <tbody>
              {currencies.map(c => (
                <tr key={c.code} className="border-b hover:bg-gray-50">
                  <td className="py-2 font-mono font-medium">{c.code}</td>
                  <td className="py-2 text-gray-700">{c.name}</td>
                  <td className="py-2 text-gray-500">{c.symbol}</td>
                  <td className="py-2">{c.is_base ? <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs">BASE</span> : ''}</td>
                </tr>
              ))}
              {currencies.length === 0 && <tr><td colSpan={4} className="py-4 text-center text-gray-400">No currencies configured.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Rates */}
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="font-semibold text-gray-700 mb-4">Recent Exchange Rates</h2>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-gray-500">
            <th className="pb-2">From</th><th className="pb-2">To</th><th className="pb-2 text-right">Rate</th><th className="pb-2 text-right">Date</th>
          </tr></thead>
          <tbody>
            {recentRates.map((r, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="py-2 font-mono">{r.from_currency ?? r.base_currency}</td>
                <td className="py-2 font-mono">{r.to_currency ?? r.quote_currency}</td>
                <td className="py-2 text-right">{r.rate}</td>
                <td className="py-2 text-right text-gray-500">{new Date(r.effective_date).toLocaleDateString()}</td>
              </tr>
            ))}
            {recentRates.length === 0 && <tr><td colSpan={4} className="py-4 text-center text-gray-400">No rates found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
