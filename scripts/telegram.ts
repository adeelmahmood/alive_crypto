import { TelegramService } from "@/modules/telegram/TelegramService";

export const telegram = async () => {
    const telegramService = new TelegramService({
        botToken: process.env.TELEGRAM_BOT_TOKEN!,
        webhookUrl: `${process.env.VERCEL_URL}/api/telegram`,
        defaultChatId: process.env.TELEGRAM_DEFAULT_CHAT_ID!,
    });

    try {
        await telegramService.setWebhook();
        console.log("Telegram webhook set up successfully");

        // keep running until Ctrl+C is pressed
        process.stdin.resume();

        process.on("SIGINT", async () => {
            console.log("Stopping Telegram service");
            // delete the webhook
            await telegramService.deleteWebhook();
            process.exit();
        });
    } catch (error) {
        console.error("Error setting up Telegram webhook:", error);
    }
};
