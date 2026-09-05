/**
 * @author NetFeez <netfeez.dev@gmail.com>
 * @description Typed reactive store with subscription and derived selection.
 * @license Apache-2.0
 */

import { Events } from '../../events/Events.js';

export class Store<State> extends Events<Store.EventMap<State>> {
    private vState: State;
    private vDestroyed = false;

    public constructor(initialState: State) { super(); this.vState = initialState; }

    /** The current state. */
    public get state(): State { return this.vState; }

    /**
     * Sets a new state, notifying subscribers.
     * @param state The new state.
     * @returns This store.
     */
    public set(state: State): this {
        this.assertNotDestroyed();
        this.vState = state;
        this.emit('change', this.vState);
        return this;
    }

    /**
     * Sets a new state only if it differs from the current state, notifying subscribers.
     * @param state The new state.
     * @returns This store.
     */
    public smartSet(state: Store.StateAction<State>): this {
        this.assertNotDestroyed();
        const value = state(this.vState);
        if (!Object.is(value, this.vState)) this.set(value);
        return this;
    }

    /**
     * Updates the state with a deep partial patch, merging it into the current state.
     * @param patch The partial state to merge.
     * @returns This store.
     */
    public deepUpdate(patch: Store.DeepPartial<State>): this {
        this.assertNotDestroyed();
        return this.smartSet((previous) => Store.deepMerge(previous, patch));
    }

    /**
     * Subscribes to state changes.
     * @param listener The listener invoked with the new state.
     * @returns An unsubscribe function.
     */
    public subscribe(listener: Store.Listener<State>): Store.Unsubscribe {
        this.assertNotDestroyed();
        this.on('change', listener);
        return () => this.off('change', listener);
    }

    /**
     * Derives a store that projects a slice of this store's state.
     * @param selector The projection function.
     * @param equal The equality function to determine if the selected value has changed.
     * @returns A derived store.
     */
    public select<Selected>(selector: Store.Selector<State, Selected>, equal: Store.Equal<Selected> = Object.is): Store<Selected> {
        this.assertNotDestroyed();
        const derived = Store.create(selector(this.vState));
        const handler = (state: State): void => {
            const selected = selector(state);
            if (!equal(selected, derived.state)) derived.set(selected);
        }
        this.subscribe(handler);
        this.once('destroy', () => derived.destroy());
        derived.once('destroy', () => this.off('change', handler));
        return derived;
    }

    /** Destroys this store, notifying subscribers and preventing further use. */
    public destroy(): void {
        if (this.vDestroyed) throw new Error('Store is already destroyed');
        this.vDestroyed = true;
        this.emit('destroy');
        this.offAll('change');
    }

    /**
     * Asserts that this store is not destroyed, throwing an error if it is.
     * @throws Error if the store is destroyed.
     */
    private assertNotDestroyed(): asserts this is Store<State> { if (this.vDestroyed) throw new Error('Store is destroyed'); }

    /**
     * Creates a store holding an initial state.
     * @param initialState The initial state.
     * @returns A new store.
     */
    public static create<State>(initialState: State): Store<State> { return new Store(initialState); }
    /**
     * Merges a deep partial source into a target without mutating either, producing a new value.
     * @param target The value to merge into.
     * @param source The partial patch to merge.
     * @returns The merged value.
     */
    private static deepMerge<Value>(target: Value, source: Store.DeepPartial<Value>): Value {
        const patch = source as Record<string, unknown>;
        const result = Array.isArray(target) ? [...target] : { ...(target as object) };
        const record = result as Record<string, unknown>;
        for (const key in patch) {
            const value = patch[key];
            if (value && typeof value === 'object') {
                const current = record[key];
                record[key] = Store.deepMerge<unknown>(current && typeof current === 'object' ? current : {}, value);
            } else record[key] = value;
        }
        return result as Value;
    }
}

export namespace Store {
    export type EventMap<State> = {
        change: [state: State];
        destroy: [];
    };
    export type DeepPartial<Value> = Value extends Function ? Value
        : Value extends object ? { [Key in keyof Value]?: DeepPartial<Value[Key]> }
        : Value;
    export type Equal<State> = (a: State, b: State) => boolean;
    export type Unsubscribe = () => void;
    export type Selector<State, Selected> = (state: State) => Selected;
    export type Listener<State> = (state: State) => void;
    export type StateAction<State> = (prev: State) => State;
}
export default Store;
