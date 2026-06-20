<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Purchase Order {{ $po->po_number }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 13px; color: #333; background: #fff; }
        .page { padding: 40px; }
        .header { display: table; width: 100%; margin-bottom: 30px; }
        .header-left { display: table-cell; vertical-align: top; width: 60%; }
        .header-right { display: table-cell; vertical-align: top; text-align: right; }
        .company-name { font-size: 22px; font-weight: bold; color: #0f3460; margin-bottom: 4px; }
        .po-title { font-size: 26px; font-weight: bold; color: #0f3460; letter-spacing: 2px; }
        .po-meta { margin-top: 8px; color: #555; font-size: 12px; line-height: 1.7; }
        .po-meta strong { color: #333; }
        .divider { border: none; border-top: 2px solid #0f3460; margin: 20px 0; }
        .vendor-section { margin-bottom: 24px; }
        .section-title { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #888; letter-spacing: 1px; margin-bottom: 6px; }
        .vendor-name { font-size: 15px; font-weight: bold; color: #0f3460; }
        .vendor-detail { color: #555; font-size: 12px; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        thead tr { background-color: #0f3460; }
        thead th { color: #fff; padding: 10px 12px; text-align: left; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
        thead th.text-right { text-align: right; }
        tbody tr { border-bottom: 1px solid #e8e8e8; }
        tbody tr:nth-child(even) { background-color: #f5f8ff; }
        tbody td { padding: 10px 12px; font-size: 12px; color: #444; }
        tbody td.text-right { text-align: right; }
        .total-section { display: table; width: 100%; }
        .total-spacer { display: table-cell; width: 55%; }
        .total-box { display: table-cell; width: 45%; vertical-align: top; }
        .total-inner { background-color: #0f3460; padding: 14px 18px; border-radius: 4px; }
        .total-label { color: #a8c4e0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        .total-amount { color: #fff; font-size: 22px; font-weight: bold; margin-top: 4px; }
        .status-section { margin-top: 20px; }
        .status-badge { display: inline-block; padding: 4px 14px; border-radius: 14px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
        .status-draft { background-color: #f0f0f0; color: #666; }
        .status-sent { background-color: #dbeafe; color: #1d4ed8; }
        .status-confirmed { background-color: #d1fae5; color: #065f46; }
        .status-received { background-color: #ede9fe; color: #5b21b6; }
        .status-cancelled { background-color: #fee2e2; color: #991b1b; }
        .notes-box { margin-top: 24px; padding: 12px; background: #f5f8ff; border-left: 3px solid #0f3460; font-size: 12px; color: #555; }
        .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #888; padding-top: 16px; border-top: 1px solid #e8e8e8; }
    </style>
</head>
<body>
<div class="page">

    {{-- Header --}}
    <div class="header">
        <div class="header-left">
            <div class="company-name">Demo Company</div>
        </div>
        <div class="header-right">
            <div class="po-title">PURCHASE ORDER</div>
            <div class="po-meta">
                <strong>PO Number:</strong> {{ $po->po_number }}<br>
                <strong>Order Date:</strong> {{ $po->order_date ? $po->order_date->format('d M Y') : 'N/A' }}<br>
                @if($po->expected_delivery)
                    <strong>Expected Delivery:</strong> {{ $po->expected_delivery->format('d M Y') }}<br>
                @endif
                <strong>Currency:</strong> {{ $po->currency ?? 'USD' }}
            </div>
        </div>
    </div>

    <hr class="divider">

    {{-- Vendor Section --}}
    <div class="vendor-section">
        <div class="section-title">Vendor</div>
        @if($po->vendor)
            <div class="vendor-name">{{ $po->vendor->name }}</div>
            <div class="vendor-detail">
                @if($po->vendor->email){{ $po->vendor->email }}<br>@endif
                @if($po->vendor->phone){{ $po->vendor->phone }}<br>@endif
                @if($po->vendor->address){{ $po->vendor->address }}@endif
            </div>
        @else
            <div class="vendor-detail" style="color: #aaa; font-style: italic;">No vendor specified</div>
        @endif
    </div>

    {{-- Status Badge --}}
    <div class="status-section">
        <div class="section-title">Status</div>
        <span class="status-badge status-{{ $po->status ?? 'draft' }}">
            {{ ucfirst($po->status ?? 'draft') }}
        </span>
    </div>

    <div style="margin-top: 24px;"></div>

    {{-- Line Items Table --}}
    <table>
        <thead>
            <tr>
                <th style="width: 35%;">Product</th>
                <th style="width: 25%;">Description</th>
                <th class="text-right" style="width: 12%;">Qty</th>
                <th class="text-right" style="width: 14%;">Unit Price</th>
                <th class="text-right" style="width: 14%;">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @forelse($po->lines as $line)
                <tr>
                    <td>{{ $line->product_name }}</td>
                    <td>{{ $line->description ?? '' }}</td>
                    <td class="text-right">{{ number_format((float)$line->quantity, 2) }}</td>
                    <td class="text-right">{{ number_format((float)$line->unit_price, 2) }}</td>
                    <td class="text-right">{{ number_format((float)$line->subtotal, 2) }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" style="text-align: center; color: #aaa; font-style: italic; padding: 20px;">
                        No line items
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    {{-- Total Amount --}}
    <div class="total-section">
        <div class="total-spacer"></div>
        <div class="total-box">
            <div class="total-inner">
                <div class="total-label">Total Amount</div>
                <div class="total-amount">{{ $po->currency ?? '' }} {{ number_format((float)$po->total_amount, 2) }}</div>
            </div>
        </div>
    </div>

    {{-- Notes --}}
    @if($po->notes)
        <div class="notes-box">
            <strong>Notes:</strong><br>
            {{ $po->notes }}
        </div>
    @endif

    {{-- Footer --}}
    <div class="footer">
        Demo Company &mdash; Purchase Order &mdash; {{ $po->po_number }}
    </div>

</div>
</body>
</html>
