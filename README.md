# OmniCLI

A command line framework designed to work within the [`omnibox`](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/omnibox) API.

## Features

### Commands

OmniCLI parses an input and maps it to a given command. Commands can have aliases and
sub commands.

### Suggestions

OmniCLI will build a list of suggestions for you based on the available commands and return
these as an suggestions menu. You can also provide suggestions for commands when a command
is matched with an input before it is submitted.

### Vim-like Suggestions Menu Navigation

The `omnibox` API only displays the first 6 items passed to it's `suggest` function.
Because of this, we need a way to simulate scrolling through a list of suggestions.

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
import {createCli, Command} from 'omnicli';

function helloAction(args: string[]): void {
  console.log(`Hello, ${args.join(' ')}!`);
}

const helloCommand: Command = {
  name: 'hello',
  alias: ['greet'],
  description: 'Say hello',
  action: helloAction,
};

const cli = createCli({
  commands: [helloCommand],
});

cli.onTextEntered('hello beautiful world');
// => 'Hello, beautiful world!' will be logged
cli.onTextEntered('greet beautiful world');
// => 'Hello, beautiful world!' will be logged
```

With `omnibox`

```javascript
browser.omnibox.onInputChanged.addListener((text, suggest) =>
  cli.onTextChanged(text).then(suggestions => suggest(suggestions)),
);

browser.omnibox.onInputEntered.addListener(cli.onTextEntered);
```

Suggestions

```javascript
// ...

function getHelloSuggestions(args: string[]) {
  return ['Alice', 'Bob'];
}

const helloCommand = {
  name: 'hello',
  description: 'Say hello',
  action: helloAction,
  getSuggestions: getHelloSuggestions,
};

cli
  .onTextChanged('hello beautiful world')
  .then(suggestions => console.log(suggestions));
```

Scrolling in the list of suggestions.

```javascript
function getHelloSuggestions(args: string[]) {
  return [
    'Suggestion 0',
    'Suggestion 1',
    'Suggestion 2',
    'Suggestion 3',
    'Suggestion 4',
    'Suggestion 5',
    'Suggestion 6',
    'Suggestion 7',
    'Suggestion 8',
    'Suggestion 9',
  ];
}

cli.onTextChanged('hello[jjjk]').then(suggestions => console.log(suggestions));

// 'jjj' down 3, 'k' up 1
// 'Suggestion 2' will be first
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
