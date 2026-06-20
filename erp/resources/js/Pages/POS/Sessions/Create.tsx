import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { useForm } from '@inertiajs/react';

interface Warehouse {
    id: number;
    name: string;
}

interface Props {
    warehouses: Warehouse[];
}

export default function SessionCreate({ warehouses }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        warehouse_id: '',
        opening_cash: '0',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/pos/sessions');
    };

    return (
        <AppLayout title="Open POS Session">
            <div className="p-6 max-w-lg">
                <h1 className="text-2xl font-semibold text-slate-900 mb-6">Open New Session</h1>

                <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-white p-6 shadow-sm border border-slate-200">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Session Name <span className="text-slate-400">(optional — auto-generated if blank)</span>
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Register 1"
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Warehouse</label>
                        <select
                            value={data.warehouse_id}
                            onChange={(e) => setData('warehouse_id', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">— None —</option>
                            {warehouses.map((w) => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </select>
                        {errors.warehouse_id && <p className="mt-1 text-xs text-red-600">{errors.warehouse_id}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Opening Cash ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={data.opening_cash}
                            onChange={(e) => setData('opening_cash', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {errors.opening_cash && <p className="mt-1 text-xs text-red-600">{errors.opening_cash}</p>}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="submit" loading={processing}>Open Session</Button>
                        <a href="/pos/sessions">
                            <Button type="button" variant="secondary">Cancel</Button>
                        </a>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
