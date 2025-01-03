import TwitterBot from "@/modules/twitter/TwitterBot";

export const engage = async () => {
    const bot = new TwitterBot();

    await bot.init();
    const post = await bot.getSpecificPost("sarah_talley_", "1873971566192816529");
    console.log(post);

    const filtered = await bot.filterAndSortPosts([post]);
    console.log(filtered);

    // browse to post
    const postUrl = `https://x.com/sarah_talley_/status/1873971566192816529`;
    await bot.getPage().goto(postUrl);
    await bot.getPage().waitForTimeout(2000); // Wait for page load

    await bot.engageWithPost(filtered[0]);

    await bot.close();
};
