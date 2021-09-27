'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * Function selects the parent window.
 */
var parentWindowSelector = function () { return window.parent; };
/**
 * Creates a selector for the content window of an iframe with the given id.
 * Returns null if no such iframe was found.
 */
var createIframeContentWindowSelector = function (iFrameId) {
    return function () {
        var element = document.getElementById(iFrameId);
        if (element) {
            var iframe = element;
            if (iframe.contentWindow) {
                return iframe.contentWindow;
            }
        }
        return null;
    };
};

/**
 * Marker to monkey-patch actions received via postMessage events.
 * Such actions will not be sent again by the event-sender middleware to avoid cycles.
 * Instead, the event-sender middleware will delete the marker.
 */
var EVENT_MARKER = '__redux_iframe_event__';

/**
 * Creates a Redux middleware that posts Redux actions to the parent (container) window using the Browser's event system.
 *
 * @param actionsToSend array of types (strings) of actions to be sent to the parent window
 * @param targetOrigin the target origin (URL), defaults to the URL of the current window
 */
var createParentEventSender = function (actionsToSend, targetOrigin) {
    if (targetOrigin === void 0) { targetOrigin = window.location.href; }
    return (createEventSenderMiddleware(parentWindowSelector, actionsToSend, targetOrigin));
};
/**
 * Creates a Redux middleware that posts Redux actions to a module (iframe) window using the Browser's event system.
 *
 * @param actionsToSend array of types (strings) of actions to be sent to the module window
 * @param iFrameId element id of the target iframe
 * @param targetOrigin the target origin (URL), defaults to the URL of the current window
 */
var createModuleEventSender = function (actionsToSend, iFrameId, targetOrigin) {
    if (targetOrigin === void 0) { targetOrigin = window.location.href; }
    return (createEventSenderMiddleware(createIframeContentWindowSelector(iFrameId), actionsToSend, targetOrigin));
};
/**
 * Creates a Redux middleware that posts Redux actions to a window (parent, iframe content window) using the Browser's event system.
 *
 * @param windowSelector function that returns the target window for the message
 * @param actionsToSend array of types (strings) of actions to be sent to the target window
 * @param targetOrigin the target origin (URL), defaults to the URL of the current window
 * @param verbose boolean that logs sent message to console if true
 */
var createEventSenderMiddleware = function (windowSelector, actionsToSend, targetOrigin, verbose) {
    if (verbose === void 0) { verbose = false; }
    return function (store) {
        return function (next) {
            return function (action) {
                if (action[EVENT_MARKER]) {
                    // This marker is set by the event lister.
                    // Such actions are not sent again to avoid cycles.
                    delete action[EVENT_MARKER];
                }
                else if (actionsToSend.includes(action.type)) {
                    var targetWindow = windowSelector();
                    if (targetWindow) { // Target window (iframe) may not be loaded at the moment
                        var message = JSON.stringify(action);
                        if (verbose)
                            console.log('Sending message', message);
                        targetWindow.postMessage(message, targetOrigin);
                    }
                }
                next(action);
            };
        };
    };
};

/**
 * Installs an event handler that creates Redux actions from received events and dispatches them.
 *
 * @param store the Redux store
 * @param acceptedActions array of types (strings) of accepted actions
 * @param options parameters to control the event listener
 */
var installEventListener = function (store, acceptedActions, options) {
    if (options === void 0) { options = { addMarker: true, verbose: false }; }
    window.addEventListener('message', function (event) {
        if (options.verbose)
            console.log('Received message', event.data);
        try {
            var action = JSON.parse(event.data);
            if (action.type && acceptedActions.includes(action.type)) {
                if (options.addMarker) {
                    // Set a marker recognized (and removed) by the event-sender middleware.
                    // The marker avoids resending of actions received as events.
                    action[EVENT_MARKER] = true;
                }
                store.dispatch(action);
            }
        }
        catch (_a) {
            // Ignore non-JSON messages
        }
    });
};

/**
 * Returns a shallow copy of the passed state object containing only the properties whose keys are given as second argument.
 * Returns undefined if keys are given, but none applies.
 *
 * @param state the Redux state object to filter
 * @param keys an array of property names to copy
 */
var filterState = function (state, keys) {
    var result;
    if (state) {
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            if (key in state) {
                if (!result) {
                    result = {};
                }
                result[key] = state[key];
            }
        }
    }
    return result;
};

var ROOT_KEY = 'redux-iframe-state';
/**
 * Storage type
 */
exports.StorageType = void 0;
(function (StorageType) {
    /**
     * Use session storage (cleared if window closes)
     */
    StorageType[StorageType["SESSION"] = 0] = "SESSION";
    /**
     * Use use local storage (persistent)
     */
    StorageType[StorageType["LOCAL"] = 1] = "LOCAL";
})(exports.StorageType || (exports.StorageType = {}));
var DEFAULT_STORAGE_OPTIONS = {
    rootKey: ROOT_KEY,
    storageType: exports.StorageType.SESSION
};
/**
 * Reads the Redux store content from local or session storage. Returns undefined if no state exists.
 *
 * @param keys array of Redux top-level keys to load
 * @param options storage options (which default to rootKey: 'state' and storage: SESSION)
 * @param verbose boolean that logs loaded state to console if true
 */
