import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { ExpenseClaim } from '@/types/finance';
import type { Paginator } from '@/types/inventory';

interface Props extends PageProps {
    claims: Paginator<ExpenseClaim>;
    filters: { status?: string };
}

const statusColors: Record<string, string> = {
    draft:     'bg-gray-100 text-gray-600',
    submitted: 'bg-blue-100 text-blue-700',
    approved:  'bg-green-100 text-green-700',
    rejected:  'bg-red-100 text-red-700',
    paid:      'bg-purple-100 text-purple-700',
};

const STATUSES = ['draft', 'submitted', 'approved', 'rejected', 'paid'];

interface ClaimWithUser extends ExpenseClaim {
    submitted_by_user?: { id: number; name: string };
}

export default function ExpenseClaimsIndex({ claims, filters }: Props) {
    const { can } = usePermission();

    function applyFilter(value: string) {
        router.get('/finance/expense-claims', { status: value || undefined }, { preserveState: true });
    }

    return (
        <AppLayout>
            <Head title="Expense Claims" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-800">Expense Claims</h1>
                    {can('finance.create') && (
                        <Link href="/finance/expense-claims/create">
                            <Button>New Expense Claim</Button>
                        </Link>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={filters.status ?? ''}
                        onChange={(e) => applyFilter(e.target.value)}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Statuses</option>
                        {STATUSES.map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                    </select>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table>
                        <Table.Head>
                            <Table.Row>
                                <Table.Th>Reference</Table.Th>
                                <Table.Th>Submitted By</Table.Th>
                                <Table.Th>Date</Table.Th>
                                <Table.Th>Status</Table.Th>
                                <Table.Th>Total</Table.Th>
                                <Table.Th></Table.Th>
                            </Table.Row>
                        </Table.Head>
                        <Table.Body>
                            {(claims.data as ClaimWithUser[]).map((claim) => (
                                <Table.Row key={claim.id}>
                                    <Table.Td className="font-mono text-sm font-medium">{claim.reference}</Table.Td>
                                    <Table.Td>{claim.submitted_by_user?.name ?? claim.submitted_by}</Table.Td>
                                    <Table.Td>{new Date(claim.claim_date).toLocaleDateString()}</Table.Td>
                                    <Table.Td>
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[claim.status] ?? ''}`}>
                                            {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                                        </span>
                                    </Table.Td>
                                    <Table.Td className="text-right font-medium">
                                        {claim.currency} {Number(claim.total_amount).toFixed(2)}
                                    </Table.Td>
                                    <Table.Td>
                                        <Link
                                            href={`/finance/expense-claims/${claim.id}`}
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            View
                                        </Link>
                                    </Table.Td>
                                </Table.Row>
                            ))}
                            {claims.data.length === 0 && (
                                <Table.Row>
                                    <Table.Td colSpan={6} className="py-8 text-center text-slate-500">
                                        No expense claims found.
                                    </Table.Td>
                                </Table.Row>
                            )}
                        </Table.Body>
                    </Table>
                </div>

                <Pagination links={claims.links} />
            </div>
        </AppLayout>
    );
}
