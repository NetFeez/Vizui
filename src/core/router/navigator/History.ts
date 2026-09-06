/**
 * @author NetFeez <netfeez.dev@gmail.com>.
 * @description Browser/in-memory navigation history for the SPA router. Keeps a
 * stack of parsed URL entries (path/search/hash) in parallel with the host
 * location, so hash mode stays correct even when a path-mode deep link lands on
 * the app (historyApiFallback scenario). Host changes (popstate/hashchange, or
 * in-memory back/forward) are merged back into the stack on `change`.
 * @license Apache-2.0
 */

import Events from '../../../events/Events.js';

export class History extends Events<History.EventMap> {
    /** The navigation mode derived from the host or the options. **/
    public readonly mode: History.Mode;

    /** The navigation host backing this history. **/
    public readonly host: History.Host;

    /** The parsed entries of the navigation stack. **/
    protected vEntries: History.Entry[] = [];

    /** The cursor pointing at the current entry. **/
    protected vIndex = -1;

    /** The last host location merged, used to detect real changes. **/
    protected vPath: string | null = null;

    /**
     * Creates a history bound to a navigation host.
     * @param host - The navigation host, DOM or memory.
     * @param options - The history options.
     */
    public constructor(host: History.Host, options: History.Options = {}) { super();
        this.host = host;
        this.mode = options.mode ?? host.mode ?? History.modeOf(host.location.path);
        host.onChanged((state) => this.handleHostChange(state));
    }

    /** The parsed entries of the navigation stack. **/
    public get entries(): History.Entry[] { return [...this.vEntries]; }

    /** The cursor pointing at the current entry. **/
    public get index(): number { return this.vIndex; }

    /** The current entry, or null when the stack is empty. **/
    public get current(): History.Entry | null { return this.vIndex >= 0 ? this.vEntries[this.vIndex] ?? null : null; }

    /** Whether there is an entry before the current one. **/
    public get hasPrevious(): boolean { return this.vIndex > 0; }

    /** Whether there is an entry after the current one. **/
    public get hasNext(): boolean { return this.vIndex >= 0 && this.vIndex < this.vEntries.length - 1; }

    /**
     * Registers a navigation on the stack and pushes/replaces it on the host.
     * Does not emit `change` (the router drives its own routing for programmatic
     * navigation`s); emits `navigate` with the parsed entry.
     * @param value - The target url.
     * @param action - Whether the navigation pushes or replaces the current entry.
     * @param state - Optional custom state persisted with the history entry.
     * @returns The parsed entry registered on the stack.
     */
    public navigate(value: string, action: History.Action = 'push', state?: unknown): History.Entry {
        const entry = History.parse(value, state);
        if (action === 'replace') {
            if (this.vIndex === -1) {
                this.vEntries = [entry];
                this.vIndex = 0;
            } else this.vEntries[this.vIndex] = entry;
            this.host.replace(History.stringify(entry), state);
        } else {
            this.vEntries = [...this.vEntries.slice(0, this.vIndex + 1), entry];
            this.vIndex = this.vEntries.length - 1;
            this.host.push(History.stringify(entry), state);
        }
        this.emit('navigate', entry);
        return entry;
    }

    /** Asks the host to go back (hashchange/popstate → `change`). **/
    public back(): void { this.host.back(); }

    /** Asks the host to go forward (hashchange/popstate → `change`). **/
    public forward(): void { this.host.forward(); }

    /** Re-reads the host location, merging it into the current stack. **/
    public refresh(): void { this.handleHostChange(); }

    /**
     * Merges an external host location change (back/forward/refresh) into the stack.
     * @param state - The custom state delivered by the host, when present.
     */
    protected handleHostChange(state?: unknown): void {
        const entry = History.parse(this.host.location.path, state);
        if (this.vPath === this.host.location.path) return;
        this.vPath = this.host.location.path;
        const index = this.findPath(entry.path, this.vIndex);
        if (index >= 0) {
            this.vEntries = this.vEntries.slice(0, index + 1);
            this.vEntries[index] = entry;
            this.vIndex = index;
        } else {
            this.vEntries = [...this.vEntries.slice(0, this.vIndex + 1), entry];
            this.vIndex = this.vEntries.length - 1;
        }
        this.emit('change', entry);
    }

    /**
     * Finds the stack index holding a path, starting at a cursor and probing
     * outwards in both directions.
     * @param path - The path to locate.
     * @param from - The cursor to start from.
     * @returns The index holding the path, or -1 when absent.
     */
    protected findPath(path: string, from: number): number {
        if (
            from >= 0 && from < this.vEntries.length &&
            this.vEntries[from] && this.vEntries[from].path === path
        ) return from;
        for (let index = from - 1; index >= 0; index--) if (this.vEntries[index]?.path === path) return index;
        for (let index = from + 1; index < this.vEntries.length; index++) if (this.vEntries[index]?.path === path) return index;
        return -1;
    }

    // ========== Parsing ==========

