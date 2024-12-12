import { Command } from "commander";
import { MarketData } from "./marketdata";
import { Onchaindata } from "./onchaindata";
import { post } from "./post";
import { News } from "./news";
import { image } from "./image";
import { viode } from "./video";
import { telegram } from "./telegram";
import { llm } from "./llm";
import { redis } from "./redis";
import { telegramchat } from "./telegramchat";
import { twitter } from "./twitter";

const program = new Command();

program.command("marketdata").action(MarketData);
program.command("onchaindata").action(Onchaindata);
program.command("post").action(post);
program.command("news").action(News);
program.command("image").action(image);
program.command("video").action(viode);
program.command("telegram").action(telegram);
program.command("llm").action(llm);
program.command("redis").action(redis);
program.command("telegramchat").action(telegramchat);
program.command("twitter").action(twitter);

program.parse(process.argv);
