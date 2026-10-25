import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "team_catalog_session";

function getSecret() {
  return process.env.AUTH_SECRET || "services-catalog-auth-secret-key-321";
}

function createToken(teamName: string): string {
  const hmac = crypto.createHmac("sha256", getSecret());
  hmac.update(teamName.toLowerCase());
  const signature = hmac.digest("hex");
  return `${teamName}:${signature}`;
}

export async function verifySession(): Promise<{ isAuthenticated: boolean; teamName?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) {
      return { isAuthenticated: false };
    }

    const [teamName, signature] = token.split(":");
    if (!teamName || !signature) {
      return { isAuthenticated: false };
    }

    const expectedSignature = crypto
      .createHmac("sha256", getSecret())
      .update(teamName.toLowerCase())
      .digest("hex");

    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return { isAuthenticated: true, teamName };
    }
  } catch (error) {
    console.error("Session verification error:", error);
  }
  return { isAuthenticated: false };
}

export async function loginTeam(formData: {
  teamName: string;
  password: string;
}): Promise<{ success: boolean; error?: string }> {
  const expectedTeam = (process.env.AUTH_TEAM_NAME || "frontend_team").trim().toLowerCase();
  const expectedPass = process.env.AUTH_TEAM_PASSWORD || "Aa.13741995!!";

  const inputTeam = formData.teamName?.trim().toLowerCase();
  const inputPass = formData.password?.trim();

  if (!inputTeam || !inputPass) {
    return { success: false, error: "Please enter both team name and password." };
  }

  if (inputTeam !== expectedTeam || inputPass !== expectedPass) {
    return { success: false, error: "Invalid team credentials. Please verify your team name and password." };
  }

  const token = createToken(formData.teamName.trim());
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return { success: true };
}

export async function logoutTeam(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
