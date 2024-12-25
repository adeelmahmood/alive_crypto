import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface TwitterBotAction {
    id?: string;
    timestamp: Date;
    engagement_method: string;
    action_type: string;
    action_reasoning: string;
    target_user: string;
    target_post_text?: string;
    target_tweet_id: string;
    target_tweet_url: string;
    reply_text?: string;
    engagement_score: number;
    success: boolean;
    error_message?: string;
    metrics?: {
        likes: number;
        replies: number;
        retweets: number;
        views: number;
    };
}

export class TwitterBotStorage {
    private supabase: SupabaseClient;

    public constructor() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Missing Supabase environment variables");
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async saveAction(action: TwitterBotAction) {
        const { data, error } = await this.supabase
            .from("twitter_bot_actions")
            .insert([
                {
                    ...action,
                    timestamp: action.timestamp.toISOString(),
                    metrics: action.metrics ? JSON.stringify(action.metrics) : null,
                },
            ])
            .select()
            .single();

        if (error) {
            console.error("Error saving action to Supabase:", error);
            console.error("Failed payload:", {
                ...action,
                timestamp: action.timestamp.toISOString(),
                metrics: action.metrics ? JSON.stringify(action.metrics) : null,
            });
            throw error;
        }

        return data;
    }

    async getRecentActions(minutes: number): Promise<TwitterBotAction[]> {
        const { data, error } = await this.supabase
            .from("twitter_bot_actions")
            .select("*")
            .gte("timestamp", new Date(Date.now() - minutes * 60000).toISOString())
            .order("timestamp", { ascending: false });

        if (error) {
            console.error("Error fetching recent actions:", error);
            throw error;
        }

        return data || [];
    }

    async getDailyActionCount(): Promise<number> {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const { count, error } = await this.supabase
            .from("twitter_bot_actions")
            .select("*", { count: "exact" })
            .gte("timestamp", startOfDay.toISOString());

        if (error) {
            console.error("Error getting daily action count:", error);
            throw error;
        }

        return count || 0;
    }

    async getUserEngagementHistory(username: string): Promise<TwitterBotAction[]> {
        const { data, error } = await this.supabase
            .from("twitter_bot_actions")
            .select("*")
            .eq("target_user", username)
            .order("timestamp", { ascending: false });

        if (error) {
            console.error("Error fetching user engagement history:", error);
            throw error;
        }

        return data || [];
    }
}
