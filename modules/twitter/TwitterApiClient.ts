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

    async postTweetWithAudio(
        text: string,
        audioBuffer: Buffer,
        replyToTweetId?: string
    ): Promise<{ data: { id: string } } | undefined> {
        try {
            // Step 1: Upload the media to Twitter
            const media = await this.rwClient.v1.uploadMedia(
                audioBuffer,
                {
                    mimeType: "video/mp4", // Twitter requires 'mp4' or 'longmp4' for audio
                    target: "tweet", // Ensure the media is intended for a tweet
                },
                true
            );

            console.log("Media uploaded successfully. Media:", media);
            const mediaId = media.media_id_string;

            // Step 2: Wait for initial processing
            console.log("Waiting for initial processing...");
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Step 3: Check media processing status
            console.log("Starting media status check...");
            await this.checkMediaStatus(mediaId);
            console.log("Media processing completed successfully");

            // Step 2: Create the tweet with the uploaded media
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
            console.error("Error posting tweet with audio:", error);
            throw error;
        }
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

    private async checkMediaStatus(mediaId: string): Promise<void> {
        const MAX_RETRIES = 20;
        const RETRY_INTERVAL_MS = 1000; // 1 second

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                console.log(
                    `Checking media status for Media ID: ${mediaId} (Attempt ${attempt + 1})`
                );

                // Get media status using v1.get
                const statusResponse = await this.rwClient.v1.get("media/upload.json", {
                    command: "STATUS",
                    media_id: mediaId,
                });

                console.log("Media status response:", statusResponse);

                // Check processing state
                const processingInfo = statusResponse.processing_info;
                if (!processingInfo) {
                    console.log("Media processing complete.");
                    return;
                }

                const state = processingInfo.state;
                console.log(`Media processing state: ${state}`);

                if (state === "succeeded") {
                    console.log("Media processing succeeded.");
                    return;
                } else if (state === "failed") {
                    throw new Error(
                        `Media processing failed: ${
                            processingInfo.error?.message || "Unknown error"
                        }`
                    );
                }

                // If pending or in progress, wait for the recommended time
                const checkAfterSecs = processingInfo.check_after_secs || 1;
                await new Promise((resolve) => setTimeout(resolve, checkAfterSecs * 1000));
            } catch (error) {
                console.error(`Error checking media status (attempt ${attempt + 1}):`, error);
                if (attempt === MAX_RETRIES - 1) {
                    throw error; // Throw on last attempt
                }
                // Wait before retrying
                await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_MS));
            }
        }

        throw new Error("Media processing timed out.");
    }
}

export default TwitterApiClient;
