/**
 * @author NetFeez <netfeez.dev@gmail.com>
 * @description Discrimination symbols used to identify VizUI types without instanceof.
 * @license Apache-2.0
 */

//
// ========== Core Symbols ==========
//

export const APPENDABLE = Symbol('vizui.appendable');
export const ELEMENT = Symbol('vizui.element');
export const COMPONENT = Symbol('vizui.component');

export const CORE: {
    APPENDABLE: typeof APPENDABLE;
    ELEMENT: typeof ELEMENT;
    COMPONENT: typeof COMPONENT;
} = {
    APPENDABLE,
    ELEMENT,
    COMPONENT,
}

//
// ========== Route Symbols ==========
//

export const RULE_BASE = Symbol('vizui.route.base');
export const RULE_SHOW = Symbol('vizui.route.show');
export const RULE_LAYOUT = Symbol('vizui.route.layout');
export const RULE_SOCKET = Symbol('vizui.route.socket');
export const RULE_ROUTER = Symbol('vizui.route.router');
export const RULE_CUSTOM = Symbol('vizui.route.custom');

export const RULE: {
    BASE: typeof RULE_BASE;
    SHOW: typeof RULE_SHOW;
    LAYOUT: typeof RULE_LAYOUT;
    SOCKET: typeof RULE_SOCKET;
    ROUTER: typeof RULE_ROUTER;
    CUSTOM: typeof RULE_CUSTOM;
} = {
    BASE: RULE_BASE,
    SHOW: RULE_SHOW,
    LAYOUT: RULE_LAYOUT,
    SOCKET: RULE_SOCKET,
    ROUTER: RULE_ROUTER,
    CUSTOM: RULE_CUSTOM,
}

//
// ========== Guard Symbols ==========
//

export const GUARD_BASE = Symbol('vizui.guard.base');
export const GUARD_NAVIGATION = Symbol('vizui.guard.navigation');
export const GUARD_ERROR = Symbol('vizui.guard.error');

export const GUARD: {
    BASE: typeof GUARD_BASE;
    NAVIGATION: typeof GUARD_NAVIGATION;
    ERROR: typeof GUARD_ERROR;
} = {
    BASE: GUARD_BASE,
    NAVIGATION: GUARD_NAVIGATION,
    ERROR: GUARD_ERROR,
}

export const symbols: {
    CORE: typeof CORE;
    RULE: typeof RULE;
    GUARD: typeof GUARD;
} = {
    CORE,
    RULE,
    GUARD,
};

export default symbols;