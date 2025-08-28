/**
 * @author NetFeez <netfeez.dev@gmail.com>.
 * @description add the rule class to the app.
 * @module vizui
 * @license Apache-2.0
*/

import App from './App.js';

export class Rule {
    public urlRule: string;
    public expression: RegExp;
    private authExec: Rule.authenticator;
    private renderExec: Rule.renderer;
    /**
     * Creates a new rule.
     * @param urlRule The url rule.
     * @param renderExec The render function.
     * @param authExec The authentication function.
     */
    public constructor(urlRule: string, renderExec: Rule.renderer, authExec?: Rule.authenticator) {
        urlRule = !urlRule.startsWith('/') ? `/${urlRule}` : urlRule;
        urlRule = urlRule.endsWith('/') ? urlRule.slice(0, -1) : urlRule;
        this.urlRule = urlRule;
        this.expression = this.createExpression(urlRule);
        this.renderExec = renderExec;
        this.authExec = authExec ?? (() => true);
    }
    /**
     * Executes the rule.
     * @param app The app.
     */
    public async exec(app: App, url?: string): Promise<void> {
        if (!this.testAuth()) return;
        const params = this.getParams(url ?? app.router.page);
        await this.renderExec(params, app);
    }
    /**
     * Tests the rule.
     * @param url The url to test.
     */
    public test(url: string): boolean {
        return this.expression.test(url);
    }
    /**
     * Tests the authentication.
     */
    public async testAuth(): Promise<boolean> {
        return !this.authExec || await this.authExec();
    }
    /**
     * Gets the parameters from the url.
     * @param url The url.
     */
    public getParams(url: string): Rule.ruleParams {
        const match = this.expression.exec(url);
        if (!match || !match.groups) return {};
        return { ...match.groups };
    }
    /**
     * Creates the expression.
     * @param urlRule The url rule.
     */
    private createExpression(urlRule: string): RegExp {
        const validators = {
            paramRequired: /^\$(?<param>.+)$/,
            paramOptional: /^\$\?(?<param>.+)$/,
            escape: /\\(?![\$\[\]\*\+\?\.\(\)\{\}\^\|\-])|(?<!\\)[\$\[\]\*\+\?\.\(\)\{\}\^\|\-]/gi,
        };
        const zones = urlRule.split('/').slice(1);
        let generated = '^';

        for (let index = 0; index < zones.length; index ++) {
            const zone = zones[index];

            if (zone == '*') {
                const isLast = (index + 1) == (zones.length - 1);
                generated += isLast ? '(?:/[^/]+)' : '(?:/.+)?';
                continue;
            }

            const optional = validators.paramOptional.exec(zone);
            if (optional && optional.groups) {
                const param = optional.groups['param'].replace(validators.escape, '');
                generated += `(?:/(?<${param}>[^/]+))?`;
                continue;
            }

            const required = validators.paramRequired.exec(zone);
            if (required && required.groups) {
                const param = required.groups['param'].replace(validators.escape, '');
                generated += `/(?<${param}>[^/]+)`;
                continue;
            }

            generated += `/${zone.replace(validators.escape, '')}`;
        }
        return new RegExp(`${generated}/?$`);
    }
}

export namespace Rule {
    export interface ruleParams {
        [name: string]: string | undefined;
    }
    export type authenticator = () => boolean | Promise<boolean>;
    export type renderer = (params: ruleParams, app: App) => void | Promise<void>;
}

export default Rule;