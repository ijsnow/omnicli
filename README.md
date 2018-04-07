# OmniCLI

A command line framework designed to work within the [`omnibox`](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/omnibox) API.

## Features

### Commands

OmniCLI parses an input and maps it to a given command. Commands can have aliases and
sub commands.

### Options

OmniCLI will build a list of options for you based on the available commands and return
these as an options menu. You can also provide options for commands when a command
is matched with an input before it is submitted.

### Vim-like Options Menu Navigation

The `omnibox` API only displays the first 6 items passed to it's `suggest` function.
Because of this, we need a way to simulate scrolling through a list of options.

To scroll up and down in the list, type `[` any where in the prompt to enter "scroll mode"
and then use `j` to scroll down and use `k` to scroll up. To exit "scroll mode",
close if off with a `]`.

## Getting Started

```shell
yarn add omnicli
# or
npm i omnicli
```

## Usage

Basic usage

```javascript
import createCli from 'omnicli';

function helloAction(args: string[]) {
  console.log(`Hello, ${args.join(' ')}!`);
}

const helloCommand = {
  name: 'hello',
  alias: ['greet'],
  description: 'Say hello',
  action: helloAction,
};

const cli = createCli({
  commands: [helloCommand],
});

cli.onTextEntered('hello beautiful world');
// => 'Hello, beautiful world!'
cli.onTextEntered('greet beautiful world');
// => 'Hello, beautiful world!'
```

With `omnibox`

```javascript
browser.omnibox.onInputChanged.addListener((text, suggest) =>
  suggest(cli.onTextChanged(text)),
);

browser.omnibox.onInputEntered.addListener(cli.onTextEntered);
```

Options

```javascript
// ...

function getHelloOptions(args: string[]) {
  return ['Alice', 'Bob'];
}

const helloCommand = {
  name: 'hello',
  description: 'Say hello',
  action: helloAction,
  getOptions: getHelloOptions,
};

options = cli.onTextChanged('hello beautiful world');

// Display options
console.log(options);
```

Scrolling in the list of options.

```javascript
function getHelloOptions(args: string[]) {
  return [
    'Option 0',
    'Option 1',
    'Option 2',
    'Option 3',
    'Option 4',
    'Option 5',
    'Option 6',
    'Option 7',
    'Option 8',
    'Option 9',
  ];
}

options = cli.onTextChanged('hello[jjjk]');

// 'jjj' down 3, 'k' up 1
// 'Option 2' will be first
```

Sub commands

```javascript
function helloAction(args: string[]) {
  console.log(`Hello, ${args.join(' ')}!`);
}

const helloCommand = {
  name: 'hello',
  description: 'Say hello',
  action: helloAction,
};

function sayAction(args: string[]) {
  console.log(`I say '${args.join(' ')}'!`);
}

const sayCommand = {
  name: 'say',
  description: 'Say something',
  action: sayAction,
  commands: [helloCommand],
};

const cli = createCli({
  commands: [helloCommand],
});

cli.onTextEntered('say Oi');
// => 'I say 'Oi'!'

cli.onTextEntered('say hello beautiful world');
// => 'Hello, beautiful world!'
```
