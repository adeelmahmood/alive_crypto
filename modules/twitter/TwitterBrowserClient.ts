import { chromium, Browser, Page } from "playwright";
import { Redis } from "@upstash/redis";

class TwitterBrowserClient {
    private browser: Browser | null = null;
    private page: Page | null = null;

    private delay: number;
    private cookieKey: string;

    private redis: Redis;

    constructor(cookieKey = "twitter-cookies", delay = 1000) {
        this.cookieKey = cookieKey;
        this.delay = delay;

        this.redis = Redis.fromEnv();
    }

    getPage() {
        if (!this.page) {
            throw new Error("Browser not initialized");
        }
        return this.page;
    }

    async init(headless = true, slowMo = 100) {
        // Check if browser is already initialized
        if (this.browser && this.page) {
            try {
                await this.page.evaluate(() => true);
                return;
            } catch (e) {
                await this.close();
            }
        }

        console.log("Initializing browser...");

        this.browser = await chromium.launch({
            headless: process.env.VERCEL_ENV === "production" ? true : headless,
            slowMo,
            args: [
                "--disable-blink-features=AutomationControlled",
                "--disable-features=IsolateOrigins,site-per-process",
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-accelerated-2d-canvas",
                "--no-first-run",
                "--no-zygote",
                "--single-process",
                "--disable-gpu",
            ],
        });

        const context = await this.browser.newContext({
            viewport: { width: 1280, height: 800 },
            userAgent:
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        });

        this.page = await context.newPage();
        await this.page.setExtraHTTPHeaders({
            "Accept-Language": "en-US,en;q=0.9",
        });
        console.log("Browser initialized");

        try {
            console.log("Attempting to load cookies from Redis");
            const cookies = await this.redis.get(this.cookieKey);
            if (cookies) {
                // Check if cookies is already an object or needs parsing
                const cookiesArray = typeof cookies === "string" ? JSON.parse(cookies) : cookies;
                await this.page.context().addCookies(cookiesArray);
                console.log("Cookies loaded successfully from Redis");
            } else {
                console.log("No saved cookies found in Redis");
            }
        } catch (error) {
            console.error("Error loading cookies from Redis:", error);
        }
    }

    async login(username: string, password: string) {
        if (!this.page) throw new Error("Browser not initialized");

        // Try accessing home page first to check if cookies are valid
        await this.page.goto("https://x.com/home");
        await this.page.waitForTimeout(this.delay);

        // If we're still on x.com/home, we're logged in
        if (this.page.url().includes("x.com/home")) {
            console.log("Already logged in");
            return;
        }

        await this.page.goto("https://x.com/i/flow/login");
        await this.page.waitForTimeout(this.delay);

        try {
            // Fill in username
            const usernameInput = await this.page.waitForSelector(
                'input[autocomplete="username"]',
                { timeout: 10000 }
            );
            await usernameInput.fill(username);
            await this.page.waitForTimeout(this.delay);

            // Click next
            const nextButton = await this.page.waitForSelector('[role="button"]:has-text("Next")', {
                timeout: 5000,
            });
            await nextButton.click();
            await this.page.waitForTimeout(this.delay);

            // Fill in password
            const passwordInput = await this.page.waitForSelector('input[name="password"]', {
                timeout: 5000,
            });
            await passwordInput.fill(password);
            await this.page.waitForTimeout(this.delay);

            // Click login
            const loginButton = await this.page.waitForSelector(
                '[role="button"]:has-text("Log in")',
                { timeout: 5000 }
            );
            await loginButton.click();
            await this.page.waitForTimeout(this.delay * 2);

            // Save cookies to Redis
            const cookies = await this.page.context().cookies();
            await this.redis.set(this.cookieKey, cookies);
            console.log("Cookies saved to Redis");
        } catch (error) {
            console.error("Error during login:", error);
            console.log("Current URL:", this.page.url());
            console.log("Page content:", await this.page.content());
            throw error;
        }
    }

    async getSpecificPost(handle: string, tweetId: string) {
        if (!this.page) throw new Error("Browser not initialized");

        await this.page.goto(`https://x.com/${handle}/status/${tweetId}`);
        await this.page.waitForTimeout(this.delay);

        const article = await this.page.waitForSelector('article[data-testid="tweet"]');
        return this.extractPostData(article);
    }

