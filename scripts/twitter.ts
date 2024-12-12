import TwitterClient from "@/modules/twitter/TwitterClient";

export const twitter = async () => {
    const client = new TwitterClient();

    // check rate limit
    await client.checkRateLimit();
};
