<?php

namespace App\Events\Purchase;

use App\Modules\Purchase\Models\Po;

class PurchaseOrderConfirmed
{
    public function __construct(public readonly Po $po) {}
}
