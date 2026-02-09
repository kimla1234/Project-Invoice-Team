import { serialize } from "cookie";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const response = await fetch("http://localhost:8081/api/v1/auth/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ message: data.message || "Login failed" }, { status: response.status });
    }

    const { accessToken, refreshToken, user } = data;
    
    // refreshToken 
    if (!accessToken || !refreshToken) {
      return NextResponse.json({ message: "Backend did not provide tokens" }, { status: 500 });
    }

    // Cookie "refresh"  Default
    const cookieName = process.env.COOKIE_REFRESH_TOKEN_NAME || "refresh";

    const serialized = serialize(cookieName, refreshToken, {
      httpOnly: true, // ការពារ Hacker លួច Token តាមរយៈ JavaScript
      secure: process.env.NODE_ENV === "production",
      path: "/",      // ឱ្យគ្រប់ Route ក្នុង Next.js អាចមើលឃើញ Cookie នេះ
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, 
    });
    

    const res = NextResponse.json(
      { accessToken, user, message: "Login successful" },
      { status: 200 }
    );

    // Header Set-Cookie to Response
    res.headers.append("Set-Cookie", serialized);

    return res;

  } catch (error) {
    console.error("🔥 Unexpected error in /api/login:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}