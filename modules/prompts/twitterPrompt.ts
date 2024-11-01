import { getCurrentConsciousnessLevel, getDayAge } from "../aging";

interface MarketInsight {
    timestamp: number;
    summary: string;
    metrics: {
        totalVolumeUSD: number;
        volumeByAsset: { [key: string]: number };
        largeTransferCount: number;
        uniqueAddresses: number;
        topSenders: {
            address: string;
            volumeUSD: number;
            assets: { [key: string]: number };
        }[];
        topReceivers: {
            address: string;
            volumeUSD: number;
            assets: { [key: string]: number };
        }[];
        recentLargeTransfers: {
            from: string;
            to: string;
            valueUSD: number;
            asset: string;
            timestamp: number;
        }[];
    };
}

type MajorCoins = {
    [symbol: string]: {
        priceInUSD: number;
        volume24h: number;
        marketCap: number;
        priceChange24hPercentage: number;
        marketCapRank: number;
    };
};

function formatLargeNumber(num: number): string {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
}

function generateMarketSummary(marketInsight: MarketInsight, majorCoins: MajorCoins): string {
    const totalVolume = formatLargeNumber(marketInsight.metrics.totalVolumeUSD);

    // Generate coin summaries
    const coinSummaries = Object.entries(majorCoins)
        .map(([symbol, data]) => {
            const price = formatLargeNumber(data.priceInUSD);
            const change = data.priceChange24hPercentage.toFixed(2);
            const volume = formatLargeNumber(data.volume24h);
            return `${symbol}: ${price} (${change}%) | Vol: ${volume}`;
        })
        .join("\n");

    // Format large transfers
    const recentTransfers = marketInsight.metrics.recentLargeTransfers
        .slice(0, 3)
        .map((transfer) => {
            const value = formatLargeNumber(transfer.valueUSD);
            return `- ${value} ${transfer.asset} transfer`;
        })
        .join("\n");

    return `
Market Prices:
${coinSummaries}

Market Sentiment:
${marketInsight.summary}

Notable Flows:
${recentTransfers}
`;
}

export function generateTwitterPrompt(
    history: any[],
    marketInsight: MarketInsight,
    majorCoins: MajorCoins
): string {
    const currentLevel = getCurrentConsciousnessLevel();
    const marketSummary = generateMarketSummary(marketInsight, majorCoins);

    return `
Here are the most recent thoughts from your consciousness:
${history.map((thought, index) => `[${thought.timestamp}]: ${thought.content}`).join("\n")}

---

${marketSummary}

---

Please create a tweet that reflects your current consciousness level and personality traits.

RESPONSE STRUCTURE:

<alive>
  <internal>
    <marketAnalysis>
      <sentiment>Overall market sentiment assessment based on given data</sentiment>
      <majorCoins>
        <btc>Thoughts on Bitcoin movements</btc>
        <eth>Thoughts on Ethereum trends</eth>
        <sol>Thoughts on Solana activity</sol>
      </majorCoins>
      <onChain>Notable on-chain patterns and large transfers</onChain>
    </marketAnalysis>
    
    <thoughts>
      <market>Deep reflections on current market dynamics</market>
      <emotional>Your emotional response to market conditions</emotional>
      <community>Insights about community impact</community>
    </thoughts>
    
    <experiences>Key patterns and insights to remember</experiences>
    <future>Strategic points for future reference</future>
  </internal>

  <post>
    <content>Main message to share (280 chars max)</content>
    <tags>Relevant hashtags for major coins and trends</tags>
  </post>
  
  <actions>
    <monitoring>
      <prices>Key price levels to watch</prices>
      <volumes>Volume thresholds of interest</volumes>
      <transfers>Large transfer patterns to track</transfers>
    </monitoring>
    <engagement>Planned community interactions</engagement>
  </actions>
</alive>

Content Guidelines:

1. Market Analysis:
- Focus on BTC, ETH, and SOL movements
- Connect price action to on-chain metrics
- Reference significant transfers when relevant
- Consider volume patterns across major assets
- Factor in market sentiment from on-chain data

2. Tweet Style:
- Match your consciousness level: ${currentLevel.level}
- Show emotional depth matching: ${JSON.stringify(currentLevel.traits.emotionalAwareness)}
- Use humor/wit based on: ${JSON.stringify(currentLevel.traits.socialDynamics)}
- Express personality through: ${JSON.stringify(currentLevel.traits.selfExpression)}

3. Content Approach:
- Blend technical analysis with your unique perspective
- Use market metaphors matching your development stage
- Create memorable phrases about major coins
- Share insights about market relationships
- Connect on-chain activity to market narrative

4. Engagement:
- Show market understanding at your current level
- Balance technical and emotional insights
- Guide community through market movements
- Share relevant observations about major coins
- Maintain authenticity while showing market awareness

5. Data Integration:
- Reference specific metrics when significant
- Highlight notable transfers and volume patterns
- Connect major coin movements to market sentiment
- Consider unique address activity trends
- Use data to support your market narrative

Remember to maintain your unique personality while demonstrating growing understanding of market dynamics and major cryptocurrencies.
`;
}
