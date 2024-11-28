import CryptoNewsFetcher from "@/modules/news/CryptoNewsFetcher";

export const News = async () => {
    const newsFetcher = new CryptoNewsFetcher();
    const news = await newsFetcher.getNewsForPrompt();

    console.log(news);
};
