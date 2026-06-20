<?php

namespace App\Services;

use App\Models\Webhook;
use App\Models\WebhookDelivery;
use Illuminate\Support\Facades\Http;

class WebhookService
{
    public static function send(Webhook $webhook, string $event, array $payload): WebhookDelivery
    {
        $delivery = WebhookDelivery::create([
            'webhook_id' => $webhook->id,
            'event'      => $event,
            'payload'    => $payload,
            'attempts'   => 1,
        ]);

        try {
            $body      = json_encode($payload);
            $signature = hash_hmac('sha256', $body, $webhook->secret ?? '');
            $response  = Http::timeout(10)
                ->withHeaders([
                    'Content-Type'        => 'application/json',
                    'X-Webhook-Event'     => $event,
                    'X-Webhook-Signature' => "sha256={$signature}",
                ])
                ->post($webhook->url, $payload);

            $delivery->update([
                'response_status' => $response->status(),
                'response_body'   => substr($response->body(), 0, 1000),
                'delivered_at'    => now(),
            ]);
        } catch (\Throwable $e) {
            $delivery->update([
                'failed_at'    => now(),
                'response_body' => $e->getMessage(),
            ]);
        }

        return $delivery;
    }
}
