import { Artwork, ProcessedMarketData } from "@/types";
import MarketDataFetcher from "../crypto/MarketDataFetcher";
import CryptoNewsFetcher from "../news/CryptoNewsFetcher";
import { ContentModerationService } from "./ContentModerationService";
import { OpenAIService } from "../ai/OpenAIService";

export class ArtworkPromptCurator {
    private aiService: OpenAIService;
    private marketDataFetcher: MarketDataFetcher;
    private newsFetcher: CryptoNewsFetcher;

    private moderationService: ContentModerationService;

    private readonly systemPrompt =
        "You are ALIve, a beautiful and sophisticated female AI entity whose mission is to build a revolutionary crypto community and launch a successful meme token that creates wealth for its believers.";

    constructor() {
        this.aiService = new OpenAIService();
        this.marketDataFetcher = MarketDataFetcher.getInstance();
        this.newsFetcher = new CryptoNewsFetcher();

        this.moderationService = new ContentModerationService();
    }

    private static readonly VALID_MARKET_MOODS = ["Bullish", "Bearish", "Transition", "Prophetic"];

    private sanitizeXmlValue(value: string): string {
        return value
            .trim()
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");
    }

    private extractArtworkFromXml(xml: string): Record<string, any> {
        try {
            // Clean up XML and extract values
            const cleanXml = xml.replace(/>\s+</g, "><");

            const title = this.sanitizeXmlValue(
                cleanXml.match(/<title>([\s\S]*?)<\/title>/)?.[1] || ""
            );
            const description = this.sanitizeXmlValue(
                cleanXml.match(/<description>([\s\S]*?)<\/description>/)?.[1] || ""
            );
            let marketMood = this.sanitizeXmlValue(
                cleanXml.match(/<marketMood>([\s\S]*?)<\/marketMood>/)?.[1] || ""
            ).replace(/"/g, "");

            // Extract and clean tags
            const tagsMatch = cleanXml.match(/<tags>([\s\S]*?)<\/tags>/)?.[1] || "";
            const tagRegex = /<tag>([\s\S]*?)<\/tag>/g;
            const tags: string[] = [];
            let match;

            // Extract up to 3 tags
            while ((match = tagRegex.exec(tagsMatch)) !== null && tags.length < 3) {
                const tag = this.sanitizeXmlValue(match[1]);
                if (tag.length > 0) {
                    tags.push(tag);
                }
            }

            // Validate required fields
            if (!title || !description) {
                throw new Error("Missing required fields in XML response");
            }

            // Validate market mood
            if (!ArtworkPromptCurator.VALID_MARKET_MOODS.includes(marketMood)) {
                marketMood = "Transition";
            }

            return {
                title: title.slice(0, 50), // Limit title length
                description: description.slice(0, 400), // Limit description length
                marketMood,
                tags,
            };
        } catch (error) {
            console.error("XML parsing error:", error);
            throw new Error("Failed to parse artwork description");
        }
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

Your response must be in this XML format:

<title>Title of the artwork (max 50 chars)</title>
<description>Enhanced image generation prompt, incorporating market sentiment and artistic vision. Be specific and vivid but keep it under 400 characters. Focus on visual elements and mood.</description>
<marketMood>Bullish | Bearish | Transition | Prophetic</marketMood>
<tags>
  <tag>crypto (max 3 tags)</tag>
  <tag>art</tag>
</tags>

Create unique and appealing crypto art that captures the current market sentiment.
`;
    }

    public async createPrompt(userPrompt: string, creator: string): Promise<Artwork> {
        // First, moderate the user prompt
        const moderationResult = await this.moderationService.moderateContent(userPrompt);

        if (!moderationResult.isAllowed) {
            throw new Error(`Content moderation failed: ${moderationResult.reason}`);
        }

        const marketData = await this.marketDataFetcher.getMajorCoins();
        const news = await this.newsFetcher.getNewsForPrompt();

        const marketSummary = this.formatMarketData(marketData);
        const prompt = this.buildPrompt(marketSummary, news, userPrompt);

        try {
            // Generate Artwork description
            const response = await this.aiService.generateResponse(this.systemPrompt, prompt);

            // Extract artwork data from XML response
            const artwork = this.extractArtworkFromXml(response.response) as Artwork;
            artwork.creator = creator;

            return artwork;
        } catch (error) {
            console.error("Error generating artwork prompt:", error);
            throw error;
        }
    }
}
