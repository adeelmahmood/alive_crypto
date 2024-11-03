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
        const topCoins = await fetcher.getTopNCoins(10);
        console.log("Top 10 coins:", topCoins);
    } catch (error) {
        console.error("Error fetching market data:", error);
    }
};
