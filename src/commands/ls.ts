import { readdirSync, statSync, readFileSync } from "fs";
import { join, relative, basename, dirname } from "path";
import chalk from "chalk";
import figures from "figures";
import Table from "cli-table3";
import { CONFIG } from "../config.js";

interface LsOptions {
  category?: string;
  full?: boolean;
}

interface NoteInfo {
  path: string;
  title: string;
  category: string;
  created: string;
  tags: string[];
}

export function listNotes(options: LsOptions) {
  const root = options.category ? join(CONFIG.home, options.category) : CONFIG.home;

  try {
    const notePaths = findNotes(root);

    if (notePaths.length === 0) {
      console.log(
        chalk.dim(`\n  ${figures.info} No notes found. Create one with: `) +
          chalk.cyan("notera new <category> <title>\n")
      );
      return;
    }

    const notes = notePaths.map(parseNote);
    const byCategory = groupBy(notes, (n) => n.category);

    // Header
    console.log(
      `\n${chalk.hex("#7C3AED")(figures.star)} ${chalk.bold("Your Notes")} ${chalk.dim(`(${notes.length} total)`)}\n`
    );

    // Group by category
    for (const [category, categoryNotes] of Object.entries(byCategory)) {
      console.log(
        `${chalk.cyan(figures.pointerSmall)} ${chalk.bold(category)} ${chalk.dim(`(${categoryNotes.length})`)}`
      );

      const table = new Table({
        chars: {
          top: "",
          "top-mid": "",
          "top-left": "",
          "top-right": "",
          bottom: "",
          "bottom-mid": "",
          "bottom-left": "",
          "bottom-right": "",
          left: "  ",
          "left-mid": "",
          mid: "",
          "mid-mid": "",
          right: "",
          "right-mid": "",
          middle: " ",
        },
        style: {
          "padding-left": 0,
          "padding-right": 2,
        },
      });

      for (const note of categoryNotes) {
        const date = formatDate(note.created);
        const tags = note.tags.length
          ? chalk.yellow(note.tags.map((t) => `#${t}`).join(" "))
          : "";

        table.push([
          chalk.hex("#7C3AED")(figures.bullet),
          chalk.white(note.title),
          chalk.dim(date),
          tags,
        ]);
      }

      console.log(table.toString());
      console.log();
    }
  } catch {
    console.log(
      chalk.dim(`\n  ${figures.info} No notes found. Create one with: `) +
        chalk.cyan("notera new <category> <title>\n")
    );
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

  // Parse frontmatter
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    return {
      path,
      title: basename(path, ".md"),
      category,
      created: "",
      tags: [],
    };
  }

  const frontmatter = match[1];
  const title = frontmatter.match(/title:\s*(.+)/)?.[1] || basename(path, ".md");
  const created = frontmatter.match(/created:\s*(.+)/)?.[1] || "";
  const tagsMatch = frontmatter.match(/tags:\s*\[([^\]]*)\]/);
  const tags = tagsMatch
    ? tagsMatch[1]
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return { path, title, category, created, tags };
}

function formatDate(isoString: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function groupBy<T>(arr: T[], fn: (item: T) => string): Record<string, T[]> {
  return arr.reduce(
    (acc, item) => {
      const key = fn(item);
      (acc[key] = acc[key] || []).push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );
}
