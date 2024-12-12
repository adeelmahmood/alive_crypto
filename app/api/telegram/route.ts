import { TelegramService } from "@/modules/telegram/TelegramService";
import { NextRequest, NextResponse } from "next/server";

const telegramService = new TelegramService({
    botToken: process.env.TELEGRAM_BOT_TOKEN!,
    webhookUrl: `${process.env.VERCEL_URL}/api/telegram`,
    defaultChatId: process.env.TELEGRAM_DEFAULT_CHAT_ID!,
});

export async function POST(req: NextRequest) {
    console.log("Received webhook request");

    // Verify webhook secret
    const secretToken = req.headers.get("x-telegram-bot-api-secret-token");

    if (secretToken !== process.env.TELEGRAM_WEBHOOK_SECRET) {
        console.error("Invalid secret token");
        return NextResponse.json({ status: 500 });
    }

    try {
        const update = await req.json();
        console.log("Received update:", JSON.stringify(update, null, 2));
        await telegramService.handleUpdate(update);

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Error processing telegram update:", error);
        return NextResponse.json({ error: `Internal server error: ${error}` }, { status: 500 });
    }
}