import MarketDataFetcher from "@/modules/crypto/MarketDataFetcher";
import CryptoNewsFetcher from "@/modules/news/CryptoNewsFetcher";
import { TweetDatastore } from "./TweetDatastore";
import { printHeader } from "../utils/console";
import { OpenAIService } from "../ai/OpenAIService";
import TwitterApiClient from "./TwitterApiClient";
import TwitterBot from "./TwitterBot";
import { twitterPostPrompt, twitterPostSystemPrompt } from "../prompts/twitterPostPrompt";
import { generateReflectionPrompt } from "../prompts/twitterReflectionPrompt";

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
    private twitterBot: TwitterBot;

    constructor(config: TwitterComposerConfig = { historySize: 3 }) {
        this.marketDataFetcher = MarketDataFetcher.getInstance();

        this.newsFetcher = new CryptoNewsFetcher();
        this.aiService = new OpenAIService();
        this.tweetDatastore = new TweetDatastore();
        this.config = config;
        this.twitterClient = new TwitterApiClient();
        this.twitterBot = new TwitterBot();
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
        // const systemPrompt = twitterPostSystemPrompt();
        const systemPrompt = `You are Alive, an AI engaging with crypto Twitter.`;
        // const userPrompt = twitterPostPrompt(
        //     data.majorCoins,
        //     data.trendingCoins,
        //     data.news,
        //     data.history
        // );
        const userPrompt = generateReflectionPrompt(data.history);
        printHeader("TWITTER USER PROMPT>> ", userPrompt);

        const response = await this.aiService.generateResponse(systemPrompt, userPrompt);
        return response.response;
    }

    private async publishTweet(content: string) {
        const record = await this.tweetDatastore.saveTweet(content);

        try {
            const tweet = await this.twitterClient.postTweet(record.content);
            if (tweet?.data?.id) {
                await this.markTweetAsPosted(record.id, tweet.data.id);
            }
        } catch (e) {
            console.log("Error posting tweet using API, falling back to browser");
            await this.twitterBot.init();
            await this.twitterBot.goToPage("https://twitter.com/compose/tweet");
            await this.twitterBot.postTweet(record.content);
            await this.twitterBot.close();
        }

        return record;
    }

    public async composeTweet() {
        // gather data
        const tweetData = await this.gatherTweetData();

        // generate tweet
        let tweetResponse = await this.generateTweet(tweetData);
        console.log("Generated tweet:", tweetResponse);

        // publish tweet
        const record = await this.publishTweet(tweetResponse);
        return { record };
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
