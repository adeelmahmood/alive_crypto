// MarketDataFetcher types

export interface CoinMarketData {
    id: string;
    symbol: string;
    name: string;
    current_price: number;
    market_cap: number;
    market_cap_rank: number;
    total_volume: number;
    price_change_percentage_24h: number;
    market_cap_change_percentage_24h: number;
    last_updated: string;
}

export interface ProcessedMarketData {
    timestamp: number;
    coins: {
        [symbol: string]: {
            name: string;
            priceInUSD: number;
            volume24h: number;
            marketCap: number;
            priceChange24hPercentage: number;
            marketCapRank: number;
        };
    };
    lastUpdated: string;
}

// OnChainDataFetcher types

export interface TokenTransfer {
    from: string;
    to: string;
    value: string;
    valueInUSD: number;
    timestamp: number;
    asset: string;
    hash: string;
    tokenName: string;
    tokenSymbol: string;
}

// OnChainDataInsights types

export interface MarketInsight {
    timestamp: number;
    summary: string;
    metrics: {
        totalVolumeUSD: number;
        volumeByAsset: { [key: string]: number };
        largeTransferCount: number;
        uniqueAddresses: number;
        topSenders: { address: string; volumeUSD: number; assets: { [key: string]: number } }[];
        topReceivers: { address: string; volumeUSD: number; assets: { [key: string]: number } }[];
        recentLargeTransfers: {
            from: string;
            to: string;
            valueUSD: number;
            asset: string;
            timestamp: number;
        }[];
    };
}

export interface ProcessedMetrics {
    totalVolumeUSD: number;
    volumeByAsset: { [key: string]: number };
    uniqueAddresses: Set<string>;
    largeTransferCount: number;
    addressMetrics: {
        [address: string]: {
            volumeUSD: number;
            assets: { [asset: string]: number };
            type: "sender" | "receiver" | "both";
        };
    };
    recentLargeTransfers: TokenTransfer[];
}

// AI services

export interface AIResponse {
    response: string;
    inputTokens: number;
    outputTokens: number;
    cost: number;
}

export interface AIImageResponse {
    b64_json: string;
    revised_prompt: string;
}

// Tweet AI response types

export interface TweetResponse {
    tweet: string;
    thoughts: string;
}

// Tweet data store types

export interface TweetRecord {
    id: number;
    created_at: string;
    content: string;
    thoughts: string;
    posted: boolean;
    twitter_post_id?: string;
    engagement_stats?: {
        likes?: number;
        retweets?: number;
        replies?: number;
    };
}

// Types for memory storage

export enum MemoryType {
    MILESTONE = "MILESTONE",
    COMMITMENT = "COMMITMENT",
    CRISIS = "CRISIS",
    RELATIONSHIP = "RELATIONSHIP",
    INSIGHT = "INSIGHT",
}

export interface MemoryRecord {
    id?: string;
    created_at?: string;
    type: MemoryType;
    content: string;
    significance: number;
    reason: string;
    tags: string[];
    context: string;
    tweet_id: string;
}

export interface MemoryEvaluationResponse {
    evaluation: {
        qualifies_as_memory: boolean;
        explanation: string;
        if_memory?: {
            type: MemoryType;
            content: string;
            significance: number;
            reason: string;
            tags: string[];
        };
    };
}

// Artwork types

export type MarketMood = "Bullish" | "Bearish" | "Transition" | "Prophetic";

export interface ArtworkBase {
    title: string;
    creator: string;
    description: string;
    marketMood: MarketMood;
    tags: string[];
    likes: number;
}

export interface ArtworkCreate extends ArtworkBase {
    b64_json: string; // Base64 encoded image data
}

export interface Artwork extends ArtworkBase {
    id: number;
    imageUrl: string;
    timestamp: string;
    storageKey: string; // Key used to store in Supabase storage
}

export type ArtworkWithStats = Artwork & {
    likedByUser: boolean;
};
