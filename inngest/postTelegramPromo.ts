import { inngest } from "./client";
import { TelegramService } from "@/modules/telegram/TelegramService";

export const postTelegramPromo = inngest.createFunction(
    { id: "post-telegram-promo", retries: 0 },
    { cron: "0 * * * *" }, // Run every hour

    async ({ event, step }) => {
        const telegramService = new TelegramService({
            botToken: process.env.TELEGRAM_BOT_TOKEN!,
            webhookUrl: `${process.env.VERCEL_URL}/api/telegram`,
            defaultChatId: process.env.TELEGRAM_DEFAULT_CHAT_ID!,
        });

        // send promo message
        const response = await telegramService.sendPromoMessage();
        return response;
    }
);
