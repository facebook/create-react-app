<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payslip - {{ $payrollRun->period_label ?? 'Payroll Run' }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 13px; color: #333; background: #fff; }
        .page { padding: 40px; }
        .header { display: table; width: 100%; margin-bottom: 30px; }
        .header-left { display: table-cell; vertical-align: top; width: 60%; }
        .header-right { display: table-cell; vertical-align: top; text-align: right; }
        .company-name { font-size: 22px; font-weight: bold; color: #1e3a5f; margin-bottom: 4px; }
        .payslip-title { font-size: 26px; font-weight: bold; color: #1e3a5f; letter-spacing: 2px; }
        .period-label { margin-top: 6px; font-size: 14px; color: #555; }
        .divider { border: none; border-top: 2px solid #1e3a5f; margin: 20px 0; }
        .info-section { display: table; width: 100%; margin-bottom: 24px; }
        .info-left { display: table-cell; width: 50%; vertical-align: top; }
        .info-right { display: table-cell; width: 50%; vertical-align: top; }
        .info-label { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #888; letter-spacing: 1px; margin-bottom: 4px; }
        .info-value { font-size: 13px; color: #333; font-weight: bold; }
        .info-detail { font-size: 12px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        .section-header { background-color: #1e3a5f; }
        .section-header th { color: #fff; padding: 8px 12px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
        .section-header th.text-right { text-align: right; }
        tbody tr { border-bottom: 1px solid #e8e8e8; }
        tbody td { padding: 9px 12px; font-size: 12px; }
        tbody td.text-right { text-align: right; }
        .earnings-row { background-color: #f0f9f4; }
        .deductions-row { background-color: #fff5f5; }
        .summary-section { display: table; width: 100%; margin-top: 16px; }
        .summary-spacer { display: table-cell; width: 40%; }
        .summary-table-cell { display: table-cell; width: 60%; vertical-align: top; }
        .summary-table { width: 100%; border-collapse: collapse; }
        .summary-table td { padding: 9px 12px; font-size: 13px; border-bottom: 1px solid #e8e8e8; }
        .summary-table td:last-child { text-align: right; font-weight: bold; }
        .summary-table tr.gross-row td { background-color: #f0f9f4; color: #065f46; }
        .summary-table tr.deduction-row td { background-color: #fff5f5; color: #991b1b; }
        .summary-table tr.net-row { background: #1e3a5f; }
        .summary-table tr.net-row td { color: #fff; font-size: 16px; font-weight: bold; padding: 12px; border-bottom: none; }
        .status-section { margin-top: 20px; }
        .status-badge { display: inline-block; padding: 3px 12px; border-radius: 12px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
        .status-draft { background-color: #f0f0f0; color: #666; }
        .status-processed { background-color: #dbeafe; color: #1d4ed8; }
        .status-approved { background-color: #d1fae5; color: #065f46; }
        .status-paid { background-color: #ede9fe; color: #5b21b6; }
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
            <div class="payslip-title">PAYSLIP</div>
            <div class="period-label">{{ $payrollRun->period_label ?? 'N/A' }}</div>
        </div>
    </div>

    <hr class="divider">

    {{-- Run Info --}}
    <div class="info-section">
        <div class="info-left">
            <div class="info-label">Pay Period</div>
            <div class="info-value">
                {{ $payrollRun->period_start ? $payrollRun->period_start->format('d M Y') : 'N/A' }}
                &mdash;
                {{ $payrollRun->period_end ? $payrollRun->period_end->format('d M Y') : 'N/A' }}
            </div>
        </div>
        <div class="info-right">
            <div class="info-label">Run Date</div>
            <div class="info-value">{{ $payrollRun->run_date ? $payrollRun->run_date->format('d M Y') : 'N/A' }}</div>
            <div class="info-label" style="margin-top: 10px;">Status</div>
            <div>
                <span class="status-badge status-{{ $payrollRun->status ?? 'draft' }}">
                    {{ ucfirst($payrollRun->status ?? 'draft') }}
                </span>
            </div>
        </div>
    </div>

    <hr class="divider">

    {{-- Earnings Section --}}
    <table>
        <thead>
            <tr class="section-header">
                <th>Earnings</th>
                <th class="text-right">Amount</th>
            </tr>
        </thead>
        <tbody>
            <tr class="earnings-row">
                <td>Gross Pay</td>
                <td class="text-right">{{ number_format((float)($payrollRun->attributes['total_gross'] ?? $payrollRun->total_gross), 2) }}</td>
            </tr>
        </tbody>
    </table>

    {{-- Deductions Section --}}
    <table>
        <thead>
            <tr class="section-header">
                <th>Deductions</th>
                <th class="text-right">Amount</th>
            </tr>
        </thead>
        <tbody>
            <tr class="deductions-row">
                <td>Total Deductions</td>
                <td class="text-right">{{ number_format((float)($payrollRun->attributes['total_deductions'] ?? 0), 2) }}</td>
            </tr>
        </tbody>
    </table>

    {{-- Summary --}}
    <div class="summary-section">
        <div class="summary-spacer"></div>
        <div class="summary-table-cell">
            @php
                $gross      = (float)($payrollRun->attributes['total_gross'] ?? 0);
                $deductions = (float)($payrollRun->attributes['total_deductions'] ?? 0);
                $net        = (float)($payrollRun->attributes['total_net'] ?? ($gross - $deductions));
            @endphp
            <table class="summary-table">
                <tr class="gross-row">
                    <td>Gross Pay</td>
                    <td>{{ number_format($gross, 2) }}</td>
                </tr>
                <tr class="deduction-row">
                    <td>Total Deductions</td>
                    <td>&minus; {{ number_format($deductions, 2) }}</td>
                </tr>
                <tr class="net-row">
                    <td>Net Pay</td>
                    <td>{{ number_format($net, 2) }}</td>
                </tr>
            </table>
        </div>
    </div>

    {{-- Employee Count --}}
    @if($payrollRun->employee_count)
        <div style="margin-top: 20px; font-size: 12px; color: #666;">
            <strong>Employees Included:</strong> {{ $payrollRun->employee_count }}
        </div>
    @endif

    {{-- Notes --}}
    @if($payrollRun->notes)
        <div style="margin-top: 16px; padding: 12px; background: #f5f5f5; border-left: 3px solid #1e3a5f; font-size: 12px; color: #555;">
            <strong>Notes:</strong><br>
            {{ $payrollRun->notes }}
        </div>
    @endif

    {{-- Footer --}}
    <div class="footer">
        Demo Company &mdash; Confidential Payslip &mdash; {{ $payrollRun->period_label ?? '' }}
    </div>

</div>
</body>
</html>
