import { ConversationService } from "@/modules/telegram/ConversationService";
import { TelegramService } from "@/modules/telegram/TelegramService";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    // Verify webhook secret
    const secretToken = req.headers.get("x-telegram-bot-api-secret-token");

    if (secretToken !== process.env.TELEGRAM_WEBHOOK_SECRET) {
        console.error("Invalid secret token");
        return NextResponse.json({ status: 500 });
    }

    try {
        const telegramService = new TelegramService({
            botToken: process.env.TELEGRAM_BOT_TOKEN!,
            webhookUrl: `${process.env.VERCEL_URL}/api/telegram`,
            defaultChatId: process.env.TELEGRAM_DEFAULT_CHAT_ID!,
        });

        // Set up the webhook
        const response = await telegramService.setWebhook();
        console.log("Telegram webhook set up successfully");

        // clear conversation history
        const conversationService = new ConversationService();
        await conversationService.clearConversationHistory(process.env.TELEGRAM_DEFAULT_CHAT_ID!);

        return NextResponse.json({ response }, { status: 200 });
    } catch (error) {
        console.error("Error setting up Telegram webhook:", error);
        return NextResponse.json({ error: `Internal server error: ${error}` }, { status: 500 });
    }
}
