export declare type WindowSelector = () => Window | null;
/**
 * Function selects the parent window.
 */
export declare const parentWindowSelector: WindowSelector;
/**
 * Creates a selector for the content window of an iframe with the given id.
 * Returns null if no such iframe was found.
 */
export declare const createIframeContentWindowSelector: (iFrameId: string) => WindowSelector;
