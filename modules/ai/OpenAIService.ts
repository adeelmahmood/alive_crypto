import OpenAI from "openai";
import { BaseAIService } from "./BaseAIService";
import chalk from "chalk";
import { LLM_MODELS } from "../utils/llmInfo";
import { AIImageResponse, AIResponse } from "@/types";
import { calculateLLMCost } from "../utils/llmCost";

export class OpenAIService extends BaseAIService {
    private openai: OpenAI;
    private useCache: boolean;

    constructor(model: string = LLM_MODELS.OPENAI_GPT_4O_MINI) {
        super(model);
        this.openai = new OpenAI();

        this.useCache = process.env.USE_AI_CACHE === "true";
    }

    async generateImage(prompt: string): Promise<AIImageResponse> {
        try {
            console.log(this.constructor.name, "Generating image for model", this.model);
            console.log(prompt);

            const completion = await this.openai.images.generate({
                prompt,
                model: "dall-e-3",
                response_format: "b64_json",
            });

            const response: AIImageResponse = {
                b64_json: completion.data[0].b64_json || "",
                revised_prompt: completion.data[0].revised_prompt || prompt,
            };

            return response;
        } catch (error) {
            console.error("Error generating AI response:", error);
            throw error;
        }
    }

    async generateResponse(systemPrompt: string, prompt: string): Promise<AIResponse> {
        const cacheKey = this.getCacheKey(this.model, systemPrompt, prompt);

        if (this.useCache) {
            const cachedResponse = await this.getCachedResponse(cacheKey);
            if (cachedResponse) {
                console.log(
                    chalk.green(
                        this.constructor.name,
                        "Using cached response for model",
                        this.model
                    )
                );
                return cachedResponse;
            }
        }

        try {
            console.log(this.constructor.name, "Generating response for model", this.model);

            const completion = await this.openai.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: systemPrompt,
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                model: this.model,
                temperature: 0,
            });

            const response = completion.choices[0]?.message?.content?.trim();
            if (!response) {
                throw new Error("No response generated.");
            }

            console.log("response usage", completion.usage);
            const { inputCost, outputCost } = calculateLLMCost(
                this.model,
                completion.usage?.prompt_tokens || 0,
                completion.usage?.completion_tokens || 0
            );

            const result: AIResponse = {
                response,
                inputTokens: completion.usage?.prompt_tokens || 0,
                outputTokens: completion.usage?.completion_tokens || 0,
                cost: inputCost + outputCost,
            };

            if (this.useCache) {
                await this.cacheResponse(cacheKey, result);
            }
            return result;
        } catch (error) {
            console.error("Error generating AI response:", error);
            throw error;
        }
    }
}
