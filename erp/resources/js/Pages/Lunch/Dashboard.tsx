import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Stats {
    today_orders: number;
    pending_count: number;
    confirmed_count: number;
    delivered_count: number;
    total_spend_today: number;
}

interface Props extends PageProps {
    stats: Stats;
}

export default function LunchDashboard({ stats }: Props) {
    return (
        <AppLayout>
            <Head title="Lunch Dashboard" />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Lunch Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500">Today's lunch overview</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center">
                        <span className="text-4xl font-bold text-blue-600">{stats.today_orders}</span>
                        <span className="mt-2 text-sm text-gray-500 text-center">Today's Orders</span>
                    </div>
                    <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center">
                        <span className="text-4xl font-bold text-yellow-500">{stats.pending_count}</span>
                        <span className="mt-2 text-sm text-gray-500 text-center">Pending</span>
                    </div>
                    <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center">
                        <span className="text-4xl font-bold text-indigo-600">{stats.confirmed_count}</span>
                        <span className="mt-2 text-sm text-gray-500 text-center">Confirmed</span>
                    </div>
                    <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center">
                        <span className="text-4xl font-bold text-green-600">{stats.delivered_count}</span>
                        <span className="mt-2 text-sm text-gray-500 text-center">Delivered</span>
                    </div>
                    <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center">
                        <span className="text-4xl font-bold text-purple-600">
                            ${stats.total_spend_today.toFixed(2)}
                        </span>
                        <span className="mt-2 text-sm text-gray-500 text-center">Total Spend Today</span>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