var getStoredState = function (keys, options, verbose) {
    if (options === void 0) { options = DEFAULT_STORAGE_OPTIONS; }
    if (verbose === void 0) { verbose = false; }
    var storage = getStorage(options.storageType || exports.StorageType.SESSION);
    if (storage) {
        try {
            var serializedState = storage.getItem(options.rootKey || ROOT_KEY);
            if (serializedState === null) {
                // If no state was stored previously, tell the store constructor that no initial state exists
                return undefined;
            }
            var filteredState = filterState(JSON.parse(serializedState), keys);
            if (verbose)
                console.log('Loaded state from storage:', filteredState);
            return filteredState;
        }
        catch (err) {
            console.warn('Cannot read from storage:', err);
        }
    }
};
/**
 * Subscribes to the given Redux store and copies all substates matching one of the keys to local or session storage.
 *
 * @param store a Redux store
 * @param keys array of Redux top-level keys to save
 * @param options storage options (which default to rootKey: 'state' and storage: SESSION)
 */
var installStorageWriter = function (store, keys, options) {
    if (options === void 0) { options = DEFAULT_STORAGE_OPTIONS; }
    var memoizedState;
    store.subscribe(function () {
        var state = filterState(store.getState(), keys);
        if (state && hasChanged(memoizedState, state)) {
            if (saveState(state, options)) {
                memoizedState = state;
            }
        }
    });
};
var getStorage = function (storageType) {
    switch (storageType) {
        case exports.StorageType.LOCAL:
            if (!window.localStorage) {
                console.warn('Local storage is not supported');
                return undefined;
            }
            return window.localStorage;
        case exports.StorageType.SESSION:
            if (!window.sessionStorage) {
                console.warn('Session storage is not supported');
                return undefined;
            }
            return window.sessionStorage;
    }
};
/**
 * Saves the state of the Redux store to local or session storage.
 *
 * @param state the Redux state object
 * @param options storage options (which default to rootKey: 'state' and storage: SESSION)
 * @param verbose boolean that logs saved state to console if true
 * @return true if storing succeeded, false otherwise
 */
var saveState = function (state, options, verbose) {
    if (verbose === void 0) { verbose = false; }
    var storage = getStorage(options.storageType || exports.StorageType.SESSION);
    if (storage) {
        try {
            if (state) {
                if (verbose)
                    console.log('Saved state to storage:', state);
                storage.setItem(options.rootKey || ROOT_KEY, JSON.stringify(state));
                return true;
            }
        }
        catch (err) {
            console.warn('Cannot write to storage:', err);
        }
    }
    return false;
};
var hasChanged = function (memoizedState, state) {
    for (var key in state) {
        if (!memoizedState || memoizedState[key] !== state[key]) {
            return true;
        }
    }
    return false;
};

/**
 * Assigns the Redux store to the window object under the given name.
 *
 * @param store the Redux store object
 * @param globalName the global name of the Redux store
 */
function makeStoreGlobal(store, globalName) {
    if (globalName === void 0) { globalName = 'ReduxStore'; }
    window[globalName] = store;
}

/**
 * Returns a shallow copy of the Redux state of the parent window for selected keys.
 * Returns undefined if no parent window exists.
 *
 * To use this functions, two requirements must be met:
 * - The module iframe and its parent window belong to the same domain. Otherwise the Browser will not provide a reference
 *   to the parent window.
 * - The parent's Redux state is immutable. Redux is designed for immutability and explicitly discourages state mutation, see
 *   https://redux.js.org/recipes/structuring-reducers/prerequisite-concepts#note-on-immutability-side-effects-and-mutation.
 *
 * TODO: Allow transferring the parent state via postMessage/addEventListener
 *
 * @param keys array of Redux top-level keys to copy from
 * @param globalName name of the global variable holding the Redux store
 * @param verbose boolean that logs loaded state to console if true
 * @return a slice of the store of the parent window or undefined if no parent window exists
 */
var getParentState = function (keys, globalName, verbose) {
    if (globalName === void 0) { globalName = 'ReduxStore'; }
    if (verbose === void 0) { verbose = false; }
    if (window.parent && typeof window.parent[globalName] === 'object') {
        var parentStore = window.parent[globalName];
        if (typeof parentStore.getState === 'function') {
            var parentState = parentStore.getState();
            var filteredState = filterState(parentState, keys);
            if (verbose)
                console.log('Loaded state from parent window:', filteredState);
            return filteredState;
        }
    }
    return undefined;
};

/**
 * Merges a list of Redux state objects (which may be undefined). Returns undefined if all arguments are undefined.
 * Therefore, the result of this function can always be passed as second argument to Redux.createStore().
 *
 * Main differences to Object.assign() are that combineState()
 * (1) does not modify its first argument,
 * (2) accepts undefined for all arguments.
 *
 * @param state the Redux state objects to combine
 * @return the combined Redux state objects or undefined if all arguments are undefined
 */
var combineState = function () {
    var state = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        state[_i] = arguments[_i];
    }
    return state.reduce(function (prev, curr) {
        if (prev || curr) {
            return Object.assign({}, prev, curr);
        }
        return undefined;
    }, undefined);
};

exports.combineState = combineState;
exports.createModuleEventSender = createModuleEventSender;
exports.createParentEventSender = createParentEventSender;
exports.getParentState = getParentState;
exports.getStoredState = getStoredState;
exports.installEventListener = installEventListener;
exports.installStorageWriter = installStorageWriter;
exports.makeStoreGlobal = makeStoreGlobal;
