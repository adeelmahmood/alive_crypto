import axios from "axios";

interface NewsArticle {
    title: string;
    url: string;
    source: string;
    publishedAt: Date;
}

const CONFIG = {
    CRYPTOCOMPARE_URL: "https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=latest",
    CACHE_DURATION_MS: 5 * 60 * 1000, // 5 minutes
    MAX_ARTICLES: 10, // We'll keep just top 5 latest news
};

class CryptoNewsFetcher {
    private cache: {
        news: string | null;
        lastFetched: Date | null;
    };

    constructor() {
        this.cache = {
            news: null,
            lastFetched: null,
        };
    }

    private async fetchNews(): Promise<NewsArticle[]> {
        try {
            const response = await axios.get(CONFIG.CRYPTOCOMPARE_URL);
            return response.data.Data.map((article: any) => ({
                title: article.title,
                url: article.url,
                source: article.source,
                publishedAt: new Date(article.published_on * 1000),
            }));
        } catch (error) {
            console.error("Error fetching crypto news:", error);
            return [];
        }
    }

    public async getNewsForPrompt(): Promise<string> {
        // Check cache
        if (
            this.cache.news &&
            this.cache.lastFetched &&
            Date.now() - this.cache.lastFetched.getTime() < CONFIG.CACHE_DURATION_MS
        ) {
            return this.cache.news;
        }

        const articles = await this.fetchNews();
        const latestArticles = articles.slice(0, CONFIG.MAX_ARTICLES);

        const newsText = latestArticles
            .map((article) => `- ${article.title} (via ${article.source})`)
            .join("\n");

        // Cache the result
        this.cache = {
            news: newsText,
            lastFetched: new Date(),
        };

        return newsText;
    }
}

export default CryptoNewsFetcher;
