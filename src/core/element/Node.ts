/**
 * @author NetFeez <netfeez.dev@gmail.com>.
 * @description Wraps a DOM Node with a fluent, typed API.
 * @license Apache-2.0
 */

import { NODE, APPENDABLE } from '../symbols.js';
import EventTracker from './EventTracker.js';
import Store from '../state/Store.js';

const REACTIVITY = Symbol('reactive-references');
const TRACKING = Symbol('tracker-references');

export class Node<T extends globalThis.Node = globalThis.Node> implements Node.IsAppendable {
    private static [REACTIVITY]: Node.Storage.Reactivity = new WeakMap();
    private static [TRACKING]: Node.Storage.Tracking = new WeakMap();

    /**
     * Gets the reactive map for a given DOM node, creating it if it doesn't exist.
     * @param node - The DOM node to get the reactive map for.
     * @returns A WeakMap that maps stores to their unsubscribe functions for the given node.
     *
     * @remarks
     * This method is used internally to manage reactive bindings between stores and DOM nodes. It ensures that each DOM node has its own reactive map, allowing for proper cleanup of subscriptions when nodes are removed from the DOM.
     */
    private static reactiveStorage(node: globalThis.Node): Node.Storage.Reactivity.Entry {
        const storage = Node[REACTIVITY];
        let map = storage.get(node);
        if (!map) storage.set(node, map = new WeakMap());
        return map;
    }

    /**
     * Gets the event tracker for a given DOM node, creating it if it doesn't exist.
     * @param node - The DOM node to get the event tracker for.
     * @returns An EventTracker instance that tracks event listeners for the given node.
     *
     * @remarks
     * This method is used internally to manage event listeners attached to DOM nodes. It ensures that each DOM node has its own event tracker, allowing for proper cleanup of event listeners when nodes are removed from the DOM.
     */
    private static trackerStorage(node: globalThis.Node): Node.Storage.Tracking.Entry {
        const storage = Node[TRACKING];
        let tracker = storage.get(node);
        if (!tracker) storage.set(node, tracker = new EventTracker());
        return tracker;
    }

    public readonly [APPENDABLE] = true;
    public readonly [NODE] = true;

    /** The wrapped DOM node. **/
    public readonly root: T;

    /** The event tracker for this node. **/
    private get tracker(): Node.Storage.Tracking.Entry { return Node.trackerStorage(this.root); }

    /** The reactive map for this node. **/
    private get reactive():Node.Storage.Reactivity.Entry { return Node.reactiveStorage(this.root); }

    /**
     * Wraps an existing DOM node.
     * @param node - The node to wrap.
     */
    public constructor(node: T) {
        if (!Node.isNative(node)) throw new Error('the node is not a Node');
        this.root = node;
    }

    /** Whether the node is attached to the document. **/
    public get isConnected(): boolean { return this.root.isConnected; }

    /** The parent node of this node. **/
    public get parent(): globalThis.Node | null { return this.root.parentNode; }

    /** The child nodes of this node. **/
    public get childNodes(): NodeListOf<globalThis.ChildNode> { return this.root.childNodes as NodeListOf<globalThis.ChildNode>; }

    /** The first child node of this node. **/
    public get firstChild(): globalThis.Node | null { return this.root.firstChild; }

    /** The last child node of this node. **/
    public get lastChild(): globalThis.Node | null { return this.root.lastChild; }

    /**
     * Appends one or more children to this node.
     * @param childList - The nodes to append.
     * @returns This node, for chaining.
     *
     * @example
     * ```ts
     * const parent = new Node(document.createElement('div'));
     * const child = new Node(document.createElement('span'));
     *
     * parent.append(child);
     * ```
     */
    public append(...childList: Node.NodeValueType[]): this {
        const rawList = childList.map((node) => {
            if (Node.isAppendable(node)) return Node.getNativeNode(node);
            if (node instanceof Store) return this.createReactive(node);
            return new Text(String(node));
        });
        for (const child of rawList) this.root.appendChild(child);
        return this;
    }

