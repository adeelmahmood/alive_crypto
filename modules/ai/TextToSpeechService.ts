import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { exec } from "child_process";

const execAsync = promisify(exec);

export class TextToSpeechService {
    private openai: OpenAI;
    private audioPath: string;

    constructor(audioPath: string = "./temp") {
        this.openai = new OpenAI();
        this.audioPath = audioPath;
        // Ensure audio directory exists
        if (!fs.existsSync(audioPath)) {
            fs.mkdirSync(audioPath, { recursive: true });
        }
    }

    private async playAudio(filePath: string): Promise<void> {
        try {
            await execAsync(`afplay ${filePath}`);
        } catch (error) {
            console.error("Error playing audio:", error);
            throw error;
        }
    }

    async speakText(text: string): Promise<void> {
        try {
            const timestamp = Date.now();
            const speechFile = path.resolve(this.audioPath, `speech_${timestamp}.mp3`);

            const mp3 = await this.openai.audio.speech.create({
                model: "tts-1",
                voice: "nova",
                input: text,
            });

            const buffer = Buffer.from(await mp3.arrayBuffer());
            await fs.promises.writeFile(speechFile, buffer);

            // Play the audio
            await this.playAudio(speechFile);

            // Clean up the file after playing
            await fs.promises.unlink(speechFile);
        } catch (error) {
            console.error("Error in text-to-speech:", error);
            throw error;
        }
    }
}
