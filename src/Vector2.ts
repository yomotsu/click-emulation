export class Vector2 {
	private _x: number;
	private _y: number;

	constructor( x: number = 0, y: number = 0 ) {

		this._x = x;
		this._y = y;

	}

	get isVector2(): true {

		return true;

	}

	get x(): number {

		return this._x;

	}

	set x( x: number ) {

		if ( this._x === x ) return;
		this._x = x;

	}

	get y(): number {

		return this._y;

	}

	set y( y: number ) {

		if ( this._y === y ) return;
		this._y = y;

	}

	set( x: number, y: number ): this {

		if ( this._x !== x || this._y !== y ) {

			this._x = x;
			this._y = y;

		}

		return this;

	}

	add( v: Vector2 ): this {

		return this.set( this.x + v.x, this.y + v.y );

	}

	sub( v: Vector2 ): this {

		return this.set( this.x - v.x, this.y - v.y );

	}

	lengthSq(): number {

		return this.x * this.x + this.y * this.y;

	}

}
