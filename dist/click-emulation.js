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

	/*! *****************************************************************************
	Copyright (c) Microsoft Corporation.

	Permission to use, copy, modify, and/or distribute this software for any
	purpose with or without fee is hereby granted.

	THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
	REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
	AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
	INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
	LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
	OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
	PERFORMANCE OF THIS SOFTWARE.
	***************************************************************************** */
	/* global Reflect, Promise */

	var extendStatics = function(d, b) {
	    extendStatics = Object.setPrototypeOf ||
	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
	    return extendStatics(d, b);
	};

	function __extends(d, b) {
	    extendStatics(d, b);
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	}

	var EventDispatcher = (function () {
	    function EventDispatcher() {
	        this._listeners = [];
	    }
	    EventDispatcher.prototype.addEventListener = function (listener) {
	        this._listeners.push(listener);
	    };
	    EventDispatcher.prototype.removeEventListener = function (listener) {
	        var index = this._listeners.indexOf(listener);
	        if (index !== -1)
	            this._listeners.splice(index, 1);
	    };
	    EventDispatcher.prototype.removeAllEventListeners = function () {
	        this._listeners = [];
	        return;
	    };
	    EventDispatcher.prototype.dispatchEvent = function (event) {
	        var listenerArray = this._listeners;
	        event.target = this;
	        var array = listenerArray.slice(0);
	        for (var i = 0, l = array.length; i < l; i++) {
	            array[i].call(this, event);
	        }
	    };
	    return EventDispatcher;
	}());

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

	var clickStartPosition = new Vector2();
	var clickEndPosition = new Vector2();
	var THRESHOLD_LENGTH = 20;
	var THRESHOLD_LENGTH_SQ = THRESHOLD_LENGTH * THRESHOLD_LENGTH;
	var CLICK_TIMEOUT = 1000;
	var ClickEmulation = (function (_super) {
	    __extends(ClickEmulation, _super);
	    function ClickEmulation($el) {
	        var _this = _super.call(this) || this;
	        _this._targetElement = null;
	        _this._ongoingTouches = [];
	        _this._$el = $el;
	        _this._clickStart = _this._handleClickStart.bind(_this);
	        _this._clickEnd = _this._handleClickEnd.bind(_this);
	        _this._$el.addEventListener('mousedown', _this._clickStart);
	        _this._$el.addEventListener('touchstart', _this._clickStart);
	        return _this;
	    }
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
	        if (_event.target instanceof Element) {
	            this._targetElement = _event.target;
	        }
	        else {
	            this._targetElement = null;
	            return;
	        }
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
	        var _this = this;
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
	        clickStartPosition.set(ongoingTouch.startX, ongoingTouch.startY);
	        clickEndPosition.set(touch.clientX, touch.clientY);
	        var moveLength = clickEndPosition
	            .sub(clickStartPosition)
	            .lengthSq();
	        if (THRESHOLD_LENGTH_SQ < moveLength)
	            return;
	        var target = this._targetElement;
	        setTimeout(function () { return _this.dispatchEvent({ type: 'click', target: target }); }, 0);
	    };
	    return ClickEmulation;
	}(EventDispatcher));

	return ClickEmulation;

})));
