import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { Input } from '@/Components/Common/Input';
import type { PageProps } from '@/types';

type CreateForm = {
    name: string;
    event_type: string;
    conditions: string;
};

const EVENT_TYPE_SUGGESTIONS = [
    'invoice.overdue',
    'invoice.paid',
    'leave.submitted',
    'leave.approved',
    'leave.rejected',
    'stock.low',
    'purchase_order.pending',
    'payroll.processed',
];

export default function NotificationRulesCreate(_props: PageProps) {
    const { data, setData, post, processing, errors } = useForm<CreateForm>({
        name: '',
        event_type: '',
        conditions: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        let conditionsParsed: Record<string, unknown> | null = null;
        if (data.conditions.trim()) {
            try {
                conditionsParsed = JSON.parse(data.conditions);
            } catch {
                alert('Conditions must be valid JSON');
                return;
            }
        }

        post('/notification-rules', {
            data: {
                name: data.name,
                event_type: data.event_type,
                conditions: conditionsParsed,
            },
        });
    }

    return (
        <AppLayout>
            <Head title="Create Notification Rule" />
            <div className="max-w-lg space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Create Notification Rule</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Set up an alert for a specific business event.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Rule Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Alert me on overdue invoices"
                            required
                        />
                        {errors.name && (
                            <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Event Type <span className="text-red-500">*</span>
                        </label>
                        <Input
                            value={data.event_type}
                            onChange={(e) => setData('event_type', e.target.value)}
                            placeholder="e.g. invoice.overdue"
                            list="event-type-suggestions"
                            required
                        />
                        <datalist id="event-type-suggestions">
                            {EVENT_TYPE_SUGGESTIONS.map((s) => (
                                <option key={s} value={s} />
                            ))}
                        </datalist>
                        {errors.event_type && (
                            <p className="mt-1 text-xs text-red-600">{errors.event_type}</p>
                        )}
                        <p className="mt-1 text-xs text-slate-400">
                            Suggestions: {EVENT_TYPE_SUGGESTIONS.join(', ')}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Conditions <span className="text-slate-400 font-normal">(optional JSON)</span>
                        </label>
                        <textarea
                            value={data.conditions}
                            onChange={(e) => setData('conditions', e.target.value)}
                            rows={4}
                            placeholder={'e.g. {"amount_gt": 10000}'}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {errors.conditions && (
                            <p className="mt-1 text-xs text-red-600">{errors.conditions}</p>
                        )}
                        <p className="mt-1 text-xs text-slate-400">
                            Optional JSON object to filter when the rule fires.
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <a
                            href="/notification-rules"
                            className="text-sm text-slate-600 hover:text-slate-800"
                        >
                            Cancel
                        </a>
                        <Button type="submit" variant="primary" size="sm" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Rule'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
