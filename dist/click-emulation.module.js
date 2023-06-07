/*!
 * click-emulation
 * https://github.com/yomotsu/click-emulation
 * (c) 2020 @yomotsu
 * Released under the MIT License.
 */
class Vector2 {
    constructor(x = 0, y = 0) {
        this._x = x;
        this._y = y;
    }
    get isVector2() {
        return true;
    }
    get x() {
        return this._x;
    }
    set x(x) {
        if (this._x === x)
            return;
        this._x = x;
    }
    get y() {
        return this._y;
    }
    set y(y) {
        if (this._y === y)
            return;
        this._y = y;
    }
    set(x, y) {
        if (this._x !== x || this._y !== y) {
            this._x = x;
            this._y = y;
        }
        return this;
    }
    add(v) {
        return this.set(this.x + v.x, this.y + v.y);
    }
    sub(v) {
        return this.set(this.x - v.x, this.y - v.y);
    }
    lengthSq() {
        return this.x * this.x + this.y * this.y;
    }
}

function isTouchEvent(event) {
    return 'TouchEvent' in window && event instanceof TouchEvent;
}

function findLatestTouchEvent(event) {
    const changedTouches = event.changedTouches;
    return changedTouches[changedTouches.length - 1];
}

// クリックとして有効な範囲のピクセル数
// クリック開始から thresholdLength 以上動いていた場合はクリックとして扱わない
const THRESHOLD_LENGTH = 16;
const THRESHOLD_LENGTH_SQ = THRESHOLD_LENGTH * THRESHOLD_LENGTH;
// touchstart から touchend までで、クリックを無効にするまでの時間。ミリ秒
const CLICK_TIMEOUT = 1000;
class ClickEmulation {
    constructor($el) {
        this._targetElement = null;
        this._ongoingTouches = [];
        this._clickStartPosition = new Vector2();
        this._clickEndPosition = new Vector2();
        this._listeners = [];
        this._$el = $el;
        this._clickStart = this._handleClickStart.bind(this);
        this._clickEnd = this._handleClickEnd.bind(this);
        this._$el.addEventListener('mousedown', this._clickStart);
        this._$el.addEventListener('touchstart', this._clickStart);
    }
    addEventListener(listener) {
        this._listeners.push(listener);
    }
    removeEventListener(listener) {
        const index = this._listeners.indexOf(listener);
        if (index !== -1)
            this._listeners.splice(index, 1);
    }
    removeAllEventListeners() {
        this._listeners = [];
        return;
    }
    dispatchEvent(event) {
        const listenerArray = this._listeners;
        const array = listenerArray.slice(0);
        for (let i = 0, l = array.length; i < l; i++) {
            array[i].call(this, event);
        }
    }
    destroy() {
        this._$el.removeEventListener('mousedown', this._clickStart);
        this._$el.removeEventListener('touchstart', this._clickStart);
        document.removeEventListener('mouseup', this._clickEnd);
        document.removeEventListener('touchend', this._clickEnd);
    }
    _handleClickStart(event) {
        event.preventDefault();
        if (this._ongoingTouches.length === 0) {
            document.removeEventListener('mouseup', this._clickEnd);
            document.removeEventListener('touchend', this._clickEnd);
        }
        const _event = isTouchEvent(event)
            ? findLatestTouchEvent(event)
            : event;
        if (!(_event.target instanceof HTMLElement) &&
            !(_event.target instanceof SVGElement)) {
            this._targetElement = null;
            return;
        }
        this._targetElement = _event.target;
        this._ongoingTouches.push({
            startX: _event.clientX,
            startY: _event.clientY,
            startTime: performance.now(),
            touch: _event,
        });
        if (this._ongoingTouches.length === 1) {
            document.addEventListener('mouseup', this._clickEnd);
            document.addEventListener('touchend', this._clickEnd);
        }
    }
    _handleClickEnd(event) {
        const _isTouchEvent = isTouchEvent(event);
        if (this._ongoingTouches.length <= 1) {
            document.removeEventListener('mouseup', this._clickEnd);
            document.removeEventListener('touchend', this._clickEnd);
        }
        const touch = _isTouchEvent
            ? event.changedTouches[0]
            : event;
        const ongoingTouchIndex = _isTouchEvent
            ? this._ongoingTouches.findIndex((o) => o.touch.identifier === touch.identifier)
            : 0;
        const ongoingTouch = this._ongoingTouches[ongoingTouchIndex];
        this._ongoingTouches.splice(ongoingTouchIndex, 1);
        const clickEndTime = performance.now();
        const elapsed = clickEndTime - ongoingTouch.startTime;
        if (!this._targetElement)
            return;
        // 長すぎるクリックは無効
        if (elapsed > CLICK_TIMEOUT)
            return;
        // クリック開始時から距離が動きすぎた場合は無効
        this._clickStartPosition.set(ongoingTouch.startX, ongoingTouch.startY);
        this._clickEndPosition.set(touch.clientX, touch.clientY);
        const moveLength = this._clickEndPosition
            .sub(this._clickStartPosition)
            .lengthSq();
        if (THRESHOLD_LENGTH_SQ < moveLength)
            return;
        this.dispatchEvent({
            type: 'click',
            target: this._targetElement,
            clientX: touch.clientX,
            clientY: touch.clientY,
            buttons: 'buttons' in touch ? touch.buttons : 1,
            altKey: 'altKey' in touch ? touch.altKey : false,
            ctrlKey: 'ctrlKey' in touch ? touch.ctrlKey : false,
            shiftKey: 'shiftKey' in touch ? touch.shiftKey : false,
            timeStamp: event.timeStamp,
        });
    }
}

export { ClickEmulation as default };
