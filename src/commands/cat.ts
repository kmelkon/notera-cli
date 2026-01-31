import { readdirSync, statSync, readFileSync } from "fs";
import { join, basename, dirname, relative } from "path";
import chalk from "chalk";
import figures from "figures";
import { Marked } from "marked";
import { markedTerminal } from "marked-terminal";
import { CONFIG } from "../config.js";

const marked = new Marked(markedTerminal());

interface NoteInfo {
  path: string;
  title: string;
  category: string;
}

export function catNote(query: string, options: { raw?: boolean }) {
  if (!query) {
    console.log(chalk.red(`\n${figures.cross} Please provide a search query\n`));
    return;
  }

  const notes = findNotes(CONFIG.home).map(parseNote);
  const q = query.toLowerCase();
  const matches = notes.filter(
    (n) => n.title.toLowerCase().includes(q) || n.category.toLowerCase().includes(q)
  );

  if (matches.length === 0) {
    console.log(`\n${chalk.red(figures.cross)} No notes matching: ${chalk.yellow(query)}\n`);
    return;
  }

  if (matches.length > 1) {
    console.log(
      `\n${chalk.yellow(figures.warning)} Multiple matches for ${chalk.yellow(query)}:\n`
    );
    matches.forEach((note, i) => {
      console.log(`  ${chalk.dim(`${i + 1}.`)} ${note.title} ${chalk.cyan(`[${note.category}]`)}`);
    });
    console.log(chalk.dim(`\n  Be more specific.\n`));
    return;
  }

  const note = matches[0];
  const content = readFileSync(note.path, "utf-8");

  if (options.raw) {
    console.log(content);
    return;
  }

  // Pretty print with rendered markdown
  const bodyMatch = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  const body = bodyMatch ? bodyMatch[1].trim() : content;

  console.log(
    `\n${chalk.hex("#7C3AED")(figures.star)} ${chalk.bold(note.title)} ${chalk.dim(`[${note.category}]`)}\n`
  );
  console.log(chalk.dim("─".repeat(50)));
  console.log(marked.parse(body));
  console.log(chalk.dim("─".repeat(50)) + "\n");
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

function parseNote(path: string): NoteInfo {
  const content = readFileSync(path, "utf-8");
  const category = relative(CONFIG.home, dirname(path)) || "root";

  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    return { path, title: basename(path, ".md"), category };
  }

  const frontmatter = match[1];
  const title = frontmatter.match(/title:\s*(.+)/)?.[1] || basename(path, ".md");

  return { path, title, category };
}
