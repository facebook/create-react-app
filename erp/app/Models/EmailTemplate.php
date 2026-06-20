<?php

namespace App\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class EmailTemplate extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'key',
        'name',
        'subject',
        'body_html',
        'variables',
        'is_active',
    ];

    protected $casts = [
        'variables' => 'array',
        'is_active' => 'boolean',
    ];

    public static array $defaultTemplates = [
        'invoice_created' => [
            'name'      => 'Invoice Created',
            'subject'   => 'Invoice #{{ invoice_number }} from {{ company_name }}',
            'body_html' => '<p>Dear {{ customer_name }},</p><p>Please find attached your invoice #{{ invoice_number }} for {{ total }}.</p><p>Due date: {{ due_date }}</p>',
            'variables' => ['invoice_number', 'customer_name', 'total', 'due_date', 'company_name'],
        ],
        'low_stock_alert' => [
            'name'      => 'Low Stock Alert',
            'subject'   => 'Low Stock Alert: {{ product_name }}',
            'body_html' => '<p>Product <strong>{{ product_name }}</strong> has fallen below reorder point.</p><p>Current quantity: {{ quantity }}</p><p>Reorder point: {{ reorder_point }}</p>',
            'variables' => ['product_name', 'quantity', 'reorder_point'],
        ],
        'payroll_approved' => [
            'name'      => 'Payroll Approved',
            'subject'   => 'Payroll Run Approved – {{ period }}',
            'body_html' => '<p>Dear {{ employee_name }},</p><p>Your payslip for {{ period }} has been approved. Net pay: {{ net_pay }}.</p>',
            'variables' => ['employee_name', 'period', 'net_pay', 'gross_pay'],
        ],
        'approval_request' => [
            'name'      => 'Approval Request',
            'subject'   => 'Approval Required: {{ document_type }} #{{ document_ref }}',
            'body_html' => '<p>You have a pending approval for {{ document_type }} #{{ document_ref }}.<br>Submitted by {{ requester_name }}.</p>',
            'variables' => ['document_type', 'document_ref', 'requester_name'],
        ],
    ];

    /**
     * Render the subject and body with provided variables.
     *
     * @param  array<string, string>  $vars
     * @return array{subject: string, body_html: string}
     */
    public function render(array $vars): array
    {
        $replace = function (string $template) use ($vars): string {
            foreach ($vars as $key => $value) {
                $template = str_replace("{{ {$key} }}", (string) $value, $template);
                $template = str_replace("{{$key}}", (string) $value, $template);
            }
            return $template;
        };

        return [
            'subject'  => $replace($this->subject),
            'body_html' => $replace($this->body_html),
        ];
    }

    public static function forTenant(int $tenantId, string $key): ?self
    {
        return static::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->where('key', $key)
            ->where('is_active', true)
            ->first();
    }
}
