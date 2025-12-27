// pages/api/send-telegram.ts
import type { NextApiRequest, NextApiResponse } from "next";

const TELEGRAM_BOT_TOKEN = "8573175865:AAFHVHf1Mg0PYRFaQDK1bsL9BLWto3D_-ks"; // replace with your bot token
const TELEGRAM_CHAT_ID = "7972700273"; // replace with your chat ID

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
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
      return res.status(500).json({ error: data.description });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Telegram API error:", err);
    return res.status(500).json({ error: "Failed to send message" });
  }
}
