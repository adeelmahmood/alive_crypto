import axios from "axios";
import { z } from "zod";

interface NewsArticle {
    title: string;
    description: string;
    author: string;
    source: string; // news_site in the API
    url: string;
    publishedAt: Date; // from updated_at
    sentiment?: "positive" | "negative" | "neutral";
    relevanceScore?: number;
}

interface NewsResponse {
    articles: NewsArticle[];
    timestamp: Date;
    totalResults: number;
}

const CONFIG = {
    COINGECKO_BASE_URL: "https://api.coingecko.com/api/v3",
    CACHE_DURATION_MS: 5 * 60 * 1000, // 5 minutes
    MAX_ARTICLES: 50,
};

const newsArticleSchema = z.object({
    title: z.string(),
    description: z.string(),
    author: z.string(),
    source: z.string(),
    url: z.string().url(),
    publishedAt: z.date(),
    sentiment: z.enum(["positive", "negative", "neutral"]).optional(),
    relevanceScore: z.number().min(0).optional(),
});

class CryptoNewsFetcher {
    private cache: {
        data: NewsResponse | null;
        lastFetched: Date | null;
    };

    constructor() {
        this.cache = {
            data: null,
            lastFetched: null,
        };
    }

    private async fetchFromCoinGecko(): Promise<NewsArticle[]> {
        try {
            const response = await axios.get(`${CONFIG.COINGECKO_BASE_URL}/news`);

            return response.data.data.map((article: any) => ({
                title: article.title,
                description: article.description || article.title,
                author: article.author || "Unknown",
                source: article.news_site,
                url: article.url,
                publishedAt: new Date(article.updated_at * 1000), // Convert Unix timestamp to Date
                sentiment: this.analyzeSentiment(article.title + " " + (article.description || "")),
            }));
        } catch (error) {
            console.error("Error fetching from CoinGecko:", error);
            return [];
        }
    }

    private analyzeSentiment(text: string): "positive" | "negative" | "neutral" {
        const positiveWords = [
            "surge",
            "bull",
            "gain",
            "rise",
            "high",
            "rally",
            "boost",
            "success",
            "adopt",
            "innovation",
            "partnership",
            "launch",
            "upgrade",
            "milestone",
            "breakthrough",
            "institutional",
            "mainstream",
            "approval",
        ];

        const negativeWords = [
            "crash",
            "bear",
            "loss",
            "fall",
            "low",
            "dump",
            "decline",
            "risk",
            "hack",
            "scam",
            "ban",
            "regulate",
            "investigation",
            "vulnerability",
            "exploit",
            "liquidation",
            "lawsuit",
            "violation",
        ];

        const lowerText = text.toLowerCase();
        const positiveCount = positiveWords.filter((word) => lowerText.includes(word)).length;
        const negativeCount = negativeWords.filter((word) => lowerText.includes(word)).length;

        if (positiveCount > negativeCount) return "positive";
        if (negativeCount > positiveCount) return "negative";
        return "neutral";
    }

    private calculateRelevanceScore(article: NewsArticle): number {
        let score = 0;

        // Recency score (higher for more recent articles)
        const hoursSincePublished = (Date.now() - article.publishedAt.getTime()) / (1000 * 60 * 60);
        score += Math.max(0, 1 - hoursSincePublished / 24); // Max score for articles less than 24h old

        // Source credibility
        const credibleSources = [
            "coindesk",
            "cointelegraph",
            "bloomberg",
            "reuters",
            "theblock",
            "decrypt",
            "coinbase",
            "binance",
        ];
        if (credibleSources.some((source) => article.source.toLowerCase().includes(source))) {
            score += 0.3;
        }

        // Content quality (length and substance)
        if (article.description.length > 200) {
            score += 0.2;
        }

        // Known author
        if (article.author && article.author !== "Unknown") {
            score += 0.1;
        }

        // Major cryptocurrency mentions in title
        const titleLower = article.title.toLowerCase();
        const majorCryptos = [
            ["ethereum", "eth"],
            ["bitcoin", "btc"],
            ["solana", "sol"],
        ];

        // Check each crypto and its abbreviation, but only count once per crypto
        majorCryptos.forEach(([name, abbr]) => {
            if (titleLower.includes(name) || titleLower.includes(abbr)) {
                score += 0.4; // Significant boost for major crypto mentions
            }
        });

        return score;
    }

    private async processNews(): Promise<NewsResponse> {
        const articles = await this.fetchFromCoinGecko();

        // Process and validate articles
        const processedArticles = articles
            .map((article) => ({
                ...article,
                relevanceScore: this.calculateRelevanceScore(article),
            }))
            .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
            .slice(0, CONFIG.MAX_ARTICLES);

        // Validate with Zod
        const validatedArticles = processedArticles.filter((article) => {
            try {
                newsArticleSchema.parse(article);
                return true;
            } catch (error) {
                console.error("Article validation failed:", error);
                return false;
            }
        });

        return {
            articles: validatedArticles,
            timestamp: new Date(),
            totalResults: validatedArticles.length,
        };
    }

    public async getNews(): Promise<NewsResponse> {
        if (
            this.cache.data &&
            this.cache.lastFetched &&
            Date.now() - this.cache.lastFetched.getTime() < CONFIG.CACHE_DURATION_MS
        ) {
            return this.cache.data;
        }

        const news = await this.processNews();

        this.cache = {
            data: news,
            lastFetched: new Date(),
        };

        return news;
    }

    public formatForAIPrompt(news: NewsResponse): string {
        const timestamp = news.timestamp.toISOString();
        const articles = news.articles
            .slice(0, 10) // Top 10 most relevant articles
            .map((article) => {
                const summary =
                    article.description.length > 300
                        ? `${article.description.substring(0, 300)}...`
                        : article.description;
                return `
[ARTICLE]
Title: ${article.title}
Source: ${article.source}
Date: ${article.publishedAt.toISOString()}
Sentiment: ${article.sentiment}
Summary: ${summary}
[/ARTICLE]`;
            })
            .join("\n");

        return `
[CRYPTO_NEWS_UPDATE]
Timestamp: ${timestamp}
Total Articles Analyzed: ${news.totalResults}

Top 10 Most Relevant Recent Articles:
${articles}
[/CRYPTO_NEWS_UPDATE]`;
    }
}

export default CryptoNewsFetcher;
