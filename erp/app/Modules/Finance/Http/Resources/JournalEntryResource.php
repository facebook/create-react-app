<?php

namespace App\Modules\Finance\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JournalEntryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'date'         => $this->date?->toDateString(),
            'reference'    => $this->reference,
            'description'  => $this->description,
            'status'       => $this->status,
            'total_debits' => $this->whenLoaded('lines', fn () => $this->total_debits),
            'total_credits'=> $this->whenLoaded('lines', fn () => $this->total_credits),
            'creator'      => $this->whenLoaded('creator', fn () => ['id' => $this->creator->id, 'name' => $this->creator->name]),
            'lines'        => $this->whenLoaded('lines', fn () => $this->lines->map(fn ($line) => [
                'id'          => $line->id,
                'account_id'  => $line->account_id,
                'account'     => $line->relationLoaded('account') ? ['id' => $line->account->id, 'code' => $line->account->code, 'name' => $line->account->name] : null,
                'debit'       => $line->debit,
                'credit'      => $line->credit,
                'description' => $line->description,
            ])),
            'created_at'   => $this->created_at?->toDateTimeString(),
        ];
    }
}
