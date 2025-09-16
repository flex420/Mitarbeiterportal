import { NextResponse } from "next/server";
import { createCsrfToken, setCsrfCookie } from "@/lib/csrf";

export async function GET() {
  const token = createCsrfToken();
  setCsrfCookie(token);
  return NextResponse.json({ token });
}
