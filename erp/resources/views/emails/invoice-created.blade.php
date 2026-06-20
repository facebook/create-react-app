<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice Created</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:sans-serif;">
    <div style="max-width:600px;margin:40px auto;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
        <div style="background-color:#1a56db;padding:24px 32px;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">ERP System</h1>
        </div>

        <div style="padding:32px;">
            <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">Invoice Created</h2>

            <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
                A new invoice has been created in the system. Please find the details below.
            </p>

            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
                <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:14px;width:40%;">Invoice Number</td>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;font-weight:600;">#{{ $invoice->number }}</td>
                </tr>
                <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:14px;">Status</td>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;font-weight:600;">{{ ucfirst($invoice->status) }}</td>
                </tr>
                @if($invoice->issue_date)
                <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:14px;">Issue Date</td>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;">{{ $invoice->issue_date->format('d M Y') }}</td>
                </tr>
                @endif
                @if($invoice->due_date)
                <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:14px;">Due Date</td>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;">{{ $invoice->due_date->format('d M Y') }}</td>
                </tr>
                @endif
                @if(isset($invoice->total))
                <tr>
                    <td style="padding:10px 0;color:#6b7280;font-size:14px;">Total Amount</td>
                    <td style="padding:10px 0;color:#111827;font-size:14px;font-weight:600;">{{ number_format($invoice->total, 2) }} {{ $invoice->currency_code ?? 'USD' }}</td>
                </tr>
                @endif
            </table>

            <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">
                Please log in to the ERP System to view or manage this invoice.
            </p>
        </div>

        <div style="background-color:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
                This is an automated notification.
            </p>
        </div>
    </div>
</body>
</html>
