<?php

namespace App\Mail;

use App\Modules\HR\Models\PayrollRun;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PayrollApprovedMail extends Mailable
{
    use SerializesModels;

    public function __construct(public readonly PayrollRun $payrollRun) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Payroll Run Approved: {$this->payrollRun->period_label}");
    }

    public function content(): Content
    {
        return new Content(view: 'emails.payroll-approved');
    }
}
