/**
 * @author NetFeez <netfeez.dev@gmail.com>.
 * @description Wraps an HTMLElement with a fluent, typed API.
 * @license Apache-2.0
 */

import DomObserver from './DomObserver.js';
import { APPENDABLE, ELEMENT } from '../symbols.js';

export class Element<T extends HTMLElement = HTMLElement> implements Element.IsAppendable {
    public static body = document.body;
    public static head = document.head;

    public readonly [ELEMENT] = true;
    public readonly [APPENDABLE] = true;

    /** The mutation/intersection observer bound to this element. **/
    public readonly observer: DomObserver<T>;

    /** The wrapped HTMLElement. **/
    public readonly root: T;

    /** Tracked listeners, so they can be torn down in bulk. **/
    private vListeners: Array<Element.Events.Entry> = [];

    /**
     * Wraps an existing HTMLElement.
     * @param element - The element to wrap.
     * @throws When the value is not an HTMLElement.
     */
    public constructor(element: T) {
        if (!(element instanceof HTMLElement)) throw new Error('the element is not a HTMLElement');
        this.root = element;
        this.observer = new DomObserver(this.root);
    }

    /** The scroll height of the element in pixels. **/
    public get scrollHeight(): number { return this.root.scrollHeight; }

    /** The scroll width of the element in pixels. **/
    public get scrollWidth(): number { return this.root.scrollWidth; }

    /** The vertical scroll position in pixels. **/
    public get scrollTop(): number { return this.root.scrollTop; }

    /** The vertical scroll position in pixels. **/
    public set scrollTop(value: number) { this.root.scrollTop = value; }

    /** The visible height of the element in pixels. **/
    public get clientHeight(): number { return this.root.clientHeight; }

    /** The visible width of the element in pixels. **/
    public get clientWidth(): number { return this.root.clientWidth; }

    /** The layout height of the element in pixels. **/
    public get offsetHeight(): number { return this.root.offsetHeight; }

    /** The layout width of the element in pixels. **/
    public get offsetWidth(): number { return this.root.offsetWidth; }

    /** The class list of the element. **/
    public get classList(): DOMTokenList { return this.root.classList; }

    /** The class attribute of the element. **/
    public get class(): string { return this.root.className; }

    /** The class attribute of the element. **/
    public set class(value: string) { this.root.className = value; }

    /** The inline style declaration of the element. **/
    public get style(): CSSStyleDeclaration { return this.root.style; }

    /** The id attribute of the element. **/
    public get id(): string { return this.root.id; }

    /** The id attribute of the element. **/
    public set id(value: string) { this.root.id = value; }

    /** The text content of the element. **/
    public get text(): string { return this.root.innerText; }

    /** The text content of the element. **/
    public set text(text: string) { this.root.innerText = text; }

    /** The HTML content of the element. **/
    public get html(): string { return this.root.innerHTML; }

    /** The HTML content of the element. **/
    public set html(html: string) { this.root.innerHTML = html; }

    /** Whether the element is attached to the document. **/
    public get isConnected(): boolean { return this.root.isConnected; }

    /**
     * Sets the text content of the element.
     * @param text - The text to set.
     * @returns This element, for chaining.
     */
    public setText(text: string): this { this.root.innerText = text; return this; }

    /**
     * Sets the HTML content of the element.
     * @param html - The HTML to set.
     * @returns This element, for chaining.
     */
    public setHtml(html: string): this { this.root.innerHTML = html; return this; }

    /**
     * Sets the class attribute of the element.
     * @param className - The class to set.
     * @returns This element, for chaining.
     */
    public setClass(className: string): this { this.root.className = className; return this; }

    /**
     * Adds one or more classes to the element.
     * @param classList - The classes to add.
     * @returns This element, for chaining.
     */
    public addClass(...classList: string[]): this { this.root.classList.add(...classList); return this; }

    /**
     * Removes one or more classes from the element.
     * @param classList - The classes to remove.
     * @returns This element, for chaining.
     */
    public removeClass(...classList: string[]): this { this.root.classList.remove(...classList); return this; }

    /**
     * Toggles a class on the element.
     * @param className - The class to toggle.
     * @param force - Whether to force the class on or off.
     * @returns This element, for chaining.
     */
    public toggleClass(className: string, force?: boolean): this { this.root.classList.toggle(className, force); return this; }

    /**
     * Removes this element from the DOM.
     * @returns This element, for chaining.
     */
    public remove(): this { this.root.remove(); return this; }

