<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Approval Required</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:sans-serif;">
    <div style="max-width:600px;margin:40px auto;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
        <div style="background-color:#1a56db;padding:24px 32px;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">ERP System</h1>
        </div>

        <div style="padding:32px;">
            <div style="background-color:#ede9fe;border:1px solid #7c3aed;border-radius:6px;padding:12px 16px;margin-bottom:24px;">
                <p style="margin:0;color:#4c1d95;font-size:14px;font-weight:600;">Action Required: Approval Pending</p>
            </div>

            <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">Approval Request</h2>

            <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
                An approval request has been submitted and requires your review.
            </p>

            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
                <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:14px;width:40%;">Requester</td>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;font-weight:600;">{{ $requesterName }}</td>
                </tr>
                <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:14px;">Request Title</td>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;font-weight:600;">{{ $requestTitle }}</td>
                </tr>
                <tr>
                    <td style="padding:10px 0;color:#6b7280;font-size:14px;">Type</td>
                    <td style="padding:10px 0;color:#111827;font-size:14px;font-weight:600;">{{ ucfirst($type) }}</td>
                </tr>
            </table>

            <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">
                Please log in to the ERP System to review and approve or reject this request.
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
