<?php

namespace App\Mail;

use App\Models\ReportSchedule;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ScheduledReportMail extends Mailable
{
    use SerializesModels;

    public function __construct(
        public readonly ReportSchedule $schedule,
        public readonly array $reportData,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "[{$this->schedule->report_type}] {$this->schedule->name} Report"
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.scheduled-report',
            with: [
                'schedule'   => $this->schedule,
                'reportData' => $this->reportData,
            ]
        );
    }
}
