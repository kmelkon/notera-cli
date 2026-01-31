import { homedir } from "os";
import { join } from "path";

export const CONFIG = {
  home: process.env.NOTERA_HOME || join(homedir(), ".notera"),
  editor: process.env.NOTERA_EDITOR || process.env.EDITOR || "code -w",
};
