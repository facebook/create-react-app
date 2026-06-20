<?php

namespace App\Notifications;

use App\Modules\HR\Models\LeaveRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class LeaveRequestActioned extends Notification
{
    use Queueable;

    public function __construct(
        private LeaveRequest $request,
        private string $action
    ) {}

    public function via(mixed $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(mixed $notifiable): array
    {
        return [
            'title'   => "Leave request {$this->action}",
            'message' => "Your leave from {$this->request->start_date->toDateString()} to {$this->request->end_date->toDateString()} has been {$this->action}.",
            'link'    => '/hr/leave',
            'type'    => 'hr',
        ];
    }
}
