export interface EmulatedClickEvent {
    type: 'click';
    target: HTMLElement | SVGElement;
    clientX: number;
    clientY: number;
    buttons: number;
    altKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
    timeStamp: number;
}
type Listener = (event: EmulatedClickEvent) => void;
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
    dispatchEvent(event: EmulatedClickEvent): void;
    destroy(): void;
    private _handleClickStart;
    private _handleClickEnd;
}
export {};
