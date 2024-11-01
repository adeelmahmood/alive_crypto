import { Command } from "commander";
import { MarketData } from "./marketdata";
import { Onchaindata } from "./onchaindata";

const program = new Command();

program.command("marketdata").action(MarketData);
program.command("onchaindata").action(Onchaindata);

program.parse(process.argv);
