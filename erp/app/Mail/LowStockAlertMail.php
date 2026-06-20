<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LowStockAlertMail extends Mailable
{
    use SerializesModels;

    public function __construct(
        public readonly string $productName,
        public readonly float $quantity,
        public readonly float $reorderPoint,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Low Stock Alert: {$this->productName}");
    }

    public function content(): Content
    {
        return new Content(view: 'emails.low-stock-alert');
    }
}
