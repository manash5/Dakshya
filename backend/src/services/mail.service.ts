import nodemailer from "nodemailer";

class MailService {
  private transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  async sendTempPassword(to: string, tempPassword: string) {
    await this.transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject: "Your account password",
      html: `<p>Welcome! Your temporary password is:</p>
             <p style="font-size:18px;font-weight:bold;">${tempPassword}</p>
             <p>Please log in and change your password immediately.</p>`,
    });
  }

  async sendResetLink(to: string, resetLink: string) {
    await this.transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject: "Reset your password",
      html: `<p>Click below to reset your password. This link expires in 1 hour.</p>
             <a href="${resetLink}">${resetLink}</a>`,
    });
  }
}

export const mailService = new MailService();