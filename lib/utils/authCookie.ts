const ONE_HOUR = 60 * 60;

export const AUTH_COOKIE_NAME = "auth";

export function authCookieOptions() {
  return {
    httpOnly: true,
    path: "/",
    maxAge: ONE_HOUR,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}
