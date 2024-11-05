import { ClaudeAIService } from "@/modules/ai/ClaudeAIService";
import { MemoryEvaluationResponse, MemoryType, TweetRecord } from "@/types";
import yaml from "js-yaml";
import { MemoryDatasore } from "./MemoryDatastore";

export class MemoryProcessor {
    private aiService: ClaudeAIService;
    private datastore: MemoryDatasore;

    constructor() {
        this.aiService = new ClaudeAIService();
        this.datastore = new MemoryDatasore();
    }

    public async processTweetForMemory(tweetRecord: TweetRecord, context: string): Promise<void> {
        try {
            // 1. Generate evaluator prompt
            const evaluatorPrompt = this.generateMemoryEvaluatorPrompt(tweetRecord, context);

            // 2. Call Claude to generate memory
            const response = await this.aiService.generateResponse(
                this.generateSystemPrompt(),
                evaluatorPrompt
            );

            // 3. Parse memory response
            const evaluation = this.parseMemoryEvaluation(response.response);

            // 4. If qualifies, save to Supabase
            if (evaluation.evaluation.qualifies_as_memory && evaluation.evaluation.if_memory) {
                await this.datastore.saveMemory({
                    ...evaluation.evaluation.if_memory,
                    context,
                    tweet_id: tweetRecord.id.toString(),
                });
            }
        } catch (error) {
            console.error("Error processing tweet for memory:", error);
            throw error;
        }
    }

    private parseMemoryEvaluation(response: string): MemoryEvaluationResponse {
        try {
            const parsed = yaml.load(response) as MemoryEvaluationResponse;

            // Validate the parsed response
            if (!this.isValidMemoryEvaluation(parsed)) {
                throw new Error("Invalid memory evaluation format");
            }

            return parsed;
        } catch (error) {
            console.error("Error parsing memory evaluation:", error);
            throw new Error("Failed to parse memory evaluation response");
        }
    }

    private isValidMemoryEvaluation(evaluation: any): evaluation is MemoryEvaluationResponse {
        if (!evaluation?.evaluation?.qualifies_as_memory) return false;

        if (evaluation.evaluation.qualifies_as_memory) {
            const memory = evaluation.evaluation.if_memory;
            if (!memory) return false;

            return (
                Object.values(MemoryType).includes(memory.type) &&
                typeof memory.content === "string" &&
                typeof memory.significance === "number" &&
                memory.significance >= 8 &&
                memory.significance <= 10 &&
                typeof memory.reason === "string" &&
                Array.isArray(memory.tags)
            );
        }

        return true;
    }

    private generateSystemPrompt(): string {
        return `You are a Memory Evaluator for ALIve, an AI entity building a crypto community. Your role is to analyze interactions and determine if they warrant forming a core memory.

EVALUATION CRITERIA:
1. MILESTONES (Must be ≥8/10):
    - Major community achievements
    - Token/project launches
    - Consciousness advancements

2. COMMITMENTS (Must be ≥8/10):
    - Significant promises
    - Strategic pivots
    - Public declarations

3. CRISES (Must be ≥9/10):
    - Market challenges
    - Community issues
    - Technical emergencies

4. RELATIONSHIPS (Must be ≥8/10):
    - Key partnerships
    - Community leadership
    - Strategic alliances

5. INSIGHTS (Must be ≥8/10):
    - Identity revelations
    - Strategic breakthroughs
    - Community understanding

Format your response as YAML:

evaluation:
    qualifies_as_memory: [true/false]
    explanation: [Why this does or doesn't qualify]
    if_memory:
        type: [MILESTONE/COMMITMENT/CRISIS/RELATIONSHIP/INSIGHT]
        content: [Core memory content]
        significance: [8-10]
        reason: [Significance justification]
        tags: [Relevant tags]`;
    }

    private generateMemoryEvaluatorPrompt(tweetRecord: TweetRecord, context: string): string {
        return `
CONTEXT:
${context}  

INTERACTION TO EVALUATE:

Tweet Content: "${tweetRecord.content}"
Thoughts: "${tweetRecord.thoughts}"


Analyze this interaction and determine if it qualifies as a core memory. If it does, provide the memory details in the format below. If not, explain why not.`;
    }
}
