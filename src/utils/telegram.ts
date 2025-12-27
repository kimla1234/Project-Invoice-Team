// utils/telegram.ts
export const TELEGRAM_BOT_TOKEN = "8573175865:AAFHVHf1Mg0PYRFaQDK1bsL9BLWto3D_-ks"; // replace with your bot token
export const TELEGRAM_CHAT_ID = "7972700273"; // replace with your chat ID

export async function sendMessageToTelegram(message: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const payload = {
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: "HTML", // optional: allows HTML formatting
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("Telegram response:", data);
    return data;
  } catch (err) {
    console.error("Telegram send error:", err);
    throw err;
  }
}
