import { Store } from 'redux';
/**
 * Storage type
 */
export declare enum StorageType {
    /**
     * Use session storage (cleared if window closes)
     */
    SESSION = 0,
    /**
     * Use use local storage (persistent)
     */
    LOCAL = 1
}
/**
 * Storage options
 */
declare type StorageOptions = {
    /**
     * Name of the top-level key of the global storage
     */
    rootKey?: string;
    /**
     * Storage type to use, either LOCAL (persistent) or SESSION (cleared if window closes)
     */
    storageType?: StorageType;
};
/**
 * Reads the Redux store content from local or session storage. Returns undefined if no state exists.
 *
 * @param keys array of Redux top-level keys to load
 * @param options storage options (which default to rootKey: 'state' and storage: SESSION)
 * @param verbose boolean that logs loaded state to console if true
 */
export declare const getStoredState: (keys: Array<string>, options?: StorageOptions, verbose?: boolean) => Object | undefined;
/**
 * Subscribes to the given Redux store and copies all substates matching one of the keys to local or session storage.
 *
 * @param store a Redux store
 * @param keys array of Redux top-level keys to save
 * @param options storage options (which default to rootKey: 'state' and storage: SESSION)
 */
export declare const installStorageWriter: (store: Store, keys: Array<string>, options?: StorageOptions) => void;
export {};
