<?php

namespace App\Modules\Finance\Policies;

use App\Models\User;
use App\Modules\Finance\Models\Attachment;

class AttachmentPolicy
{
    public function viewAny(User $user): bool { return $user->can('finance.view'); }
    public function view(User $user, Attachment $attachment): bool { return $user->can('finance.view'); }
    public function create(User $user): bool { return $user->can('finance.create'); }
    public function delete(User $user, Attachment $attachment): bool { return $user->can('finance.delete'); }
}
