<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #1e293b; margin: 0; padding: 0; }
  .page { padding: 20px; max-width: 280px; margin: 0 auto; }
  .center { text-align: center; }
  .store-name { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
  .divider { border-top: 1px dashed #94a3b8; margin: 10px 0; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 3px 0; vertical-align: top; }
  .text-right { text-align: right; }
  .item-name { width: 55%; }
  .item-qty  { width: 15%; text-align: center; }
  .item-price{ width: 30%; text-align: right; }
  .total-row { font-size: 14px; font-weight: bold; border-top: 1px solid #1e293b; padding-top: 6px; margin-top: 4px; }
  .footer { text-align: center; color: #64748b; font-size: 10px; margin-top: 12px; }
</style>
</head>
<body>
<div class="page">
  <div class="center">
    <div class="store-name">{{ $session->warehouse?->name ?? config('app.name') }}</div>
    <div>{{ now()->format('d M Y H:i') }}</div>
    <div>Receipt #{{ $order->receipt_number }}</div>
  </div>

  <div class="divider"></div>

  <table>
    <thead>
      <tr>
        <td class="item-name" style="font-weight:bold;">Item</td>
        <td class="item-qty" style="font-weight:bold;">Qty</td>
        <td class="item-price" style="font-weight:bold;">Price</td>
      </tr>
    </thead>
    <tbody>
      @foreach($order->items as $item)
      <tr>
        <td class="item-name">{{ $item->product_name }}</td>
        <td class="item-qty">{{ $item->quantity }}</td>
        <td class="item-price">${{ number_format($item->line_total, 2) }}</td>
      </tr>
      @endforeach
    </tbody>
  </table>

  <div class="divider"></div>

  <table>
    <tr><td>Subtotal</td><td class="text-right">${{ number_format($order->subtotal, 2) }}</td></tr>
    @if($order->discount_amount > 0)
    <tr><td>Discount</td><td class="text-right">-${{ number_format($order->discount_amount, 2) }}</td></tr>
    @endif
    @if($order->tax_amount > 0)
    <tr><td>Tax</td><td class="text-right">${{ number_format($order->tax_amount, 2) }}</td></tr>
    @endif
    <tr class="total-row"><td>TOTAL</td><td class="text-right">${{ number_format($order->total, 2) }}</td></tr>
    <tr><td>{{ strtoupper($order->payment_method) }}</td><td class="text-right">${{ number_format($order->amount_paid, 2) }}</td></tr>
    @if($order->change_given > 0)
    <tr><td>Change</td><td class="text-right">${{ number_format($order->change_given, 2) }}</td></tr>
    @endif
  </table>

  <div class="divider"></div>
  <div class="footer">
    @if($order->customer_name)<div>{{ $order->customer_name }}</div>@endif
    <div>Thank you for your business!</div>
    <div>Served by: {{ $order->servedBy?->name ?? 'Staff' }}</div>
  </div>
</div>
</body>
</html>
