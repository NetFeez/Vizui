/**
 * @author NetFeez <netfeez.dev@gmail.com>.
 * @description adds a class to create components with js/ts.
 * @module vizui
 * @license Apache-2.0
 */

import Element from "./Element.js";
import Events from "./Events.js";
import DynamicCSS from "./DynamicCSS.js";

export abstract class Component<T extends keyof Element.Type, eventMap extends Events.EventMap = Events.EventMap> extends Events<eventMap> implements Component.Component<T> {
    /** The dynamic css loader. */
    protected static readonly css = DynamicCSS;
    /** The root element. */
    protected readonly abstract root: Element<T>;
    /** The component element. */
    public get element(): Element<T> { return this.root; }
    /** Gets if the element is connected with the DOM. */
    public get isConnected(): boolean { return this.root.isConnected; }
    /**
     * Renders the component.
     * @param parent The parent element.
     * @param clean If true, the parent element will be cleaned.
     * @returns The component.
     */
    public render(parent: Component.parentType, clean: boolean = false): this {
        if (clean) {
            if (parent instanceof Element) parent.clean();
            else parent.innerHTML = '';
        }
        this.root.appendTo(parent);
        return this;
    }
    
    /**
     * Appends one/multiple children to the component.
     * @param childs The elements to be appended.
     */
    public append(...childs: Element.ChildType[]): this  {
        this.root.append(...childs);
        return this
    }
    /**
     * Appends this element to a parent.
     * @param parent The parent to append this element.
     */
    public appendTo(parent: Element.AcceptedTypes): this {
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
    export type parentType = Element<any> | HTMLElement;
    export interface Component<T extends keyof Element.Type> {
        readonly element: Element<T>;
        readonly isConnected: boolean;
    }
}
export default Component