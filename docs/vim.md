# OmniCLI Vim Mode

The [`omnibox`](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/omnibox) api is really cool, but it's definitely not intended
for something like a CLI/keyboard heavy workflow inspired by Vim. Yes, you can use the arrow keys to go up and down in the list, but
this wasn't satisfactory for me. That's why I decided to build in a "vim mode" to the OmniCLI's suggestion system.

## Entering Vim Mode

When typing into the cli, just type `[` to enter vim mode. When you begin navigating in vim mode,
you'll see that the items in the list are annotated. When you press enter, the first item in the
list is the command that will get executed when you press enter.

### Navigating the list

From here, you can use some keys that will seem familiar to vim users.

| Key  | Direction |
| ---- | :-------: |
| j, n |  Down 1   |
| k, p |   Up 1    |
| f    |  Down 5   |
| b    |   Up 5    |

You can even use a numeric multiplier like in vim.

| Key | Direction |
| --- | :-------: |
| 3j  |  Down 3   |
| 2b  |   Up 10   |

### Easy motion in vim mode

When in vim mode, you'll notice that each item in the list has a letter or two surrounded by square
brackets. If you type what is in the brackets, you'll be "scrolled" to that item and it will be
executed if you press enter.
