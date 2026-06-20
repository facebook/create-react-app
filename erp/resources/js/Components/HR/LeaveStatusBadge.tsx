import type { LeaveStatus } from '@/types/hr';

const map: Record<LeaveStatus, string> = {
    pending:   'bg-yellow-100 text-yellow-700',
    approved:  'bg-green-100 text-green-700',
    rejected:  'bg-red-100 text-red-600',
    cancelled: 'bg-slate-100 text-slate-600',
};

export function LeaveStatusBadge({ status }: { status: LeaveStatus }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${map[status] ?? 'bg-slate-100 text-slate-500'}`}>
            {status}
        </span>
    );
}
