import type { SalesOrderStatus } from '@/types/finance';

const COLORS: Record<SalesOrderStatus, string> = {
    draft:     'bg-slate-100 text-slate-600',
    confirmed: 'bg-blue-100 text-blue-700',
    fulfilled: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
};

export function SalesOrderStatusBadge({ status }: { status: SalesOrderStatus }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${COLORS[status] ?? 'bg-slate-100 text-slate-600'}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}
