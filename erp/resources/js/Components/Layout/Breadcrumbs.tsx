import { Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import type { PageProps, Breadcrumb } from '@/types';

export function Breadcrumbs() {
    const { breadcrumbs = [] } = usePage<PageProps>().props;

    if (breadcrumbs.length === 0) return null;

    return (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
            {breadcrumbs.map((crumb: Breadcrumb, index: number) => {
                const isLast = index === breadcrumbs.length - 1;

                return (
                    <span key={index} className="flex items-center gap-1.5">
                        {index > 0 && (
                            <svg
                                className="h-4 w-4 text-slate-400"
                                viewBox="0 0 16 16"
                                fill="currentColor"
                            >
                                <path d="M6.22 4.22a.75.75 0 011.06 0l3.25 3.25a.75.75 0 010 1.06L7.28 11.78a.75.75 0 01-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 010-1.06z" />
                            </svg>
                        )}
                        {isLast || !crumb.href ? (
                            <span
                                className={
                                    isLast
                                        ? 'font-medium text-slate-900'
                                        : 'text-slate-500'
                                }
                                aria-current={isLast ? 'page' : undefined}
                            >
                                {crumb.label}
                            </span>
                        ) : (
                            <Link
                                href={crumb.href}
                                className="text-slate-500 hover:text-slate-700 hover:underline"
                            >
                                {crumb.label}
                            </Link>
                        )}
                    </span>
                );
            })}
        </nav>
    );
}
