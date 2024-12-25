import { TwitterApi, TwitterApiReadWrite, TwitterApiReadOnly } from "twitter-api-v2";

class TwitterApiClient {
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

    async postTweetWithImage(
        text: string,
        imageBuffer: Buffer,
        replyToTweetId?: string
    ): Promise<{ data: { id: string } } | undefined> {
        try {
            // Step 1: Upload the media using v1 API
            const mediaId = await this.rwClient.v1.uploadMedia(imageBuffer, {
                mimeType: "image/png",
            });

            // Step 2: Create tweet with media using v2 API
            if (replyToTweetId) {
                const tweet = await this.rwClient.v2.tweet(text, {
                    media: {
                        media_ids: [mediaId],
                    },
                    reply: { in_reply_to_tweet_id: replyToTweetId },
                });
                return tweet;
            }
            const tweet = await this.rwClient.v2.tweet(text, {
                media: {
                    media_ids: [mediaId],
                },
            });

            return tweet;
        } catch (error) {
            console.error("Error posting tweet with image:", error);
            throw error;
        }
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

    async likeTweet(tweetId: string) {
        try {
            const loggedUserId = await this.getAuthenticatedUserId();
            return await this.rwClient.v2.like(loggedUserId, tweetId);
        } catch (error) {
            console.error("Error liking tweet:", error);
            throw error;
        }
    }

    async retweetTweet(tweetId: string) {
        try {
            const loggedUserId = await this.getAuthenticatedUserId();
            return await this.rwClient.v2.retweet(loggedUserId, tweetId);
        } catch (error) {
            console.error("Error retweeting tweet:", error);
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

    async checkRateLimit() {
        try {
            const rateLimit = await this.rClient.v1.get("application/rate_limit_status.json", {
                resources: "statuses",
            });
            console.log(rateLimit.resources.statuses);
        } catch (error) {
            console.error("Error checking rate limit:", error);
        }
    }
}

export default TwitterApiClient;
