<?php

namespace App\Modules\Finance\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSalesOrderRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'contact_id'          => ['nullable', Rule::exists('contacts', 'id')],
            'warehouse_id'        => ['nullable', Rule::exists('warehouses', 'id')],
            'reference'           => ['nullable', 'string', 'max:100', Rule::unique('sales_orders', 'reference')],
            'order_date'          => ['required', 'date'],
            'expected_date'       => ['nullable', 'date', 'after_or_equal:order_date'],
            'currency_code'       => ['nullable', 'string', 'size:3'],
            'exchange_rate'       => ['nullable', 'numeric', 'min:0.000001'],
            'notes'               => ['nullable', 'string'],
            'items'               => ['required', 'array', 'min:1'],
            'items.*.product_id'  => ['nullable', Rule::exists('products', 'id')],
            'items.*.description' => ['required', 'string'],
            'items.*.quantity'    => ['required', 'numeric', 'min:0.01'],
            'items.*.unit_price'  => ['required', 'numeric', 'min:0'],
            'items.*.tax_rate'    => ['required', 'numeric', 'min:0', 'max:100'],
        ];
    }
}
