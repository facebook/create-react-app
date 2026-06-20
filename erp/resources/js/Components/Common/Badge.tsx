import { ReactNode } from 'react';

type BadgeColor =
    | 'gray'
    | 'red'
    | 'yellow'
    | 'green'
    | 'blue'
    | 'indigo'
    | 'purple'
    | 'pink';

interface BadgeProps {
    color?: BadgeColor;
    children: ReactNode;
    className?: string;
}

const colorClasses: Record<BadgeColor, string> = {
    gray:   'bg-slate-100 text-slate-700',
    red:    'bg-red-100 text-red-700',
    yellow: 'bg-yellow-100 text-yellow-800',
    green:  'bg-green-100 text-green-700',
    blue:   'bg-blue-100 text-blue-700',
    indigo: 'bg-indigo-100 text-indigo-700',
    purple: 'bg-purple-100 text-purple-700',
    pink:   'bg-pink-100 text-pink-700',
};

export function Badge({ color = 'gray', children, className = '' }: BadgeProps) {
    return (
        <span
            className={[
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                colorClasses[color],
                className,
            ].join(' ')}
        >
            {children}
        </span>
    );
}
