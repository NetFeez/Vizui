import Element from './Element.js';

export class DynamicCSS {
    private static cache = new Map<string, Promise<boolean>>();
    /**
     * Loads an external css file.
     * @param url - The url of the css file.
     * @returns A promise that resolves when the css file is loaded.
     */
    public static load(url: string): Promise<boolean> {
        url = url.trim().replace(/\/$/g, '');

        const early = this.checkCacheOrDOM(url);
        if (early) return early;

        const link = Element.new('link', null, { rel: 'stylesheet', href: url });
        const promise = new Promise<boolean>(resolve => {
            link.on('load', this.loadHandler.bind(this, url, resolve));
            link.on('error', this.errorHandler.bind(this, url, resolve));
            link.appendTo(Element.head);
        });

        this.cache.set(url, promise);
        return promise;
    }
    /**
     * Checks if an external css file is already loaded.
     * @param url - The url of the css file.
     * @returns A promise that resolves when the css file is loaded.
     */
    private static checkCacheOrDOM(url: string): Promise<boolean> | null {
        const cached = this.cache.get(url);
        if (cached) return cached;

        const current = Element.head.querySelector(`link[href="${url}"]`);
        if (current) return Promise.resolve(true);

        return null;
    }
    /**
     * Handler load success.
     * @param url - The url of the css file.
     * @param resolve - The resolve function.
     */
    private static loadHandler(url: string, resolve: DynamicCSS.resolve) {
        console.log(`[dynCSS] loaded css from: ${url}`);
        resolve(true);
    }
    /**
     * Handle load failure.
     * @param url - The url of the css file.
     * @param resolve - The resolve function.
     */
    private static errorHandler(url: string, resolve: DynamicCSS.resolve) {
        console.log(`[dynCSS] failed to load css from: ${url}`);
        resolve(false);
        this.cache.delete(url);
    }
}
export namespace DynamicCSS {
    export type resolve = (result: boolean) => void;
}
export default DynamicCSS;