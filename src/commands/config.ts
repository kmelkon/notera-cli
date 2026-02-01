import chalk from "chalk";
import figures from "figures";
import { CONFIG, CONFIG_SOURCES, CONFIG_FILE } from "../config.js";

export function showConfig() {
  console.log(`\n${chalk.hex("#7C3AED")(figures.star)} ${chalk.bold("Notera Config")}\n`);

  const entries: [string, string, string][] = [
    ["home", CONFIG.home, CONFIG_SOURCES.home],
    ["editor", CONFIG.editor, CONFIG_SOURCES.editor],
  ];

  for (const [key, value, source] of entries) {
    const sourceLabel = source === "env"
      ? chalk.green("env")
      : source === "file"
        ? chalk.cyan("file")
        : chalk.dim("default");

    console.log(`  ${chalk.bold(key)}: ${chalk.white(value)} ${chalk.dim("(")}${sourceLabel}${chalk.dim(")")}`);
  }

  console.log();

  if (CONFIG_FILE) {
    console.log(`  ${chalk.dim("Config file:")} ${CONFIG_FILE}`);
  } else {
    console.log(`  ${chalk.dim("No config file found")}`);
  }

  console.log();
}
