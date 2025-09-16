import { cookies, headers } from "next/headers";
import { randomBytes } from "crypto";

const CSRF_COOKIE = "csrf_token";

export function createCsrfToken() {
  return randomBytes(32).toString("hex");
}

export function setCsrfCookie(token: string) {
  const store = cookies();
  store.set(CSRF_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });
}

export async function requestCsrfToken() {
  const headerList = headers();
  const forwardedProto = headerList.get("x-forwarded-proto");
  const host = headerList.get("host");
  const base = process.env.APP_BASE_URL ?? `${forwardedProto ?? (process.env.NODE_ENV === "production" ? "https" : "http")}://${host ?? "localhost:3000"}`;

  const response = await fetch(new URL("/api/csrf", base).toString(), {
    method: "GET",
    cache: "no-store",
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("CSRF-Token konnte nicht erstellt werden");
  }

  const payload = (await response.json()) as { token: string };
  return payload.token;
}

export function verifyCsrfToken(token: string | null) {
  const store = cookies();
  const cookie = store.get(CSRF_COOKIE);
  if (!token || !cookie || cookie.value !== token) {
    throw new Error("Ungültiger CSRF-Token");
  }
}
