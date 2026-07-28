import { baseTemplate } from "./baseTemplate";

export const resetPasswordTemplate = (resetLink: string) =>
  baseTemplate(`
    <h2 style="color:#1f2937;font-size:28px;margin:0 0 20px;">Reset your password</h2>

    <p style="color:#374151;font-size:16px;line-height:1.7;margin:0 0 20px;">
      We received a request to reset the password for your Dakshya account.
    </p>

    <p style="color:#374151;font-size:16px;line-height:1.7;margin:0 0 28px;">
      If you made this request, click the button below to create a new password.
      If you didn't request a password reset, you can safely ignore this email.
    </p>

    <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      <tr>
        <td align="center" bgcolor="#224315" style="border-radius:10px;">
          <a href="${resetLink}"
             style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none;">
             Reset Password
          </a>
        </td>
      </tr>
    </table>

    <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">
      This link will expire in <strong>1 hour</strong> for security reasons.
    </p>

    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px;">
      <p style="margin:0 0 8px;color:#374151;font-size:14px;font-weight:bold;">
        If the button doesn't work, copy this link:
      </p>
      <p style="margin:0;color:#224315;font-size:14px;word-break:break-all;">
        ${resetLink}
      </p>
    </div>
  `);