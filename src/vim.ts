import has = require("lodash/has");
import identity = require("lodash/identity");
import trim = require("lodash/trim");

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

export interface VimSuggestion extends Suggestion {
  key: string;
}

export interface KeyMap {
  keyToIndex: { [key: string]: number };
  indexToKey: { [key: number]: string };
}

export interface State {
  text: string;
  pos: MenuPos;

  head: Node | null;

  // selected is the current value if in vim mode
  selected: string;

  suggestions: Suggestion[];
  keyMap: KeyMap | null;

  isVimMode: boolean;
}

export function createState(): State {
  return {
    text: "",
    pos: { x: 0, y: 0 },
    suggestions: [],
    keyMap: null,
    selected: "",
    isVimMode: false,
    head: null
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
  p: "y",

  f: "y",
  b: "y"
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
  b: directions.up * 5
};

const DIRECTION_REGEX = /\[[A-Za-z0-9]*\]?/gi;

const getDirections = (raw: string) => trim(raw, "[|]");
const getDelta = (char: string) => directionMap[char] || 0;

const isNumeric = (chars: string) => !isNaN(Number(chars));

const charInfo = {
  lower: 97,
  upper: 123,
  range: 123 - 97,
  reserved: {
    ["h".charCodeAt(0)]: true,
    ["j".charCodeAt(0)]: true,
    ["k".charCodeAt(0)]: true,
    ["l".charCodeAt(0)]: true,
    ["n".charCodeAt(0)]: true,
    ["p".charCodeAt(0)]: true,
    ["f".charCodeAt(0)]: true,
    ["b".charCodeAt(0)]: true
  }
};

export function generateKeyMap(length: number): KeyMap {
  const keyToIndex: { [key: string]: number } = {};
  const indexToKey: { [key: number]: string } = {};

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

  return { keyToIndex, indexToKey };
}

export interface VimContext {
  keyMap: KeyMap;
}

export function createContext(size: number): VimContext {
  return {
    keyMap: generateKeyMap(size)
  };
}

export enum NodeType {
  Directional,
  KeyMap,
  Multiplier
}

export interface Node {
  key: string;
  delta: number;
  type: NodeType;

  next: Node | null;
}

function isNodeType(test: NodeType, target: NodeType): boolean {
  return identity(test) === identity(target);
}

export function parseKeyMapNode(text: string, ctx: VimContext): Node {
  const { keyMap: { keyToIndex } } = ctx;

  let key = text.charAt(0);
  let idx = 0;

  while (
    idx < text.length &&
    !isNumeric(key) &&
    !directionMap[key] &&
    keyToIndex[key]
  ) {
    idx++;
    key += text.charAt(idx);
  }

  return {
    key,
    delta: keyToIndex[key],
    next: parseNodes(text.slice(1), ctx),
    type: NodeType.KeyMap
  };
}

export function parseDirectionalNode(text: string, ctx: VimContext): Node {
  const key = text.charAt(0);

  const delta = getDelta(key);

  return {
    key,
    delta,
    next: parseNodes(text.slice(1), ctx),
    type: NodeType.Directional
  };
}

export function parseNumberNode(text: string, ctx: VimContext): Node {
  let num = text.charAt(0);

  let idx = 0;

  let multiplier = 1;

  while (idx < text.length && isNumeric(num)) {
    multiplier = parseInt(num, 10);
    idx++;
    num += text.charAt(idx);
  }

  const next = parseNodes(text.slice(idx), ctx);
  if (next !== null && next.type !== NodeType.KeyMap) {
    next.delta = next.delta * multiplier;
  }

  return {
    key: num,
    delta: 0,
    next,
    type: NodeType.Multiplier
  };
}

export function parseNodes(text: string, ctx: VimContext): Node | null {
  if (text.length === 0) {
    return null;
  }

  const direction = text.charAt(0);
  if (isNumeric(direction)) {
    return parseNumberNode(text, ctx);
  }

  if (!directionMap[direction]) {
    return parseKeyMapNode(text, ctx);
  }

  return parseDirectionalNode(text, ctx);
}

export function calculateDelta(head: Node): number {
  let node = head;

  let delta = 0;
  while (node !== null) {
    if (node.type === NodeType.KeyMap) {
      delta = node.delta;
    } else {
      delta += node.delta;
    }

    node = node.next;
  }

  return delta;
}

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
      const ctx = createContext(state.suggestions.length);

      const delta = calculateDelta(parseNodes(directionals, ctx));

      pos.y += delta;
    }

    // Replace the directionals with an empty string
    text = text.replace(DIRECTION_REGEX, "").trim();
  }

  return {
    ...state,
    pos,
    text,
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
  let keyMap: KeyMap | null = state.keyMap || null;

  let vimSuggestions: VimSuggestion[] = suggestions.map(s => ({
    ...s,
    key: ""
  }));
  let selected = vimSuggestions[0].content;

  if (isVimMode) {
    if (!keyMap) {
      keyMap = generateKeyMap(suggestions.length);
    }

    const { indexToKey } = keyMap;
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
        description
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
      keyMap
    }
  };
}
