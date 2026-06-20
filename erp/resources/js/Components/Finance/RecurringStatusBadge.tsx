import type { RecurringStatus } from '@/types/finance';

const COLORS: Record<RecurringStatus, string> = {
    active: 'bg-green-100 text-green-700',
    paused: 'bg-amber-100 text-amber-700',
    ended:  'bg-slate-100 text-slate-600',
};

export function RecurringStatusBadge({ status }: { status: RecurringStatus }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${COLORS[status] ?? 'bg-slate-100 text-slate-600'}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}
