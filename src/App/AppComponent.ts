/**
 * @author NetFeez <netfeez.dev@gmail.com>.
 * @description Add the AppComponent class.
 * @module my.vizui
 * @license Apache-2.0
 */
import Element from '../Element.js';

class AppComponent {
    private root: Element;
    /**
     * Creates an instance of AppComponent.
     * @param root The root element of the component.
     */
    public constructor(root: Element) {
        this.root = root;
    }
    /**
     * Gets the root element of the component.
     * @returns The root element of the component.
     */
    public getElement(): Element { return this.root; }
    /**
     * Appends content to the root element of the component.
     * @param content The content to append.
     * @returns The component instance.
     */
    public render(...content: Element[]): AppComponent {
        this.clean()
        this.root.append(...content);
        return this;
    }
    /**
     * Cleans the root element of the component.
     * @returns The component instance.
     */
    public clean(): AppComponent {
        this.root.clean();
        return this;
    }
    /**
     * Removes the root element of the component.
     * @returns The component instance.
     */
    public remove(): AppComponent {
        this.root.remove();
        return this;
    }
    /**
     * Clones the root element of the component.
     * @returns The cloned component instance.
     */
    public clone(): AppComponent {
        const clonedElement = this.root.clone();
        return new AppComponent(clonedElement);
    }
}

export default AppComponent