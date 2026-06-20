<?php

use App\Providers\AppServiceProvider;
use App\Modules\Core\Providers\CoreServiceProvider;
use App\Modules\Maintenance\Providers\MaintenanceServiceProvider;

return [
    AppServiceProvider::class,
    CoreServiceProvider::class,
    MaintenanceServiceProvider::class,
];
