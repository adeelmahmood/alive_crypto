import { loadEnvConfig } from "@next/env";
import OnChainDataFetcher from "@/modules/crypto/OnChainDataFetcher";
import OnChainDataInsights from "@/modules/crypto/OnChainDataInsights";

loadEnvConfig("");

export const Onchaindata = async () => {
    const fetcher = OnChainDataFetcher.getInstance();
    try {
        const metrics = await fetcher.getMetrics();
        console.log("On-chain metrics:", metrics);

        // get insights
        const insights = OnChainDataInsights.getInstance();
        const marketInsight = await insights.generateInsights(metrics.transfers);
        console.log("Market insight:", JSON.stringify(marketInsight, null, 2));
    } catch (error) {
        console.error("Error:", error);
    }
};
