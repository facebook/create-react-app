<?php

namespace App\Modules\Inventory\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReceivePurchaseOrderRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'lines'                       => ['required', 'array', 'min:1'],
            'lines.*.id'                  => ['required', 'integer'],
            'lines.*.received_quantity'   => ['required', 'numeric', 'min:0'],
        ];
    }
}
