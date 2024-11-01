import axios from "axios";

interface CoinMarketData {
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

interface ProcessedMarketData {
    timestamp: number;
    coins: {
        [symbol: string]: {
            priceInUSD: number;
            volume24h: number;
            marketCap: number;
            priceChange24hPercentage: number;
            marketCapRank: number;
        };
    };
    lastUpdated: string;
}

class MarketDataFetcher {
    private static instance: MarketDataFetcher;
    private lastFetchTime: number = 0;
    private cache: ProcessedMarketData | null = null;
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

    private async fetchFromAPI(): Promise<CoinMarketData[]> {
        try {
            const response = await axios.get(`${this.API_BASE_URL}/coins/markets`, {
                params: {
                    vs_currency: "usd",
                    order: "market_cap_desc",
                    per_page: 100,
                    page: 1,
                    sparkline: false,
                },
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 429) {
                // Rate limit hit, wait and retry
                await new Promise((resolve) => setTimeout(resolve, this.RATE_LIMIT_WAIT));
                return this.fetchFromAPI();
            }
            throw error;
        }
    }

    private processMarketData(data: CoinMarketData[]): ProcessedMarketData {
        const coins: ProcessedMarketData["coins"] = {};

        data.forEach((coin) => {
            coins[coin.symbol] = {
                priceInUSD: coin.current_price,
                volume24h: coin.total_volume,
                marketCap: coin.market_cap,
                priceChange24hPercentage: coin.price_change_percentage_24h,
                marketCapRank: coin.market_cap_rank,
            };
        });

        return {
            timestamp: Date.now(),
            coins,
            lastUpdated: new Date().toISOString(),
        };
    }

    public async getMarketData(): Promise<ProcessedMarketData> {
        const now = Date.now();

        // Return cached data if it's still fresh
        if (this.cache && now - this.lastFetchTime < this.CACHE_DURATION) {
            return this.cache;
        }

        try {
            const rawData = await this.fetchFromAPI();
            this.cache = this.processMarketData(rawData);
            this.lastFetchTime = now;
            return this.cache;
        } catch (error) {
            if (this.cache) {
                // Return stale cache if fetch fails
                console.warn("Failed to fetch fresh market data, returning cached data");
                return this.cache;
            }
            throw error;
        }
    }

    public async getSpecificCoin(
        symbol: string
    ): Promise<ProcessedMarketData["coins"][string] | null> {
        const marketData = await this.getMarketData();
        return marketData.coins[symbol.toLowerCase()] || null;
    }

    public async getTopNCoins(n: number = 10): Promise<ProcessedMarketData["coins"]> {
        const marketData = await this.getMarketData();
        return Object.fromEntries(
            Object.entries(marketData.coins)
                .sort((a, b) => a[1].marketCapRank - b[1].marketCapRank)
                .slice(0, n)
        );
    }
}

export default MarketDataFetcher;
