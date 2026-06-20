<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payslip — {{ $payslip->employee->first_name ?? '' }} {{ $payslip->employee->last_name ?? '' }}</title>
  @include('pdf.partials._styles')
  <style>
    .payslip-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
    .earnings-table, .deductions-table { width: 48%; display: inline-table; border-collapse: collapse; }
    .section-title { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 6px; letter-spacing: 0.05em; }
    .two-col { display: flex; gap: 4%; margin-bottom: 16px; }
    .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px 16px; margin-top: 20px; }
    .net-pay { font-size: 20px; font-weight: bold; color: #0f172a; }
    .badge-processed { background: #dcfce7; color: #16a34a; }
    .badge-draft     { background: #f1f5f9; color: #64748b; }
  </style>
</head>
<body>
<div class="page">
  {{-- Header --}}
  <div style="display:flex; justify-content:space-between; margin-bottom:24px;">
    <div>
      <h1 style="font-size:22px;font-weight:bold;color:#0f172a;">{{ $company }}</h1>
      <div style="color:#64748b;margin-top:4px;font-size:12px;">Payslip</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:16px;font-weight:bold;">{{ $payslip->employee->first_name ?? '—' }} {{ $payslip->employee->last_name ?? '' }}</div>
      <div style="color:#64748b;font-size:11px;">{{ $payslip->employee->position ?? '' }}</div>
      <div style="color:#64748b;font-size:11px;margin-top:2px;">Emp #{{ $payslip->employee->employee_number ?? $payslip->employee_id }}</div>
    </div>
  </div>

  {{-- Meta --}}
  <table class="meta-table" style="margin-bottom:20px;">
    <tr>
      <td class="label">Pay Period:</td>
      <td>{{ \Carbon\Carbon::parse($payslip->payrollRun->period_start ?? now())->format('d M Y') }} — {{ \Carbon\Carbon::parse($payslip->payrollRun->period_end ?? now())->format('d M Y') }}</td>
      <td class="label">Department:</td>
      <td>{{ $payslip->employee->department?->name ?? '—' }}</td>
    </tr>
    <tr>
      <td class="label">Pay Date:</td>
      <td>{{ \Carbon\Carbon::parse($payslip->payrollRun->payment_date ?? now())->format('d M Y') }}</td>
      <td class="label">Status:</td>
      <td><span class="badge badge-{{ $payslip->payrollRun->status ?? 'draft' }}">{{ strtoupper($payslip->payrollRun->status ?? 'draft') }}</span></td>
    </tr>
  </table>

  {{-- Earnings / Deductions --}}
  <div class="two-col">
    {{-- Earnings --}}
    <div style="flex:1;">
      <div class="section-title">Earnings</div>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="background:#f1f5f9;padding:6px 8px;text-align:left;font-size:10px;color:#64748b;border-bottom:1px solid #e2e8f0;">Description</th>
            <th style="background:#f1f5f9;padding:6px 8px;text-align:right;font-size:10px;color:#64748b;border-bottom:1px solid #e2e8f0;">Amount</th>
          </tr>
        </thead>
        <tbody>
          @foreach($payslip->lines->where('category', 'earning') as $line)
          <tr>
            <td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;">{{ $line->name }}</td>
            <td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;text-align:right;">{{ number_format((float)$line->amount, 2) }}</td>
          </tr>
          @endforeach
          @if($payslip->lines->where('category', 'earning')->isEmpty())
          <tr><td colspan="2" style="padding:8px;color:#94a3b8;font-style:italic;">Basic Salary</td></tr>
          @endif
        </tbody>
        <tfoot>
          <tr style="font-weight:bold;border-top:1px solid #e2e8f0;">
            <td style="padding:6px 8px;">Gross Pay</td>
            <td style="padding:6px 8px;text-align:right;">{{ number_format((float)$payslip->gross_amount, 2) }}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    {{-- Deductions --}}
    <div style="flex:1;">
      <div class="section-title">Deductions</div>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="background:#f1f5f9;padding:6px 8px;text-align:left;font-size:10px;color:#64748b;border-bottom:1px solid #e2e8f0;">Description</th>
            <th style="background:#f1f5f9;padding:6px 8px;text-align:right;font-size:10px;color:#64748b;border-bottom:1px solid #e2e8f0;">Amount</th>
          </tr>
        </thead>
        <tbody>
          @foreach($payslip->lines->where('category', 'deduction') as $line)
          <tr>
            <td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;">{{ $line->name }}</td>
            <td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;text-align:right;">{{ number_format((float)$line->amount, 2) }}</td>
          </tr>
          @endforeach
          @if($payslip->lines->where('category', 'deduction')->isEmpty())
          <tr>
            <td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;">Income Tax</td>
            <td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;text-align:right;">{{ number_format((float)$payslip->tax_amount, 2) }}</td>
          </tr>
          @endif
        </tbody>
        <tfoot>
          <tr style="font-weight:bold;border-top:1px solid #e2e8f0;">
            <td style="padding:6px 8px;">Total Deductions</td>
            <td style="padding:6px 8px;text-align:right;">{{ number_format((float)$payslip->total_deductions, 2) }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>

  {{-- Net Pay Summary --}}
  <div class="summary-box">
    <table style="width:100%;">
      <tr>
        <td style="font-size:12px;color:#64748b;">Gross Pay</td>
        <td style="text-align:right;font-size:12px;">{{ number_format((float)$payslip->gross_amount, 2) }}</td>
        <td style="width:40%;"></td>
        <td rowspan="3" style="text-align:right;vertical-align:middle;padding-left:20px;">
          <div style="font-size:10px;color:#64748b;text-transform:uppercase;margin-bottom:4px;">Net Pay</div>
          <div class="net-pay">{{ number_format((float)$payslip->net_amount, 2) }}</div>
        </td>
      </tr>
      <tr>
        <td style="color:#64748b;font-size:12px;">Total Deductions</td>
        <td style="text-align:right;font-size:12px;">- {{ number_format((float)$payslip->total_deductions, 2) }}</td>
        <td></td>
      </tr>
      <tr>
        <td style="font-size:12px;color:#64748b;">Tax Amount</td>
        <td style="text-align:right;font-size:12px;">{{ number_format((float)$payslip->tax_amount, 2) }}</td>
        <td></td>
      </tr>
    </table>
  </div>

  @if($payslip->notes)
  <p style="margin-top:16px;color:#64748b;font-size:11px;">Notes: {{ $payslip->notes }}</p>
  @endif

  <div class="footer">Generated {{ now()->format('d M Y') }} · {{ $company }} · Confidential</div>
</div>
</body>
</html>
