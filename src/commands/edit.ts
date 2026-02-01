import { readdirSync, statSync, readFileSync } from "fs";
import { join, basename, dirname, relative } from "path";
import { spawn } from "child_process";
import chalk from "chalk";
import figures from "figures";
import { select } from "@inquirer/prompts";
import { CONFIG } from "../config.js";

interface NoteInfo {
  path: string;
  title: string;
  category: string;
}

export async function editNote(query?: string) {
  const notes = findNotes(CONFIG.home).map(parseNote);

  if (notes.length === 0) {
    console.log(
      chalk.dim(`\n  ${figures.info} No notes found. Create one with: `) +
        chalk.cyan("notera new <category> <title>\n")
    );
    return;
  }

  let matches = notes;

  if (query) {
    const q = query.toLowerCase();
    matches = notes.filter(
      (n) => n.title.toLowerCase().includes(q) || n.category.toLowerCase().includes(q)
    );
  }

  if (matches.length === 0) {
    console.log(`\n${chalk.red(figures.cross)} No notes matching: ${chalk.yellow(query)}\n`);
    console.log(chalk.dim(`  Try: notera ls`) + chalk.dim(" to see all notes\n"));
    return;
  }

  if (matches.length === 1) {
    const note = matches[0];
    console.log(
      `\n${chalk.green(figures.tick)} Opening ${chalk.bold(note.title)} ${chalk.dim(`[${note.category}]`)}\n`
    );
    openInEditor(note.path);
    return;
  }

  // Multiple matches - interactive selection
  const selected = await select({
    message: "Select note to edit:",
    choices: matches.map((note) => ({
      name: `${note.title} ${chalk.dim(`[${note.category}]`)}`,
      value: note.path,
    })),
  });

  openInEditor(selected);
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

function openInEditor(filepath: string) {
  const [cmd, ...args] = CONFIG.editor.split(" ");
  spawn(cmd, [...args, filepath], {
    stdio: "inherit",
    shell: true,
  });
}
