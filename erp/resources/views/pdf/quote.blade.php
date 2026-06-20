<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Quote {{ $quote->number }}</title>
  @include('pdf.partials._styles')
</head>
<body>
<div class="page">
  <div class="header">
    <h1>{{ $company }}</h1>
    <div class="number">Quote #{{ $quote->number }}</div>
  </div>

  <table class="meta-table">
    <tr>
      <td class="label">Quote To:</td>
      <td>{{ $quote->contact?->name ?? '—' }}</td>
      <td class="label">Issue Date:</td>
      <td>{{ \Carbon\Carbon::parse($quote->issue_date)->format('d M Y') }}</td>
    </tr>
    <tr>
      <td></td><td></td>
      <td class="label">Expiry Date:</td>
      <td>{{ $quote->expiry_date ? \Carbon\Carbon::parse($quote->expiry_date)->format('d M Y') : '—' }}</td>
    </tr>
    <tr>
      <td></td><td></td>
      <td class="label">Status:</td>
      <td><span class="badge badge-{{ $quote->status }}">{{ strtoupper($quote->status) }}</span></td>
    </tr>
  </table>

  <table class="items-table">
    <thead>
      <tr>
        <th>Description</th>
        <th class="text-right">Qty</th>
        <th class="text-right">Unit Price</th>
        <th class="text-right">Tax %</th>
        <th class="text-right">Line Total</th>
      </tr>
    </thead>
    <tbody>
      @foreach($quote->items as $item)
      <tr>
        <td>{{ $item->description }}</td>
        <td class="text-right">{{ number_format((float)$item->quantity, 2) }}</td>
        <td class="text-right">{{ number_format((float)$item->unit_price, 2) }}</td>
        <td class="text-right">{{ number_format((float)$item->tax_rate, 1) }}%</td>
        <td class="text-right">{{ number_format((float)$item->quantity * (float)$item->unit_price * (1 + (float)$item->tax_rate / 100), 2) }}</td>
      </tr>
      @endforeach
    </tbody>
  </table>

  <table class="totals-table">
    <tr><td>Subtotal:</td><td class="text-right">{{ number_format($quote->subtotal, 2) }}</td></tr>
    <tr><td>Tax:</td><td class="text-right">{{ number_format($quote->tax_total, 2) }}</td></tr>
    <tr class="total-row"><td>Total:</td><td class="text-right">{{ number_format($quote->total, 2) }}</td></tr>
  </table>

  @if($quote->notes)
  <p style="margin-top:16px;color:#64748b;">{{ $quote->notes }}</p>
  @endif

  <div class="footer">Generated {{ now()->format('d M Y') }} · {{ $company }}</div>
</div>
</body>
</html>
