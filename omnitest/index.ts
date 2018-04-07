// tslint:disable:no-console
import createCli, {Command, Option} from '../src';

function helloAction(args: string[]): null {
  console.log(`Hello, ${args.join()}!`);

  return null;
}

function getHelloOptions(args: string[]): Option[] {
  return ['Alice', 'Bob'].map(name => ({
    content: name,
    description: `Say hello to ${name}`,
  }));
}

const helloCommand: Command = {
  name: 'hello',
  alias: ['h'],
  action: helloAction,
  getOptions: getHelloOptions,
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

function getListOptions(args: string[]): Promise<Option[]> {
  return new Promise(resolve => {
    console.log('getting options');
    const options: Option[] = [];

    for (let i = 0; i < 30; i++) {
      options.push({
        content: `item-${i}`,
        description: `Pick item ${i}`,
      });
    }

    console.log('options', options);

    resolve(options);
  });
}

const listCommand: Command = {
  name: 'list',
  alias: ['ls'],
  action: listAction,
  getOptions: getListOptions,
};

const commands: Command[] = [humanCommand, listCommand];

const cli = createCli({commands});

browser.omnibox.onInputChanged.addListener((text, suggest) =>
  cli.onTextChanged(text).then(opts => {
    console.log('hello', opts);
    suggest(opts);
  }),
);

browser.omnibox.onInputEntered.addListener(cli.onTextEntered);
