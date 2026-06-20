<?php
namespace App\Modules\HR\Models;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SalaryStructure extends Model
{
    use BelongsToTenant, SoftDeletes;
    protected $fillable = ['tenant_id','name','code','description','is_active'];
    protected $casts = ['is_active' => 'boolean'];

    public function rules(): HasMany { return $this->hasMany(SalaryRule::class, 'structure_id')->orderBy('sequence'); }

    public function compute(Employee $employee): array
    {
        $rules    = $this->rules()->where('is_active', true)->get();
        $computed = [];
        $lines    = [];
        foreach ($rules as $rule) {
            $amount = $this->computeRule($rule, $employee, $computed);
            $computed[$rule->code] = $amount;
            $lines[] = [
                'salary_rule_id' => $rule->id,
                'code'           => $rule->code,
                'name'           => $rule->name,
                'category'       => $rule->category,
                'sequence'       => $rule->sequence,
                'amount'         => round($amount, 2),
            ];
        }
        return $lines;
    }

    private function computeRule(SalaryRule $rule, Employee $employee, array $computed): float
    {
        return match ($rule->amount_type) {
            'fixed'               => (float) $rule->amount,
            'percentage_of_basic' => (float) $employee->salary_amount * (float) $rule->percentage / 100,
            'percentage_of_gross' => $this->sumEarnings($computed) * (float) $rule->percentage / 100,
            'percentage_of_rule'  => ($computed[$rule->base_rule_code] ?? 0) * (float) $rule->percentage / 100,
            default               => 0.0,
        };
    }

    private function sumEarnings(array $computed): float
    {
        $earningCodes = $this->rules()->where('category', 'earnings')->pluck('code');
        return (float) $earningCodes->sum(fn ($code) => $computed[$code] ?? 0);
    }
}
