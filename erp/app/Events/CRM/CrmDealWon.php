<?php

namespace App\Events\CRM;

use App\Modules\CRM\Models\CrmLead;

class CrmDealWon
{
    public function __construct(public readonly CrmLead $lead) {}
}
