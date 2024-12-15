import { TelegramService } from "@/modules/telegram/TelegramService";

export const telegram = async () => {
    const telegramService = new TelegramService({
        botToken: process.env.TELEGRAM_BOT_TOKEN!,
        webhookUrl: `${process.env.VERCEL_PROJECT_PRODUCTION_URL}/api/telegram`,
        defaultChatId: process.env.TELEGRAM_DEFAULT_CHAT_ID!,
    });

    try {
        await telegramService.sendPromoMessage();
    } catch (error) {
        console.error("Error setting up Telegram webhook:", error);
    }
};
