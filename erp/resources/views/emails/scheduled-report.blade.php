<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scheduled Report</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:sans-serif;">
    <div style="max-width:640px;margin:40px auto;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
        <div style="background-color:#1a56db;padding:24px 32px;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">ERP System</h1>
            <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">Scheduled Report Delivery</p>
        </div>

        <div style="padding:32px;">
            <h2 style="margin:0 0 8px;color:#111827;font-size:20px;">{{ $schedule->name }}</h2>
            <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">
                Report Type: <strong>{{ ucfirst($schedule->report_type) }}</strong> &nbsp;|&nbsp;
                Frequency: <strong>{{ ucfirst($schedule->frequency) }}</strong> &nbsp;|&nbsp;
                Generated: <strong>{{ now()->format('M d, Y H:i') }}</strong>
            </p>

            @if($schedule->report_type === 'financial' && isset($reportData))
            <div style="background-color:#f0fdf4;border:1px solid #86efac;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
                <h3 style="margin:0 0 12px;color:#166534;font-size:16px;">Financial Summary</h3>
                @if(isset($reportData['invoice_summary']))
                <table style="width:100%;border-collapse:collapse;">
                    <tr>
                        <td style="padding:6px 0;color:#374151;font-size:14px;">Total Invoiced</td>
                        <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">${{ number_format($reportData['invoice_summary']['total_invoiced'] ?? 0, 2) }}</td>
                    </tr>
                    <tr>
                        <td style="padding:6px 0;color:#374151;font-size:14px;">Total Paid</td>
                        <td style="padding:6px 0;color:#16a34a;font-size:14px;font-weight:600;text-align:right;">${{ number_format($reportData['invoice_summary']['total_paid'] ?? 0, 2) }}</td>
                    </tr>
                    <tr>
                        <td style="padding:6px 0;color:#374151;font-size:14px;">Outstanding</td>
                        <td style="padding:6px 0;color:#dc2626;font-size:14px;font-weight:600;text-align:right;">${{ number_format($reportData['invoice_summary']['total_outstanding'] ?? 0, 2) }}</td>
                    </tr>
                    @if(isset($reportData['invoice_summary']['total_overdue']))
                    <tr>
                        <td style="padding:6px 0;color:#374151;font-size:14px;">Overdue</td>
                        <td style="padding:6px 0;color:#dc2626;font-size:14px;font-weight:600;text-align:right;">${{ number_format($reportData['invoice_summary']['total_overdue'], 2) }}</td>
                    </tr>
                    @endif
                </table>
                @endif
            </div>
            @endif

            @if($schedule->report_type === 'inventory' && isset($reportData))
            <div style="background-color:#eff6ff;border:1px solid #93c5fd;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
                <h3 style="margin:0 0 12px;color:#1e40af;font-size:16px;">Inventory Summary</h3>
                <table style="width:100%;border-collapse:collapse;">
                    <tr>
                        <td style="padding:6px 0;color:#374151;font-size:14px;">Total Products</td>
                        <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">{{ number_format($reportData['total_products'] ?? 0) }}</td>
                    </tr>
                    <tr>
                        <td style="padding:6px 0;color:#374151;font-size:14px;">Stock Value</td>
                        <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">${{ number_format($reportData['stock_value'] ?? 0, 2) }}</td>
                    </tr>
                    <tr>
                        <td style="padding:6px 0;color:#374151;font-size:14px;">Low Stock Items</td>
                        <td style="padding:6px 0;color:#f59e0b;font-size:14px;font-weight:600;text-align:right;">{{ $reportData['low_stock_count'] ?? 0 }}</td>
                    </tr>
                </table>
            </div>
            @endif

            @if($schedule->report_type === 'hr' && isset($reportData))
            <div style="background-color:#fdf4ff;border:1px solid #d8b4fe;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
                <h3 style="margin:0 0 12px;color:#6b21a8;font-size:16px;">HR Summary</h3>
                @if(isset($reportData['headcount']))
                <p style="margin:0 0 8px;color:#374151;font-size:14px;">Headcount by Status:</p>
                @foreach($reportData['headcount'] as $item)
                <div style="display:flex;justify-content:space-between;padding:4px 0;">
                    <span style="color:#374151;font-size:13px;">{{ ucfirst($item['status'] ?? '') }}</span>
                    <span style="color:#111827;font-size:13px;font-weight:600;">{{ $item['count'] ?? 0 }}</span>
                </div>
                @endforeach
                @endif
            </div>
            @endif

            <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">
                Log in to the ERP System to view the full report with all details and charts.
            </p>
        </div>

        <div style="background-color:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
                This report was automatically generated by ERP System. To manage report schedules, go to Settings &gt; Report Schedules.
            </p>
        </div>
    </div>
</body>
</html>
