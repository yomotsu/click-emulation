import { Vector2 } from './Vector2';
import { isTouchEvent } from './utils/isTouchEvent';
import { findLatestTouchEvent } from './utils/findLatestTouchEvent';
interface OngoingTouch {
	startX: number,
	startY: number,
	startTime: number,
	touch: Touch | MouseEvent,
}
export interface EmulatedClickEvent {
	type: 'click';
	target: HTMLElement | SVGElement;
	clientX: number;
	clientY: number;
	buttons: number; // 0 | 1 | 2 | 4 | 8 | 16;
	altKey: boolean;
	ctrlKey: boolean;
	shiftKey: boolean;
	timeStamp: number;
}

type Listener = ( event: EmulatedClickEvent ) => void;

// クリックとして有効な範囲のピクセル数
// クリック開始から thresholdLength 以上動いていた場合はクリックとして扱わない
const THRESHOLD_LENGTH = 16;
const THRESHOLD_LENGTH_SQ = THRESHOLD_LENGTH * THRESHOLD_LENGTH;
// touchstart から touchend までで、クリックを無効にするまでの時間。ミリ秒
const CLICK_TIMEOUT = 1000;

export class ClickEmulation {

	private _$el: HTMLElement | SVGElement;
	private _targetElement: HTMLElement | SVGElement | null = null;
	private _ongoingTouches: OngoingTouch[] = [];
	private _clickStart: ( event: Event ) => void;
	private _clickEnd: ( event: Event ) => void;
	private _clickStartPosition = new Vector2();
	private _clickEndPosition = new Vector2();

	private _listeners: Listener[] = [];

	constructor( $el: HTMLElement | SVGElement ) {

		this._$el = $el;

		this._clickStart = this._handleClickStart.bind( this );
		this._clickEnd = this._handleClickEnd.bind( this );
		this._$el.addEventListener( 'mousedown', this._clickStart );
		this._$el.addEventListener( 'touchstart', this._clickStart );

	}

	addEventListener( listener: Listener ): void {

		this._listeners.push( listener );

	}

	removeEventListener( listener: Listener ): void {

		const index = this._listeners.indexOf( listener );
		if ( index !== - 1 ) this._listeners.splice( index, 1 );

	}

	removeAllEventListeners(): void {

		this._listeners = [];
		return;

	}

	dispatchEvent( event: EmulatedClickEvent ): void {

		const listenerArray = this._listeners;
		const array = listenerArray.slice( 0 );

		for ( let i = 0, l = array.length; i < l; i ++ ) {

			array[ i ].call( this, event );

		}

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

		if (
			! ( _event.target instanceof HTMLElement ) &&
			! ( _event.target instanceof SVGElement )
		) {

			this._targetElement = null;
			return;

		}

		this._targetElement = _event.target;

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
		this._clickStartPosition.set( ongoingTouch.startX, ongoingTouch.startY );
		this._clickEndPosition.set( touch.clientX, touch.clientY );
		const moveLength = this._clickEndPosition
			.sub( this._clickStartPosition )
			.lengthSq();

		if ( THRESHOLD_LENGTH_SQ < moveLength ) return;

		this.dispatchEvent( {
			type: 'click',
			target: this._targetElement,
			clientX: touch.clientX,
			clientY: touch.clientY,
			buttons: 'buttons' in ongoingTouch.touch ? ongoingTouch.touch.buttons : 1,
			altKey: 'altKey' in ongoingTouch.touch ? ongoingTouch.touch.altKey : false,
			ctrlKey: 'ctrlKey' in ongoingTouch.touch ? ongoingTouch.touch.ctrlKey : false,
			shiftKey: 'shiftKey' in ongoingTouch.touch ? ongoingTouch.touch.shiftKey : false,
			timeStamp: event.timeStamp,
		} );

	}

}
