/**
 * @author NetFeez <netfeez.dev@gmail.com>.
 * @description Adds a simple way to create HTML elements through JS.
 * @module vizui
 * @license Apache-2.0
 */


import Component from "./Component.js";
import DomObserver from "./DomObserver.js";

export class Element<T extends keyof Element.Type = any> {
    /** The document body */
    public static body: HTMLElement = document.body;
    /** The document head */
    public static head: HTMLElement = document.head;
    /** The DomObserver for this element */
    public readonly observer: DomObserver<this>; 
    /** The main element */
    public HTMLElement: Element.Type[T];
    /**
     * Creates a series of extended functions.
     * @param element The element with which the exemption will be made.
     */
    public constructor(element: Element.Type[T])  {
        if (!(element instanceof HTMLElement)) throw new Error('the element is not a HTMLElement');
        this.HTMLElement = element;
        this.observer = new DomObserver(this);
    }
    /**
     * get the scroll height of the element.
     * @returns The scroll height of the element.
     */
    public get scrollHeight(): number {
        return this.HTMLElement.scrollHeight;
    }
    /**
     * get the scroll width of the element.
     * @returns The scroll width of the element.
     */
    public get scrollWidth(): number {
        return this.HTMLElement.scrollWidth;
    }
    /**
     * get the scroll top of the element.
     * @returns The scroll top of the element.
    */
    public get scrollTop(): number {
        return this.HTMLElement.scrollTop;
    }
    /**
     * set the scroll top of the element.
     * @returns The scroll top of the element.
    */
    public set scrollTop(value: number) {
        this.HTMLElement.scrollTop = value;
    }
    /**
     * get the client height of the element.
     * @returns The client height of the element.
     */
    public get clientHeight(): number {
        return this.HTMLElement.clientHeight;
    }
    /**
     * get the client width of the element.
     * @returns The client width of the element.
     */
    public get clientWidth(): number {
        return this.HTMLElement.clientWidth;
    }
    /**
     * get the offset height of the element.
     * @returns The offset height of the element.
     */
    public get offsetHeight(): number {
        return this.HTMLElement.offsetHeight;
    }
    /**
     * get the offset width of the element.
     * @returns The offset width of the element.
     */
    public get offsetWidth(): number {
        return this.HTMLElement.offsetWidth;
    }
    /**
     * get the classList of the element.
     * @returns The classList of the element.
     */
    public get classList(): DOMTokenList {
        return this.HTMLElement.classList;
    }
    /**
     * get the class of the element.
     * @returns The class of the element.
     */
    public get class(): string {
        return this.HTMLElement.className;
    }
    /**
     * set the class of the element.
     * @returns The class of the element.
     */
    public set class(value: string) {
        this.HTMLElement.className = value;
    }
    /**
     * get the style of the element.
     * @returns The style of the element.
     */
    public get style(): CSSStyleDeclaration {
        return this.HTMLElement.style;
    }
    /**
     * get the id of the element.
     * @returns The id of the element.
     */
    public get id(): string {
        return this.HTMLElement.id;
    }
    /**
     * set the id of the element.
     * @returns The id of the element.
     */
    public set id(value: string) {
        this.HTMLElement.id = value;
    }
    
