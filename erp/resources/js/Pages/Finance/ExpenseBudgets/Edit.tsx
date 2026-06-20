import React, { FormEvent, useState } from 'react';
import { router } from '@inertiajs/react';

interface ExpenseBudget {
    id: number;
    department: string;
    period: string;
    allocated_amount: string;
    currency: string;
    category: string | null;
    notes: string | null;
    status: string;
    budget_code: string | null;
}

interface Props {
    expenseBudget: ExpenseBudget;
}

export default function Edit({ expenseBudget }: Props) {
    const [department, setDepartment] = useState(expenseBudget.department);
    const [period, setPeriod] = useState(expenseBudget.period);
    const [allocatedAmount, setAllocatedAmount] = useState(expenseBudget.allocated_amount);
    const [category, setCategory] = useState(expenseBudget.category ?? '');
    const [currency, setCurrency] = useState(expenseBudget.currency);
    const [notes, setNotes] = useState(expenseBudget.notes ?? '');
    const [status, setStatus] = useState(expenseBudget.status);

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        router.put(`/finance/expense-budgets/${expenseBudget.id}`, {
            department,
            period,
            allocated_amount: allocatedAmount,
            category,
            currency,
            notes,
            status,
        });
    }

    return (
        <div>
            <h1>Edit Expense Budget #{expenseBudget.id}</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Department</label>
                    <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Period</label>
                    <input
                        type="text"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Allocated Amount</label>
                    <input
                        type="number"
                        value={allocatedAmount}
                        onChange={(e) => setAllocatedAmount(e.target.value)}
                        min="0"
                    />
                </div>
                <div>
                    <label>Category</label>
                    <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    />
                </div>
                <div>
                    <label>Currency</label>
                    <input
                        type="text"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                    />
                </div>
                <div>
                    <label>Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="active">Active</option>
                        <option value="frozen">Frozen</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
                <div>
                    <label>Notes</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>
                <button type="submit">Update</button>
            </form>
        </div>
    );
}
