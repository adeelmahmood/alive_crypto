import { CoinMarketData, ProcessedMarketData } from "@/types";
import axios from "axios";

class MarketDataFetcher {
    private static instance: MarketDataFetcher;
    private cache: Map<string, { data: ProcessedMarketData; timestamp: number }> = new Map();
    private readonly CACHE_DURATION = 60000; // 1 minute
    private readonly API_BASE_URL = "https://api.coingecko.com/api/v3";
    private readonly RATE_LIMIT_WAIT = 30000; // 30 seconds

    private constructor() {}

    public static getInstance(): MarketDataFetcher {
        if (!MarketDataFetcher.instance) {
            MarketDataFetcher.instance = new MarketDataFetcher();
        }
        return MarketDataFetcher.instance;
    }

    private async fetchFromAPI(
        params: {
            category?: string;
            limit?: number;
        } = {}
    ): Promise<CoinMarketData[]> {
        try {
            const response = await axios.get(`${this.API_BASE_URL}/coins/markets`, {
                params: {
                    vs_currency: "usd",
                    order: "market_cap_desc",
                    per_page: params.limit || 100,
                    page: 1,
                    sparkline: false,
                    category: params.category,
                },
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 429) {
                // Rate limit hit, wait and retry
                await new Promise((resolve) => setTimeout(resolve, this.RATE_LIMIT_WAIT));
                return this.fetchFromAPI(params);
            }
            throw error;
        }
    }

    private processMarketData(data: CoinMarketData[]): ProcessedMarketData {
        const coins: ProcessedMarketData["coins"] = {};

        data.forEach((coin) => {
            coins[coin.symbol.toLowerCase()] = {
                name: coin.name,
                priceInUSD: coin.current_price,
                volume24h: coin.total_volume,
                marketCap: coin.market_cap,
                priceChange24hPercentage: coin.price_change_percentage_24h || 0,
                marketCapRank: coin.market_cap_rank,
            };
        });

        return {
            timestamp: Date.now(),
            coins,
            lastUpdated: new Date().toISOString(),
        };
    }

    private async getCachedData(
        cacheKey: string,
        fetchParams: {
            category?: string;
            limit?: number;
        } = {}
    ): Promise<ProcessedMarketData> {
        const now = Date.now();
        const cached = this.cache.get(cacheKey);

        // Return cached data if it's still fresh
        if (cached && now - cached.timestamp < this.CACHE_DURATION) {
            return cached.data;
        }

        try {
            const rawData = await this.fetchFromAPI(fetchParams);
            const processed = this.processMarketData(rawData);
            this.cache.set(cacheKey, { data: processed, timestamp: now });
            return processed;
        } catch (error) {
            if (cached) {
                // Return stale cache if fetch fails
                console.warn(
                    `Failed to fetch fresh market data for ${cacheKey}, returning cached data`
                );
                return cached.data;
            }
            throw error;
        }
    }

    /**
     * Get market data for AI and meme coins
     */
    public async getAIMemeCoins(limit: number = 10): Promise<ProcessedMarketData> {
        return this.getCachedData("ai-meme", { category: "ai-meme-coins", limit });
    }

    /**
     * Get formatted summary of AI and meme coins
     */
    public async getAIMemeSummary(): Promise<string> {
        const data = await this.getAIMemeCoins();

        const formatPrice = (price: number) =>
            price < 0.01 ? price.toExponential(2) : price.toFixed(2);

        const formatChange = (change: number) => `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;

        const sortedCoins = Object.entries(data.coins)
            .sort(([, a], [, b]) => b.marketCap - a.marketCap)
            .slice(0, 10)
            .map(
                ([symbol, coin]) =>
                    `${coin.name} (${symbol.toUpperCase()}): $${formatPrice(
                        coin.priceInUSD
                    )} (${formatChange(coin.priceChange24hPercentage)})`
            );

        return sortedCoins.join("\n");
    }

    /**
     * Get market data for major coins
     */
    public async getMarketData(): Promise<ProcessedMarketData> {
        return this.getCachedData("major");
    }

    public async getMajorCoins(): Promise<ProcessedMarketData["coins"]> {
        const marketData = await this.getMarketData();
        return {
            BTC: marketData.coins["btc"],
            ETH: marketData.coins["eth"],
            SOL: marketData.coins["sol"],
        };
    }

    public async getTopNCoins(n: number = 10): Promise<ProcessedMarketData["coins"]> {
        const marketData = await this.getMarketData();
        return Object.fromEntries(
            Object.entries(marketData.coins)
                .sort((a, b) => a[1].marketCapRank - b[1].marketCapRank)
                .slice(0, n)
        );
    }

    public async getSpecificCoin(
        symbol: string
    ): Promise<ProcessedMarketData["coins"][string] | null> {
        const marketData = await this.getMarketData();
        return marketData.coins[symbol.toLowerCase()] || null;
    }
}

export default MarketDataFetcher;
