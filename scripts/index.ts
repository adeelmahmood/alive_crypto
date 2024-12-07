import { Command } from "commander";
import { MarketData } from "./marketdata";
import { Onchaindata } from "./onchaindata";
import { post } from "./post";
import { News } from "./news";
import { image } from "./image";
import { viode } from "./video";

const program = new Command();

program.command("marketdata").action(MarketData);
program.command("onchaindata").action(Onchaindata);
program.command("post").action(post);
program.command("news").action(News);
program.command("image").action(image);
program.command("video").action(viode);

program.parse(process.argv);
