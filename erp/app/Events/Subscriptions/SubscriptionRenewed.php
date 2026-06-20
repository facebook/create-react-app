<?php

namespace App\Events\Subscriptions;

use App\Modules\Subscriptions\Models\Subscription;

class SubscriptionRenewed
{
    public function __construct(public readonly Subscription $subscription) {}
}
