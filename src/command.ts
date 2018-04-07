import { Suggestion } from './suggestion';

export interface Command {
  name: string;
  alias?: string[];
  description?: string;
  /**
   * action is the handler for this command. It gets called when a command is submitted that matches
   * this commands name or alias.
   */
  action?: (args: string[]) => Error | void;
  commands?: Command[];
  /**
   * getSuggestions gets called when text changed
   */
  getSuggestions?: (args: string[]) => Promise<Suggestion[]> | Suggestion[];
}

export interface NormalizedCommand extends Command {
  action: (args: string[]) => void;
  commands: Command[];
  depth: number;
  getSuggestions?: (args: string[]) => Promise<Suggestion[]>;
}

const noop = () => {
  // noop
};

function findCommandDepth(command: Command): number {
  let depth = 1;

  if (command.commands) {
    for (const sub of command.commands) {
      depth += findCommandDepth(sub);
    }
  }

  return depth;
}

function wrapGetSuggestions(
  fn: (args: string[]) => Promise<Suggestion[]> | Suggestion[],
): (args: string[]) => Promise<Suggestion[]> {
  return (args: string[]): Promise<Suggestion[]> => {
    const gettingSuggestions = fn(args);

    if (gettingSuggestions instanceof Promise) {
      return gettingSuggestions;
    }

    return Promise.resolve(gettingSuggestions);
  };
}

export function normalizeCommand(command: Command): NormalizedCommand {
  const { getSuggestions, ...rest } = command;

  const nCommand: NormalizedCommand = {
    ...rest,
    action: command.action || noop,
    commands: command.commands || [],
    depth: findCommandDepth(command),
  };

  if (getSuggestions) {
    nCommand.getSuggestions = wrapGetSuggestions(getSuggestions);
  }

  return nCommand;
}
