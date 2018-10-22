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

export interface SuggestionsList {
  head: SuggestionNode | null;
  tail: SuggestionNode | null;
}

export interface SuggestionNode {
  next: SuggestionNode | null;
  prev: SuggestionNode | null;

  suggestion: Suggestion;
  isSelected: boolean;
}

export function seek(
  {head}: SuggestionsList,
  index: number,
): SuggestionNode | null {
  let node = head;

  let len = 0;
  while (node !== null && len <= index) {
    len++;
    node = node.next;
  }

  return node;
}

export function getLength({head}: SuggestionsList): number {
  let node = head;

  let len = 0;
  while (node !== null) {
    len++;
    node = node.next;
  }

  return len;
}

function toNode(suggestion: Suggestion): SuggestionNode {
  return {
    next: null,
    prev: null,
    isSelected: false,
    suggestion,
  };
}

export function fromSuggestionArray(
  suggestions: Suggestion[],
): SuggestionsList {
  if (suggestions.length === 0) {
    return {head: null, tail: null};
  }

  const head: SuggestionNode = {
    next: null,
    isSelected: false,
    suggestion: suggestions[0],
  };

  let node = head;

  for (const suggestion of suggestions.slice(1)) {
    node.next = {
      next: null,
      prev: node,
      isSelected: false,
      suggestion,
    };

    node = node.next;
  }

  return {head, tail: node};
}

export function rearrange(head: SuggestionNode, delta: number): SuggestionNode {
  const len = getLength(head);

  return head;
}
