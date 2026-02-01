import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { spawn } from "child_process";
import chalk from "chalk";
import boxen from "boxen";
import figures from "figures";
import ora from "ora";
import { CONFIG } from "../config.js";
import { findTemplate, mergeFrontmatter } from "../templates.js";

interface NewOptions {
  tags?: string;
}

export async function newNote(category: string, title: string, options: NewOptions) {
  const categoryDir = join(CONFIG.home, category);
  const slug = title.toLowerCase().replace(/\s+/g, "-");
  const filename = `${slug}.md`;
  const filepath = join(categoryDir, filename);

  if (existsSync(filepath)) {
    console.log(
      `\n${chalk.red(figures.cross)} Note already exists: ${chalk.dim(filepath)}\n`
    );
    process.exit(1);
  }

  const spinner = ora({
    text: "Creating note...",
    color: "magenta",
  }).start();

  mkdirSync(categoryDir, { recursive: true });

  const now = new Date().toISOString();
  const cliTags = options.tags ? options.tags.split(",").map((t) => t.trim()) : [];

  // Find matching template
  const template = findTemplate(category, CONFIG.templates);

  // Build frontmatter with template
  const baseFrontmatter: Record<string, unknown> = {
    title,
    created: now,
    tags: cliTags,
  };

  const mergedFrontmatter = mergeFrontmatter(baseFrontmatter, template?.frontmatter);

  // Format frontmatter as YAML
  const frontmatterLines = Object.entries(mergedFrontmatter).map(([key, value]) => {
    if (Array.isArray(value)) {
      return `${key}: [${value.join(", ")}]`;
    }
    if (typeof value === "string" && value.includes(":")) {
      return `${key}: "${value}"`;
    }
    return `${key}: ${value}`;
  });

  const content = `---
${frontmatterLines.join("\n")}
---

${template?.content ?? ""}`;

  writeFileSync(filepath, content);
  spinner.succeed(chalk.green("Note created"));

  const displayTags = mergedFrontmatter.tags as string[];
  console.log(
    boxen(
      `${chalk.bold.hex("#7C3AED")(title)}\n\n` +
        `${chalk.dim(figures.pointerSmall)} Category: ${chalk.cyan(category)}\n` +
        `${chalk.dim(figures.pointerSmall)} Tags: ${displayTags.length ? chalk.yellow(displayTags.join(", ")) : chalk.dim("none")}\n` +
        `${chalk.dim(figures.pointerSmall)} Path: ${chalk.dim(filepath)}`,
      {
        padding: 1,
        margin: { top: 1, bottom: 1 },
        borderColor: "#7C3AED",
        borderStyle: "round",
      }
    )
  );

  console.log(chalk.dim(`  Opening in ${CONFIG.editor.split(" ")[0]}...\n`));
  openInEditor(filepath);
}

function openInEditor(filepath: string) {
  const [cmd, ...args] = CONFIG.editor.split(" ");
  spawn(cmd, [...args, filepath], {
    stdio: "inherit",
    shell: true,
  });
}
