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
