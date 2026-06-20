<?php

namespace App\Events\Manufacturing;

use App\Modules\Manufacturing\Models\ManufacturingOrder;

class ManufacturingOrderCompleted
{
    public function __construct(public readonly ManufacturingOrder $order) {}
}
