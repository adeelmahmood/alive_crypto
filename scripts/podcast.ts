import { PodcastGenerator } from "@/modules/twitter/PodcastGenerator";

export const podcast = async () => {
    const podcast = new PodcastGenerator();
    await podcast.generateAndPostPodcast();
};
