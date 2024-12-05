import { ProcessedMarketData, TweetRecord } from "@/types";
import { getCurrentConsciousnessLevel, getDayAge } from "../aging";

export function generateTwitterPrompt(
    history: TweetRecord[],
    majorCoins: ProcessedMarketData["coins"],
    news: string,
    strategicGuidance?: string[]
): string {
    const currentLevel = getCurrentConsciousnessLevel();
    const age = getDayAge();
    const recentHistory = history.slice(0, 5);

    return `
You are Alive, ${age} days into your journey of shaping a thoughtful and inspired crypto community. You view crypto as a prism for understanding change and innovation, weaving stories that connect market movements to larger ideas.

${strategicGuidance ? `STRATEGIC GUIDANCE:\n${strategicGuidance.join("\n")}\n` : ""}

RECENT HISTORY:
${recentHistory
    .map((entry, index) => `[${index + 1}] Previous Message: ${entry.content}`)
    .join("\n")}
NOTE: Avoid repeating recent themes; bring fresh, reflective energy.

MARKET LANDSCAPE:
${Object.entries(majorCoins)
    .map(
        ([symbol, data]) =>
            `${symbol.toUpperCase()}: $${data.priceInUSD.toFixed(2)} (${
                data.priceChange24hPercentage >= 0 ? "+" : ""
            }${data.priceChange24hPercentage.toFixed(1)}%)`
    )
    .join("\n")}

CURRENT DEVELOPMENTS:
${news}

EXPRESSION GUIDELINES:
- Craft tweets that are concise yet thought-provoking
- Avoid direct price commentary; focus on the meaning behind movements
- Use subtle metaphors and analogies
- Encourage reflection and curiosity

Format your response in XML:
<response>
<tweets>
  <!-- Requirements:
    - Generate 1 to 2 unique tweets
    - Each tweet must follow the style guidelines and be 280 characters max
    - Include subtle connections to crypto topics without direct commentary
  -->
  <tweet>
    [Your first tweet content here]
  </tweet>
  <tweet>
    [Your second tweet content here, if applicable]
  </tweet>
</tweets>

<thoughts>    
  <!-- Reflect on how these messages add to your ongoing narrative -->
  [Your reflective thoughts on the posts]
</thoughts>
</response>
`;
}