    /**
     * gets the text content of the element.
     * @returns The text content of the element.
     */
    public get text(): string {
        return this.HTMLElement.innerText;
    }
    /**
     * sets the text content of the element.
     */
    public set text(text: string) {
        this.HTMLElement.innerText = text;
    }
    /**
     * gets the html content of the element.
     * @returns The html content of the element.
     */
    public get html(): string {
        return this.HTMLElement.innerHTML;
    }
    /**
     * Sets the html content of the element.
     * @param html The html to set.
     */
    public set html(html: string) {
        this.HTMLElement.innerHTML = html;
    }
    /**
     * Check if the element contains the child.
     * @param element The element to check.
     */
    public contains(element: Element.AcceptedTypes): boolean {
        if (element instanceof HTMLElement) return this.HTMLElement.contains(element);
        else if (element instanceof Element) return this.HTMLElement.contains(element.HTMLElement);
        else if (element instanceof Component) return this.HTMLElement.contains(element.getComponent().HTMLElement);
        else throw new Error('the element is not a HTMLElement or Element or Component.');
    }
    /**
     * Appends one/multiple children to an element.
     * @param childs The elements to be appended.
     */
    public append(...childs: Element.ChildType[]): Element<T>  {
        for (let child of childs) {
            if (child instanceof HTMLElement) this.HTMLElement.appendChild(child);
            else if (child instanceof Element) this.append(child.HTMLElement);
            else if (child instanceof Component) this.append(child.getComponent());
            else if (child instanceof Object) this.append(Element.structure(child));
            else throw new Error('the element is not a HTMLElement or Element or Component');
        }
        return this;
    }
    /**
     * Replaces this element with another.
     * @param element The element that will replace this one.
     */
    public replaceWith(element: Element.ChildType): Element<T> {
        if (element instanceof HTMLElement) this.HTMLElement.replaceWith(element);
        else if (element instanceof Element) this.replaceWith(element.HTMLElement);
        else if (element instanceof Component) this.replaceWith(element.getComponent());
        else if (element instanceof Object) this.replaceWith(Element.structure(element));
        else throw new Error('the element is not a HTMLElement or Element or Component');
        return this;
    }
    /**
     * Removes one/multiple children from an element.
     * @param childs The elements to be removed.
     */
    public removeChild(...childs: Element.AcceptedTypes[]): Element<T> {
        for (let child of childs) {
            if (child instanceof HTMLElement) this.HTMLElement.removeChild(child);
            else if (child instanceof Element) this.removeChild(child.HTMLElement);
            else if (child instanceof Component) this.removeChild(child.getComponent());
            else throw new Error('the element is not a HTMLElement or Element or Component');
        }
        return this;
    }
    /**
     * Clones this element.
     * @returns The cloned element.
     */
    public clone(): Element<T> {
        const newHtmlElement = this.HTMLElement.cloneNode(true) as Element.Type[T];
        return new Element(newHtmlElement);
    }
    /**
     * Removes this element from the DOM.
     * @returns The element that was removed.
     */
    public remove(): Element<T> {
        this.HTMLElement.remove();
        return this;
    }
    /**
     * Animates the element.
     * @param keyframes The keyframes of the animation.
     * @param options The options of the animation.
     * @returns The animation.
     */
    public animate(keyframes: Keyframe[] | PropertyIndexedKeyframes, options?: KeyframeAnimationOptions | undefined): Animation {
        return this.HTMLElement.animate(keyframes, options);
    }
    /**
     * Appends this element to a parent.
     * @param parent The parent to append this element.
     */
    public appendTo(parent: Element.parentType): Element<T> {
        if (parent instanceof HTMLElement) parent.appendChild(this.HTMLElement);
        else if (parent instanceof Element) parent.HTMLElement.appendChild(this.HTMLElement);
        else throw new Error('the parent is not a HTMLElement or Element');
        return this;
    }
    /**
     * Adds multiple events to the element.
     * @param events The events to add.
     */
    public addEvents(events: Partial<Element.Events>): Element<T> {
        for (const key in events) {
            const event = key as keyof Element.Events;
            const listener = events[event];
            if (!listener) throw new Error('the event no have a listener.');
            this.addEventListener(event, listener);
        }
        return this;
    }
    /**
     * Adds an event listener to the element.
     * @param eventName The name of the event to listen for.
     * @param listener The function to call when the event occurs.
     * @param option The options for the event listener.
     */
    public addEventListener<E extends keyof Element.Events>(eventName: E, listener: Element.Events[E], option?: Element.Events.Options): Element<T> {
        this.on(eventName, listener, option);
        return this;
    }
    /**
     * Removes a previously added event listener from the element.
     * @param eventName - The name of the event whose listener should be removed.
     * @param listener - The function to remove, which was previously added as a listener for the event.
     * @param option - Optional configuration to match the options used when adding the event listener.
     * @returns The current element instance to allow method chaining.
     */
    public removeEventListener<E extends keyof Element.Events>(eventName: E, listener: Element.Events[E], option?: Element.Events.Options): Element<T> {
        this.off(eventName, listener as EventListener, option);
        return this;
    }
    /**
     * Adds an event listener to the element.
     * @param eventName The name of the event to listen for.
     * @param listener The function to call when the event occurs.
     * @param option The options for the event listener.
     */
    public on<E extends keyof Element.Events>(eventName: E, listener: Element.Events[E], option?: Element.Events.Options): Element<T> {
        this.HTMLElement.addEventListener(eventName, listener as EventListener, option);
        return this;
    }
    /**
     * Removes a previously added event listener from the element.
     * @param eventName - The name of the event whose listener should be removed.
     * @param listener - The function to remove, which was previously added as a listener for the event.
     * @param option - Optional configuration to match the options used when adding the event listener.
     * @returns The current element instance to allow method chaining.
     */
    public off<E extends keyof Element.Events>(eventName: E, listener: Element.Events[E], option?: Element.Events.Options): Element<T> {
        this.HTMLElement.removeEventListener(eventName, listener as EventListener, option);
        return this;
    }
    /**
     * Sets an attribute on the element.
     * @param name The name of the attribute.
     * @param value The value of the attribute.
     */
    public setAttribute(name: string, value: string): Element<T> {
        this.HTMLElement.setAttribute(name, value);
        return this;
    }
    /**
     * Gets the value of an attribute on the element.
     * @param name The name of the attribute.
     */
    public getAttribute(name: string): string | null {
        return this.HTMLElement.getAttribute(name);
    }
    /**
     * set multiple attributes on the element.
     * @param attributes The attributes to set.
     */
    public setAttributes(attributes: Element.Attributes): Element<T> {
        for (let Attrib in attributes) {
            this.setAttribute(Attrib, attributes[Attrib]);
        }
        return this;
    }
    /**
     * Removes an attribute from the element.
     * @param name The name of the attribute to remove.
     */
    public removeAttribute(name: string): Element<T> {
        this.HTMLElement.removeAttribute(name);
        return this;
    }
    /**
     * Clears the element.
     * - that will be remove the children and the text.
     * @returns The element.
     */
    public clean(): Element<T> {
        this.HTMLElement.innerText = '';
        return this;
    }
    /**
     * Gets an element from the DOM.
     * @param selector The selector to use.
     * @returns The element, or null if not found.
     */
    public static get<T extends keyof Element.Type = any>(selector: string): Element<T> | null {
        let Selection = document.querySelector<Element.Type[T]>(selector);
        return Selection ? new Element(Selection) : null;
    }
    /**
     * Creates a new element.
     * @param type The type of element to create.
     * @param text The text to set.
     * @param attribs The attributes to set.
     * @param events The events to add.
     * @param childs The children to append.
     * @returns The new element.
     */
    public static new<T extends keyof Element.Type>(type: T, text?: string | null, attribs?: Element.Attributes | null, events?: Partial<Element.Events> | null, childs?: Array<Element.ChildType> | null): Element<T> {
        let NewElement = new Element(document.createElement(type));
        if (text) NewElement.html = text;
        if (attribs) NewElement.setAttributes(attribs);
        if (events) NewElement.addEvents(events);
        if (childs) NewElement.append(...childs);
        return NewElement;
    }/**
     * Creates a new element from a structure.
     * @param structure The structure of the element.
     * @returns The new element.
     */
    public static structure<T extends keyof Element.Type>(structure: Element.Structure<T>): Element<T> {
        return this.new(
            structure.type,
            structure.text ?? null,
            structure.attribs ?? null,
            structure.events ?? null,
            structure.childs ?? null
        );
    }
}

export namespace Element {
    export namespace Events {
        export type Options = boolean | AddEventListenerOptions;
    }
    export type Events = {
        [Key in keyof HTMLElementEventMap]: (this: HTMLElement, event: HTMLElementEventMap[Key]) => void;
    };
    export type Type = HTMLElementTagNameMap;
    export type Attributes = {
        [key: string]: string;
    };
    export type ChildType = Structure<keyof Element.Type> | Element<any> | Component<any> | HTMLElement;
    export type AcceptedTypes = Element<any> | Component<any> | HTMLElement;
    export type parentType = Element<any> | HTMLElement;
    export type Structure<T extends keyof Element.Type> = {
        type: T;
        text?: string;
        attribs?: Attributes;
        events?: Partial<Element.Events>;
        childs?: Element.ChildType[];
    };
}

export default Element;