import axios from "axios";
import { ChatMessage, ConversationService } from "./ConversationService";
import {
    telegramSystemPrompt,
    telegramMessagePrompt,
    telegramPromoPrompt,
    telegramInstructionsPrompt,
} from "../prompts/telegramPrompt";
import { OpenAIService } from "../ai/OpenAIService";
import { TOKEN_NAME } from "@/constants";
import { ArtworkDatastore } from "../artwork/ArtworkDatastore";

export interface TelegramConfig {
    botToken: string;
    defaultChatId?: string;
    webhookUrl: string;
    respondOnlyToMentions?: boolean;
}

export interface MessageOptions {
    parseMode?: "HTML" | "MarkdownV2" | "Markdown";
    disableWebPagePreview?: boolean;
    disableNotification?: boolean;
    replyToMessageId?: number;
}

export interface TelegramResponse {
    ok: boolean;
    result?: any;
    description?: string;
}

export interface Update {
    update_id: number;
    message?: {
        message_id: number;
        from: {
            id: number;
            first_name?: string;
        };
        chat: {
            id: number;
            type: string;
        };
        reply_to_message?: {
            from: {
                id: number;
                is_bot: boolean;
                first_name?: string;
                username?: string;
            };
            text: string;
        };
        text?: string;
        date: number;
        entities?: [
            {
                type: string;
                offset: number;
                length: number;
                url?: string;
            }
        ];
    };
}

export class TelegramService {
    private readonly baseUrl: string;
    private readonly config: TelegramConfig;
    private aiService: OpenAIService;
    private conversationService: ConversationService;
    private artworkDataStore: ArtworkDatastore;

    constructor(config: TelegramConfig) {
        this.config = config;
        this.baseUrl = `https://api.telegram.org/bot${config.botToken}`;

        this.aiService = new OpenAIService();
        this.conversationService = new ConversationService();
        this.artworkDataStore = new ArtworkDatastore();
    }

    // called at the start of the service to set up the webhook and start message handling
    async setWebhook(): Promise<TelegramResponse> {
        try {
            const webhookUrl = this.config.webhookUrl.startsWith("https")
                ? this.config.webhookUrl
                : `https://${this.config.webhookUrl}`;
            console.log("Setting up Telegram webhook at URL:", webhookUrl);
            const response = await axios.post(`${this.baseUrl}/setWebhook`, {
                url: webhookUrl,
                allowed_updates: ["message"],
                secret_token: process.env.TELEGRAM_WEBHOOK_SECRET,
            });
            return { ok: true, result: response.data };
        } catch (error) {
            return this.handleError(error);
        }
    }

    async handleUpdate(update: Update): Promise<void> {
        if (update.message?.text) {
            const chatId = update.message.chat.id;

            // Store the incoming message
            await this.conversationService.addMessage(chatId, {
                messageId: update.message.message_id,
                sender: {
                    id: update.message.from.id,
                    name: update.message.from.first_name || "Unknown",
                    isBot: false,
                },
                text: update.message.text,
                timestamp: update.message.date,
            });

            // Check if the message mentions our bot
            if (
                this.config.respondOnlyToMentions &&
                (!update.message.entities || !this.mentionsOurBot(update))
            ) {
                console.log("Message does not mention our bot");
                return;
            }

            // Get conversation history
            const history = await this.conversationService.getConversationHistory(chatId);

            // Generate response based on context
            const response = await this.generateResponse(history, update.message.reply_to_message);
            // console.log("Generated response:", response);

            if (response) {
                const sentMessage = await this.sendMessage(response, chatId.toString(), {
                    replyToMessageId: update.message.message_id,
                });

                // Store bot's response if sent successfully
                if (sentMessage.ok && sentMessage.result) {
                    await this.conversationService.addMessage(chatId, {
                        messageId: sentMessage?.result?.message_id || 0,
                        sender: {
                            id: parseInt(this.config.botToken.split(":")[0]),
                            name: `${TOKEN_NAME} AI`,
                            isBot: true,
                        },
                        text: response,
                        timestamp: Math.floor(Date.now() / 1000),
                    });
                } else {
                    console.error("Failed to send message:", sentMessage.description);
                }
            }
        }
    }

