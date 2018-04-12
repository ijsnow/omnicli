import has = require('lodash/has');
import identity = require('lodash/identity');
import trim = require('lodash/trim');

import {Suggestion} from './suggestion';

const UP_ARROW = '↑';
const DOWN_ARROW = '↓';
const ENTER_ARRAY = '↳';

interface DirectionalMap {
  [key: string]: number;
}

enum Direction {
  Forward = 1,
  Backward = -1,
}

export interface MenuPos {
  // x is currently not used. I am reserving this space for the possibility of
  // a 2D menu.
  x: number;
  y: number;
}

export interface Selection {
  index: number;
  key: string;
  command: string;
}

export interface VimSuggestion extends Suggestion {
  key: string;
}

interface CharMap {
  keyToIndex: {[key: string]: number};
  indexToKey: {[key: number]: string};
}

export interface State {
  text: string;
  pos: MenuPos;

  // selected is the current value if in vim mode
  selected: string;

  suggestions: Suggestion[];
  charMap: CharMap | null;

  isVimMode: boolean;
}

export function createState(): State {
  return {
    text: '',
    pos: {x: 0, y: 0},
    suggestions: [],
    charMap: null,
    selected: '',
    isVimMode: false,
  };
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

  f: 'y',
  b: 'y',
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

  f: directions.down * 5,
  b: directions.up * 5,
};

const DIRECTION_REGEX = /\[[A-Za-z0-9]*\]?/gi;

const getDirections = (raw: string) => trim(raw, '[|]');
const getDelta = (char: string) => directionMap[char] || 0;

const isNumeric = (chars: string) => !isNaN(Number(chars));

const charInfo = {
  lower: 97,
  upper: 123,
  range: 123 - 97,
  reserved: {
    ['h'.charCodeAt(0)]: true,
    ['j'.charCodeAt(0)]: true,
    ['k'.charCodeAt(0)]: true,
    ['l'.charCodeAt(0)]: true,
    ['n'.charCodeAt(0)]: true,
    ['p'.charCodeAt(0)]: true,
    ['f'.charCodeAt(0)]: true,
    ['b'.charCodeAt(0)]: true,
  },
};

function generateCharMap(length: number): CharMap {
  const keyToIndex: {[key: string]: number} = {};
  const indexToKey: {[key: number]: string} = {};

  let offset = 0;
  let leaderOffset = 0;

  for (let idx = 0; idx < length; idx++) {
    const keyLen = Math.floor((idx + offset) / charInfo.range);

    let leader: number = -1;
    if (keyLen > 0) {
      leader = (keyLen - 1) % charInfo.range + 97;

      while (leader === -1) {
        leader = (idx + leaderOffset) % charInfo.range + 97;

        if (has(charInfo.reserved, leader)) {
          leader = -1;
          leaderOffset += 1;
        }
      }
    }

    let code = -1;
    while (code === -1) {
      code = (idx + offset) % charInfo.range + 97;

      if (has(charInfo.reserved, code)) {
        code = -1;
        offset += 1;
      }
    }

    const codes = [leader, code].filter(l => l !== -1);

    const key = String.fromCharCode(...codes);

    keyToIndex[key] = idx;
    indexToKey[idx] = key;
  }

  return {keyToIndex, indexToKey};
}

/**
 * parse looks for directionals in a given input and returns what the position of
 * the menu should be based on the directionals if present.
 */
export function parse(raw: string, state: State): State {
  const pos: MenuPos = {
    x: 0,
    y: 0,
  };

  let text = raw;
  const matches = text.match(DIRECTION_REGEX);
  if (matches) {
    for (const match of matches) {
      const directionals = getDirections(match);

      for (let idx = 0; idx < directionals.length; idx++) {
        let direction = directionals[idx];

        let multiplier = 1;

        let maybeNum = direction;
        while (idx < directionals.length && isNumeric(maybeNum)) {
          multiplier = parseInt(maybeNum, 10);
          idx++;

          direction = directionals.charAt(idx);
          maybeNum += direction;
        }

        const delta = getDelta(direction);
        const key = axisMap[direction];

        if (key) {
          pos[key] += delta * multiplier;
          continue;
        }

        let charMapKey = '';
        let char = direction;

        while (idx < directionals.length && !axisMap[char]) {
          charMapKey += char;
          char = directionals.charAt(idx);

          idx++;
        }

        const index = state.charMap.keyToIndex[charMapKey];
        if (typeof index !== 'undefined') {
          pos.y = index;
        }
      }
    }

    // Replace the directionals with a space.
    text = text.replace(DIRECTION_REGEX, '').trim();
  }

  return {
    ...state,
    pos,
    text,
    isVimMode: !!matches,
  };
}

/**
 * exec manipulates the list of suggestions based on the position taken from `parse`.
 */
export function exec(
  suggestions: Suggestion[],
  state: State,
): {suggestions: Suggestion[]; state: State} {
  const {pos, isVimMode} = state;
  let charMap: CharMap | null = state.charMap || null;

  let vimSuggestions: VimSuggestion[] = suggestions.map(s => ({...s, key: ''}));
  let selected = vimSuggestions[0].content;

  if (isVimMode) {
    if (!charMap) {
      charMap = generateCharMap(suggestions.length);
    }

    const {indexToKey} = charMap;
    const yPos = pos.y % vimSuggestions.length;

    vimSuggestions = vimSuggestions.map((suggestion, idx) => {
      let description = `[${indexToKey[idx]}] ${suggestion.description}`;

      if (yPos === idx) {
        description = `[${DOWN_ARROW}j${UP_ARROW}k] ${ENTER_ARRAY} ${
          suggestion.description
        }`;
      }

      return {
        key: indexToKey[idx],
        content: suggestion.content,
        description,
      };
    });

    const front = vimSuggestions.slice(0, yPos);
    const back = vimSuggestions.slice(yPos, vimSuggestions.length);

    vimSuggestions = [...back, ...front];

    selected = vimSuggestions[0].content;
  }

  return {
    suggestions: vimSuggestions,
    state: {
      ...state,
      selected,
      suggestions: vimSuggestions,
      charMap,
    },
  };
}
