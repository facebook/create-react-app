import type { BillStatus } from '@/types/finance';

const map: Record<BillStatus, string> = {
    draft:     'bg-slate-100 text-slate-600',
    received:  'bg-blue-100 text-blue-700',
    paid:      'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
};

export function BillStatusBadge({ status }: { status: BillStatus }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${map[status] ?? 'bg-slate-100 text-slate-600'}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}
