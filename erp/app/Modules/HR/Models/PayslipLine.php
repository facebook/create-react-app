<?php
namespace App\Modules\HR\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayslipLine extends Model
{
    protected $fillable = ['payslip_id','salary_rule_id','code','name','category','sequence','amount'];
    protected $casts = ['amount' => 'decimal:2'];
    public function payslip(): BelongsTo { return $this->belongsTo(Payslip::class); }
}
