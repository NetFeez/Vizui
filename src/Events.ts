/**
 * @author NetFeez <netfeez.dev@gmail.com>.
 * @description Adds a class that manages events.
 * @module vizui
 * @license Apache-2.0
 */
export class Events {
    private listeners: Events.ListenerList = new Map();
    private onceListeners: Events.ListenerList = new Map();
    /**
     * Adds an event to the EventManager.
     * @param name The name of the event.
     * @param callback The callback that will be executed.
     */
    public on(name: string, callback: Events.CallBack): void {
        const listeners = this.listeners.get(name) ?? new Set();
        listeners.add(callback);
        this.listeners.set(name, listeners);
    }
    /**
     * Adds an once event to the EventManager.
     * @param name The name of the event.
     * @param callback The callback that will be executed.
     */
    public once(name: string, callback: Events.CallBack): void {
        const listeners = this.onceListeners.get(name) ?? new Set();
        listeners.add(callback);
        this.onceListeners.set(name, listeners);
    }
    /**
     * Removes an event from the EventManager.
     * @param name The name of the event to remove.
     * @param callback The callback of the event to remove.
     */
    public off(name: string, callback: Events.CallBack): void {
        const listenerList = this.listeners.get(name);
        if (!listenerList) return;
        listenerList.delete(callback);
    }
    /**
     * Removes an once event from the EventManager.
     * @param name The name of the event to remove.
     * @param callback The callback of the event to remove.
     */
    public offOnce(name: string, callback: Events.CallBack): void {
        const listenerList = this.onceListeners.get(name);
        if (!listenerList) return;
        listenerList.delete(callback);
    }
    /**
     * Removes all listeners from an event.
     * @param name The name of the event from which the callbacks will be removed.
     */
    public offAll(name: string): void {
        this.listeners.delete(name);
    }
    /**
     * Removes all listeners from an once event.
     * @param name The name of the event from which the callbacks will be removed.
     */
    public offAllOnce(name: string): void {
        this.onceListeners.delete(name);
    }
    /**
     * Executes an event.
     * @param name The name of the event to execute.
     * @param args The arguments that will be passed to the callbacks.
     */
    protected dispatch(name: string, ...args: any[]): void {
        const listeners = this.listeners.get(name);
        const onceListeners = this.onceListeners.get(name);
        if (listeners) listeners.forEach(listener => listener(...args));
        if (onceListeners) onceListeners.forEach(listener => listener(...args));
    }
    /**
     * Returns the number of callbacks of an event.
     * @param name The name of the event.
     * @returns The number of callbacks of the event.
     */
    protected eventCount(name: string): number {
        const listenerCount = this.listeners.get(name)?.size ?? 0;
        const onceCount     = this.onceListeners.get(name)?.size ?? 0;
        return listenerCount + onceCount;
    }
}
export namespace Events {
    export type CallBack = (...args: any[]) => void;
    export type ListenerList = Map<string, Set<CallBack>>;
}
export default Events;