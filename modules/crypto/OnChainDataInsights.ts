import { MarketInsight, ProcessedMetrics, TokenTransfer } from "@/types";
import { ClaudeAIService } from "../ai/ClaudeAIService";

class OnChainDataInsights {
    private static instance: OnChainDataInsights;
    private readonly LARGE_TRANSFER_THRESHOLD_USD = 100000; // $100k threshold
    private aiService: ClaudeAIService;

    private constructor() {
        this.aiService = new ClaudeAIService();
    }

    public static getInstance(): OnChainDataInsights {
        if (!OnChainDataInsights.instance) {
            OnChainDataInsights.instance = new OnChainDataInsights();
        }
        return OnChainDataInsights.instance;
    }

    private preprocessTransfers(transfers: TokenTransfer[]): ProcessedMetrics {
        const metrics: ProcessedMetrics = {
            totalVolumeUSD: 0,
            volumeByAsset: {},
            uniqueAddresses: new Set(),
            largeTransferCount: 0,
            addressMetrics: {},
            recentLargeTransfers: [],
        };

        // Sort transfers by timestamp (most recent first)
        const sortedTransfers = [...transfers].sort((a, b) => b.timestamp - a.timestamp);

        sortedTransfers.forEach((transfer) => {
            // Update total volume
            metrics.totalVolumeUSD += transfer.valueInUSD;

            // Update volume by asset
            metrics.volumeByAsset[transfer.asset] =
                (metrics.volumeByAsset[transfer.asset] || 0) + transfer.valueInUSD;

            // Track unique addresses
            metrics.uniqueAddresses.add(transfer.from);
            metrics.uniqueAddresses.add(transfer.to);

            // Track large transfers
            if (transfer.valueInUSD >= this.LARGE_TRANSFER_THRESHOLD_USD) {
                metrics.largeTransferCount++;
                if (metrics.recentLargeTransfers.length < 10) {
                    metrics.recentLargeTransfers.push(transfer);
                }
            }

            // Update sender metrics
            if (!metrics.addressMetrics[transfer.from]) {
                metrics.addressMetrics[transfer.from] = {
                    volumeUSD: 0,
                    assets: {},
                    type: "sender",
                };
            }
            metrics.addressMetrics[transfer.from].volumeUSD -= transfer.valueInUSD;
            metrics.addressMetrics[transfer.from].assets[transfer.asset] =
                (metrics.addressMetrics[transfer.from].assets[transfer.asset] || 0) -
                transfer.valueInUSD;

            // Update receiver metrics
            if (!metrics.addressMetrics[transfer.to]) {
                metrics.addressMetrics[transfer.to] = {
                    volumeUSD: 0,
                    assets: {},
                    type: "receiver",
                };
            }
            metrics.addressMetrics[transfer.to].volumeUSD += transfer.valueInUSD;
            metrics.addressMetrics[transfer.to].assets[transfer.asset] =
                (metrics.addressMetrics[transfer.to].assets[transfer.asset] || 0) +
                transfer.valueInUSD;
        });

        return metrics;
    }

    private formatUSD(value: number): string {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    }

    private generateClaudePrompt(metrics: ProcessedMetrics): string {
        const topMovers = Object.entries(metrics.addressMetrics)
            .sort((a, b) => Math.abs(b[1].volumeUSD) - Math.abs(a[1].volumeUSD))
            .slice(0, 10);

        const recentTransfers = metrics.recentLargeTransfers.map((tx) => ({
            from: tx.from.slice(0, 8),
            to: tx.to.slice(0, 8),
            value: this.formatUSD(tx.valueInUSD),
            asset: tx.asset,
            time: new Date(tx.timestamp * 1000).toISOString(),
        }));

        return `Analyze these cross-token transfer patterns and provide market insights:

Key Metrics:
- Total Volume: ${this.formatUSD(metrics.totalVolumeUSD)}
- Unique Addresses: ${metrics.uniqueAddresses.size}
- Large Transfers (>${this.formatUSD(this.LARGE_TRANSFER_THRESHOLD_USD)}): ${
            metrics.largeTransferCount
        }

Volume by Asset:
${Object.entries(metrics.volumeByAsset)
    .map(([asset, volume]) => `- ${asset}: ${this.formatUSD(volume)}`)
    .join("\n")}

Top Moving Addresses (Last 24h):
${topMovers
    .map(([address, data]) => {
        const direction = data.volumeUSD > 0 ? "received" : "sent";
        const assets = Object.entries(data.assets)
            .map(([asset, volume]) => `${asset}: ${this.formatUSD(Math.abs(volume))}`)
            .join(", ");
        return `- ${address.slice(0, 12)}... ${direction} ${this.formatUSD(
            Math.abs(data.volumeUSD)
        )} (${assets})`;
    })
    .join("\n")}

Recent Large Transfers:
${recentTransfers
    .map((tx) => `- ${tx.value} ${tx.asset} from ${tx.from}... to ${tx.to}... at ${tx.time}`)
    .join("\n")}

Provide a concise analysis focusing on:
1. Cross-token market sentiment and potential correlations
2. Notable patterns in wallet behaviors across different assets
3. Potential market impact of large transfers
4. Risk assessment of unusual movements
5. Key addresses showing strategic positioning

Keep the analysis brief and actionable for an AI agent operating in the crypto space.`;
    }

    public async generateInsights(transfers: TokenTransfer[]): Promise<MarketInsight> {
        const metrics = this.preprocessTransfers(transfers);
        const systemPrompt =
            "You are an expert crypto market analyst. Analyze on-chain transfer patterns across multiple tokens to identify market insights, trends, and potential risks.";
        const prompt = this.generateClaudePrompt(metrics);

        try {
            // call ai service to generate insights
            const response = await this.aiService.generateResponse(systemPrompt, prompt);

            // Sort addresses by absolute volume
            const sortedAddresses = Object.entries(metrics.addressMetrics).sort(
                (a, b) => Math.abs(b[1].volumeUSD) - Math.abs(a[1].volumeUSD)
            );

            const insight: MarketInsight = {
                timestamp: Date.now(),
                summary: response.response,
                metrics: {
                    totalVolumeUSD: metrics.totalVolumeUSD,
                    volumeByAsset: metrics.volumeByAsset,
                    largeTransferCount: metrics.largeTransferCount,
                    uniqueAddresses: metrics.uniqueAddresses.size,
                    topSenders: sortedAddresses
                        .filter(([, data]) => data.volumeUSD < 0)
                        .slice(0, 5)
                        .map(([address, data]) => ({
                            address,
                            volumeUSD: Math.abs(data.volumeUSD),
                            assets: data.assets,
                        })),
                    topReceivers: sortedAddresses
                        .filter(([, data]) => data.volumeUSD > 0)
                        .slice(0, 5)
                        .map(([address, data]) => ({
                            address,
                            volumeUSD: data.volumeUSD,
                            assets: data.assets,
                        })),
                    recentLargeTransfers: metrics.recentLargeTransfers.map((tx) => ({
                        from: tx.from,
                        to: tx.to,
                        valueUSD: tx.valueInUSD,
                        asset: tx.asset,
                        timestamp: tx.timestamp,
                    })),
                },
            };

            return insight;
        } catch (error) {
            console.error("Error generating insights:", error);
            throw error;
        }
    }
}

export default OnChainDataInsights;
