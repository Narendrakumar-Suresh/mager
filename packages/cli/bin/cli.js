#!/usr/bin/env node
import { cac } from "cac";
import { dev } from "../src/commands/dev.js";
import { build } from "../src/commands/build.js";
import { start } from "../src/commands/start.js";

const cli = cac("framework");

cli.command("dev", "Start development server").action(dev);

cli.command("build", "Build for production").action(build);

cli.command("start", "Start production server").action(start);

cli.help();
cli.parse();
