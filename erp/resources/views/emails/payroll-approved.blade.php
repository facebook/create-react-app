<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payroll Run Approved</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:sans-serif;">
    <div style="max-width:600px;margin:40px auto;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
        <div style="background-color:#1a56db;padding:24px 32px;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">ERP System</h1>
        </div>

        <div style="padding:32px;">
            <div style="background-color:#d1fae5;border:1px solid #10b981;border-radius:6px;padding:12px 16px;margin-bottom:24px;">
                <p style="margin:0;color:#065f46;font-size:14px;font-weight:600;">Payroll Run Approved Successfully</p>
            </div>

            <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">Payroll Run Approved</h2>

            <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
                The following payroll run has been approved and is ready for processing.
            </p>

            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
                <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:14px;width:40%;">Period</td>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;font-weight:600;">{{ $payrollRun->period_label }}</td>
                </tr>
                <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:14px;">Status</td>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;font-weight:600;">{{ ucfirst($payrollRun->status) }}</td>
                </tr>
                @if($payrollRun->employee_count)
                <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:14px;">Employees</td>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;">{{ $payrollRun->employee_count }}</td>
                </tr>
                @endif
                <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:14px;">Total Gross</td>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;font-weight:600;">{{ number_format($payrollRun->total_gross, 2) }}</td>
                </tr>
                <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:14px;">Total Deductions</td>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;">{{ number_format($payrollRun->total_deductions, 2) }}</td>
                </tr>
                <tr>
                    <td style="padding:10px 0;color:#6b7280;font-size:14px;">Total Net</td>
                    <td style="padding:10px 0;color:#111827;font-size:14px;font-weight:600;">{{ number_format($payrollRun->total_net, 2) }}</td>
                </tr>
            </table>

            @if($payrollRun->approved_at)
            <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">
                Approved on: {{ $payrollRun->approved_at->format('d M Y, H:i') }}
            </p>
            @endif
        </div>

        <div style="background-color:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
                This is an automated notification.
            </p>
        </div>
    </div>
</body>
</html>