    /**
     * Appends this node to a parent.
     * @param parent - The parent node.
     * @returns This node, for chaining.
     *
     * @example
     * ```ts
     * const parent = new Node(document.createElement('div'));
     * const child = new Node(document.createElement('span'));
     *
     * child.appendTo(parent);
     * ```
     */
    public appendTo(parent: Node.NodeType): this {
        const raw = Node.getNativeNode(parent);
        raw.appendChild(this.root);
        return this;
    }

    /**
     * Replaces this node with another node.
     * @param newNode - The node that will replace this one.
     * @returns This node, for chaining.
     */
    public replaceWith(newNode: Node.NodeValueType): this {
        if (!this.root.parentNode) throw new Error('the node has no parent');

        let raw: globalThis.Node;
        if (Node.isAppendable(newNode)) raw = Node.getNativeNode(newNode);
        else if (newNode instanceof Store) raw = this.createReactive(newNode);
        else raw = new Text(String(newNode));

        this.root.parentNode.replaceChild(raw, this.root);
        return this;
    }

    /**
     * Removes this node from the DOM.
     * @returns This node, for chaining.
     */
    public remove(): this {
        if (!this.root.parentNode) return this;
        this.root.parentNode.removeChild(this.root);
        return this;
    }

    /**
     * Removes one or more children from this node.
     * @param childList - The nodes to remove.
     * @returns This node, for chaining.
     */
    public removeChild(...childList: Node.NodeType[]): this {
        const rawList = childList.map(Node.getNativeNode);
        for (const child of rawList) this.root.removeChild(child);
        return this;
    }

    /**
     * Checks whether this node contains another node.
     * @param child - The node to check.
     * @returns True if this node contains the given node, false otherwise.
     */
    public contains(child: Node.NodeType): boolean {
        const raw = Node.getNativeNode(child);
        return this.root.contains(raw);
    }

    /**
     * Adds an event listener to this node and tracks it for teardown.
     * @param name - The name of the event.
     * @param listener - The callback to execute.
     * @param options - The listener options.
     * @returns This node, for chaining.
     */
    public on(name: string, listener: EventListenerOrEventListenerObject, options?: EventTracker.Options): this {
        this.tracker.add({ name: name, listener, options });
        this.root.addEventListener(name, listener, options);
        return this;
    }

    /**
     * Adds a one-time event listener to this node and tracks it for teardown.
     * @param name - The name of the event.
     * @param listener - The callback to execute.
     * @param options - The listener options.
     * @returns This node, for chaining.
     */
    public once(name: string, listener: EventListenerOrEventListenerObject, options?: EventTracker.Options): this {
        const listenerOptions: EventTracker.Options = !options || typeof options === 'boolean'
            ? { once: true }
            : { ...options, once: true };

        this.tracker.add({ name: name, listener, options: listenerOptions });
        this.root.addEventListener(name, listener, listenerOptions);
        return this;
    }

    /**
     * Removes a previously added event listener.
     * @param name - The name of the event.
     * @param listener - The listener to remove.
     * @param options - The listener options.
     * @returns This node, for chaining.
     */
    public off(name: string, listener: EventListenerOrEventListenerObject, options?: EventTracker.Options): this {
        this.root.removeEventListener(name, listener, options);
        this.tracker.delete({ name, listener, options });
        return this;
    }

    public offOnce(name: string, listener: EventListenerOrEventListenerObject, options?: EventTracker.Options): this {
        const listenerOptions: EventTracker.Options = !options || typeof options === 'boolean'
            ? { once: true }
            : { ...options, once: true };

        this.root.removeEventListener(name, listener, listenerOptions);
        this.tracker.delete({ name, listener, options: listenerOptions });
        return this;
    }

    /**
     * Removes all tracked event listeners registered on this node.
     * @returns This node, for chaining.
     *
     * @remarks
     * This removes every listener added through {@link on} or {@link once}.
     */
    public unbindAll(): this {
        for (const entry of this.tracker.entries) this.root.removeEventListener(entry.name, entry.listener, entry.options);
        this.tracker.delete();
        return this;
    }

    /**
     * Creates a reactive node based on the provided store.
     * @param store - The store to bind to the node.
     * @returns This node, for chaining.
     */
    public offReactive(store: Store<unknown>): this {
        const unities = this.reactive.get(store);
        if (unities) unities.forEach((unsubscribe) => unsubscribe());
        this.reactive.delete(store);
        return this;
    }