    /**
     * Animates the element with the Web Animations API.
     * @param keyframes - The keyframes of the animation.
     * @param options - The options of the animation.
     * @returns The animation created for the element.
     */
    public animate(keyframes: Keyframe[] | PropertyIndexedKeyframes, options?: KeyframeAnimationOptions | undefined): Animation {
        return this.root.animate(keyframes, options);
    }

    /**
     * Appends one or more children to this element.
     * @param childList - The children to append.
     * @returns This element, for chaining.
     *
     * @remarks
     * The children can be HTMLElements, Elements or Components.
     *
     * @example
     * ```ts
     * const div = Element.new('div');
     * const span = Element.new('span');
     * const p = Element.new('p');
     * div.append(span, p);
     * ```
     */
    public append(...childList: Element.ChildType[]): this {
        Element.append(this, ...childList);
        return this;
    }

    /**
     * Appends this element to a parent.
     * @param parent - The parent to append to.
     * @returns This element, for chaining.
     *
     * @remarks
     * The parent can be an HTMLElement, an Element or a Component.
     */
    public appendTo(parent: Element.ChildType): this {
        Element.append(parent, this.root);
        return this;
    }

    /**
     * Replaces this element with another.
     * @param newElement - The element that will replace this one.
     * @returns This element, for chaining.
     *
     * @example
     * ```ts
     * const div = Element.new('div');
     * const span = Element.new('span');
     * div.replaceWith(span);
     * ```
     */
    public replaceWith(newElement: Element.ChildType): this {
        const rawNewElement = Element.getRawElement(newElement);
        this.root.replaceWith(rawNewElement);
        return this;
    }

    /**
     * Removes one or more children from this element.
     * @param childList - The children to remove.
     * @returns This element, for chaining.
     *
     * @example
     * ```ts
     * const div = Element.new('div');
     * const span = Element.new('span');
     * const p = Element.new('p');
     * div.append(span, p);
     * div.removeChild(span, p);
     * ```
     */
    public removeChild(...childList: Element.ChildType[]): this {
        for (const child of childList.map(Element.getRawElement)) this.root.removeChild(child);
        return this;
    }

    /**
     * Checks whether this element contains a given child.
     * @param child - The child to check.
     * @returns True if this element contains the child, false otherwise.
     *
     * @remarks
     * The child can be an HTMLElement, an Element or a Component.
     *
     * @example
     * ```ts
     * const div = Element.new('div');
     * const span = Element.new('span');
     * div.append(span);
     * console.log(div.contains(span)); // true
     * console.log(div.contains(document.createElement('span'))); // false
     * ```
     */
    public contains(child: Element.ChildType): boolean {
        const raw = Element.getRawElement(child);
        return this.root.contains(raw);
    }

    /**
     * Adds an event listener to this element and tracks it for teardown.
     * @param eventName - The name of the event.
     * @param listener - The callback to execute.
     * @param options - The listener options.
     * @returns This element, for chaining.
     */
    public on<E extends keyof Element.Events>(eventName: E, listener: Element.Events[E], options?: Element.Events.Options): this;
    public on(eventName: string, listener: EventListenerOrEventListenerObject, options?: Element.Events.Options): this;
    public on(eventName: string, listener: EventListenerOrEventListenerObject, options?: Element.Events.Options): this {
        this.root.addEventListener(eventName, listener, options);
        this.vListeners.push({ eventName: eventName, listener: listener, options });
        return this;
    }

    /**
     * Adds a one-time event listener to this element and tracks it for teardown.
     * @param eventName - The name of the event.
     * @param listener - The callback to execute.
     * @param options - The listener options.
     * @returns This element, for chaining.
     */
    public once<E extends keyof Element.Events>(eventName: E, listener: Element.Events[E], options?: Element.Events.Options): this;
    public once(eventName: string, listener: EventListenerOrEventListenerObject, options?: Element.Events.Options): this;
    public once(eventName: string, listener: EventListenerOrEventListenerObject, options?: Element.Events.Options): this {
        options = !options || typeof options === 'boolean' ? { once: true } : { ...options, once: true };
        this.root.addEventListener(eventName, listener, options);
        this.vListeners.push({ eventName: eventName, listener: listener, options });
        return this;
    }

    /**
     * Removes a previously added event listener.
     * @param eventName - The name of the event.
     * @param listener - The listener to remove.
     * @param option - The options to match.
     * @returns This element, for chaining.
     */
    public off<E extends keyof Element.Events>(eventName: E, listener: Element.Events[E], options?: Element.Events.Options): this;
    public off(eventName: string, listener: EventListenerOrEventListenerObject, options?: Element.Events.Options): this;
    public off(eventName: string, listener: EventListenerOrEventListenerObject, option?: Element.Events.Options): this {
        this.root.removeEventListener(eventName, listener, option);
        this.vListeners = this.vListeners.filter(entry => entry.listener !== listener || entry.eventName !== eventName);
        return this;
    }

