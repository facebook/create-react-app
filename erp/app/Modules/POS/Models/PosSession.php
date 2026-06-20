<?php

namespace App\Modules\POS\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use App\Modules\Inventory\Models\Warehouse;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PosSession extends Model
{
    use BelongsToTenant;

    protected $table = 'pos_sessions';

    protected $fillable = [
        'tenant_id',
        'name',
        'warehouse_id',
        'opened_by',
        'closed_by',
        'status',
        'opened_at',
        'closed_at',
        'opening_cash',
        'closing_cash',
        'expected_cash',
        'total_sales',
        'total_refunds',
        'notes',
    ];

    protected $casts = [
        'opened_at'     => 'datetime',
        'closed_at'     => 'datetime',
        'opening_cash'  => 'float',
        'closing_cash'  => 'float',
        'expected_cash' => 'float',
        'total_sales'   => 'float',
        'total_refunds' => 'float',
    ];

    public function openedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'opened_by');
    }

    public function closedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'closed_by');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(PosOrder::class, 'session_id');
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'warehouse_id');
    }

    public static function open(User $user, float $openingCash = 0): static
    {
        $session = static::create([
            'tenant_id'    => $user->tenant_id,
            'name'         => 'Register',
            'opened_by'    => $user->id,
            'status'       => 'open',
            'opened_at'    => now(),
            'opening_cash' => $openingCash,
        ]);

        $session->name = $session->generateName();
        $session->save();

        return $session;
    }

    public function close(float $closingCash, string $notes = ''): void
    {
        $this->status       = 'closed';
        $this->closed_at    = now();
        $this->closing_cash = $closingCash;
        $this->notes        = $notes ?: $this->notes;
        $this->save();
    }

    public function generateName(): string
    {
        return 'POS-' . date('Y') . '-' . str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
    }
}
