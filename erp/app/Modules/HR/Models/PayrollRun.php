<?php

namespace App\Modules\HR\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PayrollRun extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id', 'period_start', 'period_end', 'run_date', 'status', 'notes', 'created_by',
        'period_label', 'total_gross', 'total_deductions', 'total_net',
        'employee_count', 'processed_at', 'approved_by', 'approved_at',
    ];

    protected $casts = [
        'period_start'     => 'date',
        'period_end'       => 'date',
        'run_date'         => 'date',
        'processed_at'     => 'datetime',
        'approved_at'      => 'datetime',
        'total_gross'      => 'decimal:2',
        'total_net'        => 'decimal:2',
        'total_deductions' => 'decimal:2',
    ];

    protected $attributes = ['status' => 'draft'];

    public function items(): HasMany
    {
        return $this->hasMany(PayrollItem::class);
    }

    public function payslips(): HasMany
    {
        return $this->hasMany(Payslip::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function getTotalGrossAttribute(): float
    {
        // If items are loaded, compute from items; otherwise use stored value
        if ($this->relationLoaded('items') && $this->items->isNotEmpty()) {
            return (float) $this->items->sum('gross_salary');
        }
        return (float) ($this->attributes['total_gross'] ?? 0);
    }

    public function getTotalNetAttribute(): float
    {
        if ($this->relationLoaded('items') && $this->items->isNotEmpty()) {
            return (float) $this->items->sum('net_salary');
        }
        return (float) ($this->attributes['total_net'] ?? 0);
    }

    /**
     * Process the payroll run (legacy method).
     * Computes totals from active employees' salary_amount for this tenant.
     */
    public function process(): void
    {
        if ($this->status !== 'draft') {
            throw new \DomainException('Payroll run is already processed.');
        }

        // Compute totals from active employees for this tenant
        $employees = Employee::withoutGlobalScopes()
            ->where('tenant_id', $this->tenant_id)
            ->where('status', 'active')
            ->get();

        $totalGross = $employees->sum('salary_amount');
        $totalDeductions = 0;
        $totalNet = $totalGross - $totalDeductions;
        $employeeCount = $employees->count();

        $this->update([
            'status'           => 'processed',
            'total_gross'      => $totalGross,
            'total_deductions' => $totalDeductions,
            'total_net'        => $totalNet,
            'employee_count'   => $employeeCount,
            'processed_at'     => now(),
        ]);
    }

    /**
     * Approve the payroll run.
     */
    public function approve(int|User $user): void
    {
        $this->status      = 'approved';
        $this->approved_by = $user instanceof User ? $user->id : $user;
        $this->approved_at = now();
        $this->save();
        event(new \App\Events\HR\PayrollRunApproved($this));
    }

    /**
     * Mark the payroll run as paid.
     */
    public function markPaid(): void
    {
        $this->status = 'paid';
        $this->save();
    }

    /**
     * Recalculate totals from payslips.
     */
    public function recalculateTotals(): void
    {
        $payslips = $this->payslips()->get();
        $this->total_gross      = $payslips->sum('gross_amount');
        $this->total_deductions = $payslips->sum('total_deductions');
        $this->total_net        = $payslips->sum('net_amount');
        $this->save();
    }

    /**
     * Generate payslips for all active employees with salary_amount > 0.
     * Returns count of payslips generated.
     */
    public function generatePayslips(): int
    {
        $employees = Employee::withoutGlobalScopes()
            ->where('tenant_id', $this->tenant_id)
            ->where('status', 'active')
            ->where('salary_amount', '>', 0)
            ->with('salaryStructure.rules')
            ->get();

        $count = 0;
        foreach ($employees as $employee) {
            $gross      = (float) $employee->salary_amount;
            $lines      = [];
            $deductions = 0.0;

            if ($employee->salaryStructure) {
                $lines      = $employee->salaryStructure->compute($employee);
                $gross      = collect($lines)->where('category', 'earnings')->sum('amount');
                $deductions = collect($lines)->where('category', 'deductions')->sum('amount');
            } else {
                $tax        = round($gross * 0.10, 2);
                $deductions = $tax;
                $lines      = [
                    ['salary_rule_id' => null, 'code' => 'BASIC', 'name' => 'Basic Salary', 'category' => 'earnings',   'sequence' => 10, 'amount' => $gross],
                    ['salary_rule_id' => null, 'code' => 'TAX',   'name' => 'Income Tax',   'category' => 'deductions', 'sequence' => 20, 'amount' => $tax],
                ];
            }

            $net    = $gross - $deductions;
            $taxLine = collect($lines)->firstWhere('code', 'TAX');
            $tax    = $taxLine ? (float) $taxLine['amount'] : $deductions;

            $payslip = Payslip::updateOrCreate(
                ['payroll_run_id' => $this->id, 'employee_id' => $employee->id],
                ['tenant_id' => $this->tenant_id, 'gross_amount' => $gross, 'tax_amount' => $tax, 'total_deductions' => $deductions, 'net_amount' => $net]
            );

            $payslip->lines()->delete();
            foreach ($lines as $line) {
                $payslip->lines()->create($line);
            }
            $count++;
        }
        return $count;
    }
}
