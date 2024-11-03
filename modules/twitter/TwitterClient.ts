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

    async postTweet(text: string, replyToTweetId?: string) {
        try {
            if (replyToTweetId) {
                return await this.rwClient.v2.tweet(text, {
                    reply: { in_reply_to_tweet_id: replyToTweetId },
                });
            }
            return await this.rwClient.v2.tweet(text);
        } catch (error) {
            console.error("Error posting tweet:", error);
            throw error;
        }
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
