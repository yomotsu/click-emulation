/*!
 * click-emulation
 * https://github.com/yomotsu/click-emulation
 * (c) 2020 @yomotsu
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.ClickEmulation = factory());
}(this, (function () { 'use strict';

	var Vector2 = (function () {
	    function Vector2(x, y) {
	        if (x === void 0) { x = 0; }
	        if (y === void 0) { y = 0; }
	        this._x = x;
	        this._y = y;
	    }
	    Object.defineProperty(Vector2.prototype, "isVector2", {
	        get: function () {
	            return true;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Vector2.prototype, "x", {
	        get: function () {
	            return this._x;
	        },
	        set: function (x) {
	            if (this._x === x)
	                return;
	            this._x = x;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Vector2.prototype, "y", {
	        get: function () {
	            return this._y;
	        },
	        set: function (y) {
	            if (this._y === y)
	                return;
	            this._y = y;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Vector2.prototype.set = function (x, y) {
	        if (this._x !== x || this._y !== y) {
	            this._x = x;
	            this._y = y;
	        }
	        return this;
	    };
	    Vector2.prototype.add = function (v) {
	        return this.set(this.x + v.x, this.y + v.y);
	    };
	    Vector2.prototype.sub = function (v) {
	        return this.set(this.x - v.x, this.y - v.y);
	    };
	    Vector2.prototype.lengthSq = function () {
	        return this.x * this.x + this.y * this.y;
	    };
	    return Vector2;
	}());

	function isTouchEvent(event) {
	    return 'TouchEvent' in window && event instanceof TouchEvent;
	}

	function findLatestTouchEvent(event) {
	    var changedTouches = event.changedTouches;
	    return changedTouches[changedTouches.length - 1];
	}

	var THRESHOLD_LENGTH = 20;
	var THRESHOLD_LENGTH_SQ = THRESHOLD_LENGTH * THRESHOLD_LENGTH;
	var CLICK_TIMEOUT = 1000;
	var ClickEmulation = (function () {
	    function ClickEmulation($el) {
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
	    ClickEmulation.prototype.addEventListener = function (listener) {
	        this._listeners.push(listener);
	    };
	    ClickEmulation.prototype.removeEventListener = function (listener) {
	        var index = this._listeners.indexOf(listener);
	        if (index !== -1)
	            this._listeners.splice(index, 1);
	    };
	    ClickEmulation.prototype.removeAllEventListeners = function () {
	        this._listeners = [];
	        return;
	    };
	    ClickEmulation.prototype.dispatchEvent = function (event) {
	        var listenerArray = this._listeners;
	        var array = listenerArray.slice(0);
	        for (var i = 0, l = array.length; i < l; i++) {
	            array[i].call(this, event);
	        }
	    };
	    ClickEmulation.prototype.destroy = function () {
	        this._$el.removeEventListener('mousedown', this._clickStart);
	        this._$el.removeEventListener('touchstart', this._clickStart);
	        document.removeEventListener('mouseup', this._clickEnd);
	        document.removeEventListener('touchend', this._clickEnd);
	    };
	    ClickEmulation.prototype._handleClickStart = function (event) {
	        event.preventDefault();
	        if (this._ongoingTouches.length === 0) {
	            document.removeEventListener('mouseup', this._clickEnd);
	            document.removeEventListener('touchend', this._clickEnd);
	        }
	        var _event = isTouchEvent(event)
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
	    };
	    ClickEmulation.prototype._handleClickEnd = function (event) {
	        var _isTouchEvent = isTouchEvent(event);
	        if (this._ongoingTouches.length <= 1) {
	            document.removeEventListener('mouseup', this._clickEnd);
	            document.removeEventListener('touchend', this._clickEnd);
	        }
	        var touch = _isTouchEvent
	            ? event.changedTouches[0]
	            : event;
	        var ongoingTouchIndex = _isTouchEvent
	            ? this._ongoingTouches.findIndex(function (o) { return o.touch.identifier === touch.identifier; })
	            : 0;
	        var ongoingTouch = this._ongoingTouches[ongoingTouchIndex];
	        this._ongoingTouches.splice(ongoingTouchIndex, 1);
	        var clickEndTime = performance.now();
	        var elapsed = clickEndTime - ongoingTouch.startTime;
	        if (!this._targetElement)
	            return;
	        if (elapsed > CLICK_TIMEOUT)
	            return;
	        this._clickStartPosition.set(ongoingTouch.startX, ongoingTouch.startY);
	        this._clickEndPosition.set(touch.clientX, touch.clientY);
	        var moveLength = this._clickEndPosition
	            .sub(this._clickStartPosition)
	            .lengthSq();
	        if (THRESHOLD_LENGTH_SQ < moveLength)
	            return;
	        var target = this._targetElement;
	        this.dispatchEvent({
	            type: 'click',
	            target: target,
	            clientX: this._clickEndPosition.x,
	            clientY: this._clickEndPosition.y,
	        });
	    };
	    return ClickEmulation;
	}());

	return ClickEmulation;

})));
