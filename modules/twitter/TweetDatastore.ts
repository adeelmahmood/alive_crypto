import { TweetRecord, TweetResponse } from "@/types";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import yaml from "js-yaml";

export class TweetDatastore {
    private static instance: TweetDatastore;
    private supabase: SupabaseClient;

    public constructor() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Missing Supabase environment variables");
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    /**
     * Parse YAML response into structured data
     */
    private parseResponse(rawResponse: string): TweetResponse {
        try {
            const parsed = yaml.load(rawResponse) as TweetResponse;
            return parsed;
        } catch (error: any) {
            throw new Error(`Failed to parse response: ${error.message}`);
        }
    }

    /**
     * Save a new tweet to the database
     */
    async saveTweet(rawResponse: string): Promise<TweetRecord> {
        const parsed = this.parseResponse(rawResponse);

        const { data, error } = await this.supabase
            .from("tweets")
            .insert({
                content: parsed.tweet,
                thoughts: parsed.thoughts,
                posted: false,
            })
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to save tweet: ${error.message}`);
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
