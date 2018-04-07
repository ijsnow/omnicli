// tslint:disable

interface Window {
  browser: typeof browser;
}

interface IEvent {}

declare namespace browser.storage {
  interface StorageArea {
    get: (
      keys: string | string[] | {[key: string]: any} | null,
    ) => Promise<{[key: string]: any}>;
    getBytesInUse: (keys: string | string[] | null) => Promise<number>;
    set: (keys: {[key: string]: any}) => Promise<void>;
    remove: (keys: string | string[]) => Promise<void>;
    clear: () => void;
  }

  export interface LocalStorageArea extends StorageArea {
    /** The maximum amount (in bytes) of data that can be stored in local storage, as measured by the JSON stringification of every value plus every key's length. This value will be ignored if the extension has the unlimitedStorage permission. Updates that would cause this limit to be exceeded fail immediately and set runtime.lastError. */
    QUOTA_BYTES: number;
  }

  export interface SyncStorageArea extends StorageArea {
    /** @deprecated since Chrome 40. The storage.sync API no longer has a sustained write operation quota. */
    MAX_SUSTAINED_WRITE_OPERATIONS_PER_MINUTE: number;
    /** The maximum total amount (in bytes) of data that can be stored in sync storage, as measured by the JSON stringification of every value plus every key's length. Updates that would cause this limit to be exceeded fail immediately and set runtime.lastError. */
    QUOTA_BYTES: number;
    /** The maximum size (in bytes) of each individual item in sync storage, as measured by the JSON stringification of its value plus its key length. Updates containing items larger than this limit will fail immediately and set runtime.lastError. */
    QUOTA_BYTES_PER_ITEM: number;
    /** The maximum number of items that can be stored in sync storage. Updates that would cause this limit to be exceeded will fail immediately and set runtime.lastError. */
    MAX_ITEMS: number;
    /**
     * The maximum number of set, remove, or clear operations that can be performed each hour. This is 1 every 2 seconds, a lower ceiling than the short term higher writes-per-minute limit.
     * Updates that would cause this limit to be exceeded fail immediately and set runtime.lastError.
     */
    MAX_WRITE_OPERATIONS_PER_HOUR: number;
    /**
     * The maximum number of set, remove, or clear operations that can be performed each minute. This is 2 per second, providing higher throughput than writes-per-hour over a shorter period of time.
     * Updates that would cause this limit to be exceeded fail immediately and set runtime.lastError.
     * @since Chrome 40.
     */
    MAX_WRITE_OPERATIONS_PER_MINUTE: number;
  }

  export const local: LocalStorageArea;
  export const sync: SyncStorageArea;
  export const managed: StorageArea;

  export interface StorageChange {
    newValue?: any;
    oldValue?: any;
  }

  export interface StorageChangedEvent
    extends browser.events.Event<
        (changes: {[key: string]: StorageChange}, areaName: string) => void
      > {}

  export const onChanged: StorageChangedEvent;
}

declare namespace browser.omnibox {
  /** A suggest result. */
  export interface SuggestResult {
    /** The text that is put into the URL bar, and that is sent to the extension when the user chooses this entry. */
    content: string;
    /** The text that is displayed in the URL dropdown. Can contain XML-style markup for styling. The supported tags are 'url' (for a literal URL), 'match' (for highlighting text that matched what the user's query), and 'dim' (for dim helper text). The styles can be nested, eg. dimmed match. You must escape the five predefined entities to display them as text: stackoverflow.com/a/1091953/89484 */
    description: string;
  }

  export interface Suggestion {
    /** The text that is displayed in the URL dropdown. Can contain XML-style markup for styling. The supported tags are 'url' (for a literal URL), 'match' (for highlighting text that matched what the user's query), and 'dim' (for dim helper text). The styles can be nested, eg. dimmed match. */
    description: string;
  }

  export interface OmniboxInputEnteredEvent
    extends browser.events.Event<
        (text: string, disposition: OnInputEnteredDisposition) => void
      > {}

  export interface OmniboxInputChangedEvent
    extends browser.events.Event<
        (
          text: string,
          suggest: (suggestResults: SuggestResult[]) => void,
        ) => void
      > {}

