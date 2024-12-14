import { ConversationService } from "@/modules/telegram/ConversationService";
import { TelegramService } from "@/modules/telegram/TelegramService";

export const telegramchat = async () => {
    async function sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function simulateConversation() {
        const telegramService = new TelegramService({
            botToken: process.env.TELEGRAM_BOT_TOKEN!,
            webhookUrl: `${process.env.VERCEL_PROJECT_PRODUCTION_URL}/api/telegram`,
            defaultChatId: process.env.TELEGRAM_DEFAULT_CHAT_ID!,
        });

        // Test chat ID
        const chatId = 123456;

        // Clear any existing conversation
        const conversationService = new ConversationService();
        await conversationService.clearConversationHistory(chatId);

        // Simulate conversation
        const conversation = [
            {
                id: 1,
                name: "Alice",
                text: "Hey fam! Who's excited about the latest $Ludum pump? 🚀",
                messageId: 1001,
            },
            {
                id: 2,
                name: "Bob",
                text: "Bruh I've been loading my bags since last week! 💎🙌",
                messageId: 1002,
            },
            {
                id: 3,
                name: "Charlie",
                text: "You guys seeing these green candles? Insane!",
                messageId: 1003,
            },
            {
                id: 1,
                name: "Alice",
                text: "@bob smart move! I think we're still early tbh",
                messageId: 1004,
            },
            {
                id: 4,
                name: "David",
                text: "What's the market cap looking like rn?",
                messageId: 1005,
            },
            {
                id: 2,
                name: "Bob",
                text: "Charts looking bullish af 📈",
                messageId: 1006,
            },
            {
                id: 3,
                name: "Charlie",
                text: "Anyone know when the NFT drop is happening?",
                messageId: 1007,
            },
            {
                id: 1,
                name: "Alice",
                text: "The community is growing so fast! Love to see it 🔥",
                messageId: 1008,
            },
        ];

        console.log("Starting conversation simulation...\n");

        for (const msg of conversation) {
            console.log(`\n[${msg.name}]: ${msg.text}`);

            // Create update object similar to Telegram's format
            const update = {
                update_id: Math.floor(Math.random() * 1000000),
                message: {
                    message_id: msg.messageId,
                    from: {
                        id: msg.id,
                        first_name: msg.name,
                        is_bot: false,
                    },
                    chat: {
                        id: chatId,
                        type: "group",
                    },
                    text: msg.text,
                    date: Math.floor(Date.now() / 1000),
                },
            };

            // Process the message
            await telegramService.handleUpdate(update);

            // Wait a bit between messages to simulate real conversation timing
            console.log("\n[🤖 BOT]: (thinking...)");
            await sleep(3000);
            // break;
        }

        // Get final conversation history
        const history = await conversationService.getConversationHistory(chatId);
        console.log("\n\nFinal conversation history:");
        history.forEach((msg) => {
            const sender = msg.sender.isBot ? "🤖 BOT" : msg.sender.name;
            console.log(`[${sender}]: ${msg.text}`);
        });
    }

    // Run the simulation
    simulateConversation().catch(console.error);
};
