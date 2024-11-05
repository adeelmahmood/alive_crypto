import { Artwork, ArtworkCreate } from "@/types";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

export class ImageDatastore {
    private supabase: SupabaseClient;
    private STORAGE_BUCKET = "artworks";

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

    public async saveArtwork(artwork: ArtworkCreate): Promise<Artwork> {
        try {
            // 1. Save image to storage
            const storageKey = `${uuidv4()}.png`;
            const imageBuffer = Buffer.from(artwork.b64_json, "base64");

            const { error: storageError } = await this.supabase.storage
                .from(this.STORAGE_BUCKET)
                .upload(storageKey, imageBuffer, {
                    contentType: "image/png",
                    cacheControl: "3600",
                    upsert: false,
                });

            if (storageError) {
                throw new Error(`Storage error: ${storageError.message}`);
            }

            // 2. Get the public URL for the image
            const {
                data: { publicUrl },
            } = this.supabase.storage.from(this.STORAGE_BUCKET).getPublicUrl(storageKey);

            // 3. Save artwork data to database
            const { data, error: dbError } = await this.supabase
                .from("artworks")
                .insert({
                    title: artwork.title,
                    creator: artwork.creator,
                    description: artwork.description,
                    market_mood: artwork.marketMood,
                    tags: artwork.tags,
                    likes: 0,
                    image_url: publicUrl,
                    storage_key: storageKey,
                })
                .select()
                .single();

            if (dbError) {
                // If database insert fails, clean up the stored image
                await this.supabase.storage.from(this.STORAGE_BUCKET).remove([storageKey]);
                throw new Error(`Database error: ${dbError.message}`);
            }

            return this.transformDatabaseArtwork(data);
        } catch (error) {
            console.error("Error saving artwork:", error);
            throw error;
        }
    }

    public async getArtworks(
        options: {
            limit?: number;
            offset?: number;
            marketMood?: string;
            searchQuery?: string;
        } = {}
    ): Promise<{ artworks: Artwork[]; total: number }> {
        try {
            let query = this.supabase.from("artworks").select("*", { count: "exact" });

            // Apply filters
            if (options.marketMood) {
                query = query.eq("market_mood", options.marketMood);
            }

            if (options.searchQuery) {
                query = query.or(
                    `title.ilike.%${options.searchQuery}%, description.ilike.%${options.searchQuery}%`
                );
            }

            // Apply pagination
            if (options.limit) {
                query = query.limit(options.limit);
            }
            if (options.offset) {
                query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
            }

            // Order by timestamp
            query = query.order("timestamp", { ascending: false });

            const { data, error, count } = await query;

            if (error) {
                throw new Error(`Database error: ${error.message}`);
            }

            return {
                artworks: data.map(this.transformDatabaseArtwork),
                total: count || 0,
            };
        } catch (error) {
            console.error("Error retrieving artworks:", error);
            throw error;
        }
    }

    public async incrementLikes(artworkId: number): Promise<number> {
        const { data, error } = await this.supabase.rpc("increment_artwork_likes", {
            artwork_id: artworkId,
        });

        if (error) {
            throw new Error(`Error incrementing likes: ${error.message}`);
        }

        // Get updated likes count
        const { data: artwork } = await this.supabase
            .from("artworks")
            .select("likes")
            .eq("id", artworkId)
            .single();

        return artwork?.likes || 0;
    }

    private transformDatabaseArtwork(dbArtwork: any): Artwork {
        return {
            id: dbArtwork.id,
            title: dbArtwork.title,
            creator: dbArtwork.creator,
            description: dbArtwork.description,
            marketMood: dbArtwork.market_mood,
            tags: dbArtwork.tags,
            likes: dbArtwork.likes,
            imageUrl: dbArtwork.image_url,
            storageKey: dbArtwork.storage_key,
            timestamp: dbArtwork.timestamp,
        };
    }
}
