import OpenAI from "openai";
import { BaseAIService } from "./BaseAIService";
import chalk from "chalk";
import { LLM_MODELS } from "../utils/llmInfo";
import { AIImageResponse, AIResponse } from "@/types";
import { calculateLLMCost } from "../utils/llmCost";
import axios from "axios";
import { printHeader } from "../utils/console";

export class HyperbolicAIService extends BaseAIService {
    private openai: OpenAI;
    private useCache: boolean;

    BASE_URL = "https://api.hyperbolic.xyz/v1";

    constructor(model: string = LLM_MODELS.HYPERBOLIC_META_LLAMA_3_1_405B_INSTRUCT) {
        super(model);
        this.openai = new OpenAI({
            apiKey: process.env.HYPERBOLIC_API_KEY,
            baseURL: this.BASE_URL,
        });

        this.useCache = process.env.USE_AI_CACHE === "true";
    }

    async generateImage(prompt: string): Promise<AIImageResponse> {
        try {
            console.log(this.constructor.name, "Generating image using Hyperbolic API");

            const apiUrl = `${this.BASE_URL}/image/generation`;
            const apiKey = process.env.HYPERBOLIC_API_KEY;

            const response = await axios.post(
                apiUrl,
                {
                    model_name: "SDXL1.0-base",
                    prompt,
                    height: 1024,
                    width: 1024,
                    backend: "auto",
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${apiKey}`,
                    },
                }
            );

            const completion = response.data;

            if (!completion.images || completion.images.length === 0) {
                throw new Error("No images found in the response.");
            }

            const imageBase64 = completion.images[0]?.image || "";

            const aiResponse: AIImageResponse = {
                b64_json: imageBase64,
                revised_prompt: prompt, // Hyperbolic does not revise the prompt
            };

            return aiResponse;
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

            // printHeader("System Prompt", systemPrompt);
            printHeader("User Prompt", prompt);

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
                max_tokens: 512,
                temperature: 1,
            });

            const response = completion.choices[0]?.message?.content?.trim();
            if (!response) {
                throw new Error("No response generated.");
            }
            console.log("response", response);

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
