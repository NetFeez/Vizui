"use strict";
/**
 * @author NetFeez <netfeez.dev@gmail.com>.
 * @description adds a class to create components with js/ts.
 * @module vizui
 * @license Apache-2.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Component = void 0;
const Element_js_1 = __importDefault(require("./Element.js"));
const Events_js_1 = __importDefault(require("./Events.js"));
const DynamicCSS_js_1 = __importDefault(require("./DynamicCSS.js"));
class Component extends Events_js_1.default {
    /** The dynamic css loader. */
    static css = DynamicCSS_js_1.default;
    /** The component element. */
    get element() { return this.root; }
    /** Gets if the element is connected with the DOM. */
    get isConnected() { return this.root.isConnected; }
    /**
     * Renders the component.
     * @param parent The parent element.
     * @param clean If true, the parent element will be cleaned.
     * @returns The component.
     */
    render(parent, clean = false) {
        if (clean) {
            if (parent instanceof Element_js_1.default)
                parent.clean();
            else
                parent.innerHTML = '';
        }
        this.root.appendTo(parent);
        return this;
    }
    /**
     * Appends one/multiple children to the component.
     * @param childs The elements to be appended.
     */
    append(...childs) {
        this.root.append(...childs);
        return this;
    }
    /**
     * Appends this element to a parent.
     * @param parent The parent to append this element.
     */
    appendTo(parent) {
        this.root.appendTo(parent);
        return this;
    }
    /**
     * Replace this component for other component/element.
     * @param element - The new element.
     * @returns This component.
     */
    replaceWith(element) {
        this.root.replaceWith(element);
        return this;
    }
    /**
     * Remove this component.
     * @returns This component.
     */
    remove() {
        this.root.remove();
        return this;
    }
}
exports.Component = Component;
exports.default = Component;
//# sourceMappingURL=Component.js.map