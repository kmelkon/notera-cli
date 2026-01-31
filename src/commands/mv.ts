import { readdirSync, statSync, readFileSync, renameSync, mkdirSync } from "fs";
import { join, basename, dirname, relative } from "path";
import chalk from "chalk";
import figures from "figures";
import { CONFIG } from "../config.js";

interface NoteInfo {
  path: string;
  title: string;
  category: string;
}

export function mvNote(query: string, newCategory: string) {
  if (!query || !newCategory) {
    console.log(chalk.red(`\n${figures.cross} Usage: notera mv <query> <new-category>\n`));
    return;
  }

  const notes = findNotes(CONFIG.home).map(parseNote);
  const q = query.toLowerCase();
  const matches = notes.filter(
    (n) => n.title.toLowerCase().includes(q) || basename(n.path, ".md").includes(q)
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
  const newDir = join(CONFIG.home, newCategory);
  const newPath = join(newDir, basename(note.path));

  mkdirSync(newDir, { recursive: true });
  renameSync(note.path, newPath);

  // Clean up empty directories
  cleanEmptyDirs(dirname(note.path));

  console.log(
    `\n${chalk.green(figures.tick)} Moved ${chalk.bold(note.title)}\n` +
      `   ${chalk.dim(note.category)} ${figures.arrowRight} ${chalk.cyan(newCategory)}\n`
  );
}

function cleanEmptyDirs(dir: string) {
  if (dir === CONFIG.home) return;

  try {
    const entries = readdirSync(dir);
    if (entries.length === 0) {
      const { rmdirSync } = require("fs");
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
