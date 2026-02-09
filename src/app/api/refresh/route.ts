import { serialize } from "cookie";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const cookieName = process.env.COOKIE_REFRESH_TOKEN_NAME || "refresh";
    const credential = cookieStore.get(cookieName);

    if (!credential) {
      console.error("❌ No refresh token found in cookies.");
      return NextResponse.json({ message: "Token not found" }, { status: 401 });
    }

    const refreshToken = credential.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_NORMPLOV_API_URL}/api/v1/auth/refresh-token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      }
    );

    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Backend rejected refresh:", errorText);
      return NextResponse.json({ message: "Refresh failed" }, { status: response.status });
    }

    const data = await response.json();
    const { accessToken, refreshToken: newRefreshToken } = data;

    if (!accessToken || !newRefreshToken) {
      console.error("❌ Missing tokens in backend response:", data);
      return NextResponse.json({ message: "Invalid token response" }, { status: 500 });
    }

    // Save new refresh token in httpOnly cookie
    const serialized = serialize(cookieName, newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json(
      { accessToken },
      { headers: { "Set-Cookie": serialized } }
    );
  } catch (error) {
    console.error("🔥 Next.js Internal Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
