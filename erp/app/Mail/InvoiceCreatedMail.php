<?php

namespace App\Mail;

use App\Modules\Finance\Models\Invoice;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvoiceCreatedMail extends Mailable
{
    use SerializesModels;

    public function __construct(public readonly Invoice $invoice) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Invoice #' . $this->invoice->number . ' Created');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.invoice-created');
    }
}
