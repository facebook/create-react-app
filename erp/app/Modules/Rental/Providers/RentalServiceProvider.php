<?php

namespace App\Modules\Rental\Providers;

use Illuminate\Support\ServiceProvider;

class RentalServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../routes/rental.php');
    }
}
