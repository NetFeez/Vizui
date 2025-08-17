/**
 * @author NetFeez <netfeez.dev@gmail.com>.
 * @description adds an observer to an element
 * @module vizui
 * @license Apache-2.0
 */

import Element from "./Element.js";
import Events from "./Events.js";

export class DomObserver<T extends Element> extends Events<{
    [name in DomObserver.Type]: DomObserver.Listener<T>
}> {
    public mutation: MutationObserver | null;
    public intersection: IntersectionObserver | null;
    public constructor(
        public readonly element: T
    ) { super();
        this.mutation = null;
        this.intersection = null;
    }
    /**
     * count total of mutation event listeners
     * @returns number of event listeners
    */
    private mutationCount(): number {
        let count = 0;
        count += this.eventCount('add');
        count += this.eventCount('remove');
        return count;
    }
    /**
     * count total of intersection event listeners
     * @returns number of event listeners
    */
    private intersectionCount(): number {
        let count = 0;
        count += this.eventCount('add');
        count += this.eventCount('remove');
        return count;
    }
    /**
     * use to handle mutation events
     * @param mutations list of mutations
    */
    private handleMutation(mutations: MutationRecord[]) {
        for (const mutation of mutations) {
            if (mutation.type !== 'childList') continue;
            if ([...mutation.addedNodes].some((node) => node.contains(this.element.root))) {
                this.emit('add', this.element);
            }
            if ([...mutation.removedNodes].some((node) => node.contains(this.element.root))) {
                this.emit('remove', this.element);
            }
        }
    }
    /**
     * use to handle intersection events
     * @param entries list of entries
    */
    private handleIntersection(entries: IntersectionObserverEntry[]) {
        for (const entry of entries) {
            if (entry.isIntersecting) this.emit('visible', this.element);
            else this.emit('hidden', this.element);
        }
    }
    /**
     * check if the event is a mutation event
     * @param type type of event
     * @returns true if the event is a mutation event
    */
    private isMutationEvent(type: DomObserver.Type): boolean {
        return type === 'add' || type === 'remove';
    }
    /**
     * check if the event is an intersection event
     * @param type type of event
     * @returns true if the event is an intersection event
    */
    private isIntersectionEvent(type: DomObserver.Type): boolean {
        return type === 'visible' || type === 'hidden';
    }
    /**
     * initialize observer if is not initialized
     * @param type the type of event to check
    */
    private initObservers(type: DomObserver.Type) {
        if (this.isMutationEvent(type)) {
            if (!this.mutation) {
                this.mutation = new MutationObserver(this.handleMutation.bind(this));
                this.mutation.observe(document, { subtree: true, childList: true });
            }
        } else if (this.isIntersectionEvent(type)) {
            if (!this.intersection) this.intersection = new IntersectionObserver(this.handleIntersection.bind(this));
            this.intersection.observe(this.element.root);
        }
    }
    /**
     * check if the type of observer not have events and disable the observer
     * @param type the type of event to check
    */
    private checkAndFinishObservers(type: DomObserver.Type) {
        if (this.isMutationEvent(type)) {
            if (this.mutationCount() === 0 && this.mutation) {
                this.mutation.disconnect();
                this.mutation = null;
            }
        } else if (this.isIntersectionEvent(type)) {
            if (this.intersectionCount() === 0 && this.intersection) {
                this.intersection.disconnect();
                this.intersection = null;
            }
        }
    }
    /**
     * Add an event listener to the observer.
     * @param type The type of event to listen for.
     * @param listener The callback function to execute when the event occurs.
     */
    public on(type: DomObserver.Type, listener: DomObserver.Listener<T>) {
        super.on(type, listener);
        this.initObservers(type);
    }
    /**
     * Add a one-time event listener to the observer.
     * @param type The type of event to listen for.
     * @param listener The callback function to execute when the event occurs.
     */
    public once(type: DomObserver.Type, listener: DomObserver.Listener<T>) {
        super.once(type, listener);
        this.initObservers(type);
    }
    /**
     * Remove an event listener from the observer.
     * @param type The type of event to remove the listener from.
     * @param listener The listener function to remove.
     */
    public off(type: DomObserver.Type, listener: DomObserver.Listener<T>) {
        super.off(type, listener);
        this.checkAndFinishObservers(type);
    }
    /**
     * Remove a one-time event listener from the observer.
     * @param type The type of event to remove the listener from.
     * @param listener The listener function to remove.
     */
    public offOnce(type: DomObserver.Type, listener: DomObserver.Listener<T>) {
        super.offOnce(type, listener);
        this.checkAndFinishObservers(type);
    }
    /**
     * Remove all event listeners of a specific type.
     * @param type The type of event to remove all listeners from.
     */
    public ofAll(type: DomObserver.Type) {
        super.offAll(type);
        this.checkAndFinishObservers(type);
    }
    /**
     * Remove all one-time event listeners of a specific type.
     * @param type The type of event to remove all listeners from.
     */
    public ofAllOnce(type: DomObserver.Type) {
        super.offAll(type);
        this.checkAndFinishObservers(type);
    }
}

export namespace DomObserver {
    export type Listener<T> = (element: T) => void;
    export type MutationType = 'add' | 'remove';
    export type IntersectionType = 'visible' | 'hidden';
    export type Type = MutationType | IntersectionType;
    export interface Rule<T extends Element> {
        type: Type;
        listener: Listener<T>;
        once: boolean;
        observer?: MutationObserver | IntersectionObserver;
    }
}

export default DomObserver;