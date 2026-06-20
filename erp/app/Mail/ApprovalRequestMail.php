<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ApprovalRequestMail extends Mailable
{
    use SerializesModels;

    public function __construct(
        public readonly string $requesterName,
        public readonly string $requestTitle,
        public readonly string $type,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Approval Required: {$this->requestTitle}");
    }

    public function content(): Content
    {
        return new Content(view: 'emails.approval-request');
    }
}
