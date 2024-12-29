import MarketDataFetcher from "@/modules/crypto/MarketDataFetcher";
import CryptoNewsFetcher from "@/modules/news/CryptoNewsFetcher";
import { TweetDatastore } from "./TweetDatastore";
import { twitterPostPrompt, twitterPostSystemPrompt } from "../prompts/twitterPostPrompt";
import { printHeader } from "../utils/console";
import { OpenAIService } from "../ai/OpenAIService";
import TwitterApiClient from "./TwitterApiClient";

interface TwitterComposerConfig {
    historySize?: number;
}

interface TweetData {
    majorCoins: any;
    trendingCoins: any;
    news: any;
    history: any[];
}

export class TwitterComposer {
    private marketDataFetcher: MarketDataFetcher;
    private newsFetcher: CryptoNewsFetcher;
    private aiService: OpenAIService;
    private tweetDatastore: TweetDatastore;
    private config: TwitterComposerConfig;
    private twitterClient: TwitterApiClient;

    constructor(config: TwitterComposerConfig = { historySize: 3 }) {
        this.marketDataFetcher = MarketDataFetcher.getInstance();

        this.newsFetcher = new CryptoNewsFetcher();
        this.aiService = new OpenAIService();
        this.tweetDatastore = new TweetDatastore();
        this.config = config;
        this.twitterClient = new TwitterApiClient();
    }

    private async gatherData() {
        console.log("Requesting major coins data...");
        const majorCoins = await this.marketDataFetcher.getMajorCoins();
        const trendingCoins = await this.marketDataFetcher.getTrendingCoins();
        // console.log("Requesting AI meme coins data...");
        // const aiMemeCoinsSummary = await this.marketDataFetcher.getAIMemeSummary();
        // console.log("Requesting on-chain metrics...");
        // const onchainMetrics = await this.onChainDataFetcher.getMetrics();
        console.log("Requesting news...");
        const news = await this.newsFetcher.getNewsForPrompt();

        // const marketInsight = await this.onChainDataInsights.generateInsights(
        //     onchainMetrics.transfers
        // );

        return {
            majorCoins,
            trendingCoins,
            // aiMemeCoinsSummary,
            // marketInsight,
            news,
        };
    }

    private async gatherTweetData(): Promise<TweetData> {
        const { majorCoins, trendingCoins, news } = await this.gatherData();
        const history = await this.tweetDatastore.getRecentHistory(this.config.historySize);
        return { majorCoins, trendingCoins, news, history };
    }

    private async generateTweet(data: TweetData): Promise<string> {
        const systemPrompt = twitterPostSystemPrompt();
        const userPrompt = twitterPostPrompt(
            data.history,
            data.majorCoins,
            data.trendingCoins,
            data.news
        );
        // printHeader("TWITTER USER PROMPT>> ", userPrompt);

        const response = await this.aiService.generateResponse(systemPrompt, userPrompt);
        return response.response;
    }

    private async publishTweet(content: string) {
        const record = await this.tweetDatastore.saveTweet(content);

        const tweet = await this.twitterClient.postTweet(record.content);
        if (tweet?.data?.id) {
            await this.markTweetAsPosted(record.id, tweet.data.id);
        }

        return record;
    }

    public async composeTweet(confirm = false) {
        try {
            // gather data
            const tweetData = await this.gatherTweetData();

            // generate tweet
            let tweetResponse = await this.generateTweet(tweetData);
            console.log("Generated tweet:", tweetResponse);

            // publish tweet
            const record = await this.publishTweet(tweetResponse);
            return { record };
        } catch (error) {
            console.error("Error in tweet composition:", error);
            throw new Error(
                "Failed to compose tweet: " +
                    (error instanceof Error ? error.message : "Unknown error")
            );
        }
    }

    public async markTweetAsPosted(id: number, twitterPostId: string): Promise<void> {
        await this.tweetDatastore.markAsPosted(id, twitterPostId);
    }

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

    public async getUnpostedTweets() {
        return this.tweetDatastore.getUnpostedTweets();
    }
}
