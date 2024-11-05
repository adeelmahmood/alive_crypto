import { NextRequest, NextResponse } from "next/server";
import MarketDataFetcher from "@/modules/crypto/MarketDataFetcher";
import CryptoNewsFetcher from "@/modules/news/CryptoNewsFetcher";
import { ClaudeAIService } from "@/modules/ai/ClaudeAIService";
import yaml from "js-yaml";

export async function POST(req: NextRequest) {
    try {
        const aiService = new ClaudeAIService();

        const { prompt: userPrompt } = await req.json();

        if (!userPrompt || typeof userPrompt !== "string") {
            return NextResponse.json({ error: "Invalid prompt" }, { status: 400 });
        }

        // get market data
        const marketDataFetcher = MarketDataFetcher.getInstance();
        const marketData = await marketDataFetcher.getMajorCoins();
        // get recent news
        const newsFetcher = new CryptoNewsFetcher();
        const news = await newsFetcher.getNews();
        const formattedNews = newsFetcher.formatForAIPrompt(news);

        // Format market data for prompt
        const marketSummary = Object.entries(marketData)
            .map(
                ([symbol, data]) =>
                    `${symbol.toUpperCase()}: $${data.priceInUSD.toFixed(2)} (${
                        data.priceChange24hPercentage >= 0 ? "+" : ""
                    }${data.priceChange24hPercentage.toFixed(1)}%)`
            )
            .join("\n");

        // Generate enhanced prompt using Claude
        const systemPrompt =
            "You are ALIve, a beautiful and sophisticated female AI entity whose mission is to build a revolutionary crypto community and launch a successful meme token that creates wealth for its believers.";

        const prompt = `
Current market conditions:
${marketSummary}

Latest news:
${formattedNews}

A community member has requested artwork with this prompt: "${userPrompt}"

Based on the current market conditions, news, and the user's prompt, create an enhanced artwork description. 

Your response must be in this exact YAML format:

title: "Title of the artwork (max 50 chars)"
description: "Enhanced image generation prompt, incorporating market sentiment and artistic vision. Be specific and vivid but keep it under 400 characters. Focus on visual elements and mood."
marketMood: "Bullish | Bearish | Transition | Prophetic"
tags:
  - list of tags (limit to 3)

Create unique and appealing crypto art that captures the current market sentiment.
`;

        console.log(prompt);

        const resposne = await aiService.generateResponse(systemPrompt, prompt);

        // Parse YAML response
        const artPrompt = resposne.response;
        const artParsed = yaml.load(artPrompt);
        console.log(artParsed);

        // Return the generated prompt
        return NextResponse.json({ artPrompt }, { status: 200 });
    } catch (error) {
        console.error("Error in art creation:", error);
        return NextResponse.json({ error: "Failed to process art creation" }, { status: 500 });
    }
}