    async sendMessage(
        text: string,
        chatId?: string,
        options: MessageOptions = {}
    ): Promise<TelegramResponse> {
        try {
            const targetChatId = chatId || this.config.defaultChatId;
            if (!targetChatId) {
                throw new Error("No chat ID provided or default chat ID set");
            }

            const response = await axios.post(`${this.baseUrl}/sendMessage`, {
                chat_id: targetChatId,
                text: text,
                parse_mode: options.parseMode,
                disable_web_page_preview: options.disableWebPagePreview,
                disable_notification: options.disableNotification,
                reply_to_message_id: options.replyToMessageId,
            });

            return { ok: true, result: response.data };
        } catch (error) {
            return this.handleError(error);
        }
    }

    async sendPhoto(
        photo: string,
        chatId?: string,
        caption?: string,
        options: MessageOptions = {}
    ): Promise<TelegramResponse> {
        try {
            const targetChatId = chatId || this.config.defaultChatId;
            if (!targetChatId) {
                throw new Error("No chat ID provided or default chat ID set");
            }

            const response = await axios.post(`${this.baseUrl}/sendPhoto`, {
                chat_id: targetChatId,
                photo: photo,
                caption: caption,
                parse_mode: options.parseMode,
                disable_notification: options.disableNotification,
                reply_to_message_id: options.replyToMessageId,
            });

            return { ok: true, result: response.data };
        } catch (error) {
            return this.handleError(error);
        }
    }

    private async generateResponse(
        history: ChatMessage[],
        replyToMessage?: any
    ): Promise<string | null> {
        // Format conversation history for the AI
        const formattedHistory = history.map((msg) => {
            const prefix = `[${msg.sender.name}]`;
            return `${prefix}: ${msg.text}`;
        });

        // if we are replying
        const replyToMessageText = replyToMessage?.text;
        if (replyToMessageText) {
            formattedHistory.push(
                `\n\nReply to this message: [${
                    replyToMessage.from.first_name || replyToMessage.from.username
                }]: ${replyToMessageText}`
            );
        }

        const response = await this.aiService.generateResponse(
            telegramSystemPrompt(),
            telegramMessagePrompt(formattedHistory.join("\n"))
        );

        if (!response.response) {
            console.error("Failed to generate response for conversation");
            return null;
        }

        // const needsReply = response.response.match(/<needs_reply>(.*?)<\/needs_reply>/)?.[1];
        // if (needsReply !== "true") {
        //     console.log(
        //         "No response needed:",
        //         response.response.match(/<reason>(.*?)<\/reason>/)?.[1]
        //     );
        //     return null;
        // }

        const messageContent = response.response.match(/<message>([\s\S]*?)<\/message>/)?.[1];
        return messageContent || null;
    }

    async sendPromoMessage(instructions?: string): Promise<TelegramResponse> {
        const response = await this.aiService.generateResponse(
            telegramSystemPrompt(),
            instructions ? telegramInstructionsPrompt(instructions) : telegramPromoPrompt()
        );

        if (!response.response) {
            console.error("Failed to generate promo message");
            return { ok: false, description: "Failed to generate promo message" };
        }
        // console.log("Generated promo message:", response.response);

        const messageContent = response.response.match(/<message>([\s\S]*?)<\/message>/)?.[1];

        if (!messageContent) {
            console.error("No message content found in response");
            return { ok: false, description: "No message content found in response" };
        }

        // send promo message
        const result = await this.sendMessage(messageContent, this.config.defaultChatId, {
            parseMode: "HTML",
        });

        // grab random artwork from the database
        const artwork = await this.artworkDataStore.getRandomArtwork();
        if (artwork) {
            const caption = `${artwork.title} by ${artwork.creator}`;
            await this.sendPhoto(artwork.imageUrl, this.config.defaultChatId, caption);
        }

        return result;
    }

    private mentionsOurBot(update: Update): boolean {
        // check if there is a mention of our token bot
        const mentions = update?.message?.entities?.filter((entity) => entity.type === "mention");
        if (!mentions || mentions.length === 0) {
            return false;
        }

        // go through all mentions
        for (const mention of mentions) {
            const mentionText = update?.message?.text?.substring(
                mention.offset,
                mention.offset + mention.length
            );
            if (mentionText === `@${TOKEN_NAME.toLowerCase()}aibot`) {
                return true;
            }
        }

        return false;
    }

    public async deleteWebhook(): Promise<void> {
        try {
            await axios.post(`${this.baseUrl}/deleteWebhook`);
        } catch (error) {
            console.error("Error deleting webhook:", error);
        }
    }

    private handleError(error: any): TelegramResponse {
        if (axios.isAxiosError(error) && error.response) {
            return {
                ok: false,
                description: error.response.data.description || error.message,
            };
        }
        return {
            ok: false,
            description: error instanceof Error ? error.message : "Unknown error occurred",
        };
    }
}
