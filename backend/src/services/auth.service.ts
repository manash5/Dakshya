import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthService {
  async verifyGoogleToken(idToken: string) {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error("Invalid Google token");
    }
    return {
      googleId: payload.sub,
      email: payload.email,
      firstName: payload.given_name || "",
      lastName: payload.family_name || "",
    };
  }
}

export const authService = new AuthService();