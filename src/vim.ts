import trim = require("lodash/trim");

import { Suggestion } from "./suggestion";

const UP_ARROW = "↑";
const DOWN_ARROW = "↓";
const ENTER_ARRAY = "↳";

interface DirectionalMap {
  [key: string]: number;
}

enum Direction {
  Forward = 1,
  Backward = -1
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

export interface State {
  text: string;
  pos: MenuPos;

  // selected is the current value if in vim mode
  selected: string;

  // selections stores the mappings from vim keys to command portions
  selections: Selection[];

  isVimMode: boolean;
}

export function createState(): State {
  return {
    text: "",
    pos: { x: 0, y: 0 },
    selections: [],
    selected: "",
    isVimMode: false
  };
}

const directions: DirectionalMap = {
  left: Direction.Backward,
  right: Direction.Forward,
  up: Direction.Backward,
  down: Direction.Forward
};

const axisMap: { [key: string]: "x" | "y" } = {
  h: "x",
  j: "y",
  k: "y",
  l: "x",

  n: "y",
  p: "y"
};

const directionMap: DirectionalMap = {
  // Vim directions
  h: directions.left,
  j: directions.down,
  k: directions.up,
  l: directions.right,

  // Common vim suggestion traversing
  n: directions.down,
  p: directions.up
};

const DIRECTION_REGEX = /\[[A-Za-z]*\]?/gi;

const getDirections = (raw: string) => trim(raw, "[|]");
const getDelta = (char: string) => directionMap[char] || 0;

/**
 * parse looks for directionals in a given input and returns what the position of
 * the menu should be based on the directionals if present.
 */
export function parse(raw: string, state: State): State {
  const pos: MenuPos = {
    x: 0,
    y: 0
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
    text = text.replace(DIRECTION_REGEX, "").trim();
  }

  return {
    ...state,
    pos,
    text,
    selections: [],
    isVimMode: !!matches
  };
}

/**
 * exec manipulates the list of suggestions based on the position taken from `parse`.
 */
export function exec(
  suggestions: Suggestion[],
  state: State
): { suggestions: Suggestion[]; state: State } {
  const { pos, isVimMode } = state;
  if (isVimMode) {
    const yPos = pos.y % suggestions.length;

    const front = suggestions.slice(0, yPos);
    const back = suggestions.slice(yPos, suggestions.length);

    suggestions = [...back, ...front];

    const [selected, ...rest] = suggestions;

    suggestions = [
      {
        content: selected.content,
        description: `[${DOWN_ARROW}j${UP_ARROW}k] ${ENTER_ARRAY} ${
          selected.description
        }`
      },
      ...rest
    ];
  }

  return {
    suggestions,
    state: {
      ...state,
      selected: suggestions[0].content
    }
  };
}
