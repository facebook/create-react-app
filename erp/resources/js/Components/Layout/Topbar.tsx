import { Breadcrumbs } from '@/Components/Layout/Breadcrumbs';
import { NotificationBell } from '@/Components/Layout/NotificationBell';
import { UserDropdown } from '@/Components/Layout/UserDropdown';
import GlobalSearch from '@/Components/Layout/GlobalSearch';

interface TopbarProps {
    onToggleSidebar: () => void;
    sidebarCollapsed: boolean;
}

export function Topbar({ onToggleSidebar, sidebarCollapsed }: TopbarProps) {
    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
            <div className="flex items-center gap-3">
                <button
                    onClick={onToggleSidebar}
                    aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.75}
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
                        />
                    </svg>
                </button>
                <Breadcrumbs />
            </div>

            <div className="flex items-center gap-3">
                <GlobalSearch />
                <NotificationBell />
                <UserDropdown />
            </div>
        </header>
    );
}