  export interface OmniboxInputStartedEvent
    extends browser.events.Event<() => void> {}

  export interface OmniboxInputCancelledEvent
    extends browser.events.Event<() => void> {}

  /**
   * Sets the description and styling for the default suggestion. The default suggestion is the text that is displayed in the first suggestion row underneath the URL bar.
   * @param suggestion A partial SuggestResult object, without the 'content' parameter.
   */
  export function setDefaultSuggestion(suggestion: Suggestion): void;

  export type OnInputEnteredDisposition =
    | 'currentTab'
    | 'newForegroundTab'
    | 'newBackgroundTab';

  /** User has accepted what is typed into the omnibox. */
  export var onInputEntered: OmniboxInputEnteredEvent;
  /** User has changed what is typed into the omnibox. */
  export var onInputChanged: OmniboxInputChangedEvent;
  /** User has started a keyword input session by typing the extension's keyword. This is guaranteed to be sent exactly once per input session, and before any onInputChanged events. */
  export var onInputStarted: OmniboxInputStartedEvent;
  /** User has ended the keyword input session without accepting the input. */
  export var onInputCancelled: OmniboxInputCancelledEvent;
}

declare namespace browser.tabs {
  export interface Tab {
    id?: number;
    status?: 'loading' | 'complete';
    url?: string;
    title?: string;
    windowId: number;
    active: boolean;
    index: number;
  }

  export interface ConnectInfo {
    name?: string;
    frameId?: number;
  }

  export interface SendMessageOptions {
    frameId: number;
  }

  export function sendMessage(
    tabId: number,
    message: any,
    options?: SendMessageOptions,
  ): Promise<any>;

  export function connect(
    tabId: number,
    connectInfo?: ConnectInfo,
  ): runtime.Port;

  export function getCurrent(): Promise<Tab | undefined>;
}

declare namespace browser.runtime {
  export interface MessageSender {
    tab?: browser.tabs.Tab;
    id?: string;
    frameId?: number;
    url?: string;
    tlsChannelId?: string;
  }

  export interface MessageReceivedEvent
    extends browser.events.Event<
        (
          message: any,
          sender: MessageSender,
          sendResponse: (response: any) => void,
        ) => Promise<any> | boolean | void
      > {}

  export interface PortDisconnectEvent
    extends browser.events.Event<(port: Port) => void> {}

  export interface PortMessageEvent
    extends browser.events.Event<(message: any, port: Port) => void> {}

  export interface Port {
    postMessage: (message: Object) => void;
    disconnect: () => void;
    error: {message: string} | null;
    sender?: MessageSender;
    onDisconnect: PortDisconnectEvent;
    onMessage: PortMessageEvent;
    name: string;
  }

  export interface ExtensionConnectEvent
    extends browser.events.Event<(port: Port) => void> {}

  export var onConnect: ExtensionConnectEvent;

  export interface ConnectInfo {
    name?: string;
  }

  export function connect(connectInfo?: ConnectInfo): Port;

  export const onMessage: MessageReceivedEvent;
}

declare namespace browser.webRequest {
  export interface AuthCredentials {
    username: string;
    password: string;
  }

  /** An HTTP Header, represented as an object containing a key and either a value or a binaryValue. */
  export interface HttpHeader {
    name: string;
    value?: string;
    binaryValue?: ArrayBuffer;
  }

  /** Returns value for event handlers that have the 'blocking' extraInfoSpec applied. Allows the event handler to modify network requests. */
  export interface BlockingResponse {
    /** Optional. If true, the request is cancelled. Used in onBeforeRequest, this prevents the request from being sent. */
    cancel?: boolean;
    /**
     * Optional.
     * Only used as a response to the onBeforeRequest and onHeadersReceived events. If set, the original request is prevented from being sent/completed and is instead redirected to the given URL. Redirections to non-HTTP schemes such as data: are allowed. Redirects initiated by a redirect action use the original request method for the redirect, with one exception: If the redirect is initiated at the onHeadersReceived stage, then the redirect will be issued using the GET method.
     */
    redirectUrl?: string;
    /**
     * Optional.
     * Only used as a response to the onHeadersReceived event. If set, the server is assumed to have responded with these response headers instead. Only return responseHeaders if you really want to modify the headers in order to limit the number of conflicts (only one extension may modify responseHeaders for each request).
     */
    responseHeaders?: HttpHeader[];
    /** Optional. Only used as a response to the onAuthRequired event. If set, the request is made using the supplied credentials. */
    authCredentials?: AuthCredentials;
    /**
     * Optional.
     * Only used as a response to the onBeforeSendHeaders event. If set, the request is made with these request headers instead.
     */
    requestHeaders?: HttpHeader[];
  }

