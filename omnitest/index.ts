// tslint:disable:no-console
import {Command, createCli, Suggestion} from '../src';

function helloAction(args: string[]): null {
  console.log(`Hello, ${args.join()}!`);

  return null;
}

function getHelloSuggestions(args: string[]): Suggestion[] {
  return ['Alice', 'Bob'].map(name => ({
    content: name,
    description: `Say hello to ${name}`,
  }));
}

const helloCommand: Command = {
  name: 'hello',
  alias: ['h'],
  action: helloAction,
  getSuggestions: getHelloSuggestions,
};

function sayAction(args: string[]): null {
  console.log(`Omnitest says "${args.join(' ')}"!`);

  return null;
}

const sayCommand: Command = {
  name: 'say',
  alias: ['s'],
  action: sayAction,
  commands: [helloCommand],
};

function humanAction(args: string[]): void {
  console.log('try typing `human say`');
}

const humanCommand: Command = {
  name: 'human',
  description: 'do things a human can do',
  action: humanAction,
  commands: [sayCommand],
};

function listAction(args: string[]): void {
  console.log(`you chose: ${args.join(' ')}`);
}

function getListSuggestions(args: string[]): Promise<Suggestion[]> {
  return new Promise(resolve => {
    const suggestions: Suggestion[] = [];

    for (let i = 0; i < 30; i++) {
      suggestions.push({
        content: `item-${i}`,
        description: `Pick item ${i}`,
      });
    }

    resolve(suggestions);
  });
}

const listCommand: Command = {
  name: 'list',
  alias: ['ls'],
  action: listAction,
  getSuggestions: getListSuggestions,
};

const commands: Command[] = [humanCommand, listCommand];

const cli = createCli({commands, prefix: ':'});

browser.omnibox.setDefaultSuggestion({description: cli.defaultSuggestion});

browser.omnibox.onInputChanged.addListener((text, suggest) => {
  cli.onInputChanged(text).then(opts => {
    suggest(opts);
  });
});

browser.omnibox.onInputEntered.addListener(cli.onInputEntered);
