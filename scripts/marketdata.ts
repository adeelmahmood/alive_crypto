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

        // time this operation
        // const s = Date.now();
        const coins = await fetcher.getMajorCoins();

        const result = Object.entries(coins)
            .map(
                ([symbol, data]) =>
                    `${symbol.toUpperCase()}: $${data.priceInUSD.toFixed(2)} (${
                        data.priceChange24hPercentage >= 0 ? "+" : ""
                    }${data.priceChange24hPercentage.toFixed(1)}%)`
            )
            .join("\n");
        console.log("Major coins:", result);
        // await fetcher.getMajorCoins();
        // console.log("Time taken:", Date.now() - s, "ms");
    } catch (error) {
        console.error("Error fetching market data:", error);
    }
};
