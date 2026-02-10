import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieName = process.env.COOKIE_REFRESH_TOKEN_NAME || "refresh";
  const cookieStore = await cookies();

  // Manually override the cookie to expire it immediately
  cookieStore.set(cookieName, "", {
    path: "/",
    expires: new Date(0), // Sets expiration to 1970
    maxAge: 0,            // Ensures immediate deletion in modern browsers
    httpOnly: true,
    secure: process.env.NODE_ENV === "development",
    sameSite: "lax",
  });

  return NextResponse.json({ message: "Logout successful" }, { status: 200 });
}