import { EngagementAnalyzer } from "./EngagementAnalyzer";
import { EngagementHandler, EngagementResult } from "./EngagementHandler";
import { TwitterBotStorage } from "./TwitterBotStorage";
import TwitterBrowserClient from "./TwitterBrowserClient";

interface EngagementRules {
    timingRules: {
        maxActionsPerHour: number;
        cooldownPeriod: number; // minutes
        maxDailyActions: number;
    };
    blacklistedWords: string[]; // Words to avoid engaging with
}

class TwitterBot extends TwitterBrowserClient {
    private rules: EngagementRules;
    private storage: TwitterBotStorage;

    private engagementAnalyzer: EngagementAnalyzer;
    private engagementHandler: EngagementHandler;

    constructor(rules: EngagementRules, cookiesPath?: string) {
        super(cookiesPath);
        this.rules = rules;

        this.storage = new TwitterBotStorage();
        this.engagementAnalyzer = new EngagementAnalyzer();
        this.engagementHandler = new EngagementHandler(this);
    }

    async performBrowsingSession() {
        try {
            console.log("Starting new browsing session...");

            // login
            const username = process.env.TWITTER_USERNAME!;
            const password = process.env.TWITTER_PASSWORD!;
            await this.login(username, password);
            // Get timeline posts
            const posts = await this.getTimelinePosts(5); // Get more posts to have better selection

            // Filter and sort posts by relevance
            const relevantPosts = await this.filterAndSortPosts(posts);

            // Engage with top posts
            for (const post of relevantPosts.slice(0, 1)) {
                // browse to post
                const postUrl = `https://x.com/${post.authorHandle}/status/${post.tweetId}`;
                await this.getPage().goto(postUrl);
                await this.getPage().waitForTimeout(2000); // Wait for page load

                // Limit to top 5 most relevant
                await this.engageWithPost(post);
                await this.randomDelay(1, 3); // Minutes between actions
            }
        } catch (error) {
            console.error("Error in browsing session:", error);
        }
    }

    async filterAndSortPosts(posts: any[]): Promise<any[]> {
        console.log(`\nFiltering and sorting ${posts.length} posts...`);

        const eligiblePosts = [];

        for (const post of posts) {
            const thresholdTime = new Date(
                Date.now() - this.rules.timingRules.cooldownPeriod * 60000
            );
            // Check if we've recently engaged with this user
            const recentActions = await this.storage.getUserEngagementHistory(post.authorHandle);
            const recentlyEngaged = recentActions.some(
                (action) => new Date(action.timestamp) > thresholdTime
            );

            if (recentlyEngaged) {
                console.log(`Skipping post from ${post.authorHandle} - recently engaged`);
                continue;
            }

            // Parse metrics
            const metrics = {
                likes: parseInt(post.likes || "0"),
                views: parseInt(post.views || "0"),
                retweets: parseInt(post.retweets || "0"),
            };

            console.log(`Post metrics for ${post.authorHandle}:`, metrics);

            // Add to eligible posts with metrics
            eligiblePosts.push({
                ...post,
                parsedMetrics: metrics,
                // Calculate a simple engagement score for sorting
                totalEngagement: metrics.likes + metrics.retweets + metrics.views / 1000,
            });
        }

        // Sort by total engagement score
        const sortedPosts = eligiblePosts.sort((a, b) => b.totalEngagement - a.totalEngagement);
        console.log(`Found ${sortedPosts.length} eligible posts`);

        return sortedPosts;
    }

    async engageWithPost(post: any) {
        try {
            const engagementType = await this.determineEngagementType(post);
            const startTime = new Date();
            let success = false;
            let errorMessage = "";
            let action;

            console.log(`\nAttempting to engage with post by ${post.authorHandle}`);
            console.log(`Engagement type: ${engagementType.engagementType}`);

            let engagementResult: EngagementResult | null = null;
            try {
                switch (engagementType.engagementType) {
                    case "like":
                        engagementResult = await this.engagementHandler.like(post);
                        break;
                    case "reply":
                        engagementResult = await this.engagementHandler.reply(
                            post,
                            engagementType.replyContent || ""
                        );
                        break;
                    case "retweet":
                        engagementResult = await this.engagementHandler.retweet(post);
                        break;
                }
                success = engagementResult?.success || false;
                console.log(
                    `${success ? "✅ Successfully engaged with post" : "❌ Failed to engage"}`
                );
            } catch (error: any) {
                errorMessage = error.message;
                console.error(`❌ Failed to engage with post:`, error);
                throw error;
            } finally {
                // Record action in database
                action = await this.storage.saveAction({
                    timestamp: startTime,
                    engagement_method: engagementResult?.method || "",
                    action_type: engagementType.engagementType,
                    action_reasoning: engagementType.reasoning || "",
                    target_user: post.authorHandle,
                    reply_text: engagementType.replyContent || "",
                    target_post_text: post.text,
                    target_tweet_id: post.tweetId,
                    target_tweet_url: `https://x.com/${post.authorHandle}/status/${post.tweetId}`,
                    engagement_score: post.totalEngagement,
                    success,
                    error_message: errorMessage,
                    metrics: {
                        likes: parseInt(post.likes || "0"),
                        replies: parseInt(post.replies || "0"),
                        retweets: parseInt(post.retweets || "0"),
                        views: parseInt(post.views || "0"),
                    },
                });
            }

            return action;
        } catch (error) {
            console.error(`Error in engageWithPost for ${post.authorHandle}:`, error);
            throw error;
        }
    }

