import TwitterBot from "@/modules/twitter/TwitterBot";
import { inngest } from "./client";

// Initialize TwitterBot with rules
const twitterBot = new TwitterBot({
    timingRules: {
        maxActionsPerHour: 15,
        cooldownPeriod: 120, // minutes
        maxDailyActions: 100,
    },
    blacklistedWords: [], // Add any words to avoid
});

const timelinePullCount = 20;
const maxInOneGo = 5;
const minDelaySeconds = 10; // Minimum delay in seconds (1 minute)
const maxDelaySeconds = 60; // Maximum delay in seconds (5 minutes)

// Initialize browser and perform browsing
export const browsePosts = inngest.createFunction(
    { id: "browse-posts", retries: 0, concurrency: 1 },
    // { cron: "*/15 * * * *" }, // Every 15 minutes
    { event: "twitter/browse-posts" },
    async ({ event, step }) => {
        try {
            // Check if we can perform actions
            const canPerform = await step.run("check-limits", async () => {
                return await twitterBot.canPerformActions();
            });

            if (!canPerform) {
                console.log("Cannot perform actions due to limits");
                return;
            }

            // Initialize browser
            await step.run("init-browser", async () => {
                await twitterBot.init(true, 500);
            });

            // Login to Twitter
            await step.run("login", async () => {
                const username = process.env.TWITTER_USERNAME!;
                const password = process.env.TWITTER_PASSWORD!;
                await twitterBot.login(username, password);
            });

            // Get timeline posts
            const posts = await step.run("get-posts", async () => {
                return await twitterBot.getTimelinePosts(timelinePullCount);
            });

            // Filter and sort posts
            const relevantPosts = await step.run("filter-posts", async () => {
                return await twitterBot.filterAndSortPosts(posts);
            });

            // Engage with posts with delays
            for (let i = 0; i < relevantPosts.length && i < maxInOneGo; i++) {
                const post = relevantPosts[i];

                await step.sendEvent("twitter/post.ready", {
                    name: "twitter/engage.post",
                    data: { post },
                });
            }

            await twitterBot.close();
        } catch (error) {
            console.error("Error in browse posts:", error);
            await twitterBot.close();
            throw error;
        }
    }
);

// Engage with a post
export const engagePost = inngest.createFunction(
    { id: "engage-post", retries: 0, concurrency: 1 },
    { event: "twitter/engage.post" },
    async ({ event, step }) => {
        const { post } = event.data;
        let maxRetries = 3;
        let currentTry = 0;

        while (currentTry < maxRetries) {
            try {
                // Generate a random delay
                const delaySeconds =
                    Math.floor(Math.random() * (maxDelaySeconds - minDelaySeconds + 1)) +
                    minDelaySeconds;
                console.log(
                    `Waiting for ${delaySeconds} seconds before engagement with ${post.authorHandle}`
                );

                await step.sleep("random-delay", `${delaySeconds} seconds`);

                // Initialize browser
                await step.run("init-browser", async () => {
                    await twitterBot.init(true, 500);
                });

                // Engage with the post
                const action = await step.run("engage", async () => {
                    console.log(
                        `Starting engagement with ${
                            post.authorHandle
                        } at ${new Date().toISOString()}`
                    );

                    // Navigate to post with timeout
                    const postUrl = `https://x.com/${post.authorHandle}/status/${post.tweetId}`;
                    await twitterBot.goToPage(postUrl);

                    return await twitterBot.engageWithPost(post);
                });

                // If we get here, engagement was successful
                await twitterBot.close();
                return action;
            } catch (error) {
                console.error(`Error in engagement process (attempt ${currentTry + 1}):`, error);
                // Always try to close the browser on error
                await twitterBot.close();

                currentTry++;
                if (currentTry >= maxRetries) {
                    throw error; // Re-throw if we've exhausted retries
                }
                // Wait before retrying
                await step.sleep("retry-delay", "30 seconds");
            }
        }
    }
);
