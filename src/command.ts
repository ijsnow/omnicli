import {Option} from './option';

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
   * getOptions gets called when text changed
   */
  getOptions?: (args: string[]) => Option[];
}

export interface NormalizedCommand extends Command {
  action: (args: string[]) => void;
  commands: Command[];
  depth: number;
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

export function normalizeCommand(command: Command): NormalizedCommand {
  return {
    ...command,
    action: command.action || noop,
    commands: command.commands || [],
    depth: findCommandDepth(command),
  };
}
