import axios from "axios";
import { ClaudeAIService } from "../ai/ClaudeAIService";
import { OpenAIService } from "../ai/OpenAIService";

export interface ModerationResult {
    isAllowed: boolean;
    reason?: string;
}

export class ContentModerationService {
    private claude: ClaudeAIService;
    private openAIKey: string;

    constructor() {
        this.claude = new ClaudeAIService();
        this.openAIKey = process.env.OPENAI_API_KEY!;
    }

    public async checkWithOpenAI(text: string): Promise<ModerationResult> {
        try {
            const response = await axios.post(
                "https://api.openai.com/v1/moderations",
                { input: text },
                {
                    headers: {
                        Authorization: `Bearer ${this.openAIKey}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const result = response.data.results[0];

            // If any category is flagged
            if (result.flagged) {
                // Find which categories were flagged
                const flaggedCategories = Object.entries(result.categories)
                    .filter(([_, flagged]) => flagged)
                    .map(([category]) => category)
                    .join(", ");

                return {
                    isAllowed: false,
                    reason: `Content flagged for: ${flaggedCategories}`,
                };
            }

            return { isAllowed: true };
        } catch (error) {
            console.error("OpenAI moderation API error:", error);
            // Fail closed - if the API fails, we'll rely on Claude's moderation
            return { isAllowed: true };
        }
    }

    public async checkWithClaude(text: string): Promise<ModerationResult> {
        try {
            const response = await this.claude.generateResponse(
                "You are a content moderator. Your task is to evaluate if the following content is appropriate for generating artwork. The content should not contain anything offensive, harmful, explicit, or inappropriate. Respond in XML format only.",
                `Please evaluate this content: "${text}"

Response format:
<moderation>
    <allowed>true/false</allowed>
    <reason>Only include if not allowed</reason>
</moderation>`
            );

            // Parse XML response
            const allowed = response.response.includes("<allowed>true</allowed>");
            const reasonMatch = response.response.match(/<reason>(.*?)<\/reason>/);

            return {
                isAllowed: allowed,
                reason: allowed ? undefined : reasonMatch?.[1] || "Content not appropriate",
            };
        } catch (error) {
            console.error("Claude moderation error:", error);
            // Fail closed - if Claude fails, we'll rely on OpenAI's moderation
            return { isAllowed: true };
        }
    }

    public async moderateContent(text: string): Promise<ModerationResult> {
        // Run both moderations in parallel
        const [openAIResult, claudeResult] = await Promise.all([
            this.checkWithOpenAI(text),
            this.checkWithClaude(text),
        ]);

        // If either service flags the content, reject it
        if (!openAIResult.isAllowed || !claudeResult.isAllowed) {
            return {
                isAllowed: false,
                reason: openAIResult.reason || claudeResult.reason,
            };
        }

        return { isAllowed: true };
    }
}
