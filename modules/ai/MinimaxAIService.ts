import fs from "fs/promises";

interface VideoGenerationResponse {
    task_id: string;
}

interface QueryResponse {
    status: "Queueing" | "Processing" | "Success" | "Fail";
    file_id?: string;
}

interface FileResponse {
    file: {
        download_url: string;
    };
}

export class MinimaxAIService {
    private readonly apiKey: string;
    private readonly baseUrl = "https://api.minimaxi.chat/v1";

    constructor() {
        this.apiKey = process.env.MINIMAX_API_PLAT_KEY!;
    }

    private getHeaders() {
        return {
            authorization: `Bearer ${this.apiKey}`,
            "content-type": "application/json",
        };
    }

    async generateVideo(
        prompt: string,
        model: string = "video-01",
        outputPath: string = "output.mp4"
    ): Promise<void> {
        try {
            const taskId = await this.invokeVideoGeneration(prompt, model);
            console.log("Video generation task submitted, ID:", taskId);

            let fileId = "";
            let status: string;

            while (true) {
                await new Promise((resolve) => setTimeout(resolve, 10000)); // 10 second delay
                const result = await this.queryVideoGeneration(taskId);

                if (result.status === "Success" && result.file_id) {
                    fileId = result.file_id;
                    break;
                } else if (result.status === "Fail") {
                    throw new Error("Video generation failed");
                } else {
                    console.log(`...${result.status}...`);
                }
            }

            await this.fetchVideoResult(fileId, outputPath);
            console.log(`Video downloaded successfully to: ${outputPath}`);
        } catch (error) {
            console.error("Video generation failed:", error);
            throw error;
        }
    }

    private async invokeVideoGeneration(prompt: string, model: string): Promise<string> {
        const response = await fetch(`${this.baseUrl}/video_generation`, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify({ prompt, model }),
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        const data: VideoGenerationResponse = await response.json();
        console.log("Video generation task submitted:", data);
        return data.task_id;
    }

    private async queryVideoGeneration(taskId: string): Promise<QueryResponse> {
        const response = await fetch(`${this.baseUrl}/query/video_generation?task_id=${taskId}`, {
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Query failed: ${response.statusText}`);
        }

        return await response.json();
    }

    private async fetchVideoResult(fileId: string, outputPath: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/files/retrieve?file_id=${fileId}`, {
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error(`File retrieval failed: ${response.statusText}`);
        }

        const data: FileResponse = await response.json();
        const videoResponse = await fetch(data.file.download_url);

        if (!videoResponse.ok) {
            throw new Error("Failed to download video");
        }

        const buffer = await videoResponse.arrayBuffer();
        const result = await fs.writeFile(outputPath, Buffer.from(buffer));
        console.log("Video downloaded successfully to " + outputPath, result);
    }
}
