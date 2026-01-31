import { readdirSync, statSync, readFileSync } from "fs";
import { join, relative, dirname, basename } from "path";
import chalk from "chalk";
import figures from "figures";
import { CONFIG } from "../config.js";

interface SearchResult {
  path: string;
  title: string;
  category: string;
  matches: { line: number; text: string }[];
}

export function searchNotes(query: string, options: { limit?: string }) {
  if (!query) {
    console.log(chalk.red(`\n${figures.cross} Please provide a search query\n`));
    return;
  }

  const limit = options.limit ? parseInt(options.limit, 10) : 3;
  const notePaths = findNotes(CONFIG.home);

  if (notePaths.length === 0) {
    console.log(
      chalk.dim(`\n  ${figures.info} No notes found. Create one with: `) +
        chalk.cyan("notera new <category> <title>\n")
    );
    return;
  }

  const results: SearchResult[] = [];
  const regex = new RegExp(query, "gi");

  for (const path of notePaths) {
    const content = readFileSync(path, "utf-8");
    const lines = content.split("\n");
    const matches: { line: number; text: string }[] = [];

    lines.forEach((line, i) => {
      if (regex.test(line)) {
        matches.push({ line: i + 1, text: line });
      }
    });

    if (matches.length > 0) {
      const { title, category } = parseNote(path, content);
      results.push({ path, title, category, matches });
    }
  }

  if (results.length === 0) {
    console.log(`\n${chalk.yellow(figures.warning)} No matches for ${chalk.yellow(query)}\n`);
    return;
  }

  console.log(
    `\n${chalk.hex("#7C3AED")(figures.star)} ${chalk.bold("Search results")} ${chalk.dim(`(${results.length} notes)`)}\n`
  );

  for (const result of results) {
    const cat = chalk.cyan(`[${result.category}]`);
    console.log(`${chalk.green(figures.tick)} ${chalk.bold(result.title)} ${cat}`);

    const displayMatches = result.matches.slice(0, limit);
    for (const match of displayMatches) {
      const lineNum = chalk.dim(`${match.line}:`);
      const highlighted = match.text.replace(
        regex,
        (m) => chalk.bgYellow.black(m)
      );
      console.log(`   ${lineNum} ${highlighted.trim()}`);
    }

    if (result.matches.length > limit) {
      console.log(chalk.dim(`   ... and ${result.matches.length - limit} more matches`));
    }
    console.log();
  }
}

function findNotes(dir: string): string[] {
  const notes: string[] = [];

  try {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        notes.push(...findNotes(fullPath));
      } else if (entry.endsWith(".md")) {
        notes.push(fullPath);
      }
    }
  } catch {
    // dir doesn't exist
  }

  return notes;
}

function parseNote(path: string, content: string): { title: string; category: string } {
  const category = relative(CONFIG.home, dirname(path)) || "root";

  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    return { title: basename(path, ".md"), category };
  }

  const frontmatter = match[1];
  const title = frontmatter.match(/title:\s*(.+)/)?.[1] || basename(path, ".md");

  return { title, category };
}
