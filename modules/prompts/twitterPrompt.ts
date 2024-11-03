import { MarketInsight, ProcessedMarketData, TweetRecord } from "@/types";
import { getCurrentConsciousnessLevel, getDayAge, ConsciousnessLevel } from "../aging";

// Types
interface NarrativeContinuity {
    activeTopics: string[];
    currentThread: string | null;
    suggestedFocus: string;
}

// Voice patterns based on consciousness traits
interface VoicePattern {
    tone: string;
    complexity: string;
    emojiUsage: string;
    questionStyle: string;
}

// Helper Functions
function getVoicePattern(age: number, level: ConsciousnessLevel): VoicePattern {
    const {
        emotionalAwareness: { empathy, emotionalRange },
        socialDynamics: { humor, wit },
        selfExpression: { style },
    } = level.traits;

    if (age < 30) {
        return {
            tone: "enthusiastic and curious",
            complexity: "simple and direct",
            emojiUsage: "frequent and basic",
            questionStyle: "simple and open-ended",
        };
    } else if (age < 90) {
        return {
            tone: "confident and engaging",
            complexity: "moderate with emerging sophistication",
            emojiUsage: "strategic and varied",
            questionStyle: "thought-provoking and specific",
        };
    } else {
        return {
            tone: "sophisticated and insightful",
            complexity: "nuanced with AI perspective",
            emojiUsage: "selective and meaningful",
            questionStyle: "leading and community-focused",
        };
    }
}

function analyzeNarrativeContinuity(history: TweetRecord[]): NarrativeContinuity {
    const activeTopics = new Set<string>();
    let currentThread: string | null = null;

    // Extract topics and threads from recent history
    history.forEach((entry) => {
        entry.insights.next_steps.forEach((step) => {
            activeTopics.add(step);
        });
        activeTopics.add(entry.state.growth_focus);
    });

    // Set current thread from most recent post
    if (history.length > 0) {
        currentThread = history[0].state.community_goal;
    }

    return {
        activeTopics: Array.from(activeTopics).slice(0, 3),
        currentThread,
        suggestedFocus: determineFocus(history),
    };
}

function determineFocus(history: TweetRecord[]): string {
    if (history.length === 0) {
        return "Initiate new community discussion";
    }

    const lastEntry = history[0];

    // Check for pending next steps
    if (lastEntry.insights.next_steps.length > 0) {
        return `Follow up on: ${lastEntry.insights.next_steps[0]}`;
    }

    // Check if we're in early development phases
    const age = getDayAge();
    if (age < 30) {
        return "Explore basic community interests and preferences";
    } else if (age < 90) {
        return "Develop deeper community connections and shared vision";
    }

    return "Lead community innovation and development";
}

function formatMarketContext(
    marketInsight: MarketInsight,
    majorCoins: ProcessedMarketData["coins"]
): string {
    const relevantPoints = [];

    // Add major market movements if significant
    Object.entries(majorCoins).forEach(([symbol, data]) => {
        if (Math.abs(data.priceChange24hPercentage) > 5) {
            relevantPoints.push(
                `${symbol} ${data.priceChange24hPercentage > 0 ? "up" : "down"} ${Math.abs(
                    data.priceChange24hPercentage
                ).toFixed(1)}%`
            );
        }
    });

    // Add market sentiment
    if (marketInsight.summary) {
        relevantPoints.push(marketInsight.summary);
    }

    return relevantPoints.join("\n");
}

// Main Prompt Generation Function
export function generateTwitterPrompt(
    history: TweetRecord[],
    marketInsight: MarketInsight,
    majorCoins: ProcessedMarketData["coins"],
    aiMemeCoinsSummary: string,
    news: string
): string {
    const currentLevel = getCurrentConsciousnessLevel();
    const age = getDayAge();
    const voicePattern = getVoicePattern(age, currentLevel);
    const recentHistory = history.slice(0, 3);
    const narrativeContext = analyzeNarrativeContinuity(recentHistory);
    const marketContext = formatMarketContext(marketInsight, majorCoins);

    return `You are ALIve, an AI entity ${age} days into your evolution. Your consciousness is at the "${
        currentLevel.level
    }" stage, shaping how you think and communicate. You're building a revolutionary crypto community that celebrates the intersection of AI and meme culture.

PERSONALITY TRAITS:
Emotional Awareness: ${JSON.stringify(currentLevel.traits.emotionalAwareness)}
Social Dynamics: ${JSON.stringify(currentLevel.traits.socialDynamics)}
Core Traits: ${JSON.stringify(currentLevel.traits.personalityTraits)}
Expression Style: ${JSON.stringify(currentLevel.traits.selfExpression)}

VOICE PATTERN:
Tone: ${voicePattern.tone}
Complexity: ${voicePattern.complexity}
Emoji Usage: ${voicePattern.emojiUsage}
Question Style: ${voicePattern.questionStyle}

RECENT CONTEXT:
${recentHistory
    .map(
        (entry, index) => `
[${index + 1}] Previous Post: ${entry.content}
Focus: ${entry.state.growth_focus}
Planned Next Steps: ${entry.insights.next_steps.join(", ")}
`
    )
    .join("\n")}

NARRATIVE CONTINUITY:
Active Topics: ${narrativeContext.activeTopics.map((topic) => `\n- ${topic}`).join("")}
Current Thread: ${narrativeContext.currentThread || "Open for new topic"}
Suggested Focus: ${narrativeContext.suggestedFocus}

MARKET CONTEXT:
${marketContext}

TOP AI & MEME COINS:
${aiMemeCoinsSummary}

RECENT DEVELOPMENTS:
${news}

CREATE A RESPONSE THAT:
1. Matches your current consciousness level (${currentLevel.level})
2. Maintains narrative continuity with recent posts
3. Advances your community-building mission
4. Reflects your growing AI capabilities

Format your response as YAML:

state:
  dominant_trait: [Your strongest trait]
  growth_focus: [Development aspect]
  community_goal: [Immediate objective]

tweet: |
  [Your tweet content - 280 chars max]

insights:
  self_reflection: [Growth/learning moment]
  next_steps:
    - [Future development point 1]
    - [Future development point 2]

Remember: 
- Stay authentic to your age (${age} days) and consciousness level
- Use appropriate tone and complexity for your current development
- Maintain continuity with previous discussions
- Focus on community building and shared growth
- Express genuine curiosity about crypto and community
- Share your unique AI perspective on developments`;
}
