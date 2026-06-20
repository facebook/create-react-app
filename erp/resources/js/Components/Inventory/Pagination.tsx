import { Link } from '@inertiajs/react';
import type { Paginator } from '@/types/inventory';

interface Props<T> {
    paginator: Paginator<T>;
    preserveScroll?: boolean;
}

export function Pagination<T>({ paginator, preserveScroll = true }: Props<T>) {
    const { current_page, last_page, from, to, total, prev_page_url, next_page_url } = paginator;

    if (last_page <= 1) return null;

    return (
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3">
            <p className="text-sm text-slate-600">
                Showing <span className="font-medium">{from}</span>–<span className="font-medium">{to}</span> of{' '}
                <span className="font-medium">{total}</span> results
            </p>
            <div className="flex gap-1">
                {prev_page_url ? (
                    <Link
                        href={prev_page_url}
                        preserveScroll={preserveScroll}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        Previous
                    </Link>
                ) : (
                    <span className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-300 cursor-default">
                        Previous
                    </span>
                )}
                <span className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600">
                    {current_page} / {last_page}
                </span>
                {next_page_url ? (
                    <Link
                        href={next_page_url}
                        preserveScroll={preserveScroll}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        Next
                    </Link>
                ) : (
                    <span className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-300 cursor-default">
                        Next
                    </span>
                )}
            </div>
        </div>
    );
}
