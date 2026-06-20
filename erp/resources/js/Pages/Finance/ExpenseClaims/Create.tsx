import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface ItemRow {
    category: string;
    expense_date: string;
    description: string;
    amount: string;
}

interface FormData {
    claim_date: string;
    currency: string;
    notes: string;
    items: ItemRow[];
    [key: string]: string | ItemRow[];
}

const CATEGORIES = ['travel', 'accommodation', 'meals', 'supplies', 'other'];

export default function ExpenseClaimsCreate(_props: PageProps) {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        claim_date: '',
        currency:   'USD',
        notes:      '',
        items: [
            { category: 'travel', expense_date: '', description: '', amount: '' },
        ],
    });

    function addItem() {
        setData('items', [
            ...data.items,
            { category: 'travel', expense_date: '', description: '', amount: '' },
        ]);
    }

    function removeItem(index: number) {
        setData('items', data.items.filter((_, i) => i !== index));
    }

    function updateItem(index: number, field: keyof ItemRow, value: string) {
        const updated = data.items.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        );
        setData('items', updated);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/finance/expense-claims');
    }

    return (
        <AppLayout>
            <Head title="New Expense Claim" />
            <div className="mx-auto max-w-3xl space-y-6 p-6">
                <h1 className="text-2xl font-semibold text-slate-800">New Expense Claim</h1>

                <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Claim Date *</label>
                            <input
                                type="date"
                                value={data.claim_date}
                                onChange={(e) => setData('claim_date', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.claim_date && <p className="mt-1 text-xs text-red-600">{errors.claim_date}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Currency</label>
                            <input
                                type="text"
                                maxLength={3}
                                value={data.currency}
                                onChange={(e) => setData('currency', e.target.value.toUpperCase())}
                                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.currency && <p className="mt-1 text-xs text-red-600">{errors.currency}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Notes</label>
                        <textarea
                            rows={3}
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-medium text-slate-800">Expense Items</h2>
                            <Button type="button" onClick={addItem} className="text-xs">+ Add Item</Button>
                        </div>

                        {errors.items && <p className="text-xs text-red-600">{errors.items}</p>}

                        {data.items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 rounded-md border border-slate-200 p-3">
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-slate-600">Category</label>
                                    <select
                                        value={item.category}
                                        onChange={(e) => updateItem(index, 'category', e.target.value)}
                                        className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        {CATEGORIES.map((c) => (
                                            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-slate-600">Date</label>
                                    <input
                                        type="date"
                                        value={item.expense_date}
                                        onChange={(e) => updateItem(index, 'expense_date', e.target.value)}
                                        className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="col-span-5">
                                    <label className="block text-xs font-medium text-slate-600">Description</label>
                                    <input
                                        type="text"
                                        value={item.description}
                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                        className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-slate-600">Amount</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={item.amount}
                                        onChange={(e) => updateItem(index, 'amount', e.target.value)}
                                        className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="col-span-1 flex items-end">
                                    {data.items.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="mb-0.5 text-xs text-red-500 hover:text-red-700"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <a href="/finance/expense-claims" className="text-sm text-slate-600 hover:underline">Cancel</a>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Create Expense Claim'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
