<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessBulkImportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public array $backoff = [10, 30, 60];

    public function __construct(
        public readonly string $filePath,
        public readonly string $importType,
        public readonly int $tenantId,
        public readonly int $userId,
    ) {}

    public function handle(): void
    {
        Log::info("Processing bulk import: type={$this->importType}, file={$this->filePath}, tenant={$this->tenantId}, user={$this->userId}");
    }
}
