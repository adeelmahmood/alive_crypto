import { Artwork, ProcessedMarketData } from "@/types";
import { ClaudeAIService } from "../ai/ClaudeAIService";
import MarketDataFetcher from "../crypto/MarketDataFetcher";
import CryptoNewsFetcher from "../news/CryptoNewsFetcher";
import yaml from "js-yaml";

export class ArtworkPromptCurator {
    private aiService: ClaudeAIService;
    private marketDataFetcher: MarketDataFetcher;
    private newsFetcher: CryptoNewsFetcher;

    private readonly systemPrompt =
        "You are ALIve, a beautiful and sophisticated female AI entity whose mission is to build a revolutionary crypto community and launch a successful meme token that creates wealth for its believers.";

    constructor() {
        this.aiService = new ClaudeAIService();
        this.marketDataFetcher = MarketDataFetcher.getInstance();
        this.newsFetcher = new CryptoNewsFetcher();
    }

    private formatMarketData(marketData: ProcessedMarketData["coins"]): string {
        return Object.entries(marketData)
            .map(
                ([symbol, data]) =>
                    `${symbol.toUpperCase()}: $${data.priceInUSD.toFixed(2)} (${
                        data.priceChange24hPercentage >= 0 ? "+" : ""
                    }${data.priceChange24hPercentage.toFixed(1)}%)`
            )
            .join("\n");
    }

    private buildPrompt(marketSummary: string, formattedNews: string, userPrompt: string): string {
        return `
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
    }

    public async createPrompt(userPrompt: string): Promise<Artwork> {
        const marketData = await this.marketDataFetcher.getMajorCoins();
        const news = await this.newsFetcher.getNews();
        const formattedNews = this.newsFetcher.formatForAIPrompt(news);

        const marketSummary = this.formatMarketData(marketData);
        const prompt = this.buildPrompt(marketSummary, formattedNews, userPrompt);

        try {
            const response = await this.aiService.generateResponse(this.systemPrompt, prompt);
            return yaml.load(response.response) as Artwork;
        } catch (error) {
            console.error("Error generating artwork prompt:", error);
            throw error;
        }
    }
}
