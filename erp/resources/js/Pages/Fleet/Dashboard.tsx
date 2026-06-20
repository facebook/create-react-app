import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Stats {
    totalVehicles: number;
    activeVehicles: number;
    inService: number;
    monthlyFuelCost: number;
    expiringInsurance: number;
    upcomingMaintenances: number;
}

interface FuelLogEntry {
    id: number;
    log_date: string;
    liters: number;
    total_cost: number;
    vehicle: { id: number; name: string } | null;
    driver: { id: number; name: string } | null;
}

interface Props extends PageProps {
    stats: Stats;
    recentFuelLogs: FuelLogEntry[];
}

export default function FleetDashboard({ stats, recentFuelLogs }: Props) {
    const kpis = [
        { label: 'Total Vehicles',    value: stats.totalVehicles,   color: 'text-slate-700' },
        { label: 'Active',            value: stats.activeVehicles,  color: 'text-green-600' },
        { label: 'In Service',        value: stats.inService,       color: 'text-yellow-600' },
        { label: 'Monthly Fuel Cost', value: `$${stats.monthlyFuelCost.toFixed(2)}`, color: 'text-indigo-600' },
    ];

    return (
        <AppLayout>
            <Head title="Fleet Dashboard" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Fleet Dashboard</h1>
                    <Link href="/fleet/vehicles/create"><Button>Add Vehicle</Button></Link>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {kpis.map((kpi) => (
                        <div key={kpi.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs font-medium uppercase text-slate-500">{kpi.label}</p>
                            <p className={`mt-2 text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                        </div>
                    ))}
                </div>

                {/* Alert Row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {stats.expiringInsurance > 0 && (
                        <div className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
                            <svg className="h-6 w-6 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                            <div>
                                <p className="text-sm font-semibold text-orange-800">Insurance Expiring Soon</p>
                                <p className="text-sm text-orange-700">{stats.expiringInsurance} vehicle{stats.expiringInsurance !== 1 ? 's' : ''} within 30 days</p>
                            </div>
                        </div>
                    )}
                    {stats.upcomingMaintenances > 0 && (
                        <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                            <svg className="h-6 w-6 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l5.654-4.654m5.546-4.046l1.583-2.398M11.42 15.17L8.686 9.386a2.548 2.548 0 00-3.587-.1L2.25 12" />
                            </svg>
                            <div>
                                <p className="text-sm font-semibold text-blue-800">Upcoming Maintenances</p>
                                <p className="text-sm text-blue-700">{stats.upcomingMaintenances} scheduled within 30 days</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Recent Fuel Logs */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                        <h2 className="text-base font-semibold text-slate-800">Recent Fuel Logs</h2>
                        <Link href="/fleet/fuel-logs" className="text-sm text-indigo-600 hover:text-indigo-800">View all</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Vehicle</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Date</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Liters</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Total Cost</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Driver</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentFuelLogs.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">No fuel logs yet</td>
                                    </tr>
                                )}
                                {recentFuelLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                            {log.vehicle ? (
                                                <Link href={`/fleet/vehicles/${log.vehicle.id}`} className="text-indigo-600 hover:text-indigo-800">
                                                    {log.vehicle.name}
                                                </Link>
                                            ) : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{log.log_date}</td>
                                        <td className="px-4 py-3 text-right text-sm text-slate-700">{log.liters.toFixed(2)} L</td>
                                        <td className="px-4 py-3 text-right text-sm font-medium text-slate-900">${log.total_cost.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{log.driver?.name ?? '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick links */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Link href="/fleet/vehicles" className="rounded-lg border border-slate-200 bg-white p-4 text-center shadow-sm hover:bg-slate-50 transition-colors">
                        <p className="text-sm font-medium text-slate-700">Vehicles</p>
                    </Link>
                    <Link href="/fleet/fuel-logs" className="rounded-lg border border-slate-200 bg-white p-4 text-center shadow-sm hover:bg-slate-50 transition-colors">
                        <p className="text-sm font-medium text-slate-700">Fuel Logs</p>
                    </Link>
                    <Link href="/fleet/maintenances" className="rounded-lg border border-slate-200 bg-white p-4 text-center shadow-sm hover:bg-slate-50 transition-colors">
                        <p className="text-sm font-medium text-slate-700">Maintenances</p>
                    </Link>
                    <Link href="/fleet/vehicles/create" className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 text-center shadow-sm hover:bg-indigo-100 transition-colors">
                        <p className="text-sm font-medium text-indigo-700">Add Vehicle</p>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
