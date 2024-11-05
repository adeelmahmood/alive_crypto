import axios from "axios";
import MarketDataFetcher from "./MarketDataFetcher";
import { TokenTransfer } from "@/types";

interface OnChainData {
    transfers: TokenTransfer[];
    timestamp: number;
}

class OnChainDataFetcher {
    private static instance: OnChainDataFetcher;
    private marketDataFetcher: MarketDataFetcher;
    private cache: {
        [key: string]: {
            data: TokenTransfer[];
            timestamp: number;
        };
    } = {};
    private readonly CACHE_DURATION = 900000;
    private readonly USD_THRESHOLD = 100000; // $100k threshold
    private readonly TOKENS = {
        USDT: {
            contract: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            decimals: 6,
            priceSymbol: "usdt", // Symbol to look up in market data
        },
        WETH: {
            contract: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            decimals: 18,
            priceSymbol: "weth",
        },
        WBTC: {
            contract: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
            decimals: 8,
            priceSymbol: "wbtc",
        },
    };

    private constructor() {
        this.marketDataFetcher = MarketDataFetcher.getInstance();
    }

    public static getInstance(): OnChainDataFetcher {
        if (!OnChainDataFetcher.instance) {
            OnChainDataFetcher.instance = new OnChainDataFetcher();
        }
        return OnChainDataFetcher.instance;
    }

    private async fetchEtherscanTransfers(
        tokenConfig: typeof OnChainDataFetcher.prototype.TOKENS.USDT,
        asset: string
    ): Promise<TokenTransfer[]> {
        try {
            // Get current price in USD for the asset
            const priceData = await this.marketDataFetcher.getSpecificCoin(tokenConfig.priceSymbol);
            if (!priceData) {
                console.warn(`Unable to fetch price data for ${asset}`);
                return [];
            }

            const response = await axios.get("https://api.etherscan.io/api", {
                params: {
                    module: "account",
                    action: "tokentx",
                    contractaddress: tokenConfig.contract,
                    page: 1,
                    offset: 100,
                    sort: "desc",
                    apikey: process.env.ETHERSCAN_API_KEY,
                },
            });

            if (response.data.status === "1" && response.data.result) {
                return response.data.result
                    .map((tx: any) => {
                        const value = parseFloat(tx.value) / Math.pow(10, tokenConfig.decimals);
                        const valueInUSD = value * priceData.priceInUSD;

                        return {
                            from: tx.from,
                            to: tx.to,
                            value: value,
                            valueInUSD,
                            timestamp: parseInt(tx.timeStamp),
                            asset,
                            hash: tx.hash,
                            tokenName: tx.tokenName,
                            tokenSymbol: tx.tokenSymbol,
                        };
                    })
                    .filter((tx: TokenTransfer) => tx.valueInUSD >= this.USD_THRESHOLD);
            }
            return [];
        } catch (error) {
            console.error(`Error fetching ${asset} transfers:`, error);
            return [];
        }
    }

    private async fetchTransfersForAsset(asset: string): Promise<TokenTransfer[]> {
        const now = Date.now();
        const cacheKey = `transfers_${asset}`;

        if (this.cache[cacheKey] && now - this.cache[cacheKey].timestamp < this.CACHE_DURATION) {
            return this.cache[cacheKey].data;
        }

        const tokenConfig = this.TOKENS[asset as keyof typeof this.TOKENS];
        if (!tokenConfig) {
            throw new Error(`Unsupported asset: ${asset}`);
        }

        const transfers = await this.fetchEtherscanTransfers(tokenConfig, asset);

        this.cache[cacheKey] = {
            data: transfers,
            timestamp: now,
        };

        return transfers;
    }

    public async getMetrics(assets: string[] = ["USDT", "WETH", "WBTC"]): Promise<OnChainData> {
        try {
            console.log("Fetching metrics for assets", assets);
            const allTransfers = [];

            for (const asset of assets) {
                const transfers = await this.fetchTransfersForAsset(asset);
                allTransfers.push(...transfers);
            }

            return {
                transfers: allTransfers,
                timestamp: Date.now(),
            };
        } catch (error) {
            console.error("Error getting metrics:", error);
            throw error;
        }
    }

    public async getTransfersForAsset(asset: string): Promise<TokenTransfer[]> {
        return this.fetchTransfersForAsset(asset);
    }
}

export default OnChainDataFetcher;
