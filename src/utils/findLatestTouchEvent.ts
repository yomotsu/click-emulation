export function findLatestTouchEvent( event: TouchEvent ) {

	const changedTouches = event.changedTouches;
	return changedTouches[ changedTouches.length - 1 ];

}
