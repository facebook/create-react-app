<?php

namespace App\Modules\HR\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Payslip extends Model
{
    use BelongsToTenant;

    protected $table = 'payslips';

    protected $fillable = [
        'tenant_id',
        'payroll_run_id',
        'employee_id',
        'gross_amount',
        'total_deductions',
        'net_amount',
        'tax_amount',
        'notes',
    ];

    protected $casts = [
        'gross_amount'     => 'decimal:2',
        'total_deductions' => 'decimal:2',
        'net_amount'       => 'decimal:2',
        'tax_amount'       => 'decimal:2',
    ];

    public function payrollRun(): BelongsTo
    {
        return $this->belongsTo(PayrollRun::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function lines(): HasMany
    {
        return $this->hasMany(PayslipLine::class)->orderBy('sequence');
    }

    public function getEffectiveTaxRateAttribute(): float
    {
        $gross = (float) $this->gross_amount;
        if ($gross <= 0) {
            return 0.0;
        }
        return round((float) $this->tax_amount / $gross * 100, 2);
    }
}
