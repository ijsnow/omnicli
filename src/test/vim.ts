import {
  calculateDelta,
  createContext,
  parseDirectionalNode,
  parseKeyMapNode,
  parseNodes,
  parseNumberNode,
  Suggestion,
} from '../vim';

const defaultCtx = createContext(0);

function createSuggestions(len: number): Suggestion[] {
  const s: Suggestion[] = [];

  for (let i = 0; i < len; i++) {
    s.push({
      content: `item-${i}`,
      description: `Item ${i}`,
    });
  }

  return s;
}

describe('parseDirectionalNode', () => {
  it('can parse a single key', () => {
    const keys = [['k', -1], ['j', 1], ['n', 1], ['f', 5], ['b', -5]];

    for (const [key, delta] of keys) {
      const node = parseDirectionalNode(key as string, defaultCtx);

      expect(node).toEqual(
        expect.objectContaining({
          delta: delta as number,
          key,
          next: null,
        }),
      );
    }
  });
});

describe('parseKeyMapNode', () => {
  it('can parse single key', () => {
    const suggestions = createSuggestions(20);
    const ctx = createContext(20);

    const keys = [
      {
        key: 'a',
        delta: ctx.keyMap.keyToIndex.a,
      },
      {
        key: 'c',
        delta: ctx.keyMap.keyToIndex.c,
      },
      {
        key: 'g',
        delta: ctx.keyMap.keyToIndex.g,
      },
    ];

    for (const {key, delta} of keys) {
      const node = parseKeyMapNode(key, ctx);

      expect(node).toEqual(
        expect.objectContaining({
          delta,
          key,
          next: null,
        }),
      );
    }
  });
});

describe('parseNumberNode', () => {
  it('can parse numbers as the last key', () => {
    const keys = ['2', '32', '4'];
    for (const key of keys) {
      const node = parseNumberNode(key, defaultCtx);

      expect(node).toEqual(
        expect.objectContaining({
          delta: 0,
          key,
          next: null,
        }),
      );
    }
  });

  it(`can multiply the next key's delta`, () => {
    const keys = [
      {k: '2j', e: {key: 'j', delta: 2}},
      {k: '4k', e: {key: 'k', delta: -4}},
      {k: '11k', e: {key: 'k', delta: -11}},
    ];

    for (const {k, e} of keys) {
      const node = parseNumberNode(k, defaultCtx);

      expect(node.next).toEqual(
        expect.objectContaining({
          delta: e.delta,
          key: e.key,
          next: null,
        }),
      );
    }
  });

  it(`doesn't multiply the next key's delta if its a key map`, () => {
    const suggestions = createSuggestions(20);
    const ctx = createContext(20);

    const keys = [
      {k: '2a', e: {key: 'a', delta: ctx.keyMap.keyToIndex.a}},
      {k: '4c', e: {key: 'c', delta: ctx.keyMap.keyToIndex.c}},
      {k: '11g', e: {key: 'g', delta: ctx.keyMap.keyToIndex.g}},
    ];

    for (const {k, e} of keys) {
      const node = parseNumberNode(k, ctx);

      expect(node.next).toEqual(
        expect.objectContaining({
          delta: e.delta,
          key: e.key,
        }),
      );
    }
  });

  it(`can multiply the next key's delta and not affect the following`, () => {
    const keys = [
      {k: '2jj', e: {key: 'j', delta: 1}},
      {k: '4kk', e: {key: 'k', delta: -1}},
    ];

    for (const {k, e} of keys) {
      const node = parseNumberNode(k, defaultCtx);

      expect(node.next.next).toEqual(
        expect.objectContaining({
          delta: e.delta,
          key: e.key,
          next: null,
        }),
      );
    }
  });
});

describe('parseNodes', () => {
  it('can parse a string of directional keys', () => {
    const attempts = [
      {
        input: 'jjkkfb',
        expectedDelta: 0,
      },
    ];

    for (const {input, expectedDelta} of attempts) {
      const node = parseNodes(input, defaultCtx);

      const delta = calculateDelta(node);

      expect(delta).toBe(expectedDelta);
    }
  });

  it('can parse a string of directional keys and numbers', () => {
    const attempts = [
      {
        input: 'jj2k2fb',
        expectedDelta: 5,
      },
    ];

    for (const {input, expectedDelta} of attempts) {
      const node = parseNodes(input, defaultCtx);

      const delta = calculateDelta(node);

      expect(delta).toBe(expectedDelta);
    }
  });

  it('can parse it all', () => {
    const attempts = [
      {
        input: 'jj2k2fb',
        expectedDelta: 5,
      },
      {
        input: 'b2a',
        expectedDelta: 0,
      },
      {
        input: 'b2ajj',
        expectedDelta: 2,
      },
      {
        input: 'b2',
        expectedDelta: -5,
      },
    ];

    for (const {input, expectedDelta} of attempts) {
      const node = parseNodes(input, createContext(20));

      const delta = calculateDelta(node);

      expect(delta).toBe(expectedDelta);
    }
  });
});
