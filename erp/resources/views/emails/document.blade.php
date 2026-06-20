<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; font-size: 14px; color: #1e293b; padding: 24px;">
  <h2 style="font-size: 18px; margin-bottom: 8px;">{{ $subject }}</h2>
  @if($message_body)
  <p style="margin-bottom: 16px; color: #475569;">{{ $message_body }}</p>
  @endif
  <p style="margin-bottom: 16px; color: #475569;">Please find the attached PDF document.</p>
  <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">{{ $company }}</p>
</body>
</html>
