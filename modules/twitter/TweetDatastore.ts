import { TweetRecord, TweetResponse } from "@/types";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export class TweetDatastore {
    private supabase: SupabaseClient;

    public constructor() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Missing Supabase environment variables");
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    private decodeHtmlEntities(text: string): string {
        const entities = {
            "&amp;": "&",
            "&lt;": "<",
            "&gt;": ">",
            "&quot;": '"',
            "&#039;": "'",
            "&apos;": "'",
        };
        return text.replace(
            /&amp;|&lt;|&gt;|&quot;|&#039;|&apos;/g,
            (entity) => entities[entity as keyof typeof entities]
        );
    }

    /**
     * Save one or more tweets to the database
     */
    async saveTweets(rawResponse: string): Promise<TweetRecord[]> {
        // Parse all tweets and thoughts from the response
        const tweetsMatch = rawResponse.match(/<tweets>([\s\S]*?)<\/tweets>/)?.[1];
        const thoughts = rawResponse.match(/<thoughts>([\s\S]*?)<\/thoughts>/)?.[1];

        if (!tweetsMatch) {
            throw new Error("No tweets found in response");
        }

        // Extract individual tweets
        const tweetContents = tweetsMatch
            .match(/<tweet>[\s\S]*?<\/tweet>/g)
            ?.map((tweet) => {
                const content = tweet.match(/<tweet>([\s\S]*?)<\/tweet>/)?.[1]?.trim();
                // Decode HTML entities like &amp; back to &
                return content ? this.decodeHtmlEntities(content) : undefined;
            })
            ?.filter((tweet): tweet is string => tweet !== undefined);

        if (!tweetContents || tweetContents.length === 0) {
            throw new Error("No valid tweets found in response");
        }

        // Insert all tweets as a batch
        const tweetsToInsert = tweetContents.map((content) => ({
            content,
            thoughts: thoughts?.trim(),
            posted: false,
        }));

        const { data, error } = await this.supabase.from("tweets").insert(tweetsToInsert).select();

        if (error) {
            throw new Error(`Failed to save tweets: ${error.message}`);
        }

        return data;
    }

    /**
     * Get recent tweet history
     */
    async getRecentHistory(limit: number = 3): Promise<TweetRecord[]> {
        const { data, error } = await this.supabase
            .from("tweets")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) {
            throw new Error(`Failed to fetch tweet history: ${error.message}`);
        }

        return data as TweetRecord[];
    }

    /**
     * Update tweet with Twitter post ID after posting
     */
    async markAsPosted(id: number, twitterPostId: string): Promise<void> {
        const { error } = await this.supabase
            .from("tweets")
            .update({
                posted: true,
                twitter_post_id: twitterPostId,
            })
            .eq("id", id);

        if (error) {
            throw new Error(`Failed to update tweet status: ${error.message}`);
        }
    }

    /**
     * Update engagement stats for a tweet
     */
    async updateEngagementStats(id: number, stats: TweetRecord["engagement_stats"]): Promise<void> {
        const { error } = await this.supabase
            .from("tweets")
            .update({ engagement_stats: stats })
            .eq("id", id);

        if (error) {
            throw new Error(`Failed to update engagement stats: ${error.message}`);
        }
    }

    /**
     * Get all unposted tweets
     */
    async getUnpostedTweets(): Promise<TweetRecord[]> {
        const { data, error } = await this.supabase
            .from("tweets")
            .select("*")
            .eq("posted", false)
            .order("created_at", { ascending: true });

        if (error) {
            throw new Error(`Failed to fetch unposted tweets: ${error.message}`);
        }

        return data;
    }
}
