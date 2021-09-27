import { Store } from 'redux';
/**
 * Assigns the Redux store to the window object under the given name.
 *
 * @param store the Redux store object
 * @param globalName the global name of the Redux store
 */
export declare function makeStoreGlobal(store: Store, globalName?: string): void;
