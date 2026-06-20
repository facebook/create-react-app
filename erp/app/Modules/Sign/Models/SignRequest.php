<?php

namespace App\Modules\Sign\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SignRequest extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'title',
        'document_path',
        'document_name',
        'status',
        'message',
        'created_by',
        'completed_at',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
    ];

    public function signers(): HasMany
    {
        return $this->hasMany(SignRequestSigner::class)->orderBy('sequence');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function send(): void
    {
        $this->status = 'sent';
        $this->save();

        foreach ($this->signers as $signer) {
            if (empty($signer->token)) {
                $signer->token = $signer->generateToken();
                $signer->save();
            }
        }
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }

    public function checkCompletion(): void
    {
        if ($this->allSigned()) {
            $this->status       = 'completed';
            $this->completed_at = now();
            $this->save();
        }
    }

    public function pendingSigners(): Collection
    {
        return $this->signers()->where('status', 'pending')->get();
    }

    public function allSigned(): bool
    {
        return $this->signers()->exists()
            && $this->signers()->where('status', '!=', 'signed')->doesntExist();
    }
}
