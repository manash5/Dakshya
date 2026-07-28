export const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f6f8f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f8f6;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;padding:40px;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <img src="cid:dakshya-logo" alt="Dakshya" width="220" style="display:block;margin:0 auto;" />
              <p style="margin:12px 0 0;color:#6b7280;font-size:14px;">
                Your AI-Powered Career Growth Platform
              </p>
            </td>
          </tr>

          <tr>
            <td>
              ${content}
            </td>
          </tr>

          <tr>
            <td style="padding-top:32px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">
                Need help? <a href="mailto:support@dakshya.com" style="color:#224315;">support@dakshya.com</a><br/>
                © 2026 Dakshya. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;