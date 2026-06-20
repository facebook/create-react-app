import type { EmployeeStatus } from '@/types/hr';

const map: Record<EmployeeStatus, string> = {
    active:     'bg-green-100 text-green-700',
    on_leave:   'bg-yellow-100 text-yellow-700',
    terminated: 'bg-red-100 text-red-600',
};

export function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${map[status] ?? 'bg-slate-100 text-slate-500'}`}>
            {status.replace('_', ' ')}
        </span>
    );
}
