/**
 * @author NetFeez <netfeez.dev@gmail.com>.
 * @description Route that mounts a View. The mount is performed by the router
 * renderer (inherited through the guard state) using the view content and the
 * optional declarative loader. Its `exec` runs the route pipeline and then mounts.
 * @license Apache-2.0
 */

import { RULE } from '../../symbols.js';

import Pipeline from '../pipeline/Pipeline.js';

import type Element from '../../element/Element.js';
import type Guard from '../pipeline/Guard.js';
import type Tracker from '../Tracker.js';
import type Router from '../Router.js';

import Component from '../../component/Component.js';
import type View from '../../component/View.js';

import Rule from './Rule.js';

export class ShowRule extends Rule<ShowRule.Content> {
    public [RULE.SHOW] = true;
    public readonly identifier = 'show';

    /** The declarative loader declared with `load`. **/
    protected vLoader: Rule.Loader | null = null;

    /**
     * Creates a show route.
     * @param template - The url template of the route.
     * @param content - The view, or a factory producing it.
     * @param pipeline - The per-route pipeline.
     */
    public constructor(template: string, content: ShowRule.Content, pipeline: Pipeline = new Pipeline()) {
        super(template, content, pipeline);
    }

    /** The declarative loader declared with `.load(...)` when present. **/
    public get loader(): Rule.Loader | null { return this.vLoader; }

    /**
     * Declares a loader for this route. When present it wins over `View.load`.
     * @param loader - The loader producing the data delivered to `View.render`.
     * @returns This route, for chaining.
     */
    public load(loader: Rule.Loader): this {
        this.vLoader = loader;
        return this;
    }

    /**
     * Resolves the view instance, instantiating lazy factories.
     * @returns The resolved view.
     * @throws When the content does not produce a Component.
     */
    public async resolve(): Promise<View> {
        const content = this.vContent;
        const view = typeof content === 'function' ? await content() : content;
        if (!(view instanceof Component)) throw new Error(`[ShowRule] Invalid view for template "${this.vTemplate}": expected a Component, got ${typeof view}.`);
        return view;
    }

    public override async exec(entry: Router.Entry, state: Guard.State, target: Element,): Promise<Guard.Result | undefined> {
        return await this.pipeline.run(entry, state, async (pipeState) => {
            const view = await this.resolve();
            if (this.vLoader) {
                const data = await this.vLoader(entry);
                if (view.render) await view.render(data);
            } else if (view.load) {
                await view.load(entry);
                if (view.render) await view.render();
            } else if (view.render) await view.render();
            const renderer = pipeState.renderer;
            if (!renderer) throw new Error(`[ShowRule] No renderer available to mount "${this.vTemplate}".`);
            renderer.mount(view, target);
        });
    }
}

export namespace ShowRule {
    /** The view kinds a show route accepts: instances or lazy factories. **/
    export type Content = View | (() => View | Promise<View>);
}

export default ShowRule;