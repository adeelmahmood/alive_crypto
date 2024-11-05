import { MemoryRecord } from "@/types";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export class MemoryDatasore {
    private supabase: SupabaseClient;
    private readonly MEMORIES_TABLE = "memories";

    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Missing Supabase environment variables");
        }

        this.supabase = createClient(supabaseUrl, supabaseKey, {
            auth: {
                persistSession: false, // Since we're using service role, we don't need to persist sessions
            },
        });
    }

    public async saveMemory(memory: MemoryRecord): Promise<void> {
        try {
            const { error } = await this.supabase.from(this.MEMORIES_TABLE).insert(memory);

            if (error) {
                throw error;
            }

            console.log(`Memory saved successfully: ${memory.content}`);
        } catch (error) {
            console.error("Error saving memory to Supabase:", error);
            throw error;
        }
    }

    public async getMemories(limit: number = 50): Promise<MemoryRecord[]> {
        try {
            const { data, error } = await this.supabase
                .from(this.MEMORIES_TABLE)
                .select("*")
                .order("created_at", { ascending: false })
                .limit(limit);

            if (error) {
                throw error;
            }

            return data;
        } catch (error) {
            console.error("Error fetching memories from Supabase:", error);
            throw error;
        }
    }
}
