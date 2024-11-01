import { loadEnvConfig } from "@next/env";
import OnChainDataFetcher from "@/modules/crypto/OnChainDataFetcher";
import OnChainDataInsights from "@/modules/crypto/OnChainDataInsights";
import MarketDataFetcher from "@/modules/crypto/MarketDataFetcher";
import Anthropic from "@anthropic-ai/sdk";
import { generateSystemPrompt } from "@/modules/prompts/systemPrompt";
import { generateTwitterPrompt } from "@/modules/prompts/twitterPrompt";

loadEnvConfig("");

export const post = async () => {
    const marketDataFetcher = MarketDataFetcher.getInstance();
    const onchaindataFetcher = OnChainDataFetcher.getInstance();
    const onchaindataInsights = OnChainDataInsights.getInstance();

    const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY!,
    });

    try {
        // get major coins
        const majorCoins = await marketDataFetcher.getMajorCoins();
        // console.log("Major coins:", majorCoins);

        // Get on-chain data
        const onchaindata = await onchaindataFetcher.getMetrics();
        // console.log("On-chain metrics:", onchaindata);

        // Get insights
        const marketInsight = await onchaindataInsights.generateInsights(onchaindata.transfers);
        // console.log("Market insight:", JSON.stringify(marketInsight, null, 2));

        const systemPrompt = generateSystemPrompt();
        const userPrompt = generateTwitterPrompt([], marketInsight, majorCoins);
        console.log("System Prompt:", systemPrompt);
        console.log("User Prompt:", userPrompt);

        // Call Alive
        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1000,
            temperature: 0.8,
            system: systemPrompt,
            messages: [
                {
                    role: "user",
                    content: userPrompt,
                },
            ],
        });

        console.log("Response:", response);
    } catch (error) {
        console.error("Error:", error);
    }
};
