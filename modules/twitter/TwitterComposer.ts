import MarketDataFetcher from "@/modules/crypto/MarketDataFetcher";
import CryptoNewsFetcher from "@/modules/news/CryptoNewsFetcher";
import { TweetDatastore } from "./TweetDatastore";
import TwitterClient from "./TwitterClient";
import { HyperbolicAIService } from "../ai/HyperbolicAIService";
import { twitterPostPrompt, twitterPostSystemPrompt } from "../prompts/twitterPostPrompt";
import readline from "readline";
import { printHeader } from "../utils/console";
import { OpenAIService } from "../ai/OpenAIService";

interface TwitterComposerConfig {
    historySize?: number;
}

interface TweetData {
    majorCoins: any;
    news: any;
    history: any[];
}

export class TwitterComposer {
    private marketDataFetcher: MarketDataFetcher;
    private newsFetcher: CryptoNewsFetcher;
    private aiService: OpenAIService;
    private tweetDatastore: TweetDatastore;
    private config: TwitterComposerConfig;
    private twitterClient: TwitterClient;

    constructor(config: TwitterComposerConfig = { historySize: 3 }) {
        this.marketDataFetcher = MarketDataFetcher.getInstance();

        this.newsFetcher = new CryptoNewsFetcher();
        this.aiService = new OpenAIService();
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

    private async gatherTweetData(): Promise<TweetData> {
        const { majorCoins, news } = await this.gatherData();
        const history = await this.tweetDatastore.getRecentHistory(this.config.historySize);
        return { majorCoins, news, history };
    }

    private async generateTweet(data: TweetData, previousGuidance: string[] = []): Promise<string> {
        const systemPrompt = twitterPostSystemPrompt();
        const userPrompt = twitterPostPrompt(
            data.history,
            data.majorCoins,
            data.news,
            previousGuidance
        );
        printHeader("USER PROMPT", userPrompt);

        const response = await this.aiService.generateResponse(systemPrompt, userPrompt);
        return response.response;
    }

    private async promptUserForConfirmation(tweetContent: string): Promise<{
        confirmed: boolean;
        guidance?: string;
        shouldEnd?: boolean;
    }> {
        printHeader("AI RESPONSE", tweetContent);
        const answer = await this.createPrompt("Do you want to post this tweet? (yes/no/end) ");

        if (answer === "end") {
            return { confirmed: false, shouldEnd: true };
        }

        if (answer === "no") {
            const guidance = await this.createPrompt("Enter guidance for the AI: ");
            return { confirmed: false, guidance };
        }

        return { confirmed: answer === "yes" };
    }

    private async createPrompt(question: string): Promise<string> {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        try {
            return await new Promise<string>((resolve) => rl.question(question, resolve));
        } finally {
            rl.close();
        }
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
            const tweetData = await this.gatherTweetData();
            let tweetResponse = await this.generateTweet(tweetData);
            let previousGuidance: string[] = [];

            if (confirm) {
                while (true) {
                    const { confirmed, guidance, shouldEnd } = await this.promptUserForConfirmation(
                        tweetResponse
                    );

                    if (shouldEnd) {
                        throw new Error("Dev ended the tweet composition");
                    }

                    if (confirmed) {
                        break;
                    }

                    if (guidance) {
                        previousGuidance.push(guidance);
                        tweetResponse = await this.generateTweet(tweetData, previousGuidance);
                    }
                }
            }

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
