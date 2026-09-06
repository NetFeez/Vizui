/**
 * @author NetFeez <netfeez.dev@gmail.com>.
 * @description Navigation tracker for the SPA router. Tracks a single navigation
 * chain (programmatic + redirect hops), its matched rule, lifecycle status and
 * duration. Adapts the Vortez request tracker to the client navigation flow.
 * @license Apache-2.0
 */

import type Rule from './rule/Rule.js';
import type RouterRule from './rule/RouterRule.js';
import type Router from './Router.js';

export class Tracker {
    /** The unique identifier of the navigation. **/
    public readonly id: string;

    /** The monotonic start time of the navigation. **/
    public readonly startTime: number;

    /** The raw target value of the navigation. **/
    public readonly value: string;

    /** The history action of the navigation. **/
    protected vAction: 'push' | 'replace';

    /** The current lifecycle status of the navigation. **/
    protected vStatus: Tracker.Status = 'initialized';

    /** The rule matched by the navigation, when present. **/
    protected vRule: Rule | RouterRule | null = null;

    /** The entries of the navigation chain. **/
    protected vEntries: Tracker.Entry[] = [];

    /** The cursor pointing at the current chain entry. **/
    protected vIndex = -1;

    /** The error that failed the navigation, when present. **/
    protected vError: unknown | null = null;

    /** The reason of an intentional abort, when present. **/
    protected vAbortReason: unknown | null = null;

    /** Whether the failure was already offered to an error boundary. **/
    protected vErrorOffered = false;

    /**
     * Creates a navigation tracker.
     * @param value - The raw target value of the navigation.
     * @param action - The history action of the navigation.
     */
    public constructor(value: string, action: 'push' | 'replace' = 'push') {
        this.id = Tracker.uuid();
        this.startTime = globalThis.performance?.now() ?? Date.now();
        this.value = value;
        this.vAction = action;
    }

    /** The history action of the navigation. **/
    public get action(): 'push' | 'replace' { return this.vAction; }

    /** The current lifecycle status of the navigation. **/
    public get status(): Tracker.Status { return this.vStatus; }

    /** The rule matched by the navigation, when present. **/
    public get rule(): Rule | RouterRule | null { return this.vRule; }

    /**
     * Assigns the rule matched by the navigation.
     * @param rule - The matched rule, or null to clear it.
     */
    public set rule(rule: Rule | RouterRule | null) {
        if (rule && !this.terminal) this.vStatus = 'routed';
        this.vRule = rule;
    }

    /** The entries of the navigation chain. **/
    public get entries(): Tracker.Entry[] { return [...this.vEntries]; }

    /** The cursor pointing at the current chain entry. **/
    public get index(): number { return this.vIndex; }

    /** The current chain entry, or null when the chain is empty. **/
    public get current(): Tracker.Entry | null { return this.vIndex >= 0 ? this.vEntries[this.vIndex] ?? null : null; }

    /** Whether there is an entry before the current one. **/
    public get hasPrevious(): boolean { return this.vIndex > 0; }

    /** Whether there is an entry after the current one. **/
    public get hasNext(): boolean { return this.vIndex >= 0 && this.vIndex < this.vEntries.length - 1; }

    /** The elapsed time of the navigation in milliseconds. **/
    public get duration(): number {
        const end = globalThis.performance?.now() ?? Date.now();
        return end - this.startTime;
    }

    /** Marks the navigation as matched by a rule. **/
    public markRouted(): void { if (!this.terminal) this.vStatus = 'routed'; }

    /** Marks the navigation as executing. **/
    public markExecuting(): void { if (!this.terminal) this.vStatus = 'executing'; }

    /** Marks the navigation as applied to the application and history. **/
    public markApplied(): void { if (!this.terminal) this.vStatus = 'applied'; }

    /** Marks the navigation as completed. **/
    public complete(): void { if (!this.terminal) this.vStatus = 'completed'; }

    /**
     * Marks the navigation as failed (an error). Terminal: a failed or aborted
     * transaction can never transition again.
     * @param error - The error that failed the navigation.
     */
    public fail(error: unknown): void {
        if (this.terminal) return;
        this.vStatus = 'failed';
        this.vError = error;
    }

    /**
     * Marks the navigation as cancelled intentionally (an abort). Terminal:
     * a failed or aborted transaction can never transition again.
     * @param reason - The reason of the abort, when provided.
     */
    public abort(reason?: unknown): void {
        if (this.terminal) return;
        this.vStatus = 'aborted';
        this.vAbortReason = reason ?? null;
    }

    /**
     * Adds an entry to the navigation chain.
     * @param entry - The entry to push.
     */
    public push(entry: Tracker.Entry): void {
        this.vEntries = [...this.vEntries.slice(0, this.vIndex + 1), entry];
        this.vIndex = this.vEntries.length - 1;
    }

    /**
     * Replaces the current entry of the navigation chain.
     * @param entry - The entry to write.
     */
    public replace(entry: Tracker.Entry): void {
        const index = Math.max(this.vIndex, 0);
        this.vEntries[index] = entry;
        if (index === 0) { this.vIndex = 0; }
    }

    /**
     * Moves one entry back in the navigation chain.
     * @returns The entry now current, or null at the beginning of the chain.
     */
    public back(): Tracker.Entry | null {
        if (this.vIndex <= 0) return null;
        this.vIndex -= 1;
        return this.current;
    }

    /**
     * Moves one entry forward in the navigation chain.
     * @returns The entry now current, or null at the end of the chain.
     */
    public forward(): Tracker.Entry | null {
        if (this.vIndex >= this.vEntries.length - 1) return null;
        this.vIndex += 1;
        return this.current;
    }

    /** The error that failed the navigation, when present. **/
    public get error(): unknown | null { return this.vError; }

    /** The reason of an intentional abort, when present. **/
    public get abortReason(): unknown | null { return this.vAbortReason; }

    /** Whether the failing transaction was already offered to an error boundary. **/
    public get errorOffered(): boolean { return this.vErrorOffered; }

    /** Records that an error boundary ran for this transaction (idempotent). **/
    public markErrorOffered(): void { this.vErrorOffered = true; }

    /** Whether the transaction reached a terminal state (failed or aborted). **/
    protected get terminal(): boolean {
        return this.vStatus === 'failed' || this.vStatus === 'aborted';
    }

    /**
     * Generates a unique identifier for a tracker.
     * @returns A random uuid, or a fallback when the platform lacks crypto.
     */
    public static uuid(): string {
        const crypto = globalThis.crypto;
        if (crypto?.randomUUID) return crypto.randomUUID();
        return `tracker-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
}

export namespace Tracker {
    /** A parsed entry of the navigation chain. **/
    export interface Entry {
        path: string;
        search: string;
        hash: string;
        query: URLSearchParams;
        params: Router.Params;
    }

    /** The lifecycle statuses of a navigation. **/
    export type Status = 'initialized' | 'routed' | 'executing' | 'applied' | 'completed' | 'failed' | 'aborted';
}

export default Tracker;