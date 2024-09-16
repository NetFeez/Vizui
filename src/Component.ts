/**
 * @author NetFeez <netfeez.dev@gmail.com>.
 * @description adds a class to create components with js/ts.
 * @module my.vizui
 * @license Apache-2.0
 */

import Element from "./Element.js";
import Events from "./Events.js";

export abstract class Component<T extends keyof Element.Type> extends Events {
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
}

export default Component