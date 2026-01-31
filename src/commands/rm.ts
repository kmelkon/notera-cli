import { readdirSync, statSync, readFileSync, unlinkSync, rmdirSync } from "fs";
import { join, basename, dirname, relative } from "path";
import chalk from "chalk";
import figures from "figures";
import { CONFIG } from "../config.js";

interface NoteInfo {
  path: string;
  title: string;
  category: string;
}

export function rmNote(query: string, options: { force?: boolean }) {
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

  if (matches.length > 1 && !options.force) {
    console.log(
      `\n${chalk.yellow(figures.warning)} Multiple matches for ${chalk.yellow(query)}:\n`
    );
    matches.forEach((note, i) => {
      console.log(`  ${chalk.dim(`${i + 1}.`)} ${note.title} ${chalk.cyan(`[${note.category}]`)}`);
    });
    console.log(chalk.dim(`\n  Be more specific, or use --force to delete all.\n`));
    return;
  }

  for (const note of matches) {
    unlinkSync(note.path);
    console.log(
      `${chalk.red(figures.cross)} Deleted ${chalk.bold(note.title)} ${chalk.dim(`[${note.category}]`)}`
    );

    // Clean up empty directories
    cleanEmptyDirs(dirname(note.path));
  }

  console.log();
}

function cleanEmptyDirs(dir: string) {
  if (dir === CONFIG.home) return;

  try {
    const entries = readdirSync(dir);
    if (entries.length === 0) {
      rmdirSync(dir);
      cleanEmptyDirs(dirname(dir));
    }
  } catch {
    // ignore
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