  /** An object describing filters to apply to webRequest events. */
  export interface RequestFilter {
    /** Optional. */
    tabId?: number;
    /**
     * A list of request types. Requests that cannot match any of the types will be filtered out.
     * Each element one of: "main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", or "other"
     */
    types?: string[];
    /** A list of URLs or URL patterns. Requests that cannot match any of the URLs will be filtered out. */
    urls: string[];

    /** Optional. */
    windowId?: number;
  }

  /**
   * Contains data uploaded in a URL request.
   * @since Chrome 23.
   */
  export interface UploadData {
    /** Optional. An ArrayBuffer with a copy of the data. */
    bytes?: ArrayBuffer;
    /** Optional. A string with the file's path and name. */
    file?: string;
  }

  export interface WebRequestBody {
    /** Optional. Errors when obtaining request body data. */
    error?: string;
    /**
     * Optional.
     * If the request method is POST and the body is a sequence of key-value pairs encoded in UTF8, encoded as either multipart/form-data, or application/x-www-form-urlencoded, this dictionary is present and for each key contains the list of all values for that key. If the data is of another media type, or if it is malformed, the dictionary is not present. An example value of this dictionary is {'key': ['value1', 'value2']}.
     */
    formData?: {[key: string]: string[]};
    /**
     * Optional.
     * If the request method is PUT or POST, and the body is not already parsed in formData, then the unparsed request body elements are contained in this array.
     */
    raw?: UploadData[];
  }

  export interface WebAuthChallenger {
    host: string;
    port: number;
  }

  export interface ResourceRequest {
    url: string;
    /** The ID of the request. Request IDs are unique within a browser session. As a result, they could be used to relate different events of the same request. */
    requestId: string;
    /** The value 0 indicates that the request happens in the main frame; a positive value indicates the ID of a subframe in which the request happens. If the document of a (sub-)frame is loaded (type is main_frame or sub_frame), frameId indicates the ID of this frame, not the ID of the outer frame. Frame IDs are unique within a tab. */
    frameId: number;
    /** ID of frame that wraps the frame which sent the request. Set to -1 if no parent frame exists. */
    parentFrameId: number;
    /** The ID of the tab in which the request takes place. Set to -1 if the request isn't related to a tab. */
    tabId: number;
    /**
     * How the requested resource will be used.
     * One of: "main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", or "other"
     */
    type: string;
    /** The time when this signal is triggered, in milliseconds since the epoch. */
    timeStamp: number;
  }

  export interface WebRequestDetails extends ResourceRequest {
    /** Standard HTTP method. */
    method: string;
  }

  export interface WebRequestHeadersDetails extends WebRequestDetails {
    /** Optional. The HTTP request headers that are going to be sent out with this request. */
    requestHeaders?: HttpHeader[];
  }

  export interface WebRequestBodyDetails extends WebRequestDetails {
    /**
     * Contains the HTTP request body data. Only provided if extraInfoSpec contains 'requestBody'.
     * @since Chrome 23.
     */
    requestBody: WebRequestBody;
  }

  export interface WebRequestFullDetails
    extends WebRequestHeadersDetails,
      WebRequestBodyDetails {}

  export interface WebResponseDetails extends ResourceRequest {
    /** HTTP status line of the response or the 'HTTP/0.9 200 OK' string for HTTP/0.9 responses (i.e., responses that lack a status line). */
    statusLine: string;
    /**
     * Standard HTTP status code returned by the server.
     * @since Chrome 43.
     */
    statusCode: number;
  }