    /**
     * Creates a reactive DOM node that updates when the store's state changes.
     * @param store - The store to bind to the node.
     * @returns A DOM node that reacts to the store's state changes.
     *
     * @remarks
     * This method creates a DOM node that automatically updates its content whenever the state of the provided store changes. It subscribes to the store and replaces the node's content with a new node generated from the updated state.
     */
    private createReactive(store: Store<unknown>): globalThis.Node {
        let node = Node.fromStore(store);
        const handler = (value: unknown): void => {
            let replace: globalThis.Node | null = null;
            if (!Node.isAppendable(value)) {
                if (node instanceof Text) node.textContent = String(value);
                else {
                    const newNode = new Text(String(value));
                    if (node.parentNode) node.parentNode.replaceChild(newNode, node);
                    replace = newNode;
                }
            } else {
                const newNode = Node.getNativeNode(value);
                if (node.parentNode) node.parentNode.replaceChild(newNode, node);
                replace = newNode;
            }
            if (replace) node = replace;
        }
        const unsubscribe = store.subscribe(handler);
        const unities = this.reactive.get(store) ?? new Set();
        unities.add(unsubscribe);
        this.reactive.set(store, unities);
        return node;
    }

    /**
     * Checks whether a given object is a Node wrapper.
     * @param object - The object to check.
     * @returns True if the object is a Node wrapper, false otherwise.
     */
    public static isNode(object: unknown): object is Node<any> {
        return object instanceof Node;
    }

    /**
     * Checks whether a given object is a DOM node.
     * @param object - The object to check.
     * @returns True if the object is a DOM node, false otherwise.
     */
    public static isNative(object: unknown): object is globalThis.Node {
        return object instanceof globalThis.Node;
    }

    /**
     * Checks whether a given object is appendable (has a root DOM node).
     * @param object - The object to check.
     * @returns True if the object is appendable, false otherwise.
     */
    public static isAppendable(object: unknown): object is Node.NodeType {
        if (typeof object !== 'object' || object === null) return false;
        return APPENDABLE in object || object instanceof globalThis.Node;
    }

    /**
     * Gets the native DOM node from a Node wrapper or appendable object.
     * @param node - The node to unwrap.
     * @returns The raw DOM node.
     */
    public static getNativeNode(node: Node.NodeType): globalThis.Node {
        if (Node.isNative(node)) return node;
        if (Node.isNode(node)) return node.root;
        if (Node.isAppendable(node)) return Node.getNativeNode(node.root);
        throw new Error('The node is not a valid DOM node.');
    }
    
    /**
     * Creates a DOM node from the current state of a store.
     * @param store - The store to create a node from.
     * @returns A DOM node representing the current state of the store.
     *
     * @remarks
     * This method generates a DOM node based on the current state of the provided store. If the state is a DOM node or an appendable object, it returns the corresponding raw DOM node. Otherwise, it creates a new Text node containing the string representation of the state.
     */
    private static fromStore(store: Store<unknown>): globalThis.Node {
        return Node.isAppendable(store.state)
            ? Node.getNativeNode(store.state)
            : new Text(String(store.state));
    }
}

export namespace Node {
    export import Events = EventTracker;

    export namespace Storage {
        export namespace Reactivity {
            export type Subscriptions = Set<Store.Unsubscribe>;
            export type Entry = WeakMap<Store<any>, Subscriptions>;
        };
        export namespace Tracking {
            export type Entry = EventTracker;
        }
        export type Reactivity = WeakMap<globalThis.Node, Storage.Reactivity.Entry>;
        export type Tracking = WeakMap<globalThis.Node, Tracking.Entry>;
    }

    /** The contract shared by everything that can receive appended children. **/
    export interface IsAppendable {
        readonly [APPENDABLE]: true;
        readonly root: IsAppendable | Node<any> | globalThis.Node;
    }

    /** The values accepted as children by a Node. **/
    export type NodeType =
        | IsAppendable
        | Node<any>
        | globalThis.Node;

    export type NodeValueType = NodeType | Store<any> | string | number;
}

export default Node;