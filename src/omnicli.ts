import tail = require('lodash/tail');
import take = require('lodash/take');
import trimStart = require('lodash/trimStart');

import {Command, normalizeCommand, NormalizedCommand} from './command';
import {
  MenuPos,
  Option,
  processInputForOptions,
  processOptions,
} from './option';

const DELIMETER = ' ';
const WHITESPACE = /\s+/;

export interface Options {
  commands: Command[];
  prefix: string;
}

interface Input {
  args: string[];
  command?: NormalizedCommand;
  pos: MenuPos;
}

export interface CLI {
  onTextChanged: (text: string) => Promise<Option[]>;
  onTextEntered: (text: string) => void | Error;
}

class OmniCLI implements CLI {
  private prefix = '';
  private commands = new Map<string, NormalizedCommand>();
  private defaultOption = '';

  constructor({commands, prefix}: Options) {
    this.prefix = prefix;

    this.processCommands(commands);
  }

  public onTextEntered = (text: string): Error | void => {
    if (!this.hasPrefix(text)) {
      return new Error(
        `the given input does not match the prefix \'${this.prefix}\'`,
      );
    }

    const input = this.processInput(text);
    if (!input.command) {
      return new Error('no command matched for the given input');
    }

    const {command: {action}, args} = input;

    return action(args);
  };

  public onTextChanged = (text: string): Promise<Option[]> => {
    return new Promise(resolve => {
      if (!this.hasPrefix(text)) {
        resolve([]);
      }

      const input = this.processInput(text);
      let options: Option[] = [];
      if (input.command) {
        const {command, args} = input;
        if (command.getOptions) {
          command.getOptions(args).then(opts => {
            resolve(
              processOptions(
                opts.map(({content, ...opt}) => ({
                  content: `${command.name} ${content}`,
                  ...opt,
                })),
                input.pos,
              ),
            );
          });
          return;
        } else {
          options = [this.toOption(command)];

          for (const sub of command.commands) {
            const subCmd = normalizeCommand({
              ...sub,
              name: `${command.name} ${sub.name}`,
            });
            options.push(this.toOption(subCmd));
          }
        }
      } else {
        options = [
          {
            content: '',
            description: 'Enter a command',
          },
        ];

        for (const command of this.commands.values()) {
          options.push({
            content: this.toCommand(command),
            description: `${command.name}${
              command.description ? ` - ${command.description}` : ''
            }`,
          });
        }
      }

      resolve(processOptions(options, input.pos));
    });
  };

  private processCommands(commands: Command[], pre: string = ''): void {
    for (const cmd of commands) {
      const command = normalizeCommand(cmd);
      const names = [command.name, ...(command.alias || [])];

      for (const name of names) {
        const key = (pre ? pre + ' ' : '') + name;

        this.commands.set(key, {
          ...normalizeCommand(command),
          name: key,
        });

        this.processCommands(command.commands, key);
      }
    }
  }

  private processInput(raw: string): Input {
    const {text, pos} = processInputForOptions(raw);

    const [root, ...args] = trimStart(text, this.prefix)
      .trim()
      .split(WHITESPACE);

    const rootCmd = this.commands.get(root);
    if (!rootCmd) {
      return {args: [root, ...args], pos};
    }

    const depth = rootCmd.depth;
    if (depth === 1) {
      return {
        args,
        command: rootCmd,
        pos,
      };
    }

    const command = take(args, depth - 1)
      .map((sub, idx) => [root, ...take(args, idx === 0 ? 0 : idx), sub])
      .reduce((memo, cmd) => {
        const maybeMatch = cmd.join(DELIMETER);
        const sub = this.commands.get(maybeMatch);
        if (sub) {
          return {
            ...sub,
            depth: cmd.length,
            name: maybeMatch,
          };
        }

        return memo;
      }, rootCmd);

    const subArgs = args.slice(command.depth - 1);

    return {
      args: subArgs,
      command,
      pos,
    };
  }

  private hasPrefix(text: string): boolean {
    return text.startsWith(this.prefix);
  }

  private toCommand(command: NormalizedCommand, args: string[] = []): string {
    return `${this.prefix}${command.name} ${args.join(DELIMETER)}`;
  }

  private toCommandWithArgs(
    command: NormalizedCommand,
    args: string[],
  ): string {
    return `${this.toCommand(command)} ${args.join(DELIMETER)}`;
  }

  private toOption(command: NormalizedCommand, args: string[] = []): Option {
    return {
      content: this.toCommand(command),
      description: `${command.name}${
        command.description ? ` - ${command.description}` : ''
      }`,
    };
  }

  private handleEntered({command, args}: Input): void {
    command.action(args);
  }
}

export function createCli(options: Partial<Options>): CLI {
  const {commands, ...rest} = options;
  if (!commands) {
    throw new Error('options.commands is required');
  }

  return new OmniCLI({
    prefix: '',
    commands,
    ...rest,
  });
}