  export interface WebResponseHeadersDetails extends WebResponseDetails {
    /** Optional. The HTTP response headers that have been received with this response. */
    responseHeaders?: HttpHeader[];
    method: string /** standard HTTP method i.e. GET, POST, PUT, etc. */;
  }

  export interface WebResponseCacheDetails extends WebResponseHeadersDetails {
    /**
     * Optional.
     * The server IP address that the request was actually sent to. Note that it may be a literal IPv6 address.
     */
    ip?: string;
    /** Indicates if this response was fetched from disk cache. */
    fromCache: boolean;
  }

  export interface WebRedirectionResponseDetails
    extends WebResponseCacheDetails {
    /** The new URL. */
    redirectUrl: string;
  }

  export interface WebAuthenticationChallengeDetails
    extends WebResponseHeadersDetails {
    /** The authentication scheme, e.g. Basic or Digest. */
    scheme: string;
    /** The authentication realm provided by the server, if there is one. */
    realm?: string;
    /** The server requesting authentication. */
    challenger: WebAuthChallenger;
    /** True for Proxy-Authenticate, false for WWW-Authenticate. */
    isProxy: boolean;
  }

  export interface WebResponseErrorDetails extends WebResponseCacheDetails {
    /** The error description. This string is not guaranteed to remain backwards compatible between releases. You must not parse and act based upon its content. */
    error: string;
  }

  export interface WebRequestBodyEvent
    extends browser.events.Event<(details: WebRequestBodyDetails) => void> {
    addListener(
      listener: (details: WebRequestBodyDetails) => void,
      filter?: RequestFilter,
      extraInfoSpec?: string[],
    ): void;
  }

  export interface WebRequestHeadersEvent
    extends browser.events.Event<(details: WebRequestHeadersDetails) => void> {
    addListener(
      listener: (details: WebRequestHeadersDetails) => void,
      filter?: RequestFilter,
      extraInfoSpec?: string[],
    ): void;
  }

  export interface _WebResponseHeadersEvent<
    T extends WebResponseHeadersDetails
  > extends browser.events.Event<(details: T) => void> {
    addListener(
      listener: (details: T) => void,
      filter?: RequestFilter,
      extraInfoSpec?: string[],
    ): void;
  }

  export interface WebResponseHeadersEvent
    extends _WebResponseHeadersEvent<WebResponseHeadersDetails> {}

  export interface WebResponseCacheEvent
    extends _WebResponseHeadersEvent<WebResponseCacheDetails> {}

  export interface WebRedirectionResponseEvent
    extends _WebResponseHeadersEvent<WebRedirectionResponseDetails> {}

  export interface WebAuthenticationChallengeEvent
    extends browser.events.Event<
        (
          details: WebAuthenticationChallengeDetails,
          callback?: (response: BlockingResponse) => void,
        ) => void
      > {
    addListener(
      listener: (
        details: WebAuthenticationChallengeDetails,
        callback?: (response: BlockingResponse) => void,
      ) => void,
      filter?: RequestFilter,
      opt_extraInfoSpec?: string[],
    ): void;
  }

  export interface WebResponseErrorEvent
    extends _WebResponseHeadersEvent<WebResponseErrorDetails> {}

  /**
   * The maximum number of times that handlerBehaviorChanged can be called per 10 minute sustained interval. handlerBehaviorChanged is an expensive function call that shouldn't be called often.
   * @since Chrome 23.
   */
  export const MAX_HANDLER_BEHAVIOR_CHANGED_CALLS_PER_10_MINUTES: number;

  /** Needs to be called when the behavior of the webRequest handlers has changed to prevent incorrect handling due to caching. This function call is expensive. Don't call it often. */
  export function handlerBehaviorChanged(): Promise<void>;

  export interface StreamFilter {
    ondata?: (event: {data: ArrayBuffer}) => void;
    // When this is fired, StreamFilter.error will be populated.
    onerror?: (event: any) => void;
    onstart?: (event: any) => void;
    onstop?: (event: any) => void;
    error?: Error;

