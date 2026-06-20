<?php

namespace App\Events\HR;

use App\Modules\HR\Models\PayrollRun;

class PayrollRunApproved
{
    public function __construct(public readonly PayrollRun $payrollRun) {}
}
