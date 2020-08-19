export declare class Vector2 {
    private _x;
    private _y;
    constructor(x?: number, y?: number);
    readonly isVector2: true;
    x: number;
    y: number;
    set(x: number, y: number): this;
    add(v: Vector2): this;
    sub(v: Vector2): this;
    lengthSq(): number;
}