    status:
      | 'uninitialized'
      | 'transferringdata'
      | 'finishedtransferringdata'
      | 'suspended'
      | 'closed'
      | 'disconnected'
      | 'failed';

    close: () => void;
    disconnect: () => void;
    resume: () => void;
    suspend: () => void;
    write: (data: ArrayBuffer | Uint8Array) => void;
  }

  export function filterResponseData(requestId: string): StreamFilter;

  /** Fired when a request is about to occur. */
  export const onBeforeRequest: WebRequestBodyEvent;
  /** Fired before sending an HTTP request, once the request headers are available. This may occur after a TCP connection is made to the server, but before any HTTP data is sent. */
  export const onBeforeSendHeaders: WebRequestHeadersEvent;
  /** Fired just before a request is going to be sent to the server (modifications of previous onBeforeSendHeaders callbacks are visible by the time onSendHeaders is fired). */
  export const onSendHeaders: WebRequestHeadersEvent;
  /** Fired when HTTP response headers of a request have been received. */
  export const onHeadersReceived: WebResponseHeadersEvent;
  /** Fired when an authentication failure is received. The listener has three options: it can provide authentication credentials, it can cancel the request and display the error page, or it can take no action on the challenge. If bad user credentials are provided, this may be called multiple times for the same request. */
  export const onAuthRequired: WebAuthenticationChallengeEvent;
  /** Fired when the first byte of the response body is received. For HTTP requests, this means that the status line and response headers are available. */
  export const onResponseStarted: WebResponseCacheEvent;
  /** Fired when a server-initiated redirect is about to occur. */
  export const onBeforeRedirect: WebRedirectionResponseEvent;
  /** Fired when a request is completed. */
  export const onCompleted: WebResponseCacheEvent;
  /** Fired when an error occurs. */
  export const onErrorOccurred: WebResponseErrorEvent;
}

declare namespace browser.events {
  /** Filters URLs for various criteria. See event filtering. All criteria are case sensitive. */
  export interface UrlFilter {
    /** Optional. Matches if the scheme of the URL is equal to any of the schemes specified in the array.  */
    schemes?: string[];
    /**
     * Optional.
     * Since Chrome 23.
     * Matches if the URL (without fragment identifier) matches a specified regular expression. Port numbers are stripped from the URL if they match the default port number. The regular expressions use the RE2 syntax.
     */
    urlMatches?: string;
    /** Optional. Matches if the path segment of the URL contains a specified string.  */
    pathContains?: string;
    /** Optional. Matches if the host name of the URL ends with a specified string.  */
    hostSuffix?: string;
    /** Optional. Matches if the host name of the URL starts with a specified string.  */
    hostPrefix?: string;
    /** Optional. Matches if the host name of the URL contains a specified string. To test whether a host name component has a prefix 'foo', use hostContains: '.foo'. This matches 'www.foobar.com' and 'foo.com', because an implicit dot is added at the beginning of the host name. Similarly, hostContains can be used to match against component suffix ('foo.') and to exactly match against components ('.foo.'). Suffix- and exact-matching for the last components need to be done separately using hostSuffix, because no implicit dot is added at the end of the host name.  */
    hostContains?: string;
    /** Optional. Matches if the URL (without fragment identifier) contains a specified string. Port numbers are stripped from the URL if they match the default port number.  */
    urlContains?: string;
    /** Optional. Matches if the query segment of the URL ends with a specified string.  */
    querySuffix?: string;
    /** Optional. Matches if the URL (without fragment identifier) starts with a specified string. Port numbers are stripped from the URL if they match the default port number.  */
    urlPrefix?: string;
    /** Optional. Matches if the host name of the URL is equal to a specified string.  */
    hostEquals?: string;
    /** Optional. Matches if the URL (without fragment identifier) is equal to a specified string. Port numbers are stripped from the URL if they match the default port number.  */
    urlEquals?: string;
    /** Optional. Matches if the query segment of the URL contains a specified string.  */
    queryContains?: string;
    /** Optional. Matches if the path segment of the URL starts with a specified string.  */
    pathPrefix?: string;
    /** Optional. Matches if the path segment of the URL is equal to a specified string.  */
    pathEquals?: string;
    /** Optional. Matches if the path segment of the URL ends with a specified string.  */
    pathSuffix?: string;
    /** Optional. Matches if the query segment of the URL is equal to a specified string.  */
    queryEquals?: string;
    /** Optional. Matches if the query segment of the URL starts with a specified string.  */
    queryPrefix?: string;
    /** Optional. Matches if the URL (without fragment identifier) ends with a specified string. Port numbers are stripped from the URL if they match the default port number.  */
    urlSuffix?: string;
    /** Optional. Matches if the port of the URL is contained in any of the specified port lists. For example [80, 443, [1000, 1200]] matches all requests on port 80, 443 and in the range 1000-1200.  */
    ports?: any[];
    /**
     * Optional.
     * Since Chrome 28.
     * Matches if the URL without query segment and fragment identifier matches a specified regular expression. Port numbers are stripped from the URL if they match the default port number. The regular expressions use the RE2 syntax.
     */
    originAndPathMatches?: string;
  }

