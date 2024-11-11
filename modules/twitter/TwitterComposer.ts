import OnChainDataFetcher from "@/modules/crypto/OnChainDataFetcher";
import OnChainDataInsights from "@/modules/crypto/OnChainDataInsights";
import MarketDataFetcher from "@/modules/crypto/MarketDataFetcher";
import CryptoNewsFetcher from "@/modules/news/CryptoNewsFetcher";
import { ClaudeAIService } from "@/modules/ai/ClaudeAIService";
import { generateSystemPrompt } from "@/modules/prompts/systemPrompt";
import { generateTwitterPrompt } from "@/modules/prompts/twitterPrompt";
import { TweetDatastore } from "./TweetDatastore";
import TwitterClient from "./TwitterClient";

interface TwitterComposerConfig {
    historySize?: number;
}

export class TwitterComposer {
    private marketDataFetcher: MarketDataFetcher;
    private onChainDataFetcher: OnChainDataFetcher;
    private onChainDataInsights: OnChainDataInsights;
    private newsFetcher: CryptoNewsFetcher;
    private aiService: ClaudeAIService;
    private tweetDatastore: TweetDatastore;
    private config: TwitterComposerConfig;
    private twitterClient: TwitterClient;

    constructor(config: TwitterComposerConfig = { historySize: 3 }) {
        this.marketDataFetcher = MarketDataFetcher.getInstance();
        this.onChainDataFetcher = OnChainDataFetcher.getInstance();
        this.onChainDataInsights = OnChainDataInsights.getInstance();

        this.newsFetcher = new CryptoNewsFetcher();
        this.aiService = new ClaudeAIService();
        this.tweetDatastore = new TweetDatastore();
        this.config = config;
        this.twitterClient = new TwitterClient();
    }

    /**
     * Fetch all required market and crypto data
     */
    private async gatherData() {
        console.log("Requesting major coins data...");
        const majorCoins = await this.marketDataFetcher.getMajorCoins();
        console.log("Requesting AI meme coins data...");
        const aiMemeCoinsSummary = await this.marketDataFetcher.getAIMemeSummary();
        console.log("Requesting on-chain metrics...");
        const onchainMetrics = await this.onChainDataFetcher.getMetrics();
        console.log("Requesting news...");
        const news = await this.newsFetcher.getNews();

        const marketInsight = await this.onChainDataInsights.generateInsights(
            onchainMetrics.transfers
        );
        const formattedNews = this.newsFetcher.formatForAIPrompt(news);

        return {
            majorCoins,
            aiMemeCoinsSummary,
            marketInsight,
            formattedNews,
        };
    }

    /**
     * Generate a new tweet using the AI service
     */
    public async composeTweet(): Promise<{
        record: any;
    }> {
        try {
            // Gather all required data
            const { majorCoins, aiMemeCoinsSummary, marketInsight, formattedNews } =
                await this.gatherData();

            // Get tweet history from repository
            const history = await this.tweetDatastore.getRecentHistory(this.config.historySize);

            // Generate prompts
            const systemPrompt = generateSystemPrompt();
            const userPrompt = generateTwitterPrompt(
                history,
                marketInsight,
                majorCoins,
                aiMemeCoinsSummary,
                formattedNews
            );
            console.log(
                "\n\n ------------------------------- USER PROMPT - START -------------------------------\n\n"
            );
            console.log(userPrompt);
            console.log(
                "\n\n ------------------------------- USER PROMPT - END -------------------------------\n\n"
            );

            // Get AI response
            const response = await this.aiService.generateResponse(systemPrompt, userPrompt);

            // Save to database
            const record = await this.tweetDatastore.saveTweet(response.response);

            // post the tweet
            // await this.twitterClient.postTweet(record.content);

            return { record };
        } catch (error) {
            console.error("Error in tweet composition:", error);
            throw new Error(
                "Failed to compose tweet: " +
                    (error instanceof Error ? error.message : "Unknown error")
            );
        }
    }

    /**
     * Mark a tweet as posted on Twitter
     */
    public async markTweetAsPosted(id: number, twitterPostId: string): Promise<void> {
        await this.tweetDatastore.markAsPosted(id, twitterPostId);
    }

    /**
     * Update engagement stats for a tweet
     */
    public async updateEngagementStats(
        id: number,
        stats: {
            likes?: number;
            retweets?: number;
            replies?: number;
        }
    ): Promise<void> {
        await this.tweetDatastore.updateEngagementStats(id, stats);
    }

    /**
     * Get tweets that haven't been posted to Twitter yet
     */
    public async getUnpostedTweets() {
        return this.tweetDatastore.getUnpostedTweets();
    }
}
