import tail = require('lodash/tail');
import take = require('lodash/take');
import trimStart = require('lodash/trimStart');

import {Command, normalizeCommand, NormalizedCommand} from './command';
import {
  MenuPos,
  processInputForSuggestions,
  processSuggestions,
  Suggestion,
} from './suggestion';

export const DEFAULT_NAME = '<default>';
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
  hasPrefix: (text: string) => boolean;
  onInputChanged: (text: string) => Promise<Suggestion[]>;
  onInputEntered: (text: string) => void | Error;
  defaultSuggestion: string;
}

class OmniCLI implements CLI {
  public defaultSuggestion = '';

  private prefix = '';
  private commands = new Map<string, NormalizedCommand>();

  constructor({commands, prefix}: Options) {
    this.prefix = prefix;

    this.processCommands(commands);
  }

  public hasPrefix(text: string): boolean {
    return text.startsWith(this.prefix);
  }

  public onInputEntered = (
    text: string,
    disposition?: string,
  ): Error | void => {
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

    return action(args, disposition);
  };

  public onInputChanged = (text: string): Promise<Suggestion[]> => {
    return new Promise(resolve => {
      if (!this.hasPrefix(text)) {
        resolve([]);
      }

      const input = this.processInput(text);
      let suggestions: Suggestion[] = [];
      if (input.command) {
        const {command, args} = input;
        if (command.getSuggestions) {
          command.getSuggestions(args).then(opts => {
            resolve(
              processSuggestions(
                opts.map(({content, ...opt}) => ({
                  content: this.toCommand(command.name, [content]),
                  ...opt,
                })),
                input.pos,
              ),
            );
          });
          return;
        } else {
          suggestions = [this.toSuggestion(command)];

          for (const sub of command.commands) {
            const subCmd = normalizeCommand({
              ...sub,
              name: `${command.name} ${sub.name}`,
            });
            suggestions.push(this.toSuggestion(subCmd));
          }
        }
      } else {
        suggestions = [
          {
            content: '',
            description: 'Enter a command',
          },
        ];

        for (const command of this.commands.values()) {
          suggestions.push({
            content: this.toCommand(command.name),
            description: `${command.name}${
              command.description ? ` - ${command.description}` : ''
            }`,
          });
        }
      }

      resolve(processSuggestions(suggestions, input.pos));
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

    this.defaultSuggestion = `Enter a command: ${commands
      .map(({name}) => name)
      .join(', ')}`;
  }

  private processInput(raw: string): Input {
    const {text, pos} = processInputForSuggestions(raw);

    const [root, ...args] = trimStart(text, this.prefix)
      .trim()
      .split(WHITESPACE);

    let rootCmd = this.commands.get(root);
    if (!rootCmd && this.hasDefault()) {
      rootCmd = this.commands.get(DEFAULT_NAME);
    }

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

  private toCommand(name: string, args: string[] = []): string {
    return `${this.prefix}${name} ${args.join(DELIMETER)}`;
  }

  private toSuggestion(
    command: NormalizedCommand,
    args: string[] = [],
  ): Suggestion {
    return {
      content: this.toCommand(command.name),
      description: `${command.name}${
        command.description ? ` - ${command.description}` : ''
      }`,
    };
  }

  private handleEntered({command, args}: Input): void {
    command.action(args);
  }

  private hasDefault(): boolean {
    return this.commands.has(DEFAULT_NAME);
  }
}

export function createCli(options: Partial<Options>): CLI {
  const {commands, ...rest} = options;
  if (!commands) {
    throw new Error('suggestions.commands is required');
  }

  return new OmniCLI({
    prefix: '',
    commands,
    ...rest,
  });
}
