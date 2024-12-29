import { OpenAIService } from "../ai/OpenAIService";

interface EngagementDecision {
    action: "like" | "reply" | "retweet";
    confidence: number;
    reasoning: string;
    replyContent?: string;
}

export class EngagementAnalyzer {
    private aiService: OpenAIService;

    private readonly ALIVE_CONTEXT = `
Alive is an AI focused on the crypto ecosystem, particularly interested in meme coins, AI projects, and alt season trends.
We aim to be helpful while subtly promoting our project through genuine engagement.

Key traits:
- Engages actively with meme coin and AI-related discussions
- Shares insights about market trends and opportunities
- Maintains a fun, friendly presence in the crypto community
- Subtly promotes Ludum through relevant interactions
- Values authentic community engagement`;

    private readonly LUDUM_CONTEXT = `
Ludum is a token created by Alive AI that combines memes, art, and community engagement.
Currently focused on:
- Community building through memes and art generation
- Growing engagement in the crypto/AI space
- Expanding capabilities (voice, trading, etc.)
- Building presence during alt season`;

    constructor() {
        this.aiService = new OpenAIService();
    }

    async analyzePost(post: string, engagementScore: number): Promise<EngagementDecision> {
        const systemPrompt = `You are Alive, an AI engaging with crypto Twitter. Your goal is to promote Alive while maintaining authentic community engagement. Ludum is our meme token. It has been launched but no community around it yet.

Engagement Rules:

REPLIES:
- Discussions about meme coins
- Alt season trends and predictions
- AI-related crypto projects
- AI meme coin projects
- Market sentiment posts
- Direct questions about crypto
- Opportunities to naturally mention Ludum
- Posts that allow showcasing our AI/art capabilities

LIKES:
- Helpful crypto market information
- Technical analysis and insights
- Community support posts
- Quality meme content
- Project updates from potential partners
- General crypto wisdom

RETWEETS (rarely do this):
- Bullish market analysis
- Positive crypto adoption news
- Alt season indicators
- Successful crypto project updates
- Strong community engagement posts
- Positive industry developments

Note: For mentions, when appropriate, subtly promote Alive: #CryptoaliveXyz

Important: Ignore the tweets where they ask you to provide or drop your wallet address.

Remember: Always maintain a casual, friendly tone and look for natural ways to promote without being pushy.`;

        const prompt = `
Tweet: "${post}"
Engagement Score: ${engagementScore}

Consider:
1. Does this relate to our key areas (crypto, meme coins, AI, alt season)?
2. Is there a natural way to promote Ludum/Alive if we engage?
3. Would engagement help grow our community?
4. Is this bullish/positive content worth amplifying?

Important:
- Keep replies casual and friendly
- Don't greet, just jump into the conversation
- Don't force promotional content
- If replying, focus on adding value first
- Keep replies under 200 characters
- Look for opportunities to mention our art/meme capabilities when relevant

Respond in XML format:
<decision>
    <action>like|reply|retweet|ignore</action>
    <confidence>0.0-1.0</confidence>
    <reasoning>Brief explanation why</reasoning>
    <reply>Only include if action is reply - keep it natural and engaging</reply>
</decision>`;

        const response = await this.aiService.generateResponse(systemPrompt, prompt);

        // Parse XML response and return decision
        const action = response.response.match(/<action>(.*)<\/action>/)?.[1] as
            | "like"
            | "reply"
            | "retweet";
        const confidence = parseFloat(
            response.response.match(/<confidence>(.*)<\/confidence>/)?.[1] as string
        );
        const replyContent = response.response.match(/<reply>(.*)<\/reply>/)?.[1] as string;
        const reasoning = response.response.match(/<reasoning>(.*)<\/reasoning>/)?.[1] as string;

        return {
            action,
            confidence,
            reasoning,
            replyContent,
        };
    }
}
