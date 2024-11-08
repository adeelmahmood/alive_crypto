import {
    ARTWORK_GENERATION_DAILY_LIMIT,
    ARTWORK_GENERATION_GLOBAL_DAILY_LIMIT,
    ARTWORK_GENERATION_MIN_INTERVAL_MS,
} from "@/constants";
import { VisitorRecord } from "@/types";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export class VisitorDatastore {
    private supabase: SupabaseClient;

    public constructor() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Missing Supabase environment variables");
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    private TABLE_NAME = "visitors";

    public async getVisitor(compositeId: string): Promise<VisitorRecord | null> {
        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .select("*")
            .eq("id", compositeId)
            .single();

        if (error && error.code !== "PGRST116") {
            // PGRST116 is "not found"
            throw error;
        }

        return data;
    }

    public async upsertVisitor(visitor: VisitorRecord): Promise<VisitorRecord> {
        const today = new Date().toISOString().split("T")[0];

        // Reset count if it's a new day
        if (visitor.last_reset_date !== today) {
            visitor.generation_count = 0;
            visitor.last_reset_date = today;
        }

        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .upsert({
                ...visitor,
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    public async incrementGenerationCount(compositeId: string): Promise<VisitorRecord> {
        const { data, error } = await this.supabase.rpc("increment_visitor_generation_count", {
            visitor_id: compositeId,
        });

        if (error) {
            throw error;
        }

        return data;
    }

    /**
     * Gets total generations for today across all visitors
     */
    private async getTodayTotalGenerations(): Promise<number> {
        const today = new Date().toISOString().split("T")[0];

        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .select("generation_count")
            .eq("last_reset_date", today);

        if (error) {
            throw error;
        }

        return data.reduce((sum, record) => sum + record.generation_count, 0);
    }

    /**
     * Checks if a visitor can generate an image
     */
    public async canGenerate(
        visitor: VisitorRecord
    ): Promise<{ allowed: boolean; reason?: string }> {
        try {
            const today = new Date().toISOString().split("T")[0];

            // Reset count if it's a new day
            if (visitor.last_reset_date !== today) {
                visitor.generation_count = 0;
                visitor.last_reset_date = today;

                await this.upsertVisitor(visitor);
            }

            // Check daily limit
            if (visitor.generation_count >= ARTWORK_GENERATION_DAILY_LIMIT) {
                return {
                    allowed: false,
                    reason: "Daily generation limit reached",
                };
            }

            // Check global daily limit
            const globalTotalToday = await this.getTodayTotalGenerations();
            if (globalTotalToday >= ARTWORK_GENERATION_GLOBAL_DAILY_LIMIT) {
                return {
                    allowed: false,
                    reason: "Global daily generation limit reached. Please try again tomorrow.",
                };
            }

            // Skip interval check for first-time users
            if (visitor.generation_count > 0) {
                // Check minimum interval between generations
                const lastGeneration = new Date(visitor.last_generation_time!).getTime();
                const now = Date.now();
                const timeRemaining = ARTWORK_GENERATION_MIN_INTERVAL_MS - (now - lastGeneration);

                if (timeRemaining > 0) {
                    return {
                        allowed: false,
                        reason: `Please wait ${Math.ceil(
                            timeRemaining / 1000
                        )} seconds before generating another image`,
                    };
                }
            }

            return { allowed: true };
        } catch (error) {
            console.error("Error in canGenerate:", error);
            return {
                allowed: false,
                reason: "An error occurred while checking generation permissions. Please try again.",
            };
        }
    }
}
