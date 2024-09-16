/**
 * @author NetFeez <netfeez.dev@gmail.com>.
 * @description Adds a class to create a menu.
 * @module vizui
 * @license Apache-2.0
 */

import Element from '../Element.js';
import Button from '../App/basic.components/Button.js';
import App from './App.js';

export class Menu {
    private root: Element<'nav'>;
    private icon: Element<'img'>;
    private title: Element<'h1'>;
    private options: Element<'div'>;
    private app: App;
    /**
     * Creates a menu.
     * @param rootElement The root element of the menu.
     * @param app The app of the menu.
    */
    public constructor(rootElement: Element<'nav'>, app: App) {
        this.root = rootElement;
        this.app = app;
        this.icon = Element.new('img', null, { src: '/client/src/logo.png' });
        this.title = Element.new('h1', 'Sky Gallery');
        this.options = Element.new('div', null, { id: 'menuOptions' });
        const logo = Element.new('a')
        .setAttribute('class', 'Logo Button')
            .setAttribute('class', 'Logo')
            .on('click', () => this.app.router.setPage('/'))
            .append(this.icon, this.title);
        this.root.append(logo, this.options);
    }
    /**
     * render the menu.
     * @param buttons The buttons of the menu.
    */
    render(buttons: Menu.menuOptions) {
        this.options.clean();
        for (const key in buttons) {
            const content = buttons[key]
            const button = new Button(key);
            if (content instanceof Function) button.on('click', content);
            else {
                const changePage = () => this.app.router.setPage(content);
                button.on('click', changePage);
            }
            this.options.append(button);
        }
    }
}

export namespace Menu {
    export interface menuOptions {
        [name: string]: string | ((this: HTMLElement, event: MouseEvent) => void);
    }
}

export default Menu;