import crypto from "crypto";

export function generateTempPassword(length = 10): string {
  return crypto.randomBytes(length).toString("base64").slice(0, length);
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}