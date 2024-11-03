import { LLM_MODELS } from "@/modules/utils/llmInfo";
import { BaseAIService } from "./BaseAIService";
import { ClaudeAIService } from "./ClaudeAIService";
import { OpenAIService } from "./OpenAIService";

class AIServiceFactory {
    static createAIService(model: string): BaseAIService {
        switch (model) {
            case LLM_MODELS.OPENAI_GPT_4O_MINI:
            case LLM_MODELS.OPENAI_GPT_4O:
                return new OpenAIService(model);
            case LLM_MODELS.ANTHROPIC_CLAUDE_3_HAIKU:
            case LLM_MODELS.ANTHROPIC_CLAUDE_3_5_SONNET:
                return new ClaudeAIService(model);
            default:
                throw new Error(`Model ${model} not supported`);
        }
    }
}

export { AIServiceFactory };
