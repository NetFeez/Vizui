/**
 * @author NetFeez <netfeez.dev@gmail.com>.
 * @description add the rule class to the app.
 * @module vizui
 * @license Apache-2.0
*/

import App from './App.js';

export class Rule {
    public urlRule: string;
    private expression: RegExp;
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
    public exec(app: App) {
        if (!this.testAuth()) return;
        const params = this.getParams(app.router.getPage());
        this.renderExec(params, app);
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
    public testAuth(): boolean {
        return !this.authExec || this.authExec();
    }
    /**
     * Gets the parameters from the url.
     * @param url The url.
     */
    public getParams(url: string): Rule.ruleParams {
        const match = this.expression.exec(url);
        if (!match) return {};
        return {...match.groups};
    }
    /**
     * Creates the expression.
     * @param urlRule The url rule.
     */
    private createExpression(urlRule: string): RegExp {
        const validators = {
            param: /^\$(?<param>.+)$/,
            escape: /\\(?![\$\[\]\*\+\?\.\(\)\{\}\^\|\-])|(?<!\\)[\$\[\]\*\+\?\.\(\)\{\}\^\|\-]/gi,
        };
        const zones = urlRule.split('/').slice(1);
        let regExpString = '^';
        for (let index = 0; index < zones.length; index ++) {
            const zone = zones[index];
            regExpString += '\/';
            if (validators.param.test(zone)) {
                const match = validators.param.exec(zone);
                if (match && match.groups) {
                    const param = match.groups['param']
                        .replace(validators.escape, '');
                    regExpString += `(?<${param}>[^\/]+?)`;
                }
            } else if (zone == '*') {
                regExpString += index < (zones.length -1)
                    ? '(?:[^\/]+)?'
                    : '(?:.+)?';
            } else regExpString += zone;
        }
        regExpString += '\/?$';
        return new RegExp(regExpString);;
    }
}

export namespace Rule {
    export interface ruleParams {
        [name: string]: string | undefined;
    }
    export type authenticator = () => boolean;
    export type renderer = (params: ruleParams, app: App) => void;
}

export default Rule;