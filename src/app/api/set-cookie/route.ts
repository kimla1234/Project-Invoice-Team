// src/app/api/auth/set-cookie/route.ts
import { serialize } from "cookie";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json({ message: "No token provided" }, { status: 400 });
    }

    // Middleware (final-refresh-token)
    const cookieName = "final-refresh-token";

    const serialized = serialize(cookieName, refreshToken, {
      httpOnly: true, 
      //secure: process.env.NODE_ENV === "development",
      secure: false,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, 
    });

    return NextResponse.json(
      { success: true },
      { headers: { "Set-Cookie": serialized } }
    );
  } catch (error) {
    console.error("Cookie API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}