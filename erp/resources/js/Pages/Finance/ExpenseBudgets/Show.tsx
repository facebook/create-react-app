import React from 'react';

interface ExpenseBudget {
    id: number;
    department: string;
    period: string;
    allocated_amount: string;
    spent_amount: string;
    currency: string;
    status: string;
    category: string | null;
    budget_code: string | null;
    notes: string | null;
    remaining_amount: number;
    utilization_percent: number;
    is_over_budget: boolean;
    is_active: boolean;
}

interface Props {
    expenseBudget: ExpenseBudget;
}

export default function Show({ expenseBudget }: Props) {
    return (
        <div>
            <h1>Expense Budget: {expenseBudget.budget_code ?? `#${expenseBudget.id}`}</h1>
            <dl>
                <dt>Department</dt>
                <dd>{expenseBudget.department}</dd>
                <dt>Period</dt>
                <dd>{expenseBudget.period}</dd>
                <dt>Allocated</dt>
                <dd>{expenseBudget.allocated_amount} {expenseBudget.currency}</dd>
                <dt>Spent</dt>
                <dd>{expenseBudget.spent_amount} {expenseBudget.currency}</dd>
                <dt>Remaining</dt>
                <dd>{expenseBudget.remaining_amount} {expenseBudget.currency}</dd>
                <dt>Utilization</dt>
                <dd>{expenseBudget.utilization_percent}%</dd>
                <dt>Status</dt>
                <dd>{expenseBudget.status}</dd>
                {expenseBudget.is_over_budget && <dd>Over Budget</dd>}
            </dl>
        </div>
    );
}
