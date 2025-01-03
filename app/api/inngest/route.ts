import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { postTwitter } from "@/inngest/postTwitter";
import { postImageTwitter } from "@/inngest/postImageTwitter";
import { browsePosts, engagePost, summarizeBrowsing } from "@/inngest/browseTwitter";
import { postImageDarkTwitter } from "@/inngest/postImageDarkTwitter";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        // twitter functions
        postTwitter,
        postImageTwitter,
        postImageDarkTwitter,
        // telegram functions
        // registerTelegramWebhook,
        // postTelegramPromo,
        // browser twitter functions
        browsePosts,
        engagePost,
        summarizeBrowsing,
    ],
});
