/**
 * @author NetFeez <netfeez.dev@gmail.com>.
 * @description adds a class to create components with js/ts.
 * @module vizui
 * @license Apache-2.0
 */

import Element from "./Element.js";
import Events from "./Events.js";

export abstract class Component<T extends keyof Element.Type, eventMap extends Events.EventMap = Events.EventMap> extends Events<eventMap> {
    /**
     * The component element.
     */
    protected abstract component: Element<T>;
    /**
     * Gets the component element.
     * @returns The component element.
     */
    public getComponent(): Element<T> { return this.component };
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
        this.component.appendTo(parent);
        return this;
    }
    /**
     * Replace this component for other component/element.
     * @param element - The new element.
     * @returns This component.
     */
    public replaceWith(element: Element.ChildType): this {
        this.component.replaceWith(element);
        return this;
    }
}

export default Component