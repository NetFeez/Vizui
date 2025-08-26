/**
 * @author NetFeez <netfeez.dev@gmail.com>.
 * @description Adds the router to the vizui.
 * @module vizui
 * @license Apache-2.0
 */

import Events from "../Events.js";

export class Router extends Events<Router.EventMap> {
    private static instance: Router;
    private index: number = 0;
    private history: string[] = [];
    /**
     * Creates an instance of Router.
    */
    private constructor() { super();
        this.history.push(this.page);
        window.addEventListener('popstate', (event) => {
            this.history = [];
            this.index = 0;
            this.history.push(this.page);
            this.emit('change');
        });
    }
    /**
     * Gets the instance of Router.
     * @returns The instance of Router.
    */
    public static getInstance(): Router {
        if (!Router.instance) Router.instance = new Router();
        return Router.instance;
    }
    /**
     * Cleans the url.
     * @param url The url to clean.
     * @returns The cleaned url.
    */
    public cleanUrl(url: string): string {
        if (!url.startsWith('/')) url = this.page + '/' + url;
        if (url.endsWith('/')) url = url.slice(0, -1);
        if (!url.startsWith('/')) url = '/' + url;
        return url;
    }
    /**
     * check if there is a previous page.
     * @returns true if there is a previous page, false otherwise.
    */
    public hasPrevious(): boolean { return this.index > 0 }
    /**
     * check if there is a next page.
     * @returns true if there is a next page, false otherwise.
    */
    public hasNext(): boolean { return this.index < this.history.length - 1; }
    /**
     * Gets the current page.
     * @returns The current page.
    */
    public get page(): string { return this.cleanUrl(window.location.pathname); }
    /**
     * Sets the current page.
     * @param page The page to set.
    */
    public set page(page: string) {

    }
    public set(page: string, change: boolean = true): void {
        page = this.cleanUrl(page);
        if (page === this.page) return;
        const newUrl = new URL(page, window.location.origin);
        window.history.pushState({}, '', newUrl);
        this.history = this.history.slice(0, this.index + 1);
        this.history.push(this.page);
        this.index = this.history.length - 1;
        this.emit('push');
        if (change) this.emit('change');
    }
    /**
     * Goes back to the previous page.
    */
    public back(change: boolean = true): void {
        if (!this.hasPrevious()) return;
        this.index -= 1;
        const previousPage = this.history[this.index];
        if (previousPage === this.page) return;
        const newUrl = new URL(previousPage, window.location.origin);
        window.history.pushState(null, '', newUrl);
        this.emit('back');
        if (change) this.emit('change');
    }
    /**
     * Goes to the next page.
    */
    public next(change: boolean = true): void {
        if (!this.hasNext()) return;
        this.index += 1;
        const nextPage = this.history[this.index];
        if (nextPage === this.page) return;
        const newUrl = new URL(nextPage, window.location.origin);
        window.history.pushState(null, '', newUrl);
        this.emit('next');
        if (change) this.emit('change');
    }
}

export namespace Router {
    export type EventMap = {
        [name in (
            'change' | 'push' | 'back' | 'next'
        )]: Events.Listener
    }
}

export default Router