    /**
     * Removes all tracked event listeners registered on this element.
     * @returns This element, for chaining.
     *
     * @remarks
     * This removes every listener added through `on`/`once`, so teardown never leaks.
     */
    public unbindAll(): this {
        for (const { eventName, listener, options } of this.vListeners) this.root.removeEventListener(eventName, listener, options);
        this.observer
        this.vListeners = [];
        return this;
    }

    /**
     * Sets a single attribute.
     * @param name - The name of the attribute.
     * @param value - The value of the attribute.
     * @returns This element, for chaining.
     *
     * @remarks
     * If the attribute already exists, its value is overwritten;
     * if it does not exist, it is created.
     */
    public setAttribute(name: string, value: string): this {
        this.root.setAttribute(name, value);
        return this;
    }

    /**
     * Gets the value of an attribute.
     * @param name - The name of the attribute.
     * @returns The value of the attribute, or null if it doesn't exist.
     */
    public getAttribute(name: string): string | null { return this.root.getAttribute(name); }

    /**
     * Sets multiple attributes at once.
     * @param attributes - The attributes to set.
     * @returns This element, for chaining.
     *
     * @remarks
     * Existing attributes are overwritten; missing ones are created.
     */
    public setAttributes(attributes: Element.Attributes): this {
        for (const [Attrib, value] of Object.entries(attributes)) this.setAttribute(Attrib, String(value));
        return this;
    }

    /**
     * Removes one or more attributes from this element.
     * @param names - The names of the attributes to remove.
     * @returns This element, for chaining.
     *
     * @remarks
     * Attributes that do not exist are ignored.
     */
    public removeAttribute(...names: string[]): this {
        for (const name of names) this.root.removeAttribute(name);
        return this;
    }

    /**
     * Removes all the content of this element.
     * @returns This element, for chaining.
     *
     * @remarks
     * This removes every child node of the element, including text and comment
     * nodes; the element itself is kept.
     */
    public clean(): this { this.root.innerText = ''; return this; }

    /**
     * Gets an element from the DOM by selector.
     * @param selector - The selector to use.
     * @returns The element, or null if not found.
     *
     * @example
     * ```ts
     * const div = Element.get<HTMLDivElement>('div#my-div');
     * const input = Element.get<HTMLInputElement>('input[name="my-input"]');
     * ```
     */
    public static get<T extends HTMLElement = HTMLElement>(selector: string): Element<T> | null {
        const selection = document.querySelector<T>(selector);
        return selection ? new Element(selection) : null;
    }

    /**
     * Creates a new element.
     * @param tag - The type of element to create.
     * @param options - The options to apply to the element.
     * @returns The new element.
     *
     * @example
     * ```ts
     * const div = Element.new('div', { text: 'Hello, world!', attributes: { id: 'my-div', class: 'my-class', other: 'value' } });
     * // or you can do it like a semi-builder:
     * const div = Element.new('div')
     *     .setAttribute('id', 'my-div')
     *     .setAttributes({ class: 'my-class', other: 'value' })
     *     .setText('Hello, world!');
     * ```
     */
    public static new<T extends keyof Element.Type>(tag: T, options: Element.CreationOptions = {}): Element<Element.Type[T]> {
        const root = document.createElement(tag);
        const element = new Element(root);
        this.assignCreationOptions(element, options);
        return element;
    }

    /**
     * Creates a new element from a structure.
     * @param structure - The structure of the element.
     * @returns The new element.
     * @deprecated Use {@link Element.new} instead.
     */
    public static structure<T extends keyof Element.Type>(structure: Element.Structure<T>): Element<Element.Type[T]> {
        return this.new(structure.tag, { ...structure });
    }

    /**
     * Checks whether a given object is an Element.
     * @param object - The object to check.
     * @returns True if the object is an Element, false otherwise.
     */
    public static isElement(object: unknown): object is Element<any> {
        if (typeof object !== 'object' || object === null) return false;
        return ELEMENT in object;
    }

    /**
     * Checks whether a given object is appendable (an Element or HTMLElement).
     * @param object - The object to check.
     * @returns True if the object is appendable, false otherwise.
     */
    public static isAppendable(object: unknown): object is Element.IsAppendable {
        if (typeof object !== 'object' || object === null) return false;
        return APPENDABLE in object;
    }

