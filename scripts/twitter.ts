import TwitterApiClient from "@/modules/twitter/TwitterApiClient";
import TwitterBot from "@/modules/twitter/TwitterBot";
import { TwitterBotStorage } from "@/modules/twitter/TwitterBotStorage";

export const twitter = async () => {
    // const rules = {
    //     timingRules: {
    //         maxActionsPerHour: 15,
    //         cooldownPeriod: 120, // 2 hours in minutes
    //         maxDailyActions: 100,
    //     },
    //     blacklistedWords: ["scam", "rugpull", "fake", "ponzi"],
    // };
    // const bot = new TwitterBot(rules);
    // try {
    //     // Initialize browser in headless mode
    //     await bot.init(false, 500); // headless=true, slower execution for better reliability
    //     // Do the browsing
    //     if (await bot.canPerformActions()) {
    //         await bot.performBrowsingSession();
    //     }
    // } catch (error) {
    //     console.error("Critical error in bot:", error);
    // } finally {
    //     await bot.close();
    // }
    // const datastore = new TwitterBotStorage();
    // const recent = await datastore.getRecentActions(60);
    // console.log("Recent actions:", recent);
    // console.log("\n\n---------------------------------\n\n");
    // const engagement = await datastore.getUserEngagementHistory("@rovercrc");
    // console.log("Engagement history:", engagement);
    // const thresholdTime = new Date(Date.now() - 120 * 60000);
    // const recentlyEngaged = engagement.some((action) => new Date(action.timestamp) > thresholdTime);
    // console.log(`>>> Recent engagement : ${recentlyEngaged}`);
    // const bot = new TwitterBot({
    //     timingRules: {
    //         maxActionsPerHour: 15,
    //         cooldownPeriod: 120, // minutes
    //         maxDailyActions: 100,
    //     },
    //     blacklistedWords: [], // Add any words to avoid
    // });
    // await bot.init(false, 500);
    // await bot.login(process.env.TWITTER_USERNAME!, process.env.TWITTER_PASSWORD!);
    // const posts = await bot.getTimelinePosts(1);
    // console.log("Posts:", posts);
    // await bot.close();
};
