#!/usr/bin/env node
import { program } from "commander";
import { newNote } from "./commands/new.js";
import { listNotes } from "./commands/ls.js";
import { editNote } from "./commands/edit.js";

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
  .option("-f, --full", "Show full paths")
  .action(listNotes);

program
  .command("edit [query]")
  .description("Open a note in editor (fuzzy match)")
  .action(editNote);

program.parse();
