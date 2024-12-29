import TwitterBot from "@/modules/twitter/TwitterBot";
import { inngest } from "./client";
import { TextToSpeechService } from "@/modules/ai/TextToSpeechService";
import OpenAI from "openai";
import { LLM_MODELS } from "@/modules/utils/llmInfo";
import MarketDataFetcher from "@/modules/crypto/MarketDataFetcher";

// Initialize TwitterBot with rules
const twitterBot = new TwitterBot({
    timingRules: {
        maxActionsPerHour: 25,
        cooldownPeriod: 300, // minutes
        maxDailyActions: 100,
    },
    blacklistedWords: [], // Add any words to avoid
});

const timelinePullCount = 20;
const maxInOneGo = 8;
const minDelaySeconds = 10; // Minimum delay in seconds
const maxDelaySeconds = 60; // Maximum delay in seconds
const headless = true;

// Helper to check if current time is within announcement hours
const isWithinAnnouncementHours = (): boolean => {
    const hour = new Date().getHours();
    return (hour >= 9 && hour < 12) || (hour >= 18 && hour <= 21);
};

const shouldSpeak = process.env.VERCEL_ENV !== "production" && isWithinAnnouncementHours();
const speaker = shouldSpeak ? new TextToSpeechService() : null;

// Initialize browser and perform browsing
export const browsePosts = inngest.createFunction(
    { id: "browse-posts", retries: 0, concurrency: 1 },
    // Run every 2.5 hours
    { cron: "30 */2 * * *" },
    // { event: "twitter/browse-posts" },
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
                await twitterBot.init(headless, 500);
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
                const filtered = await twitterBot.filterAndSortPosts(posts);
                return filtered;
            });

            // // Send event for summarizing the filtered posts
            // if (relevantPosts.length > 0) {
            //     await step.sendEvent("twitter/summarize.browse", {
            //         name: "twitter/summarize.browse",
            //         data: {
            //             posts: relevantPosts.slice(0, maxInOneGo).map((post) => ({
            //                 authorHandle: post.authorHandle,
            //                 text: post.text,
            //                 engagementScore: post.totalEngagement,
            //             })),
            //         },
            //     });
            // }

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
        let maxRetries = 2;
        let currentTry = 0;

        // make sure both tweetId and authorHandle are present
        if (!post.tweetId || !post.authorHandle) {
            throw new Error("Invalid post data");
        }

        while (currentTry < maxRetries) {
            try {
                console.log(`Engaging with post ${post.tweetId} by ${post.authorHandle}`);

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
                    await twitterBot.init(headless, 500);
                });

                // Engage with the post
                const action = await step.run("engage", async () => {
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

// Summarize the posts before engaging
export const summarizeBrowsing = inngest.createFunction(
    { id: "summarize-browse", retries: 0, concurrency: 1 },
    { event: "twitter/summarize.browse" },
    async ({ event, step }) => {
        if (!shouldSpeak || !isWithinAnnouncementHours()) {
            return;
        }

        const { posts } = event.data;

        // get market data
        const marketDataFetcher = MarketDataFetcher.getInstance();
        const majorCoins = await marketDataFetcher.getMajorCoins();

        const prompt = `
Current Time: ${new Date().toLocaleTimeString()}

Crypto Market:
${JSON.stringify(majorCoins)}

Posts:
${JSON.stringify(posts)}`;

        await step.run("announce-summary", async () => {
            const openai = new OpenAI();
            const completion = await openai.chat.completions.create({
                model: LLM_MODELS.OPENAI_GPT_4O_MINI,
                messages: [
                    {
                        role: "system",
                        content: `You are an AI assistant starting your Twitter browsing session. 
Create a natural, flowing summary that includes:
1. A brief greeting appropriate for the time of day
2. A quick comment on the crypto market conditions (focus on notable changes or stability)
3. A summary of the Twitter posts you're about to engage with
4. End with either:
    - A light-hearted crypto joke (e.g., "Why did the Bitcoin cross the blockchain? To get to the other validator!")
    - An interesting crypto fact (e.g., "Fun fact: The first Bitcoin transaction was used to buy two pizzas for 10,000 BTC!")

Keep parts 1-3 concise but conversational. The joke/fact should be short and clever.
Vary between jokes and facts to keep it interesting.

Example outputs:
"Good morning! Bitcoin's holding strong at 45k while Ethereum and Solana are showing some gains. Found some great discussions about AI and web3 in my feed from @user1 and @user2. Here's a fun one: Why don't Bitcoin maxis need umbrellas? Because they're already in the cloud!"

"Evening folks! Market's looking green - BTC at 52k, ETH pushing 3k, and SOL making moves. Got some interesting posts to check out from @user1 about DeFi trends. Did you know? The term 'HODL' came from a typo in a 2013 Bitcoin forum post!"
`,
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
            });

            const summary = completion.choices[0].message.content;
            if (speaker) {
                await speaker.speakText(summary || "Found some interesting posts to check out.");
            }
        });
    }
);
