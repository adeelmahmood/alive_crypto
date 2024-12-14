import { inngest } from "./client";
import { TelegramService } from "@/modules/telegram/TelegramService";

export const registerTelegramWebhook = inngest.createFunction(
    { id: "register-telegram-webhook", retries: 1 },
    { cron: "0 * * * *" }, // Run every hour

    async ({ event, step }) => {
        const telegramService = new TelegramService({
            botToken: process.env.TELEGRAM_BOT_TOKEN!,
            webhookUrl: `${process.env.VERCEL_PROJECT_PRODUCTION_URL}/api/telegram`,
            defaultChatId: process.env.TELEGRAM_DEFAULT_CHAT_ID!,
        });

        // Register webhook
        const response = await telegramService.setWebhook();
        return response;
    }
);
