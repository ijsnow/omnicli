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

function getListOptions(): Option[] {
  const options: Option[] = [];
  for (let i = 0; i < 30; i++) {
    options.push({
      content: `item-${i}`,
      description: `Pick item ${i}`,
    });
  }
  return options;
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
  suggest(cli.onTextChanged(text)),
);

browser.omnibox.onInputEntered.addListener(cli.onTextEntered);
