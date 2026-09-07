/**
 * @author NetFeez <netfeez.dev@gmail.com>.
 * @description Wraps a DOM Node with a fluent, typed API.
 * @license Apache-2.0
 */

import EventTracker from './EventTracker.js';
import { APPENDABLE } from '../symbols.js';

export class Node<T extends globalThis.Node = globalThis.Node> {
    /** The wrapped DOM node. **/
    public readonly root: T;

    private vEventTracker = new EventTracker();

    /**
     * Wraps an existing DOM node.
     * @param node - The node to wrap.
     */
    public constructor(node: T) {
        if (!Node.isDomNode(node)) throw new Error('the node is not a Node');
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
    public append(...childList: Node.ChildType[]): this {
        const rawList = childList.map(Node.getRawNode);
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
    public appendTo(parent: Node.ChildType): this {
        const raw = Node.getRawNode(parent);
        raw.appendChild(this.root);
        return this;
    }

    /**
     * Replaces this node with another node.
     * @param newNode - The node that will replace this one.
     * @returns This node, for chaining.
     */
    public replaceWith(newNode: Node.ChildType): this {
        if (!this.root.parentNode) throw new Error('the node has no parent');
        const raw = Node.getRawNode(newNode);
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
    public removeChild(...childList: Node.ChildType[]): this {
        const rawList = childList.map(Node.getRawNode);
        for (const child of rawList) this.root.removeChild(child);
        return this;
    }

    /**
     * Checks whether this node contains another node.
     * @param child - The node to check.
     * @returns True if this node contains the given node, false otherwise.
     */
    public contains(child: Node.ChildType): boolean {
        const raw = Node.getRawNode(child);
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
        this.vEventTracker.add({ name: name, listener, options });
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

        this.vEventTracker.add({ name: name, listener, options: listenerOptions });
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
        this.vEventTracker.delete({ name, listener, options });
        return this;
    }

    public offOnce(name: string, listener: EventListenerOrEventListenerObject, options?: EventTracker.Options): this {
        const listenerOptions: EventTracker.Options = !options || typeof options === 'boolean'
            ? { once: true }
            : { ...options, once: true };

        this.root.removeEventListener(name, listener, listenerOptions);
        this.vEventTracker.delete({ name, listener, options: listenerOptions });
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
        for (const entry of this.vEventTracker.entries) {
            this.root.removeEventListener(entry.name, entry.listener, entry.options);
        }
        this.vEventTracker.delete();
        return this;
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
    public static isDomNode(object: unknown): object is globalThis.Node {
        return object instanceof globalThis.Node;
    }

    /**
     * Checks whether a given object is appendable (has a root DOM node).
     * @param object - The object to check.
     * @returns True if the object is appendable, false otherwise.
     */
    public static isAppendable(object: unknown): object is Node.IsAppendable {
        if (typeof object !== 'object' || object === null) return false;
        return APPENDABLE in object;
    }

    /**
     * Gets the raw DOM node from a Node wrapper, DOM node, or appendable object.
     * @param node - The node to unwrap.
     * @returns The raw DOM node.
     */
    public static getRawNode(node: Node.ChildType | Node.IsAppendable): globalThis.Node {
        if (Node.isNode(node)) return node.root;
        if (Node.isDomNode(node)) return node;
        if (Node.isAppendable(node)) return Node.getRawNode(node.root);
        throw new Error('the value is not a Node, DOM Node, or appendable');
    }
}

export namespace Node {
    export import Events = EventTracker;

    /** The contract shared by everything that can receive appended children. **/
    export interface IsAppendable {
        readonly [APPENDABLE]: true;
        readonly root: IsAppendable | Node<any> | globalThis.Node;
    }

    /** The values accepted as children by a Node. **/
    export type ChildType =
        | IsAppendable
        | Node<any>
        | globalThis.Node;
}

export default Node;