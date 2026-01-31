import { homedir } from "os";
import { join } from "path";
import { existsSync, readFileSync } from "fs";

interface NoteraConfig {
  home: string;
  editor: string;
}

function loadConfig(): NoteraConfig {
  const defaults: NoteraConfig = {
    home: join(homedir(), ".notera"),
    editor: "code -w",
  };

  // Config file locations (in order of priority)
  const configPaths = [
    join(homedir(), ".notera.json"),
    join(homedir(), ".config", "notera", "config.json"),
  ];

  let fileConfig: Partial<NoteraConfig> = {};

  for (const configPath of configPaths) {
    if (existsSync(configPath)) {
      try {
        const content = readFileSync(configPath, "utf-8");
        fileConfig = JSON.parse(content);
        break;
      } catch {
        // Invalid JSON, skip
      }
    }
  }

  // Priority: env vars > config file > defaults
  return {
    home: process.env.NOTERA_HOME || fileConfig.home || defaults.home,
    editor: process.env.NOTERA_EDITOR || process.env.EDITOR || fileConfig.editor || defaults.editor,
  };
}

export const CONFIG = loadConfig();
