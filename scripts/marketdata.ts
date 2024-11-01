import EnhancedMarketDataFetcher from "@/modules/crypto/EnhancedMarketDataFetcher";
import MarketDataFetcher from "@/modules/crypto/MarketDataFetcher";

export const MarketData = async () => {
    const fetcher = MarketDataFetcher.getInstance();

    try {
        // Get all market data
        // const allData = await fetcher.getMarketData();
        // console.log("All market data:", allData);

        // Get specific coin
        // const btcData = await fetcher.getSpecificCoin("btc");
        // console.log("Bitcoin data:", btcData);

        // // Get top 10 coins
        // const topCoins = await fetcher.getTopNCoins(10);
        // console.log("Top 10 coins:", topCoins);

        // Get the enhanced fetcher instance
        const fetcher = EnhancedMarketDataFetcher.getInstance();

        // Get enhanced data for major coins
        const majorCoinsData = await fetcher.getEnhancedMajorCoins();
        console.log("Enhanced Major Coins Data:", majorCoinsData);

        // Access BTC data with proper type checking
        if (majorCoinsData.BTC) {
            const btcData = majorCoinsData.BTC;
            console.log("Current BTC Price:", btcData.priceInUSD);
            console.log("Technical Indicators:", {
                rsi: btcData.technical.rsi14,
                sma20: btcData.technical.sma20,
                supportLevels: btcData.technical.supportLevels,
                resistanceLevels: btcData.technical.resistanceLevels,
            });
        }
    } catch (error) {
        console.error("Error fetching market data:", error);
    }
};
