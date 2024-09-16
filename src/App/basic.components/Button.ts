import Element from "../../Element.js";
import Component from "../../Component.js";

export class Button extends Component<'button'> {
    protected component: Element<"button">;
    public constructor(
        protected value: string,
        options: Button.options = {}
    ) { super();
        const btnClass = 'Button' + (options.class ? ' ' + options.class : '');
        const btnId = options.id ? options.id : '';
        this.component = Element.new('button', value, {
            class: btnClass, id: btnId
        });
    }
    public get text(): string { return this.value }
    public set text(value: string) { this.value = value; this.component.text(value); }
    on<E extends keyof Element.Events>(eventName: E, listener: Element.Events[E], option?: Element.Events.Options): this {
        this.component.on(eventName, listener, option);
        return this;
    }
}

export namespace Button {
    export interface options {
        class?: string,
        id?: string
    }
}

export default Button;