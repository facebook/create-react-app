<?php

namespace App\Modules\Sign\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class SignRequestSigner extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'sign_request_id',
        'tenant_id',
        'signer_name',
        'signer_email',
        'status',
        'signed_at',
        'declined_at',
        'token',
        'sequence',
    ];

    protected $casts = [
        'signed_at'   => 'datetime',
        'declined_at' => 'datetime',
    ];

    public function request(): BelongsTo
    {
        return $this->belongsTo(SignRequest::class, 'sign_request_id');
    }

    public function sign(): void
    {
        $this->status    = 'signed';
        $this->signed_at = now();
        $this->save();

        $this->request->checkCompletion();
    }

    public function decline(): void
    {
        $this->status      = 'declined';
        $this->declined_at = now();
        $this->save();
    }

    public function generateToken(): string
    {
        return Str::random(40);
    }
}