    /**
     * Checks whether a given object is an HTML element.
     * @param object - The object to check.
     * @returns True if the object is an HTML element, false otherwise.
     */
    public static isHtmlElement(object: unknown): object is HTMLElement { return object instanceof HTMLElement; }

    /**
     * Assigns creation options to an element.
     * @param element - The element to assign options to.
     * @param options - The options to assign.
     *
     * @remarks Used internally by {@link Element.new}.
     */
    private static assignCreationOptions<T extends HTMLElement>(element: Element<T>, options: Element.CreationOptions): void {
        if (Object.keys(options).length === 0) return;
        if (options.text) element.text = options.text;
        if (options.html) element.html = options.html;
        if (options.attributes) element.setAttributes(options.attributes);
        if (options.events) this.addEvents(element, options.events);
        if (options.childList) element.append(...options.childList);
    }

    /**
     * Adds multiple event listeners to an element.
     * @param element - The element to add events to.
     * @param events - The events to add.
     *
     * @remarks Used internally by {@link Element.new}; not intended for direct use.
     */
    private static addEvents<T extends HTMLElement>(element: Element<T>, events: Partial<Element.Events>): void;
    private static addEvents<T extends HTMLElement>(element: Element<T>, events: Partial<Element.Events.Generics>): void;
    private static addEvents<T extends HTMLElement>(element: Element<T>, events: Partial<Element.Events.Generics>): void {
        for (const [key, listener] of Object.entries(events)) {
            if (!listener) throw new Error('the event no have a listener.');
            element.root.addEventListener(key, listener);
        }
    }

    /**
     * Appends one or more children to a parent element.
     * @param parent - The parent element to append to.
     * @param childList - The children to append.
     *
     * @remarks Used internally by `append`/`appendTo`; not intended for direct use.
     */
    private static append(parent: Element.ChildType, ...childList: Element.ChildType[]): void {
        const rawParent = this.getRawElement(parent);
        for (const child of childList.map(Element.getRawElement)) rawParent.appendChild(child);
    }

    /**
     * Gets the raw HTMLElement from an Element or Component.
     * @param element - The element or component to get the raw HTMLElement from.
     * @returns The raw HTMLElement.
     *
     * @remarks Used internally by the append/replace family; not intended for direct use.
     */
    private static getRawElement(element: Element.ChildType): HTMLElement {
        if (element instanceof HTMLElement) return element;
        if (ELEMENT in element) return element.root;
        if (APPENDABLE in element) return Element.getRawElement(element.root);
        throw new Error('the element is not a HTMLElement or Element or Component');
    }
}

export namespace Element {
    /** The contract shared by everything that can receive appended children. **/
    export interface IsAppendable {
        readonly root: HTMLElement | Element<any>;
        readonly [APPENDABLE]: true;
    }

    /** The typed event listener map of an HTMLElement. **/
    export type Events = { [Key in keyof HTMLElementEventMap]: (this: HTMLElement, event: HTMLElementEventMap[Key]) => void; };
    export namespace Events {
        /** Untyped listeners keyed by arbitrary event names. **/
        export interface Generics { [key: string]: EventListenerOrEventListenerObject; }

        /** A tracked listener, kept for bulk teardown. **/
        export interface Entry {
            eventName: string;
            listener: EventListenerOrEventListenerObject;
            options?: Element.Events.Options;
        }

        /** The options accepted when binding a listener. **/
        export type Options = boolean | AddEventListenerOptions;
    }

    /** Attribute values keyed by name. **/
    export interface Attributes { [key: string]: string | number | boolean; };

    /** Maps a tag name to its concrete HTMLElement type. **/
    export type Type = HTMLElementTagNameMap;

    /** The child kinds an element accepts: Elements, appendables or HTMLElements. **/
    export type ChildType =
        | Element<any>
        | IsAppendable
        | HTMLElement;

    /** The options applied to an element at creation time. **/
    export interface CreationOptions {
        /**
         * The text content of the element.
         * @default undefined
         * @remarks If html is set, text will be ignored.
         */
        text?: string;

        /**
         * The HTML content of the element.
         * @default undefined
         * @remarks If html is set, text will be ignored.
         */
        html?: string;

        /**
         * The attributes to set on the element.
         * @default undefined
         */
        attributes?: Element.Attributes;

        /**
         * The events to add to the element.
         * @default undefined
         */
        events?: Partial<Element.Events>;

        /**
         * The children to append to the element.
         * @default undefined
         */
        childList?: Array<Element.ChildType>;
    }

    /** The deprecated structural declaration of an element. **/
    export interface Structure<T extends keyof Element.Type> extends CreationOptions {
        tag: T;
    };
}

export default Element;