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
    private mutationCount(): number {
        let count = 0;
        count += this.eventCount('add');
        count += this.eventCount('remove');
        return count;
    }
    private intersectionCount(): number {
        let count = 0;
        count += this.eventCount('add');
        count += this.eventCount('remove');
        return count;
    }
    private handleMutation(mutations: MutationRecord[]) {
        for (const mutation of mutations) {
            if (mutation.type !== 'childList') continue;
            if ([...mutation.addedNodes].some((node) => node.contains(this.element.HTMLElement))) {
                this.dispatch('add', this.element);
            }
            if ([...mutation.removedNodes].some((node) => node.contains(this.element.HTMLElement))) {
                this.dispatch('remove', this.element);
            }
        }
    }
    private handleIntersection(entries: IntersectionObserverEntry[]) {
        for (const entry of entries) {
            if (entry.isIntersecting) this.dispatch('visible', this.element);
            else this.dispatch('hidden', this.element);
        }
    }
    private isMutationEvent(type: DomObserver.Type): boolean {
        return type === 'add' || type === 'remove';
    }
    private isIntersectionEvent(type: DomObserver.Type): boolean {
        return type === 'visible' || type === 'hidden';
    }
    public on(type: DomObserver.Type, listener: DomObserver.Listener<T>) {
        super.on(type, listener);
        if (this.isMutationEvent(type)) {
            if (!this.mutation) {
                this.mutation = new MutationObserver(this.handleMutation.bind(this));
                this.mutation.observe(document, { subtree: true, childList: true });
            }
        } else if (this.isIntersectionEvent(type)) {
            if (!this.intersection) this.intersection = new IntersectionObserver(this.handleIntersection.bind(this));
            this.intersection.observe(this.element.HTMLElement);
        }
    }
    public off(type: DomObserver.Type, listener: DomObserver.Listener<T>) {
        super.off(type, listener);
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