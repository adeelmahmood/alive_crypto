import { TweetRecord } from "@/types";
import { TwitterApi, TwitterApiReadWrite, TwitterApiReadOnly } from "twitter-api-v2";

class TwitterClient {
    private rwClient: TwitterApiReadWrite;
    private rClient: TwitterApiReadOnly;

    constructor() {
        const userClient = new TwitterApi({
            appKey: process.env.TWITTER_API_KEY!,
            appSecret: process.env.TWITTER_API_SECRET!,
            accessToken: process.env.TWITTER_ACCESS_TOKEN!,
            accessSecret: process.env.TWITTER_ACCESS_SECRET!,
        });

        // Initialize read-write and read-only clients
        this.rwClient = userClient.readWrite;
        this.rClient = userClient.readOnly;
    }

    async postTweets(tweets: TweetRecord[]): Promise<{ tweetId: string; recordId: number }[]> {
        const postedTweets: { tweetId: string; recordId: number }[] = [];

        for (const tweet of tweets) {
            try {
                const postedTweet = await this.rwClient.v2.tweet(tweet.content);

                if (postedTweet?.data?.id) {
                    postedTweets.push({
                        tweetId: postedTweet.data.id,
                        recordId: tweet.id,
                    });
                }
            } catch (error) {
                console.error(`Error posting tweet ${tweet.id}:`, error);
                // Continue with next tweet even if this one fails
                continue;
            }
        }

        return postedTweets;
    }

    async getTimeline(userId?: string, maxResults: number = 100) {
        try {
            const tweets = await this.rClient.v2.userTimeline(
                userId ?? (await this.getAuthenticatedUserId()),
                {
                    max_results: maxResults,
                    "tweet.fields": ["created_at", "public_metrics", "referenced_tweets"],
                }
            );
            return tweets;
        } catch (error) {
            console.error("Error fetching user tweets:", error);
            throw error;
        }
    }

    private async getAuthenticatedUserId(): Promise<string> {
        const user = await this.rwClient.v2.me();
        console.log("User:", user);
        return user.data.id;
    }

    async getTweet(tweetId: string) {
        try {
            return await this.rClient.v2.tweets(tweetId, {
                "tweet.fields": ["created_at", "public_metrics", "referenced_tweets"],
            });
        } catch (error) {
            console.error("Error fetching tweet:", error);
            throw error;
        }
    }
}

export default TwitterClient;
