import { Head, Link } from '@inertiajs/react';

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
            <Head title="404 – Page Not Found" />
            <div className="text-center">
                <p className="text-6xl font-bold text-indigo-600">404</p>
                <h1 className="mt-4 text-3xl font-bold text-slate-900">Page not found</h1>
                <p className="mt-2 text-slate-500">
                    Sorry, we couldn't find the page you're looking for.
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
