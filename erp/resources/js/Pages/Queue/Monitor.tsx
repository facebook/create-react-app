import React from 'react';
import { router } from '@inertiajs/react';

interface QueueCount {
    queue: string;
    count: number;
}

interface FailedJob {
    id: number;
    uuid: string;
    connection: string;
    queue: string;
    payload: string;
    exception: string;
    failed_at: string;
}

interface Props {
    pending: number;
    failed: number;
    byQueue: QueueCount[];
    recentFailed: FailedJob[];
}

export default function QueueMonitor({ pending, failed, byQueue, recentFailed }: Props) {
    const retryJob = (uuid: string) => {
        router.post(`/queue/failed/${uuid}/retry`);
    };

    const clearAllFailed = () => {
        if (confirm('Are you sure you want to clear all failed jobs? This cannot be undone.')) {
            router.delete('/queue/failed');
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Queue Monitor</h1>
                <p className="text-sm text-gray-500 mt-1">Monitor background job queues and failed jobs.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 text-xl font-bold">{pending}</span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Pending Jobs</p>
                        <p className="text-2xl font-bold text-gray-800">{pending}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-red-600 text-xl font-bold">{failed}</span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Failed Jobs</p>
                        <p className="text-2xl font-bold text-gray-800">{failed}</p>
                    </div>
                </div>
            </div>

            {/* Queue Breakdown */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-800">Queue Breakdown</h2>
                </div>
                {byQueue.length === 0 ? (
                    <div className="px-6 py-8 text-center text-gray-400 text-sm">
                        No pending jobs in any queue.
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3 text-left font-medium">Queue</th>
                                <th className="px-6 py-3 text-right font-medium">Pending Count</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {byQueue.map((item) => (
                                <tr key={item.queue} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-3 font-medium text-gray-800">
                                        <span className="inline-block px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                                            {item.queue}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-right text-gray-600">{item.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Failed Jobs */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-800">Recent Failed Jobs</h2>
                    {recentFailed.length > 0 && (
                        <button
                            onClick={clearAllFailed}
                            className="text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                            Clear All Failed
                        </button>
                    )}
                </div>
                {recentFailed.length === 0 ? (
                    <div className="px-6 py-8 text-center text-gray-400 text-sm">
                        No failed jobs. Everything is running smoothly.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3 text-left font-medium">UUID</th>
                                    <th className="px-6 py-3 text-left font-medium">Connection</th>
                                    <th className="px-6 py-3 text-left font-medium">Queue</th>
                                    <th className="px-6 py-3 text-left font-medium">Failed At</th>
                                    <th className="px-6 py-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentFailed.map((job) => (
                                    <tr key={job.uuid} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-3 font-mono text-xs text-gray-600 max-w-xs truncate">
                                            {job.uuid}
                                        </td>
                                        <td className="px-6 py-3 text-gray-600">{job.connection}</td>
                                        <td className="px-6 py-3">
                                            <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                                                {job.queue}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-gray-500 text-xs whitespace-nowrap">
                                            {job.failed_at}
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <button
                                                onClick={() => retryJob(job.uuid)}
                                                className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                                            >
                                                Retry
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