  export interface Event<T extends Function> {
    /**
     * Registers an event listener callback to an event.
     * @param callback Called when an event occurs. The parameters of this function depend on the type of event.
     * The callback parameter should be a function that looks like this:
     * function() {...};
     */
    addListener(listener: T): void;
    /**
     * Returns currently registered rules.
     * @param callback Called with registered rules.
     * The callback parameter should be a function that looks like this:
     * function(array of Rule rules) {...};
     * Parameter rules: Rules that were registered, the optional parameters are filled with values.
     */
    getRules(callback: (rules: Rule[]) => void): void;
    /**
     * Returns currently registered rules.
     * @param ruleIdentifiers If an array is passed, only rules with identifiers contained in this array are returned.
     * @param callback Called with registered rules.
     * The callback parameter should be a function that looks like this:
     * function(array of Rule rules) {...};
     * Parameter rules: Rules that were registered, the optional parameters are filled with values.
     */
    getRules(
      ruleIdentifiers: string[],
      callback: (rules: Rule[]) => void,
    ): void;
    /**
     * @param callback Listener whose registration status shall be tested.
     */
    hasListener(listener: T): boolean;
    /**
     * Unregisters currently registered rules.
     * @param ruleIdentifiers If an array is passed, only rules with identifiers contained in this array are unregistered.
     * @param callback Called when rules were unregistered.
     * If you specify the callback parameter, it should be a function that looks like this:
     * function() {...};
     */
    removeRules(ruleIdentifiers?: string[], callback?: () => void): void;
    /**
     * Unregisters currently registered rules.
     * @param callback Called when rules were unregistered.
     * If you specify the callback parameter, it should be a function that looks like this:
     * function() {...};
     */
    removeRules(callback?: () => void): void;
    /**
     * Registers rules to handle events.
     * @param rules Rules to be registered. These do not replace previously registered rules.
     * @param callback Called with registered rules.
     * If you specify the callback parameter, it should be a function that looks like this:
     * function(array of Rule rules) {...};
     * Parameter rules: Rules that were registered, the optional parameters are filled with values.
     */
    addRules(rules: Rule[], callback?: (rules: Rule[]) => void): void;
    /**
     * Deregisters an event listener callback from an event.
     * @param callback Listener that shall be unregistered.
     * The callback parameter should be a function that looks like this:
     * function() {...};
     */
    removeListener(listener: T): void;
    hasListeners(): boolean;
  }

  /** Description of a declarative rule for handling events. */
  export interface Rule {
    /** Optional. Optional priority of this rule. Defaults to 100.  */
    priority?: number;
    /** List of conditions that can trigger the actions. */
    conditions: any[];
    /** Optional. Optional identifier that allows referencing this rule.  */
    id?: string;
    /** List of actions that are triggered if one of the condtions is fulfilled. */
    actions: any[];
    /**
     * Optional.
     * Since Chrome 28.
     * Tags can be used to annotate rules and perform operations on sets of rules.
     */
    tags?: string[];
  }
}
