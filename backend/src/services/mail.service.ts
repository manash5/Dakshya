import nodemailer from "nodemailer";
import path from "path";
import dotenv from "dotenv";

import { resetPasswordTemplate } from "..//templates/resetPasswordTemplate";
import { temporaryPasswordTemplate } from "..//templates/temporaryPasswordTemplate";

dotenv.config();
dotenv.config();
console.log("cwd:", process.cwd());
console.log("APP_URL:", process.env.APP_URL);
console.log("GMAIL_USER:", process.env.GMAIL_USER);

class MailService {
  private transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GOOGLE_APP_PASSWORD,
    },
  });

     logoPath = path.resolve(
    __dirname,
    "../..",
    "../frontend/public/dakshya_main.png"
);

  async sendTempPassword(to: string, tempPassword: string) {
    await this.transporter.sendMail({
      from: `Dakshya <${process.env.GMAIL_USER}>`,
      to,
      subject: "Welcome to Dakshya",
      html: temporaryPasswordTemplate(tempPassword),
      attachments: [
        {
          filename: "dakshya-logo.png",
          path: this.logoPath,
          cid: "dakshya-logo",
        },
      ],
    });
  }

  async sendResetLink(to: string, resetLink: string) {
    await this.transporter.sendMail({
      from: `Dakshya <${process.env.GMAIL_USER}>`,
      to,
      subject: "Reset your Dakshya password",
      html: resetPasswordTemplate(resetLink),
      attachments: [
        {
          filename: "dakshya-logo.png",
          path: this.logoPath,
          cid: "dakshya-logo",
        },
      ],
    });
  }
}

export const mailService = new MailService();