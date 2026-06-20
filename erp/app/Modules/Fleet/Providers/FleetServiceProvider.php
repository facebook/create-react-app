<?php

namespace App\Modules\Fleet\Providers;

use App\Modules\Fleet\Models\FuelLog;
use App\Modules\Fleet\Models\Vehicle;
use App\Modules\Fleet\Models\VehicleAssignment;
use App\Modules\Fleet\Models\VehicleMaintenance;
use App\Modules\Fleet\Policies\FleetPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class FleetServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../routes/fleet.php');
        Gate::policy(Vehicle::class,           FleetPolicy::class);
        Gate::policy(FuelLog::class,           FleetPolicy::class);
        Gate::policy(VehicleMaintenance::class, FleetPolicy::class);
        Gate::policy(VehicleAssignment::class,  FleetPolicy::class);
    }
}
