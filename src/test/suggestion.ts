import {
  fromSuggestionArray,
  getLength,
  rearrange,
  seek,
  Suggestion,
  SuggestionNode,
} from '../suggestion';

function buildArr(size: number): Suggestion[] {
  const suggestions: Suggestion[] = [];
  for (let i = 0; i < size; i++) {
    suggestions.push({
      content: `node-${i}`,
      description: `Node ${i}`,
    });
  }

  return suggestions;
}

function buildList(size: number): SuggestionNode {
  return fromSuggestionArray(buildArr(size));
}

describe('fromSuggestionArray', () => {
  it('can build a list from an array', () => {
    const arrs = [buildArr(0), buildArr(1), buildArr(20)];

    for (const a of arrs) {
      let node = fromSuggestionArray(a);
      let i = 0;

      while (node !== null) {
        expect(node.suggestion).toEqual(a[i]);
        node = node.next;
        i++;
      }
    }
  });
});

describe('getLength', () => {
  it('correctly counts the nodes', () => {
    const tries: Array<{head: SuggestionNode; len: number}> = [
      {
        head: buildList(1),
        len: 1,
      },
      {
        head: buildList(50),
        len: 50,
      },
    ];

    for (const {head, len} of tries) {
      expect(getLength(head)).toBe(len);
    }
  });
});

describe('seek', () => {
  it('can find the correct node', () => {
    const tries: Array<{
      head: SuggestionNode;
      node: {suggestion: Partial<Suggestion>} | null;
      index: number;
    }> = [
      {
        head: buildList(1),
        index: 42,
        node: null,
      },
      {
        head: buildList(50),
        index: 42,
        node: {
          suggestion: {
            content: 'item-42',
          },
        },
      },
    ];

    for (const {head, index, node} of tries) {
      const found = seek(head, index);

      if (node === null) {
        expect(found).toBe(null);
        return;
      }

      expect(found).toEqual(expect.objectContaining(node.suggestion));
    }
  });
});

describe('rearrange', () => {
  it('can rearrange to the correct location', () => {
    const head = buildList(50);

    const deltas = [
      {delta: 5, expectedContent: 'node-5'},
      {delta: -5, expectedContent: 'node-45'},
      {delta: 50, expectedContent: 'node-0'},
      {delta: 55, expectedContent: 'node-5'},
    ];

    for (const {delta, expectedContent} of deltas) {
      const node = rearrange(head, delta);

      expect(node.suggestion.content).toBe(expectedContent);
    }
  });
});
