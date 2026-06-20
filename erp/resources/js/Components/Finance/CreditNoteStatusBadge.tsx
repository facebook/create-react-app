import type { CreditNoteStatus } from '@/types/finance';

const COLORS: Record<CreditNoteStatus, string> = {
    draft:  'bg-slate-100 text-slate-600',
    issued: 'bg-blue-100 text-blue-700',
    applied: 'bg-green-100 text-green-700',
    void:   'bg-red-100 text-red-700',
};

export function CreditNoteStatusBadge({ status }: { status: CreditNoteStatus }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${COLORS[status] ?? 'bg-slate-100 text-slate-600'}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}
