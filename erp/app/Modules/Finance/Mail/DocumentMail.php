<?php

namespace App\Modules\Finance\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DocumentMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        private readonly string $mailSubject,
        private readonly string $pdfData,
        private readonly string $filename,
        private readonly string $company,
        private readonly string $messageBody = '',
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->mailSubject);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.document', with: [
            'subject'      => $this->mailSubject,
            'message_body' => $this->messageBody,
            'company'      => $this->company,
        ]);
    }

    public function attachments(): array
    {
        $pdfData  = $this->pdfData;
        $filename = $this->filename;

        return [
            Attachment::fromData(fn () => $pdfData, $filename)
                ->withMime('application/pdf'),
        ];
    }
}
