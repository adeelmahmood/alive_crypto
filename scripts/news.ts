import CryptoNewsFetcher from "@/modules/news/CryptoNewsFetcher";

export const News = async () => {
    const newsFetcher = new CryptoNewsFetcher();

    const news = await newsFetcher.getNews();
    const formattedNews = newsFetcher.formatForAIPrompt(news);

    console.log("Formatted news:", formattedNews);
};
