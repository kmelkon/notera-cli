interface CompletionOptions {
  shell?: string;
}

const SHELLS = ["bash", "zsh", "fish"] as const;

const bashCompletion = `# notera bash completion
_notera() {
  local cur prev commands
  COMPREPLY=()
  cur="\${COMP_WORDS[COMP_CWORD]}"
  prev="\${COMP_WORDS[COMP_CWORD-1]}"
  commands="new ls edit search cat rm mv config completion"

  case "\${prev}" in
    notera)
      COMPREPLY=( $(compgen -W "\${commands}" -- "\${cur}") )
      return 0
      ;;
    ls)
      COMPREPLY=( $(compgen -W "-c --category -t --tag -p --paths" -- "\${cur}") )
      return 0
      ;;
    search)
      COMPREPLY=( $(compgen -W "-l --limit" -- "\${cur}") )
      return 0
      ;;
    cat)
      COMPREPLY=( $(compgen -W "-r --raw" -- "\${cur}") )
      return 0
      ;;
    rm)
      COMPREPLY=( $(compgen -W "-f --force" -- "\${cur}") )
      return 0
      ;;
    new)
      COMPREPLY=( $(compgen -W "-t --tags" -- "\${cur}") )
      return 0
      ;;
    completion)
      COMPREPLY=( $(compgen -W "bash zsh fish" -- "\${cur}") )
      return 0
      ;;
  esac
}
complete -F _notera notera`;

const zshCompletion = `#compdef notera
# notera zsh completion

_notera() {
  local -a commands
  commands=(
    'new:Create a new note'
    'ls:List all notes'
    'edit:Open a note in editor'
    'search:Search note contents'
    'cat:Print note to terminal'
    'rm:Delete a note'
    'mv:Move note to different category'
    'config:Show current configuration'
    'completion:Generate shell completion'
  )

  _arguments -C \\
    '1: :->command' \\
    '*: :->args'

  case "\$state" in
    command)
      _describe 'command' commands
      ;;
    args)
      case "\$words[2]" in
        ls)
          _arguments \\
            '-c[Filter by category]:category:' \\
            '--category[Filter by category]:category:' \\
            '*-t[Filter by tag]:tag:' \\
            '*--tag[Filter by tag]:tag:' \\
            '-p[Output paths only]' \\
            '--paths[Output paths only]'
          ;;
        search)
          _arguments \\
            '-l[Max matches per note]:limit:' \\
            '--limit[Max matches per note]:limit:'
          ;;
        cat)
          _arguments \\
            '-r[Show raw content]' \\
            '--raw[Show raw content]'
          ;;
        rm)
          _arguments \\
            '-f[Delete all matches]' \\
            '--force[Delete all matches]'
          ;;
        new)
          _arguments \\
            '-t[Comma-separated tags]:tags:' \\
            '--tags[Comma-separated tags]:tags:'
          ;;
        completion)
          _arguments '1:shell:(bash zsh fish)'
          ;;
      esac
      ;;
  esac
}

_notera "\$@"`;

const fishCompletion = `# notera fish completion

# Disable file completion by default
complete -c notera -f

# Commands
complete -c notera -n __fish_use_subcommand -a new -d 'Create a new note'
complete -c notera -n __fish_use_subcommand -a ls -d 'List all notes'
complete -c notera -n __fish_use_subcommand -a edit -d 'Open a note in editor'
complete -c notera -n __fish_use_subcommand -a search -d 'Search note contents'
complete -c notera -n __fish_use_subcommand -a cat -d 'Print note to terminal'
complete -c notera -n __fish_use_subcommand -a rm -d 'Delete a note'
complete -c notera -n __fish_use_subcommand -a mv -d 'Move note to category'
complete -c notera -n __fish_use_subcommand -a config -d 'Show configuration'
complete -c notera -n __fish_use_subcommand -a completion -d 'Generate shell completion'

# ls options
complete -c notera -n '__fish_seen_subcommand_from ls' -s c -l category -d 'Filter by category'
complete -c notera -n '__fish_seen_subcommand_from ls' -s t -l tag -d 'Filter by tag'
complete -c notera -n '__fish_seen_subcommand_from ls' -s p -l paths -d 'Output paths only'

# search options
complete -c notera -n '__fish_seen_subcommand_from search' -s l -l limit -d 'Max matches'

# cat options
complete -c notera -n '__fish_seen_subcommand_from cat' -s r -l raw -d 'Show raw content'

# rm options
complete -c notera -n '__fish_seen_subcommand_from rm' -s f -l force -d 'Delete all matches'

# new options
complete -c notera -n '__fish_seen_subcommand_from new' -s t -l tags -d 'Comma-separated tags'

# completion shells
complete -c notera -n '__fish_seen_subcommand_from completion' -a 'bash zsh fish'`;

export function generateCompletion(shell: string | undefined, options: CompletionOptions) {
  const targetShell = shell || options.shell || detectShell();

  if (!targetShell || !SHELLS.includes(targetShell as typeof SHELLS[number])) {
    console.error(`Unsupported shell. Use: ${SHELLS.join(", ")}`);
    console.error("\nUsage:");
    console.error("  notera completion bash");
    console.error("  notera completion zsh");
    console.error("  notera completion fish");
    process.exit(1);
  }

  switch (targetShell) {
    case "bash":
      console.log(bashCompletion);
      break;
    case "zsh":
      console.log(zshCompletion);
      break;
    case "fish":
      console.log(fishCompletion);
      break;
  }
}

function detectShell(): string | undefined {
  const shell = process.env.SHELL || "";
  if (shell.includes("zsh")) return "zsh";
  if (shell.includes("bash")) return "bash";
  if (shell.includes("fish")) return "fish";
  return undefined;
}
