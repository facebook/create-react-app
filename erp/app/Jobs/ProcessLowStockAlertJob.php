<?php

namespace App\Jobs;

use App\Modules\Inventory\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessLowStockAlertJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public readonly Product $product,
        public readonly int $quantity,
    ) {}

    public function handle(): void
    {
        Log::info("Low stock alert: product [{$this->product->name}] has quantity {$this->quantity}");
    }
}
