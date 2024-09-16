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

export class App extends Events {
    private static instance: App;
    private isInit: boolean = false;
    private root: Element<'div'>;
    private renderRules: Rule[] = [];
    public router: Router;
    private components: Map<string, AppComponent> = new Map();
    /**
     * Private constructor for the App class.
     * @param rootElement The root element of the application.
     * @param components The components of the application.
     */
    private constructor(rootElement: string | HTMLDivElement | Element, components?: App.ComponentObject) { 
        super();
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
    public renderRoot(...content: Element[]): void {
        this.root.clean();
        this.root.append(...content);
    }
    /**
     * Initialize the application.
     */
    public init() {
        if (this.isInit) return;
        this.isInit = true;
        this.on('render', () => {
            this.dispatch('routing');
            console.log('[app] >> rendering: ', this.router.getPage());
            let routed = false;
            for (const rule of this.renderRules) {
                if (rule.test(this.router.getPage())) {
                    rule.exec(this);
                    this.dispatch('routed', this.router.getPage());
                    routed = true; break
                }
            }
            // if (!routed) this.content.render(Element.new('h1', `404 - "${this.router.getPage()}" not found`));
        });
        this.router.on('change', () => this.dispatch('render'));
        this.dispatch('render');
    }
    /**
     * Get the root element of the application.
     * @returns The root element.
     */
    public getRoot(): Element<'div'> {
        return this.root;
    }

    on(EventName: 'render', CallBack: Events.CallBack): void;
    on(EventName: 'routing', CallBack: Events.CallBack): void;
    on(EventName: 'routed', CallBack: App.routedCallBack): void;
    on(EventName: string, CallBack: Events.CallBack): void {
        super.on(EventName, CallBack);
    }
    off(EventName: 'render', CallBack: Events.CallBack): void;
    off(EventName: 'routing', CallBack: Events.CallBack): void;
    off(EventName: 'routed', CallBack: App.routedCallBack): void;
    off(EventName: string, CallBack: Events.CallBack): void {
        super.off(EventName, CallBack);
    }
}

export namespace App {
    export type appRenderer = Rule.renderer;
    export type appAuthenticator = Rule.authenticator;
    export type routedCallBack = (page: string) => void;
    export type ElementObject = {
        [key: string]: Element;
    }
    export interface ComponentObject {
        [key: string]: AppComponent;
    };
}
export default App;