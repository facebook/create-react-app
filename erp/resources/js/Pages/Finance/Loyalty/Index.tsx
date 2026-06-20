import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { LoyaltyProgram } from '@/types/finance';
import type { Paginator } from '@/types/inventory';

interface Props extends PageProps {
    loyaltyPrograms: Paginator<LoyaltyProgram>;
}

export default function LoyaltyIndex({ loyaltyPrograms }: Props) {
    const { can } = usePermission();

    return (
        <AppLayout>
            <Head title="Loyalty Programs" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-800">Loyalty Programs</h1>
                    {can('finance.create') && (
                        <Link href="/finance/loyalty-programs/create">
                            <Button>New Program</Button>
                        </Link>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table>
                        <Table.Head>
                            <Table.Row>
                                <Table.Th>Name</Table.Th>
                                <Table.Th>Points per $</Table.Th>
                                <Table.Th>Redemption Rate</Table.Th>
                                <Table.Th>Min Points</Table.Th>
                                <Table.Th>Active</Table.Th>
                                <Table.Th>Enrollments</Table.Th>
                                <Table.Th></Table.Th>
                            </Table.Row>
                        </Table.Head>
                        <Table.Body>
                            {loyaltyPrograms.data.map((program) => (
                                <Table.Row key={program.id}>
                                    <Table.Td className="font-medium">{program.name}</Table.Td>
                                    <Table.Td>{program.points_per_currency_unit}</Table.Td>
                                    <Table.Td>{program.points_to_currency_rate}</Table.Td>
                                    <Table.Td>{program.minimum_redemption_points}</Table.Td>
                                    <Table.Td>
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                program.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-slate-100 text-slate-700'
                                            }`}
                                        >
                                            {program.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </Table.Td>
                                    <Table.Td>{program.enrollments_count ?? 0}</Table.Td>
                                    <Table.Td>
                                        <Link
                                            href={`/finance/loyalty-programs/${program.id}`}
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            View
                                        </Link>
                                    </Table.Td>
                                </Table.Row>
                            ))}
                            {loyaltyPrograms.data.length === 0 && (
                                <Table.Row>
                                    <Table.Td colSpan={7} className="py-8 text-center text-slate-500">
                                        No loyalty programs found.
                                    </Table.Td>
                                </Table.Row>
                            )}
                        </Table.Body>
                    </Table>
                </div>

                <Pagination links={loyaltyPrograms.links} />
            </div>
        </AppLayout>
    );
}
