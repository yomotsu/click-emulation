export declare type Listener = (event?: DispatcherEvent) => void;
export interface DispatcherEvent {
    type: string;
    [key: string]: any;
}
export declare class EventDispatcher {
    protected _listeners: Listener[];
    addEventListener(listener: Listener): void;
    removeEventListener(listener: Listener): void;
    removeAllEventListeners(): void;
    dispatchEvent(event: DispatcherEvent): void;
}
