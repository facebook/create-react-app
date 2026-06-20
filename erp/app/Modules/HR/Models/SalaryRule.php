<?php
namespace App\Modules\HR\Models;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalaryRule extends Model
{
    use BelongsToTenant;
    protected $fillable = ['tenant_id','structure_id','name','code','category','sequence','amount_type','amount','percentage','base_rule_code','description','is_active'];
    protected $casts = ['amount' => 'float', 'percentage' => 'float', 'is_active' => 'boolean'];
    public function structure(): BelongsTo { return $this->belongsTo(SalaryStructure::class, 'structure_id'); }
}
