import type { PayrollStatus } from '@/types/hr';

const map: Record<PayrollStatus, string> = {
    draft:     'bg-slate-100 text-slate-600',
    processed: 'bg-blue-100 text-blue-700',
    paid:      'bg-green-100 text-green-700',
};

export function PayrollStatusBadge({ status }: { status: PayrollStatus }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${map[status] ?? 'bg-slate-100 text-slate-500'}`}>
            {status}
        </span>
    );
}
