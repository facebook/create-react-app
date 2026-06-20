import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Agreement {
    id?: number;
    start_date: string;
    end_date: string | null;
    status: string;
}

interface RentalItem {
    id: number;
    name: string;
    agreements: Agreement[];
}

interface Props extends PageProps {
    items: RentalItem[];
}

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function daysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
}

function isDateInRange(dateStr: string, startStr: string, endStr: string | null): boolean {
    const date = new Date(dateStr);
    const start = new Date(startStr);
    // Strip time component
    date.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);

    if (date < start) return false;

    if (endStr) {
        const end = new Date(endStr);
        end.setHours(0, 0, 0, 0);
        return date <= end;
    }

    return true;
}

interface DayBadge {
    itemId: number;
    itemName: string;
    status: string;
}

const STATUS_COLORS: Record<string, string> = {
    active:    'bg-blue-500 text-white',
    overdue:   'bg-red-500 text-white',
    returned:  'bg-slate-400 text-white',
    cancelled: 'bg-slate-300 text-slate-700',
};

export default function RentalCalendar({ items }: Props) {
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());

    function prevMonth() {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear((y) => y - 1);
        } else {
            setCurrentMonth((m) => m - 1);
        }
    }

    function nextMonth() {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear((y) => y + 1);
        } else {
            setCurrentMonth((m) => m + 1);
        }
    }

    const totalDays = daysInMonth(currentYear, currentMonth);
    const firstDay = firstDayOfMonth(currentYear, currentMonth);

    // Build calendar grid: array of 6 weeks × 7 days
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    function getBadgesForDay(day: number): DayBadge[] {
        const monthPad = String(currentMonth + 1).padStart(2, '0');
        const dayPad = String(day).padStart(2, '0');
        const dateStr = `${currentYear}-${monthPad}-${dayPad}`;

        const badges: DayBadge[] = [];
        for (const item of items) {
            for (const ag of item.agreements) {
                if (isDateInRange(dateStr, ag.start_date, ag.end_date)) {
                    badges.push({
                        itemId: item.id,
                        itemName: item.name,
                        status: ag.status,
                    });
                }
            }
        }
        return badges;
    }

    const todayDay = today.getFullYear() === currentYear && today.getMonth() === currentMonth
        ? today.getDate()
        : null;

    return (
        <AppLayout>
            <Head title="Rental Calendar" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Rental Calendar</h1>
                        <p className="text-sm text-slate-500 mt-1">Active rentals by day</p>
                    </div>
                    <a
                        href="/rental/items"
                        className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        Back to Items
                    </a>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    {/* Month navigation header */}
                    <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                        <button
                            onClick={prevMonth}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                            aria-label="Previous month"
                        >
                            &larr; Prev
                        </button>
                        <h2 className="text-base font-semibold text-slate-800">
                            {MONTH_NAMES[currentMonth]} {currentYear}
                        </h2>
                        <button
                            onClick={nextMonth}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                            aria-label="Next month"
                        >
                            Next &rarr;
                        </button>
                    </div>

                    {/* Day-of-week headers */}
                    <div className="grid grid-cols-7 border-b border-slate-200">
                        {DAY_NAMES.map((name) => (
                            <div
                                key={name}
                                className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider text-slate-500"
                            >
                                {name}
                            </div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7">
                        {cells.map((day, idx) => {
                            const badges = day ? getBadgesForDay(day) : [];
                            const isToday = day === todayDay;

                            return (
                                <div
                                    key={idx}
                                    className={[
                                        'min-h-[80px] border-b border-r border-slate-100 p-1.5',
                                        day ? 'bg-white' : 'bg-slate-50',
                                        idx % 7 === 6 ? 'border-r-0' : '',
                                    ].join(' ')}
                                >
                                    {day && (
                                        <>
                                            <span
                                                className={[
                                                    'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                                                    isToday
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'text-slate-600',
                                                ].join(' ')}
                                            >
                                                {day}
                                            </span>
                                            <div className="mt-1 space-y-0.5">
                                                {badges.slice(0, 3).map((badge, bi) => (
                                                    <div
                                                        key={`${badge.itemId}-${bi}`}
                                                        title={`${badge.itemName} (${badge.status})`}
                                                        className={[
                                                            'truncate rounded px-1 py-0.5 text-xs leading-tight',
                                                            STATUS_COLORS[badge.status] ?? 'bg-slate-200 text-slate-700',
                                                        ].join(' ')}
                                                    >
                                                        {badge.itemName}
                                                    </div>
                                                ))}
                                                {badges.length > 3 && (
                                                    <div className="text-xs text-slate-400">
                                                        +{badges.length - 3} more
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-3">
                    {Object.entries(STATUS_COLORS).map(([status, cls]) => (
                        <div key={status} className="flex items-center gap-1.5">
                            <span className={`inline-block h-3 w-3 rounded ${cls}`} />
                            <span className="text-xs text-slate-600 capitalize">{status}</span>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
