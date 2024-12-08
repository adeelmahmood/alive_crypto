import MarketDataFetcher from "@/modules/crypto/MarketDataFetcher";
import CryptoNewsFetcher from "@/modules/news/CryptoNewsFetcher";
import { TweetDatastore } from "./TweetDatastore";
import TwitterClient from "./TwitterClient";
import { HyperbolicAIService } from "../ai/HyperbolicAIService";
import { twitterPostPrompt, twitterPostSystemPrompt } from "../prompts/twitterPostPrompt";

interface TwitterComposerConfig {
    historySize?: number;
}

export class TwitterComposer {
    private marketDataFetcher: MarketDataFetcher;
    private newsFetcher: CryptoNewsFetcher;
    private aiService: HyperbolicAIService;
    private tweetDatastore: TweetDatastore;
    private config: TwitterComposerConfig;
    private twitterClient: TwitterClient;

    constructor(config: TwitterComposerConfig = { historySize: 3 }) {
        this.marketDataFetcher = MarketDataFetcher.getInstance();

        this.newsFetcher = new CryptoNewsFetcher();
        this.aiService = new HyperbolicAIService();
        this.tweetDatastore = new TweetDatastore();
        this.config = config;
        this.twitterClient = new TwitterClient();
    }

    private async gatherData() {
        console.log("Requesting major coins data...");
        const majorCoins = await this.marketDataFetcher.getMajorCoins();
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
            // aiMemeCoinsSummary,
            // marketInsight,
            news,
        };
    }

    public async composeTweet(): Promise<{
        record: any;
    }> {
        try {
            // Gather all required data
            const { majorCoins, news } = await this.gatherData();

            // Get tweet history from repository
            const history = await this.tweetDatastore.getRecentHistory(this.config.historySize);

            // Generate prompts
            const systemPrompt = twitterPostSystemPrompt();
            const userPrompt = twitterPostPrompt(history, majorCoins, news);
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
            const tweet = await this.twitterClient.postTweet(record.content);
            if (tweet && tweet.data.id) {
                // update the tweet with the twitter post id
                await this.markTweetAsPosted(record.id, tweet.data.id);
            }

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
