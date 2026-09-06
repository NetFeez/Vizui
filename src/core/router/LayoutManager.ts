/**
 * @author NetFeez <netfeez.dev@gmail.com>.
 * @description Maintains the active layout chain for a router and synchronizes
 * it with the matched navigation path.
 * @license Apache-2.0
 */

import Element from '../element/Element.js';
import Component from '../component/Component.js';

import type { Renderer } from './Renderer.js';
import LayoutRule from './rule/LayoutRule.js';

export class LayoutManager {
    /** The layouts registered, in mount order. **/
    protected vLayouts: LayoutRule[] = [];

    /** The layouts currently mounted, outermost first. **/
    protected vChain: LayoutRule[] = [];

    /** The components of the mounted layouts, in chain order. **/
    protected vChainComponents: Component[] = [];

    /** The outlets the mounted layouts are attached to, in chain order. **/
    protected vChainOutlets: Element[] = [];

    /** The registered layouts, sorted by template length. **/
    public get layouts(): LayoutRule[] { return [...this.vLayouts]; }

    /**
     * Registers a layout, keeping the collection sorted by template length.
     * @param route - The layout rule to register.
     */
    public register(route: LayoutRule): void {
        this.vLayouts.push(route);
        this.vLayouts.sort((a, b) => a.template.length - b.template.length);
    }

    /**
     * Matches the layouts whose template covers a path.
     * @param path - The navigation path.
     * @returns The matching layouts, outermost first.
     */
    public match(path: string): LayoutRule[] {
        return path ? this.vLayouts.filter((layout) => layout.test(path)) : [];
    }

    /**
     * Aligns the active layout chain with the navigation path and returns the
     * innermost outlet, tearing down layouts that no longer match and mounting
     * the new suffix of the chain.
     * @param path - The navigation path.
     * @param anchor - The element to mount into when no layout is active.
     * @param renderer - The renderer used to mount and unmount layouts.
     * @param fallback - The outlet used when a torn-down level has no parent.
     * @returns The outlet the matched view must mount into.
     */
    public async sync(
        path: string,
        anchor: Element,
        renderer: Renderer,
        fallback: Element,
    ): Promise<Element> {
        const chain = this.match(path);
        if (chain.length === 0 && this.vChain.length === 0) return anchor;

        const common = this.commonDepth(this.vChain, chain);
        for (let index = this.vChain.length - 1; index >= common; index--) {
            this.teardown(index, renderer, fallback);
        }
        this.vChain = this.vChain.slice(0, common);
        this.vChainComponents = this.vChainComponents.slice(0, common);
        this.vChainOutlets = this.vChainOutlets.slice(0, common);

        let target = common > 0 ? this.vChainOutlets[common - 1] : anchor;
        for (let index = common; index < chain.length; index++) {
            const layoutRoute = chain[index];
            const component = await layoutRoute.resolve();
            const parent = target;
            this.vChain.push(layoutRoute);
            this.vChainComponents.push(component);
            this.vChainOutlets.push(parent);
            target = renderer.layout(component, parent, layoutRoute.outletSelector);
        }
        return target;
    }

    /**
     * Removes a layout level from the chain and unmounts its outlet content.
     * @param index - The chain index to tear down.
     * @param renderer - The renderer used to unmount the level.
     * @param fallback - The outlet used when the level has no parent.
     */
    protected teardown(index: number, renderer: Renderer, fallback: Element): void {
        this.vChain.splice(index, 1);
        this.vChainComponents.splice(index, 1);
        this.vChainOutlets.splice(index, 1);
        const outlet = this.vChainOutlets[index] ?? fallback;
        renderer.unmount(outlet);
    }

    /**
     * Measures how many leading levels two chains share.
     * @param previous - The currently mounted chain.
     * @param next - The chain required by the navigation.
     * @returns The number of shared leading levels.
     */
    protected commonDepth(previous: LayoutRule[], next: LayoutRule[]): number {
        let depth = 0;
        while (depth < previous.length && depth < next.length && previous[depth] === next[depth]) depth++;
        return depth;
    }
}

export namespace LayoutManager { }

export default LayoutManager;