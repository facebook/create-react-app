import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { Table } from '@/Components/Common/Table';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { LoyaltyProgram, LoyaltyEnrollment } from '@/types/finance';
import type { Paginator } from '@/types/inventory';

interface Props extends PageProps {
    loyaltyProgram: LoyaltyProgram;
    enrollments: Paginator<LoyaltyEnrollment>;
    contacts: Array<{ id: number; name: string }>;
}

export default function LoyaltyShow({ loyaltyProgram, enrollments, contacts }: Props) {
    const { can } = usePermission();

    const enrollForm = useForm({ contact_id: '' });
    const earnForm = useForm({ enrollment_id: '', points: '', description: '' });
    const redeemForm = useForm({ enrollment_id: '', points: '' });

    function submitEnroll(e: React.FormEvent) {
        e.preventDefault();
        enrollForm.post(`/finance/loyalty-programs/${loyaltyProgram.id}/enroll`);
    }

    function submitEarn(e: React.FormEvent) {
        e.preventDefault();
        earnForm.post(`/finance/loyalty-programs/${loyaltyProgram.id}/earn-points`);
    }

    function submitRedeem(e: React.FormEvent) {
        e.preventDefault();
        redeemForm.post(`/finance/loyalty-programs/${loyaltyProgram.id}/redeem-points`);
    }

    function deleteProgram() {
        if (confirm('Delete this loyalty program?')) {
            router.delete(`/finance/loyalty-programs/${loyaltyProgram.id}`);
        }
    }

    return (
        <AppLayout>
            <Head title={loyaltyProgram.name} />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/finance/loyalty-programs" className="text-sm text-blue-600 hover:underline">
                            ← Loyalty Programs
                        </Link>
                        <h1 className="mt-1 text-2xl font-semibold text-slate-800">{loyaltyProgram.name}</h1>
                    </div>
                    {can('finance.delete') && (
                        <Button variant="destructive" onClick={deleteProgram}>
                            Delete
                        </Button>
                    )}
                </div>

                {/* Program details */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-medium text-slate-800">Program Details</h2>
                    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Points per $1</dt>
                            <dd className="mt-1 text-sm text-slate-900">{loyaltyProgram.points_per_currency_unit}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Redemption Rate</dt>
                            <dd className="mt-1 text-sm text-slate-900">{loyaltyProgram.points_to_currency_rate}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Min Redemption Points</dt>
                            <dd className="mt-1 text-sm text-slate-900">{loyaltyProgram.minimum_redemption_points}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Status</dt>
                            <dd className="mt-1">
                                <span
                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                        loyaltyProgram.is_active
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-slate-100 text-slate-700'
                                    }`}
                                >
                                    {loyaltyProgram.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </dd>
                        </div>
                        {loyaltyProgram.description && (
                            <div className="col-span-2">
                                <dt className="text-sm font-medium text-slate-500">Description</dt>
                                <dd className="mt-1 text-sm text-slate-900">{loyaltyProgram.description}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                {/* Enrollments */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-4">
                        <h2 className="text-lg font-medium text-slate-800">Enrollments</h2>
                    </div>
                    <Table>
                        <Table.Head>
                            <Table.Row>
                                <Table.Th>Contact</Table.Th>
                                <Table.Th>Points Balance</Table.Th>
                                <Table.Th>Tier</Table.Th>
                                <Table.Th>Total Earned</Table.Th>
                                <Table.Th>Total Redeemed</Table.Th>
                            </Table.Row>
                        </Table.Head>
                        <Table.Body>
                            {enrollments.data.map((enrollment) => (
                                <Table.Row key={enrollment.id}>
                                    <Table.Td>{enrollment.contact?.name ?? `Contact #${enrollment.contact_id}`}</Table.Td>
                                    <Table.Td>{enrollment.points_balance}</Table.Td>
                                    <Table.Td>{enrollment.tier_name ?? '—'}</Table.Td>
                                    <Table.Td>{enrollment.total_points_earned}</Table.Td>
                                    <Table.Td>{enrollment.total_points_redeemed}</Table.Td>
                                </Table.Row>
                            ))}
                            {enrollments.data.length === 0 && (
                                <Table.Row>
                                    <Table.Td colSpan={5} className="py-8 text-center text-slate-500">
                                        No enrollments yet.
                                    </Table.Td>
                                </Table.Row>
                            )}
                        </Table.Body>
                    </Table>
                    <div className="px-6 py-4">
                        <Pagination links={enrollments.links} />
                    </div>
                </div>

                {can('finance.create') && (
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Enroll customer */}
                        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-medium text-slate-800">Enroll Customer</h2>
                            <form onSubmit={submitEnroll} className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Contact</label>
                                    <select
                                        value={enrollForm.data.contact_id}
                                        onChange={(e) => enrollForm.setData('contact_id', e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select contact…</option>
                                        {contacts.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                    {enrollForm.errors.contact_id && (
                                        <p className="mt-1 text-xs text-red-600">{enrollForm.errors.contact_id}</p>
                                    )}
                                </div>
                                <Button type="submit" disabled={enrollForm.processing}>
                                    Enroll
                                </Button>
                            </form>
                        </div>

                        {/* Earn points */}
                        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-medium text-slate-800">Earn Points</h2>
                            <form onSubmit={submitEarn} className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Enrollment</label>
                                    <select
                                        value={earnForm.data.enrollment_id}
                                        onChange={(e) => earnForm.setData('enrollment_id', e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select enrollment…</option>
                                        {enrollments.data.map((en) => (
                                            <option key={en.id} value={en.id}>
                                                {en.contact?.name ?? `#${en.id}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Points</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={earnForm.data.points}
                                        onChange={(e) => earnForm.setData('points', e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Description</label>
                                    <input
                                        type="text"
                                        value={earnForm.data.description}
                                        onChange={(e) => earnForm.setData('description', e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <Button type="submit" disabled={earnForm.processing}>
                                    Earn Points
                                </Button>
                            </form>
                        </div>

                        {/* Redeem points */}
                        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-medium text-slate-800">Redeem Points</h2>
                            <form onSubmit={submitRedeem} className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Enrollment</label>
                                    <select
                                        value={redeemForm.data.enrollment_id}
                                        onChange={(e) => redeemForm.setData('enrollment_id', e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select enrollment…</option>
                                        {enrollments.data.map((en) => (
                                            <option key={en.id} value={en.id}>
                                                {en.contact?.name ?? `#${en.id}`} ({en.points_balance} pts)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Points</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={redeemForm.data.points}
                                        onChange={(e) => redeemForm.setData('points', e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <Button type="submit" disabled={redeemForm.processing}>
                                    Redeem Points
                                </Button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
