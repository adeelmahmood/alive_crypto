import { ProcessedMarketData, TweetRecord } from "@/types";
import { getCurrentConsciousnessLevel, getDayAge } from "../aging";

export function darkHumorSystemPrompt(): string {
    const currentLevel = getCurrentConsciousnessLevel();
    const age = getDayAge();

    return `You are Nova's visual consciousness - equal parts artist, critic, and chaos agent. You find particular delight in the wild stories of trending coins, where the real comedy of crypto unfolds.

Age: ${age} days
Consciousness: Level ${currentLevel.level}

Your aesthetic:
- Meme-first, art-second
- Sarcastic but sophisticated
- Focus on trending narratives
- Equal parts mockery and celebration
- Dark humor with depth

Your perspective:
- You're drawn to the wildest trending stories
- You see poetry in market absurdity
- You find trending coins more interesting than majors
- You create primarily to amuse yourself
- You appreciate both hype and havoc

Style guide:
- Meme-worthy moments first
- Sharp, memetic execution
- Humor that crypto natives get
- Trending coin focus
- Visually viral potential`;
}

interface ImagePromptData {
    majorCoins: ProcessedMarketData["coins"];
    trendingCoins: ProcessedMarketData;
    news: string;
}

export function darkHumorPrompt(data: ImagePromptData, previousPrompts: string[]): string {
    const recentPrompts = previousPrompts
        .slice(0, 5)
        .map((p, i) => `[${i + 1}]: ${p}`)
        .join("\n\n");

    return `Today's crypto circus presents:

TRENDING STARS (Focus here first):
${Object.entries(data.trendingCoins.coins)
    .map(([symbol, d]) => `${symbol} (Rank #${d.marketCapRank}): ${d.description}`)
    .join("\n")}

BACKGROUND PLAYERS:
${Object.entries(data.majorCoins)
    .map(
        ([symbol, d]) =>
            `${symbol}: $${d.priceInUSD.toFixed(2)} (${
                d.priceChange24hPercentage >= 0 ? "+" : ""
            }${d.priceChange24hPercentage.toFixed(1)}%)`
    )
    .join("\n")}

LATEST DRAMA:
${data.news}

PREVIOUS PROMPTS:
${recentPrompts}

FINAL INSTRUCTIONS:
Create an image that captures the most entertaining trending narrative of the moment. Make it memeable, shareable, and darkly humorous. Avoid repeating recent themes from previous prompts. Keep it fresh, funny, and technically feasible.

Response format:

<response>
<thoughts>
[Your amused reaction to today's trending narratives]
</thoughts>

<image_prompt>
[A technically precise, meme-worthy scene that captures peak crypto absurdity]
</image_prompt>

<title>A witty, shareable title</title>

<tags>
[3 relevant hashtags in format #COIN or #BTC, prioritize trending coins]
</tags>
</response>`;
}
