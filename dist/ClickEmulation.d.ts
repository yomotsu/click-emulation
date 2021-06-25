export interface EmulatedClickEvent {
    type: 'click';
    target: Element;
}
interface ClickEmulationClickEvent {
    type: 'click';
    target: HTMLElement | SVGElement;
    clientX: number;
    clientY: number;
}
declare type Listener = (event: ClickEmulationClickEvent) => void;
export declare class ClickEmulation {
    private _$el;
    private _targetElement;
    private _ongoingTouches;
    private _clickStart;
    private _clickEnd;
    private _clickStartPosition;
    private _clickEndPosition;
    private _listeners;
    constructor($el: HTMLElement | SVGElement);
    addEventListener(listener: Listener): void;
    removeEventListener(listener: Listener): void;
    removeAllEventListeners(): void;
    dispatchEvent(event: ClickEmulationClickEvent): void;
    destroy(): void;
    private _handleClickStart;
    private _handleClickEnd;
}
export {};
