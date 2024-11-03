import { Command } from "commander";
import { MarketData } from "./marketdata";
import { Onchaindata } from "./onchaindata";
import { post } from "./post";
import { News } from "./news";
import { memory } from "./memory";

const program = new Command();

program.command("marketdata").action(MarketData);
program.command("onchaindata").action(Onchaindata);
program.command("post").action(post);
program.command("news").action(News);
program.command("memory").action(memory);

program.parse(process.argv);
