import { Redis } from "@upstash/redis";

export interface ChatMessage {
    messageId: number;
    sender: {
        id: number;
        name: string;
        isBot?: boolean;
    };
    text: string;
    timestamp: number;
}

export class ConversationService {
    private redis: Redis;
    private readonly MAX_MESSAGES = 50;

    constructor() {
        this.redis = Redis.fromEnv();
    }

    private getConversationKey(chatId: number | string): string {
        return `chat:${chatId}:history`;
    }

    async addMessage(chatId: number | string, message: ChatMessage): Promise<void> {
        const key = this.getConversationKey(chatId);

        // Add message to the list
        await this.redis.lpush(key, message);

        // Trim to keep only last MAX_MESSAGES
        await this.redis.ltrim(key, 0, this.MAX_MESSAGES - 1);

        // Set expiry for 1 hour to prevent unlimited storage growth
        await this.redis.expire(key, 1 * 60 * 60);
    }

    async getConversationHistory(chatId: number | string): Promise<ChatMessage[]> {
        const key = this.getConversationKey(chatId);
        const messages = await this.redis.lrange<ChatMessage>(key, 0, -1);

        // Messages are already deserialized by Redis
        return messages.reverse(); // Just reverse for chronological order
    }

    async clearConversationHistory(chatId: number | string): Promise<void> {
        const key = this.getConversationKey(chatId);
        await this.redis.del(key);
    }
}
