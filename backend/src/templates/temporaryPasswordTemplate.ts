import { baseTemplate } from "./baseTemplate";

export const temporaryPasswordTemplate = (tempPassword: string) =>
  baseTemplate(`
    <h2 style="color:#1f2937;font-size:28px;margin:0 0 20px;">Welcome to Dakshya 🎉</h2>

    <p style="color:#374151;font-size:16px;line-height:1.7;margin:0 0 20px;">
      Your account has been successfully created. Use the temporary password below to sign in.
    </p>

    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;text-align:center;margin:0 0 28px;">
      <p style="margin:0 0 10px;color:#6b7280;font-size:14px;text-transform:uppercase;letter-spacing:1px;">
        Temporary Password
      </p>
      <p style="margin:0;color:#224315;font-size:30px;font-weight:bold;letter-spacing:1px;">
        ${tempPassword}
      </p>
    </div>

    <p style="color:#6b7280;font-size:14px;line-height:1.6;">
      For your security, you'll be asked to change this password after signing in.
    </p>
  `);