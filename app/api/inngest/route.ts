import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { helloWorld } from "@/inngest/functions";
import { postTwitter } from "@/inngest/postTwitter";
import { postImageTwitter } from "@/inngest/postImageTwitter";
import { registerTelegramWebhook } from "@/inngest/registerTelegramWebhook";
import { postTelegramPromo } from "@/inngest/postTelegramPromo";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        /* your functions will be passed here later! */
        helloWorld,
        postTwitter,
        postImageTwitter,
        registerTelegramWebhook,
        postTelegramPromo,
    ],
});
