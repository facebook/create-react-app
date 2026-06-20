import React, { FormEvent, useState } from 'react';
import { router } from '@inertiajs/react';

export default function Create() {
    const [department, setDepartment] = useState('');
    const [period, setPeriod] = useState('');
    const [allocatedAmount, setAllocatedAmount] = useState('');
    const [category, setCategory] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [notes, setNotes] = useState('');

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        router.post('/finance/expense-budgets', {
            department,
            period,
            allocated_amount: allocatedAmount,
            category,
            currency,
            notes,
        });
    }

    return (
        <div>
            <h1>Create Expense Budget</h1>
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
                        placeholder="e.g. 2026-Q1"
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
                    <label>Notes</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>
                <button type="submit">Create</button>
            </form>
        </div>
    );
}
