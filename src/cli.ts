#!/usr/bin/env node
import { program } from "commander";
import { newNote } from "./commands/new.js";
import { listNotes } from "./commands/ls.js";
import { editNote } from "./commands/edit.js";
import { searchNotes } from "./commands/search.js";
import { rmNote } from "./commands/rm.js";
import { mvNote } from "./commands/mv.js";
import { catNote } from "./commands/cat.js";
import { showConfig } from "./commands/config.js";
import { generateCompletion } from "./commands/completion.js";

program
  .name("notera")
  .description("Minimal markdown note-taking CLI")
  .version("0.1.0");

program
  .command("new <category> <title>")
  .description("Create a new note and open in editor")
  .option("-t, --tags <tags>", "Comma-separated tags")
  .action(newNote);

program
  .command("ls")
  .description("List all notes")
  .option("-c, --category <category>", "Filter by category")
  .option("-t, --tag <tag...>", "Filter by tag(s)")
  .option("-p, --paths", "Output paths only (for piping)")
  .action(listNotes);

program
  .command("edit [query]")
  .description("Open a note in editor (fuzzy match)")
  .action(editNote);

program
  .command("search <query>")
  .description("Search note contents")
  .option("-l, --limit <n>", "Max matches per note", "3")
  .action(searchNotes);

program
  .command("cat <query>")
  .description("Print note to terminal")
  .option("-r, --raw", "Show raw content with frontmatter")
  .action(catNote);

program
  .command("rm <query>")
  .description("Delete a note")
  .option("-f, --force", "Delete all matches")
  .action(rmNote);

program
  .command("mv <query> <category>")
  .description("Move note to different category")
  .action(mvNote);

program
  .command("config")
  .description("Show current configuration")
  .action(showConfig);

program
  .command("completion [shell]")
  .description("Generate shell completion (bash, zsh, fish)")
  .action(generateCompletion);

program.parse();