    /**
     * Splits a raw navigation value into path, search and hash parts.
     * @param value - The raw navigation value.
     * @returns The parsed parts.
     */
    public static split(value: string): History.Parts {
        const hashIndex = value.indexOf('#');
        const hash = hashIndex >= 0 ? value.slice(hashIndex + 1) : '';
        const origin = hashIndex >= 0 ? value.slice(0, hashIndex) : value;
        const queryIndex = origin.indexOf('?');
        const search = queryIndex >= 0 ? origin.slice(queryIndex) : '';
        const path = (queryIndex >= 0 ? origin.slice(0, queryIndex) : origin) || '/';
        return { path, search, hash };
    }

    /**
     * Normalizes a path: guarantees a single leading slash and no trailing one.
     * @param path - The raw path.
     * @returns The normalized path.
     */
    public static normalize(path: string): string {
        let normalized = path.startsWith('/') ? path : `/${path}`;
        normalized = normalized.replace(/\/+/g, '/');
        if (normalized.length > 1 && normalized.endsWith('/')) normalized = normalized.slice(0, -1);
        return normalized;
    }

    /**
     * Parses a raw navigation value into a history entry.
     * @param value - The raw navigation value.
     * @param state - The custom state persisted with the entry.
     * @returns The parsed entry.
     */
    public static parse(value: string, state?: unknown): History.Entry {
        const { path, search, hash } = this.split(value);
        const entry: History.Entry = { path: this.normalize(path), search, hash };
        if (state !== undefined) entry.state = state;
        return entry;
    }

    /**
     * Normalizes the path portion of a raw navigation value (query/hash stripped).
     * @param value - The raw navigation value.
     * @returns The normalized path.
     */
    public static path(value: string): string {
        return this.normalize(this.split(value).path);
    }

    /**
     * Serializes a history entry back into a navigation value.
     * @param entry - The entry to serialize.
     * @returns The serialized value.
     */
    public static stringify(entry: History.Entry): string {
        return `${entry.path}${entry.search}${entry.hash ? `#${entry.hash}` : ''}`;
    }

    /**
     * Derives the navigation mode from a raw location value.
     * @param path - The raw location value.
     * @returns The navigation mode.
     */
    public static modeOf(path: string): History.Mode {
        return path.startsWith('#') ? 'hash' : 'path';
    }

    /**
     * Creates the browser history host.
     * @param options - The adapter options.
     * @returns The browser history host.
     */
    public static dom(options?: History.Adapter.Options): History.Host { return new History.Adapter(options); }

    /**
     * Creates an in-memory history host.
     * @param initial - The initial path of the stack.
     * @returns The in-memory history host.
     */
    public static memory(initial = '/'): History.Host { return new History.Memory(initial); }
}

export namespace History {
    /** The navigation modes of a history. **/
    export type Mode = 'path' | 'hash';

    /** The host actions a navigation can perform. **/
    export type Action = 'push' | 'replace';

    /** The options of a history. **/
    export interface Options { mode?: History.Mode; }

    /** The raw parts of a navigation value. **/
    export interface Parts { path: string; search: string; hash: string; }

    /** A parsed navigation entry of the stack. **/
    export interface Entry {
        path: string;

        /** Raw query string including a leading `?` when present, otherwise ''. **/
        search: string;

        /** Fragment without the leading `#`, otherwise ''. **/
        hash: string;

        /** Custom state persisted with the entry, when present. **/
        state?: unknown;
    }

    /** The contract a navigation host implements: DOM or memory. **/
    export interface Host {
        /** The current location of the host. **/
        readonly location: Host.Location;

        /** The navigation mode, when the host declares one. **/
        readonly mode?: History.Mode;

        /** Pushes a url onto the host history. **/
        push(url: string, state?: unknown): void;

        /** Replaces the current url of the host history. **/
        replace(url: string, state?: unknown): void;

        /** Goes back in the host history. **/
        back(): void;

        /** Goes forward in the host history. **/
        forward(): void;

        /** Subscribes to host location changes; returns the unsubscribe function. **/
        onChanged(listener: (state?: unknown) => void): () => void;
    }

    export namespace Host {
        /** The location value a host exposes. **/
        export interface Location { path: string; }
    }

    /** The events emitted by a history. **/
    export type EventMap = {
        /** A programmatic navigation was registered on the stack. **/
        navigate: [entry: History.Entry];

        /** The host location changed externally (back/forward/refresh). **/
        change: [entry: History.Entry];
    };

    export class Adapter implements History.Host {
        /** The navigation mode resolved at construction time. **/
        public readonly mode: History.Mode;

        /** The domain path under which the hash lives in hash mode. **/
        protected vBase: string;

        /** The listeners notified on host location changes. **/
        protected vListeners = new Set<(state?: unknown) => void>();

        /**
         * Creates the browser host. `path` mode reads/writes `location.pathname`;
         * `hash` mode reads/writes the fragment, falling back to a path-mode deep
         * link when the hash is empty (historyApiFallback).
         * @param options - The adapter options.
         */
        public constructor(options: History.Adapter.Options = {}) {
            if (typeof window === 'undefined') throw new Error('[History.Adapter] The DOM adapter requires a browser environment.');
            this.vBase = options.base ?? '';
            const hashPresent = window.location.hash.length > 1;
            this.mode = options.mode ?? (hashPresent ? 'hash' : 'path');
            window.addEventListener('popstate', this.handle);
            if (this.mode === 'hash') window.addEventListener('hashchange', this.handle);
        }

