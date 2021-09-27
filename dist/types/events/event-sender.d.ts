import { Middleware } from 'redux';
/**
 * Creates a Redux middleware that posts Redux actions to the parent (container) window using the Browser's event system.
 *
 * @param actionsToSend array of types (strings) of actions to be sent to the parent window
 * @param targetOrigin the target origin (URL), defaults to the URL of the current window
 */
export declare const createParentEventSender: (actionsToSend: Array<string>, targetOrigin?: string) => Middleware;
/**
 * Creates a Redux middleware that posts Redux actions to a module (iframe) window using the Browser's event system.
 *
 * @param actionsToSend array of types (strings) of actions to be sent to the module window
 * @param iFrameId element id of the target iframe
 * @param targetOrigin the target origin (URL), defaults to the URL of the current window
 */
export declare const createModuleEventSender: (actionsToSend: Array<string>, iFrameId: string, targetOrigin?: string) => Middleware;
