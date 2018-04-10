import trim = require('lodash/trim');
/**
 * Suggestion represents the objects in a cli suggestion list.
 * This interface implements [`browser.omnibox.SuggestResult`](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/omnibox/SuggestResult).
 */
export interface Suggestion {
  /**
   * content is the value that will be displayed when this item is selected.
   */
  content: string;
  /**
   * description is the value that will be displayed in the list.
   */
  description: string;
}

interface DirectionalMap {
  [key: string]: number;
}

enum Direction {
  Forward = 1,
  Backward = -1,
}

export interface MenuPos {
  x: number;
  y: number;
}

const directions: DirectionalMap = {
  left: Direction.Backward,
  right: Direction.Forward,
  up: Direction.Backward,
  down: Direction.Forward,
};

const axisMap: {[key: string]: 'x' | 'y'} = {
  h: 'x',
  j: 'y',
  k: 'y',
  l: 'x',

  n: 'y',
  p: 'y',
};

const directionMap: DirectionalMap = {
  // Vim directions
  h: directions.left,
  j: directions.down,
  k: directions.up,
  l: directions.right,

  // Common vim suggestion traversing
  n: directions.down,
  p: directions.up,
};

const DIRECTION_REGEX = /\[[A-Za-z]*\]?/gi;

const getDirections = (raw: string) => trim(raw, '[|]');
const getDelta = (char: string) => directionMap[char] || 0;

export function processInputForSuggestions(
  raw: string,
): {pos: MenuPos; text: string} {
  const pos: MenuPos = {
    x: 0,
    y: 0,
  };

  let text = raw;
  const matches = text.match(DIRECTION_REGEX);
  if (matches) {
    for (const match of matches) {
      const directionals = getDirections(match);

      for (const direction of directionals) {
        const delta = getDelta(direction);
        const key = axisMap[direction];

        if (key) {
          pos[key] += delta;
        }
      }
    }

    // Replace the directionals with a space.
    text = text.replace(DIRECTION_REGEX, ' ');
  }

  return {pos, text};
}

export function processSuggestions(
  suggestions: Suggestion[],
  pos: MenuPos,
): Suggestion[] {
  const yPos = pos.y % suggestions.length;

  const front = suggestions.slice(0, yPos);
  const back = suggestions.slice(yPos, suggestions.length);

  suggestions = [...back, ...front];

  return suggestions;
}