        /** The current location of the host. **/
        public get location(): History.Host.Location {
            return { path: this.resolve() };
        }

        /**
         * Pushes a url onto the host history.
         * @param url - The url to push.
         * @param state - The custom state persisted with the entry.
         */
        public push(url: string, state?: unknown): void {
            if (this.mode === 'hash') {
                const target = `${this.vBase}#${url}`;
                if (window.location.pathname + window.location.search !== this.vBase) {
                    window.history.replaceState(state ?? null, '', target);
                    return;
                }
                window.history.pushState(state ?? null, '', target);
                return;
            }
            window.history.pushState(state ?? null, '', url);
        }

        /**
         * Replaces the current url of the host history.
         * @param url - The url to write.
         * @param state - The custom state persisted with the entry.
         */
        public replace(url: string, state?: unknown): void {
            window.history.replaceState(state ?? null, '', this.mode === 'hash' ? `${this.vBase}#${url}` : url);
        }

        /** Goes back in the host history. **/
        public back(): void { window.history.back(); }

        /** Goes forward in the host history. **/
        public forward(): void { window.history.forward(); }

        /**
         * Subscribes to host location changes.
         * @param listener - The listener notified with the host state.
         * @returns The unsubscribe function.
         */
        public onChanged(listener: (state?: unknown) => void): () => void {
            this.vListeners.add(listener);
            return () => { this.vListeners.delete(listener); };
        }

        /** Notifies every subscribed listener with the host state. **/
        protected handle = (): void => {
            const state = window.history.state;
            for (const listener of Array.from(this.vListeners)) listener(state);
        };

        /**
         * Reads the current location from the browser.
         * @returns The raw location value.
         */
        protected resolve(): string {
            if (this.mode === 'hash') {
                const hash = window.location.hash.slice(1);
                if (hash) return hash;
            }
            return window.location.pathname + window.location.search;
        }
    }

    export namespace Adapter {
        /** The options of the browser host. **/
        export interface Options {
            /** The navigation mode; derived from the location when omitted. **/
            mode?: History.Mode;

            /** Domain path under which the hash lives in hash mode (e.g. '/app'). **/
            base?: string;
        }
    }

    export class Memory implements History.Host {
        /** The current location of the host. **/
        public readonly location: History.Host.Location;

        /** The listeners notified on host location changes. **/
        protected vListeners = new Set<(state?: unknown) => void>();

        /** The url stack. **/
        protected vStack: string[];

        /** The custom state of each stack entry. **/
        protected vStates: unknown[];

        /** The cursor pointing at the current stack entry. **/
        protected vCursor: number;

        /**
         * Creates an in-memory host for tests and non-DOM environments.
         * @param initial - The initial path of the stack.
         */
        public constructor(initial: string = '/') {
            this.vStack = [initial];
            this.vStates = [];
            this.vCursor = 0;
            this.location = { path: initial };
        }

        /** The navigation mode; always `path` in memory. **/
        public get mode(): History.Mode { return 'path'; }

        /**
         * Pushes a url onto the host history.
         * @param url - The url to push.
         * @param state - The custom state persisted with the entry.
         */
        public push(url: string, state?: unknown): void {
            this.location.path = url;
            this.vStack = [...this.vStack.slice(0, this.vCursor + 1), url];
            this.vStates = [...this.vStates.slice(0, this.vCursor + 1), state];
            this.vCursor = this.vStack.length - 1;
        }

        /**
         * Replaces the current url of the host history.
         * @param url - The url to write.
         * @param state - The custom state persisted with the entry.
         */
        public replace(url: string, state?: unknown): void {
            this.location.path = url;
            this.vStack[this.vCursor] = url;
            this.vStates[this.vCursor] = state;
        }

        /** Goes back in the host history. **/
        public back(): void {
            if (this.vCursor <= 0) return;
            this.vCursor -= 1;
            this.location.path = this.vStack[this.vCursor];
            this.notify(this.vStates[this.vCursor]);
        }

        /** Goes forward in the host history. **/
        public forward(): void {
            if (this.vCursor >= this.vStack.length - 1) return;
            this.vCursor += 1;
            this.location.path = this.vStack[this.vCursor];
            this.notify(this.vStates[this.vCursor]);
        }

        /**
         * Subscribes to host location changes.
         * @param listener - The listener notified with the host state.
         * @returns The unsubscribe function.
         */
        public onChanged(listener: (state?: unknown) => void): () => void {
            this.vListeners.add(listener);
            return () => { this.vListeners.delete(listener); };
        }

        /**
         * Notifies every subscribed listener with the host state.
         * @param state - The custom state to deliver.
         */
        protected notify(state?: unknown): void { for (const listener of Array.from(this.vListeners)) listener(state); }
    }
}

export default History;