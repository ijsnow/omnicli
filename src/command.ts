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
  getOptions?: (args: string[]) => Promise<Option[]> | Option[];
}

export interface NormalizedCommand extends Command {
  action: (args: string[]) => void;
  commands: Command[];
  depth: number;
  getOptions?: (args: string[]) => Promise<Option[]>;
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

function wrapGetOptions(
  fn: (args: string[]) => Promise<Option[]> | Option[],
): (args: string[]) => Promise<Option[]> {
  return (args: string[]): Promise<Option[]> => {
    const gettingOptions = fn(args);

    if (gettingOptions instanceof Promise) {
      return gettingOptions;
    }

    return Promise.resolve(gettingOptions);
  };
}

export function normalizeCommand(command: Command): NormalizedCommand {
  const {getOptions, ...rest} = command;

  const nCommand: NormalizedCommand = {
    ...rest,
    action: command.action || noop,
    commands: command.commands || [],
    depth: findCommandDepth(command),
  };

  if (getOptions) {
    nCommand.getOptions = wrapGetOptions(getOptions);
  }

  return nCommand;
}
