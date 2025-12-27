// app/api/send-telegram/route.ts
import { NextResponse } from "next/server";

const TELEGRAM_BOT_TOKEN = "8573175865:AAFHVHf1Mg0PYRFaQDK1bsL9BLWto3D_-ks";
const TELEGRAM_CHAT_ID = "7972700273";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      return NextResponse.json({ error: data.description }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Telegram API error:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
