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
      },
    );

    // នៅក្នុង app/api/refresh/route.ts
    // ២. Handle Error ពី Backend
    if (!response.ok) {
      const errorText = await response.text(); // ប្រើ .text() សិនដើម្បីការពារ JSON parse error
      console.error(`❌ Backend error (${response.status}):`, errorText);

  // LOOK AT YOUR TERMINAL (where you ran npm run dev)
  console.error("DEBUG: Backend Refresh Failed!");
  console.error("Status:", response.status);
  console.error("Response body from Spring Boot:", errorText);


      // បើ Backend បោះ 400, 401 ឬ 404 មានន័យថា Session នេះលែងប្រើបានហើយ
      if ([400, 401, 404].includes(response.status)) {
        const nextResponse = NextResponse.json(
          { message: "Session expired or invalid" },
          { status: 401 }
        );

        // លុប Cookie ចោលដើម្បីឱ្យ Middleware ទាត់ទៅ Login វិញ និងបញ្ឈប់ការ Loop
       // nextResponse.cookies.delete(cookieName);
        return nextResponse;
      }
      
      return NextResponse.json({ message: "Refresh failed" }, { status: response.status });
    }

    

    const data = await response.json();
    const { accessToken, refreshToken: newRefreshToken } = data;

    if (!accessToken || !newRefreshToken) {
      console.error("❌ Missing tokens in backend response:", data);
      return NextResponse.json(
        { message: "Invalid token response" },
        { status: 500 },
      );
    }

    // Save new refresh token in httpOnly cookie
    const serialized = serialize(cookieName, newRefreshToken, {
      httpOnly: true,
      //secure: process.env.NODE_ENV === "development",
      secure: false,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, 
    });

    return NextResponse.json(
      { accessToken },
      { headers: { "Set-Cookie": serialized } },
    );
  } catch (error) {
    console.error("🔥 Next.js Internal Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