    async determineEngagementType(post: any): Promise<{
        engagementType: string;
        reasoning?: string;
        replyContent?: string;
    }> {
        // Analyze post content
        const response = await this.engagementAnalyzer.analyzePost(post.text, post.totalEngagement);

        // Check if post is engagement-worthy
        const isEngagementWorthy = response.confidence > 0.5;

        if (!isEngagementWorthy) {
            console.log("Post is not engagement-worthy");
            return {
                engagementType: "ignore",
            };
        }

        return {
            engagementType: response.action,
            reasoning: response.reasoning,
            replyContent: response.replyContent,
        };
    }

    async likePost(post: any) {
        try {
            const likeButton = await this.getPage().$('[data-testid="like"]');
            if (likeButton) {
                console.log(`Liking post from ${post.authorHandle}...`);
                await likeButton.click();
                console.log(`Liked post from ${post.authorHandle}`);
            }
        } catch (error) {
            console.error("Error liking post:", error);
            throw error;
        }
    }

    async replyToPost(post: any, replyContent: string) {
        try {
            // Click reply button
            const replyButton = await this.getPage().$('[data-testid="reply"]');
            if (!replyButton) throw new Error("Reply button not found");

            console.log(`Replying to ${post.authorHandle}...`);
            await replyButton.click();

            // Wait for reply box and type
            const replyBox = await this.getPage().waitForSelector(
                '[data-testid="tweetTextarea_0"]'
            );
            if (!replyBox) throw new Error("Reply box not found");
            await replyBox.fill(replyContent);

            // Click reply button
            const submitButton = await this.getPage().waitForSelector(
                '[data-testid="tweetButton"]'
            );
            if (!submitButton) throw new Error("Submit button not found");
            await submitButton.click();

            console.log(`Replied to ${post.authorHandle}`);
        } catch (error) {
            console.error("Error replying to post:", error);
            throw error;
        }
    }

    async retweetPost(post: any) {
        try {
            const retweetButton = await this.getPage().$('[data-testid="retweet"]');
            if (!retweetButton) throw new Error("Retweet button not found");

            console.log(`Retweeting post from ${post.authorHandle}...`);
            await retweetButton.click();

            // Click the retweet option in the menu
            const retweetOption = await this.getPage().waitForSelector(
                '[data-testid="retweetConfirm"]'
            );
            if (!retweetOption) throw new Error("Retweet confirm button not found");
            await retweetOption.click();

            console.log(`Retweeted post from ${post.authorHandle}`);
        } catch (error) {
            console.error("Error retweeting post:", error);
            throw error;
        }
    }

    async goToPage(url: string) {
        await this.getPage().goto(url);
        await this.getPage().waitForTimeout(2000); // Wait for page load
    }

    async canPerformActions(): Promise<boolean> {
        console.log("\nChecking if actions can be performed...");

        // Get daily count from database
        const dailyCount = await this.storage.getDailyActionCount();
        console.log(`Daily actions so far: ${dailyCount}`);

        if (dailyCount >= this.rules.timingRules.maxDailyActions) {
            console.log("❌ Daily action limit reached");
            return false;
        }

        // Get recent actions
        const recentActions = await this.storage.getRecentActions(60); // Last hour
        const hourlyCount = recentActions.length;
        console.log(`Actions in the last hour: ${hourlyCount}`);

        if (hourlyCount >= this.rules.timingRules.maxActionsPerHour) {
            console.log("❌ Hourly action limit reached");
            return false;
        }

        console.log("✅ Can perform actions");
        return true;
    }

    private async randomDelay(minMinutes: number, maxMinutes: number) {
        const delay = Math.floor(Math.random() * (maxMinutes - minMinutes + 1) + minMinutes) * 6000; // Convert to milliseconds
        console.log(`Waiting for ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        // show a count down timer in the same line
        for (let i = delay / 1000; i > 0; i--) {
            process.stdout.write(`\r${i} ...`);
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        console.log("Continuing...");
    }
}

export default TwitterBot;
