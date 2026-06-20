import type { InvoiceStatus } from '@/types/finance';

const map: Record<InvoiceStatus, string> = {
    draft:     'bg-slate-100 text-slate-600',
    sent:      'bg-blue-100 text-blue-700',
    paid:      'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${map[status] ?? 'bg-slate-100 text-slate-500'}`}>
            {status}
        </span>
    );
}
