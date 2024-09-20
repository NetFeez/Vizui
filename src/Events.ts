/**
 * @author NetFeez <netfeez.dev@gmail.com>.
 * @description Adds a class that manages events.
 * @module vizui
 * @license Apache-2.0
 */
export class Events {
    private listeners: Events.ListenerList = new Map();
    /**
     * Adds an event to the EventManager.
     * @param name The name of the event.
     * @param callback The callback that will be executed.
     */
    public on(name: string, callback: Events.CallBack): void {
        if (!this.listeners.has(name)) this.listeners.set(name, new Set());
        this.listeners.get(name)?.add(callback);
    }
    /**
     * Removes an event from the EventManager.
     * @param name The name of the event to remove.
     * @param callback The callback of the event to remove.
     */
    public off(name: string, callback: Events.CallBack): void {
        if (!this.listeners.has(name)) return;
        if (!this.listeners.get(name)?.has(callback)) return;
        this.listeners.get(name)?.delete(callback);
    }
    /**
     * Removes all callbacks from an event.
     * @param name The name of the event from which the callbacks will be removed.
     */
    public offAll(name: string): void {
        if (!this.listeners.has(name)) return;
        this.listeners.delete(name);
    }
    /**
     * Executes an event.
     * @param name The name of the event to execute.
     * @param args The arguments that will be passed to the callbacks.
     */
    protected dispatch(name: string, ...args: any[]): void {
        if (!this.listeners.has(name)) return;
        this.listeners.get(name)?.forEach((callback) => callback(...args));
    }
    /**
     * Returns the number of callbacks of an event.
     * @param name The name of the event.
     * @returns The number of callbacks of the event.
     */
    protected eventCount(name: string): number {
        if (!this.listeners.has(name)) return 0;
        const events = this.listeners.get(name);
        if (!events) return 0;
        return events.size;
    }
}
export namespace Events {
    export type CallBack = (...args: any[]) => void;
    export type ListenerList = Map<string, Set<CallBack>>;
}
export default Events;