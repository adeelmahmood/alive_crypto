import { TelegramService } from "@/modules/telegram/TelegramService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    // Make sure the request is authorized
    const authHeader = req.headers.get("authorization");
    console.log("Received auth header:", authHeader);
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        console.error("Unauthorized request");
        return new Response("Unauthorized", {
            status: 401,
        });
    }

    try {
        const telegramService = new TelegramService({
            botToken: process.env.TELEGRAM_BOT_TOKEN!,
            webhookUrl: `${process.env.VERCEL_PROJECT_PRODUCTION_URL}/api/telegram`,
            defaultChatId: process.env.TELEGRAM_DEFAULT_CHAT_ID!,
        });

        // Set up the webhook
        const response = await telegramService.setWebhook();
        console.log("Telegram webhook set up successfully");

        // clear conversation history
        // const conversationService = new ConversationService();
        // await conversationService.clearConversationHistory(process.env.TELEGRAM_DEFAULT_CHAT_ID!);

        return NextResponse.json({ response }, { status: 200 });
    } catch (error) {
        console.error("Error setting up Telegram webhook:", error);
        return NextResponse.json({ error: `Internal server error: ${error}` }, { status: 500 });
    }
}
