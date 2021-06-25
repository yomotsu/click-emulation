import { EventDispatcher } from './EventDispatcher';
export interface EmulatedClickEvent {
    type: 'click';
    target: Element;
}
export declare class ClickEmulation extends EventDispatcher {
    private _$el;
    private _targetElement;
    private _ongoingTouches;
    private _clickStart;
    private _clickEnd;
    private _clickStartPosition;
    private _clickEndPosition;
    constructor($el: Element);
    destroy(): void;
    private _handleClickStart;
    private _handleClickEnd;
}
