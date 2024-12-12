import { HyperbolicAIService } from "@/modules/ai/HyperbolicAIService";
import { LLM_MODELS } from "@/modules/utils/llmInfo";

export const llm = async () => {
    const ai31405b = new HyperbolicAIService(LLM_MODELS.HYPERBOLIC_META_LLAMA_3_1_405B_INSTRUCT);
    const ai318b = new HyperbolicAIService(LLM_MODELS.HYPERBOLIC_META_LLAMA_3_1_8B_INSTRUCT);
    const ai3370b = new HyperbolicAIService(LLM_MODELS.HYPERBOLIC_META_LLAMA_3_3_70B_INSTRUCT);

    const TEST_PROMPTS = Array(10).fill("Write a complex paragraph about human evolution");

    async function runTest(ai: any, prompt: string) {
        const start = Date.now();
        await ai.generateResponse("You are a writer", prompt);
        return Date.now() - start;
    }

    async function runComparison() {
        console.log("Running 10 tests for each model...\n");

        for (let i = 0; i < 10; i++) {
            console.log(`Test ${i + 1}:`);
            console.log(`405B: ${await runTest(ai31405b, TEST_PROMPTS[i])}ms`);
            console.log(`8B: ${await runTest(ai318b, TEST_PROMPTS[i])}ms`);
            console.log(`70B: ${await runTest(ai3370b, TEST_PROMPTS[i])}ms\n`);

            // Delay between tests
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }

    runComparison().catch(console.error);
};
