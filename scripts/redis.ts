import { Redis } from "@upstash/redis";

export const redis = async () => {
    const redis = Redis.fromEnv();

    await redis.lpush("testKey", JSON.stringify({ test: "value" }));
    const result = await redis.lrange("testKey", 0, -1);
    console.log("Result from Redis:", result); // Expect: ['{"test":"value"}']
};
