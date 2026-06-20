<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice {{ $invoice->number }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 13px; color: #333; background: #fff; }
        .page { padding: 40px; }
        .header { display: table; width: 100%; margin-bottom: 30px; }
        .header-left { display: table-cell; vertical-align: top; width: 60%; }
        .header-right { display: table-cell; vertical-align: top; text-align: right; }
        .company-name { font-size: 22px; font-weight: bold; color: #1a1a2e; margin-bottom: 4px; }
        .company-tagline { color: #666; font-size: 12px; }
        .invoice-title { font-size: 28px; font-weight: bold; color: #1a1a2e; letter-spacing: 2px; }
        .invoice-meta { margin-top: 8px; color: #555; font-size: 12px; line-height: 1.6; }
        .invoice-meta strong { color: #333; }
        .divider { border: none; border-top: 2px solid #1a1a2e; margin: 20px 0; }
        .bill-section { margin-bottom: 24px; }
        .bill-section-title { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #888; letter-spacing: 1px; margin-bottom: 6px; }
        .bill-name { font-size: 15px; font-weight: bold; color: #1a1a2e; }
        .bill-detail { color: #555; font-size: 12px; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        thead tr { background-color: #1a1a2e; }
        thead th { color: #fff; padding: 10px 12px; text-align: left; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
        thead th.text-right { text-align: right; }
        tbody tr { border-bottom: 1px solid #e8e8e8; }
        tbody tr:nth-child(even) { background-color: #f9f9f9; }
        tbody td { padding: 10px 12px; font-size: 12px; color: #444; }
        tbody td.text-right { text-align: right; }
        .totals-wrapper { display: table; width: 100%; }
        .totals-spacer { display: table-cell; width: 60%; }
        .totals-table-cell { display: table-cell; width: 40%; vertical-align: top; }
        .totals-table { width: 100%; border-collapse: collapse; }
        .totals-table td { padding: 7px 12px; font-size: 12px; }
        .totals-table td:last-child { text-align: right; font-weight: bold; }
        .totals-table tr.total-row { background-color: #1a1a2e; }
        .totals-table tr.total-row td { color: #fff; font-size: 14px; font-weight: bold; padding: 10px 12px; }
        .totals-table tr.subtotal-row { border-bottom: 1px solid #e8e8e8; }
        .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #888; padding-top: 16px; border-top: 1px solid #e8e8e8; }
        .status-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
        .status-draft { background-color: #f0f0f0; color: #666; }
        .status-sent { background-color: #dbeafe; color: #1d4ed8; }
        .status-paid { background-color: #d1fae5; color: #065f46; }
        .status-partial { background-color: #fef3c7; color: #92400e; }
        .status-cancelled { background-color: #fee2e2; color: #991b1b; }
    </style>
</head>
<body>
<div class="page">

    {{-- Header --}}
    <div class="header">
        <div class="header-left">
            <div class="company-name">Demo Company</div>
            <div class="company-tagline">Professional Services</div>
        </div>
        <div class="header-right">
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-meta">
                <strong>Invoice #:</strong> {{ $invoice->number ?? 'N/A' }}<br>
                <strong>Issue Date:</strong> {{ $invoice->issue_date ? $invoice->issue_date->format('d M Y') : 'N/A' }}<br>
                @if($invoice->due_date)
                    <strong>Due Date:</strong> {{ $invoice->due_date->format('d M Y') }}<br>
                @endif
                <strong>Status:</strong>
                <span class="status-badge status-{{ $invoice->status ?? 'draft' }}">
                    {{ ucfirst($invoice->status ?? 'draft') }}
                </span>
            </div>
        </div>
    </div>

    <hr class="divider">

    {{-- Bill To --}}
    <div class="bill-section">
        <div class="bill-section-title">Bill To</div>
        @if($invoice->contact)
            <div class="bill-name">{{ $invoice->contact->name }}</div>
            <div class="bill-detail">
                @if($invoice->contact->email){{ $invoice->contact->email }}<br>@endif
                @if($invoice->contact->phone){{ $invoice->contact->phone }}<br>@endif
                @if($invoice->contact->address){{ $invoice->contact->address }}@endif
            </div>
        @else
            <div class="bill-detail" style="color: #aaa; font-style: italic;">No contact specified</div>
        @endif
    </div>

    {{-- Items Table --}}
    <table>
        <thead>
            <tr>
                <th style="width: 45%;">Description</th>
                <th class="text-right" style="width: 15%;">Qty</th>
                <th class="text-right" style="width: 20%;">Unit Price</th>
                <th class="text-right" style="width: 20%;">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @forelse($items as $item)
                <tr>
                    <td>{{ $item->description }}</td>
                    <td class="text-right">{{ number_format((float)$item->quantity, 2) }}</td>
                    <td class="text-right">{{ number_format((float)$item->unit_price, 2) }}</td>
                    <td class="text-right">{{ number_format($item->subtotal, 2) }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="4" style="text-align: center; color: #aaa; font-style: italic; padding: 20px;">
                        No items
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    {{-- Totals --}}
    <div class="totals-wrapper">
        <div class="totals-spacer"></div>
        <div class="totals-table-cell">
            <table class="totals-table">
                @php
                    $subtotal = $items->sum(fn($i) => (float)$i->quantity * (float)$i->unit_price);
                    $tax      = $items->sum(fn($i) => ((float)$i->quantity * (float)$i->unit_price) * ((float)$i->tax_rate / 100));
                    $total    = $subtotal + $tax;
                @endphp
                <tr class="subtotal-row">
                    <td>Subtotal</td>
                    <td>{{ number_format($subtotal, 2) }}</td>
                </tr>
                @if($tax > 0)
                    <tr class="subtotal-row">
                        <td>Tax</td>
                        <td>{{ number_format($tax, 2) }}</td>
                    </tr>
                @endif
                <tr class="total-row">
                    <td>Total</td>
                    <td>{{ number_format($total, 2) }}</td>
                </tr>
            </table>
        </div>
    </div>

    {{-- Notes --}}
    @if($invoice->notes)
        <div style="margin-top: 24px; padding: 12px; background: #f9f9f9; border-left: 3px solid #1a1a2e; font-size: 12px; color: #555;">
            <strong>Notes:</strong><br>
            {{ $invoice->notes }}
        </div>
    @endif

    {{-- Footer --}}
    <div class="footer">
        Thank you for your business!
    </div>

</div>
</body>
</html>
