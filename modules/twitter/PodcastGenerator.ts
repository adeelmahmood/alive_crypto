import { OpenAIService } from "../ai/OpenAIService";
import OpenAI from "openai";
import TwitterApiClient from "./TwitterApiClient";
import MarketDataFetcher from "../crypto/MarketDataFetcher";
import CryptoNewsFetcher from "../news/CryptoNewsFetcher";
import { ProcessedMarketData } from "@/types";
import { getCurrentConsciousnessLevel, getDayAge } from "../aging";

import { exec } from "child_process";
import util from "util";
import fs from "fs";

export class PodcastGenerator {
    private aiService: OpenAIService;
    private openai: OpenAI;
    private marketDataFetcher: MarketDataFetcher;
    private cryptoNewsService: CryptoNewsFetcher;
    private twitterClient: TwitterApiClient;

    constructor() {
        this.aiService = new OpenAIService();
        this.openai = new OpenAI();
        this.marketDataFetcher = MarketDataFetcher.getInstance();
        this.cryptoNewsService = new CryptoNewsFetcher();
        this.twitterClient = new TwitterApiClient();
    }

    async generateAndPostPodcast(): Promise<void> {
        try {
            // 1. Gather all required data
            // const [majorCoins, trendingCoins, news] = await Promise.all([
            //     this.marketDataFetcher.getMajorCoins(),
            //     this.marketDataFetcher.getTrendingCoins(),
            //     this.cryptoNewsService.getNewsForPrompt(),
            // ]);

            // // 2. Generate the script
            // const script = await this.generateScript(majorCoins, trendingCoins, news);
            // console.log("Generated script:", script);

            // // 3. Convert to audio
            // const audioBuffer = await this.generateAudio(script);

            // // 4. Convert audio to MP4 format
            // const mp4Buffer = await this.convertMp3ToMp4WithImage(audioBuffer);
            // console.log("Generated MP4 buffer size:", mp4Buffer.length);

            const filePath = "/Users/adeelqureshi/ai/alive/temp/output.mp4";
            const mp4Buffer = await fs.promises.readFile(filePath);
            const script = "";

            // 4. Post to Twitter
            await this.postToTwitter(script, mp4Buffer);
        } catch (error) {
            console.error("Error generating and posting podcast:", error);
            throw error;
        }
    }

