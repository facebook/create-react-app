<?php

namespace App\Modules\Documents\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'folder_id',
        'title',
        'description',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
        'version',
        'tags',
        'uploaded_by',
    ];

    protected $casts = [
        'tags' => 'array',
    ];

    public function folder(): BelongsTo
    {
        return $this->belongsTo(DocumentFolder::class, 'folder_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function versions(): HasMany
    {
        return $this->hasMany(DocumentVersion::class)->orderByDesc('version');
    }

    public function addVersion(
        string $filePath,
        string $fileName,
        ?int $fileSize,
        int $uploadedBy,
        ?string $notes = null
    ): DocumentVersion {
        $this->version += 1;
        $this->file_path = $filePath;
        $this->file_name = $fileName;
        $this->file_size = $fileSize;
        $this->save();

        return $this->versions()->create([
            'document_id' => $this->id,
            'tenant_id'   => $this->tenant_id,
            'version'     => $this->version,
            'file_path'   => $filePath,
            'file_name'   => $fileName,
            'file_size'   => $fileSize,
            'uploaded_by' => $uploadedBy,
            'notes'       => $notes,
        ]);
    }

    public function fileSizeFormatted(): string
    {
        if ($this->file_size === null) {
            return 'Unknown';
        }

        $bytes = $this->file_size;

        if ($bytes >= 1073741824) {
            return round($bytes / 1073741824, 2) . ' GB';
        }

        if ($bytes >= 1048576) {
            return round($bytes / 1048576, 2) . ' MB';
        }

        if ($bytes >= 1024) {
            return round($bytes / 1024, 2) . ' KB';
        }

        return $bytes . ' B';
    }
}
