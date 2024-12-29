import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { postTwitter } from "@/inngest/postTwitter";
import { postImageTwitter } from "@/inngest/postImageTwitter";
import { registerTelegramWebhook } from "@/inngest/registerTelegramWebhook";
import { postTelegramPromo } from "@/inngest/postTelegramPromo";
import { browsePosts, engagePost, summarizeBrowsing } from "@/inngest/browseTwitter";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        // twitter functions
        postTwitter,
        postImageTwitter,
        // telegram functions
        registerTelegramWebhook,
        postTelegramPromo,
        // browser twitter functions
        browsePosts,
        engagePost,
        summarizeBrowsing,
    ],
});
