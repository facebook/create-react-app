import { useRef, useState, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import { useAuth } from '@/Hooks/useAuth';
import { Badge } from '@/Components/Common/Badge';

export function UserDropdown() {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    const handleLogout = () => {
        router.post(route('logout'));
    };

    const primaryRole = user.roles[0] ?? 'user';

    return (
        <div ref={containerRef} className="relative">
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                aria-haspopup="true"
                aria-expanded={open}
            >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-full w-full rounded-full object-cover"
                        />
                    ) : (
                        user.initials
                    )}
                </span>
                <span className="hidden max-w-[120px] truncate font-medium text-slate-700 sm:block">
                    {user.name}
                </span>
                <svg
                    className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            {open && (
                <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                    <div className="border-b border-slate-100 px-4 py-3">
                        <p className="truncate text-sm font-semibold text-slate-900">
                            {user.name}
                        </p>
                        <p className="truncate text-xs text-slate-500">{user.email}</p>
                        <div className="mt-1">
                            <Badge color="indigo">{primaryRole}</Badge>
                        </div>
                    </div>

                    <Link
                        href={route('profile.edit')}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => setOpen(false)}
                    >
                        <svg className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.5 1.5 0 002.107 2.107l5.33-5.33a1.5 1.5 0 00-2.107-2.108l-5.33 5.331z" />
                        </svg>
                        Profile
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path
                                fillRule="evenodd"
                                d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
                                clipRule="evenodd"
                            />
                            <path
                                fillRule="evenodd"
                                d="M6 10a.75.75 0 01.75-.75h9.546l-1.048-1.077a.75.75 0 111.074-1.046l2.5 2.572a.75.75 0 010 1.046l-2.5 2.572a.75.75 0 11-1.074-1.046l1.048-1.077H6.75A.75.75 0 016 10z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Sign out
                    </button>
                </div>
            )}
        </div>
    );
}
