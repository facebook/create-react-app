import type { PurchaseOrder } from '@/types/inventory';

type Status = PurchaseOrder['status'];

const config: Record<Status, { label: string; className: string }> = {
    draft:      { label: 'Draft',      className: 'bg-slate-100 text-slate-700' },
    submitted:  { label: 'Submitted',  className: 'bg-blue-100 text-blue-700' },
    approved:   { label: 'Approved',   className: 'bg-indigo-100 text-indigo-700' },
    received:   { label: 'Received',   className: 'bg-green-100 text-green-700' },
    cancelled:  { label: 'Cancelled',  className: 'bg-red-100 text-red-700' },
};

export function PurchaseOrderStatusBadge({ status }: { status: Status }) {
    const { label, className } = config[status] ?? config.draft;
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
            {label}
        </span>
    );
}
