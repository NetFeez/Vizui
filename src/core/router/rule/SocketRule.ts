/**
 * @author NetFeez <netfeez.dev@gmail.com>.
 * @description Route that connects a client socket. Reinterprets Vortez WsRule for the
 * browser: each navigation to the route closes a previous socket owned by the route
 * and connects a fresh one, delivering it to the handler after the route pipeline.
 * @license Apache-2.0
 */

import { RULE } from '../../symbols.js';

import Pipeline from '../pipeline/Pipeline.js';

import type Element from '../../element/Element.js';
import type Guard from '../pipeline/Guard.js';
import type Tracker from '../Tracker.js';
import type Router from '../Router.js';

import Socket from '../../network/Socket.js';

import Rule from './Rule.js';

export class SocketRule extends Rule<SocketRule.Content> {
    public [RULE.SOCKET] = true;
    public readonly identifier = 'socket';

    /** The socket currently connected by the route. **/
    protected vSocket: Socket | null = null;

    /**
     * Creates a socket route.
     * @param template - The url template of the route.
     * @param content - The handler receiving the connected socket.
     * @param pipeline - The per-route pipeline.
     */
    public constructor(template: string, content: SocketRule.Content, pipeline: Pipeline = new Pipeline()) {
        super(template, content, pipeline);
    }

    /**
     * Resolves the socket URL from the route template, deriving the scheme
     * from the current location when the template has none.
     * @returns The absolute websocket url.
     */
    public resolveUrl(): string {
        const template = this.vTemplate;
        if (template.includes('://')) return template;
        const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
        return `${scheme}://${window.location.host}${template}`;
    }

    public override async exec(entry: Router.Entry, state: Guard.State): Promise<Guard.Result | undefined> {
        return await this.pipeline.run(entry, state, async () => {
            if (this.vSocket) this.vSocket.close();
            const socket = Socket.connect(this.resolveUrl());
            this.vSocket = socket;
            await this.vContent(socket);
        });
    }
}

export namespace SocketRule {
    /** The handler receiving the socket connected by the route. **/
    export type Content = (socket: Socket) => void | Promise<void>;
}

export default SocketRule;