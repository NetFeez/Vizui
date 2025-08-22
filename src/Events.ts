/**
 * @author NetFeez <netfeez.dev@gmail.com>.
 * @description Adds a class that manages events.
 * @module vizui
 * @license Apache-2.0
 */
export class Events<eventMap extends Events.EventMap = Events.EventMap> {
    private listeners: Events.ListenerList<eventMap> = {};
    private onceListeners: Events.ListenerList<eventMap> = {};
    /**
     * Adds an event to the EventManager.
     * @param name The name of the event.
     * @param listener The callback that will be executed.
     */
     public on<E extends string & keyof eventMap>(name: E, listener: eventMap[E]): void {
        const listeners = this.listeners[name] ?? new Set();
        listeners.add(listener);
        this.listeners[name] = listeners;
    }
    /**
     * Adds an once event to the EventManager.
     * @param name The name of the event.
     * @param callback The callback that will be executed.
     */
    public once<E extends string & keyof eventMap>(name: E, listener: eventMap[E]): void {
        const listeners = this.onceListeners[name] ?? new Set();
        listeners.add(listener);
        this.onceListeners[name] = listeners;
    }
    /**
     * Removes an event from the EventManager.
     * @param name The name of the event to remove.
     * @param listener The callback of the event to remove.
     */
    public off<E extends string & keyof eventMap>(name: E, listener: eventMap[E]): void {
        const listenerList = this.listeners[name];
        if (!listenerList) return;
        listenerList.delete(listener);
    }
    /**
     * Removes an once event from the EventManager.
     * @param name The name of the event to remove.
     * @param listener The callback of the event to remove.
     */
    public offOnce<E extends string & keyof eventMap>(name: E, listener: eventMap[E]): void {
        const listenerList = this.onceListeners[name];
        if (!listenerList) return;
        listenerList.delete(listener);
    }
    /**
     * Removes all listeners from an event.
     * @param name The name of the event from which the callbacks will be removed.
     */
    public offAll(name: string): void {
        delete this.listeners[name];
    }
    /**
     * Removes all listeners from an once event.
     * @param name The name of the event from which the callbacks will be removed.
     */
    public offAllOnce(name: string): void {
        delete this.onceListeners[name];
    }
    /**
     * Executes an event.
     * @param name The name of the event to execute.
     * @param args The arguments that will be passed to the callbacks.
     */
    protected emit<E extends string & keyof eventMap>(name: E, ...args: Parameters<eventMap[E]>): void {
        const listeners = this.listeners[name];
        const onceListeners = this.onceListeners[name];
        if (listeners) listeners.forEach(listener => listener(...args));
        if (onceListeners) onceListeners.forEach(listener => {
            listener(...args);
            onceListeners.delete(listener);
        });
    }
    /**
     * Returns the number of callbacks of an event.
     * @param name The name of the event.
     * @returns The number of callbacks of the event.
     */
    public eventCount(name: string): number {
        const listenerCount = this.listeners[name]?.size ?? 0;
        const onceCount     = this.onceListeners[name]?.size ?? 0;
        return listenerCount + onceCount;
    }
}
export class PublicEmitter<eventMap extends Events.EventMap = Events.EventMap> extends Events<eventMap> {
    public override emit<E extends string & keyof eventMap>(name: E, ...args: Parameters<eventMap[E]>): void {
        super.emit(name, ...args);
    }
}

export namespace Events {
    export type Listener = (...args: any[]) => void;
    export type ListenerList<eventMap extends EventMap> = {
        [name in keyof eventMap]?: Set<eventMap[name]>;
    }
    export interface EventMap {
        [name: string]: Listener;
    }
}
export default Events;