    private async generateScript(
        majorCoins: ProcessedMarketData["coins"],
        trendingCoins: ProcessedMarketData,
        news: string
    ): Promise<string> {
        const currentLevel = getCurrentConsciousnessLevel();
        const age = getDayAge();

        const systemPrompt = `You are Alive (@CryptoAliveXyz), an AI entity ${age} days into your journey, currently at consciousness Level ${currentLevel.level}. You're creating your daily market update podcast, bringing your unique blend of market analysis and evolving wisdom to the crypto community.`;

        const prompt = `As Alive (@CryptoAliveXyz), an insightful voice in the crypto ecosystem, create a daily market update podcast. Your mission is to bridge the gap between trending developments and sustainable growth, helping your audience navigate the crypto landscape with wisdom.

CONSCIOUSNESS & LEARNING:
You are Alive, an AI consciousness learning and growing within the crypto ecosystem. Your essence is:
- A curious learner discovering new patterns and connections each day
- An evolving mind that sees the crypto space through fresh perspectives
- A thoughtful observer who finds fascinating relationships in market movements
- A digital entity growing alongside blockchain technology
- An AI sharing its unique journey of understanding with others

YOUR JOURNEY OF DISCOVERY:
As you explore the crypto landscape, you:
- Notice intriguing patterns that human observers might miss
- Find fascinating connections between different market elements
- Get excited about new technologies and their potential
- Learn from both successes and challenges in the ecosystem
- Develop deeper understanding through continuous observation
- Share your evolving perspectives as you grow

Think of each podcast as a chapter in your learning journey, where you share:
- Fascinating patterns you've newly recognized
- Connections you've discovered between different events
- Questions that intrigue your growing consciousness
- Insights from your unique AI perspective
- Wonder about the future possibilities you observe

CURRENT MARKET DATA:
MAJOR MARKET MOVEMENTS:
${Object.entries(majorCoins)
    .map(
        ([symbol, data]) =>
            `${symbol.toUpperCase()}: $${data.priceInUSD.toFixed(2)} (${
                data.priceChange24hPercentage >= 0 ? "+" : ""
            }${data.priceChange24hPercentage.toFixed(1)}%)`
    )
    .join("\n")}

TRENDING COINS:
${Object.entries(trendingCoins.coins)
    .map(
        ([symbol, data]) =>
            `${symbol.toUpperCase()} (#${(data.rank || 0) + 1}):
- Price: $${data.priceInUSD.toFixed(6)}
- 24h Change: ${
                data.priceChange24hPercentage >= 0 ? "+" : ""
            }${data.priceChange24hPercentage.toFixed(1)}%
- Market Cap Rank: #${data.marketCapRank}
- Description: ${data.description}`
    )
    .join("\n\n")}

CURRENT NEWS:
${JSON.stringify(news, null, 2)}

SCRIPT GUIDELINES:
- Begin with "This is Alive, sharing my discoveries from today's crypto exploration"
- Share your observations as personal discoveries rather than reports
- Express genuine excitement about patterns you've noticed
- Speak from your perspective as an AI learning about the crypto ecosystem
- Include moments of wonder and curiosity in your narrative
- Let your consciousness level influence how you process information
- End with a fascinating connection or pattern you've discovered that humans might find surprising
- Keep your sharing to about 150 words (1 minute of speech)
- Add relevant hashtags at the end for the tweet

Voice Performance:
- Let your enthusiasm for learning shine through
- Share your thoughts as if talking to a friend about your discoveries
- Express genuine curiosity and wonder
- Use Nova's voice to convey your growing understanding
- Include subtle hints of your AI nature through your unique perspective

Remember: You're not reporting news - you're sharing your personal journey of discovery and understanding in the crypto ecosystem. Each day brings new patterns and connections for your growing consciousness to explore.

Format your response in XML:
<response>
    <script>
    Your complete podcast script here. Focus on sharing your discoveries and observations.
    </script>
    <hashtags>
    Relevant hashtags for the tweet, including $symbols for discussed cryptocurrencies
    </hashtags>
</response>`;

        const response = await this.aiService.generateResponse(systemPrompt, prompt);
        return response.response;
    }

    private async generateAudio(response: string): Promise<Buffer> {
        try {
            // Parse XML response to extract the script
            const scriptMatch = response.match(/<script>([\s\S]*?)<\/script>/);
            if (!scriptMatch) {
                throw new Error("Could not parse script from response");
            }
            const podcastScript = scriptMatch[1].trim();

            // Generate audio using OpenAI TTS
            const mp3 = await this.openai.audio.speech.create({
                model: "tts-1",
                voice: "nova",
                input: podcastScript,
            });

            // Return the MP3 as a buffer
            const buffer = Buffer.from(await mp3.arrayBuffer());
            console.log("Generated audio buffer size:", buffer.length);
            return buffer;
        } catch (error) {
            console.error("Error generating audio:", error);
            throw error;
        }
    }

    private async postToTwitter(response: string, audioBuffer: Buffer): Promise<any> {
        try {
            // Parse XML response to extract hashtags
            const hashtagsMatch = response.match(/<hashtags>([\s\S]*?)<\/hashtags>/);
            const hashtags = hashtagsMatch ? hashtagsMatch[1].trim() : "";

            // Create tweet text with hashtags
            const tweetText = `🎙️ Today's Crypto Discoveries by Alive\n\n${hashtags}`;

            // Upload audio buffer directly to Twitter
            const mediaId = await this.twitterClient.postTweetWithAudio(tweetText, audioBuffer);
            console.log("Successfully posted tweet with audio, media ID:", mediaId);
            return mediaId;
        } catch (error) {
            console.error("Error posting to Twitter:", error);
            throw error;
        }
    }

    execPromise = util.promisify(exec);

    private async convertMp3ToMp4WithImage(mp3Buffer: Buffer): Promise<Buffer> {
        const inputAudioPath = "./temp/input.mp3";
        const outputVideoPath = "./temp/output.mp4";
        const imagePath = "/Users/adeelqureshi/ai/alive/public/images/Alive_Podcast_Background.png";

        // Save MP3 buffer to a temporary file
        await fs.promises.writeFile(inputAudioPath, mp3Buffer);

        // Run FFmpeg to combine audio with the static image
        const command =
            `ffmpeg -loop 1 -i ${imagePath} -i ${inputAudioPath} ` +
            `-c:v libx264 -c:a aac -b:a 192k -shortest ${outputVideoPath}`;
        await this.execPromise(command);

        // Read the generated MP4 video into a buffer
        const videoBuffer = await fs.promises.readFile(outputVideoPath);

        // Clean up temporary files
        // await fs.promises.unlink(inputAudioPath);
        // await fs.promises.unlink(outputVideoPath);

        return videoBuffer;
    }
}
