
import { cookies } from "next/headers";
import { randomBytes } from "crypto";

const CSRF_COOKIE = "csrf_token";

export function issueCsrfToken() {
  const token = randomBytes(32).toString("hex");
  const store = cookies();
  store.set(CSRF_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });
  return token;
}

export function verifyCsrfToken(token: string | null) {
  const store = cookies();
  const cookie = store.get(CSRF_COOKIE);
  if (!token || !cookie || cookie.value !== token) {
    throw new Error("Ungültiger CSRF-Token");
  }
}


