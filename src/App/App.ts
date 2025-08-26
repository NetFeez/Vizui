/**
 * @author NetFeez <netfeez.dev@gmail.com>.
 * @description Vizui is a module to create web applications SPA with js/ts.
 * @module vizui
 * @license Apache-2.0
 */
import Element from "../Element.js";
import Events from "../Events.js";
import Router from "./Router.js";
import Rule from "./Rule.js";
import AppComponent from "./AppComponent.js";

export class App extends Events<App.eventMap> {
    private static instance: App;
    public readonly root: Element<'div'>;
    public readonly router: Router;
    private isInit: boolean = false;
    private renderRules: Rule[] = [];
    private components: Map<string, AppComponent> = new Map();
    /**
     * Private constructor for the App class.
     * @param rootElement The root element of the application.
     * @param components The components of the application.
     */
    private constructor(rootElement: string | HTMLDivElement | Element, components?: App.ComponentObject) {  super();
        if (rootElement instanceof Element) this.root = rootElement;
        else if (rootElement instanceof HTMLDivElement) this.root = new Element(rootElement);
        else if (typeof rootElement === 'string') {
            const root = Element.get(rootElement); Element.new('div', null, { id: 'root' });
            if (!root) throw new Error('root element not found');
            this.root = root;
        } else throw new Error('rootElement must be a string an HTMLDivElement or an Element');
        this.router = Router.getInstance();
        if (components) this.components = new Map(Object.entries(components));
        console.log('app root:', this.root);
    }
    /**
     * Get the instance of the App class.
     * @param rootElement The root element of the application.
     * @param components The components of the application.
     * @returns The instance of the App class.
     */
    public static getInstance(rootElement?: string | Element | HTMLDivElement, components?: App.ComponentObject): App {
        if (App.instance) return App.instance;
        if (!rootElement) throw new Error('rootElement is required to init App singleton');
        App.instance = new App(rootElement, components);
        return App.instance;
    }
    /**
     * Add a render rule to the application.
     * @param urlRule The url rule to match.
     * @param renderExec The function to execute when the rule is matched.
     * @param authExec The function to execute to check if the user is authenticated.
     */
    public addRender(urlRule: string, renderExec: Rule.renderer, authExec?: Rule.authenticator) {
        if (this.isInit) throw new Error('[addRender]: App is already initialized');
        this.renderRules.push(new Rule(urlRule, renderExec, authExec));
    }
    /**
     * Delete a render rule from the application.
     * @param urlRule The url rule to delete.
     */
    public delRender(urlRule: string) {
        if (this.isInit) throw new Error('[delRender]: App is already initialized');
        this.renderRules = this.renderRules.filter((rule) => rule.urlRule != urlRule);
    }
    /**
     * Set the components of the application.
     * @param component The components to set.
     */
    public setComponents(component: App.ElementObject) {
        if (this.isInit) throw new Error('[setComponent]: App is already initialized');
        for (const key in component) {
            this.addComponent(key, component[key]);
        }
    }
    /**
     * Add a component to the application.
     * @param name The name of the component.
     * @param component The component to add.
     */
    public addComponent(name: string, component: Element) {
        if (this.isInit) throw new Error('[addComponent]: App is already initialized');
        this.components.set(name, new AppComponent(component));
    }
    /**
     * Delete a component from the application.
     * @param name The name of the component to delete.
     */
    public delComponent(name: string) {
        if (this.isInit) throw new Error('[delComponent]: App is already initialized');
        this.components.delete(name);
    }
    /**
     * Get a component from the application.
     * @param name The name of the component to get.
     * @returns The component.
     */
    public getComponent(name: string): AppComponent {
        const component = this.components.get(name);
        if (!component) throw new Error(`[getComponent]: Component "${name}" not found`);
        return component;
    }
    /**
     * Render the root element of the application.
     * @param content The content to render.
     */
    public renderRoot(...content: Element.ChildType[]): void {
        this.root.clean();
        this.root.append(...content);
    }
    /**
     * Register a worker in the application.
     * @param url The url of the worker.
     * @param options The options of the worker.
     * @returns The worker registration.
     */
    public async registerWorker(url: string, options: App.WorkerOptions): Promise<ServiceWorkerRegistration | null> {
        if (!navigator.serviceWorker) return null;
        try {
            const registration = await navigator.serviceWorker.register(url, options);
            if (registration.installing) console.log('[app]: worker installing: ', registration.installing);
            else if (registration.waiting) console.log('[app]: worker waiting: ', registration.waiting);
            else if (registration.active) console.log('[app]: worker active: ', registration.active);
            else console.log('[app]: worker not registered');
            return registration;
        } catch (err) {
            console.error('[App]: error registering worker: ', err);
            return null;
        }
    }
    /**
     * Initialize the application.
     */
    public init() {
        if (this.isInit) return;
        this.isInit = true;
        this.on('render', () => {
            this.emit('routing');
            console.log('[app] >> rendering: ', this.router.page);
            let routed = false;
            for (const rule of this.renderRules) {
                if (rule.test(this.router.page)) {
                    rule.exec(this);
                    this.emit('routed', this.router.page);
                    routed = true; break
                }
            }
            // if (!routed) this.content.render(Element.new('h1', `404 - "${this.router.page}" not found`));
        });
        this.router.on('change', () => this.emit('render'));
        this.emit('render');
    }
}

export namespace App {
    export type eventMap = {
        render: Events.Listener;
        routing: Events.Listener;
        routed: App.routedCallBack;
    }
    export type appRenderer = Rule.renderer;
    export type appAuthenticator = Rule.authenticator;
    export type routedCallBack = (page: string) => void;
    export type ElementObject = {
        [key: string]: Element;
    }
    export interface ComponentObject {
        [key: string]: AppComponent;
    };
    export interface WorkerOptions {
        type?: 'module' | 'classic';
        scope?: string;
        updateViaCache?: 'all' | 'imports' | 'none';
    }
}
export default App;