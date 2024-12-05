import { LLM_MODELS } from "@/modules/utils/llmInfo";
import { BaseAIService } from "./BaseAIService";
import { HyperbolicAIService } from "./HyperbolicAIService";

class AIServiceFactory {
    static createAIService(model: string): BaseAIService {
        switch (model) {
            case LLM_MODELS.HYPERBOLIC_META_LLAMA_3_1_405B_INSTRUCT:
                return new HyperbolicAIService(model);
            default:
                throw new Error(`Model ${model} not supported`);
        }
    }
}

export { AIServiceFactory };
