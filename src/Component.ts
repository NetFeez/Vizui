/**
 * @author NetFeez <netfeez.dev@gmail.com>.
 * @description adds a class to create components with js/ts.
 * @module vizui
 * @license Apache-2.0
 */

import Element from "./Element.js";
import Events from "./Events.js";

export abstract class Component<T extends keyof Element.Type, eventMap extends Events.EventMap = Events.EventMap> extends Events<eventMap> implements Component.Component<T> {
    /** The root element. */
    protected readonly abstract root: Element<T>;
    // ReadOnly properties.
    /** The component element. */
    public get element(): Element<T> { return this.root; }
    /** The component classList. */
    public get classList(): DOMTokenList { return this.root.classList; }
    /** The component style. */
    public get style(): CSSStyleDeclaration { return this.root.style; }
    /** If the component is connected to the DOM. */
    public get isConnected(): boolean { return this.root.isConnected; }
    // Properties.
    public get class(): string { return this.root.class; }
    public set class(value: string) { this.root.class = value; }
    public get id(): string { return this.root.id; }
    public set id(value: string) { this.root.id = value; }

    /**
     * Renders the component.
     * @param parent The parent element.
     * @param clean If true, the parent element will be cleaned.
     * @returns The component.
     */
    public render(parent: Element.parentType, clean: boolean = false): this {
        if (clean) {
            if (parent instanceof Element) parent.clean();
            else parent.innerHTML = '';
        }
        this.root.appendTo(parent);
        return this;
    }
    /**
     * Replace this component for other component/element.
     * @param element - The new element.
     * @returns This component.
     */
    public replaceWith(element: Element.ChildType): this {
        this.root.replaceWith(element);
        return this;
    }
    /**
     * Remove this component.
     * @returns This component.
     */
    public remove(): this {
        this.root.remove();
        return this;
    }
}
export namespace Component {
    export interface Component<T extends keyof Element.Type> {
        // readonly properties.
        readonly element: Element<T>;
        readonly classList: DOMTokenList;
        readonly style: CSSStyleDeclaration;
        readonly isConnected: boolean;
        // properties.
        class: string;
        id: string;
    }
}
export default Component