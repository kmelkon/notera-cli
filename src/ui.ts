import chalk from "chalk";
import figures from "figures";
import boxen from "boxen";

export const ui = {
  // Colors
  primary: chalk.hex("#7C3AED"), // violet
  secondary: chalk.hex("#06B6D4"), // cyan
  success: chalk.hex("#10B981"), // green
  warning: chalk.hex("#F59E0B"), // amber
  error: chalk.hex("#EF4444"), // red
  muted: chalk.gray,
  dim: chalk.dim,

  // Icons
  icons: {
    note: figures.bullet,
    folder: figures.pointerSmall,
    success: figures.tick,
    error: figures.cross,
    arrow: figures.arrowRight,
    star: figures.star,
  },

  // Components
  header(text: string) {
    console.log(
      boxen(chalk.bold(text), {
        padding: { left: 2, right: 2, top: 0, bottom: 0 },
        borderColor: "#7C3AED",
        borderStyle: "round",
        dimBorder: true,
      })
    );
  },

  success(text: string) {
    console.log(`${this.success(this.icons.success)} ${text}`);
  },

  error(text: string) {
    console.log(`${this.error(this.icons.error)} ${text}`);
  },

  noteItem(title: string, category: string, date?: string) {
    const cat = this.muted(`[${category}]`);
    const d = date ? this.dim(` ${date}`) : "";
    console.log(`  ${this.primary(this.icons.note)} ${title} ${cat}${d}`);
  },

  categoryHeader(name: string, count: number) {
    console.log(
      `\n${this.secondary(this.icons.folder)} ${chalk.bold(name)} ${this.muted(`(${count})`)}`
    );
  },

  empty(message: string) {
    console.log(this.muted(`\n  ${message}\n`));
  },

  hint(text: string) {
    console.log(this.dim(`\n  ${figures.info} ${text}`));
  },
};
