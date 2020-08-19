import { EventDispatcher } from './EventDispatcher';
import { Vector2 } from './Vector2';
import { isTouchEvent } from './utils/isTouchEvent';
import { findLatestTouchEvent } from './utils/findLatestTouchEvent';

const clickStartPosition = new Vector2();
const clickEndPosition = new Vector2();

export interface EmulatedClickEvent {
	type: 'click';
	target: Element;
}

interface OngoingTouch {
	startX: number,
	startY: number,
	startTime: number,
	touch: Touch | MouseEvent,
}

// クリックとして有効な範囲のピクセル数
// クリック開始から thresholdLength 以上動いていた場合はクリックとして扱わない
const THRESHOLD_LENGTH = 20;
const THRESHOLD_LENGTH_SQ = THRESHOLD_LENGTH * THRESHOLD_LENGTH;
// touchstart から touchend までで、クリックを無効にするまでの時間。ミリ秒
const CLICK_TIMEOUT = 1000;

export class ClickEmulation extends EventDispatcher {

	private _$el: Element;
	private _targetElement: Element | null = null;
	private _ongoingTouches: OngoingTouch[] = [];
	private _clickStart: ( event: Event ) => void;
	private _clickEnd: ( event: Event ) => void;

	constructor( $el: Element ) {

		super();

		this._$el = $el;

		this._clickStart = this._handleClickStart.bind( this );
		this._clickEnd = this._handleClickEnd.bind( this );
		this._$el.addEventListener( 'mousedown', this._clickStart );
		this._$el.addEventListener( 'touchstart', this._clickStart );

	}

	destroy(): void {

		this._$el.removeEventListener( 'mousedown', this._clickStart );
		this._$el.removeEventListener( 'touchstart', this._clickStart );
		document.removeEventListener( 'mouseup', this._clickEnd );
		document.removeEventListener( 'touchend', this._clickEnd );

	}

	private _handleClickStart( event: Event ) {

		event.preventDefault();

		if ( this._ongoingTouches.length === 0 ) {

			document.removeEventListener( 'mouseup', this._clickEnd );
			document.removeEventListener( 'touchend', this._clickEnd );

		}

		const _event = isTouchEvent( event )
			? findLatestTouchEvent( event as TouchEvent )
			: event as MouseEvent;

		if ( _event.target instanceof Element ) {

			this._targetElement = _event.target;

		} else {

			this._targetElement = null;
			return;

		}

		this._ongoingTouches.push( {
			startX: _event.clientX,
			startY: _event.clientY,
			startTime: performance.now(),
			touch: _event,
		} );

		if ( this._ongoingTouches.length === 1 ) {

			document.addEventListener( 'mouseup', this._clickEnd );
			document.addEventListener( 'touchend', this._clickEnd );

		}

	}

	private _handleClickEnd( event: Event ) {

		const _isTouchEvent = isTouchEvent( event );

		if ( this._ongoingTouches.length <= 1 ) {

			document.removeEventListener( 'mouseup', this._clickEnd );
			document.removeEventListener( 'touchend', this._clickEnd );

		}

		const touch = _isTouchEvent
			? ( event as TouchEvent ).changedTouches[ 0 ]
			: event as MouseEvent;

		const ongoingTouchIndex = _isTouchEvent
			? this._ongoingTouches.findIndex( ( o ) => ( o.touch as Touch ).identifier === ( touch as Touch ).identifier )
			: 0;

		const ongoingTouch = this._ongoingTouches[ ongoingTouchIndex ];
		this._ongoingTouches.splice( ongoingTouchIndex, 1 );

		const clickEndTime = performance.now();
		const elapsed = clickEndTime - ongoingTouch.startTime;

		if ( ! this._targetElement ) return;

		// 長すぎるクリックは無効
		if ( elapsed > CLICK_TIMEOUT ) return;

		// クリック開始時から距離が動きすぎた場合は無効
		clickStartPosition.set( ongoingTouch.startX, ongoingTouch.startY );
		clickEndPosition.set( touch.clientX, touch.clientY );
		const moveLength = clickEndPosition
			.sub( clickStartPosition )
			.lengthSq();

		if ( THRESHOLD_LENGTH_SQ < moveLength ) return;

		const target = this._targetElement;

		// その他の touchend よりも後に発火させたい。
		// 別スレッドにて実行し、後回しにする。
		setTimeout( () => this.dispatchEvent( { type: 'click', target } ), 0 );

	}

}
