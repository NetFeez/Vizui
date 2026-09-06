/**
 * @author NetFeez <netfeez.dev@gmail.com>.
 * @description Rendering contract between the router and the DOM. The router
 * decides *what* to mount (routes, layouts, delegation); the renderer decides
 * *how* a component is placed and torn down. Kept behind an interface so tests
 * and alternative hosts can inject a fake renderer.
 * @license Apache-2.0
 */

import Element from '../element/Element.js';
import Component from '../component/Component.js';

export interface Renderer {
    /** The root outlet of the renderer, when it owns one. **/
    readonly outlet: Element | null;

    /**
     * Mounts a component into an outlet, tearing down the previous mount there.
     * @param component - The component to mount.
     * @param outlet - The outlet element to mount into.
     * @returns The outlet.
     */
    mount(component: Component<any>, outlet: Element): Element;

    /**
     * Tears down and cleans whatever is mounted in an outlet.
     * @param outlet - The outlet element to unmount.
     */
    unmount(outlet: Element): void;

    /**
     * Mounts a layout component into an outlet and returns the child outlet
     * element where nested content will mount. Reusing a mounted layout keeps its
     * state across nested navigations.
     * @param layout - The layout component.
     * @param outlet - The outlet the layout is mounted into.
     * @param selector - Optional selector of the nested region inside the layout root.
     * @returns The child outlet element.
     */
    layout(layout: Component, outlet: Element, selector?: string): Element;
}

export class DomRenderer implements Renderer {
    /** The components currently mounted, keyed by their outlet. **/
    protected vMounts = new WeakMap<Element, Component>();

    /**
     * Creates a DOM renderer. Mounts are tracked per outlet in a WeakMap so
     * unmounting never leaks listeners and concurrent outlets stay independent.
     * @param outlet - The root element the renderer mounts into by default.
     */
    public constructor(
        /** The root element the renderer mounts into by default. **/
        outlet: Element = DomRenderer.widened(Element.new('div')),
    ) { this.outlet = outlet; }

    /** The root element the renderer mounts into by default. **/
    public readonly outlet: Element;

    /**
     * Widens a concrete Element to its base type for storage in base-typed fields.
     * @param element - The element to widen.
     * @returns The widened element.
     */
    protected static widened<Specific extends HTMLElement>(element: Element<Specific>): Element {
        return element as unknown as Element;
    }

    /**
     * Mounts a component into an outlet, tearing down the previous mount there.
     * @param component - The component to mount.
     * @param outlet - The outlet element to mount into.
     * @returns The outlet.
     */
    public mount(component: Component<any>, outlet: Element): Element {
        this.unmount(outlet);
        component.appendTo(outlet);
        this.vMounts.set(outlet, component);
        return outlet;
    }

    /**
     * Tears down and cleans whatever is mounted in an outlet.
     * @param outlet - The outlet element to unmount.
     */
    public unmount(outlet: Element): void {
        const mounted = this.vMounts.get(outlet);
        if (mounted) {
            Component.unmount(mounted);
            this.vMounts.delete(outlet);
        }
        outlet.clean();
    }

    /**
     * Mounts a layout component into an outlet and returns the child outlet
     * element where nested content will mount. Reusing a mounted layout keeps
     * its state across nested navigation`s.
     * @param layout - The layout component.
     * @param outlet - The outlet the layout is mounted into.
     * @param selector - Optional selector of the nested region inside the layout root.
     * @returns The child outlet element.
     */
    public layout(layout: Component, outlet: Element, selector?: string): Element {
        const mounted = this.vMounts.get(outlet);
        if (mounted !== layout) {
            if (mounted) {
                Component.unmount(mounted);
                this.vMounts.delete(outlet);
            }
            layout.appendTo(outlet);
            this.vMounts.set(outlet, layout);
        }
        const region = selector ? this.resolve(layout.root, selector) : layout.root;
        return this.childOutlet(region);
    }

    /**
     * Finds or creates the child outlet element inside a layout region.
     * @param region - The region to resolve the outlet inside.
     * @returns The child outlet element.
     */
    protected childOutlet(region: Element): Element {
        const existing = this.child(region);
        if (existing) return existing;
        const outlet = Element.new('div');
        outlet.classList.add('router-outlet');
        region.append(outlet);
        return outlet as unknown as Element;
    }

    /**
     * Finds the existing child outlet element inside a layout region.
     * @param region - The region to search.
     * @returns The child outlet element, or null when absent.
     */
    protected child(region: Element): Element | null {
        const found = region.root.querySelector(':scope > .router-outlet');
        return found ? new Element(found as HTMLElement) : null;
    }

    /**
     * Resolves a selector against a layout root.
     * @param root - The layout root element.
     * @param selector - The selector of the nested region.
     * @returns The resolved region element.
     * @throws When the selector matches nothing inside the layout.
     */
    protected resolve(root: Element, selector: string): Element {
        const found = root.root.querySelector(selector);
        if (!found) throw new Error(`[DomRenderer] Outlet selector "${selector}" was not found inside the layout.`);
        return new Element(found as HTMLElement);
    }
}

export namespace Renderer { }

export default Renderer;