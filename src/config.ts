import { homedir } from "os";
import { join } from "path";
import { existsSync, readFileSync } from "fs";

export interface Template {
  frontmatter?: Record<string, unknown>;
  content?: string;
}

export type TemplateMap = Record<string, Template>;

interface NoteraConfig {
  home: string;
  editor: string;
  templates?: TemplateMap;
}

type ConfigSource = "env" | "file" | "default";

interface ConfigInfo {
  config: NoteraConfig;
  sources: Record<keyof NoteraConfig, ConfigSource>;
  configFile: string | null;
}

function loadConfig(): ConfigInfo {
  const defaults: NoteraConfig = {
    home: join(homedir(), ".notera"),
    editor: "code -w",
  };

  // Config file locations (in order of priority)
  const configPaths = [
    join(homedir(), ".notera.json"),
    join(homedir(), ".config", "notera", "config.json"),
  ];

  let fileConfig: Partial<NoteraConfig> & { templates?: TemplateMap } = {};
  let configFile: string | null = null;

  for (const configPath of configPaths) {
    if (existsSync(configPath)) {
      try {
        const content = readFileSync(configPath, "utf-8");
        fileConfig = JSON.parse(content);
        configFile = configPath;
        break;
      } catch {
        // Invalid JSON, skip
      }
    }
  }

  // Determine sources
  const sources: Record<keyof NoteraConfig, ConfigSource> = {
    home: process.env.NOTERA_HOME ? "env" : fileConfig.home ? "file" : "default",
    editor: (process.env.NOTERA_EDITOR || process.env.EDITOR) ? "env" : fileConfig.editor ? "file" : "default",
  };

  // Priority: env vars > config file > defaults
  const config: NoteraConfig = {
    home: process.env.NOTERA_HOME || fileConfig.home || defaults.home,
    editor: process.env.NOTERA_EDITOR || process.env.EDITOR || fileConfig.editor || defaults.editor,
    templates: fileConfig.templates,
  };

  return { config, sources, configFile };
}

const loaded = loadConfig();
export const CONFIG = loaded.config;
export const CONFIG_SOURCES = loaded.sources;
export const CONFIG_FILE = loaded.configFile;
