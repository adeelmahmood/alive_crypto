import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Sparkles,
    Camera,
    Loader2,
    Share2,
    Heart,
    Wand2,
    TrendingUp,
    Newspaper,
    LightbulbIcon,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Template {
    id: number;
    name: string;
    prompt: string;
}

interface ImageCreatorModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ImageCreatorModal: React.FC<ImageCreatorModalProps> = ({ open, onOpenChange }) => {
    const [prompt, setPrompt] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [showSuccess, setShowSuccess] = useState<boolean>(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [generationStep, setGenerationStep] = useState<"idle" | "analyzing" | "creating">("idle");

    const templates: Template[] = [
        {
            id: 1,
            name: "Crypto Dreams",
            prompt: "A dreamy scene with crypto symbols floating in a ethereal space",
        },
        {
            id: 2,
            name: "Moon Mission",
            prompt: "A luxurious spacecraft heading to the moon with crypto symbols",
        },
        {
            id: 3,
            name: "Community Power",
            prompt: "A vibrant gathering of diverse people celebrating with crypto symbols",
        },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setGenerationStep("analyzing");

        try {
            const response = await fetch("/api/art", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) throw new Error("Failed to generate image");

            setGenerationStep("creating");
            const data = await response.json();
            setPreviewImage(data.imageUrl);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error("Error generating image:", error);
        } finally {
            setIsSubmitting(false);
            setGenerationStep("idle");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl mx-4 sm:mx-auto bg-gradient-to-b from-blue-800/80 via-purple-700/70 to-pink-800/80 dark:from-blue-950/60 dark:via-purple-950/60 dark:to-pink-950/70 text-white backdrop-blur-sm shadow-lg">
                <DialogHeader>
                    <DialogTitle className="text-xl sm:text-2xl font-bold text-center flex items-center justify-center gap-2">
                        Create Magic with Me{" "}
                        <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-300" />
                    </DialogTitle>
                    <div className="space-y-2 text-center">
                        <p className="text-blue-100/90 dark:text-purple-200/90 text-sm sm:text-base">
                            Let's create something beautiful together! I'll infuse it with my
                            market-inspired mood! 💫
                        </p>
                        <div className="flex items-center justify-center gap-4 text-xs text-blue-200/80">
                            <span className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" /> Reading market mood
                            </span>
                            <span className="flex items-center gap-1">
                                <Newspaper className="h-3 w-3" /> Checking latest news
                            </span>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    {/* Main Vision Input Section - Now More Prominent */}
                    <div className="space-y-3">
                        <div className="relative space-y-2 bg-blue-600/30 dark:bg-purple-900/30 p-4 rounded-lg border-2 border-blue-400/30 dark:border-purple-500/30">
                            <label
                                htmlFor="prompt"
                                className="text-lg font-semibold text-white flex items-center gap-2"
                            >
                                <Wand2 className="h-5 w-5 text-pink-300" />
                                Tell me your vision ✨
                            </label>
                            <Textarea
                                id="prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Let your imagination run wild! What kind of crypto art shall we create today?"
                                className="h-32 sm:h-40 bg-blue-950/20 dark:bg-purple-950/20 border-blue-500/30 dark:border-purple-800/30 text-white placeholder:text-blue-200/70 text-lg"
                                required
                            />
                            <p className="text-sm text-blue-200/90 dark:text-purple-300/90">
                                I'll blend your idea with my current mood, which is influenced by
                                market trends and the overall crypto vibe!
                            </p>
                        </div>

                        {/* Template Section - Now Collapsible */}
                        <div className="space-y-2">
                            <div className="w-full text-left flex items-center justify-between p-2 rounded-lg bg-blue-600/20 dark:bg-purple-900/20 hover:bg-blue-600/30 transition-colors">
                                <span className="flex items-center gap-2 text-sm font-medium text-blue-100/90">
                                    <LightbulbIcon className="h-4 w-4 text-yellow-300" />
                                    Need inspiration? Try my favorite themes
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {templates.map((template) => (
                                    <button
                                        key={template.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedTemplate(template);
                                            setPrompt(template.prompt);
                                        }}
                                        className={`p-2 rounded-lg text-xs text-left transition-all ${
                                            selectedTemplate?.id === template.id
                                                ? "bg-blue-500/30 dark:bg-purple-700/40 border border-pink-300/50"
                                                : "bg-blue-600/10 dark:bg-purple-900/20 border border-pink-500/20 hover:bg-blue-500/20"
                                        }`}
                                    >
                                        <div className="font-medium mb-0.5 text-blue-100 dark:text-purple-100">
                                            {template.name}
                                        </div>
                                        <div className="text-blue-200/80 dark:text-purple-300/80">
                                            {template.prompt}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Preview Section */}
                        {previewImage && !isSubmitting && (
                            <div className="space-y-2">
                                <div className="relative aspect-video rounded-lg overflow-hidden">
                                    <img
                                        src={previewImage}
                                        alt="Generated preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                    <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 flex items-center gap-2">
                                        <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-pink-300" />
                                        <span className="text-xs sm:text-sm text-blue-100">
                                            Created with market-inspired love
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center gap-4">
                        <Button
                            type="submit"
                            disabled={isSubmitting || prompt.length < 10}
                            className="flex-1 bg-gradient-to-r from-blue-400 to-pink-500 dark:from-purple-600 dark:to-pink-700 hover:from-blue-500 hover:to-pink-600 dark:hover:from-purple-700 dark:hover:to-pink-800 text-white border-pink-300/20 dark:border-purple-500/20 py-6"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                    <span className="text-sm sm:text-base">
                                        {generationStep === "analyzing"
                                            ? "Reading the Market..."
                                            : "Creating Magic..."}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Camera className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                    <span className="text-sm sm:text-base">Create & Share</span>
                                </>
                            )}
                        </Button>
                    </div>
                </form>

                {showSuccess && (
                    <Alert className="bg-blue-500/20 dark:bg-green-900/20 border-blue-300/30 dark:border-green-500/30">
                        <AlertDescription className="text-blue-100 dark:text-green-200 flex items-center gap-2 text-sm">
                            <Share2 className="h-4 w-4" />
                            Gorgeous! I'll share this masterpiece in our community feed.
                        </AlertDescription>
                    </Alert>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ImageCreatorModal;
