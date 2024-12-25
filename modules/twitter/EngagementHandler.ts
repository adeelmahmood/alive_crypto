import TwitterApiClient from "./TwitterApiClient";
import TwitterBot from "./TwitterBot";

export interface EngagementResult {
    success: boolean;
    method: "api" | "browser" | "none";
    error?: string;
}

export class EngagementHandler {
    private apiClient: TwitterApiClient;
    private twitterBot: TwitterBot;

    constructor(twitterBot: TwitterBot) {
        this.apiClient = new TwitterApiClient();
        this.twitterBot = twitterBot;
    }

    async like(post: { tweetId: string; authorHandle: string }): Promise<EngagementResult> {
        try {
            // Try API first
            await this.apiClient.likeTweet(post.tweetId);
            return { success: true, method: "api" };
        } catch (apiError: any) {
            console.log("API like failed, falling back to browser:", apiError.message);

            try {
                // browse to post
                const postUrl = `https://x.com/${post.authorHandle}/status/${post.tweetId}`;
                await this.twitterBot.goToPage(postUrl);

                // Use Twitter bot for liking the post
                await this.twitterBot.likePost(post);
                return { success: true, method: "browser" };
            } catch (err: any) {
                return { success: false, method: "none", error: err.message };
            }
        }
    }

    async reply(
        post: { tweetId: string; authorHandle: string },
        content: string
    ): Promise<EngagementResult> {
        try {
            // Try API first
            await this.apiClient.postTweet(content, post.tweetId);
            return { success: true, method: "api" };
        } catch (apiError: any) {
            console.log("API reply failed, falling back to browser:", apiError.message);

            try {
                // browse to post
                const postUrl = `https://x.com/${post.authorHandle}/status/${post.tweetId}`;
                await this.twitterBot.goToPage(postUrl);

                // Use Twitter bot for replying to the post
                await this.twitterBot.replyToPost(post, content);
                return { success: true, method: "browser" };
            } catch (err: any) {
                return { success: false, method: "none", error: err.message };
            }
        }
    }

    async retweet(post: { tweetId: string; authorHandle: string }): Promise<EngagementResult> {
        try {
            // Try API first
            await this.apiClient.retweetTweet(post.tweetId);
            return { success: true, method: "api" };
        } catch (apiError: any) {
            console.log("API retweet failed, falling back to browser:", apiError.message);

            try {
                // browse to post
                const postUrl = `https://x.com/${post.authorHandle}/status/${post.tweetId}`;
                await this.twitterBot.goToPage(postUrl);

                // Use Twitter bot for retweeting the post
                await this.twitterBot.retweetPost(post);
                return { success: true, method: "browser" };
            } catch (err: any) {
                return { success: false, method: "none", error: err.message };
            }
        }
    }
}