    async getTimelinePosts(count = 20, maxScrolls = 10) {
        if (!this.page) throw new Error("Browser not initialized");

        await this.page.goto("https://x.com/home");
        await this.page.waitForTimeout(this.delay * 2);
        // wait 5 seconds for the timeline to refresh
        await this.page.waitForTimeout(5000);

        console.log("Collecting posts...");
        const posts = [];
        let lastPostCount = 0;
        let scrollCount = 0;

        while (posts.length < count && scrollCount < maxScrolls) {
            const articles = await this.page.$$('article[data-testid="tweet"]');
            console.log(`Found ${articles.length} posts`);

            for (let i = lastPostCount; i < articles.length && posts.length < count; i++) {
                const article = articles[i];
                try {
                    const post = await this.extractPostData(article);
                    posts.push(post);
                    console.log(`Collected post ${posts.length}/${count}`);
                } catch (error) {
                    console.error("Error extracting post data:", error);
                }
            }

            lastPostCount = articles.length;

            // Scroll to load more
            if (posts.length < count) {
                await this.page.evaluate(() => window.scrollBy(0, 1000));
                await this.page.waitForTimeout(this.delay);
            }
            scrollCount++;
        }

        return posts;
    }

    private async extractPostData(article: any) {
        interface PostData {
            tweetId?: string;
            authorName?: string;
            authorHandle?: string;
            verified?: boolean;
            text?: string;
            timestamp?: string;
            likes?: string;
            retweets?: string;
            replies?: string;
            views?: string;
            images?: string[];
        }

        const post: PostData = {};

        try {
            // Extract tweet ID from the article's link
            const timeLink = await article
                .$("time")
                ?.then((time: any) => time?.$("xpath=ancestor::a"));
            if (timeLink) {
                const href = await timeLink.getAttribute("href");
                if (href) {
                    // href format: /{username}/status/{tweetId}
                    const tweetId = href.split("/").pop();
                    post.tweetId = tweetId;
                }
            }

            // Get author info from User-Name div
            const userNameDiv = await article.$('[data-testid="User-Name"]');
            if (userNameDiv) {
                // Get author name and handle
                const nameElement = await userNameDiv.$(".r-b88u0q");
                if (nameElement) {
                    post.authorName = await nameElement.evaluate((el: Element) =>
                        el.textContent?.trim()
                    );
                }

                const handleElement = await userNameDiv.$('div[dir="ltr"] span:has-text("@")');
                if (handleElement) {
                    post.authorHandle = await handleElement.evaluate((el: Element) =>
                        el.textContent?.trim()
                    );
                }

                // Check for verified status
                post.verified = (await userNameDiv.$('svg[data-testid="icon-verified"]')) !== null;
            }

            // Get post text
            const textElement = await article.$('[data-testid="tweetText"]');
            if (textElement) {
                post.text = await textElement.evaluate((el: Element) => el.textContent?.trim());
            }

            // Get metrics using the correct structure from tweet HTML
            const getMetricCount = async (parentSelector: string) => {
                const element = await article.$(parentSelector);
                if (!element) return null;

                const countSpan = await element.$(
                    "div.css-175oi2r.r-xoduu5.r-1udh08x span span span"
                );
                return countSpan
                    ? await countSpan.evaluate((el: Element) => el.textContent?.trim())
                    : null;
            };

            post.replies = await getMetricCount('[data-testid="reply"]');
            post.retweets = await getMetricCount('[data-testid="retweet"]');
            post.likes = await getMetricCount('[data-testid="like"]');
            post.views = await getMetricCount('a[href*="/analytics"]');

            // Get timestamp
            const timeElement = await article.$("time");
            if (timeElement) {
                post.timestamp = await timeElement.getAttribute("datetime");
            }

            // Get images
            const images: string[] = [];
            const imageElements = await article.$$('[data-testid="tweetPhoto"] img');
            for (const img of imageElements) {
                const src = await img.getAttribute("src");
                if (src) images.push(src);
            }
            if (images.length > 0) {
                post.images = images;
            }
        } catch (error) {
            console.error("Error extracting post data:", error);
        }

        return post;
    }

    async close() {
        if (this.browser) {
            try {
                console.log("Closing browser...");
                await this.browser.close();
            } catch (e) {
                console.error("Error closing browser:", e);
            } finally {
                this.browser = null;
                this.page = null;
            }
        }
    }
}

export default TwitterBrowserClient;
