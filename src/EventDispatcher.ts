export type Listener = ( event: DispatcherEvent ) => void;

export interface DispatcherEvent {
	type: string;
	[ key: string ]: any;
}

export class EventDispatcher {

	protected _listeners: Listener[] = [];

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

	dispatchEvent( event: DispatcherEvent ): void {

		const listenerArray = this._listeners;

		event.target = this;
		const array = listenerArray.slice( 0 );

		for ( let i = 0, l = array.length; i < l; i ++ ) {

			array[ i ].call( this, event );

		}

	}

}
