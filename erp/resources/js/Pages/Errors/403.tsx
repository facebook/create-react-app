import { Head, Link } from '@inertiajs/react';

export default function Forbidden() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
            <Head title="403 – Forbidden" />
            <div className="text-center">
                <p className="text-6xl font-bold text-red-500">403</p>
                <h1 className="mt-4 text-3xl font-bold text-slate-900">Access denied</h1>
                <p className="mt-2 text-slate-500">
                    You don't have permission to view this page.
                </p>
                <Link
                    href="/dashboard"
                    className="mt-6 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
