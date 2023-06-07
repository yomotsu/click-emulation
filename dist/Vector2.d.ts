export declare class Vector2 {
    private _x;
    private _y;
    constructor(x?: number, y?: number);
    get isVector2(): true;
    get x(): number;
    set x(x: number);
    get y(): number;
    set y(y: number);
    set(x: number, y: number): this;
    add(v: Vector2): this;
    sub(v: Vector2): this;
    lengthSq(): number;
}
