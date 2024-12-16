import { inngest } from "./client";
import { TelegramService } from "@/modules/telegram/TelegramService";

export const postTelegramPromo = inngest.createFunction(
    { id: "post-telegram-promo", retries: 0 },
    // Run every 6 hours
    { cron: "0 */6 * * *" },

    async ({ event, step }) => {
        const telegramService = new TelegramService({
            botToken: process.env.TELEGRAM_BOT_TOKEN!,
            webhookUrl: `${process.env.VERCEL_PROJECT_PRODUCTION_URL}/api/telegram`,
            defaultChatId: process.env.TELEGRAM_DEFAULT_CHAT_ID!,
        });

        // send promo message
        const response = await telegramService.sendPromoMessage();
        return response;
    }
);
