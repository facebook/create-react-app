import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface User {
    id: number;
    name: string;
}

interface Station {
    id: number;
    name: string;
    location: string | null;
}

interface ExpectedVisitor {
    id: number;
    visitor_name: string;
    visitor_company: string | null;
    host: User | null;
    expected_at: string | null;
    station: Station | null;
}

interface Props extends PageProps {
    stations: Station[];
    expectedToday: ExpectedVisitor[];
    users: User[];
}

export default function CheckIn({ stations, expectedToday, users }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        visitor_name: '',
        visitor_email: '',
        visitor_phone: '',
        visitor_company: '',
        visit_purpose: '',
        host_employee_id: '',
        station_id: '',
        expected_at: '',
        badge_number: '',
    });

    const handleCheckIn = (e: React.FormEvent) => {
        e.preventDefault();
        post('/frontdesk/check-in', { onSuccess: () => reset() });
    };

    const handlePreRegister = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/frontdesk/pre-register', data as Record<string, string>, {
            onSuccess: () => reset(),
        });
    };

    const handleQuickCheckIn = (visitorId: number) => {
        router.post(`/frontdesk/visitors/${visitorId}/check-out`);
    };

    return (
        <AppLayout>
            <Head title="Check In Visitor" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Welcome!</h1>
                    <p className="text-gray-500 mt-2">Please fill in your details to check in.</p>
                </div>

                {/* Check-In Form */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Visitor Information</h2>
                    <form onSubmit={handleCheckIn} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.visitor_name}
                                    onChange={(e) => setData('visitor_name', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="John Smith"
                                />
                                {errors.visitor_name && <p className="text-red-500 text-xs mt-1">{errors.visitor_name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={data.visitor_email}
                                    onChange={(e) => setData('visitor_email', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="john@company.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={data.visitor_phone}
                                    onChange={(e) => setData('visitor_phone', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="+1 555 000 0000"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                                <input
                                    type="text"
                                    value={data.visitor_company}
                                    onChange={(e) => setData('visitor_company', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Acme Corp"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Visit Purpose</label>
                                <input
                                    type="text"
                                    value={data.visit_purpose}
                                    onChange={(e) => setData('visit_purpose', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Meeting, Interview, Delivery..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Host Employee</label>
                                <select
                                    value={data.host_employee_id}
                                    onChange={(e) => setData('host_employee_id', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select host...</option>
                                    {users.map((u) => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Station</label>
                                <select
                                    value={data.station_id}
                                    onChange={(e) => setData('station_id', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select station...</option>
                                    {stations.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}{s.location ? ` (${s.location})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Time</label>
                                <input
                                    type="datetime-local"
                                    value={data.expected_at}
                                    onChange={(e) => setData('expected_at', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 py-3 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition"
                            >
                                Check In Now
                            </button>
                            <button
                                type="button"
                                disabled={processing}
                                onClick={handlePreRegister}
                                className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
                            >
                                Pre-Register
                            </button>
                        </div>
                    </form>
                </div>

                {/* Expected Visitors Today */}
                {expectedToday.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Expected Today</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visitor</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Host</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected At</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {expectedToday.map((v) => (
                                        <tr key={v.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900">{v.visitor_name}</div>
                                                {v.visitor_company && <div className="text-xs text-gray-400">{v.visitor_company}</div>}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{v.host?.name ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {v.expected_at
                                                    ? new Date(v.expected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                    : '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => router.post(`/frontdesk/visitors/${v.id}/check-out`)}
                                                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition"
                                                >
                                                    Quick Check In
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
