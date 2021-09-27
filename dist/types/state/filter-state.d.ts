export declare type IndexedObject = {
    [key: string]: any;
};
/**
 * Returns a shallow copy of the passed state object containing only the properties whose keys are given as second argument.
 * Returns undefined if keys are given, but none applies.
 *
 * @param state the Redux state object to filter
 * @param keys an array of property names to copy
 */
export declare const filterState: (state: IndexedObject | undefined, keys: Array<string>) => Object | undefined;
