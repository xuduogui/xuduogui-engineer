'use strict';

var require$$1$1 = require('os');
var require$$0$3 = require('stream');
var require$$0$1 = require('assert');
var require$$2 = require('events');
var require$$0$2 = require('tty');
var require$$0$4 = require('v8');
var require$$2$1 = require('util');
var require$$0$6 = require('fs');
var require$$1$2 = require('path');
var require$$0$5 = require('constants');
var require$$2$2 = require('zlib');
var require$$0$7 = require('child_process');
var require$$0$8 = require('buffer');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var require$$1__default = /*#__PURE__*/_interopDefaultLegacy(require$$1$1);
var require$$0__default$2 = /*#__PURE__*/_interopDefaultLegacy(require$$0$3);
var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0$1);
var require$$2__default = /*#__PURE__*/_interopDefaultLegacy(require$$2);
var require$$0__default$1 = /*#__PURE__*/_interopDefaultLegacy(require$$0$2);
var require$$0__default$3 = /*#__PURE__*/_interopDefaultLegacy(require$$0$4);
var require$$2__default$1 = /*#__PURE__*/_interopDefaultLegacy(require$$2$1);
var require$$0__default$5 = /*#__PURE__*/_interopDefaultLegacy(require$$0$6);
var require$$1__default$1 = /*#__PURE__*/_interopDefaultLegacy(require$$1$2);
var require$$0__default$4 = /*#__PURE__*/_interopDefaultLegacy(require$$0$5);
var require$$2__default$2 = /*#__PURE__*/_interopDefaultLegacy(require$$2$2);
var require$$0__default$6 = /*#__PURE__*/_interopDefaultLegacy(require$$0$7);
var require$$0__default$7 = /*#__PURE__*/_interopDefaultLegacy(require$$0$8);

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getAugmentedNamespace(n) {
	if (n.__esModule) return n;
	var a = Object.defineProperty({}, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

function commonjsRequire (path) {
	throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}

var dist = {};

var listr = {};

var indentString$3 = (string, count = 1, options) => {
	options = {
		indent: ' ',
		includeEmptyLines: false,
		...options
	};

	if (typeof string !== 'string') {
		throw new TypeError(
			`Expected \`input\` to be a \`string\`, got \`${typeof string}\``
		);
	}

	if (typeof count !== 'number') {
		throw new TypeError(
			`Expected \`count\` to be a \`number\`, got \`${typeof count}\``
		);
	}

	if (typeof options.indent !== 'string') {
		throw new TypeError(
			`Expected \`options.indent\` to be a \`string\`, got \`${typeof options.indent}\``
		);
	}

	if (count === 0) {
		return string;
	}

	const regex = options.includeEmptyLines ? /^/gm : /^(?!\s*$)/gm;

	return string.replace(regex, options.indent.repeat(count));
};

const os$6 = require$$1__default["default"];

const extractPathRegex = /\s+at.*(?:\(|\s)(.*)\)?/;
const pathRegex = /^(?:(?:(?:node|(?:internal\/[\w/]*|.*node_modules\/(?:babel-polyfill|pirates)\/.*)?\w+)\.js:\d+:\d+)|native)/;
const homeDir = typeof os$6.homedir === 'undefined' ? '' : os$6.homedir();

var cleanStack$1 = (stack, options) => {
	options = Object.assign({pretty: false}, options);

	return stack.replace(/\\/g, '/')
		.split('\n')
		.filter(line => {
			const pathMatches = line.match(extractPathRegex);
			if (pathMatches === null || !pathMatches[1]) {
				return true;
			}

			const match = pathMatches[1];

			// Electron
			if (
				match.includes('.app/Contents/Resources/electron.asar') ||
				match.includes('.app/Contents/Resources/default_app.asar')
			) {
				return false;
			}

			return !pathRegex.test(match);
		})
		.filter(line => line.trim() !== '')
		.map(line => {
			if (options.pretty) {
				return line.replace(extractPathRegex, (m, p1) => m.replace(p1, p1.replace(homeDir, '~')));
			}

			return line;
		})
		.join('\n');
};

const indentString$2 = indentString$3;
const cleanStack = cleanStack$1;

const cleanInternalStack = stack => stack.replace(/\s+at .*aggregate-error\/index.js:\d+:\d+\)?/g, '');

class AggregateError$1 extends Error {
	constructor(errors) {
		if (!Array.isArray(errors)) {
			throw new TypeError(`Expected input to be an Array, got ${typeof errors}`);
		}

		errors = [...errors].map(error => {
			if (error instanceof Error) {
				return error;
			}

			if (error !== null && typeof error === 'object') {
				// Handle plain error objects with message property and/or possibly other metadata
				return Object.assign(new Error(error.message), error);
			}

			return new Error(error);
		});

		let message = errors
			.map(error => {
				// The `stack` property is not standardized, so we can't assume it exists
				return typeof error.stack === 'string' ? cleanInternalStack(cleanStack(error.stack)) : String(error);
			})
			.join('\n');
		message = '\n' + indentString$2(message, 4);
		super(message);

		this.name = 'AggregateError';

		Object.defineProperty(this, '_errors', {value: errors});
	}

	* [Symbol.iterator]() {
		for (const error of this._errors) {
			yield error;
		}
	}
}

var aggregateError = AggregateError$1;

const AggregateError = aggregateError;

var pMap$1 = async (
	iterable,
	mapper,
	{
		concurrency = Infinity,
		stopOnError = true
	} = {}
) => {
	return new Promise((resolve, reject) => {
		if (typeof mapper !== 'function') {
			throw new TypeError('Mapper function is required');
		}

		if (!((Number.isSafeInteger(concurrency) || concurrency === Infinity) && concurrency >= 1)) {
			throw new TypeError(`Expected \`concurrency\` to be an integer from 1 and up or \`Infinity\`, got \`${concurrency}\` (${typeof concurrency})`);
		}

		const result = [];
		const errors = [];
		const iterator = iterable[Symbol.iterator]();
		let isRejected = false;
		let isIterableDone = false;
		let resolvingCount = 0;
		let currentIndex = 0;

		const next = () => {
			if (isRejected) {
				return;
			}

			const nextItem = iterator.next();
			const index = currentIndex;
			currentIndex++;

			if (nextItem.done) {
				isIterableDone = true;

				if (resolvingCount === 0) {
					if (!stopOnError && errors.length !== 0) {
						reject(new AggregateError(errors));
					} else {
						resolve(result);
					}
				}

				return;
			}

			resolvingCount++;

			(async () => {
				try {
					const element = await nextItem.value;
					result[index] = await mapper(element, index);
					resolvingCount--;
					next();
				} catch (error) {
					if (stopOnError) {
						isRejected = true;
						reject(error);
					} else {
						errors.push(error);
						resolvingCount--;
						next();
					}
				}
			})();
		};

		for (let i = 0; i < concurrency; i++) {
			next();

			if (isIterableDone) {
				break;
			}
		}
	});
};

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
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function isFunction(x) {
    return typeof x === 'function';
}

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var _enable_super_gross_mode_that_will_cause_bad_things = false;
var config = {
    Promise: undefined,
    set useDeprecatedSynchronousErrorHandling(value) {
        if (value) {
            var error = /*@__PURE__*/ new Error();
            /*@__PURE__*/ console.warn('DEPRECATED! RxJS was set to use deprecated synchronous error handling behavior by code at: \n' + error.stack);
        }
        _enable_super_gross_mode_that_will_cause_bad_things = value;
    },
    get useDeprecatedSynchronousErrorHandling() {
        return _enable_super_gross_mode_that_will_cause_bad_things;
    },
};

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function hostReportError(err) {
    setTimeout(function () { throw err; }, 0);
}

/** PURE_IMPORTS_START _config,_util_hostReportError PURE_IMPORTS_END */
var empty$2 = {
    closed: true,
    next: function (value) { },
    error: function (err) {
        if (config.useDeprecatedSynchronousErrorHandling) {
            throw err;
        }
        else {
            hostReportError(err);
        }
    },
    complete: function () { }
};

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var isArray = /*@__PURE__*/ (function () { return Array.isArray || (function (x) { return x && typeof x.length === 'number'; }); })();

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function isObject(x) {
    return x !== null && typeof x === 'object';
}

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var UnsubscriptionErrorImpl = /*@__PURE__*/ (function () {
    function UnsubscriptionErrorImpl(errors) {
        Error.call(this);
        this.message = errors ?
            errors.length + " errors occurred during unsubscription:\n" + errors.map(function (err, i) { return i + 1 + ") " + err.toString(); }).join('\n  ') : '';
        this.name = 'UnsubscriptionError';
        this.errors = errors;
        return this;
    }
    UnsubscriptionErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
    return UnsubscriptionErrorImpl;
})();
var UnsubscriptionError = UnsubscriptionErrorImpl;

/** PURE_IMPORTS_START _util_isArray,_util_isObject,_util_isFunction,_util_UnsubscriptionError PURE_IMPORTS_END */
var Subscription = /*@__PURE__*/ (function () {
    function Subscription(unsubscribe) {
        this.closed = false;
        this._parentOrParents = null;
        this._subscriptions = null;
        if (unsubscribe) {
            this._ctorUnsubscribe = true;
            this._unsubscribe = unsubscribe;
        }
    }
    Subscription.prototype.unsubscribe = function () {
        var errors;
        if (this.closed) {
            return;
        }
        var _a = this, _parentOrParents = _a._parentOrParents, _ctorUnsubscribe = _a._ctorUnsubscribe, _unsubscribe = _a._unsubscribe, _subscriptions = _a._subscriptions;
        this.closed = true;
        this._parentOrParents = null;
        this._subscriptions = null;
        if (_parentOrParents instanceof Subscription) {
            _parentOrParents.remove(this);
        }
        else if (_parentOrParents !== null) {
            for (var index = 0; index < _parentOrParents.length; ++index) {
                var parent_1 = _parentOrParents[index];
                parent_1.remove(this);
            }
        }
        if (isFunction(_unsubscribe)) {
            if (_ctorUnsubscribe) {
                this._unsubscribe = undefined;
            }
            try {
                _unsubscribe.call(this);
            }
            catch (e) {
                errors = e instanceof UnsubscriptionError ? flattenUnsubscriptionErrors(e.errors) : [e];
            }
        }
        if (isArray(_subscriptions)) {
            var index = -1;
            var len = _subscriptions.length;
            while (++index < len) {
                var sub = _subscriptions[index];
                if (isObject(sub)) {
                    try {
                        sub.unsubscribe();
                    }
                    catch (e) {
                        errors = errors || [];
                        if (e instanceof UnsubscriptionError) {
                            errors = errors.concat(flattenUnsubscriptionErrors(e.errors));
                        }
                        else {
                            errors.push(e);
                        }
                    }
                }
            }
        }
        if (errors) {
            throw new UnsubscriptionError(errors);
        }
    };
    Subscription.prototype.add = function (teardown) {
        var subscription = teardown;
        if (!teardown) {
            return Subscription.EMPTY;
        }
        switch (typeof teardown) {
            case 'function':
                subscription = new Subscription(teardown);
            case 'object':
                if (subscription === this || subscription.closed || typeof subscription.unsubscribe !== 'function') {
                    return subscription;
                }
                else if (this.closed) {
                    subscription.unsubscribe();
                    return subscription;
                }
                else if (!(subscription instanceof Subscription)) {
                    var tmp = subscription;
                    subscription = new Subscription();
                    subscription._subscriptions = [tmp];
                }
                break;
            default: {
                throw new Error('unrecognized teardown ' + teardown + ' added to Subscription.');
            }
        }
        var _parentOrParents = subscription._parentOrParents;
        if (_parentOrParents === null) {
            subscription._parentOrParents = this;
        }
        else if (_parentOrParents instanceof Subscription) {
            if (_parentOrParents === this) {
                return subscription;
            }
            subscription._parentOrParents = [_parentOrParents, this];
        }
        else if (_parentOrParents.indexOf(this) === -1) {
            _parentOrParents.push(this);
        }
        else {
            return subscription;
        }
        var subscriptions = this._subscriptions;
        if (subscriptions === null) {
            this._subscriptions = [subscription];
        }
        else {
            subscriptions.push(subscription);
        }
        return subscription;
    };
    Subscription.prototype.remove = function (subscription) {
        var subscriptions = this._subscriptions;
        if (subscriptions) {
            var subscriptionIndex = subscriptions.indexOf(subscription);
            if (subscriptionIndex !== -1) {
                subscriptions.splice(subscriptionIndex, 1);
            }
        }
    };
    Subscription.EMPTY = (function (empty) {
        empty.closed = true;
        return empty;
    }(new Subscription()));
    return Subscription;
}());
function flattenUnsubscriptionErrors(errors) {
    return errors.reduce(function (errs, err) { return errs.concat((err instanceof UnsubscriptionError) ? err.errors : err); }, []);
}

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var rxSubscriber = /*@__PURE__*/ (function () {
    return typeof Symbol === 'function'
        ? /*@__PURE__*/ Symbol('rxSubscriber')
        : '@@rxSubscriber_' + /*@__PURE__*/ Math.random();
})();

/** PURE_IMPORTS_START tslib,_util_isFunction,_Observer,_Subscription,_internal_symbol_rxSubscriber,_config,_util_hostReportError PURE_IMPORTS_END */
var Subscriber = /*@__PURE__*/ (function (_super) {
    __extends(Subscriber, _super);
    function Subscriber(destinationOrNext, error, complete) {
        var _this = _super.call(this) || this;
        _this.syncErrorValue = null;
        _this.syncErrorThrown = false;
        _this.syncErrorThrowable = false;
        _this.isStopped = false;
        switch (arguments.length) {
            case 0:
                _this.destination = empty$2;
                break;
            case 1:
                if (!destinationOrNext) {
                    _this.destination = empty$2;
                    break;
                }
                if (typeof destinationOrNext === 'object') {
                    if (destinationOrNext instanceof Subscriber) {
                        _this.syncErrorThrowable = destinationOrNext.syncErrorThrowable;
                        _this.destination = destinationOrNext;
                        destinationOrNext.add(_this);
                    }
                    else {
                        _this.syncErrorThrowable = true;
                        _this.destination = new SafeSubscriber(_this, destinationOrNext);
                    }
                    break;
                }
            default:
                _this.syncErrorThrowable = true;
                _this.destination = new SafeSubscriber(_this, destinationOrNext, error, complete);
                break;
        }
        return _this;
    }
    Subscriber.prototype[rxSubscriber] = function () { return this; };
    Subscriber.create = function (next, error, complete) {
        var subscriber = new Subscriber(next, error, complete);
        subscriber.syncErrorThrowable = false;
        return subscriber;
    };
    Subscriber.prototype.next = function (value) {
        if (!this.isStopped) {
            this._next(value);
        }
    };
    Subscriber.prototype.error = function (err) {
        if (!this.isStopped) {
            this.isStopped = true;
            this._error(err);
        }
    };
    Subscriber.prototype.complete = function () {
        if (!this.isStopped) {
            this.isStopped = true;
            this._complete();
        }
    };
    Subscriber.prototype.unsubscribe = function () {
        if (this.closed) {
            return;
        }
        this.isStopped = true;
        _super.prototype.unsubscribe.call(this);
    };
    Subscriber.prototype._next = function (value) {
        this.destination.next(value);
    };
    Subscriber.prototype._error = function (err) {
        this.destination.error(err);
        this.unsubscribe();
    };
    Subscriber.prototype._complete = function () {
        this.destination.complete();
        this.unsubscribe();
    };
    Subscriber.prototype._unsubscribeAndRecycle = function () {
        var _parentOrParents = this._parentOrParents;
        this._parentOrParents = null;
        this.unsubscribe();
        this.closed = false;
        this.isStopped = false;
        this._parentOrParents = _parentOrParents;
        return this;
    };
    return Subscriber;
}(Subscription));
var SafeSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(SafeSubscriber, _super);
    function SafeSubscriber(_parentSubscriber, observerOrNext, error, complete) {
        var _this = _super.call(this) || this;
        _this._parentSubscriber = _parentSubscriber;
        var next;
        var context = _this;
        if (isFunction(observerOrNext)) {
            next = observerOrNext;
        }
        else if (observerOrNext) {
            next = observerOrNext.next;
            error = observerOrNext.error;
            complete = observerOrNext.complete;
            if (observerOrNext !== empty$2) {
                context = Object.create(observerOrNext);
                if (isFunction(context.unsubscribe)) {
                    _this.add(context.unsubscribe.bind(context));
                }
                context.unsubscribe = _this.unsubscribe.bind(_this);
            }
        }
        _this._context = context;
        _this._next = next;
        _this._error = error;
        _this._complete = complete;
        return _this;
    }
    SafeSubscriber.prototype.next = function (value) {
        if (!this.isStopped && this._next) {
            var _parentSubscriber = this._parentSubscriber;
            if (!config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                this.__tryOrUnsub(this._next, value);
            }
            else if (this.__tryOrSetError(_parentSubscriber, this._next, value)) {
                this.unsubscribe();
            }
        }
    };
    SafeSubscriber.prototype.error = function (err) {
        if (!this.isStopped) {
            var _parentSubscriber = this._parentSubscriber;
            var useDeprecatedSynchronousErrorHandling = config.useDeprecatedSynchronousErrorHandling;
            if (this._error) {
                if (!useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                    this.__tryOrUnsub(this._error, err);
                    this.unsubscribe();
                }
                else {
                    this.__tryOrSetError(_parentSubscriber, this._error, err);
                    this.unsubscribe();
                }
            }
            else if (!_parentSubscriber.syncErrorThrowable) {
                this.unsubscribe();
                if (useDeprecatedSynchronousErrorHandling) {
                    throw err;
                }
                hostReportError(err);
            }
            else {
                if (useDeprecatedSynchronousErrorHandling) {
                    _parentSubscriber.syncErrorValue = err;
                    _parentSubscriber.syncErrorThrown = true;
                }
                else {
                    hostReportError(err);
                }
                this.unsubscribe();
            }
        }
    };
    SafeSubscriber.prototype.complete = function () {
        var _this = this;
        if (!this.isStopped) {
            var _parentSubscriber = this._parentSubscriber;
            if (this._complete) {
                var wrappedComplete = function () { return _this._complete.call(_this._context); };
                if (!config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                    this.__tryOrUnsub(wrappedComplete);
                    this.unsubscribe();
                }
                else {
                    this.__tryOrSetError(_parentSubscriber, wrappedComplete);
                    this.unsubscribe();
                }
            }
            else {
                this.unsubscribe();
            }
        }
    };
    SafeSubscriber.prototype.__tryOrUnsub = function (fn, value) {
        try {
            fn.call(this._context, value);
        }
        catch (err) {
            this.unsubscribe();
            if (config.useDeprecatedSynchronousErrorHandling) {
                throw err;
            }
            else {
                hostReportError(err);
            }
        }
    };
    SafeSubscriber.prototype.__tryOrSetError = function (parent, fn, value) {
        if (!config.useDeprecatedSynchronousErrorHandling) {
            throw new Error('bad call');
        }
        try {
            fn.call(this._context, value);
        }
        catch (err) {
            if (config.useDeprecatedSynchronousErrorHandling) {
                parent.syncErrorValue = err;
                parent.syncErrorThrown = true;
                return true;
            }
            else {
                hostReportError(err);
                return true;
            }
        }
        return false;
    };
    SafeSubscriber.prototype._unsubscribe = function () {
        var _parentSubscriber = this._parentSubscriber;
        this._context = null;
        this._parentSubscriber = null;
        _parentSubscriber.unsubscribe();
    };
    return SafeSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START _Subscriber PURE_IMPORTS_END */
function canReportError(observer) {
    while (observer) {
        var _a = observer, closed_1 = _a.closed, destination = _a.destination, isStopped = _a.isStopped;
        if (closed_1 || isStopped) {
            return false;
        }
        else if (destination && destination instanceof Subscriber) {
            observer = destination;
        }
        else {
            observer = null;
        }
    }
    return true;
}

/** PURE_IMPORTS_START _Subscriber,_symbol_rxSubscriber,_Observer PURE_IMPORTS_END */
function toSubscriber(nextOrObserver, error, complete) {
    if (nextOrObserver) {
        if (nextOrObserver instanceof Subscriber) {
            return nextOrObserver;
        }
        if (nextOrObserver[rxSubscriber]) {
            return nextOrObserver[rxSubscriber]();
        }
    }
    if (!nextOrObserver && !error && !complete) {
        return new Subscriber(empty$2);
    }
    return new Subscriber(nextOrObserver, error, complete);
}

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var observable = /*@__PURE__*/ (function () { return typeof Symbol === 'function' && Symbol.observable || '@@observable'; })();

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function identity(x) {
    return x;
}

/** PURE_IMPORTS_START _identity PURE_IMPORTS_END */
function pipe() {
    var fns = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        fns[_i] = arguments[_i];
    }
    return pipeFromArray(fns);
}
function pipeFromArray(fns) {
    if (fns.length === 0) {
        return identity;
    }
    if (fns.length === 1) {
        return fns[0];
    }
    return function piped(input) {
        return fns.reduce(function (prev, fn) { return fn(prev); }, input);
    };
}

/** PURE_IMPORTS_START _util_canReportError,_util_toSubscriber,_symbol_observable,_util_pipe,_config PURE_IMPORTS_END */
var Observable = /*@__PURE__*/ (function () {
    function Observable(subscribe) {
        this._isScalar = false;
        if (subscribe) {
            this._subscribe = subscribe;
        }
    }
    Observable.prototype.lift = function (operator) {
        var observable = new Observable();
        observable.source = this;
        observable.operator = operator;
        return observable;
    };
    Observable.prototype.subscribe = function (observerOrNext, error, complete) {
        var operator = this.operator;
        var sink = toSubscriber(observerOrNext, error, complete);
        if (operator) {
            sink.add(operator.call(sink, this.source));
        }
        else {
            sink.add(this.source || (config.useDeprecatedSynchronousErrorHandling && !sink.syncErrorThrowable) ?
                this._subscribe(sink) :
                this._trySubscribe(sink));
        }
        if (config.useDeprecatedSynchronousErrorHandling) {
            if (sink.syncErrorThrowable) {
                sink.syncErrorThrowable = false;
                if (sink.syncErrorThrown) {
                    throw sink.syncErrorValue;
                }
            }
        }
        return sink;
    };
    Observable.prototype._trySubscribe = function (sink) {
        try {
            return this._subscribe(sink);
        }
        catch (err) {
            if (config.useDeprecatedSynchronousErrorHandling) {
                sink.syncErrorThrown = true;
                sink.syncErrorValue = err;
            }
            if (canReportError(sink)) {
                sink.error(err);
            }
            else {
                console.warn(err);
            }
        }
    };
    Observable.prototype.forEach = function (next, promiseCtor) {
        var _this = this;
        promiseCtor = getPromiseCtor(promiseCtor);
        return new promiseCtor(function (resolve, reject) {
            var subscription;
            subscription = _this.subscribe(function (value) {
                try {
                    next(value);
                }
                catch (err) {
                    reject(err);
                    if (subscription) {
                        subscription.unsubscribe();
                    }
                }
            }, reject, resolve);
        });
    };
    Observable.prototype._subscribe = function (subscriber) {
        var source = this.source;
        return source && source.subscribe(subscriber);
    };
    Observable.prototype[observable] = function () {
        return this;
    };
    Observable.prototype.pipe = function () {
        var operations = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            operations[_i] = arguments[_i];
        }
        if (operations.length === 0) {
            return this;
        }
        return pipeFromArray(operations)(this);
    };
    Observable.prototype.toPromise = function (promiseCtor) {
        var _this = this;
        promiseCtor = getPromiseCtor(promiseCtor);
        return new promiseCtor(function (resolve, reject) {
            var value;
            _this.subscribe(function (x) { return value = x; }, function (err) { return reject(err); }, function () { return resolve(value); });
        });
    };
    Observable.create = function (subscribe) {
        return new Observable(subscribe);
    };
    return Observable;
}());
function getPromiseCtor(promiseCtor) {
    if (!promiseCtor) {
        promiseCtor = config.Promise || Promise;
    }
    if (!promiseCtor) {
        throw new Error('no Promise impl found');
    }
    return promiseCtor;
}

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var ObjectUnsubscribedErrorImpl = /*@__PURE__*/ (function () {
    function ObjectUnsubscribedErrorImpl() {
        Error.call(this);
        this.message = 'object unsubscribed';
        this.name = 'ObjectUnsubscribedError';
        return this;
    }
    ObjectUnsubscribedErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
    return ObjectUnsubscribedErrorImpl;
})();
var ObjectUnsubscribedError = ObjectUnsubscribedErrorImpl;

/** PURE_IMPORTS_START tslib,_Subscription PURE_IMPORTS_END */
var SubjectSubscription = /*@__PURE__*/ (function (_super) {
    __extends(SubjectSubscription, _super);
    function SubjectSubscription(subject, subscriber) {
        var _this = _super.call(this) || this;
        _this.subject = subject;
        _this.subscriber = subscriber;
        _this.closed = false;
        return _this;
    }
    SubjectSubscription.prototype.unsubscribe = function () {
        if (this.closed) {
            return;
        }
        this.closed = true;
        var subject = this.subject;
        var observers = subject.observers;
        this.subject = null;
        if (!observers || observers.length === 0 || subject.isStopped || subject.closed) {
            return;
        }
        var subscriberIndex = observers.indexOf(this.subscriber);
        if (subscriberIndex !== -1) {
            observers.splice(subscriberIndex, 1);
        }
    };
    return SubjectSubscription;
}(Subscription));

/** PURE_IMPORTS_START tslib,_Observable,_Subscriber,_Subscription,_util_ObjectUnsubscribedError,_SubjectSubscription,_internal_symbol_rxSubscriber PURE_IMPORTS_END */
var SubjectSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(SubjectSubscriber, _super);
    function SubjectSubscriber(destination) {
        var _this = _super.call(this, destination) || this;
        _this.destination = destination;
        return _this;
    }
    return SubjectSubscriber;
}(Subscriber));
var Subject = /*@__PURE__*/ (function (_super) {
    __extends(Subject, _super);
    function Subject() {
        var _this = _super.call(this) || this;
        _this.observers = [];
        _this.closed = false;
        _this.isStopped = false;
        _this.hasError = false;
        _this.thrownError = null;
        return _this;
    }
    Subject.prototype[rxSubscriber] = function () {
        return new SubjectSubscriber(this);
    };
    Subject.prototype.lift = function (operator) {
        var subject = new AnonymousSubject(this, this);
        subject.operator = operator;
        return subject;
    };
    Subject.prototype.next = function (value) {
        if (this.closed) {
            throw new ObjectUnsubscribedError();
        }
        if (!this.isStopped) {
            var observers = this.observers;
            var len = observers.length;
            var copy = observers.slice();
            for (var i = 0; i < len; i++) {
                copy[i].next(value);
            }
        }
    };
    Subject.prototype.error = function (err) {
        if (this.closed) {
            throw new ObjectUnsubscribedError();
        }
        this.hasError = true;
        this.thrownError = err;
        this.isStopped = true;
        var observers = this.observers;
        var len = observers.length;
        var copy = observers.slice();
        for (var i = 0; i < len; i++) {
            copy[i].error(err);
        }
        this.observers.length = 0;
    };
    Subject.prototype.complete = function () {
        if (this.closed) {
            throw new ObjectUnsubscribedError();
        }
        this.isStopped = true;
        var observers = this.observers;
        var len = observers.length;
        var copy = observers.slice();
        for (var i = 0; i < len; i++) {
            copy[i].complete();
        }
        this.observers.length = 0;
    };
    Subject.prototype.unsubscribe = function () {
        this.isStopped = true;
        this.closed = true;
        this.observers = null;
    };
    Subject.prototype._trySubscribe = function (subscriber) {
        if (this.closed) {
            throw new ObjectUnsubscribedError();
        }
        else {
            return _super.prototype._trySubscribe.call(this, subscriber);
        }
    };
    Subject.prototype._subscribe = function (subscriber) {
        if (this.closed) {
            throw new ObjectUnsubscribedError();
        }
        else if (this.hasError) {
            subscriber.error(this.thrownError);
            return Subscription.EMPTY;
        }
        else if (this.isStopped) {
            subscriber.complete();
            return Subscription.EMPTY;
        }
        else {
            this.observers.push(subscriber);
            return new SubjectSubscription(this, subscriber);
        }
    };
    Subject.prototype.asObservable = function () {
        var observable = new Observable();
        observable.source = this;
        return observable;
    };
    Subject.create = function (destination, source) {
        return new AnonymousSubject(destination, source);
    };
    return Subject;
}(Observable));
var AnonymousSubject = /*@__PURE__*/ (function (_super) {
    __extends(AnonymousSubject, _super);
    function AnonymousSubject(destination, source) {
        var _this = _super.call(this) || this;
        _this.destination = destination;
        _this.source = source;
        return _this;
    }
    AnonymousSubject.prototype.next = function (value) {
        var destination = this.destination;
        if (destination && destination.next) {
            destination.next(value);
        }
    };
    AnonymousSubject.prototype.error = function (err) {
        var destination = this.destination;
        if (destination && destination.error) {
            this.destination.error(err);
        }
    };
    AnonymousSubject.prototype.complete = function () {
        var destination = this.destination;
        if (destination && destination.complete) {
            this.destination.complete();
        }
    };
    AnonymousSubject.prototype._subscribe = function (subscriber) {
        var source = this.source;
        if (source) {
            return this.source.subscribe(subscriber);
        }
        else {
            return Subscription.EMPTY;
        }
    };
    return AnonymousSubject;
}(Subject));

/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
function refCount() {
    return function refCountOperatorFunction(source) {
        return source.lift(new RefCountOperator(source));
    };
}
var RefCountOperator = /*@__PURE__*/ (function () {
    function RefCountOperator(connectable) {
        this.connectable = connectable;
    }
    RefCountOperator.prototype.call = function (subscriber, source) {
        var connectable = this.connectable;
        connectable._refCount++;
        var refCounter = new RefCountSubscriber(subscriber, connectable);
        var subscription = source.subscribe(refCounter);
        if (!refCounter.closed) {
            refCounter.connection = connectable.connect();
        }
        return subscription;
    };
    return RefCountOperator;
}());
var RefCountSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(RefCountSubscriber, _super);
    function RefCountSubscriber(destination, connectable) {
        var _this = _super.call(this, destination) || this;
        _this.connectable = connectable;
        return _this;
    }
    RefCountSubscriber.prototype._unsubscribe = function () {
        var connectable = this.connectable;
        if (!connectable) {
            this.connection = null;
            return;
        }
        this.connectable = null;
        var refCount = connectable._refCount;
        if (refCount <= 0) {
            this.connection = null;
            return;
        }
        connectable._refCount = refCount - 1;
        if (refCount > 1) {
            this.connection = null;
            return;
        }
        var connection = this.connection;
        var sharedConnection = connectable._connection;
        this.connection = null;
        if (sharedConnection && (!connection || sharedConnection === connection)) {
            sharedConnection.unsubscribe();
        }
    };
    return RefCountSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START tslib,_Subject,_Observable,_Subscriber,_Subscription,_operators_refCount PURE_IMPORTS_END */
var ConnectableObservable = /*@__PURE__*/ (function (_super) {
    __extends(ConnectableObservable, _super);
    function ConnectableObservable(source, subjectFactory) {
        var _this = _super.call(this) || this;
        _this.source = source;
        _this.subjectFactory = subjectFactory;
        _this._refCount = 0;
        _this._isComplete = false;
        return _this;
    }
    ConnectableObservable.prototype._subscribe = function (subscriber) {
        return this.getSubject().subscribe(subscriber);
    };
    ConnectableObservable.prototype.getSubject = function () {
        var subject = this._subject;
        if (!subject || subject.isStopped) {
            this._subject = this.subjectFactory();
        }
        return this._subject;
    };
    ConnectableObservable.prototype.connect = function () {
        var connection = this._connection;
        if (!connection) {
            this._isComplete = false;
            connection = this._connection = new Subscription();
            connection.add(this.source
                .subscribe(new ConnectableSubscriber(this.getSubject(), this)));
            if (connection.closed) {
                this._connection = null;
                connection = Subscription.EMPTY;
            }
        }
        return connection;
    };
    ConnectableObservable.prototype.refCount = function () {
        return refCount()(this);
    };
    return ConnectableObservable;
}(Observable));
var ConnectableSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(ConnectableSubscriber, _super);
    function ConnectableSubscriber(destination, connectable) {
        var _this = _super.call(this, destination) || this;
        _this.connectable = connectable;
        return _this;
    }
    ConnectableSubscriber.prototype._error = function (err) {
        this._unsubscribe();
        _super.prototype._error.call(this, err);
    };
    ConnectableSubscriber.prototype._complete = function () {
        this.connectable._isComplete = true;
        this._unsubscribe();
        _super.prototype._complete.call(this);
    };
    ConnectableSubscriber.prototype._unsubscribe = function () {
        var connectable = this.connectable;
        if (connectable) {
            this.connectable = null;
            var connection = connectable._connection;
            connectable._refCount = 0;
            connectable._subject = null;
            connectable._connection = null;
            if (connection) {
                connection.unsubscribe();
            }
        }
    };
    return ConnectableSubscriber;
}(SubjectSubscriber));

/** PURE_IMPORTS_START tslib,_Subscriber,_Subscription,_Observable,_Subject PURE_IMPORTS_END */
var GroupedObservable = /*@__PURE__*/ (function (_super) {
    __extends(GroupedObservable, _super);
    function GroupedObservable(key, groupSubject, refCountSubscription) {
        var _this = _super.call(this) || this;
        _this.key = key;
        _this.groupSubject = groupSubject;
        _this.refCountSubscription = refCountSubscription;
        return _this;
    }
    GroupedObservable.prototype._subscribe = function (subscriber) {
        var subscription = new Subscription();
        var _a = this, refCountSubscription = _a.refCountSubscription, groupSubject = _a.groupSubject;
        if (refCountSubscription && !refCountSubscription.closed) {
            subscription.add(new InnerRefCountSubscription(refCountSubscription));
        }
        subscription.add(groupSubject.subscribe(subscriber));
        return subscription;
    };
    return GroupedObservable;
}(Observable));
var InnerRefCountSubscription = /*@__PURE__*/ (function (_super) {
    __extends(InnerRefCountSubscription, _super);
    function InnerRefCountSubscription(parent) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        parent.count++;
        return _this;
    }
    InnerRefCountSubscription.prototype.unsubscribe = function () {
        var parent = this.parent;
        if (!parent.closed && !this.closed) {
            _super.prototype.unsubscribe.call(this);
            parent.count -= 1;
            if (parent.count === 0 && parent.attemptedToUnsubscribe) {
                parent.unsubscribe();
            }
        }
    };
    return InnerRefCountSubscription;
}(Subscription));

/** PURE_IMPORTS_START tslib,_Subject,_util_ObjectUnsubscribedError PURE_IMPORTS_END */
var BehaviorSubject = /*@__PURE__*/ (function (_super) {
    __extends(BehaviorSubject, _super);
    function BehaviorSubject(_value) {
        var _this = _super.call(this) || this;
        _this._value = _value;
        return _this;
    }
    Object.defineProperty(BehaviorSubject.prototype, "value", {
        get: function () {
            return this.getValue();
        },
        enumerable: true,
        configurable: true
    });
    BehaviorSubject.prototype._subscribe = function (subscriber) {
        var subscription = _super.prototype._subscribe.call(this, subscriber);
        if (subscription && !subscription.closed) {
            subscriber.next(this._value);
        }
        return subscription;
    };
    BehaviorSubject.prototype.getValue = function () {
        if (this.hasError) {
            throw this.thrownError;
        }
        else if (this.closed) {
            throw new ObjectUnsubscribedError();
        }
        else {
            return this._value;
        }
    };
    BehaviorSubject.prototype.next = function (value) {
        _super.prototype.next.call(this, this._value = value);
    };
    return BehaviorSubject;
}(Subject));

/** PURE_IMPORTS_START tslib,_Subscription PURE_IMPORTS_END */
var Action = /*@__PURE__*/ (function (_super) {
    __extends(Action, _super);
    function Action(scheduler, work) {
        return _super.call(this) || this;
    }
    Action.prototype.schedule = function (state, delay) {
        return this;
    };
    return Action;
}(Subscription));

/** PURE_IMPORTS_START tslib,_Action PURE_IMPORTS_END */
var AsyncAction = /*@__PURE__*/ (function (_super) {
    __extends(AsyncAction, _super);
    function AsyncAction(scheduler, work) {
        var _this = _super.call(this, scheduler, work) || this;
        _this.scheduler = scheduler;
        _this.work = work;
        _this.pending = false;
        return _this;
    }
    AsyncAction.prototype.schedule = function (state, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        if (this.closed) {
            return this;
        }
        this.state = state;
        var id = this.id;
        var scheduler = this.scheduler;
        if (id != null) {
            this.id = this.recycleAsyncId(scheduler, id, delay);
        }
        this.pending = true;
        this.delay = delay;
        this.id = this.id || this.requestAsyncId(scheduler, this.id, delay);
        return this;
    };
    AsyncAction.prototype.requestAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        return setInterval(scheduler.flush.bind(scheduler, this), delay);
    };
    AsyncAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        if (delay !== null && this.delay === delay && this.pending === false) {
            return id;
        }
        clearInterval(id);
        return undefined;
    };
    AsyncAction.prototype.execute = function (state, delay) {
        if (this.closed) {
            return new Error('executing a cancelled action');
        }
        this.pending = false;
        var error = this._execute(state, delay);
        if (error) {
            return error;
        }
        else if (this.pending === false && this.id != null) {
            this.id = this.recycleAsyncId(this.scheduler, this.id, null);
        }
    };
    AsyncAction.prototype._execute = function (state, delay) {
        var errored = false;
        var errorValue = undefined;
        try {
            this.work(state);
        }
        catch (e) {
            errored = true;
            errorValue = !!e && e || new Error(e);
        }
        if (errored) {
            this.unsubscribe();
            return errorValue;
        }
    };
    AsyncAction.prototype._unsubscribe = function () {
        var id = this.id;
        var scheduler = this.scheduler;
        var actions = scheduler.actions;
        var index = actions.indexOf(this);
        this.work = null;
        this.state = null;
        this.pending = false;
        this.scheduler = null;
        if (index !== -1) {
            actions.splice(index, 1);
        }
        if (id != null) {
            this.id = this.recycleAsyncId(scheduler, id, null);
        }
        this.delay = null;
    };
    return AsyncAction;
}(Action));

/** PURE_IMPORTS_START tslib,_AsyncAction PURE_IMPORTS_END */
var QueueAction = /*@__PURE__*/ (function (_super) {
    __extends(QueueAction, _super);
    function QueueAction(scheduler, work) {
        var _this = _super.call(this, scheduler, work) || this;
        _this.scheduler = scheduler;
        _this.work = work;
        return _this;
    }
    QueueAction.prototype.schedule = function (state, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        if (delay > 0) {
            return _super.prototype.schedule.call(this, state, delay);
        }
        this.delay = delay;
        this.state = state;
        this.scheduler.flush(this);
        return this;
    };
    QueueAction.prototype.execute = function (state, delay) {
        return (delay > 0 || this.closed) ?
            _super.prototype.execute.call(this, state, delay) :
            this._execute(state, delay);
    };
    QueueAction.prototype.requestAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        if ((delay !== null && delay > 0) || (delay === null && this.delay > 0)) {
            return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
        }
        return scheduler.flush(this);
    };
    return QueueAction;
}(AsyncAction));

var Scheduler = /*@__PURE__*/ (function () {
    function Scheduler(SchedulerAction, now) {
        if (now === void 0) {
            now = Scheduler.now;
        }
        this.SchedulerAction = SchedulerAction;
        this.now = now;
    }
    Scheduler.prototype.schedule = function (work, delay, state) {
        if (delay === void 0) {
            delay = 0;
        }
        return new this.SchedulerAction(this, work).schedule(state, delay);
    };
    Scheduler.now = function () { return Date.now(); };
    return Scheduler;
}());

/** PURE_IMPORTS_START tslib,_Scheduler PURE_IMPORTS_END */
var AsyncScheduler = /*@__PURE__*/ (function (_super) {
    __extends(AsyncScheduler, _super);
    function AsyncScheduler(SchedulerAction, now) {
        if (now === void 0) {
            now = Scheduler.now;
        }
        var _this = _super.call(this, SchedulerAction, function () {
            if (AsyncScheduler.delegate && AsyncScheduler.delegate !== _this) {
                return AsyncScheduler.delegate.now();
            }
            else {
                return now();
            }
        }) || this;
        _this.actions = [];
        _this.active = false;
        _this.scheduled = undefined;
        return _this;
    }
    AsyncScheduler.prototype.schedule = function (work, delay, state) {
        if (delay === void 0) {
            delay = 0;
        }
        if (AsyncScheduler.delegate && AsyncScheduler.delegate !== this) {
            return AsyncScheduler.delegate.schedule(work, delay, state);
        }
        else {
            return _super.prototype.schedule.call(this, work, delay, state);
        }
    };
    AsyncScheduler.prototype.flush = function (action) {
        var actions = this.actions;
        if (this.active) {
            actions.push(action);
            return;
        }
        var error;
        this.active = true;
        do {
            if (error = action.execute(action.state, action.delay)) {
                break;
            }
        } while (action = actions.shift());
        this.active = false;
        if (error) {
            while (action = actions.shift()) {
                action.unsubscribe();
            }
            throw error;
        }
    };
    return AsyncScheduler;
}(Scheduler));

/** PURE_IMPORTS_START tslib,_AsyncScheduler PURE_IMPORTS_END */
var QueueScheduler = /*@__PURE__*/ (function (_super) {
    __extends(QueueScheduler, _super);
    function QueueScheduler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return QueueScheduler;
}(AsyncScheduler));

/** PURE_IMPORTS_START _QueueAction,_QueueScheduler PURE_IMPORTS_END */
var queueScheduler = /*@__PURE__*/ new QueueScheduler(QueueAction);
var queue$1 = queueScheduler;

/** PURE_IMPORTS_START _Observable PURE_IMPORTS_END */
var EMPTY = /*@__PURE__*/ new Observable(function (subscriber) { return subscriber.complete(); });
function empty$1(scheduler) {
    return scheduler ? emptyScheduled(scheduler) : EMPTY;
}
function emptyScheduled(scheduler) {
    return new Observable(function (subscriber) { return scheduler.schedule(function () { return subscriber.complete(); }); });
}

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function isScheduler(value) {
    return value && typeof value.schedule === 'function';
}

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var subscribeToArray = function (array) {
    return function (subscriber) {
        for (var i = 0, len = array.length; i < len && !subscriber.closed; i++) {
            subscriber.next(array[i]);
        }
        subscriber.complete();
    };
};

/** PURE_IMPORTS_START _Observable,_Subscription PURE_IMPORTS_END */
function scheduleArray(input, scheduler) {
    return new Observable(function (subscriber) {
        var sub = new Subscription();
        var i = 0;
        sub.add(scheduler.schedule(function () {
            if (i === input.length) {
                subscriber.complete();
                return;
            }
            subscriber.next(input[i++]);
            if (!subscriber.closed) {
                sub.add(this.schedule());
            }
        }));
        return sub;
    });
}

/** PURE_IMPORTS_START _Observable,_util_subscribeToArray,_scheduled_scheduleArray PURE_IMPORTS_END */
function fromArray(input, scheduler) {
    if (!scheduler) {
        return new Observable(subscribeToArray(input));
    }
    else {
        return scheduleArray(input, scheduler);
    }
}

/** PURE_IMPORTS_START _util_isScheduler,_fromArray,_scheduled_scheduleArray PURE_IMPORTS_END */
function of() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var scheduler = args[args.length - 1];
    if (isScheduler(scheduler)) {
        args.pop();
        return scheduleArray(args, scheduler);
    }
    else {
        return fromArray(args);
    }
}

/** PURE_IMPORTS_START _Observable PURE_IMPORTS_END */
function throwError(error, scheduler) {
    if (!scheduler) {
        return new Observable(function (subscriber) { return subscriber.error(error); });
    }
    else {
        return new Observable(function (subscriber) { return scheduler.schedule(dispatch$7, 0, { error: error, subscriber: subscriber }); });
    }
}
function dispatch$7(_a) {
    var error = _a.error, subscriber = _a.subscriber;
    subscriber.error(error);
}

/** PURE_IMPORTS_START _observable_empty,_observable_of,_observable_throwError PURE_IMPORTS_END */
var NotificationKind;
/*@__PURE__*/ (function (NotificationKind) {
    NotificationKind["NEXT"] = "N";
    NotificationKind["ERROR"] = "E";
    NotificationKind["COMPLETE"] = "C";
})(NotificationKind || (NotificationKind = {}));
var Notification = /*@__PURE__*/ (function () {
    function Notification(kind, value, error) {
        this.kind = kind;
        this.value = value;
        this.error = error;
        this.hasValue = kind === 'N';
    }
    Notification.prototype.observe = function (observer) {
        switch (this.kind) {
            case 'N':
                return observer.next && observer.next(this.value);
            case 'E':
                return observer.error && observer.error(this.error);
            case 'C':
                return observer.complete && observer.complete();
        }
    };
    Notification.prototype.do = function (next, error, complete) {
        var kind = this.kind;
        switch (kind) {
            case 'N':
                return next && next(this.value);
            case 'E':
                return error && error(this.error);
            case 'C':
                return complete && complete();
        }
    };
    Notification.prototype.accept = function (nextOrObserver, error, complete) {
        if (nextOrObserver && typeof nextOrObserver.next === 'function') {
            return this.observe(nextOrObserver);
        }
        else {
            return this.do(nextOrObserver, error, complete);
        }
    };
    Notification.prototype.toObservable = function () {
        var kind = this.kind;
        switch (kind) {
            case 'N':
                return of(this.value);
            case 'E':
                return throwError(this.error);
            case 'C':
                return empty$1();
        }
        throw new Error('unexpected notification kind value');
    };
    Notification.createNext = function (value) {
        if (typeof value !== 'undefined') {
            return new Notification('N', value);
        }
        return Notification.undefinedValueNotification;
    };
    Notification.createError = function (err) {
        return new Notification('E', undefined, err);
    };
    Notification.createComplete = function () {
        return Notification.completeNotification;
    };
    Notification.completeNotification = new Notification('C');
    Notification.undefinedValueNotification = new Notification('N', undefined);
    return Notification;
}());

/** PURE_IMPORTS_START tslib,_Subscriber,_Notification PURE_IMPORTS_END */
var ObserveOnSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(ObserveOnSubscriber, _super);
    function ObserveOnSubscriber(destination, scheduler, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        var _this = _super.call(this, destination) || this;
        _this.scheduler = scheduler;
        _this.delay = delay;
        return _this;
    }
    ObserveOnSubscriber.dispatch = function (arg) {
        var notification = arg.notification, destination = arg.destination;
        notification.observe(destination);
        this.unsubscribe();
    };
    ObserveOnSubscriber.prototype.scheduleMessage = function (notification) {
        var destination = this.destination;
        destination.add(this.scheduler.schedule(ObserveOnSubscriber.dispatch, this.delay, new ObserveOnMessage(notification, this.destination)));
    };
    ObserveOnSubscriber.prototype._next = function (value) {
        this.scheduleMessage(Notification.createNext(value));
    };
    ObserveOnSubscriber.prototype._error = function (err) {
        this.scheduleMessage(Notification.createError(err));
        this.unsubscribe();
    };
    ObserveOnSubscriber.prototype._complete = function () {
        this.scheduleMessage(Notification.createComplete());
        this.unsubscribe();
    };
    return ObserveOnSubscriber;
}(Subscriber));
var ObserveOnMessage = /*@__PURE__*/ (function () {
    function ObserveOnMessage(notification, destination) {
        this.notification = notification;
        this.destination = destination;
    }
    return ObserveOnMessage;
}());

/** PURE_IMPORTS_START tslib,_Subject,_scheduler_queue,_Subscription,_operators_observeOn,_util_ObjectUnsubscribedError,_SubjectSubscription PURE_IMPORTS_END */
var ReplaySubject = /*@__PURE__*/ (function (_super) {
    __extends(ReplaySubject, _super);
    function ReplaySubject(bufferSize, windowTime, scheduler) {
        if (bufferSize === void 0) {
            bufferSize = Number.POSITIVE_INFINITY;
        }
        if (windowTime === void 0) {
            windowTime = Number.POSITIVE_INFINITY;
        }
        var _this = _super.call(this) || this;
        _this.scheduler = scheduler;
        _this._events = [];
        _this._infiniteTimeWindow = false;
        _this._bufferSize = bufferSize < 1 ? 1 : bufferSize;
        _this._windowTime = windowTime < 1 ? 1 : windowTime;
        if (windowTime === Number.POSITIVE_INFINITY) {
            _this._infiniteTimeWindow = true;
            _this.next = _this.nextInfiniteTimeWindow;
        }
        else {
            _this.next = _this.nextTimeWindow;
        }
        return _this;
    }
    ReplaySubject.prototype.nextInfiniteTimeWindow = function (value) {
        if (!this.isStopped) {
            var _events = this._events;
            _events.push(value);
            if (_events.length > this._bufferSize) {
                _events.shift();
            }
        }
        _super.prototype.next.call(this, value);
    };
    ReplaySubject.prototype.nextTimeWindow = function (value) {
        if (!this.isStopped) {
            this._events.push(new ReplayEvent(this._getNow(), value));
            this._trimBufferThenGetEvents();
        }
        _super.prototype.next.call(this, value);
    };
    ReplaySubject.prototype._subscribe = function (subscriber) {
        var _infiniteTimeWindow = this._infiniteTimeWindow;
        var _events = _infiniteTimeWindow ? this._events : this._trimBufferThenGetEvents();
        var scheduler = this.scheduler;
        var len = _events.length;
        var subscription;
        if (this.closed) {
            throw new ObjectUnsubscribedError();
        }
        else if (this.isStopped || this.hasError) {
            subscription = Subscription.EMPTY;
        }
        else {
            this.observers.push(subscriber);
            subscription = new SubjectSubscription(this, subscriber);
        }
        if (scheduler) {
            subscriber.add(subscriber = new ObserveOnSubscriber(subscriber, scheduler));
        }
        if (_infiniteTimeWindow) {
            for (var i = 0; i < len && !subscriber.closed; i++) {
                subscriber.next(_events[i]);
            }
        }
        else {
            for (var i = 0; i < len && !subscriber.closed; i++) {
                subscriber.next(_events[i].value);
            }
        }
        if (this.hasError) {
            subscriber.error(this.thrownError);
        }
        else if (this.isStopped) {
            subscriber.complete();
        }
        return subscription;
    };
    ReplaySubject.prototype._getNow = function () {
        return (this.scheduler || queue$1).now();
    };
    ReplaySubject.prototype._trimBufferThenGetEvents = function () {
        var now = this._getNow();
        var _bufferSize = this._bufferSize;
        var _windowTime = this._windowTime;
        var _events = this._events;
        var eventsCount = _events.length;
        var spliceCount = 0;
        while (spliceCount < eventsCount) {
            if ((now - _events[spliceCount].time) < _windowTime) {
                break;
            }
            spliceCount++;
        }
        if (eventsCount > _bufferSize) {
            spliceCount = Math.max(spliceCount, eventsCount - _bufferSize);
        }
        if (spliceCount > 0) {
            _events.splice(0, spliceCount);
        }
        return _events;
    };
    return ReplaySubject;
}(Subject));
var ReplayEvent = /*@__PURE__*/ (function () {
    function ReplayEvent(time, value) {
        this.time = time;
        this.value = value;
    }
    return ReplayEvent;
}());

/** PURE_IMPORTS_START tslib,_Subject,_Subscription PURE_IMPORTS_END */
var AsyncSubject = /*@__PURE__*/ (function (_super) {
    __extends(AsyncSubject, _super);
    function AsyncSubject() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.value = null;
        _this.hasNext = false;
        _this.hasCompleted = false;
        return _this;
    }
    AsyncSubject.prototype._subscribe = function (subscriber) {
        if (this.hasError) {
            subscriber.error(this.thrownError);
            return Subscription.EMPTY;
        }
        else if (this.hasCompleted && this.hasNext) {
            subscriber.next(this.value);
            subscriber.complete();
            return Subscription.EMPTY;
        }
        return _super.prototype._subscribe.call(this, subscriber);
    };
    AsyncSubject.prototype.next = function (value) {
        if (!this.hasCompleted) {
            this.value = value;
            this.hasNext = true;
        }
    };
    AsyncSubject.prototype.error = function (error) {
        if (!this.hasCompleted) {
            _super.prototype.error.call(this, error);
        }
    };
    AsyncSubject.prototype.complete = function () {
        this.hasCompleted = true;
        if (this.hasNext) {
            _super.prototype.next.call(this, this.value);
        }
        _super.prototype.complete.call(this);
    };
    return AsyncSubject;
}(Subject));

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var nextHandle = 1;
var RESOLVED = /*@__PURE__*/ (function () { return /*@__PURE__*/ Promise.resolve(); })();
var activeHandles = {};
function findAndClearHandle(handle) {
    if (handle in activeHandles) {
        delete activeHandles[handle];
        return true;
    }
    return false;
}
var Immediate = {
    setImmediate: function (cb) {
        var handle = nextHandle++;
        activeHandles[handle] = true;
        RESOLVED.then(function () { return findAndClearHandle(handle) && cb(); });
        return handle;
    },
    clearImmediate: function (handle) {
        findAndClearHandle(handle);
    },
};

/** PURE_IMPORTS_START tslib,_util_Immediate,_AsyncAction PURE_IMPORTS_END */
var AsapAction = /*@__PURE__*/ (function (_super) {
    __extends(AsapAction, _super);
    function AsapAction(scheduler, work) {
        var _this = _super.call(this, scheduler, work) || this;
        _this.scheduler = scheduler;
        _this.work = work;
        return _this;
    }
    AsapAction.prototype.requestAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        if (delay !== null && delay > 0) {
            return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
        }
        scheduler.actions.push(this);
        return scheduler.scheduled || (scheduler.scheduled = Immediate.setImmediate(scheduler.flush.bind(scheduler, null)));
    };
    AsapAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        if ((delay !== null && delay > 0) || (delay === null && this.delay > 0)) {
            return _super.prototype.recycleAsyncId.call(this, scheduler, id, delay);
        }
        if (scheduler.actions.length === 0) {
            Immediate.clearImmediate(id);
            scheduler.scheduled = undefined;
        }
        return undefined;
    };
    return AsapAction;
}(AsyncAction));

/** PURE_IMPORTS_START tslib,_AsyncScheduler PURE_IMPORTS_END */
var AsapScheduler = /*@__PURE__*/ (function (_super) {
    __extends(AsapScheduler, _super);
    function AsapScheduler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AsapScheduler.prototype.flush = function (action) {
        this.active = true;
        this.scheduled = undefined;
        var actions = this.actions;
        var error;
        var index = -1;
        var count = actions.length;
        action = action || actions.shift();
        do {
            if (error = action.execute(action.state, action.delay)) {
                break;
            }
        } while (++index < count && (action = actions.shift()));
        this.active = false;
        if (error) {
            while (++index < count && (action = actions.shift())) {
                action.unsubscribe();
            }
            throw error;
        }
    };
    return AsapScheduler;
}(AsyncScheduler));

/** PURE_IMPORTS_START _AsapAction,_AsapScheduler PURE_IMPORTS_END */
var asapScheduler = /*@__PURE__*/ new AsapScheduler(AsapAction);
var asap = asapScheduler;

/** PURE_IMPORTS_START _AsyncAction,_AsyncScheduler PURE_IMPORTS_END */
var asyncScheduler = /*@__PURE__*/ new AsyncScheduler(AsyncAction);
var async = asyncScheduler;

/** PURE_IMPORTS_START tslib,_AsyncAction PURE_IMPORTS_END */
var AnimationFrameAction = /*@__PURE__*/ (function (_super) {
    __extends(AnimationFrameAction, _super);
    function AnimationFrameAction(scheduler, work) {
        var _this = _super.call(this, scheduler, work) || this;
        _this.scheduler = scheduler;
        _this.work = work;
        return _this;
    }
    AnimationFrameAction.prototype.requestAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        if (delay !== null && delay > 0) {
            return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
        }
        scheduler.actions.push(this);
        return scheduler.scheduled || (scheduler.scheduled = requestAnimationFrame(function () { return scheduler.flush(null); }));
    };
    AnimationFrameAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        if ((delay !== null && delay > 0) || (delay === null && this.delay > 0)) {
            return _super.prototype.recycleAsyncId.call(this, scheduler, id, delay);
        }
        if (scheduler.actions.length === 0) {
            cancelAnimationFrame(id);
            scheduler.scheduled = undefined;
        }
        return undefined;
    };
    return AnimationFrameAction;
}(AsyncAction));

/** PURE_IMPORTS_START tslib,_AsyncScheduler PURE_IMPORTS_END */
var AnimationFrameScheduler = /*@__PURE__*/ (function (_super) {
    __extends(AnimationFrameScheduler, _super);
    function AnimationFrameScheduler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AnimationFrameScheduler.prototype.flush = function (action) {
        this.active = true;
        this.scheduled = undefined;
        var actions = this.actions;
        var error;
        var index = -1;
        var count = actions.length;
        action = action || actions.shift();
        do {
            if (error = action.execute(action.state, action.delay)) {
                break;
            }
        } while (++index < count && (action = actions.shift()));
        this.active = false;
        if (error) {
            while (++index < count && (action = actions.shift())) {
                action.unsubscribe();
            }
            throw error;
        }
    };
    return AnimationFrameScheduler;
}(AsyncScheduler));

/** PURE_IMPORTS_START _AnimationFrameAction,_AnimationFrameScheduler PURE_IMPORTS_END */
var animationFrameScheduler = /*@__PURE__*/ new AnimationFrameScheduler(AnimationFrameAction);
var animationFrame = animationFrameScheduler;

/** PURE_IMPORTS_START tslib,_AsyncAction,_AsyncScheduler PURE_IMPORTS_END */
var VirtualTimeScheduler = /*@__PURE__*/ (function (_super) {
    __extends(VirtualTimeScheduler, _super);
    function VirtualTimeScheduler(SchedulerAction, maxFrames) {
        if (SchedulerAction === void 0) {
            SchedulerAction = VirtualAction;
        }
        if (maxFrames === void 0) {
            maxFrames = Number.POSITIVE_INFINITY;
        }
        var _this = _super.call(this, SchedulerAction, function () { return _this.frame; }) || this;
        _this.maxFrames = maxFrames;
        _this.frame = 0;
        _this.index = -1;
        return _this;
    }
    VirtualTimeScheduler.prototype.flush = function () {
        var _a = this, actions = _a.actions, maxFrames = _a.maxFrames;
        var error, action;
        while ((action = actions[0]) && action.delay <= maxFrames) {
            actions.shift();
            this.frame = action.delay;
            if (error = action.execute(action.state, action.delay)) {
                break;
            }
        }
        if (error) {
            while (action = actions.shift()) {
                action.unsubscribe();
            }
            throw error;
        }
    };
    VirtualTimeScheduler.frameTimeFactor = 10;
    return VirtualTimeScheduler;
}(AsyncScheduler));
var VirtualAction = /*@__PURE__*/ (function (_super) {
    __extends(VirtualAction, _super);
    function VirtualAction(scheduler, work, index) {
        if (index === void 0) {
            index = scheduler.index += 1;
        }
        var _this = _super.call(this, scheduler, work) || this;
        _this.scheduler = scheduler;
        _this.work = work;
        _this.index = index;
        _this.active = true;
        _this.index = scheduler.index = index;
        return _this;
    }
    VirtualAction.prototype.schedule = function (state, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        if (!this.id) {
            return _super.prototype.schedule.call(this, state, delay);
        }
        this.active = false;
        var action = new VirtualAction(this.scheduler, this.work);
        this.add(action);
        return action.schedule(state, delay);
    };
    VirtualAction.prototype.requestAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        this.delay = scheduler.frame + delay;
        var actions = scheduler.actions;
        actions.push(this);
        actions.sort(VirtualAction.sortActions);
        return true;
    };
    VirtualAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
        return undefined;
    };
    VirtualAction.prototype._execute = function (state, delay) {
        if (this.active === true) {
            return _super.prototype._execute.call(this, state, delay);
        }
    };
    VirtualAction.sortActions = function (a, b) {
        if (a.delay === b.delay) {
            if (a.index === b.index) {
                return 0;
            }
            else if (a.index > b.index) {
                return 1;
            }
            else {
                return -1;
            }
        }
        else if (a.delay > b.delay) {
            return 1;
        }
        else {
            return -1;
        }
    };
    return VirtualAction;
}(AsyncAction));

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function noop$1() { }

/** PURE_IMPORTS_START _Observable PURE_IMPORTS_END */
function isObservable(obj) {
    return !!obj && (obj instanceof Observable || (typeof obj.lift === 'function' && typeof obj.subscribe === 'function'));
}

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var ArgumentOutOfRangeErrorImpl = /*@__PURE__*/ (function () {
    function ArgumentOutOfRangeErrorImpl() {
        Error.call(this);
        this.message = 'argument out of range';
        this.name = 'ArgumentOutOfRangeError';
        return this;
    }
    ArgumentOutOfRangeErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
    return ArgumentOutOfRangeErrorImpl;
})();
var ArgumentOutOfRangeError = ArgumentOutOfRangeErrorImpl;

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var EmptyErrorImpl = /*@__PURE__*/ (function () {
    function EmptyErrorImpl() {
        Error.call(this);
        this.message = 'no elements in sequence';
        this.name = 'EmptyError';
        return this;
    }
    EmptyErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
    return EmptyErrorImpl;
})();
var EmptyError = EmptyErrorImpl;

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var TimeoutErrorImpl = /*@__PURE__*/ (function () {
    function TimeoutErrorImpl() {
        Error.call(this);
        this.message = 'Timeout has occurred';
        this.name = 'TimeoutError';
        return this;
    }
    TimeoutErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
    return TimeoutErrorImpl;
})();
var TimeoutError = TimeoutErrorImpl;

/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
function map(project, thisArg) {
    return function mapOperation(source) {
        if (typeof project !== 'function') {
            throw new TypeError('argument is not a function. Are you looking for `mapTo()`?');
        }
        return source.lift(new MapOperator(project, thisArg));
    };
}
var MapOperator = /*@__PURE__*/ (function () {
    function MapOperator(project, thisArg) {
        this.project = project;
        this.thisArg = thisArg;
    }
    MapOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new MapSubscriber(subscriber, this.project, this.thisArg));
    };
    return MapOperator;
}());
var MapSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(MapSubscriber, _super);
    function MapSubscriber(destination, project, thisArg) {
        var _this = _super.call(this, destination) || this;
        _this.project = project;
        _this.count = 0;
        _this.thisArg = thisArg || _this;
        return _this;
    }
    MapSubscriber.prototype._next = function (value) {
        var result;
        try {
            result = this.project.call(this.thisArg, value, this.count++);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.destination.next(result);
    };
    return MapSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START _Observable,_AsyncSubject,_operators_map,_util_canReportError,_util_isArray,_util_isScheduler PURE_IMPORTS_END */
function bindCallback(callbackFunc, resultSelector, scheduler) {
    if (resultSelector) {
        if (isScheduler(resultSelector)) {
            scheduler = resultSelector;
        }
        else {
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return bindCallback(callbackFunc, scheduler).apply(void 0, args).pipe(map(function (args) { return isArray(args) ? resultSelector.apply(void 0, args) : resultSelector(args); }));
            };
        }
    }
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var context = this;
        var subject;
        var params = {
            context: context,
            subject: subject,
            callbackFunc: callbackFunc,
            scheduler: scheduler,
        };
        return new Observable(function (subscriber) {
            if (!scheduler) {
                if (!subject) {
                    subject = new AsyncSubject();
                    var handler = function () {
                        var innerArgs = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            innerArgs[_i] = arguments[_i];
                        }
                        subject.next(innerArgs.length <= 1 ? innerArgs[0] : innerArgs);
                        subject.complete();
                    };
                    try {
                        callbackFunc.apply(context, args.concat([handler]));
                    }
                    catch (err) {
                        if (canReportError(subject)) {
                            subject.error(err);
                        }
                        else {
                            console.warn(err);
                        }
                    }
                }
                return subject.subscribe(subscriber);
            }
            else {
                var state = {
                    args: args, subscriber: subscriber, params: params,
                };
                return scheduler.schedule(dispatch$6, 0, state);
            }
        });
    };
}
function dispatch$6(state) {
    var _this = this;
    var args = state.args, subscriber = state.subscriber, params = state.params;
    var callbackFunc = params.callbackFunc, context = params.context, scheduler = params.scheduler;
    var subject = params.subject;
    if (!subject) {
        subject = params.subject = new AsyncSubject();
        var handler = function () {
            var innerArgs = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                innerArgs[_i] = arguments[_i];
            }
            var value = innerArgs.length <= 1 ? innerArgs[0] : innerArgs;
            _this.add(scheduler.schedule(dispatchNext$1, 0, { value: value, subject: subject }));
        };
        try {
            callbackFunc.apply(context, args.concat([handler]));
        }
        catch (err) {
            subject.error(err);
        }
    }
    this.add(subject.subscribe(subscriber));
}
function dispatchNext$1(state) {
    var value = state.value, subject = state.subject;
    subject.next(value);
    subject.complete();
}

/** PURE_IMPORTS_START _Observable,_AsyncSubject,_operators_map,_util_canReportError,_util_isScheduler,_util_isArray PURE_IMPORTS_END */
function bindNodeCallback(callbackFunc, resultSelector, scheduler) {
    if (resultSelector) {
        if (isScheduler(resultSelector)) {
            scheduler = resultSelector;
        }
        else {
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return bindNodeCallback(callbackFunc, scheduler).apply(void 0, args).pipe(map(function (args) { return isArray(args) ? resultSelector.apply(void 0, args) : resultSelector(args); }));
            };
        }
    }
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var params = {
            subject: undefined,
            args: args,
            callbackFunc: callbackFunc,
            scheduler: scheduler,
            context: this,
        };
        return new Observable(function (subscriber) {
            var context = params.context;
            var subject = params.subject;
            if (!scheduler) {
                if (!subject) {
                    subject = params.subject = new AsyncSubject();
                    var handler = function () {
                        var innerArgs = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            innerArgs[_i] = arguments[_i];
                        }
                        var err = innerArgs.shift();
                        if (err) {
                            subject.error(err);
                            return;
                        }
                        subject.next(innerArgs.length <= 1 ? innerArgs[0] : innerArgs);
                        subject.complete();
                    };
                    try {
                        callbackFunc.apply(context, args.concat([handler]));
                    }
                    catch (err) {
                        if (canReportError(subject)) {
                            subject.error(err);
                        }
                        else {
                            console.warn(err);
                        }
                    }
                }
                return subject.subscribe(subscriber);
            }
            else {
                return scheduler.schedule(dispatch$5, 0, { params: params, subscriber: subscriber, context: context });
            }
        });
    };
}
function dispatch$5(state) {
    var _this = this;
    var params = state.params, subscriber = state.subscriber, context = state.context;
    var callbackFunc = params.callbackFunc, args = params.args, scheduler = params.scheduler;
    var subject = params.subject;
    if (!subject) {
        subject = params.subject = new AsyncSubject();
        var handler = function () {
            var innerArgs = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                innerArgs[_i] = arguments[_i];
            }
            var err = innerArgs.shift();
            if (err) {
                _this.add(scheduler.schedule(dispatchError, 0, { err: err, subject: subject }));
            }
            else {
                var value = innerArgs.length <= 1 ? innerArgs[0] : innerArgs;
                _this.add(scheduler.schedule(dispatchNext, 0, { value: value, subject: subject }));
            }
        };
        try {
            callbackFunc.apply(context, args.concat([handler]));
        }
        catch (err) {
            this.add(scheduler.schedule(dispatchError, 0, { err: err, subject: subject }));
        }
    }
    this.add(subject.subscribe(subscriber));
}
function dispatchNext(arg) {
    var value = arg.value, subject = arg.subject;
    subject.next(value);
    subject.complete();
}
function dispatchError(arg) {
    var err = arg.err, subject = arg.subject;
    subject.error(err);
}

/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
var OuterSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(OuterSubscriber, _super);
    function OuterSubscriber() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    OuterSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
        this.destination.next(innerValue);
    };
    OuterSubscriber.prototype.notifyError = function (error, innerSub) {
        this.destination.error(error);
    };
    OuterSubscriber.prototype.notifyComplete = function (innerSub) {
        this.destination.complete();
    };
    return OuterSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
var InnerSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(InnerSubscriber, _super);
    function InnerSubscriber(parent, outerValue, outerIndex) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        _this.outerValue = outerValue;
        _this.outerIndex = outerIndex;
        _this.index = 0;
        return _this;
    }
    InnerSubscriber.prototype._next = function (value) {
        this.parent.notifyNext(this.outerValue, value, this.outerIndex, this.index++, this);
    };
    InnerSubscriber.prototype._error = function (error) {
        this.parent.notifyError(error, this);
        this.unsubscribe();
    };
    InnerSubscriber.prototype._complete = function () {
        this.parent.notifyComplete(this);
        this.unsubscribe();
    };
    return InnerSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START _hostReportError PURE_IMPORTS_END */
var subscribeToPromise = function (promise) {
    return function (subscriber) {
        promise.then(function (value) {
            if (!subscriber.closed) {
                subscriber.next(value);
                subscriber.complete();
            }
        }, function (err) { return subscriber.error(err); })
            .then(null, hostReportError);
        return subscriber;
    };
};

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function getSymbolIterator() {
    if (typeof Symbol !== 'function' || !Symbol.iterator) {
        return '@@iterator';
    }
    return Symbol.iterator;
}
var iterator = /*@__PURE__*/ getSymbolIterator();

/** PURE_IMPORTS_START _symbol_iterator PURE_IMPORTS_END */
var subscribeToIterable = function (iterable) {
    return function (subscriber) {
        var iterator$1 = iterable[iterator]();
        do {
            var item = void 0;
            try {
                item = iterator$1.next();
            }
            catch (err) {
                subscriber.error(err);
                return subscriber;
            }
            if (item.done) {
                subscriber.complete();
                break;
            }
            subscriber.next(item.value);
            if (subscriber.closed) {
                break;
            }
        } while (true);
        if (typeof iterator$1.return === 'function') {
            subscriber.add(function () {
                if (iterator$1.return) {
                    iterator$1.return();
                }
            });
        }
        return subscriber;
    };
};

/** PURE_IMPORTS_START _symbol_observable PURE_IMPORTS_END */
var subscribeToObservable = function (obj) {
    return function (subscriber) {
        var obs = obj[observable]();
        if (typeof obs.subscribe !== 'function') {
            throw new TypeError('Provided object does not correctly implement Symbol.observable');
        }
        else {
            return obs.subscribe(subscriber);
        }
    };
};

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var isArrayLike = (function (x) { return x && typeof x.length === 'number' && typeof x !== 'function'; });

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function isPromise(value) {
    return !!value && typeof value.subscribe !== 'function' && typeof value.then === 'function';
}

/** PURE_IMPORTS_START _subscribeToArray,_subscribeToPromise,_subscribeToIterable,_subscribeToObservable,_isArrayLike,_isPromise,_isObject,_symbol_iterator,_symbol_observable PURE_IMPORTS_END */
var subscribeTo = function (result) {
    if (!!result && typeof result[observable] === 'function') {
        return subscribeToObservable(result);
    }
    else if (isArrayLike(result)) {
        return subscribeToArray(result);
    }
    else if (isPromise(result)) {
        return subscribeToPromise(result);
    }
    else if (!!result && typeof result[iterator] === 'function') {
        return subscribeToIterable(result);
    }
    else {
        var value = isObject(result) ? 'an invalid object' : "'" + result + "'";
        var msg = "You provided " + value + " where a stream was expected."
            + ' You can provide an Observable, Promise, Array, or Iterable.';
        throw new TypeError(msg);
    }
};

/** PURE_IMPORTS_START _InnerSubscriber,_subscribeTo,_Observable PURE_IMPORTS_END */
function subscribeToResult(outerSubscriber, result, outerValue, outerIndex, innerSubscriber) {
    if (innerSubscriber === void 0) {
        innerSubscriber = new InnerSubscriber(outerSubscriber, outerValue, outerIndex);
    }
    if (innerSubscriber.closed) {
        return undefined;
    }
    if (result instanceof Observable) {
        return result.subscribe(innerSubscriber);
    }
    return subscribeTo(result)(innerSubscriber);
}

/** PURE_IMPORTS_START tslib,_util_isScheduler,_util_isArray,_OuterSubscriber,_util_subscribeToResult,_fromArray PURE_IMPORTS_END */
var NONE = {};
function combineLatest() {
    var observables = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        observables[_i] = arguments[_i];
    }
    var resultSelector = undefined;
    var scheduler = undefined;
    if (isScheduler(observables[observables.length - 1])) {
        scheduler = observables.pop();
    }
    if (typeof observables[observables.length - 1] === 'function') {
        resultSelector = observables.pop();
    }
    if (observables.length === 1 && isArray(observables[0])) {
        observables = observables[0];
    }
    return fromArray(observables, scheduler).lift(new CombineLatestOperator(resultSelector));
}
var CombineLatestOperator = /*@__PURE__*/ (function () {
    function CombineLatestOperator(resultSelector) {
        this.resultSelector = resultSelector;
    }
    CombineLatestOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new CombineLatestSubscriber(subscriber, this.resultSelector));
    };
    return CombineLatestOperator;
}());
var CombineLatestSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(CombineLatestSubscriber, _super);
    function CombineLatestSubscriber(destination, resultSelector) {
        var _this = _super.call(this, destination) || this;
        _this.resultSelector = resultSelector;
        _this.active = 0;
        _this.values = [];
        _this.observables = [];
        return _this;
    }
    CombineLatestSubscriber.prototype._next = function (observable) {
        this.values.push(NONE);
        this.observables.push(observable);
    };
    CombineLatestSubscriber.prototype._complete = function () {
        var observables = this.observables;
        var len = observables.length;
        if (len === 0) {
            this.destination.complete();
        }
        else {
            this.active = len;
            this.toRespond = len;
            for (var i = 0; i < len; i++) {
                var observable = observables[i];
                this.add(subscribeToResult(this, observable, undefined, i));
            }
        }
    };
    CombineLatestSubscriber.prototype.notifyComplete = function (unused) {
        if ((this.active -= 1) === 0) {
            this.destination.complete();
        }
    };
    CombineLatestSubscriber.prototype.notifyNext = function (_outerValue, innerValue, outerIndex) {
        var values = this.values;
        var oldVal = values[outerIndex];
        var toRespond = !this.toRespond
            ? 0
            : oldVal === NONE ? --this.toRespond : this.toRespond;
        values[outerIndex] = innerValue;
        if (toRespond === 0) {
            if (this.resultSelector) {
                this._tryResultSelector(values);
            }
            else {
                this.destination.next(values.slice());
            }
        }
    };
    CombineLatestSubscriber.prototype._tryResultSelector = function (values) {
        var result;
        try {
            result = this.resultSelector.apply(this, values);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.destination.next(result);
    };
    return CombineLatestSubscriber;
}(OuterSubscriber));

/** PURE_IMPORTS_START _Observable,_Subscription,_symbol_observable PURE_IMPORTS_END */
function scheduleObservable(input, scheduler) {
    return new Observable(function (subscriber) {
        var sub = new Subscription();
        sub.add(scheduler.schedule(function () {
            var observable$1 = input[observable]();
            sub.add(observable$1.subscribe({
                next: function (value) { sub.add(scheduler.schedule(function () { return subscriber.next(value); })); },
                error: function (err) { sub.add(scheduler.schedule(function () { return subscriber.error(err); })); },
                complete: function () { sub.add(scheduler.schedule(function () { return subscriber.complete(); })); },
            }));
        }));
        return sub;
    });
}

/** PURE_IMPORTS_START _Observable,_Subscription PURE_IMPORTS_END */
function schedulePromise(input, scheduler) {
    return new Observable(function (subscriber) {
        var sub = new Subscription();
        sub.add(scheduler.schedule(function () {
            return input.then(function (value) {
                sub.add(scheduler.schedule(function () {
                    subscriber.next(value);
                    sub.add(scheduler.schedule(function () { return subscriber.complete(); }));
                }));
            }, function (err) {
                sub.add(scheduler.schedule(function () { return subscriber.error(err); }));
            });
        }));
        return sub;
    });
}

/** PURE_IMPORTS_START _Observable,_Subscription,_symbol_iterator PURE_IMPORTS_END */
function scheduleIterable(input, scheduler) {
    if (!input) {
        throw new Error('Iterable cannot be null');
    }
    return new Observable(function (subscriber) {
        var sub = new Subscription();
        var iterator$1;
        sub.add(function () {
            if (iterator$1 && typeof iterator$1.return === 'function') {
                iterator$1.return();
            }
        });
        sub.add(scheduler.schedule(function () {
            iterator$1 = input[iterator]();
            sub.add(scheduler.schedule(function () {
                if (subscriber.closed) {
                    return;
                }
                var value;
                var done;
                try {
                    var result = iterator$1.next();
                    value = result.value;
                    done = result.done;
                }
                catch (err) {
                    subscriber.error(err);
                    return;
                }
                if (done) {
                    subscriber.complete();
                }
                else {
                    subscriber.next(value);
                    this.schedule();
                }
            }));
        }));
        return sub;
    });
}

/** PURE_IMPORTS_START _symbol_observable PURE_IMPORTS_END */
function isInteropObservable(input) {
    return input && typeof input[observable] === 'function';
}

/** PURE_IMPORTS_START _symbol_iterator PURE_IMPORTS_END */
function isIterable(input) {
    return input && typeof input[iterator] === 'function';
}

/** PURE_IMPORTS_START _scheduleObservable,_schedulePromise,_scheduleArray,_scheduleIterable,_util_isInteropObservable,_util_isPromise,_util_isArrayLike,_util_isIterable PURE_IMPORTS_END */
function scheduled(input, scheduler) {
    if (input != null) {
        if (isInteropObservable(input)) {
            return scheduleObservable(input, scheduler);
        }
        else if (isPromise(input)) {
            return schedulePromise(input, scheduler);
        }
        else if (isArrayLike(input)) {
            return scheduleArray(input, scheduler);
        }
        else if (isIterable(input) || typeof input === 'string') {
            return scheduleIterable(input, scheduler);
        }
    }
    throw new TypeError((input !== null && typeof input || input) + ' is not observable');
}

/** PURE_IMPORTS_START _Observable,_util_subscribeTo,_scheduled_scheduled PURE_IMPORTS_END */
function from(input, scheduler) {
    if (!scheduler) {
        if (input instanceof Observable) {
            return input;
        }
        return new Observable(subscribeTo(input));
    }
    else {
        return scheduled(input, scheduler);
    }
}

/** PURE_IMPORTS_START tslib,_Subscriber,_Observable,_util_subscribeTo PURE_IMPORTS_END */
var SimpleInnerSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(SimpleInnerSubscriber, _super);
    function SimpleInnerSubscriber(parent) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        return _this;
    }
    SimpleInnerSubscriber.prototype._next = function (value) {
        this.parent.notifyNext(value);
    };
    SimpleInnerSubscriber.prototype._error = function (error) {
        this.parent.notifyError(error);
        this.unsubscribe();
    };
    SimpleInnerSubscriber.prototype._complete = function () {
        this.parent.notifyComplete();
        this.unsubscribe();
    };
    return SimpleInnerSubscriber;
}(Subscriber));
var SimpleOuterSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(SimpleOuterSubscriber, _super);
    function SimpleOuterSubscriber() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SimpleOuterSubscriber.prototype.notifyNext = function (innerValue) {
        this.destination.next(innerValue);
    };
    SimpleOuterSubscriber.prototype.notifyError = function (err) {
        this.destination.error(err);
    };
    SimpleOuterSubscriber.prototype.notifyComplete = function () {
        this.destination.complete();
    };
    return SimpleOuterSubscriber;
}(Subscriber));
function innerSubscribe(result, innerSubscriber) {
    if (innerSubscriber.closed) {
        return undefined;
    }
    if (result instanceof Observable) {
        return result.subscribe(innerSubscriber);
    }
    var subscription;
    try {
        subscription = subscribeTo(result)(innerSubscriber);
    }
    catch (error) {
        innerSubscriber.error(error);
    }
    return subscription;
}

/** PURE_IMPORTS_START tslib,_map,_observable_from,_innerSubscribe PURE_IMPORTS_END */
function mergeMap(project, resultSelector, concurrent) {
    if (concurrent === void 0) {
        concurrent = Number.POSITIVE_INFINITY;
    }
    if (typeof resultSelector === 'function') {
        return function (source) { return source.pipe(mergeMap(function (a, i) { return from(project(a, i)).pipe(map(function (b, ii) { return resultSelector(a, b, i, ii); })); }, concurrent)); };
    }
    else if (typeof resultSelector === 'number') {
        concurrent = resultSelector;
    }
    return function (source) { return source.lift(new MergeMapOperator(project, concurrent)); };
}
var MergeMapOperator = /*@__PURE__*/ (function () {
    function MergeMapOperator(project, concurrent) {
        if (concurrent === void 0) {
            concurrent = Number.POSITIVE_INFINITY;
        }
        this.project = project;
        this.concurrent = concurrent;
    }
    MergeMapOperator.prototype.call = function (observer, source) {
        return source.subscribe(new MergeMapSubscriber(observer, this.project, this.concurrent));
    };
    return MergeMapOperator;
}());
var MergeMapSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(MergeMapSubscriber, _super);
    function MergeMapSubscriber(destination, project, concurrent) {
        if (concurrent === void 0) {
            concurrent = Number.POSITIVE_INFINITY;
        }
        var _this = _super.call(this, destination) || this;
        _this.project = project;
        _this.concurrent = concurrent;
        _this.hasCompleted = false;
        _this.buffer = [];
        _this.active = 0;
        _this.index = 0;
        return _this;
    }
    MergeMapSubscriber.prototype._next = function (value) {
        if (this.active < this.concurrent) {
            this._tryNext(value);
        }
        else {
            this.buffer.push(value);
        }
    };
    MergeMapSubscriber.prototype._tryNext = function (value) {
        var result;
        var index = this.index++;
        try {
            result = this.project(value, index);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.active++;
        this._innerSub(result);
    };
    MergeMapSubscriber.prototype._innerSub = function (ish) {
        var innerSubscriber = new SimpleInnerSubscriber(this);
        var destination = this.destination;
        destination.add(innerSubscriber);
        var innerSubscription = innerSubscribe(ish, innerSubscriber);
        if (innerSubscription !== innerSubscriber) {
            destination.add(innerSubscription);
        }
    };
    MergeMapSubscriber.prototype._complete = function () {
        this.hasCompleted = true;
        if (this.active === 0 && this.buffer.length === 0) {
            this.destination.complete();
        }
        this.unsubscribe();
    };
    MergeMapSubscriber.prototype.notifyNext = function (innerValue) {
        this.destination.next(innerValue);
    };
    MergeMapSubscriber.prototype.notifyComplete = function () {
        var buffer = this.buffer;
        this.active--;
        if (buffer.length > 0) {
            this._next(buffer.shift());
        }
        else if (this.active === 0 && this.hasCompleted) {
            this.destination.complete();
        }
    };
    return MergeMapSubscriber;
}(SimpleOuterSubscriber));

/** PURE_IMPORTS_START _mergeMap,_util_identity PURE_IMPORTS_END */
function mergeAll(concurrent) {
    if (concurrent === void 0) {
        concurrent = Number.POSITIVE_INFINITY;
    }
    return mergeMap(identity, concurrent);
}

/** PURE_IMPORTS_START _mergeAll PURE_IMPORTS_END */
function concatAll() {
    return mergeAll(1);
}

/** PURE_IMPORTS_START _of,_operators_concatAll PURE_IMPORTS_END */
function concat() {
    var observables = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        observables[_i] = arguments[_i];
    }
    return concatAll()(of.apply(void 0, observables));
}

/** PURE_IMPORTS_START _Observable,_from,_empty PURE_IMPORTS_END */
function defer(observableFactory) {
    return new Observable(function (subscriber) {
        var input;
        try {
            input = observableFactory();
        }
        catch (err) {
            subscriber.error(err);
            return undefined;
        }
        var source = input ? from(input) : empty$1();
        return source.subscribe(subscriber);
    });
}

/** PURE_IMPORTS_START _Observable,_util_isArray,_operators_map,_util_isObject,_from PURE_IMPORTS_END */
function forkJoin() {
    var sources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sources[_i] = arguments[_i];
    }
    if (sources.length === 1) {
        var first_1 = sources[0];
        if (isArray(first_1)) {
            return forkJoinInternal(first_1, null);
        }
        if (isObject(first_1) && Object.getPrototypeOf(first_1) === Object.prototype) {
            var keys = Object.keys(first_1);
            return forkJoinInternal(keys.map(function (key) { return first_1[key]; }), keys);
        }
    }
    if (typeof sources[sources.length - 1] === 'function') {
        var resultSelector_1 = sources.pop();
        sources = (sources.length === 1 && isArray(sources[0])) ? sources[0] : sources;
        return forkJoinInternal(sources, null).pipe(map(function (args) { return resultSelector_1.apply(void 0, args); }));
    }
    return forkJoinInternal(sources, null);
}
function forkJoinInternal(sources, keys) {
    return new Observable(function (subscriber) {
        var len = sources.length;
        if (len === 0) {
            subscriber.complete();
            return;
        }
        var values = new Array(len);
        var completed = 0;
        var emitted = 0;
        var _loop_1 = function (i) {
            var source = from(sources[i]);
            var hasValue = false;
            subscriber.add(source.subscribe({
                next: function (value) {
                    if (!hasValue) {
                        hasValue = true;
                        emitted++;
                    }
                    values[i] = value;
                },
                error: function (err) { return subscriber.error(err); },
                complete: function () {
                    completed++;
                    if (completed === len || !hasValue) {
                        if (emitted === len) {
                            subscriber.next(keys ?
                                keys.reduce(function (result, key, i) { return (result[key] = values[i], result); }, {}) :
                                values);
                        }
                        subscriber.complete();
                    }
                }
            }));
        };
        for (var i = 0; i < len; i++) {
            _loop_1(i);
        }
    });
}

/** PURE_IMPORTS_START _Observable,_util_isArray,_util_isFunction,_operators_map PURE_IMPORTS_END */
function fromEvent(target, eventName, options, resultSelector) {
    if (isFunction(options)) {
        resultSelector = options;
        options = undefined;
    }
    if (resultSelector) {
        return fromEvent(target, eventName, options).pipe(map(function (args) { return isArray(args) ? resultSelector.apply(void 0, args) : resultSelector(args); }));
    }
    return new Observable(function (subscriber) {
        function handler(e) {
            if (arguments.length > 1) {
                subscriber.next(Array.prototype.slice.call(arguments));
            }
            else {
                subscriber.next(e);
            }
        }
        setupSubscription(target, eventName, handler, subscriber, options);
    });
}
function setupSubscription(sourceObj, eventName, handler, subscriber, options) {
    var unsubscribe;
    if (isEventTarget(sourceObj)) {
        var source_1 = sourceObj;
        sourceObj.addEventListener(eventName, handler, options);
        unsubscribe = function () { return source_1.removeEventListener(eventName, handler, options); };
    }
    else if (isJQueryStyleEventEmitter(sourceObj)) {
        var source_2 = sourceObj;
        sourceObj.on(eventName, handler);
        unsubscribe = function () { return source_2.off(eventName, handler); };
    }
    else if (isNodeStyleEventEmitter(sourceObj)) {
        var source_3 = sourceObj;
        sourceObj.addListener(eventName, handler);
        unsubscribe = function () { return source_3.removeListener(eventName, handler); };
    }
    else if (sourceObj && sourceObj.length) {
        for (var i = 0, len = sourceObj.length; i < len; i++) {
            setupSubscription(sourceObj[i], eventName, handler, subscriber, options);
        }
    }
    else {
        throw new TypeError('Invalid event target');
    }
    subscriber.add(unsubscribe);
}
function isNodeStyleEventEmitter(sourceObj) {
    return sourceObj && typeof sourceObj.addListener === 'function' && typeof sourceObj.removeListener === 'function';
}
function isJQueryStyleEventEmitter(sourceObj) {
    return sourceObj && typeof sourceObj.on === 'function' && typeof sourceObj.off === 'function';
}
function isEventTarget(sourceObj) {
    return sourceObj && typeof sourceObj.addEventListener === 'function' && typeof sourceObj.removeEventListener === 'function';
}

/** PURE_IMPORTS_START _Observable,_util_isArray,_util_isFunction,_operators_map PURE_IMPORTS_END */
function fromEventPattern(addHandler, removeHandler, resultSelector) {
    if (resultSelector) {
        return fromEventPattern(addHandler, removeHandler).pipe(map(function (args) { return isArray(args) ? resultSelector.apply(void 0, args) : resultSelector(args); }));
    }
    return new Observable(function (subscriber) {
        var handler = function () {
            var e = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                e[_i] = arguments[_i];
            }
            return subscriber.next(e.length === 1 ? e[0] : e);
        };
        var retValue;
        try {
            retValue = addHandler(handler);
        }
        catch (err) {
            subscriber.error(err);
            return undefined;
        }
        if (!isFunction(removeHandler)) {
            return undefined;
        }
        return function () { return removeHandler(handler, retValue); };
    });
}

/** PURE_IMPORTS_START _Observable,_util_identity,_util_isScheduler PURE_IMPORTS_END */
function generate(initialStateOrOptions, condition, iterate, resultSelectorOrObservable, scheduler) {
    var resultSelector;
    var initialState;
    if (arguments.length == 1) {
        var options = initialStateOrOptions;
        initialState = options.initialState;
        condition = options.condition;
        iterate = options.iterate;
        resultSelector = options.resultSelector || identity;
        scheduler = options.scheduler;
    }
    else if (resultSelectorOrObservable === undefined || isScheduler(resultSelectorOrObservable)) {
        initialState = initialStateOrOptions;
        resultSelector = identity;
        scheduler = resultSelectorOrObservable;
    }
    else {
        initialState = initialStateOrOptions;
        resultSelector = resultSelectorOrObservable;
    }
    return new Observable(function (subscriber) {
        var state = initialState;
        if (scheduler) {
            return scheduler.schedule(dispatch$4, 0, {
                subscriber: subscriber,
                iterate: iterate,
                condition: condition,
                resultSelector: resultSelector,
                state: state
            });
        }
        do {
            if (condition) {
                var conditionResult = void 0;
                try {
                    conditionResult = condition(state);
                }
                catch (err) {
                    subscriber.error(err);
                    return undefined;
                }
                if (!conditionResult) {
                    subscriber.complete();
                    break;
                }
            }
            var value = void 0;
            try {
                value = resultSelector(state);
            }
            catch (err) {
                subscriber.error(err);
                return undefined;
            }
            subscriber.next(value);
            if (subscriber.closed) {
                break;
            }
            try {
                state = iterate(state);
            }
            catch (err) {
                subscriber.error(err);
                return undefined;
            }
        } while (true);
        return undefined;
    });
}
function dispatch$4(state) {
    var subscriber = state.subscriber, condition = state.condition;
    if (subscriber.closed) {
        return undefined;
    }
    if (state.needIterate) {
        try {
            state.state = state.iterate(state.state);
        }
        catch (err) {
            subscriber.error(err);
            return undefined;
        }
    }
    else {
        state.needIterate = true;
    }
    if (condition) {
        var conditionResult = void 0;
        try {
            conditionResult = condition(state.state);
        }
        catch (err) {
            subscriber.error(err);
            return undefined;
        }
        if (!conditionResult) {
            subscriber.complete();
            return undefined;
        }
        if (subscriber.closed) {
            return undefined;
        }
    }
    var value;
    try {
        value = state.resultSelector(state.state);
    }
    catch (err) {
        subscriber.error(err);
        return undefined;
    }
    if (subscriber.closed) {
        return undefined;
    }
    subscriber.next(value);
    if (subscriber.closed) {
        return undefined;
    }
    return this.schedule(state);
}

/** PURE_IMPORTS_START _defer,_empty PURE_IMPORTS_END */
function iif(condition, trueResult, falseResult) {
    if (trueResult === void 0) {
        trueResult = EMPTY;
    }
    if (falseResult === void 0) {
        falseResult = EMPTY;
    }
    return defer(function () { return condition() ? trueResult : falseResult; });
}

/** PURE_IMPORTS_START _isArray PURE_IMPORTS_END */
function isNumeric(val) {
    return !isArray(val) && (val - parseFloat(val) + 1) >= 0;
}

/** PURE_IMPORTS_START _Observable,_scheduler_async,_util_isNumeric PURE_IMPORTS_END */
function interval(period, scheduler) {
    if (period === void 0) {
        period = 0;
    }
    if (scheduler === void 0) {
        scheduler = async;
    }
    if (!isNumeric(period) || period < 0) {
        period = 0;
    }
    if (!scheduler || typeof scheduler.schedule !== 'function') {
        scheduler = async;
    }
    return new Observable(function (subscriber) {
        subscriber.add(scheduler.schedule(dispatch$3, period, { subscriber: subscriber, counter: 0, period: period }));
        return subscriber;
    });
}
function dispatch$3(state) {
    var subscriber = state.subscriber, counter = state.counter, period = state.period;
    subscriber.next(counter);
    this.schedule({ subscriber: subscriber, counter: counter + 1, period: period }, period);
}

/** PURE_IMPORTS_START _Observable,_util_isScheduler,_operators_mergeAll,_fromArray PURE_IMPORTS_END */
function merge() {
    var observables = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        observables[_i] = arguments[_i];
    }
    var concurrent = Number.POSITIVE_INFINITY;
    var scheduler = null;
    var last = observables[observables.length - 1];
    if (isScheduler(last)) {
        scheduler = observables.pop();
        if (observables.length > 1 && typeof observables[observables.length - 1] === 'number') {
            concurrent = observables.pop();
        }
    }
    else if (typeof last === 'number') {
        concurrent = observables.pop();
    }
    if (scheduler === null && observables.length === 1 && observables[0] instanceof Observable) {
        return observables[0];
    }
    return mergeAll(concurrent)(fromArray(observables, scheduler));
}

/** PURE_IMPORTS_START _Observable,_util_noop PURE_IMPORTS_END */
var NEVER = /*@__PURE__*/ new Observable(noop$1);
function never() {
    return NEVER;
}

/** PURE_IMPORTS_START _Observable,_from,_util_isArray,_empty PURE_IMPORTS_END */
function onErrorResumeNext() {
    var sources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sources[_i] = arguments[_i];
    }
    if (sources.length === 0) {
        return EMPTY;
    }
    var first = sources[0], remainder = sources.slice(1);
    if (sources.length === 1 && isArray(first)) {
        return onErrorResumeNext.apply(void 0, first);
    }
    return new Observable(function (subscriber) {
        var subNext = function () { return subscriber.add(onErrorResumeNext.apply(void 0, remainder).subscribe(subscriber)); };
        return from(first).subscribe({
            next: function (value) { subscriber.next(value); },
            error: subNext,
            complete: subNext,
        });
    });
}

/** PURE_IMPORTS_START _Observable,_Subscription PURE_IMPORTS_END */
function pairs(obj, scheduler) {
    if (!scheduler) {
        return new Observable(function (subscriber) {
            var keys = Object.keys(obj);
            for (var i = 0; i < keys.length && !subscriber.closed; i++) {
                var key = keys[i];
                if (obj.hasOwnProperty(key)) {
                    subscriber.next([key, obj[key]]);
                }
            }
            subscriber.complete();
        });
    }
    else {
        return new Observable(function (subscriber) {
            var keys = Object.keys(obj);
            var subscription = new Subscription();
            subscription.add(scheduler.schedule(dispatch$2, 0, { keys: keys, index: 0, subscriber: subscriber, subscription: subscription, obj: obj }));
            return subscription;
        });
    }
}
function dispatch$2(state) {
    var keys = state.keys, index = state.index, subscriber = state.subscriber, subscription = state.subscription, obj = state.obj;
    if (!subscriber.closed) {
        if (index < keys.length) {
            var key = keys[index];
            subscriber.next([key, obj[key]]);
            subscription.add(this.schedule({ keys: keys, index: index + 1, subscriber: subscriber, subscription: subscription, obj: obj }));
        }
        else {
            subscriber.complete();
        }
    }
}

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function not$1(pred, thisArg) {
    function notPred() {
        return !(notPred.pred.apply(notPred.thisArg, arguments));
    }
    notPred.pred = pred;
    notPred.thisArg = thisArg;
    return notPred;
}

/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
function filter(predicate, thisArg) {
    return function filterOperatorFunction(source) {
        return source.lift(new FilterOperator(predicate, thisArg));
    };
}
var FilterOperator = /*@__PURE__*/ (function () {
    function FilterOperator(predicate, thisArg) {
        this.predicate = predicate;
        this.thisArg = thisArg;
    }
    FilterOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new FilterSubscriber(subscriber, this.predicate, this.thisArg));
    };
    return FilterOperator;
}());
var FilterSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(FilterSubscriber, _super);
    function FilterSubscriber(destination, predicate, thisArg) {
        var _this = _super.call(this, destination) || this;
        _this.predicate = predicate;
        _this.thisArg = thisArg;
        _this.count = 0;
        return _this;
    }
    FilterSubscriber.prototype._next = function (value) {
        var result;
        try {
            result = this.predicate.call(this.thisArg, value, this.count++);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        if (result) {
            this.destination.next(value);
        }
    };
    return FilterSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START _util_not,_util_subscribeTo,_operators_filter,_Observable PURE_IMPORTS_END */
function partition(source, predicate, thisArg) {
    return [
        filter(predicate, thisArg)(new Observable(subscribeTo(source))),
        filter(not$1(predicate, thisArg))(new Observable(subscribeTo(source)))
    ];
}

/** PURE_IMPORTS_START tslib,_util_isArray,_fromArray,_OuterSubscriber,_util_subscribeToResult PURE_IMPORTS_END */
function race() {
    var observables = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        observables[_i] = arguments[_i];
    }
    if (observables.length === 1) {
        if (isArray(observables[0])) {
            observables = observables[0];
        }
        else {
            return observables[0];
        }
    }
    return fromArray(observables, undefined).lift(new RaceOperator());
}
var RaceOperator = /*@__PURE__*/ (function () {
    function RaceOperator() {
    }
    RaceOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new RaceSubscriber(subscriber));
    };
    return RaceOperator;
}());
var RaceSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(RaceSubscriber, _super);
    function RaceSubscriber(destination) {
        var _this = _super.call(this, destination) || this;
        _this.hasFirst = false;
        _this.observables = [];
        _this.subscriptions = [];
        return _this;
    }
    RaceSubscriber.prototype._next = function (observable) {
        this.observables.push(observable);
    };
    RaceSubscriber.prototype._complete = function () {
        var observables = this.observables;
        var len = observables.length;
        if (len === 0) {
            this.destination.complete();
        }
        else {
            for (var i = 0; i < len && !this.hasFirst; i++) {
                var observable = observables[i];
                var subscription = subscribeToResult(this, observable, undefined, i);
                if (this.subscriptions) {
                    this.subscriptions.push(subscription);
                }
                this.add(subscription);
            }
            this.observables = null;
        }
    };
    RaceSubscriber.prototype.notifyNext = function (_outerValue, innerValue, outerIndex) {
        if (!this.hasFirst) {
            this.hasFirst = true;
            for (var i = 0; i < this.subscriptions.length; i++) {
                if (i !== outerIndex) {
                    var subscription = this.subscriptions[i];
                    subscription.unsubscribe();
                    this.remove(subscription);
                }
            }
            this.subscriptions = null;
        }
        this.destination.next(innerValue);
    };
    return RaceSubscriber;
}(OuterSubscriber));

/** PURE_IMPORTS_START _Observable PURE_IMPORTS_END */
function range(start, count, scheduler) {
    if (start === void 0) {
        start = 0;
    }
    return new Observable(function (subscriber) {
        if (count === undefined) {
            count = start;
            start = 0;
        }
        var index = 0;
        var current = start;
        if (scheduler) {
            return scheduler.schedule(dispatch$1, 0, {
                index: index, count: count, start: start, subscriber: subscriber
            });
        }
        else {
            do {
                if (index++ >= count) {
                    subscriber.complete();
                    break;
                }
                subscriber.next(current++);
                if (subscriber.closed) {
                    break;
                }
            } while (true);
        }
        return undefined;
    });
}
function dispatch$1(state) {
    var start = state.start, index = state.index, count = state.count, subscriber = state.subscriber;
    if (index >= count) {
        subscriber.complete();
        return;
    }
    subscriber.next(start);
    if (subscriber.closed) {
        return;
    }
    state.index = index + 1;
    state.start = start + 1;
    this.schedule(state);
}

/** PURE_IMPORTS_START _Observable,_scheduler_async,_util_isNumeric,_util_isScheduler PURE_IMPORTS_END */
function timer(dueTime, periodOrScheduler, scheduler) {
    if (dueTime === void 0) {
        dueTime = 0;
    }
    var period = -1;
    if (isNumeric(periodOrScheduler)) {
        period = Number(periodOrScheduler) < 1 && 1 || Number(periodOrScheduler);
    }
    else if (isScheduler(periodOrScheduler)) {
        scheduler = periodOrScheduler;
    }
    if (!isScheduler(scheduler)) {
        scheduler = async;
    }
    return new Observable(function (subscriber) {
        var due = isNumeric(dueTime)
            ? dueTime
            : (+dueTime - scheduler.now());
        return scheduler.schedule(dispatch, due, {
            index: 0, period: period, subscriber: subscriber
        });
    });
}
function dispatch(state) {
    var index = state.index, period = state.period, subscriber = state.subscriber;
    subscriber.next(index);
    if (subscriber.closed) {
        return;
    }
    else if (period === -1) {
        return subscriber.complete();
    }
    state.index = index + 1;
    this.schedule(state, period);
}

/** PURE_IMPORTS_START _Observable,_from,_empty PURE_IMPORTS_END */
function using(resourceFactory, observableFactory) {
    return new Observable(function (subscriber) {
        var resource;
        try {
            resource = resourceFactory();
        }
        catch (err) {
            subscriber.error(err);
            return undefined;
        }
        var result;
        try {
            result = observableFactory(resource);
        }
        catch (err) {
            subscriber.error(err);
            return undefined;
        }
        var source = result ? from(result) : EMPTY;
        var subscription = source.subscribe(subscriber);
        return function () {
            subscription.unsubscribe();
            if (resource) {
                resource.unsubscribe();
            }
        };
    });
}

/** PURE_IMPORTS_START tslib,_fromArray,_util_isArray,_Subscriber,_.._internal_symbol_iterator,_innerSubscribe PURE_IMPORTS_END */
function zip() {
    var observables = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        observables[_i] = arguments[_i];
    }
    var resultSelector = observables[observables.length - 1];
    if (typeof resultSelector === 'function') {
        observables.pop();
    }
    return fromArray(observables, undefined).lift(new ZipOperator(resultSelector));
}
var ZipOperator = /*@__PURE__*/ (function () {
    function ZipOperator(resultSelector) {
        this.resultSelector = resultSelector;
    }
    ZipOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new ZipSubscriber(subscriber, this.resultSelector));
    };
    return ZipOperator;
}());
var ZipSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(ZipSubscriber, _super);
    function ZipSubscriber(destination, resultSelector, values) {
        var _this = _super.call(this, destination) || this;
        _this.resultSelector = resultSelector;
        _this.iterators = [];
        _this.active = 0;
        _this.resultSelector = (typeof resultSelector === 'function') ? resultSelector : undefined;
        return _this;
    }
    ZipSubscriber.prototype._next = function (value) {
        var iterators = this.iterators;
        if (isArray(value)) {
            iterators.push(new StaticArrayIterator(value));
        }
        else if (typeof value[iterator] === 'function') {
            iterators.push(new StaticIterator(value[iterator]()));
        }
        else {
            iterators.push(new ZipBufferIterator(this.destination, this, value));
        }
    };
    ZipSubscriber.prototype._complete = function () {
        var iterators = this.iterators;
        var len = iterators.length;
        this.unsubscribe();
        if (len === 0) {
            this.destination.complete();
            return;
        }
        this.active = len;
        for (var i = 0; i < len; i++) {
            var iterator = iterators[i];
            if (iterator.stillUnsubscribed) {
                var destination = this.destination;
                destination.add(iterator.subscribe());
            }
            else {
                this.active--;
            }
        }
    };
    ZipSubscriber.prototype.notifyInactive = function () {
        this.active--;
        if (this.active === 0) {
            this.destination.complete();
        }
    };
    ZipSubscriber.prototype.checkIterators = function () {
        var iterators = this.iterators;
        var len = iterators.length;
        var destination = this.destination;
        for (var i = 0; i < len; i++) {
            var iterator = iterators[i];
            if (typeof iterator.hasValue === 'function' && !iterator.hasValue()) {
                return;
            }
        }
        var shouldComplete = false;
        var args = [];
        for (var i = 0; i < len; i++) {
            var iterator = iterators[i];
            var result = iterator.next();
            if (iterator.hasCompleted()) {
                shouldComplete = true;
            }
            if (result.done) {
                destination.complete();
                return;
            }
            args.push(result.value);
        }
        if (this.resultSelector) {
            this._tryresultSelector(args);
        }
        else {
            destination.next(args);
        }
        if (shouldComplete) {
            destination.complete();
        }
    };
    ZipSubscriber.prototype._tryresultSelector = function (args) {
        var result;
        try {
            result = this.resultSelector.apply(this, args);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.destination.next(result);
    };
    return ZipSubscriber;
}(Subscriber));
var StaticIterator = /*@__PURE__*/ (function () {
    function StaticIterator(iterator) {
        this.iterator = iterator;
        this.nextResult = iterator.next();
    }
    StaticIterator.prototype.hasValue = function () {
        return true;
    };
    StaticIterator.prototype.next = function () {
        var result = this.nextResult;
        this.nextResult = this.iterator.next();
        return result;
    };
    StaticIterator.prototype.hasCompleted = function () {
        var nextResult = this.nextResult;
        return Boolean(nextResult && nextResult.done);
    };
    return StaticIterator;
}());
var StaticArrayIterator = /*@__PURE__*/ (function () {
    function StaticArrayIterator(array) {
        this.array = array;
        this.index = 0;
        this.length = 0;
        this.length = array.length;
    }
    StaticArrayIterator.prototype[iterator] = function () {
        return this;
    };
    StaticArrayIterator.prototype.next = function (value) {
        var i = this.index++;
        var array = this.array;
        return i < this.length ? { value: array[i], done: false } : { value: null, done: true };
    };
    StaticArrayIterator.prototype.hasValue = function () {
        return this.array.length > this.index;
    };
    StaticArrayIterator.prototype.hasCompleted = function () {
        return this.array.length === this.index;
    };
    return StaticArrayIterator;
}());
var ZipBufferIterator = /*@__PURE__*/ (function (_super) {
    __extends(ZipBufferIterator, _super);
    function ZipBufferIterator(destination, parent, observable) {
        var _this = _super.call(this, destination) || this;
        _this.parent = parent;
        _this.observable = observable;
        _this.stillUnsubscribed = true;
        _this.buffer = [];
        _this.isComplete = false;
        return _this;
    }
    ZipBufferIterator.prototype[iterator] = function () {
        return this;
    };
    ZipBufferIterator.prototype.next = function () {
        var buffer = this.buffer;
        if (buffer.length === 0 && this.isComplete) {
            return { value: null, done: true };
        }
        else {
            return { value: buffer.shift(), done: false };
        }
    };
    ZipBufferIterator.prototype.hasValue = function () {
        return this.buffer.length > 0;
    };
    ZipBufferIterator.prototype.hasCompleted = function () {
        return this.buffer.length === 0 && this.isComplete;
    };
    ZipBufferIterator.prototype.notifyComplete = function () {
        if (this.buffer.length > 0) {
            this.isComplete = true;
            this.parent.notifyInactive();
        }
        else {
            this.destination.complete();
        }
    };
    ZipBufferIterator.prototype.notifyNext = function (innerValue) {
        this.buffer.push(innerValue);
        this.parent.checkIterators();
    };
    ZipBufferIterator.prototype.subscribe = function () {
        return innerSubscribe(this.observable, new SimpleInnerSubscriber(this));
    };
    return ZipBufferIterator;
}(SimpleOuterSubscriber));

/** PURE_IMPORTS_START  PURE_IMPORTS_END */

var _esm5 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Observable: Observable,
	ConnectableObservable: ConnectableObservable,
	GroupedObservable: GroupedObservable,
	observable: observable,
	Subject: Subject,
	BehaviorSubject: BehaviorSubject,
	ReplaySubject: ReplaySubject,
	AsyncSubject: AsyncSubject,
	asap: asap,
	asapScheduler: asapScheduler,
	async: async,
	asyncScheduler: asyncScheduler,
	queue: queue$1,
	queueScheduler: queueScheduler,
	animationFrame: animationFrame,
	animationFrameScheduler: animationFrameScheduler,
	VirtualTimeScheduler: VirtualTimeScheduler,
	VirtualAction: VirtualAction,
	Scheduler: Scheduler,
	Subscription: Subscription,
	Subscriber: Subscriber,
	Notification: Notification,
	get NotificationKind () { return NotificationKind; },
	pipe: pipe,
	noop: noop$1,
	identity: identity,
	isObservable: isObservable,
	ArgumentOutOfRangeError: ArgumentOutOfRangeError,
	EmptyError: EmptyError,
	ObjectUnsubscribedError: ObjectUnsubscribedError,
	UnsubscriptionError: UnsubscriptionError,
	TimeoutError: TimeoutError,
	bindCallback: bindCallback,
	bindNodeCallback: bindNodeCallback,
	combineLatest: combineLatest,
	concat: concat,
	defer: defer,
	empty: empty$1,
	forkJoin: forkJoin,
	from: from,
	fromEvent: fromEvent,
	fromEventPattern: fromEventPattern,
	generate: generate,
	iif: iif,
	interval: interval,
	merge: merge,
	never: never,
	of: of,
	onErrorResumeNext: onErrorResumeNext,
	pairs: pairs,
	partition: partition,
	race: race,
	range: range,
	throwError: throwError,
	timer: timer,
	using: using,
	zip: zip,
	scheduled: scheduled,
	EMPTY: EMPTY,
	NEVER: NEVER,
	config: config
});

var require$$1 = /*@__PURE__*/getAugmentedNamespace(_esm5);

var state_constants = {};

(function (exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListrTaskState = void 0;
(function (ListrTaskState) {
    ListrTaskState["PENDING"] = "PENDING";
    ListrTaskState["COMPLETED"] = "COMPLETED";
    ListrTaskState["FAILED"] = "FAILED";
    ListrTaskState["SKIPPED"] = "SKIPPED";
    ListrTaskState["ROLLING_BACK"] = "ROLLING_BACK";
    ListrTaskState["ROLLED_BACK"] = "ROLLED_BACK";
    ListrTaskState["RETRY"] = "RETRY";
})(exports.ListrTaskState || (exports.ListrTaskState = {}));
}(state_constants));

var task = {};

var event_constants = {};

(function (exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListrEventType = void 0;
(function (ListrEventType) {
    ListrEventType["TITLE"] = "TITLE";
    ListrEventType["STATE"] = "STATE";
    ListrEventType["ENABLED"] = "ENABLED";
    ListrEventType["SUBTASK"] = "SUBTASK";
    ListrEventType["DATA"] = "DATA";
    ListrEventType["MESSAGE"] = "MESSAGE";
})(exports.ListrEventType || (exports.ListrEventType = {}));
}(event_constants));

var listrError_interface = {};

(function (exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptError = exports.ListrErrorTypes = exports.ListrError = void 0;
/** The internal error handling mechanism.. */
class ListrError extends Error {
    constructor(error, type, ctx, task) {
        super(error.message);
        this.error = error;
        this.type = type;
        this.ctx = ctx;
        this.task = task;
        this.stack = error === null || error === void 0 ? void 0 : error.stack;
        this.name = 'ListrError';
    }
}
exports.ListrError = ListrError;
(function (ListrErrorTypes) {
    /** Task has failed and will try to retry. */
    ListrErrorTypes["WILL_RETRY"] = "WILL_RETRY";
    /** Task has failed and will try to rollback. */
    ListrErrorTypes["WILL_ROLLBACK"] = "WILL_ROLLBACK";
    /** Task has failed, ran the rollback action but the rollback action itself has failed. */
    ListrErrorTypes["HAS_FAILED_TO_ROLLBACK"] = "HAS_FAILED_TO_ROLLBACK";
    /** Task has failed. */
    ListrErrorTypes["HAS_FAILED"] = "HAS_FAILED";
    /** Task has failed, but exitOnError is set to false, so will ignore this error. */
    ListrErrorTypes["HAS_FAILED_WITHOUT_ERROR"] = "HAS_FAILED_WITHOUT_ERROR";
})(exports.ListrErrorTypes || (exports.ListrErrorTypes = {}));
/** The internal error handling mechanism for prompts only. */
class PromptError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PromptError';
    }
}
exports.PromptError = PromptError;
}(listrError_interface));

var assert$2 = {};

Object.defineProperty(assert$2, "__esModule", { value: true });
assert$2.assertFunctionOrSelf = void 0;
/**
 * This function asserts the given value as a function or itself.
 * If the value itself is a function it will evaluate it with the passed in arguments,
 * elsewise it will directly return itself.
 */
function assertFunctionOrSelf(functionOrSelf, ...args) {
    if (typeof functionOrSelf === 'function') {
        return functionOrSelf(...args);
    }
    else {
        return functionOrSelf;
    }
}
assert$2.assertFunctionOrSelf = assertFunctionOrSelf;

var renderer = {};

var default_renderer = {};

var isFullwidthCodePoint$4 = {exports: {}};

/* eslint-disable yoda */

const isFullwidthCodePoint$3 = codePoint => {
	if (Number.isNaN(codePoint)) {
		return false;
	}

	// Code points are derived from:
	// http://www.unix.org/Public/UNIDATA/EastAsianWidth.txt
	if (
		codePoint >= 0x1100 && (
			codePoint <= 0x115F || // Hangul Jamo
			codePoint === 0x2329 || // LEFT-POINTING ANGLE BRACKET
			codePoint === 0x232A || // RIGHT-POINTING ANGLE BRACKET
			// CJK Radicals Supplement .. Enclosed CJK Letters and Months
			(0x2E80 <= codePoint && codePoint <= 0x3247 && codePoint !== 0x303F) ||
			// Enclosed CJK Letters and Months .. CJK Unified Ideographs Extension A
			(0x3250 <= codePoint && codePoint <= 0x4DBF) ||
			// CJK Unified Ideographs .. Yi Radicals
			(0x4E00 <= codePoint && codePoint <= 0xA4C6) ||
			// Hangul Jamo Extended-A
			(0xA960 <= codePoint && codePoint <= 0xA97C) ||
			// Hangul Syllables
			(0xAC00 <= codePoint && codePoint <= 0xD7A3) ||
			// CJK Compatibility Ideographs
			(0xF900 <= codePoint && codePoint <= 0xFAFF) ||
			// Vertical Forms
			(0xFE10 <= codePoint && codePoint <= 0xFE19) ||
			// CJK Compatibility Forms .. Small Form Variants
			(0xFE30 <= codePoint && codePoint <= 0xFE6B) ||
			// Halfwidth and Fullwidth Forms
			(0xFF01 <= codePoint && codePoint <= 0xFF60) ||
			(0xFFE0 <= codePoint && codePoint <= 0xFFE6) ||
			// Kana Supplement
			(0x1B000 <= codePoint && codePoint <= 0x1B001) ||
			// Enclosed Ideographic Supplement
			(0x1F200 <= codePoint && codePoint <= 0x1F251) ||
			// CJK Unified Ideographs Extension B .. Tertiary Ideographic Plane
			(0x20000 <= codePoint && codePoint <= 0x3FFFD)
		)
	) {
		return true;
	}

	return false;
};

isFullwidthCodePoint$4.exports = isFullwidthCodePoint$3;
isFullwidthCodePoint$4.exports.default = isFullwidthCodePoint$3;

const regex = '[\uD800-\uDBFF][\uDC00-\uDFFF]';

const astralRegex$2 = options => options && options.exact ? new RegExp(`^${regex}$`) : new RegExp(regex, 'g');

var astralRegex_1 = astralRegex$2;

var ansiStyles$4 = {exports: {}};

var colorName = {
	"aliceblue": [240, 248, 255],
	"antiquewhite": [250, 235, 215],
	"aqua": [0, 255, 255],
	"aquamarine": [127, 255, 212],
	"azure": [240, 255, 255],
	"beige": [245, 245, 220],
	"bisque": [255, 228, 196],
	"black": [0, 0, 0],
	"blanchedalmond": [255, 235, 205],
	"blue": [0, 0, 255],
	"blueviolet": [138, 43, 226],
	"brown": [165, 42, 42],
	"burlywood": [222, 184, 135],
	"cadetblue": [95, 158, 160],
	"chartreuse": [127, 255, 0],
	"chocolate": [210, 105, 30],
	"coral": [255, 127, 80],
	"cornflowerblue": [100, 149, 237],
	"cornsilk": [255, 248, 220],
	"crimson": [220, 20, 60],
	"cyan": [0, 255, 255],
	"darkblue": [0, 0, 139],
	"darkcyan": [0, 139, 139],
	"darkgoldenrod": [184, 134, 11],
	"darkgray": [169, 169, 169],
	"darkgreen": [0, 100, 0],
	"darkgrey": [169, 169, 169],
	"darkkhaki": [189, 183, 107],
	"darkmagenta": [139, 0, 139],
	"darkolivegreen": [85, 107, 47],
	"darkorange": [255, 140, 0],
	"darkorchid": [153, 50, 204],
	"darkred": [139, 0, 0],
	"darksalmon": [233, 150, 122],
	"darkseagreen": [143, 188, 143],
	"darkslateblue": [72, 61, 139],
	"darkslategray": [47, 79, 79],
	"darkslategrey": [47, 79, 79],
	"darkturquoise": [0, 206, 209],
	"darkviolet": [148, 0, 211],
	"deeppink": [255, 20, 147],
	"deepskyblue": [0, 191, 255],
	"dimgray": [105, 105, 105],
	"dimgrey": [105, 105, 105],
	"dodgerblue": [30, 144, 255],
	"firebrick": [178, 34, 34],
	"floralwhite": [255, 250, 240],
	"forestgreen": [34, 139, 34],
	"fuchsia": [255, 0, 255],
	"gainsboro": [220, 220, 220],
	"ghostwhite": [248, 248, 255],
	"gold": [255, 215, 0],
	"goldenrod": [218, 165, 32],
	"gray": [128, 128, 128],
	"green": [0, 128, 0],
	"greenyellow": [173, 255, 47],
	"grey": [128, 128, 128],
	"honeydew": [240, 255, 240],
	"hotpink": [255, 105, 180],
	"indianred": [205, 92, 92],
	"indigo": [75, 0, 130],
	"ivory": [255, 255, 240],
	"khaki": [240, 230, 140],
	"lavender": [230, 230, 250],
	"lavenderblush": [255, 240, 245],
	"lawngreen": [124, 252, 0],
	"lemonchiffon": [255, 250, 205],
	"lightblue": [173, 216, 230],
	"lightcoral": [240, 128, 128],
	"lightcyan": [224, 255, 255],
	"lightgoldenrodyellow": [250, 250, 210],
	"lightgray": [211, 211, 211],
	"lightgreen": [144, 238, 144],
	"lightgrey": [211, 211, 211],
	"lightpink": [255, 182, 193],
	"lightsalmon": [255, 160, 122],
	"lightseagreen": [32, 178, 170],
	"lightskyblue": [135, 206, 250],
	"lightslategray": [119, 136, 153],
	"lightslategrey": [119, 136, 153],
	"lightsteelblue": [176, 196, 222],
	"lightyellow": [255, 255, 224],
	"lime": [0, 255, 0],
	"limegreen": [50, 205, 50],
	"linen": [250, 240, 230],
	"magenta": [255, 0, 255],
	"maroon": [128, 0, 0],
	"mediumaquamarine": [102, 205, 170],
	"mediumblue": [0, 0, 205],
	"mediumorchid": [186, 85, 211],
	"mediumpurple": [147, 112, 219],
	"mediumseagreen": [60, 179, 113],
	"mediumslateblue": [123, 104, 238],
	"mediumspringgreen": [0, 250, 154],
	"mediumturquoise": [72, 209, 204],
	"mediumvioletred": [199, 21, 133],
	"midnightblue": [25, 25, 112],
	"mintcream": [245, 255, 250],
	"mistyrose": [255, 228, 225],
	"moccasin": [255, 228, 181],
	"navajowhite": [255, 222, 173],
	"navy": [0, 0, 128],
	"oldlace": [253, 245, 230],
	"olive": [128, 128, 0],
	"olivedrab": [107, 142, 35],
	"orange": [255, 165, 0],
	"orangered": [255, 69, 0],
	"orchid": [218, 112, 214],
	"palegoldenrod": [238, 232, 170],
	"palegreen": [152, 251, 152],
	"paleturquoise": [175, 238, 238],
	"palevioletred": [219, 112, 147],
	"papayawhip": [255, 239, 213],
	"peachpuff": [255, 218, 185],
	"peru": [205, 133, 63],
	"pink": [255, 192, 203],
	"plum": [221, 160, 221],
	"powderblue": [176, 224, 230],
	"purple": [128, 0, 128],
	"rebeccapurple": [102, 51, 153],
	"red": [255, 0, 0],
	"rosybrown": [188, 143, 143],
	"royalblue": [65, 105, 225],
	"saddlebrown": [139, 69, 19],
	"salmon": [250, 128, 114],
	"sandybrown": [244, 164, 96],
	"seagreen": [46, 139, 87],
	"seashell": [255, 245, 238],
	"sienna": [160, 82, 45],
	"silver": [192, 192, 192],
	"skyblue": [135, 206, 235],
	"slateblue": [106, 90, 205],
	"slategray": [112, 128, 144],
	"slategrey": [112, 128, 144],
	"snow": [255, 250, 250],
	"springgreen": [0, 255, 127],
	"steelblue": [70, 130, 180],
	"tan": [210, 180, 140],
	"teal": [0, 128, 128],
	"thistle": [216, 191, 216],
	"tomato": [255, 99, 71],
	"turquoise": [64, 224, 208],
	"violet": [238, 130, 238],
	"wheat": [245, 222, 179],
	"white": [255, 255, 255],
	"whitesmoke": [245, 245, 245],
	"yellow": [255, 255, 0],
	"yellowgreen": [154, 205, 50]
};

/* MIT license */

/* eslint-disable no-mixed-operators */
const cssKeywords = colorName;

// NOTE: conversions should only return primitive values (i.e. arrays, or
//       values that give correct `typeof` results).
//       do not use box values types (i.e. Number(), String(), etc.)

const reverseKeywords = {};
for (const key of Object.keys(cssKeywords)) {
	reverseKeywords[cssKeywords[key]] = key;
}

const convert$1 = {
	rgb: {channels: 3, labels: 'rgb'},
	hsl: {channels: 3, labels: 'hsl'},
	hsv: {channels: 3, labels: 'hsv'},
	hwb: {channels: 3, labels: 'hwb'},
	cmyk: {channels: 4, labels: 'cmyk'},
	xyz: {channels: 3, labels: 'xyz'},
	lab: {channels: 3, labels: 'lab'},
	lch: {channels: 3, labels: 'lch'},
	hex: {channels: 1, labels: ['hex']},
	keyword: {channels: 1, labels: ['keyword']},
	ansi16: {channels: 1, labels: ['ansi16']},
	ansi256: {channels: 1, labels: ['ansi256']},
	hcg: {channels: 3, labels: ['h', 'c', 'g']},
	apple: {channels: 3, labels: ['r16', 'g16', 'b16']},
	gray: {channels: 1, labels: ['gray']}
};

var conversions$2 = convert$1;

// Hide .channels and .labels properties
for (const model of Object.keys(convert$1)) {
	if (!('channels' in convert$1[model])) {
		throw new Error('missing channels property: ' + model);
	}

	if (!('labels' in convert$1[model])) {
		throw new Error('missing channel labels property: ' + model);
	}

	if (convert$1[model].labels.length !== convert$1[model].channels) {
		throw new Error('channel and label counts mismatch: ' + model);
	}

	const {channels, labels} = convert$1[model];
	delete convert$1[model].channels;
	delete convert$1[model].labels;
	Object.defineProperty(convert$1[model], 'channels', {value: channels});
	Object.defineProperty(convert$1[model], 'labels', {value: labels});
}

convert$1.rgb.hsl = function (rgb) {
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const min = Math.min(r, g, b);
	const max = Math.max(r, g, b);
	const delta = max - min;
	let h;
	let s;

	if (max === min) {
		h = 0;
	} else if (r === max) {
		h = (g - b) / delta;
	} else if (g === max) {
		h = 2 + (b - r) / delta;
	} else if (b === max) {
		h = 4 + (r - g) / delta;
	}

	h = Math.min(h * 60, 360);

	if (h < 0) {
		h += 360;
	}

	const l = (min + max) / 2;

	if (max === min) {
		s = 0;
	} else if (l <= 0.5) {
		s = delta / (max + min);
	} else {
		s = delta / (2 - max - min);
	}

	return [h, s * 100, l * 100];
};

convert$1.rgb.hsv = function (rgb) {
	let rdif;
	let gdif;
	let bdif;
	let h;
	let s;

	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const v = Math.max(r, g, b);
	const diff = v - Math.min(r, g, b);
	const diffc = function (c) {
		return (v - c) / 6 / diff + 1 / 2;
	};

	if (diff === 0) {
		h = 0;
		s = 0;
	} else {
		s = diff / v;
		rdif = diffc(r);
		gdif = diffc(g);
		bdif = diffc(b);

		if (r === v) {
			h = bdif - gdif;
		} else if (g === v) {
			h = (1 / 3) + rdif - bdif;
		} else if (b === v) {
			h = (2 / 3) + gdif - rdif;
		}

		if (h < 0) {
			h += 1;
		} else if (h > 1) {
			h -= 1;
		}
	}

	return [
		h * 360,
		s * 100,
		v * 100
	];
};

convert$1.rgb.hwb = function (rgb) {
	const r = rgb[0];
	const g = rgb[1];
	let b = rgb[2];
	const h = convert$1.rgb.hsl(rgb)[0];
	const w = 1 / 255 * Math.min(r, Math.min(g, b));

	b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));

	return [h, w * 100, b * 100];
};

convert$1.rgb.cmyk = function (rgb) {
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;

	const k = Math.min(1 - r, 1 - g, 1 - b);
	const c = (1 - r - k) / (1 - k) || 0;
	const m = (1 - g - k) / (1 - k) || 0;
	const y = (1 - b - k) / (1 - k) || 0;

	return [c * 100, m * 100, y * 100, k * 100];
};

function comparativeDistance(x, y) {
	/*
		See https://en.m.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance
	*/
	return (
		((x[0] - y[0]) ** 2) +
		((x[1] - y[1]) ** 2) +
		((x[2] - y[2]) ** 2)
	);
}

convert$1.rgb.keyword = function (rgb) {
	const reversed = reverseKeywords[rgb];
	if (reversed) {
		return reversed;
	}

	let currentClosestDistance = Infinity;
	let currentClosestKeyword;

	for (const keyword of Object.keys(cssKeywords)) {
		const value = cssKeywords[keyword];

		// Compute comparative distance
		const distance = comparativeDistance(rgb, value);

		// Check if its less, if so set as closest
		if (distance < currentClosestDistance) {
			currentClosestDistance = distance;
			currentClosestKeyword = keyword;
		}
	}

	return currentClosestKeyword;
};

convert$1.keyword.rgb = function (keyword) {
	return cssKeywords[keyword];
};

convert$1.rgb.xyz = function (rgb) {
	let r = rgb[0] / 255;
	let g = rgb[1] / 255;
	let b = rgb[2] / 255;

	// Assume sRGB
	r = r > 0.04045 ? (((r + 0.055) / 1.055) ** 2.4) : (r / 12.92);
	g = g > 0.04045 ? (((g + 0.055) / 1.055) ** 2.4) : (g / 12.92);
	b = b > 0.04045 ? (((b + 0.055) / 1.055) ** 2.4) : (b / 12.92);

	const x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
	const y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
	const z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

	return [x * 100, y * 100, z * 100];
};

convert$1.rgb.lab = function (rgb) {
	const xyz = convert$1.rgb.xyz(rgb);
	let x = xyz[0];
	let y = xyz[1];
	let z = xyz[2];

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? (x ** (1 / 3)) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? (y ** (1 / 3)) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? (z ** (1 / 3)) : (7.787 * z) + (16 / 116);

	const l = (116 * y) - 16;
	const a = 500 * (x - y);
	const b = 200 * (y - z);

	return [l, a, b];
};

convert$1.hsl.rgb = function (hsl) {
	const h = hsl[0] / 360;
	const s = hsl[1] / 100;
	const l = hsl[2] / 100;
	let t2;
	let t3;
	let val;

	if (s === 0) {
		val = l * 255;
		return [val, val, val];
	}

	if (l < 0.5) {
		t2 = l * (1 + s);
	} else {
		t2 = l + s - l * s;
	}

	const t1 = 2 * l - t2;

	const rgb = [0, 0, 0];
	for (let i = 0; i < 3; i++) {
		t3 = h + 1 / 3 * -(i - 1);
		if (t3 < 0) {
			t3++;
		}

		if (t3 > 1) {
			t3--;
		}

		if (6 * t3 < 1) {
			val = t1 + (t2 - t1) * 6 * t3;
		} else if (2 * t3 < 1) {
			val = t2;
		} else if (3 * t3 < 2) {
			val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
		} else {
			val = t1;
		}

		rgb[i] = val * 255;
	}

	return rgb;
};

convert$1.hsl.hsv = function (hsl) {
	const h = hsl[0];
	let s = hsl[1] / 100;
	let l = hsl[2] / 100;
	let smin = s;
	const lmin = Math.max(l, 0.01);

	l *= 2;
	s *= (l <= 1) ? l : 2 - l;
	smin *= lmin <= 1 ? lmin : 2 - lmin;
	const v = (l + s) / 2;
	const sv = l === 0 ? (2 * smin) / (lmin + smin) : (2 * s) / (l + s);

	return [h, sv * 100, v * 100];
};

convert$1.hsv.rgb = function (hsv) {
	const h = hsv[0] / 60;
	const s = hsv[1] / 100;
	let v = hsv[2] / 100;
	const hi = Math.floor(h) % 6;

	const f = h - Math.floor(h);
	const p = 255 * v * (1 - s);
	const q = 255 * v * (1 - (s * f));
	const t = 255 * v * (1 - (s * (1 - f)));
	v *= 255;

	switch (hi) {
		case 0:
			return [v, t, p];
		case 1:
			return [q, v, p];
		case 2:
			return [p, v, t];
		case 3:
			return [p, q, v];
		case 4:
			return [t, p, v];
		case 5:
			return [v, p, q];
	}
};

convert$1.hsv.hsl = function (hsv) {
	const h = hsv[0];
	const s = hsv[1] / 100;
	const v = hsv[2] / 100;
	const vmin = Math.max(v, 0.01);
	let sl;
	let l;

	l = (2 - s) * v;
	const lmin = (2 - s) * vmin;
	sl = s * vmin;
	sl /= (lmin <= 1) ? lmin : 2 - lmin;
	sl = sl || 0;
	l /= 2;

	return [h, sl * 100, l * 100];
};

// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
convert$1.hwb.rgb = function (hwb) {
	const h = hwb[0] / 360;
	let wh = hwb[1] / 100;
	let bl = hwb[2] / 100;
	const ratio = wh + bl;
	let f;

	// Wh + bl cant be > 1
	if (ratio > 1) {
		wh /= ratio;
		bl /= ratio;
	}

	const i = Math.floor(6 * h);
	const v = 1 - bl;
	f = 6 * h - i;

	if ((i & 0x01) !== 0) {
		f = 1 - f;
	}

	const n = wh + f * (v - wh); // Linear interpolation

	let r;
	let g;
	let b;
	/* eslint-disable max-statements-per-line,no-multi-spaces */
	switch (i) {
		default:
		case 6:
		case 0: r = v;  g = n;  b = wh; break;
		case 1: r = n;  g = v;  b = wh; break;
		case 2: r = wh; g = v;  b = n; break;
		case 3: r = wh; g = n;  b = v; break;
		case 4: r = n;  g = wh; b = v; break;
		case 5: r = v;  g = wh; b = n; break;
	}
	/* eslint-enable max-statements-per-line,no-multi-spaces */

	return [r * 255, g * 255, b * 255];
};

convert$1.cmyk.rgb = function (cmyk) {
	const c = cmyk[0] / 100;
	const m = cmyk[1] / 100;
	const y = cmyk[2] / 100;
	const k = cmyk[3] / 100;

	const r = 1 - Math.min(1, c * (1 - k) + k);
	const g = 1 - Math.min(1, m * (1 - k) + k);
	const b = 1 - Math.min(1, y * (1 - k) + k);

	return [r * 255, g * 255, b * 255];
};

convert$1.xyz.rgb = function (xyz) {
	const x = xyz[0] / 100;
	const y = xyz[1] / 100;
	const z = xyz[2] / 100;
	let r;
	let g;
	let b;

	r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
	g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
	b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

	// Assume sRGB
	r = r > 0.0031308
		? ((1.055 * (r ** (1.0 / 2.4))) - 0.055)
		: r * 12.92;

	g = g > 0.0031308
		? ((1.055 * (g ** (1.0 / 2.4))) - 0.055)
		: g * 12.92;

	b = b > 0.0031308
		? ((1.055 * (b ** (1.0 / 2.4))) - 0.055)
		: b * 12.92;

	r = Math.min(Math.max(0, r), 1);
	g = Math.min(Math.max(0, g), 1);
	b = Math.min(Math.max(0, b), 1);

	return [r * 255, g * 255, b * 255];
};

convert$1.xyz.lab = function (xyz) {
	let x = xyz[0];
	let y = xyz[1];
	let z = xyz[2];

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? (x ** (1 / 3)) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? (y ** (1 / 3)) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? (z ** (1 / 3)) : (7.787 * z) + (16 / 116);

	const l = (116 * y) - 16;
	const a = 500 * (x - y);
	const b = 200 * (y - z);

	return [l, a, b];
};

convert$1.lab.xyz = function (lab) {
	const l = lab[0];
	const a = lab[1];
	const b = lab[2];
	let x;
	let y;
	let z;

	y = (l + 16) / 116;
	x = a / 500 + y;
	z = y - b / 200;

	const y2 = y ** 3;
	const x2 = x ** 3;
	const z2 = z ** 3;
	y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
	x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
	z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;

	x *= 95.047;
	y *= 100;
	z *= 108.883;

	return [x, y, z];
};

convert$1.lab.lch = function (lab) {
	const l = lab[0];
	const a = lab[1];
	const b = lab[2];
	let h;

	const hr = Math.atan2(b, a);
	h = hr * 360 / 2 / Math.PI;

	if (h < 0) {
		h += 360;
	}

	const c = Math.sqrt(a * a + b * b);

	return [l, c, h];
};

convert$1.lch.lab = function (lch) {
	const l = lch[0];
	const c = lch[1];
	const h = lch[2];

	const hr = h / 360 * 2 * Math.PI;
	const a = c * Math.cos(hr);
	const b = c * Math.sin(hr);

	return [l, a, b];
};

convert$1.rgb.ansi16 = function (args, saturation = null) {
	const [r, g, b] = args;
	let value = saturation === null ? convert$1.rgb.hsv(args)[2] : saturation; // Hsv -> ansi16 optimization

	value = Math.round(value / 50);

	if (value === 0) {
		return 30;
	}

	let ansi = 30
		+ ((Math.round(b / 255) << 2)
		| (Math.round(g / 255) << 1)
		| Math.round(r / 255));

	if (value === 2) {
		ansi += 60;
	}

	return ansi;
};

convert$1.hsv.ansi16 = function (args) {
	// Optimization here; we already know the value and don't need to get
	// it converted for us.
	return convert$1.rgb.ansi16(convert$1.hsv.rgb(args), args[2]);
};

convert$1.rgb.ansi256 = function (args) {
	const r = args[0];
	const g = args[1];
	const b = args[2];

	// We use the extended greyscale palette here, with the exception of
	// black and white. normal palette only has 4 greyscale shades.
	if (r === g && g === b) {
		if (r < 8) {
			return 16;
		}

		if (r > 248) {
			return 231;
		}

		return Math.round(((r - 8) / 247) * 24) + 232;
	}

	const ansi = 16
		+ (36 * Math.round(r / 255 * 5))
		+ (6 * Math.round(g / 255 * 5))
		+ Math.round(b / 255 * 5);

	return ansi;
};

convert$1.ansi16.rgb = function (args) {
	let color = args % 10;

	// Handle greyscale
	if (color === 0 || color === 7) {
		if (args > 50) {
			color += 3.5;
		}

		color = color / 10.5 * 255;

		return [color, color, color];
	}

	const mult = (~~(args > 50) + 1) * 0.5;
	const r = ((color & 1) * mult) * 255;
	const g = (((color >> 1) & 1) * mult) * 255;
	const b = (((color >> 2) & 1) * mult) * 255;

	return [r, g, b];
};

convert$1.ansi256.rgb = function (args) {
	// Handle greyscale
	if (args >= 232) {
		const c = (args - 232) * 10 + 8;
		return [c, c, c];
	}

	args -= 16;

	let rem;
	const r = Math.floor(args / 36) / 5 * 255;
	const g = Math.floor((rem = args % 36) / 6) / 5 * 255;
	const b = (rem % 6) / 5 * 255;

	return [r, g, b];
};

convert$1.rgb.hex = function (args) {
	const integer = ((Math.round(args[0]) & 0xFF) << 16)
		+ ((Math.round(args[1]) & 0xFF) << 8)
		+ (Math.round(args[2]) & 0xFF);

	const string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert$1.hex.rgb = function (args) {
	const match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
	if (!match) {
		return [0, 0, 0];
	}

	let colorString = match[0];

	if (match[0].length === 3) {
		colorString = colorString.split('').map(char => {
			return char + char;
		}).join('');
	}

	const integer = parseInt(colorString, 16);
	const r = (integer >> 16) & 0xFF;
	const g = (integer >> 8) & 0xFF;
	const b = integer & 0xFF;

	return [r, g, b];
};

convert$1.rgb.hcg = function (rgb) {
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const max = Math.max(Math.max(r, g), b);
	const min = Math.min(Math.min(r, g), b);
	const chroma = (max - min);
	let grayscale;
	let hue;

	if (chroma < 1) {
		grayscale = min / (1 - chroma);
	} else {
		grayscale = 0;
	}

	if (chroma <= 0) {
		hue = 0;
	} else
	if (max === r) {
		hue = ((g - b) / chroma) % 6;
	} else
	if (max === g) {
		hue = 2 + (b - r) / chroma;
	} else {
		hue = 4 + (r - g) / chroma;
	}

	hue /= 6;
	hue %= 1;

	return [hue * 360, chroma * 100, grayscale * 100];
};

convert$1.hsl.hcg = function (hsl) {
	const s = hsl[1] / 100;
	const l = hsl[2] / 100;

	const c = l < 0.5 ? (2.0 * s * l) : (2.0 * s * (1.0 - l));

	let f = 0;
	if (c < 1.0) {
		f = (l - 0.5 * c) / (1.0 - c);
	}

	return [hsl[0], c * 100, f * 100];
};

convert$1.hsv.hcg = function (hsv) {
	const s = hsv[1] / 100;
	const v = hsv[2] / 100;

	const c = s * v;
	let f = 0;

	if (c < 1.0) {
		f = (v - c) / (1 - c);
	}

	return [hsv[0], c * 100, f * 100];
};

convert$1.hcg.rgb = function (hcg) {
	const h = hcg[0] / 360;
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;

	if (c === 0.0) {
		return [g * 255, g * 255, g * 255];
	}

	const pure = [0, 0, 0];
	const hi = (h % 1) * 6;
	const v = hi % 1;
	const w = 1 - v;
	let mg = 0;

	/* eslint-disable max-statements-per-line */
	switch (Math.floor(hi)) {
		case 0:
			pure[0] = 1; pure[1] = v; pure[2] = 0; break;
		case 1:
			pure[0] = w; pure[1] = 1; pure[2] = 0; break;
		case 2:
			pure[0] = 0; pure[1] = 1; pure[2] = v; break;
		case 3:
			pure[0] = 0; pure[1] = w; pure[2] = 1; break;
		case 4:
			pure[0] = v; pure[1] = 0; pure[2] = 1; break;
		default:
			pure[0] = 1; pure[1] = 0; pure[2] = w;
	}
	/* eslint-enable max-statements-per-line */

	mg = (1.0 - c) * g;

	return [
		(c * pure[0] + mg) * 255,
		(c * pure[1] + mg) * 255,
		(c * pure[2] + mg) * 255
	];
};

convert$1.hcg.hsv = function (hcg) {
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;

	const v = c + g * (1.0 - c);
	let f = 0;

	if (v > 0.0) {
		f = c / v;
	}

	return [hcg[0], f * 100, v * 100];
};

convert$1.hcg.hsl = function (hcg) {
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;

	const l = g * (1.0 - c) + 0.5 * c;
	let s = 0;

	if (l > 0.0 && l < 0.5) {
		s = c / (2 * l);
	} else
	if (l >= 0.5 && l < 1.0) {
		s = c / (2 * (1 - l));
	}

	return [hcg[0], s * 100, l * 100];
};

convert$1.hcg.hwb = function (hcg) {
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;
	const v = c + g * (1.0 - c);
	return [hcg[0], (v - c) * 100, (1 - v) * 100];
};

convert$1.hwb.hcg = function (hwb) {
	const w = hwb[1] / 100;
	const b = hwb[2] / 100;
	const v = 1 - b;
	const c = v - w;
	let g = 0;

	if (c < 1) {
		g = (v - c) / (1 - c);
	}

	return [hwb[0], c * 100, g * 100];
};

convert$1.apple.rgb = function (apple) {
	return [(apple[0] / 65535) * 255, (apple[1] / 65535) * 255, (apple[2] / 65535) * 255];
};

convert$1.rgb.apple = function (rgb) {
	return [(rgb[0] / 255) * 65535, (rgb[1] / 255) * 65535, (rgb[2] / 255) * 65535];
};

convert$1.gray.rgb = function (args) {
	return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
};

convert$1.gray.hsl = function (args) {
	return [0, 0, args[0]];
};

convert$1.gray.hsv = convert$1.gray.hsl;

convert$1.gray.hwb = function (gray) {
	return [0, 100, gray[0]];
};

convert$1.gray.cmyk = function (gray) {
	return [0, 0, 0, gray[0]];
};

convert$1.gray.lab = function (gray) {
	return [gray[0], 0, 0];
};

convert$1.gray.hex = function (gray) {
	const val = Math.round(gray[0] / 100 * 255) & 0xFF;
	const integer = (val << 16) + (val << 8) + val;

	const string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert$1.rgb.gray = function (rgb) {
	const val = (rgb[0] + rgb[1] + rgb[2]) / 3;
	return [val / 255 * 100];
};

const conversions$1 = conversions$2;

/*
	This function routes a model to all other models.

	all functions that are routed have a property `.conversion` attached
	to the returned synthetic function. This property is an array
	of strings, each with the steps in between the 'from' and 'to'
	color models (inclusive).

	conversions that are not possible simply are not included.
*/

function buildGraph() {
	const graph = {};
	// https://jsperf.com/object-keys-vs-for-in-with-closure/3
	const models = Object.keys(conversions$1);

	for (let len = models.length, i = 0; i < len; i++) {
		graph[models[i]] = {
			// http://jsperf.com/1-vs-infinity
			// micro-opt, but this is simple.
			distance: -1,
			parent: null
		};
	}

	return graph;
}

// https://en.wikipedia.org/wiki/Breadth-first_search
function deriveBFS(fromModel) {
	const graph = buildGraph();
	const queue = [fromModel]; // Unshift -> queue -> pop

	graph[fromModel].distance = 0;

	while (queue.length) {
		const current = queue.pop();
		const adjacents = Object.keys(conversions$1[current]);

		for (let len = adjacents.length, i = 0; i < len; i++) {
			const adjacent = adjacents[i];
			const node = graph[adjacent];

			if (node.distance === -1) {
				node.distance = graph[current].distance + 1;
				node.parent = current;
				queue.unshift(adjacent);
			}
		}
	}

	return graph;
}

function link$2(from, to) {
	return function (args) {
		return to(from(args));
	};
}

function wrapConversion(toModel, graph) {
	const path = [graph[toModel].parent, toModel];
	let fn = conversions$1[graph[toModel].parent][toModel];

	let cur = graph[toModel].parent;
	while (graph[cur].parent) {
		path.unshift(graph[cur].parent);
		fn = link$2(conversions$1[graph[cur].parent][cur], fn);
		cur = graph[cur].parent;
	}

	fn.conversion = path;
	return fn;
}

var route$1 = function (fromModel) {
	const graph = deriveBFS(fromModel);
	const conversion = {};

	const models = Object.keys(graph);
	for (let len = models.length, i = 0; i < len; i++) {
		const toModel = models[i];
		const node = graph[toModel];

		if (node.parent === null) {
			// No possible conversion, or this node is the source model.
			continue;
		}

		conversion[toModel] = wrapConversion(toModel, graph);
	}

	return conversion;
};

const conversions = conversions$2;
const route = route$1;

const convert = {};

const models = Object.keys(conversions);

function wrapRaw(fn) {
	const wrappedFn = function (...args) {
		const arg0 = args[0];
		if (arg0 === undefined || arg0 === null) {
			return arg0;
		}

		if (arg0.length > 1) {
			args = arg0;
		}

		return fn(args);
	};

	// Preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

function wrapRounded(fn) {
	const wrappedFn = function (...args) {
		const arg0 = args[0];

		if (arg0 === undefined || arg0 === null) {
			return arg0;
		}

		if (arg0.length > 1) {
			args = arg0;
		}

		const result = fn(args);

		// We're assuming the result is an array here.
		// see notice in conversions.js; don't use box types
		// in conversion functions.
		if (typeof result === 'object') {
			for (let len = result.length, i = 0; i < len; i++) {
				result[i] = Math.round(result[i]);
			}
		}

		return result;
	};

	// Preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

models.forEach(fromModel => {
	convert[fromModel] = {};

	Object.defineProperty(convert[fromModel], 'channels', {value: conversions[fromModel].channels});
	Object.defineProperty(convert[fromModel], 'labels', {value: conversions[fromModel].labels});

	const routes = route(fromModel);
	const routeModels = Object.keys(routes);

	routeModels.forEach(toModel => {
		const fn = routes[toModel];

		convert[fromModel][toModel] = wrapRounded(fn);
		convert[fromModel][toModel].raw = wrapRaw(fn);
	});
});

var colorConvert = convert;

(function (module) {

const wrapAnsi16 = (fn, offset) => (...args) => {
	const code = fn(...args);
	return `\u001B[${code + offset}m`;
};

const wrapAnsi256 = (fn, offset) => (...args) => {
	const code = fn(...args);
	return `\u001B[${38 + offset};5;${code}m`;
};

const wrapAnsi16m = (fn, offset) => (...args) => {
	const rgb = fn(...args);
	return `\u001B[${38 + offset};2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
};

const ansi2ansi = n => n;
const rgb2rgb = (r, g, b) => [r, g, b];

const setLazyProperty = (object, property, get) => {
	Object.defineProperty(object, property, {
		get: () => {
			const value = get();

			Object.defineProperty(object, property, {
				value,
				enumerable: true,
				configurable: true
			});

			return value;
		},
		enumerable: true,
		configurable: true
	});
};

/** @type {typeof import('color-convert')} */
let colorConvert$1;
const makeDynamicStyles = (wrap, targetSpace, identity, isBackground) => {
	if (colorConvert$1 === undefined) {
		colorConvert$1 = colorConvert;
	}

	const offset = isBackground ? 10 : 0;
	const styles = {};

	for (const [sourceSpace, suite] of Object.entries(colorConvert$1)) {
		const name = sourceSpace === 'ansi16' ? 'ansi' : sourceSpace;
		if (sourceSpace === targetSpace) {
			styles[name] = wrap(identity, offset);
		} else if (typeof suite === 'object') {
			styles[name] = wrap(suite[targetSpace], offset);
		}
	}

	return styles;
};

function assembleStyles() {
	const codes = new Map();
	const styles = {
		modifier: {
			reset: [0, 0],
			// 21 isn't widely supported and 22 does the same thing
			bold: [1, 22],
			dim: [2, 22],
			italic: [3, 23],
			underline: [4, 24],
			inverse: [7, 27],
			hidden: [8, 28],
			strikethrough: [9, 29]
		},
		color: {
			black: [30, 39],
			red: [31, 39],
			green: [32, 39],
			yellow: [33, 39],
			blue: [34, 39],
			magenta: [35, 39],
			cyan: [36, 39],
			white: [37, 39],

			// Bright color
			blackBright: [90, 39],
			redBright: [91, 39],
			greenBright: [92, 39],
			yellowBright: [93, 39],
			blueBright: [94, 39],
			magentaBright: [95, 39],
			cyanBright: [96, 39],
			whiteBright: [97, 39]
		},
		bgColor: {
			bgBlack: [40, 49],
			bgRed: [41, 49],
			bgGreen: [42, 49],
			bgYellow: [43, 49],
			bgBlue: [44, 49],
			bgMagenta: [45, 49],
			bgCyan: [46, 49],
			bgWhite: [47, 49],

			// Bright color
			bgBlackBright: [100, 49],
			bgRedBright: [101, 49],
			bgGreenBright: [102, 49],
			bgYellowBright: [103, 49],
			bgBlueBright: [104, 49],
			bgMagentaBright: [105, 49],
			bgCyanBright: [106, 49],
			bgWhiteBright: [107, 49]
		}
	};

	// Alias bright black as gray (and grey)
	styles.color.gray = styles.color.blackBright;
	styles.bgColor.bgGray = styles.bgColor.bgBlackBright;
	styles.color.grey = styles.color.blackBright;
	styles.bgColor.bgGrey = styles.bgColor.bgBlackBright;

	for (const [groupName, group] of Object.entries(styles)) {
		for (const [styleName, style] of Object.entries(group)) {
			styles[styleName] = {
				open: `\u001B[${style[0]}m`,
				close: `\u001B[${style[1]}m`
			};

			group[styleName] = styles[styleName];

			codes.set(style[0], style[1]);
		}

		Object.defineProperty(styles, groupName, {
			value: group,
			enumerable: false
		});
	}

	Object.defineProperty(styles, 'codes', {
		value: codes,
		enumerable: false
	});

	styles.color.close = '\u001B[39m';
	styles.bgColor.close = '\u001B[49m';

	setLazyProperty(styles.color, 'ansi', () => makeDynamicStyles(wrapAnsi16, 'ansi16', ansi2ansi, false));
	setLazyProperty(styles.color, 'ansi256', () => makeDynamicStyles(wrapAnsi256, 'ansi256', ansi2ansi, false));
	setLazyProperty(styles.color, 'ansi16m', () => makeDynamicStyles(wrapAnsi16m, 'rgb', rgb2rgb, false));
	setLazyProperty(styles.bgColor, 'ansi', () => makeDynamicStyles(wrapAnsi16, 'ansi16', ansi2ansi, true));
	setLazyProperty(styles.bgColor, 'ansi256', () => makeDynamicStyles(wrapAnsi256, 'ansi256', ansi2ansi, true));
	setLazyProperty(styles.bgColor, 'ansi16m', () => makeDynamicStyles(wrapAnsi16m, 'rgb', rgb2rgb, true));

	return styles;
}

// Make the export immutable
Object.defineProperty(module, 'exports', {
	enumerable: true,
	get: assembleStyles
});
}(ansiStyles$4));

const isFullwidthCodePoint$2 = isFullwidthCodePoint$4.exports;
const astralRegex$1 = astralRegex_1;
const ansiStyles$3 = ansiStyles$4.exports;

const ESCAPES$3 = [
	'\u001B',
	'\u009B'
];

const wrapAnsi$4 = code => `${ESCAPES$3[0]}[${code}m`;

const checkAnsi$1 = (ansiCodes, isEscapes, endAnsiCode) => {
	let output = [];
	ansiCodes = [...ansiCodes];

	for (let ansiCode of ansiCodes) {
		const ansiCodeOrigin = ansiCode;
		if (ansiCode.match(';')) {
			ansiCode = ansiCode.split(';')[0][0] + '0';
		}

		const item = ansiStyles$3.codes.get(parseInt(ansiCode, 10));
		if (item) {
			const indexEscape = ansiCodes.indexOf(item.toString());
			if (indexEscape >= 0) {
				ansiCodes.splice(indexEscape, 1);
			} else {
				output.push(wrapAnsi$4(isEscapes ? item : ansiCodeOrigin));
			}
		} else if (isEscapes) {
			output.push(wrapAnsi$4(0));
			break;
		} else {
			output.push(wrapAnsi$4(ansiCodeOrigin));
		}
	}

	if (isEscapes) {
		output = output.filter((element, index) => output.indexOf(element) === index);
		if (endAnsiCode !== undefined) {
			const fistEscapeCode = wrapAnsi$4(ansiStyles$3.codes.get(parseInt(endAnsiCode, 10)));
			output = output.reduce((current, next) => next === fistEscapeCode ? [next, ...current] : [...current, next], []);
		}
	}

	return output.join('');
};

var sliceAnsi$3 = (string, begin, end) => {
	const characters = [...string.normalize()];
	const ansiCodes = [];

	end = typeof end === 'number' ? end : characters.length;

	let isInsideEscape = false;
	let ansiCode;
	let visible = 0;
	let output = '';

	for (const [index, character] of characters.entries()) {
		let leftEscape = false;

		if (ESCAPES$3.includes(character)) {
			const code = /\d[^m]*/.exec(string.slice(index, index + 18));
			ansiCode = code && code.length > 0 ? code[0] : undefined;
			if (visible < end) {
				isInsideEscape = true;
				if (ansiCode !== undefined) {
					ansiCodes.push(ansiCode);
				}
			}
		} else if (isInsideEscape && character === 'm') {
			isInsideEscape = false;
			leftEscape = true;
		}

		if (!isInsideEscape && !leftEscape) {
			++visible;
		}

		if (!astralRegex$1({exact: true}).test(character) && isFullwidthCodePoint$2(character.codePointAt())) {
			++visible;
		}

		if (visible > begin && visible <= end) {
			output += character;
		} else if (visible === begin && !isInsideEscape && ansiCode !== undefined) {
			output = checkAnsi$1(ansiCodes);
		} else if (visible >= end) {
			output += checkAnsi$1(ansiCodes, true, ansiCode);
			break;
		}
	}

	return output;
};

var stringWidth$4 = {exports: {}};

var ansiRegex$1 = ({onlyFirst = false} = {}) => {
	const pattern = [
		'[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
		'(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))'
	].join('|');

	return new RegExp(pattern, onlyFirst ? undefined : 'g');
};

const ansiRegex = ansiRegex$1;

var stripAnsi$3 = string => typeof string === 'string' ? string.replace(ansiRegex(), '') : string;

var emojiRegex$1 = function () {
  // https://mths.be/emoji
  return /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F|\uD83D\uDC68(?:\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68\uD83C\uDFFB|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|[\u2695\u2696\u2708]\uFE0F|\uD83D[\uDC66\uDC67]|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708])\uFE0F|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C[\uDFFB-\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)\uD83C\uDFFB|\uD83E\uDDD1(?:\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1)|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB\uDFFC])|\uD83D\uDC69(?:\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|(?:\uD83E\uDDD1\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB-\uDFFD])|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|(?:(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)\uFE0F|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\u200D[\u2640\u2642])|\uD83C\uDFF4\u200D\u2620)\uFE0F|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF4\uD83C\uDDF2|\uD83C\uDDF6\uD83C\uDDE6|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDB5\uDDB6\uDDBB\uDDD2-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5\uDEEB\uDEEC\uDEF4-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g;
};

const stripAnsi$2 = stripAnsi$3;
const isFullwidthCodePoint$1 = isFullwidthCodePoint$4.exports;
const emojiRegex = emojiRegex$1;

const stringWidth$3 = string => {
	if (typeof string !== 'string' || string.length === 0) {
		return 0;
	}

	string = stripAnsi$2(string);

	if (string.length === 0) {
		return 0;
	}

	string = string.replace(emojiRegex(), '  ');

	let width = 0;

	for (let i = 0; i < string.length; i++) {
		const code = string.codePointAt(i);

		// Ignore control characters
		if (code <= 0x1F || (code >= 0x7F && code <= 0x9F)) {
			continue;
		}

		// Ignore combining characters
		if (code >= 0x300 && code <= 0x36F) {
			continue;
		}

		// Surrogates
		if (code > 0xFFFF) {
			i++;
		}

		width += isFullwidthCodePoint$1(code) ? 2 : 1;
	}

	return width;
};

stringWidth$4.exports = stringWidth$3;
// TODO: remove this in the next major version
stringWidth$4.exports.default = stringWidth$3;

const sliceAnsi$2 = sliceAnsi$3;
const stringWidth$2 = stringWidth$4.exports;

function getIndexOfNearestSpace(string, index, shouldSearchRight) {
	if (string.charAt(index) === ' ') {
		return index;
	}

	for (let i = 1; i <= 3; i++) {
		if (shouldSearchRight) {
			if (string.charAt(index + i) === ' ') {
				return index + i;
			}
		} else if (string.charAt(index - i) === ' ') {
			return index - i;
		}
	}

	return index;
}

var cliTruncate$1 = (text, columns, options) => {
	options = {
		position: 'end',
		preferTruncationOnSpace: false,
		...options
	};

	const {position, space, preferTruncationOnSpace} = options;
	let ellipsis = '…';
	let ellipsisWidth = 1;

	if (typeof text !== 'string') {
		throw new TypeError(`Expected \`input\` to be a string, got ${typeof text}`);
	}

	if (typeof columns !== 'number') {
		throw new TypeError(`Expected \`columns\` to be a number, got ${typeof columns}`);
	}

	if (columns < 1) {
		return '';
	}

	if (columns === 1) {
		return ellipsis;
	}

	const length = stringWidth$2(text);

	if (length <= columns) {
		return text;
	}

	if (position === 'start') {
		if (preferTruncationOnSpace) {
			const nearestSpace = getIndexOfNearestSpace(text, length - columns + 1, true);
			return ellipsis + sliceAnsi$2(text, nearestSpace, length).trim();
		}

		if (space === true) {
			ellipsis += ' ';
			ellipsisWidth = 2;
		}

		return ellipsis + sliceAnsi$2(text, length - columns + ellipsisWidth, length);
	}

	if (position === 'middle') {
		if (space === true) {
			ellipsis = ' ' + ellipsis + ' ';
			ellipsisWidth = 3;
		}

		const half = Math.floor(columns / 2);

		if (preferTruncationOnSpace) {
			const spaceNearFirstBreakPoint = getIndexOfNearestSpace(text, half);
			const spaceNearSecondBreakPoint = getIndexOfNearestSpace(text, length - (columns - half) + 1, true);
			return sliceAnsi$2(text, 0, spaceNearFirstBreakPoint) + ellipsis + sliceAnsi$2(text, spaceNearSecondBreakPoint, length).trim();
		}

		return (
			sliceAnsi$2(text, 0, half) +
			ellipsis +
			sliceAnsi$2(text, length - (columns - half) + ellipsisWidth, length)
		);
	}

	if (position === 'end') {
		if (preferTruncationOnSpace) {
			const nearestSpace = getIndexOfNearestSpace(text, columns - 1);
			return sliceAnsi$2(text, 0, nearestSpace) + ellipsis;
		}

		if (space === true) {
			ellipsis = ' ' + ellipsis;
			ellipsisWidth = 2;
		}

		return sliceAnsi$2(text, 0, columns - ellipsisWidth) + ellipsis;
	}

	throw new Error(`Expected \`options.position\` to be either \`start\`, \`middle\` or \`end\`, got ${position}`);
};

var logUpdate$1 = {exports: {}};

var ansiEscapes$1 = {exports: {}};

(function (module) {
const ansiEscapes = module.exports;
// TODO: remove this in the next major version
module.exports.default = ansiEscapes;

const ESC = '\u001B[';
const OSC = '\u001B]';
const BEL = '\u0007';
const SEP = ';';
const isTerminalApp = process.env.TERM_PROGRAM === 'Apple_Terminal';

ansiEscapes.cursorTo = (x, y) => {
	if (typeof x !== 'number') {
		throw new TypeError('The `x` argument is required');
	}

	if (typeof y !== 'number') {
		return ESC + (x + 1) + 'G';
	}

	return ESC + (y + 1) + ';' + (x + 1) + 'H';
};

ansiEscapes.cursorMove = (x, y) => {
	if (typeof x !== 'number') {
		throw new TypeError('The `x` argument is required');
	}

	let ret = '';

	if (x < 0) {
		ret += ESC + (-x) + 'D';
	} else if (x > 0) {
		ret += ESC + x + 'C';
	}

	if (y < 0) {
		ret += ESC + (-y) + 'A';
	} else if (y > 0) {
		ret += ESC + y + 'B';
	}

	return ret;
};

ansiEscapes.cursorUp = (count = 1) => ESC + count + 'A';
ansiEscapes.cursorDown = (count = 1) => ESC + count + 'B';
ansiEscapes.cursorForward = (count = 1) => ESC + count + 'C';
ansiEscapes.cursorBackward = (count = 1) => ESC + count + 'D';

ansiEscapes.cursorLeft = ESC + 'G';
ansiEscapes.cursorSavePosition = isTerminalApp ? '\u001B7' : ESC + 's';
ansiEscapes.cursorRestorePosition = isTerminalApp ? '\u001B8' : ESC + 'u';
ansiEscapes.cursorGetPosition = ESC + '6n';
ansiEscapes.cursorNextLine = ESC + 'E';
ansiEscapes.cursorPrevLine = ESC + 'F';
ansiEscapes.cursorHide = ESC + '?25l';
ansiEscapes.cursorShow = ESC + '?25h';

ansiEscapes.eraseLines = count => {
	let clear = '';

	for (let i = 0; i < count; i++) {
		clear += ansiEscapes.eraseLine + (i < count - 1 ? ansiEscapes.cursorUp() : '');
	}

	if (count) {
		clear += ansiEscapes.cursorLeft;
	}

	return clear;
};

ansiEscapes.eraseEndLine = ESC + 'K';
ansiEscapes.eraseStartLine = ESC + '1K';
ansiEscapes.eraseLine = ESC + '2K';
ansiEscapes.eraseDown = ESC + 'J';
ansiEscapes.eraseUp = ESC + '1J';
ansiEscapes.eraseScreen = ESC + '2J';
ansiEscapes.scrollUp = ESC + 'S';
ansiEscapes.scrollDown = ESC + 'T';

ansiEscapes.clearScreen = '\u001Bc';

ansiEscapes.clearTerminal = process.platform === 'win32' ?
	`${ansiEscapes.eraseScreen}${ESC}0f` :
	// 1. Erases the screen (Only done in case `2` is not supported)
	// 2. Erases the whole screen including scrollback buffer
	// 3. Moves cursor to the top-left position
	// More info: https://www.real-world-systems.com/docs/ANSIcode.html
	`${ansiEscapes.eraseScreen}${ESC}3J${ESC}H`;

ansiEscapes.beep = BEL;

ansiEscapes.link = (text, url) => {
	return [
		OSC,
		'8',
		SEP,
		SEP,
		url,
		BEL,
		text,
		OSC,
		'8',
		SEP,
		SEP,
		BEL
	].join('');
};

ansiEscapes.image = (buffer, options = {}) => {
	let ret = `${OSC}1337;File=inline=1`;

	if (options.width) {
		ret += `;width=${options.width}`;
	}

	if (options.height) {
		ret += `;height=${options.height}`;
	}

	if (options.preserveAspectRatio === false) {
		ret += ';preserveAspectRatio=0';
	}

	return ret + ':' + buffer.toString('base64') + BEL;
};

ansiEscapes.iTerm = {
	setCwd: (cwd = process.cwd()) => `${OSC}50;CurrentDir=${cwd}${BEL}`,

	annotation: (message, options = {}) => {
		let ret = `${OSC}1337;`;

		const hasX = typeof options.x !== 'undefined';
		const hasY = typeof options.y !== 'undefined';
		if ((hasX || hasY) && !(hasX && hasY && typeof options.length !== 'undefined')) {
			throw new Error('`x`, `y` and `length` must be defined when `x` or `y` is defined');
		}

		message = message.replace(/\|/g, '');

		ret += options.isHidden ? 'AddHiddenAnnotation=' : 'AddAnnotation=';

		if (options.length > 0) {
			ret +=
					(hasX ?
						[message, options.length, options.x, options.y] :
						[options.length, message]).join('|');
		} else {
			ret += message;
		}

		return ret + BEL;
	}
};
}(ansiEscapes$1));

var cliCursor$1 = {};

var onetime$3 = {exports: {}};

var mimicFn$2 = {exports: {}};

const mimicFn$1 = (to, from) => {
	for (const prop of Reflect.ownKeys(from)) {
		Object.defineProperty(to, prop, Object.getOwnPropertyDescriptor(from, prop));
	}

	return to;
};

mimicFn$2.exports = mimicFn$1;
// TODO: Remove this for the next major release
mimicFn$2.exports.default = mimicFn$1;

const mimicFn = mimicFn$2.exports;

const calledFunctions = new WeakMap();

const onetime$2 = (function_, options = {}) => {
	if (typeof function_ !== 'function') {
		throw new TypeError('Expected a function');
	}

	let returnValue;
	let callCount = 0;
	const functionName = function_.displayName || function_.name || '<anonymous>';

	const onetime = function (...arguments_) {
		calledFunctions.set(onetime, ++callCount);

		if (callCount === 1) {
			returnValue = function_.apply(this, arguments_);
			function_ = null;
		} else if (options.throw === true) {
			throw new Error(`Function \`${functionName}\` can only be called once`);
		}

		return returnValue;
	};

	mimicFn(onetime, function_);
	calledFunctions.set(onetime, callCount);

	return onetime;
};

onetime$3.exports = onetime$2;
// TODO: Remove this for the next major release
onetime$3.exports.default = onetime$2;

onetime$3.exports.callCount = function_ => {
	if (!calledFunctions.has(function_)) {
		throw new Error(`The given function \`${function_.name}\` is not wrapped by the \`onetime\` package`);
	}

	return calledFunctions.get(function_);
};

var signalExit$1 = {exports: {}};

var signals$2 = {exports: {}};

(function (module) {
// This is not the set of all possible signals.
//
// It IS, however, the set of all signals that trigger
// an exit on either Linux or BSD systems.  Linux is a
// superset of the signal names supported on BSD, and
// the unknown signals just fail to register, so we can
// catch that easily enough.
//
// Don't bother with SIGKILL.  It's uncatchable, which
// means that we can't fire any callbacks anyway.
//
// If a user does happen to register a handler on a non-
// fatal signal like SIGWINCH or something, and then
// exit, it'll end up firing `process.emit('exit')`, so
// the handler will be fired anyway.
//
// SIGBUS, SIGFPE, SIGSEGV and SIGILL, when not raised
// artificially, inherently leave the process in a
// state from which it is not safe to try and enter JS
// listeners.
module.exports = [
  'SIGABRT',
  'SIGALRM',
  'SIGHUP',
  'SIGINT',
  'SIGTERM'
];

if (process.platform !== 'win32') {
  module.exports.push(
    'SIGVTALRM',
    'SIGXCPU',
    'SIGXFSZ',
    'SIGUSR2',
    'SIGTRAP',
    'SIGSYS',
    'SIGQUIT',
    'SIGIOT'
    // should detect profiler and enable/disable accordingly.
    // see #21
    // 'SIGPROF'
  );
}

if (process.platform === 'linux') {
  module.exports.push(
    'SIGIO',
    'SIGPOLL',
    'SIGPWR',
    'SIGSTKFLT',
    'SIGUNUSED'
  );
}
}(signals$2));

// Note: since nyc uses this module to output coverage, any lines
// that are in the direct sync flow of nyc's outputCoverage are
// ignored, since we can never get coverage for them.
// grab a reference to node's real process object right away
var process$1 = commonjsGlobal.process;
// some kind of non-node environment, just no-op
if (typeof process$1 !== 'object' || !process$1) {
  signalExit$1.exports = function () {};
} else {
  var assert$1 = require$$0__default["default"];
  var signals$1 = signals$2.exports;
  var isWin$2 = /^win/i.test(process$1.platform);

  var EE = require$$2__default["default"];
  /* istanbul ignore if */
  if (typeof EE !== 'function') {
    EE = EE.EventEmitter;
  }

  var emitter;
  if (process$1.__signal_exit_emitter__) {
    emitter = process$1.__signal_exit_emitter__;
  } else {
    emitter = process$1.__signal_exit_emitter__ = new EE();
    emitter.count = 0;
    emitter.emitted = {};
  }

  // Because this emitter is a global, we have to check to see if a
  // previous version of this library failed to enable infinite listeners.
  // I know what you're about to say.  But literally everything about
  // signal-exit is a compromise with evil.  Get used to it.
  if (!emitter.infinite) {
    emitter.setMaxListeners(Infinity);
    emitter.infinite = true;
  }

  signalExit$1.exports = function (cb, opts) {
    if (commonjsGlobal.process !== process$1) {
      return
    }
    assert$1.equal(typeof cb, 'function', 'a callback must be provided for exit handler');

    if (loaded === false) {
      load();
    }

    var ev = 'exit';
    if (opts && opts.alwaysLast) {
      ev = 'afterexit';
    }

    var remove = function () {
      emitter.removeListener(ev, cb);
      if (emitter.listeners('exit').length === 0 &&
          emitter.listeners('afterexit').length === 0) {
        unload();
      }
    };
    emitter.on(ev, cb);

    return remove
  };

  var unload = function unload () {
    if (!loaded || commonjsGlobal.process !== process$1) {
      return
    }
    loaded = false;

    signals$1.forEach(function (sig) {
      try {
        process$1.removeListener(sig, sigListeners[sig]);
      } catch (er) {}
    });
    process$1.emit = originalProcessEmit;
    process$1.reallyExit = originalProcessReallyExit;
    emitter.count -= 1;
  };
  signalExit$1.exports.unload = unload;

  var emit = function emit (event, code, signal) {
    if (emitter.emitted[event]) {
      return
    }
    emitter.emitted[event] = true;
    emitter.emit(event, code, signal);
  };

  // { <signal>: <listener fn>, ... }
  var sigListeners = {};
  signals$1.forEach(function (sig) {
    sigListeners[sig] = function listener () {
      if (process$1 !== commonjsGlobal.process) {
        return
      }
      // If there are no other listeners, an exit is coming!
      // Simplest way: remove us and then re-send the signal.
      // We know that this will kill the process, so we can
      // safely emit now.
      var listeners = process$1.listeners(sig);
      if (listeners.length === emitter.count) {
        unload();
        emit('exit', null, sig);
        /* istanbul ignore next */
        emit('afterexit', null, sig);
        /* istanbul ignore next */
        if (isWin$2 && sig === 'SIGHUP') {
          // "SIGHUP" throws an `ENOSYS` error on Windows,
          // so use a supported signal instead
          sig = 'SIGINT';
        }
        process$1.kill(process$1.pid, sig);
      }
    };
  });

  signalExit$1.exports.signals = function () {
    return signals$1
  };

  var loaded = false;

  var load = function load () {
    if (loaded || process$1 !== commonjsGlobal.process) {
      return
    }
    loaded = true;

    // This is the number of onSignalExit's that are in play.
    // It's important so that we can count the correct number of
    // listeners on signals, and don't wait for the other one to
    // handle it instead of us.
    emitter.count += 1;

    signals$1 = signals$1.filter(function (sig) {
      try {
        process$1.on(sig, sigListeners[sig]);
        return true
      } catch (er) {
        return false
      }
    });

    process$1.emit = processEmit;
    process$1.reallyExit = processReallyExit;
  };
  signalExit$1.exports.load = load;

  var originalProcessReallyExit = process$1.reallyExit;
  var processReallyExit = function processReallyExit (code) {
    if (process$1 !== commonjsGlobal.process) {
      return
    }
    process$1.exitCode = code || 0;
    emit('exit', process$1.exitCode, null);
    /* istanbul ignore next */
    emit('afterexit', process$1.exitCode, null);
    /* istanbul ignore next */
    originalProcessReallyExit.call(process$1, process$1.exitCode);
  };

  var originalProcessEmit = process$1.emit;
  var processEmit = function processEmit (ev, arg) {
    if (ev === 'exit' && process$1 === commonjsGlobal.process) {
      if (arg !== undefined) {
        process$1.exitCode = arg;
      }
      var ret = originalProcessEmit.apply(this, arguments);
      emit('exit', process$1.exitCode, null);
      /* istanbul ignore next */
      emit('afterexit', process$1.exitCode, null);
      return ret
    } else {
      return originalProcessEmit.apply(this, arguments)
    }
  };
}

const onetime$1 = onetime$3.exports;
const signalExit = signalExit$1.exports;

var restoreCursor = onetime$1(() => {
	signalExit(() => {
		process.stderr.write('\u001B[?25h');
	}, {alwaysLast: true});
});

(function (exports) {
const restoreCursor$1 = restoreCursor;

let isHidden = false;

exports.show = (writableStream = process.stderr) => {
	if (!writableStream.isTTY) {
		return;
	}

	isHidden = false;
	writableStream.write('\u001B[?25h');
};

exports.hide = (writableStream = process.stderr) => {
	if (!writableStream.isTTY) {
		return;
	}

	restoreCursor$1();
	isHidden = true;
	writableStream.write('\u001B[?25l');
};

exports.toggle = (force, writableStream) => {
	if (force !== undefined) {
		isHidden = force;
	}

	if (isHidden) {
		exports.show(writableStream);
	} else {
		exports.hide(writableStream);
	}
};
}(cliCursor$1));

const stringWidth$1 = stringWidth$4.exports;
const stripAnsi$1 = stripAnsi$3;
const ansiStyles$2 = ansiStyles$4.exports;

const ESCAPES$2 = new Set([
	'\u001B',
	'\u009B'
]);

const END_CODE$1 = 39;

const wrapAnsi$3 = code => `${ESCAPES$2.values().next().value}[${code}m`;

// Calculate the length of words split on ' ', ignoring
// the extra characters added by ansi escape codes
const wordLengths$1 = string => string.split(' ').map(character => stringWidth$1(character));

// Wrap a long word across multiple rows
// Ansi escape codes do not count towards length
const wrapWord$1 = (rows, word, columns) => {
	const characters = [...word];

	let isInsideEscape = false;
	let visible = stringWidth$1(stripAnsi$1(rows[rows.length - 1]));

	for (const [index, character] of characters.entries()) {
		const characterLength = stringWidth$1(character);

		if (visible + characterLength <= columns) {
			rows[rows.length - 1] += character;
		} else {
			rows.push(character);
			visible = 0;
		}

		if (ESCAPES$2.has(character)) {
			isInsideEscape = true;
		} else if (isInsideEscape && character === 'm') {
			isInsideEscape = false;
			continue;
		}

		if (isInsideEscape) {
			continue;
		}

		visible += characterLength;

		if (visible === columns && index < characters.length - 1) {
			rows.push('');
			visible = 0;
		}
	}

	// It's possible that the last row we copy over is only
	// ansi escape characters, handle this edge-case
	if (!visible && rows[rows.length - 1].length > 0 && rows.length > 1) {
		rows[rows.length - 2] += rows.pop();
	}
};

// Trims spaces from a string ignoring invisible sequences
const stringVisibleTrimSpacesRight$1 = str => {
	const words = str.split(' ');
	let last = words.length;

	while (last > 0) {
		if (stringWidth$1(words[last - 1]) > 0) {
			break;
		}

		last--;
	}

	if (last === words.length) {
		return str;
	}

	return words.slice(0, last).join(' ') + words.slice(last).join('');
};

// The wrap-ansi module can be invoked in either 'hard' or 'soft' wrap mode
//
// 'hard' will never allow a string to take up more than columns characters
//
// 'soft' allows long words to expand past the column length
const exec$1 = (string, columns, options = {}) => {
	if (options.trim !== false && string.trim() === '') {
		return '';
	}

	let pre = '';
	let ret = '';
	let escapeCode;

	const lengths = wordLengths$1(string);
	let rows = [''];

	for (const [index, word] of string.split(' ').entries()) {
		if (options.trim !== false) {
			rows[rows.length - 1] = rows[rows.length - 1].trimLeft();
		}

		let rowLength = stringWidth$1(rows[rows.length - 1]);

		if (index !== 0) {
			if (rowLength >= columns && (options.wordWrap === false || options.trim === false)) {
				// If we start with a new word but the current row length equals the length of the columns, add a new row
				rows.push('');
				rowLength = 0;
			}

			if (rowLength > 0 || options.trim === false) {
				rows[rows.length - 1] += ' ';
				rowLength++;
			}
		}

		// In 'hard' wrap mode, the length of a line is never allowed to extend past 'columns'
		if (options.hard && lengths[index] > columns) {
			const remainingColumns = (columns - rowLength);
			const breaksStartingThisLine = 1 + Math.floor((lengths[index] - remainingColumns - 1) / columns);
			const breaksStartingNextLine = Math.floor((lengths[index] - 1) / columns);
			if (breaksStartingNextLine < breaksStartingThisLine) {
				rows.push('');
			}

			wrapWord$1(rows, word, columns);
			continue;
		}

		if (rowLength + lengths[index] > columns && rowLength > 0 && lengths[index] > 0) {
			if (options.wordWrap === false && rowLength < columns) {
				wrapWord$1(rows, word, columns);
				continue;
			}

			rows.push('');
		}

		if (rowLength + lengths[index] > columns && options.wordWrap === false) {
			wrapWord$1(rows, word, columns);
			continue;
		}

		rows[rows.length - 1] += word;
	}

	if (options.trim !== false) {
		rows = rows.map(stringVisibleTrimSpacesRight$1);
	}

	pre = rows.join('\n');

	for (const [index, character] of [...pre].entries()) {
		ret += character;

		if (ESCAPES$2.has(character)) {
			const code = parseFloat(/\d[^m]*/.exec(pre.slice(index, index + 4)));
			escapeCode = code === END_CODE$1 ? null : code;
		}

		const code = ansiStyles$2.codes.get(Number(escapeCode));

		if (escapeCode && code) {
			if (pre[index + 1] === '\n') {
				ret += wrapAnsi$3(code);
			} else if (character === '\n') {
				ret += wrapAnsi$3(escapeCode);
			}
		}
	}

	return ret;
};

// For each newline, invoke the method separately
var wrapAnsi_1$1 = (string, columns, options) => {
	return String(string)
		.normalize()
		.replace(/\r\n/g, '\n')
		.split('\n')
		.map(line => exec$1(line, columns, options))
		.join('\n');
};

const isFullwidthCodePoint = isFullwidthCodePoint$4.exports;
const astralRegex = astralRegex_1;
const ansiStyles$1 = ansiStyles$4.exports;

const ESCAPES$1 = [
	'\u001B',
	'\u009B'
];

const wrapAnsi$2 = code => `${ESCAPES$1[0]}[${code}m`;

const checkAnsi = (ansiCodes, isEscapes, endAnsiCode) => {
	let output = [];
	ansiCodes = [...ansiCodes];

	for (let ansiCode of ansiCodes) {
		const ansiCodeOrigin = ansiCode;
		if (ansiCode.includes(';')) {
			ansiCode = ansiCode.split(';')[0][0] + '0';
		}

		const item = ansiStyles$1.codes.get(Number.parseInt(ansiCode, 10));
		if (item) {
			const indexEscape = ansiCodes.indexOf(item.toString());
			if (indexEscape === -1) {
				output.push(wrapAnsi$2(isEscapes ? item : ansiCodeOrigin));
			} else {
				ansiCodes.splice(indexEscape, 1);
			}
		} else if (isEscapes) {
			output.push(wrapAnsi$2(0));
			break;
		} else {
			output.push(wrapAnsi$2(ansiCodeOrigin));
		}
	}

	if (isEscapes) {
		output = output.filter((element, index) => output.indexOf(element) === index);

		if (endAnsiCode !== undefined) {
			const fistEscapeCode = wrapAnsi$2(ansiStyles$1.codes.get(Number.parseInt(endAnsiCode, 10)));
			output = output.reduce((current, next) => next === fistEscapeCode ? [next, ...current] : [...current, next], []);
		}
	}

	return output.join('');
};

var sliceAnsi$1 = (string, begin, end) => {
	const characters = [...string];
	const ansiCodes = [];

	let stringEnd = typeof end === 'number' ? end : characters.length;
	let isInsideEscape = false;
	let ansiCode;
	let visible = 0;
	let output = '';

	for (const [index, character] of characters.entries()) {
		let leftEscape = false;

		if (ESCAPES$1.includes(character)) {
			const code = /\d[^m]*/.exec(string.slice(index, index + 18));
			ansiCode = code && code.length > 0 ? code[0] : undefined;

			if (visible < stringEnd) {
				isInsideEscape = true;

				if (ansiCode !== undefined) {
					ansiCodes.push(ansiCode);
				}
			}
		} else if (isInsideEscape && character === 'm') {
			isInsideEscape = false;
			leftEscape = true;
		}

		if (!isInsideEscape && !leftEscape) {
			visible++;
		}

		if (!astralRegex({exact: true}).test(character) && isFullwidthCodePoint(character.codePointAt())) {
			visible++;

			if (typeof end !== 'number') {
				stringEnd++;
			}
		}

		if (visible > begin && visible <= stringEnd) {
			output += character;
		} else if (visible === begin && !isInsideEscape && ansiCode !== undefined) {
			output = checkAnsi(ansiCodes);
		} else if (visible >= stringEnd) {
			output += checkAnsi(ansiCodes, true, ansiCode);
			break;
		}
	}

	return output;
};

const ansiEscapes = ansiEscapes$1.exports;
const cliCursor = cliCursor$1;
const wrapAnsi$1 = wrapAnsi_1$1;
const sliceAnsi = sliceAnsi$1;

const defaultTerminalHeight = 24;

const getWidth = stream => {
	const {columns} = stream;

	if (!columns) {
		return 80;
	}

	return columns;
};

const fitToTerminalHeight = (stream, text) => {
	const terminalHeight = stream.rows || defaultTerminalHeight;
	const lines = text.split('\n');

	const toRemove = lines.length - terminalHeight;
	if (toRemove <= 0) {
		return text;
	}

	return sliceAnsi(
		text,
		lines.slice(0, toRemove).join('\n').length + 1,
		text.length);
};

const main$1 = (stream, {showCursor = false} = {}) => {
	let previousLineCount = 0;
	let previousWidth = getWidth(stream);
	let previousOutput = '';

	const render = (...args) => {
		if (!showCursor) {
			cliCursor.hide();
		}

		let output = args.join(' ') + '\n';
		output = fitToTerminalHeight(stream, output);
		const width = getWidth(stream);
		if (output === previousOutput && previousWidth === width) {
			return;
		}

		previousOutput = output;
		previousWidth = width;
		output = wrapAnsi$1(output, width, {
			trim: false,
			hard: true,
			wordWrap: false
		});
		stream.write(ansiEscapes.eraseLines(previousLineCount) + output);
		previousLineCount = output.split('\n').length;
	};

	render.clear = () => {
		stream.write(ansiEscapes.eraseLines(previousLineCount));
		previousOutput = '';
		previousWidth = getWidth(stream);
		previousLineCount = 0;
	};

	render.done = () => {
		previousOutput = '';
		previousWidth = getWidth(stream);
		previousLineCount = 0;

		if (!showCursor) {
			cliCursor.show();
		}
	};

	return render;
};

logUpdate$1.exports = main$1(process.stdout);
logUpdate$1.exports.stderr = main$1(process.stderr);
logUpdate$1.exports.create = main$1;

const stringWidth = stringWidth$4.exports;
const stripAnsi = stripAnsi$3;
const ansiStyles = ansiStyles$4.exports;

const ESCAPES = new Set([
	'\u001B',
	'\u009B'
]);

const END_CODE = 39;

const ANSI_ESCAPE_BELL = '\u0007';
const ANSI_CSI = '[';
const ANSI_OSC = ']';
const ANSI_SGR_TERMINATOR = 'm';
const ANSI_ESCAPE_LINK = `${ANSI_OSC}8;;`;

const wrapAnsi = code => `${ESCAPES.values().next().value}${ANSI_CSI}${code}${ANSI_SGR_TERMINATOR}`;
const wrapAnsiHyperlink = uri => `${ESCAPES.values().next().value}${ANSI_ESCAPE_LINK}${uri}${ANSI_ESCAPE_BELL}`;

// Calculate the length of words split on ' ', ignoring
// the extra characters added by ansi escape codes
const wordLengths = string => string.split(' ').map(character => stringWidth(character));

// Wrap a long word across multiple rows
// Ansi escape codes do not count towards length
const wrapWord = (rows, word, columns) => {
	const characters = [...word];

	let isInsideEscape = false;
	let isInsideLinkEscape = false;
	let visible = stringWidth(stripAnsi(rows[rows.length - 1]));

	for (const [index, character] of characters.entries()) {
		const characterLength = stringWidth(character);

		if (visible + characterLength <= columns) {
			rows[rows.length - 1] += character;
		} else {
			rows.push(character);
			visible = 0;
		}

		if (ESCAPES.has(character)) {
			isInsideEscape = true;
			isInsideLinkEscape = characters.slice(index + 1).join('').startsWith(ANSI_ESCAPE_LINK);
		}

		if (isInsideEscape) {
			if (isInsideLinkEscape) {
				if (character === ANSI_ESCAPE_BELL) {
					isInsideEscape = false;
					isInsideLinkEscape = false;
				}
			} else if (character === ANSI_SGR_TERMINATOR) {
				isInsideEscape = false;
			}

			continue;
		}

		visible += characterLength;

		if (visible === columns && index < characters.length - 1) {
			rows.push('');
			visible = 0;
		}
	}

	// It's possible that the last row we copy over is only
	// ansi escape characters, handle this edge-case
	if (!visible && rows[rows.length - 1].length > 0 && rows.length > 1) {
		rows[rows.length - 2] += rows.pop();
	}
};

// Trims spaces from a string ignoring invisible sequences
const stringVisibleTrimSpacesRight = string => {
	const words = string.split(' ');
	let last = words.length;

	while (last > 0) {
		if (stringWidth(words[last - 1]) > 0) {
			break;
		}

		last--;
	}

	if (last === words.length) {
		return string;
	}

	return words.slice(0, last).join(' ') + words.slice(last).join('');
};

// The wrap-ansi module can be invoked in either 'hard' or 'soft' wrap mode
//
// 'hard' will never allow a string to take up more than columns characters
//
// 'soft' allows long words to expand past the column length
const exec = (string, columns, options = {}) => {
	if (options.trim !== false && string.trim() === '') {
		return '';
	}

	let returnValue = '';
	let escapeCode;
	let escapeUrl;

	const lengths = wordLengths(string);
	let rows = [''];

	for (const [index, word] of string.split(' ').entries()) {
		if (options.trim !== false) {
			rows[rows.length - 1] = rows[rows.length - 1].trimStart();
		}

		let rowLength = stringWidth(rows[rows.length - 1]);

		if (index !== 0) {
			if (rowLength >= columns && (options.wordWrap === false || options.trim === false)) {
				// If we start with a new word but the current row length equals the length of the columns, add a new row
				rows.push('');
				rowLength = 0;
			}

			if (rowLength > 0 || options.trim === false) {
				rows[rows.length - 1] += ' ';
				rowLength++;
			}
		}

		// In 'hard' wrap mode, the length of a line is never allowed to extend past 'columns'
		if (options.hard && lengths[index] > columns) {
			const remainingColumns = (columns - rowLength);
			const breaksStartingThisLine = 1 + Math.floor((lengths[index] - remainingColumns - 1) / columns);
			const breaksStartingNextLine = Math.floor((lengths[index] - 1) / columns);
			if (breaksStartingNextLine < breaksStartingThisLine) {
				rows.push('');
			}

			wrapWord(rows, word, columns);
			continue;
		}

		if (rowLength + lengths[index] > columns && rowLength > 0 && lengths[index] > 0) {
			if (options.wordWrap === false && rowLength < columns) {
				wrapWord(rows, word, columns);
				continue;
			}

			rows.push('');
		}

		if (rowLength + lengths[index] > columns && options.wordWrap === false) {
			wrapWord(rows, word, columns);
			continue;
		}

		rows[rows.length - 1] += word;
	}

	if (options.trim !== false) {
		rows = rows.map(stringVisibleTrimSpacesRight);
	}

	const pre = [...rows.join('\n')];

	for (const [index, character] of pre.entries()) {
		returnValue += character;

		if (ESCAPES.has(character)) {
			const {groups} = new RegExp(`(?:\\${ANSI_CSI}(?<code>\\d+)m|\\${ANSI_ESCAPE_LINK}(?<uri>.*)${ANSI_ESCAPE_BELL})`).exec(pre.slice(index).join('')) || {groups: {}};
			if (groups.code !== undefined) {
				const code = Number.parseFloat(groups.code);
				escapeCode = code === END_CODE ? undefined : code;
			} else if (groups.uri !== undefined) {
				escapeUrl = groups.uri.length === 0 ? undefined : groups.uri;
			}
		}

		const code = ansiStyles.codes.get(Number(escapeCode));

		if (pre[index + 1] === '\n') {
			if (escapeUrl) {
				returnValue += wrapAnsiHyperlink('');
			}

			if (escapeCode && code) {
				returnValue += wrapAnsi(code);
			}
		} else if (character === '\n') {
			if (escapeCode && code) {
				returnValue += wrapAnsi(escapeCode);
			}

			if (escapeUrl) {
				returnValue += wrapAnsiHyperlink(escapeUrl);
			}
		}
	}

	return returnValue;
};

// For each newline, invoke the method separately
var wrapAnsi_1 = (string, columns, options) => {
	return String(string)
		.normalize()
		.replace(/\r\n/g, '\n')
		.split('\n')
		.map(line => exec(line, columns, options))
		.join('\n');
};

var colorette$1 = {};

var colorette = {};

Object.defineProperty(colorette, '__esModule', { value: true });

var tty = require$$0__default$1["default"];

function _interopNamespace$1(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

var tty__namespace = /*#__PURE__*/_interopNamespace$1(tty);

const env = process.env || {};
const argv = process.argv || [];

const isDisabled = "NO_COLOR" in env || argv.includes("--no-color");
const isForced = "FORCE_COLOR" in env || argv.includes("--color");
const isWindows$2 = process.platform === "win32";

const isCompatibleTerminal =
  tty__namespace && tty__namespace.isatty && tty__namespace.isatty(1) && env.TERM && env.TERM !== "dumb";

const isCI =
  "CI" in env &&
  ("GITHUB_ACTIONS" in env || "GITLAB_CI" in env || "CIRCLECI" in env);

const isColorSupported =
  !isDisabled && (isForced || isWindows$2 || isCompatibleTerminal || isCI);

const replaceClose = (
  index,
  string,
  close,
  replace,
  head = string.substring(0, index) + replace,
  tail = string.substring(index + close.length),
  next = tail.indexOf(close)
) => head + (next < 0 ? tail : replaceClose(next, tail, close, replace));

const clearBleed = (index, string, open, close, replace) =>
  index < 0
    ? open + string + close
    : open + replaceClose(index, string, close, replace) + close;

const filterEmpty =
  (open, close, replace = open, at = open.length + 1) =>
  (string) =>
    string || !(string === "" || string === undefined)
      ? clearBleed(
          ("" + string).indexOf(close, at),
          string,
          open,
          close,
          replace
        )
      : "";

const init = (open, close, replace) =>
  filterEmpty(`\x1b[${open}m`, `\x1b[${close}m`, replace);

const colors = {
  reset: init(0, 0),
  bold: init(1, 22, "\x1b[22m\x1b[1m"),
  dim: init(2, 22, "\x1b[22m\x1b[2m"),
  italic: init(3, 23),
  underline: init(4, 24),
  inverse: init(7, 27),
  hidden: init(8, 28),
  strikethrough: init(9, 29),
  black: init(30, 39),
  red: init(31, 39),
  green: init(32, 39),
  yellow: init(33, 39),
  blue: init(34, 39),
  magenta: init(35, 39),
  cyan: init(36, 39),
  white: init(37, 39),
  gray: init(90, 39),
  bgBlack: init(40, 49),
  bgRed: init(41, 49),
  bgGreen: init(42, 49),
  bgYellow: init(43, 49),
  bgBlue: init(44, 49),
  bgMagenta: init(45, 49),
  bgCyan: init(46, 49),
  bgWhite: init(47, 49),
  blackBright: init(90, 39),
  redBright: init(91, 39),
  greenBright: init(92, 39),
  yellowBright: init(93, 39),
  blueBright: init(94, 39),
  magentaBright: init(95, 39),
  cyanBright: init(96, 39),
  whiteBright: init(97, 39),
  bgBlackBright: init(100, 49),
  bgRedBright: init(101, 49),
  bgGreenBright: init(102, 49),
  bgYellowBright: init(103, 49),
  bgBlueBright: init(104, 49),
  bgMagentaBright: init(105, 49),
  bgCyanBright: init(106, 49),
  bgWhiteBright: init(107, 49),
};

const none = (any) => any;

const createColors = ({ useColor = isColorSupported } = {}) =>
  useColor
    ? colors
    : Object.keys(colors).reduce(
        (colors, key) => ({ ...colors, [key]: none }),
        {}
      );

const {
  reset,
  bold,
  dim,
  italic,
  underline,
  inverse,
  hidden,
  strikethrough,
  black,
  red,
  green,
  yellow,
  blue,
  magenta,
  cyan,
  white,
  gray,
  bgBlack,
  bgRed,
  bgGreen,
  bgYellow,
  bgBlue,
  bgMagenta,
  bgCyan,
  bgWhite,
  blackBright,
  redBright,
  greenBright,
  yellowBright,
  blueBright,
  magentaBright,
  cyanBright,
  whiteBright,
  bgBlackBright,
  bgRedBright,
  bgGreenBright,
  bgYellowBright,
  bgBlueBright,
  bgMagentaBright,
  bgCyanBright,
  bgWhiteBright,
} = createColors();

colorette.bgBlack = bgBlack;
colorette.bgBlackBright = bgBlackBright;
colorette.bgBlue = bgBlue;
colorette.bgBlueBright = bgBlueBright;
colorette.bgCyan = bgCyan;
colorette.bgCyanBright = bgCyanBright;
colorette.bgGreen = bgGreen;
colorette.bgGreenBright = bgGreenBright;
colorette.bgMagenta = bgMagenta;
colorette.bgMagentaBright = bgMagentaBright;
colorette.bgRed = bgRed;
colorette.bgRedBright = bgRedBright;
colorette.bgWhite = bgWhite;
colorette.bgWhiteBright = bgWhiteBright;
colorette.bgYellow = bgYellow;
colorette.bgYellowBright = bgYellowBright;
colorette.black = black;
colorette.blackBright = blackBright;
colorette.blue = blue;
colorette.blueBright = blueBright;
colorette.bold = bold;
colorette.createColors = createColors;
colorette.cyan = cyan;
colorette.cyanBright = cyanBright;
colorette.dim = dim;
colorette.gray = gray;
colorette.green = green;
colorette.greenBright = greenBright;
colorette.hidden = hidden;
colorette.inverse = inverse;
colorette.isColorSupported = isColorSupported;
colorette.italic = italic;
colorette.magenta = magenta;
colorette.magentaBright = magentaBright;
colorette.red = red;
colorette.redBright = redBright;
colorette.reset = reset;
colorette.strikethrough = strikethrough;
colorette.underline = underline;
colorette.white = white;
colorette.whiteBright = whiteBright;
colorette.yellow = yellow;
colorette.yellowBright = yellowBright;

var _a;
Object.defineProperty(colorette$1, "__esModule", { value: true });
const colorette_1$3 = colorette;
colorette$1.default = (0, colorette_1$3.createColors)({ useColor: ((_a = process.env) === null || _a === void 0 ? void 0 : _a.LISTR_DISABLE_COLOR) !== '1' });

var figures = {};

var isUnicodeSupported$1 = {};

Object.defineProperty(isUnicodeSupported$1, "__esModule", { value: true });
isUnicodeSupported$1.isUnicodeSupported = void 0;
function isUnicodeSupported() {
    if (process.platform !== 'win32') {
        return true;
    }
    /* istanbul ignore next */
    return (Boolean(process.env.CI) || Boolean(process.env.WT_SESSION) || process.env.TERM_PROGRAM === 'vscode' || process.env.TERM === 'xterm-256color' || process.env.TERM === 'alacritty');
}
isUnicodeSupported$1.isUnicodeSupported = isUnicodeSupported;

Object.defineProperty(figures, "__esModule", { value: true });
figures.figures = void 0;
const is_unicode_supported_1$1 = isUnicodeSupported$1;
const FIGURES_MAIN = {
    warning: '⚠',
    cross: '✖',
    arrowDown: '↓',
    tick: '✔',
    arrowRight: '→',
    pointer: '❯',
    checkboxOn: '☒',
    arrowLeft: '←',
    squareSmallFilled: '◼',
    pointerSmall: '›'
};
const FIGURES_FALLBACK = {
    ...FIGURES_MAIN,
    warning: '‼',
    cross: '×',
    tick: '√',
    pointer: '>',
    checkboxOn: '[×]',
    squareSmallFilled: '■'
};
figures.figures = (0, is_unicode_supported_1$1.isUnicodeSupported)() ? FIGURES_MAIN : FIGURES_FALLBACK;

var indentString$1 = {};

Object.defineProperty(indentString$1, "__esModule", { value: true });
indentString$1.indentString = void 0;
function indentString(string, count) {
    return string.replace(/^(?!\s*$)/gm, ' '.repeat(count));
}
indentString$1.indentString = indentString;

var parseTime = {};

Object.defineProperty(parseTime, "__esModule", { value: true });
parseTime.parseTaskTime = void 0;
function parseTaskTime(duration) {
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    let parsedTime;
    if (seconds === 0 && minutes === 0) {
        parsedTime = `0.${Math.floor(duration / 100)}s`;
    }
    if (seconds > 0) {
        parsedTime = `${seconds % 60}s`;
    }
    if (minutes > 0) {
        parsedTime = `${minutes}m${parsedTime}`;
    }
    return parsedTime;
}
parseTime.parseTaskTime = parseTaskTime;

Object.defineProperty(default_renderer, "__esModule", { value: true });
default_renderer.DefaultRenderer = void 0;
const cliTruncate = cliTruncate$1;
const logUpdate = logUpdate$1.exports;
const os_1$1 = require$$1__default["default"];
const cliWrap = wrapAnsi_1;
const colorette_1$2 = colorette$1;
const figures_1$2 = figures;
const indent_string_1 = indentString$1;
const is_unicode_supported_1 = isUnicodeSupported$1;
const parse_time_1$1 = parseTime;
/** Default updating renderer for Listr2 */
class DefaultRenderer {
    constructor(tasks, options, renderHook$) {
        this.tasks = tasks;
        this.options = options;
        this.renderHook$ = renderHook$;
        this.bottomBar = {};
        this.spinner = !(0, is_unicode_supported_1.isUnicodeSupported)() ? ['-', '\\', '|', '/'] : ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
        this.spinnerPosition = 0;
        this.options = { ...DefaultRenderer.rendererOptions, ...this.options };
    }
    getTaskOptions(task) {
        return { ...DefaultRenderer.rendererTaskOptions, ...task.rendererTaskOptions };
    }
    isBottomBar(task) {
        const bottomBar = this.getTaskOptions(task).bottomBar;
        return typeof bottomBar === 'number' && bottomBar !== 0 || typeof bottomBar === 'boolean' && bottomBar !== false;
    }
    hasPersistentOutput(task) {
        return this.getTaskOptions(task).persistentOutput === true;
    }
    hasTimer(task) {
        return this.getTaskOptions(task).showTimer === true;
    }
    getSelfOrParentOption(task, key) {
        var _a, _b, _c;
        return (_b = (_a = task === null || task === void 0 ? void 0 : task.rendererOptions) === null || _a === void 0 ? void 0 : _a[key]) !== null && _b !== void 0 ? _b : (_c = this.options) === null || _c === void 0 ? void 0 : _c[key];
    }
    /* istanbul ignore next */
    getTaskTime(task) {
        return colorette_1$2.default.dim(`[${(0, parse_time_1$1.parseTaskTime)(task.message.duration)}]`);
    }
    createRender(options) {
        options = {
            ...{
                tasks: true,
                bottomBar: true,
                prompt: true
            },
            ...options
        };
        const render = [];
        const renderTasks = this.multiLineRenderer(this.tasks);
        const renderBottomBar = this.renderBottomBar();
        const renderPrompt = this.renderPrompt();
        if (options.tasks && (renderTasks === null || renderTasks === void 0 ? void 0 : renderTasks.trim().length) > 0) {
            render.push(renderTasks);
        }
        if (options.bottomBar && (renderBottomBar === null || renderBottomBar === void 0 ? void 0 : renderBottomBar.trim().length) > 0) {
            render.push((render.length > 0 ? os_1$1.EOL : '') + renderBottomBar);
        }
        if (options.prompt && (renderPrompt === null || renderPrompt === void 0 ? void 0 : renderPrompt.trim().length) > 0) {
            render.push((render.length > 0 ? os_1$1.EOL : '') + renderPrompt);
        }
        return render.length > 0 ? render.join(os_1$1.EOL) : '';
    }
    render() {
        var _a;
        // Do not render if we are already rendering
        if (this.id) {
            return;
        }
        const updateRender = () => logUpdate(this.createRender());
        /* istanbul ignore if */
        if (!((_a = this.options) === null || _a === void 0 ? void 0 : _a.lazy)) {
            this.id = setInterval(() => {
                this.spinnerPosition = ++this.spinnerPosition % this.spinner.length;
                updateRender();
            }, 100);
        }
        this.renderHook$.subscribe(() => {
            updateRender();
        });
    }
    end() {
        clearInterval(this.id);
        if (this.id) {
            this.id = undefined;
        }
        // clear log updater
        logUpdate.clear();
        logUpdate.done();
        // directly write to process.stdout, since logupdate only can update the seen height of terminal
        if (!this.options.clearOutput) {
            process.stdout.write(this.createRender({ prompt: false }) + os_1$1.EOL);
        }
    }
    // eslint-disable-next-line
    multiLineRenderer(tasks, level = 0) {
        var _a, _b;
        let output = [];
        for (const task of tasks) {
            if (task.isEnabled()) {
                // Current Task Title
                if (task.hasTitle()) {
                    if (!(tasks.some((task) => task.hasFailed()) && !task.hasFailed() && task.options.exitOnError !== false && !(task.isCompleted() || task.isSkipped()))) {
                        // if task is skipped
                        if (task.hasFailed() && this.getSelfOrParentOption(task, 'collapseErrors')) {
                            // current task title and skip change the title
                            output = [
                                ...output,
                                this.formatString(!task.hasSubtasks() && task.message.error && this.getSelfOrParentOption(task, 'showErrorMessage') ? task.message.error : task.title, this.getSymbol(task), level)
                            ];
                        }
                        else if (task.isSkipped() && this.getSelfOrParentOption(task, 'collapseSkips')) {
                            // current task title and skip change the title
                            output = [
                                ...output,
                                this.formatString(this.addSuffixToMessage(task.message.skip && this.getSelfOrParentOption(task, 'showSkipMessage') ? task.message.skip : task.title, 'SKIPPED', this.getSelfOrParentOption(task, 'suffixSkips')), this.getSymbol(task), level)
                            ];
                        }
                        else if (task.isRetrying() && this.getSelfOrParentOption(task, 'suffixRetries')) {
                            output = [...output, this.formatString(this.addSuffixToMessage(task.title, `RETRYING-${task.message.retry.count}`), this.getSymbol(task), level)];
                        }
                        else if (task.isCompleted() && task.hasTitle() && (this.getSelfOrParentOption(task, 'showTimer') || this.hasTimer(task))) {
                            // task with timer
                            output = [...output, this.formatString(`${task === null || task === void 0 ? void 0 : task.title} ${this.getTaskTime(task)}`, this.getSymbol(task), level)];
                        }
                        else {
                            // normal state
                            output = [...output, this.formatString(task.title, this.getSymbol(task), level)];
                        }
                    }
                    else {
                        // some sibling task but self has failed and this has stopped
                        output = [...output, this.formatString(task.title, colorette_1$2.default.red(figures_1$2.figures.squareSmallFilled), level)];
                    }
                }
                // task should not have subtasks since subtasks will handle the error already
                // maybe it is a better idea to show the error or skip messages when show subtasks is disabled.
                if (!task.hasSubtasks() || !this.getSelfOrParentOption(task, 'showSubtasks')) {
                    // without the collapse option for skip and errors
                    if (task.hasFailed() &&
                        this.getSelfOrParentOption(task, 'collapseErrors') === false &&
                        (this.getSelfOrParentOption(task, 'showErrorMessage') || !this.getSelfOrParentOption(task, 'showSubtasks'))) {
                        // show skip data if collapsing is not defined
                        output = [...output, this.dumpData(task, level, 'error')];
                    }
                    else if (task.isSkipped() &&
                        this.getSelfOrParentOption(task, 'collapseSkips') === false &&
                        (this.getSelfOrParentOption(task, 'showSkipMessage') || !this.getSelfOrParentOption(task, 'showSubtasks'))) {
                        // show skip data if collapsing is not defined
                        output = [...output, this.dumpData(task, level, 'skip')];
                    }
                }
                // Current Task Output
                if (task === null || task === void 0 ? void 0 : task.output) {
                    if ((task.isPending() || task.isRetrying() || task.isRollingBack()) && task.isPrompt()) {
                        // data output to prompt bar if prompt
                        this.promptBar = task.output;
                    }
                    else if (this.isBottomBar(task) || !task.hasTitle()) {
                        // data output to bottom bar
                        const data = [this.dumpData(task, -1)];
                        // create new if there is no persistent storage created for bottom bar
                        if (!this.bottomBar[task.id]) {
                            this.bottomBar[task.id] = {};
                            this.bottomBar[task.id].data = [];
                            const bottomBar = this.getTaskOptions(task).bottomBar;
                            if (typeof bottomBar === 'boolean') {
                                this.bottomBar[task.id].items = 1;
                            }
                            else {
                                this.bottomBar[task.id].items = bottomBar;
                            }
                        }
                        // persistent bottom bar and limit items in it
                        if (!((_b = (_a = this.bottomBar[task.id]) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.some((element) => data.includes(element))) && !task.isSkipped()) {
                            this.bottomBar[task.id].data = [...this.bottomBar[task.id].data, ...data];
                        }
                    }
                    else if (task.isPending() || task.isRetrying() || task.isRollingBack() || this.hasPersistentOutput(task)) {
                        // keep output if persistent output is set
                        output = [...output, this.dumpData(task, level)];
                    }
                }
                // render subtasks, some complicated conditionals going on
                if (
                // check if renderer option is on first
                this.getSelfOrParentOption(task, 'showSubtasks') !== false &&
                    // if it doesnt have subtasks no need to check
                    task.hasSubtasks() &&
                    (task.isPending() ||
                        task.hasFailed() ||
                        task.isCompleted() && !task.hasTitle() ||
                        // have to be completed and have subtasks
                        task.isCompleted() && this.getSelfOrParentOption(task, 'collapse') === false && !task.subtasks.some((subtask) => subtask.rendererOptions.collapse === true) ||
                        // if any of the subtasks have the collapse option of
                        task.subtasks.some((subtask) => subtask.rendererOptions.collapse === false) ||
                        // if any of the subtasks has failed
                        task.subtasks.some((subtask) => subtask.hasFailed()) ||
                        // if any of the subtasks rolled back
                        task.subtasks.some((subtask) => subtask.hasRolledBack()))) {
                    // set level
                    const subtaskLevel = !task.hasTitle() ? level : level + 1;
                    // render the subtasks as in the same way
                    const subtaskRender = this.multiLineRenderer(task.subtasks, subtaskLevel);
                    if ((subtaskRender === null || subtaskRender === void 0 ? void 0 : subtaskRender.trim()) !== '' && !task.subtasks.every((subtask) => !subtask.hasTitle())) {
                        output = [...output, subtaskRender];
                    }
                }
                // after task is finished actions
                if (task.isCompleted() || task.hasFailed() || task.isSkipped() || task.hasRolledBack()) {
                    // clean up prompts
                    this.promptBar = null;
                    // clean up bottom bar items if not indicated otherwise
                    if (!this.hasPersistentOutput(task)) {
                        delete this.bottomBar[task.id];
                    }
                }
            }
        }
        output = output.filter(Boolean);
        if (output.length > 0) {
            return output.join(os_1$1.EOL);
        }
        else {
            return;
        }
    }
    renderBottomBar() {
        // parse through all objects return only the last mentioned items
        if (Object.keys(this.bottomBar).length > 0) {
            this.bottomBar = Object.keys(this.bottomBar).reduce((o, key) => {
                if (!(o === null || o === void 0 ? void 0 : o[key])) {
                    o[key] = {};
                }
                o[key] = this.bottomBar[key];
                this.bottomBar[key].data = this.bottomBar[key].data.slice(-this.bottomBar[key].items);
                o[key].data = this.bottomBar[key].data;
                return o;
            }, {});
            return Object.values(this.bottomBar)
                .reduce((o, value) => o = [...o, ...value.data], [])
                .filter(Boolean)
                .join(os_1$1.EOL);
        }
    }
    renderPrompt() {
        if (this.promptBar) {
            return this.promptBar;
        }
    }
    dumpData(task, level, source = 'output') {
        let data;
        switch (source) {
            case 'output':
                data = task.output;
                break;
            case 'skip':
                data = task.message.skip;
                break;
            case 'error':
                data = task.message.error;
                break;
        }
        // dont return anything on some occasions
        if (task.hasTitle() && source === 'error' && data === task.title) {
            return;
        }
        if (typeof data === 'string') {
            return this.formatString(data, this.getSymbol(task, true), level + 1);
        }
    }
    formatString(str, icon, level) {
        // we dont like empty data around here
        if (str.trim() === '') {
            return;
        }
        str = `${icon} ${str}`;
        let parsedStr;
        let columns = process.stdout.columns ? process.stdout.columns : 80;
        columns = columns - level * this.options.indentation - 2;
        switch (this.options.formatOutput) {
            case 'truncate':
                parsedStr = str.split(os_1$1.EOL).map((s, i) => {
                    return cliTruncate(this.indentMultilineOutput(s, i), columns);
                });
                break;
            case 'wrap':
                parsedStr = cliWrap(str, columns, { hard: true })
                    .split(os_1$1.EOL)
                    .map((s, i) => this.indentMultilineOutput(s, i));
                break;
            default:
                throw new Error('Format option for the renderer is wrong.');
        }
        // this removes the empty lines
        if (this.options.removeEmptyLines) {
            parsedStr = parsedStr.filter(Boolean);
        }
        return (0, indent_string_1.indentString)(parsedStr.join(os_1$1.EOL), level * this.options.indentation);
    }
    indentMultilineOutput(str, i) {
        return i > 0 ? (0, indent_string_1.indentString)(str.trim(), 2) : str.trim();
    }
    // eslint-disable-next-line complexity
    getSymbol(task, data = false) {
        var _a, _b, _c;
        if (task.isPending() && !data) {
            return ((_a = this.options) === null || _a === void 0 ? void 0 : _a.lazy) || this.getSelfOrParentOption(task, 'showSubtasks') !== false && task.hasSubtasks() && !task.subtasks.every((subtask) => !subtask.hasTitle())
                ? colorette_1$2.default.yellow(figures_1$2.figures.pointer)
                : colorette_1$2.default.yellowBright(this.spinner[this.spinnerPosition]);
        }
        else if (task.isCompleted() && !data) {
            return task.hasSubtasks() && task.subtasks.some((subtask) => subtask.hasFailed()) ? colorette_1$2.default.yellow(figures_1$2.figures.warning) : colorette_1$2.default.green(figures_1$2.figures.tick);
        }
        else if (task.isRetrying() && !data) {
            return ((_b = this.options) === null || _b === void 0 ? void 0 : _b.lazy) ? colorette_1$2.default.yellow(figures_1$2.figures.warning) : colorette_1$2.default.yellow(this.spinner[this.spinnerPosition]);
        }
        else if (task.isRollingBack() && !data) {
            return ((_c = this.options) === null || _c === void 0 ? void 0 : _c.lazy) ? colorette_1$2.default.red(figures_1$2.figures.warning) : colorette_1$2.default.red(this.spinner[this.spinnerPosition]);
        }
        else if (task.hasRolledBack() && !data) {
            return colorette_1$2.default.red(figures_1$2.figures.arrowLeft);
        }
        else if (task.hasFailed() && !data) {
            return task.hasSubtasks() ? colorette_1$2.default.red(figures_1$2.figures.pointer) : colorette_1$2.default.red(figures_1$2.figures.cross);
        }
        else if (task.isSkipped() && !data && this.getSelfOrParentOption(task, 'collapseSkips') === false) {
            return colorette_1$2.default.yellow(figures_1$2.figures.warning);
        }
        else if (task.isSkipped() && (data || this.getSelfOrParentOption(task, 'collapseSkips'))) {
            return colorette_1$2.default.yellow(figures_1$2.figures.arrowDown);
        }
        return !data ? colorette_1$2.default.dim(figures_1$2.figures.squareSmallFilled) : figures_1$2.figures.pointerSmall;
    }
    addSuffixToMessage(message, suffix, condition) {
        return (condition !== null && condition !== void 0 ? condition : true) ? message + colorette_1$2.default.dim(` [${suffix}]`) : message;
    }
}
default_renderer.DefaultRenderer = DefaultRenderer;
/** designates whether this renderer can output to a non-tty console */
DefaultRenderer.nonTTY = false;
/** renderer options for the defauult renderer */
DefaultRenderer.rendererOptions = {
    indentation: 2,
    clearOutput: false,
    showSubtasks: true,
    collapse: true,
    collapseSkips: true,
    showSkipMessage: true,
    suffixSkips: true,
    collapseErrors: true,
    showErrorMessage: true,
    suffixRetries: true,
    lazy: false,
    showTimer: false,
    removeEmptyLines: true,
    formatOutput: 'truncate'
};

var silent_renderer = {};

Object.defineProperty(silent_renderer, "__esModule", { value: true });
silent_renderer.SilentRenderer = void 0;
class SilentRenderer {
    constructor(tasks, options) {
        this.tasks = tasks;
        this.options = options;
    }
    render() { }
    end() { }
}
silent_renderer.SilentRenderer = SilentRenderer;
/** designates whether this renderer can output to a non-tty console */
SilentRenderer.nonTTY = true;

var simple_renderer = {};

Object.defineProperty(simple_renderer, "__esModule", { value: true });
simple_renderer.SimpleRenderer = void 0;
const log_update_1 = logUpdate$1.exports;
const os_1 = require$$1__default["default"];
const event_constants_1$3 = event_constants;
const colorette_1$1 = colorette$1;
const figures_1$1 = figures;
/**
 * This is the default renderer which is neither verbose or updating.
 * It provides short output like update renderer, but does not disturb
 * stdin during execution of listr tasks
 */
class SimpleRenderer {
    constructor(tasks, options) {
        this.tasks = tasks;
        this.options = options;
        /**
         * Event type renderer map contains functions to process different task events
         */
        this.eventTypeRendererMap = {
            [event_constants_1$3.ListrEventType.SUBTASK]: (task) => {
                if (task.hasTitle()) {
                    // if Task has subtasks where we want to log the group indication
                    this.log(`${colorette_1$1.default.blue(figures_1$1.figures.pointer)} ${task.title}`);
                }
                if (task.hasSubtasks()) {
                    this.render(task.subtasks);
                }
            },
            [event_constants_1$3.ListrEventType.STATE]: (task) => {
                if (task.isCompleted() && task.hasTitle()) {
                    // The title is only logged at the end of the task execution
                    this.log(`${colorette_1$1.default.green(figures_1$1.figures.tick)} ${task.title}`);
                }
            },
            [event_constants_1$3.ListrEventType.DATA]: (task, event) => {
                // ! This is where it gets dirty
                // * We want the prompt to stay visible after confirmation
                if (task.isPrompt() && !String(event.data).match(/^\n$/)) {
                    (0, log_update_1.stderr)(`${event.data}`);
                }
                else {
                    this.log(`${figures_1$1.figures.pointerSmall} ${event.data}`);
                }
            },
            [event_constants_1$3.ListrEventType.MESSAGE]: (task, event) => {
                if (event.data.error) {
                    // error message
                    const title = SimpleRenderer.formatTitle(task);
                    this.log(`${colorette_1$1.default.red(figures_1$1.figures.cross)}${title}: ${event.data.error}`);
                }
                else if (event.data.skip) {
                    // Skip message
                    const title = SimpleRenderer.formatTitle(task);
                    const skip = task.title !== event.data.skip ? `: ${event.data.skip}` : '';
                    this.log(`${colorette_1$1.default.yellow(figures_1$1.figures.arrowDown)}${title} [${colorette_1$1.default.yellow(`skipped${skip}`)}]`);
                }
                else if (event.data.rollback) {
                    // rollback message
                    const title = SimpleRenderer.formatTitle(task);
                    this.log(`${colorette_1$1.default.red(figures_1$1.figures.arrowLeft)}${title}: ${event.data.rollback}`);
                }
                else if (event.data.retry) {
                    // Retry Message
                    const title = SimpleRenderer.formatTitle(task);
                    this.log(`[${colorette_1$1.default.yellow(`${event.data.retry.count}`)}]${title}`);
                }
            }
            // * We do not log out initial title. Only the final one.
            // [ListrEventType.TITLE]: (t, e) => this.renderTitle(t, e),
        };
        this.options = { ...SimpleRenderer.rendererOptions, ...options };
    }
    // This is used for mocks, since mocking Date is cumbesome
    static now() {
        return new Date();
    }
    // Used to sanitize title output
    static formatTitle(task) {
        return (task === null || task === void 0 ? void 0 : task.title) ? ` ${task.title}` : '';
    }
    // Writes sanitized output
    log(output) {
        const logOut = (msg) => {
            // Need appent \n to mimic console.log
            process[this.options.output].write(msg.endsWith(os_1.EOL) ? msg : `${msg}${os_1.EOL}`);
        };
        if (!this.options.prefixWithTimestamp) {
            logOut(`${output}`);
            return;
        }
        const now = SimpleRenderer.now();
        const timestamp = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0') + ':' + String(now.getSeconds()).padStart(2, '0');
        logOut(`${colorette_1$1.default.dim(`[${timestamp}]`)} ${output}`);
    }
    // eslint-disable-next-line
    end() { }
    // yes this is a misuse :)
    render(tasks) {
        if (tasks === null || tasks === void 0 ? void 0 : tasks.length) {
            tasks.forEach((task) => {
                task.subscribe((event) => {
                    var _a, _b;
                    // Here event type will match event.type anyway
                    (_b = (_a = this.eventTypeRendererMap)[event.type]) === null || _b === void 0 ? void 0 : _b.call(_a, task, event);
                }, this.log);
            });
        }
        else {
            this.render(this.tasks);
        }
    }
}
simple_renderer.SimpleRenderer = SimpleRenderer;
// Designate this renderer as tty or nonTTY
SimpleRenderer.nonTTY = true;
// designate your renderer options that will be showed inside the `ListrOptions` as rendererOptions
SimpleRenderer.rendererOptions = { prefixWithTimestamp: false, output: 'stdout' };

var verbose_renderer = {};

var logger$1 = {};

var logger_constants = {};

(function (exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevels = void 0;
(function (LogLevels) {
    LogLevels["SILENT"] = "SILENT";
    LogLevels["FAILED"] = "FAILED";
    LogLevels["SKIPPED"] = "SKIPPED";
    LogLevels["SUCCESS"] = "SUCCESS";
    LogLevels["DATA"] = "DATA";
    LogLevels["STARTED"] = "STARTED";
    LogLevels["TITLE"] = "TITLE";
    LogLevels["RETRY"] = "RETRY";
    LogLevels["ROLLBACK"] = "ROLLBACK";
})(exports.LogLevels || (exports.LogLevels = {}));
}(logger_constants));

Object.defineProperty(logger$1, "__esModule", { value: true });
logger$1.Logger = void 0;
/* eslint-disable no-console */
const figures_1 = figures;
const logger_constants_1 = logger_constants;
const colorette_1 = colorette$1;
/**
 * A internal logger for using in the verbose renderer mostly.
 */
class Logger$2 {
    constructor(options) {
        this.options = options;
    }
    fail(message) {
        message = this.parseMessage(logger_constants_1.LogLevels.FAILED, message);
        console.error(message);
    }
    skip(message) {
        message = this.parseMessage(logger_constants_1.LogLevels.SKIPPED, message);
        console.info(message);
    }
    success(message) {
        message = this.parseMessage(logger_constants_1.LogLevels.SUCCESS, message);
        console.log(message);
    }
    data(message) {
        message = this.parseMessage(logger_constants_1.LogLevels.DATA, message);
        console.info(message);
    }
    start(message) {
        message = this.parseMessage(logger_constants_1.LogLevels.STARTED, message);
        console.log(message);
    }
    title(message) {
        message = this.parseMessage(logger_constants_1.LogLevels.TITLE, message);
        console.info(message);
    }
    retry(message) {
        message = this.parseMessage(logger_constants_1.LogLevels.RETRY, message);
        console.warn(message);
    }
    rollback(message) {
        message = this.parseMessage(logger_constants_1.LogLevels.ROLLBACK, message);
        console.warn(message);
    }
    parseMessage(level, message) {
        // parse multi line messages
        let multiLineMessage;
        try {
            multiLineMessage = message.split('\n');
        }
        catch /* istanbul ignore next */ {
            multiLineMessage = [message];
        }
        multiLineMessage = multiLineMessage.map((msg) => {
            // format messages
            return this.logColoring({
                level,
                message: msg
            });
        });
        // join back multi line messages
        message = multiLineMessage.join('\n');
        return message;
    }
    logColoring({ level, message }) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        let icon;
        // do the coloring
        let coloring = (input) => {
            return input;
        };
        switch (level) {
            case logger_constants_1.LogLevels.FAILED:
                /* istanbul ignore if */
                if ((_a = this.options) === null || _a === void 0 ? void 0 : _a.useIcons) {
                    coloring = colorette_1.default.red;
                    icon = figures_1.figures.cross;
                }
                else {
                    icon = this.wrapInBrackets(level);
                }
                break;
            case logger_constants_1.LogLevels.SKIPPED:
                /* istanbul ignore if */
                if ((_b = this.options) === null || _b === void 0 ? void 0 : _b.useIcons) {
                    coloring = colorette_1.default.yellow;
                    icon = figures_1.figures.arrowDown;
                }
                else {
                    icon = this.wrapInBrackets(level);
                }
                break;
            case logger_constants_1.LogLevels.SUCCESS:
                /* istanbul ignore if */
                if ((_c = this.options) === null || _c === void 0 ? void 0 : _c.useIcons) {
                    coloring = colorette_1.default.green;
                    icon = figures_1.figures.tick;
                }
                else {
                    icon = this.wrapInBrackets(level);
                }
                break;
            case logger_constants_1.LogLevels.DATA:
                /* istanbul ignore if */
                if ((_d = this.options) === null || _d === void 0 ? void 0 : _d.useIcons) {
                    icon = figures_1.figures.arrowRight;
                }
                else {
                    icon = this.wrapInBrackets(level);
                }
                break;
            case logger_constants_1.LogLevels.STARTED:
                /* istanbul ignore if */
                if ((_e = this.options) === null || _e === void 0 ? void 0 : _e.useIcons) {
                    icon = figures_1.figures.pointer;
                }
                else {
                    icon = this.wrapInBrackets(level);
                }
                break;
            case logger_constants_1.LogLevels.TITLE:
                /* istanbul ignore if */
                if ((_f = this.options) === null || _f === void 0 ? void 0 : _f.useIcons) {
                    icon = figures_1.figures.checkboxOn;
                }
                else {
                    icon = this.wrapInBrackets(level);
                }
                break;
            case logger_constants_1.LogLevels.RETRY:
                /* istanbul ignore if */
                if ((_g = this.options) === null || _g === void 0 ? void 0 : _g.useIcons) {
                    coloring = colorette_1.default.yellow;
                    icon = figures_1.figures.pointer;
                }
                else {
                    icon = this.wrapInBrackets(level);
                }
                break;
            case logger_constants_1.LogLevels.ROLLBACK:
                /* istanbul ignore if */
                if ((_h = this.options) === null || _h === void 0 ? void 0 : _h.useIcons) {
                    coloring = colorette_1.default.red;
                    icon = figures_1.figures.arrowLeft;
                }
                else {
                    icon = this.wrapInBrackets(level);
                }
                break;
        }
        return coloring(`${icon} ${message}`);
    }
    wrapInBrackets(level) {
        return `[${level}]`;
    }
}
logger$1.Logger = Logger$2;

Object.defineProperty(verbose_renderer, "__esModule", { value: true });
verbose_renderer.VerboseRenderer = void 0;
const event_constants_1$2 = event_constants;
const logger_1 = logger$1;
const parse_time_1 = parseTime;
class VerboseRenderer {
    constructor(tasks, options) {
        var _a, _b, _c, _d;
        this.tasks = tasks;
        this.options = options;
        if (((_a = this.options) === null || _a === void 0 ? void 0 : _a.logger) && ((_b = this.options) === null || _b === void 0 ? void 0 : _b.options)) {
            this.logger = new this.options.logger(this.options.options);
        }
        else if ((_c = this.options) === null || _c === void 0 ? void 0 : _c.logger) {
            this.logger = new this.options.logger();
        }
        else {
            this.logger = new logger_1.Logger({ useIcons: (_d = this.options) === null || _d === void 0 ? void 0 : _d.useIcons });
        }
        this.options = { ...VerboseRenderer.rendererOptions, ...this.options };
    }
    render() {
        this.verboseRenderer(this.tasks);
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    end() { }
    // verbose renderer multi-level
    verboseRenderer(tasks) {
        return tasks === null || tasks === void 0 ? void 0 : tasks.forEach((task) => {
            task.subscribe(
            // eslint-disable-next-line complexity
            (event) => {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                if (task.isEnabled()) {
                    // render depending on the state
                    const taskTitle = task.hasTitle() ? task.title : 'Task without title.';
                    if (event.type === event_constants_1$2.ListrEventType.SUBTASK && task.hasSubtasks()) {
                        // render lower level if multi-level
                        this.verboseRenderer(task.subtasks);
                    }
                    else if (event.type === event_constants_1$2.ListrEventType.STATE) {
                        if (((_a = this.options) === null || _a === void 0 ? void 0 : _a.logEmptyTitle) !== false || task.hasTitle()) {
                            if (task.isPending()) {
                                this.logger.start(taskTitle);
                            }
                            else if (task.isCompleted()) {
                                this.logger.success(taskTitle + (((_b = this.options) === null || _b === void 0 ? void 0 : _b.showTimer) && ((_c = task.message) === null || _c === void 0 ? void 0 : _c.duration) ? ` [${(0, parse_time_1.parseTaskTime)(task.message.duration)}]` : ''));
                            }
                        }
                    }
                    else if (event.type === event_constants_1$2.ListrEventType.DATA && !!event.data) {
                        this.logger.data(String(event.data));
                    }
                    else if (event.type === event_constants_1$2.ListrEventType.TITLE) {
                        if (((_d = this.options) === null || _d === void 0 ? void 0 : _d.logTitleChange) !== false) {
                            this.logger.title(String(event.data));
                        }
                    }
                    else if (event.type === event_constants_1$2.ListrEventType.MESSAGE) {
                        if ((_e = event.data) === null || _e === void 0 ? void 0 : _e.error) {
                            // error message
                            this.logger.fail(String(event.data.error));
                        }
                        else if ((_f = event.data) === null || _f === void 0 ? void 0 : _f.skip) {
                            // skip message
                            this.logger.skip(String(event.data.skip));
                        }
                        else if ((_g = event.data) === null || _g === void 0 ? void 0 : _g.rollback) {
                            // rollback message
                            this.logger.rollback(String(event.data.rollback));
                        }
                        else if ((_h = event.data) === null || _h === void 0 ? void 0 : _h.retry) {
                            // inform of retry count
                            this.logger.retry(`[${event.data.retry.count}] ` + String(taskTitle));
                        }
                    }
                }
            }, 
            /* istanbul ignore next */ (err) => {
                this.logger.fail(err);
            });
        });
    }
}
verbose_renderer.VerboseRenderer = VerboseRenderer;
/** designates whether this renderer can output to a non-tty console */
VerboseRenderer.nonTTY = true;
/** renderer options for the verbose renderer */
VerboseRenderer.rendererOptions = {
    useIcons: false,
    logEmptyTitle: true,
    logTitleChange: true
};

Object.defineProperty(renderer, "__esModule", { value: true });
renderer.getRenderer = void 0;
const default_renderer_1 = default_renderer;
const silent_renderer_1 = silent_renderer;
const simple_renderer_1 = simple_renderer;
const verbose_renderer_1 = verbose_renderer;
const assert_1$1 = assert$2;
const renderers = {
    default: default_renderer_1.DefaultRenderer,
    simple: simple_renderer_1.SimpleRenderer,
    verbose: verbose_renderer_1.VerboseRenderer,
    silent: silent_renderer_1.SilentRenderer
};
function isRendererSupported(renderer) {
    return process.stdout.isTTY === true || renderer.nonTTY === true;
}
function getRendererClass(renderer) {
    if (typeof renderer === 'string') {
        return renderers[renderer] || renderers.default;
    }
    return typeof renderer === 'function' ? renderer : renderers.default;
}
function getRenderer(renderer, fallbackRenderer, fallbackCondition, silentCondition) {
    let returnValue;
    let ret = getRendererClass(renderer);
    returnValue = { renderer: ret, nonTTY: false };
    const evaluateSilent = (0, assert_1$1.assertFunctionOrSelf)(silentCondition);
    const evaluateFallback = (0, assert_1$1.assertFunctionOrSelf)(fallbackCondition);
    if (evaluateSilent) {
        ret = getRendererClass('silent');
        returnValue = { renderer: ret, nonTTY: true };
    }
    else if (!isRendererSupported(ret) || evaluateFallback) {
        ret = getRendererClass(fallbackRenderer);
        returnValue = { renderer: ret, nonTTY: true };
    }
    return returnValue;
}
renderer.getRenderer = getRenderer;

var uuid = {};

Object.defineProperty(uuid, "__esModule", { value: true });
uuid.generateUUID = void 0;
/** Generate a basic uuid with no requirement of being unbelievable unique. */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 || 0;
        const v = c === 'x' ? r : r && 0x3 || 0x8;
        return v.toString(16);
    });
}
uuid.generateUUID = generateUUID;

Object.defineProperty(task, "__esModule", { value: true });
task.Task = void 0;
const rxjs_1$1 = require$$1;
const stream_1 = require$$0__default$2["default"];
const event_constants_1$1 = event_constants;
const state_constants_1$3 = state_constants;
const listr_error_interface_1$2 = listrError_interface;
const listr_1$2 = listr;
const assert_1 = assert$2;
const renderer_1$1 = renderer;
const uuid_1 = uuid;
/**
 * Create a task from the given set of variables and make it runnable.
 */
class Task extends rxjs_1$1.Subject {
    constructor(listr, tasks, options, rendererOptions) {
        var _a, _b, _c, _d, _e, _f;
        super();
        this.listr = listr;
        this.tasks = tasks;
        this.options = options;
        this.rendererOptions = rendererOptions;
        /**
         * A channel for messages.
         *
         * This requires a separate channel for messages like error, skip or runtime messages to further utilize in the renderers.
         */
        this.message = {};
        // this kind of randomness is enough for task ids
        this.id = (0, uuid_1.generateUUID)();
        this.title = (_a = this.tasks) === null || _a === void 0 ? void 0 : _a.title;
        this.initialTitle = (_b = this.tasks) === null || _b === void 0 ? void 0 : _b.title;
        this.task = this.tasks.task;
        // parse functions
        this.skip = (_d = (_c = this.tasks) === null || _c === void 0 ? void 0 : _c.skip) !== null && _d !== void 0 ? _d : false;
        this.enabledFn = (_f = (_e = this.tasks) === null || _e === void 0 ? void 0 : _e.enabled) !== null && _f !== void 0 ? _f : true;
        // task options
        this.rendererTaskOptions = this.tasks.options;
        this.renderHook$ = this.listr.renderHook$;
        this.subscribe(() => {
            this.renderHook$.next();
        });
    }
    set state$(state) {
        this.state = state;
        this.next({
            type: event_constants_1$1.ListrEventType.STATE,
            data: state
        });
        // cancel the subtasks if this has already failed
        if (this.hasSubtasks() && this.hasFailed()) {
            for (const subtask of this.subtasks) {
                if (subtask.state === state_constants_1$3.ListrTaskState.PENDING) {
                    subtask.state$ = state_constants_1$3.ListrTaskState.FAILED;
                }
            }
        }
    }
    set output$(data) {
        this.output = data;
        this.next({
            type: event_constants_1$1.ListrEventType.DATA,
            data
        });
    }
    set message$(data) {
        this.message = { ...this.message, ...data };
        this.next({
            type: event_constants_1$1.ListrEventType.MESSAGE,
            data
        });
    }
    set title$(title) {
        this.title = title;
        this.next({
            type: event_constants_1$1.ListrEventType.TITLE,
            data: title
        });
    }
    /**
     * A function to check whether this task should run at all via enable.
     */
    async check(ctx) {
        // Check if a task is enabled or disabled
        if (this.state === undefined) {
            this.enabled = await (0, assert_1.assertFunctionOrSelf)(this.enabledFn, ctx);
            this.next({
                type: event_constants_1$1.ListrEventType.ENABLED,
                data: this.enabled
            });
        }
    }
    /** Returns whether this task has subtasks. */
    hasSubtasks() {
        var _a;
        return ((_a = this.subtasks) === null || _a === void 0 ? void 0 : _a.length) > 0;
    }
    /** Returns whether this task is in progress. */
    isPending() {
        return this.state === state_constants_1$3.ListrTaskState.PENDING;
    }
    /** Returns whether this task is skipped. */
    isSkipped() {
        return this.state === state_constants_1$3.ListrTaskState.SKIPPED;
    }
    /** Returns whether this task has been completed. */
    isCompleted() {
        return this.state === state_constants_1$3.ListrTaskState.COMPLETED;
    }
    /** Returns whether this task has been failed. */
    hasFailed() {
        return this.state === state_constants_1$3.ListrTaskState.FAILED;
    }
    /** Returns whether this task has an active rollback task going on. */
    isRollingBack() {
        return this.state === state_constants_1$3.ListrTaskState.ROLLING_BACK;
    }
    /** Returns whether the rollback action was successful. */
    hasRolledBack() {
        return this.state === state_constants_1$3.ListrTaskState.ROLLED_BACK;
    }
    /** Returns whether this task has an actively retrying task going on. */
    isRetrying() {
        return this.state === state_constants_1$3.ListrTaskState.RETRY;
    }
    /** Returns whether enabled function resolves to true. */
    isEnabled() {
        return this.enabled;
    }
    /** Returns whether this task actually has a title. */
    hasTitle() {
        return typeof (this === null || this === void 0 ? void 0 : this.title) === 'string';
    }
    /** Returns whether this task has a prompt inside. */
    isPrompt() {
        return !!this.prompt;
    }
    /** Run the current task. */
    async run(context, wrapper) {
        var _a, _b, _c, _d, _e;
        const handleResult = (result) => {
            if (result instanceof listr_1$2.Listr) {
                // Detect the subtask
                // assign options
                result.options = { ...this.options, ...result.options };
                // switch to silent renderer since already rendering
                result.rendererClass = (0, renderer_1$1.getRenderer)('silent').renderer;
                result.renderHook$.subscribe(() => {
                    this.renderHook$.next();
                });
                // assign subtasks
                this.subtasks = result.tasks;
                result.err = this.listr.err;
                this.next({ type: event_constants_1$1.ListrEventType.SUBTASK });
                result = result.run(context);
            }
            else if (this.isPrompt()) ;
            else if (result instanceof Promise) {
                // Detect promise
                result = result.then(handleResult);
            }
            else if (result instanceof stream_1.Readable) {
                // Detect stream
                result = new Promise((resolve, reject) => {
                    result.on('data', (data) => {
                        this.output$ = data.toString();
                    });
                    result.on('error', (error) => reject(error));
                    result.on('end', () => resolve(null));
                });
            }
            else if (result instanceof rxjs_1$1.Observable) {
                // Detect Observable
                result = new Promise((resolve, reject) => {
                    result.subscribe({
                        next: (data) => {
                            this.output$ = data;
                        },
                        error: reject,
                        complete: resolve
                    });
                });
            }
            return result;
        };
        const startTime = Date.now();
        // finish the task first
        this.state$ = state_constants_1$3.ListrTaskState.PENDING;
        // check if this function wants to be skipped
        const skipped = await (0, assert_1.assertFunctionOrSelf)(this.skip, context);
        if (skipped) {
            if (typeof skipped === 'string') {
                this.message$ = { skip: skipped };
            }
            else if (this.hasTitle()) {
                this.message$ = { skip: this.title };
            }
            else {
                this.message$ = { skip: 'Skipped task without a title.' };
            }
            this.state$ = state_constants_1$3.ListrTaskState.SKIPPED;
            return;
        }
        try {
            // add retry functionality
            const retryCount = ((_a = this.tasks) === null || _a === void 0 ? void 0 : _a.retry) && ((_b = this.tasks) === null || _b === void 0 ? void 0 : _b.retry) > 0 ? this.tasks.retry + 1 : 1;
            for (let retries = 1; retries <= retryCount; retries++) {
                try {
                    // handle the results
                    await handleResult(this.task(context, wrapper));
                    break;
                }
                catch (err) {
                    if (retries !== retryCount) {
                        this.retry = { count: retries, withError: err };
                        this.message$ = { retry: this.retry };
                        this.title$ = this.initialTitle;
                        this.output = undefined;
                        wrapper.report(err, listr_error_interface_1$2.ListrErrorTypes.WILL_RETRY);
                        this.state$ = state_constants_1$3.ListrTaskState.RETRY;
                    }
                    else {
                        throw err;
                    }
                }
            }
            if (this.isPending() || this.isRetrying()) {
                this.message$ = { duration: Date.now() - startTime };
                this.state$ = state_constants_1$3.ListrTaskState.COMPLETED;
            }
        }
        catch (error) {
            // catch prompt error, this was the best i could do without going crazy
            if (this.prompt instanceof listr_error_interface_1$2.PromptError) {
                // eslint-disable-next-line no-ex-assign
                error = new Error(this.prompt.message);
            }
            // execute the task on error function
            if ((_c = this.tasks) === null || _c === void 0 ? void 0 : _c.rollback) {
                wrapper.report(error, listr_error_interface_1$2.ListrErrorTypes.WILL_ROLLBACK);
                try {
                    this.state$ = state_constants_1$3.ListrTaskState.ROLLING_BACK;
                    await this.tasks.rollback(context, wrapper);
                    this.state$ = state_constants_1$3.ListrTaskState.ROLLED_BACK;
                    this.message$ = { rollback: this.title };
                }
                catch (err) {
                    this.state$ = state_constants_1$3.ListrTaskState.FAILED;
                    wrapper.report(err, listr_error_interface_1$2.ListrErrorTypes.HAS_FAILED_TO_ROLLBACK);
                    throw err;
                }
                if (((_d = this.listr.options) === null || _d === void 0 ? void 0 : _d.exitAfterRollback) !== false) {
                    // Do not exit when explicitly set to `false`
                    throw new Error(this.title);
                }
            }
            else {
                // mark task as failed
                this.state$ = state_constants_1$3.ListrTaskState.FAILED;
                if (this.listr.options.exitOnError !== false && await (0, assert_1.assertFunctionOrSelf)((_e = this.tasks) === null || _e === void 0 ? void 0 : _e.exitOnError, context) !== false) {
                    // Do not exit when explicitly set to `false`
                    // report error
                    wrapper.report(error, listr_error_interface_1$2.ListrErrorTypes.HAS_FAILED);
                    throw error;
                }
                else if (!this.hasSubtasks()) {
                    // subtasks will handle and report their own errors
                    wrapper.report(error, listr_error_interface_1$2.ListrErrorTypes.HAS_FAILED_WITHOUT_ERROR);
                }
            }
        }
        finally {
            // Mark the observable as completed
            this.complete();
        }
    }
}
task.Task = Task;

var taskWrapper = {};

var through$1 = {exports: {}};

(function (module, exports) {
var Stream = require$$0__default$2["default"];

// through
//
// a stream that does nothing but re-emit the input.
// useful for aggregating a series of changing but not ending streams into one stream)

module.exports = through;
through.through = through;

//create a readable writable stream.

function through (write, end, opts) {
  write = write || function (data) { this.queue(data); };
  end = end || function () { this.queue(null); };

  var ended = false, destroyed = false, buffer = [], _ended = false;
  var stream = new Stream();
  stream.readable = stream.writable = true;
  stream.paused = false;

//  stream.autoPause   = !(opts && opts.autoPause   === false)
  stream.autoDestroy = !(opts && opts.autoDestroy === false);

  stream.write = function (data) {
    write.call(this, data);
    return !stream.paused
  };

  function drain() {
    while(buffer.length && !stream.paused) {
      var data = buffer.shift();
      if(null === data)
        return stream.emit('end')
      else
        stream.emit('data', data);
    }
  }

  stream.queue = stream.push = function (data) {
//    console.error(ended)
    if(_ended) return stream
    if(data === null) _ended = true;
    buffer.push(data);
    drain();
    return stream
  };

  //this will be registered as the first 'end' listener
  //must call destroy next tick, to make sure we're after any
  //stream piped from here.
  //this is only a problem if end is not emitted synchronously.
  //a nicer way to do this is to make sure this is the last listener for 'end'

  stream.on('end', function () {
    stream.readable = false;
    if(!stream.writable && stream.autoDestroy)
      process.nextTick(function () {
        stream.destroy();
      });
  });

  function _end () {
    stream.writable = false;
    end.call(stream);
    if(!stream.readable && stream.autoDestroy)
      stream.destroy();
  }

  stream.end = function (data) {
    if(ended) return
    ended = true;
    if(arguments.length) stream.write(data);
    _end(); // will emit or queue
    return stream
  };

  stream.destroy = function () {
    if(destroyed) return
    destroyed = true;
    ended = true;
    buffer.length = 0;
    stream.writable = stream.readable = false;
    stream.emit('close');
    return stream
  };

  stream.pause = function () {
    if(stream.paused) return
    stream.paused = true;
    return stream
  };

  stream.resume = function () {
    if(stream.paused) {
      stream.paused = false;
      stream.emit('resume');
    }
    drain();
    //may have become paused again,
    //as drain emits 'data'.
    if(!stream.paused)
      stream.emit('drain');
    return stream
  };
  return stream
}
}(through$1));

var clearlineRegex_constants = {};

Object.defineProperty(clearlineRegex_constants, "__esModule", { value: true });
clearlineRegex_constants.BELL_REGEX = clearlineRegex_constants.CLEAR_LINE_REGEX = void 0;
/* eslint-disable no-control-regex */
clearlineRegex_constants.CLEAR_LINE_REGEX = '(?:\\u001b|\\u009b)\\[[\\=><~/#&.:=?%@~_-]*[0-9]*[\\a-ln-tqyz=><~/#&.:=?%@~_-]+';
clearlineRegex_constants.BELL_REGEX = /\u0007/;

var general = {};

Object.defineProperty(general, "__esModule", { value: true });
general.cloneObject = void 0;
const v8_1 = require$$0__default$3["default"];
/**
 * Deep clones a object in the most easiest manner.
 */
function cloneObject(obj) {
    return (0, v8_1.deserialize)((0, v8_1.serialize)(obj));
}
general.cloneObject = cloneObject;

var prompt = {};

Object.defineProperty(prompt, "__esModule", { value: true });
prompt.destroyPrompt = prompt.createPrompt = void 0;
const event_constants_1 = event_constants;
const state_constants_1$2 = state_constants;
const listr_error_interface_1$1 = listrError_interface;
const task_wrapper_1$1 = taskWrapper;
/**
 * Create a new prompt with Enquirer externally.
 * This extends enquirer so you dont have to give a name to single prompts and such so it is also
 * useful to use externally.
 * @param this
 * @param options
 * @param settings
 */
async function createPrompt(options, settings) {
    // override cancel callback
    let cancelCallback;
    /* istanbul ignore if */
    if (settings === null || settings === void 0 ? void 0 : settings.cancelCallback) {
        cancelCallback = settings.cancelCallback;
    } /* istanbul ignore next */
    else {
        cancelCallback = defaultCancelCallback;
    }
    // assign default if there is single prompt
    if (!Array.isArray(options)) {
        options = [{ ...options, name: 'default' }];
    } /* istanbul ignore next */
    else if (options.length === 1) {
        options = options.reduce((o, option) => {
            return [...o, Object.assign(option, { name: 'default' })];
        }, []);
    }
    // assign default enquirer options
    options = options.reduce((o, option) => {
        var _a;
        return [
            ...o,
            Object.assign(option, {
                // this is for outside calls, if it is not called from taskwrapper with bind
                stdout: this instanceof task_wrapper_1$1.TaskWrapper ? (_a = settings === null || settings === void 0 ? void 0 : settings.stdout) !== null && _a !== void 0 ? _a : this.stdout() : process.stdout,
                onCancel: cancelCallback.bind(this, settings)
            })
        ];
    }, []);
    let enquirer;
    if (settings === null || settings === void 0 ? void 0 : settings.enquirer) {
        // injected enquirer
        enquirer = settings.enquirer;
    }
    else {
        try {
            enquirer = new (await Promise.resolve().then(() => require('enquirer')))();
        } /* istanbul ignore next */
        catch (e) {
            this.task.prompt = new listr_error_interface_1$1.PromptError('Enquirer is a peer dependency that must be installed separately.');
            throw new Error(e);
        }
    }
    // i use this externally as well, this is a bandaid
    if (this instanceof task_wrapper_1$1.TaskWrapper) {
        // Capture the prompt instance so we can use it later
        enquirer.on('prompt', (prompt) => this.task.prompt = prompt);
        // Clear the prompt instance once it's submitted
        // Can't use on cancel, since that might hold a PromptError object
        enquirer.on('submit', () => this.task.prompt = undefined);
        this.task.subscribe((event) => {
            if (event.type === event_constants_1.ListrEventType.STATE && event.data === state_constants_1$2.ListrTaskState.SKIPPED) {
                if (this.task.prompt && !(this.task.prompt instanceof listr_error_interface_1$1.PromptError)) {
                    this.task.prompt.submit();
                }
            }
        });
    }
    const response = (await enquirer.prompt(options));
    // return default name if it is single prompt
    if (options.length === 1) {
        return response.default;
    }
    else {
        return response;
    }
}
prompt.createPrompt = createPrompt;
function destroyPrompt(throwError = false) {
    if (!this.task.prompt || this.task.prompt instanceof listr_error_interface_1$1.PromptError) {
        // If there's no prompt, can't cancel
        return;
    }
    if (throwError) {
        this.task.prompt.cancel();
    }
    else {
        this.task.prompt.submit();
    }
}
prompt.destroyPrompt = destroyPrompt;
function defaultCancelCallback(settings) {
    const errorMsg = 'Cancelled prompt.';
    if (this instanceof task_wrapper_1$1.TaskWrapper) {
        this.task.prompt = new listr_error_interface_1$1.PromptError(errorMsg);
    } /* istanbul ignore next */
    else if ((settings === null || settings === void 0 ? void 0 : settings.error) !== false) {
        throw new Error(errorMsg);
    } /* istanbul ignore next */
    else {
        return errorMsg;
    }
}

Object.defineProperty(taskWrapper, "__esModule", { value: true });
taskWrapper.TaskWrapper = void 0;
const through = through$1.exports;
const clearline_regex_constants_1 = clearlineRegex_constants;
const state_constants_1$1 = state_constants;
const listr_error_interface_1 = listrError_interface;
const listr_1$1 = listr;
const general_1 = general;
const prompt_1 = prompt;
/**
 * Extend the task to have more functionality while accesing from the outside.
 */
class TaskWrapper {
    constructor(task, errors, options) {
        this.task = task;
        this.errors = errors;
        this.options = options;
    }
    /** Change the title of the current task. */
    set title(data) {
        this.task.title$ = data;
    }
    /** Get the title of the current task. */
    get title() {
        return this.task.title;
    }
    /** Send a output to the output channel. */
    set output(data) {
        this.task.output$ = data;
    }
    /** Get the output from the output channel. */
    get output() {
        return this.task.output;
    }
    /** Create a new subtask with given renderer selection from the parent task. */
    newListr(task, options) {
        let tasks;
        if (typeof task === 'function') {
            tasks = task(this);
        }
        else {
            tasks = task;
        }
        return new listr_1$1.Listr(tasks, options);
    }
    /** Report a error in process for error collection. */
    report(error, type) {
        var _a, _b, _c;
        this.errors.push(new listr_error_interface_1.ListrError(error, type, (0, general_1.cloneObject)(this.task.listr.ctx), this.task));
        this.task.message$ = { error: (_c = (_a = error.message) !== null && _a !== void 0 ? _a : (_b = this.task) === null || _b === void 0 ? void 0 : _b.title) !== null && _c !== void 0 ? _c : 'Task with no title.' };
    }
    /** Skip current task. */
    skip(message) {
        var _a, _b;
        this.task.state$ = state_constants_1$1.ListrTaskState.SKIPPED;
        if (message) {
            this.task.message$ = { skip: (_b = message !== null && message !== void 0 ? message : (_a = this.task) === null || _a === void 0 ? void 0 : _a.title) !== null && _b !== void 0 ? _b : 'Task with no title.' };
        }
    }
    /** Get the number of retrying, else returns false */
    isRetrying() {
        return this.task.isRetrying() ? this.task.retry : { count: 0 };
    }
    /**
     * Create a new Enquirer prompt using prompt options.
     *
     * Since process.stdout is controlled by Listr, this will passthrough all Enquirer data through internal stdout.
     */
    async prompt(options) {
        var _a;
        return prompt_1.createPrompt.bind(this)(options, { ...(_a = this.options) === null || _a === void 0 ? void 0 : _a.injectWrapper });
    }
    /** Cancels the current prompt attach to this task. */
    cancelPrompt(throwError = false) {
        return prompt_1.destroyPrompt.bind(this)(throwError);
    }
    /**
     * Pass stream of data to internal stdout.
     *
     * Since Listr2 takes control of process.stdout utilizing the default renderer, any data outputted to process.stdout
     * will corupt its looks.
     *
     * This returns a fake stream to pass any stream inside Listr as task data.
     */
    stdout() {
        return through((chunk) => {
            chunk = chunk.toString();
            chunk = chunk.replace(new RegExp(clearline_regex_constants_1.CLEAR_LINE_REGEX, 'gmi'), '');
            chunk = chunk.replace(new RegExp(clearline_regex_constants_1.BELL_REGEX, 'gmi'), '');
            if (chunk !== '') {
                this.output = chunk;
            }
        });
    }
    /** Run this task. */
    run(ctx) {
        return this.task.run(ctx, this);
    }
}
taskWrapper.TaskWrapper = TaskWrapper;

Object.defineProperty(listr, "__esModule", { value: true });
listr.Listr = void 0;
const pMap = pMap$1;
const rxjs_1 = require$$1;
const state_constants_1 = state_constants;
const task_1 = task;
const task_wrapper_1 = taskWrapper;
const renderer_1 = renderer;
/**
 * Creates a new set of Listr2 task list.
 */
class Listr {
    constructor(task, options) {
        var _a, _b, _c;
        this.task = task;
        this.options = options;
        this.tasks = [];
        this.err = [];
        this.renderHook$ = new rxjs_1.Subject();
        // assign over default options
        this.options = {
            ...{
                concurrent: false,
                renderer: 'default',
                nonTTYRenderer: 'verbose',
                exitOnError: true,
                exitAfterRollback: true,
                registerSignalListeners: true
            },
            ...options
        };
        // define parallel options
        if (this.options.concurrent === true) {
            this.concurrency = Infinity;
        }
        else if (typeof this.options.concurrent === 'number') {
            this.concurrency = this.options.concurrent;
        }
        else {
            this.concurrency = 1;
        }
        // get renderer class
        const renderer = (0, renderer_1.getRenderer)(this.options.renderer, this.options.nonTTYRenderer, (_a = this.options) === null || _a === void 0 ? void 0 : _a.rendererFallback, (_b = this.options) === null || _b === void 0 ? void 0 : _b.rendererSilent);
        this.rendererClass = renderer.renderer;
        // depending on the result pass the given options in
        if (!renderer.nonTTY) {
            this.rendererClassOptions = this.options.rendererOptions;
        }
        else {
            this.rendererClassOptions = this.options.nonTTYRendererOptions;
        }
        // parse and add tasks
        /* istanbul ignore next */
        this.add(task !== null && task !== void 0 ? task : []);
        // Graceful interrupt for render cleanup
        /* istanbul ignore if */
        if (this.options.registerSignalListeners) {
            process
                .once('SIGINT', () => {
                this.tasks.forEach(async (task) => {
                    if (task.isPending()) {
                        task.state$ = state_constants_1.ListrTaskState.FAILED;
                    }
                });
                this.renderer.end(new Error('Interrupted.'));
                process.exit(127);
            })
                .setMaxListeners(0);
        }
        // disable color programatically for CI purposes
        /* istanbul ignore if */
        if ((_c = this.options) === null || _c === void 0 ? void 0 : _c.disableColor) {
            process.env.LISTR_DISABLE_COLOR = '1';
        }
    }
    add(task) {
        const tasks = Array.isArray(task) ? task : [task];
        tasks.forEach((task) => {
            this.tasks.push(new task_1.Task(this, task, this.options, { ...this.rendererClassOptions, ...task.options }));
        });
    }
    async run(context) {
        var _a, _b;
        // start the renderer
        if (!this.renderer) {
            this.renderer = new this.rendererClass(this.tasks, this.rendererClassOptions, this.renderHook$);
        }
        this.renderer.render();
        // create a new context
        this.ctx = (_b = context !== null && context !== void 0 ? context : (_a = this.options) === null || _a === void 0 ? void 0 : _a.ctx) !== null && _b !== void 0 ? _b : {};
        // check if the items are enabled
        await this.checkAll(this.ctx);
        // run tasks
        try {
            await pMap(this.tasks, async (task) => {
                // check this item is enabled, conditions may change depending on context
                await task.check(this.ctx);
                return this.runTask(task, this.ctx, this.err);
            }, { concurrency: this.concurrency });
            this.renderer.end();
        }
        catch (err) {
            if (this.options.exitOnError !== false) {
                this.renderer.end(err);
                // Do not exit when explicitly set to `false`
                throw err;
            }
        }
        return this.ctx;
    }
    checkAll(context) {
        return Promise.all(this.tasks.map((task) => task.check(context)));
    }
    runTask(task, context, errors) {
        if (!task.isEnabled()) {
            return Promise.resolve();
        }
        return new task_wrapper_1.TaskWrapper(task, errors, this.options).run(context);
    }
}
listr.Listr = Listr;

var manager = {};

Object.defineProperty(manager, "__esModule", { value: true });
manager.Manager = void 0;
const listr_1 = listr;
/**
 * Creates a new Listr2 task manager.
 *
 * Useful for creating a single instace of Listr2 with pre-set settings.
 */
class Manager {
    constructor(options) {
        this.options = options;
        this.err = [];
        this.tasks = [];
    }
    set ctx(ctx) {
        this.options.ctx = ctx;
    }
    add(tasks, options) {
        options = { ...this.options, ...options };
        this.tasks = [...this.tasks, this.indent(tasks, options)];
    }
    async runAll(options) {
        options = { ...this.options, ...options };
        const ctx = await this.run(this.tasks, options);
        // clear out queues
        this.tasks = [];
        return ctx;
    }
    newListr(tasks, options) {
        return new listr_1.Listr(tasks, options);
    }
    indent(tasks, options, taskOptions) {
        options = { ...this.options, ...options };
        let newTask;
        // type function or directly
        if (typeof tasks === 'function') {
            newTask = {
                ...taskOptions,
                task: (ctx) => this.newListr(tasks(ctx), options)
            };
        }
        else {
            newTask = {
                ...taskOptions,
                task: () => this.newListr(tasks, options)
            };
        }
        return newTask;
    }
    async run(tasks, options) {
        options = { ...this.options, ...options };
        // create task
        const task = this.newListr(tasks, options);
        // run task
        const ctx = await task.run();
        // reset error queue
        this.err = task.err;
        return ctx;
    }
    // general utils
    /* istanbul ignore next */
    getRuntime(pipetime) {
        return `${Math.round(Date.now() - pipetime) / 1000}s`;
    }
}
manager.Manager = Manager;

var constants$1 = {};

(function (exports) {
var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(state_constants, exports);
__exportStar(event_constants, exports);
}(constants$1));

var interfaces = {};

var listr_interface = {};

Object.defineProperty(listr_interface, "__esModule", { value: true });

var task_interface = {};

Object.defineProperty(task_interface, "__esModule", { value: true });

var renderer_interface = {};

Object.defineProperty(renderer_interface, "__esModule", { value: true });

(function (exports) {
var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(listr_interface, exports);
__exportStar(listrError_interface, exports);
__exportStar(task_interface, exports);
__exportStar(renderer_interface, exports);
}(interfaces));

var prompt_interface = {};

Object.defineProperty(prompt_interface, "__esModule", { value: true });

(function (exports) {
var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(listr, exports);
__exportStar(manager, exports);
__exportStar(constants$1, exports);
__exportStar(interfaces, exports);
__exportStar(logger$1, exports);
__exportStar(logger_constants, exports);
__exportStar(prompt_interface, exports);
__exportStar(prompt, exports);
__exportStar(figures, exports);
}(dist));

var src = {exports: {}};

var browser = {exports: {}};

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

var ms = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse$3(val);
  } else if (type === 'number' && isFinite(val)) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse$3(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }
  return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */

function setup$2(env) {
	createDebug.debug = createDebug;
	createDebug.default = createDebug;
	createDebug.coerce = coerce;
	createDebug.disable = disable;
	createDebug.enable = enable;
	createDebug.enabled = enabled;
	createDebug.humanize = ms;
	createDebug.destroy = destroy;

	Object.keys(env).forEach(key => {
		createDebug[key] = env[key];
	});

	/**
	* The currently active debug mode names, and names to skip.
	*/

	createDebug.names = [];
	createDebug.skips = [];

	/**
	* Map of special "%n" handling functions, for the debug "format" argument.
	*
	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	*/
	createDebug.formatters = {};

	/**
	* Selects a color for a debug namespace
	* @param {String} namespace The namespace string for the for the debug instance to be colored
	* @return {Number|String} An ANSI color code for the given namespace
	* @api private
	*/
	function selectColor(namespace) {
		let hash = 0;

		for (let i = 0; i < namespace.length; i++) {
			hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
			hash |= 0; // Convert to 32bit integer
		}

		return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
	}
	createDebug.selectColor = selectColor;

	/**
	* Create a debugger with the given `namespace`.
	*
	* @param {String} namespace
	* @return {Function}
	* @api public
	*/
	function createDebug(namespace) {
		let prevTime;
		let enableOverride = null;
		let namespacesCache;
		let enabledCache;

		function debug(...args) {
			// Disabled?
			if (!debug.enabled) {
				return;
			}

			const self = debug;

			// Set `diff` timestamp
			const curr = Number(new Date());
			const ms = curr - (prevTime || curr);
			self.diff = ms;
			self.prev = prevTime;
			self.curr = curr;
			prevTime = curr;

			args[0] = createDebug.coerce(args[0]);

			if (typeof args[0] !== 'string') {
				// Anything else let's inspect with %O
				args.unshift('%O');
			}

			// Apply any `formatters` transformations
			let index = 0;
			args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
				// If we encounter an escaped % then don't increase the array index
				if (match === '%%') {
					return '%';
				}
				index++;
				const formatter = createDebug.formatters[format];
				if (typeof formatter === 'function') {
					const val = args[index];
					match = formatter.call(self, val);

					// Now we need to remove `args[index]` since it's inlined in the `format`
					args.splice(index, 1);
					index--;
				}
				return match;
			});

			// Apply env-specific formatting (colors, etc.)
			createDebug.formatArgs.call(self, args);

			const logFn = self.log || createDebug.log;
			logFn.apply(self, args);
		}

		debug.namespace = namespace;
		debug.useColors = createDebug.useColors();
		debug.color = createDebug.selectColor(namespace);
		debug.extend = extend;
		debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.

		Object.defineProperty(debug, 'enabled', {
			enumerable: true,
			configurable: false,
			get: () => {
				if (enableOverride !== null) {
					return enableOverride;
				}
				if (namespacesCache !== createDebug.namespaces) {
					namespacesCache = createDebug.namespaces;
					enabledCache = createDebug.enabled(namespace);
				}

				return enabledCache;
			},
			set: v => {
				enableOverride = v;
			}
		});

		// Env-specific initialization logic for debug instances
		if (typeof createDebug.init === 'function') {
			createDebug.init(debug);
		}

		return debug;
	}

	function extend(namespace, delimiter) {
		const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
		newDebug.log = this.log;
		return newDebug;
	}

	/**
	* Enables a debug mode by namespaces. This can include modes
	* separated by a colon and wildcards.
	*
	* @param {String} namespaces
	* @api public
	*/
	function enable(namespaces) {
		createDebug.save(namespaces);
		createDebug.namespaces = namespaces;

		createDebug.names = [];
		createDebug.skips = [];

		let i;
		const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
		const len = split.length;

		for (i = 0; i < len; i++) {
			if (!split[i]) {
				// ignore empty strings
				continue;
			}

			namespaces = split[i].replace(/\*/g, '.*?');

			if (namespaces[0] === '-') {
				createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
			} else {
				createDebug.names.push(new RegExp('^' + namespaces + '$'));
			}
		}
	}

	/**
	* Disable debug output.
	*
	* @return {String} namespaces
	* @api public
	*/
	function disable() {
		const namespaces = [
			...createDebug.names.map(toNamespace),
			...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
		].join(',');
		createDebug.enable('');
		return namespaces;
	}

	/**
	* Returns true if the given mode name is enabled, false otherwise.
	*
	* @param {String} name
	* @return {Boolean}
	* @api public
	*/
	function enabled(name) {
		if (name[name.length - 1] === '*') {
			return true;
		}

		let i;
		let len;

		for (i = 0, len = createDebug.skips.length; i < len; i++) {
			if (createDebug.skips[i].test(name)) {
				return false;
			}
		}

		for (i = 0, len = createDebug.names.length; i < len; i++) {
			if (createDebug.names[i].test(name)) {
				return true;
			}
		}

		return false;
	}

	/**
	* Convert regexp to namespace
	*
	* @param {RegExp} regxep
	* @return {String} namespace
	* @api private
	*/
	function toNamespace(regexp) {
		return regexp.toString()
			.substring(2, regexp.toString().length - 2)
			.replace(/\.\*\?$/, '*');
	}

	/**
	* Coerce `val`.
	*
	* @param {Mixed} val
	* @return {Mixed}
	* @api private
	*/
	function coerce(val) {
		if (val instanceof Error) {
			return val.stack || val.message;
		}
		return val;
	}

	/**
	* XXX DO NOT USE. This is a temporary stub function.
	* XXX It WILL be removed in the next major release.
	*/
	function destroy() {
		console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
	}

	createDebug.enable(createDebug.load());

	return createDebug;
}

var common = setup$2;

/* eslint-env browser */

(function (module, exports) {
/**
 * This is the web browser implementation of `debug()`.
 */

exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();
exports.destroy = (() => {
	let warned = false;

	return () => {
		if (!warned) {
			warned = true;
			console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
		}
	};
})();

/**
 * Colors.
 */

exports.colors = [
	'#0000CC',
	'#0000FF',
	'#0033CC',
	'#0033FF',
	'#0066CC',
	'#0066FF',
	'#0099CC',
	'#0099FF',
	'#00CC00',
	'#00CC33',
	'#00CC66',
	'#00CC99',
	'#00CCCC',
	'#00CCFF',
	'#3300CC',
	'#3300FF',
	'#3333CC',
	'#3333FF',
	'#3366CC',
	'#3366FF',
	'#3399CC',
	'#3399FF',
	'#33CC00',
	'#33CC33',
	'#33CC66',
	'#33CC99',
	'#33CCCC',
	'#33CCFF',
	'#6600CC',
	'#6600FF',
	'#6633CC',
	'#6633FF',
	'#66CC00',
	'#66CC33',
	'#9900CC',
	'#9900FF',
	'#9933CC',
	'#9933FF',
	'#99CC00',
	'#99CC33',
	'#CC0000',
	'#CC0033',
	'#CC0066',
	'#CC0099',
	'#CC00CC',
	'#CC00FF',
	'#CC3300',
	'#CC3333',
	'#CC3366',
	'#CC3399',
	'#CC33CC',
	'#CC33FF',
	'#CC6600',
	'#CC6633',
	'#CC9900',
	'#CC9933',
	'#CCCC00',
	'#CCCC33',
	'#FF0000',
	'#FF0033',
	'#FF0066',
	'#FF0099',
	'#FF00CC',
	'#FF00FF',
	'#FF3300',
	'#FF3333',
	'#FF3366',
	'#FF3399',
	'#FF33CC',
	'#FF33FF',
	'#FF6600',
	'#FF6633',
	'#FF9900',
	'#FF9933',
	'#FFCC00',
	'#FFCC33'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

// eslint-disable-next-line complexity
function useColors() {
	// NB: In an Electron preload script, document will be defined but not fully
	// initialized. Since we know we're in Chrome, we'll just detect this case
	// explicitly
	if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
		return true;
	}

	// Internet Explorer and Edge do not support colors.
	if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
		return false;
	}

	// Is webkit? http://stackoverflow.com/a/16459606/376773
	// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
	return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
		// Is firebug? http://stackoverflow.com/a/398120/376773
		(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
		// Is firefox >= v31?
		// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
		// Double check webkit in userAgent just in case we are in a worker
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	args[0] = (this.useColors ? '%c' : '') +
		this.namespace +
		(this.useColors ? ' %c' : ' ') +
		args[0] +
		(this.useColors ? '%c ' : ' ') +
		'+' + module.exports.humanize(this.diff);

	if (!this.useColors) {
		return;
	}

	const c = 'color: ' + this.color;
	args.splice(1, 0, c, 'color: inherit');

	// The final "%c" is somewhat tricky, because there could be other
	// arguments passed either before or after the %c, so we need to
	// figure out the correct index to insert the CSS into
	let index = 0;
	let lastC = 0;
	args[0].replace(/%[a-zA-Z%]/g, match => {
		if (match === '%%') {
			return;
		}
		index++;
		if (match === '%c') {
			// We only are interested in the *last* %c
			// (the user may have provided their own)
			lastC = index;
		}
	});

	args.splice(lastC, 0, c);
}

/**
 * Invokes `console.debug()` when available.
 * No-op when `console.debug` is not a "function".
 * If `console.debug` is not available, falls back
 * to `console.log`.
 *
 * @api public
 */
exports.log = console.debug || console.log || (() => {});

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	try {
		if (namespaces) {
			exports.storage.setItem('debug', namespaces);
		} else {
			exports.storage.removeItem('debug');
		}
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */
function load() {
	let r;
	try {
		r = exports.storage.getItem('debug');
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}

	// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
	if (!r && typeof process !== 'undefined' && 'env' in process) {
		r = process.env.DEBUG;
	}

	return r;
}

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
	try {
		// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
		// The Browser also has localStorage in the global context.
		return localStorage;
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

module.exports = common(exports);

const {formatters} = module.exports;

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function (v) {
	try {
		return JSON.stringify(v);
	} catch (error) {
		return '[UnexpectedJSONParseError]: ' + error.message;
	}
};
}(browser, browser.exports));

var node = {exports: {}};

/**
 * Module dependencies.
 */

(function (module, exports) {
const tty = require$$0__default$1["default"];
const util = require$$2__default$1["default"];

/**
 * This is the Node.js implementation of `debug()`.
 */

exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.destroy = util.deprecate(
	() => {},
	'Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.'
);

/**
 * Colors.
 */

exports.colors = [6, 2, 3, 4, 5, 1];

try {
	// Optional dependency (as in, doesn't need to be installed, NOT like optionalDependencies in package.json)
	// eslint-disable-next-line import/no-extraneous-dependencies
	const supportsColor = require('supports-color');

	if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
		exports.colors = [
			20,
			21,
			26,
			27,
			32,
			33,
			38,
			39,
			40,
			41,
			42,
			43,
			44,
			45,
			56,
			57,
			62,
			63,
			68,
			69,
			74,
			75,
			76,
			77,
			78,
			79,
			80,
			81,
			92,
			93,
			98,
			99,
			112,
			113,
			128,
			129,
			134,
			135,
			148,
			149,
			160,
			161,
			162,
			163,
			164,
			165,
			166,
			167,
			168,
			169,
			170,
			171,
			172,
			173,
			178,
			179,
			184,
			185,
			196,
			197,
			198,
			199,
			200,
			201,
			202,
			203,
			204,
			205,
			206,
			207,
			208,
			209,
			214,
			215,
			220,
			221
		];
	}
} catch (error) {
	// Swallow - we only care if `supports-color` is available; it doesn't have to be.
}

/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */

exports.inspectOpts = Object.keys(process.env).filter(key => {
	return /^debug_/i.test(key);
}).reduce((obj, key) => {
	// Camel-case
	const prop = key
		.substring(6)
		.toLowerCase()
		.replace(/_([a-z])/g, (_, k) => {
			return k.toUpperCase();
		});

	// Coerce string value into JS value
	let val = process.env[key];
	if (/^(yes|on|true|enabled)$/i.test(val)) {
		val = true;
	} else if (/^(no|off|false|disabled)$/i.test(val)) {
		val = false;
	} else if (val === 'null') {
		val = null;
	} else {
		val = Number(val);
	}

	obj[prop] = val;
	return obj;
}, {});

/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */

function useColors() {
	return 'colors' in exports.inspectOpts ?
		Boolean(exports.inspectOpts.colors) :
		tty.isatty(process.stderr.fd);
}

/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	const {namespace: name, useColors} = this;

	if (useColors) {
		const c = this.color;
		const colorCode = '\u001B[3' + (c < 8 ? c : '8;5;' + c);
		const prefix = `  ${colorCode};1m${name} \u001B[0m`;

		args[0] = prefix + args[0].split('\n').join('\n' + prefix);
		args.push(colorCode + 'm+' + module.exports.humanize(this.diff) + '\u001B[0m');
	} else {
		args[0] = getDate() + name + ' ' + args[0];
	}
}

function getDate() {
	if (exports.inspectOpts.hideDate) {
		return '';
	}
	return new Date().toISOString() + ' ';
}

/**
 * Invokes `util.format()` with the specified arguments and writes to stderr.
 */

function log(...args) {
	return process.stderr.write(util.format(...args) + '\n');
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	if (namespaces) {
		process.env.DEBUG = namespaces;
	} else {
		// If you set a process.env field to null or undefined, it gets cast to the
		// string 'null' or 'undefined'. Just delete instead.
		delete process.env.DEBUG;
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
	return process.env.DEBUG;
}

/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */

function init(debug) {
	debug.inspectOpts = {};

	const keys = Object.keys(exports.inspectOpts);
	for (let i = 0; i < keys.length; i++) {
		debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
	}
}

module.exports = common(exports);

const {formatters} = module.exports;

/**
 * Map %o to `util.inspect()`, all on a single line.
 */

formatters.o = function (v) {
	this.inspectOpts.colors = this.useColors;
	return util.inspect(v, this.inspectOpts)
		.split('\n')
		.map(str => str.trim())
		.join(' ');
};

/**
 * Map %O to `util.inspect()`, allowing multiple lines if needed.
 */

formatters.O = function (v) {
	this.inspectOpts.colors = this.useColors;
	return util.inspect(v, this.inspectOpts);
};
}(node, node.exports));

/**
 * Detect Electron renderer / nwjs process, which is node, but we should
 * treat as a browser.
 */

if (typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs) {
	src.exports = browser.exports;
} else {
	src.exports = node.exports;
}

var rfdc_1 = rfdc;

function copyBuffer (cur) {
  if (cur instanceof Buffer) {
    return Buffer.from(cur)
  }

  return new cur.constructor(cur.buffer.slice(), cur.byteOffset, cur.length)
}

function rfdc (opts) {
  opts = opts || {};

  if (opts.circles) return rfdcCircles(opts)
  return opts.proto ? cloneProto : clone

  function cloneArray (a, fn) {
    var keys = Object.keys(a);
    var a2 = new Array(keys.length);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var cur = a[k];
      if (typeof cur !== 'object' || cur === null) {
        a2[k] = cur;
      } else if (cur instanceof Date) {
        a2[k] = new Date(cur);
      } else if (ArrayBuffer.isView(cur)) {
        a2[k] = copyBuffer(cur);
      } else {
        a2[k] = fn(cur);
      }
    }
    return a2
  }

  function clone (o) {
    if (typeof o !== 'object' || o === null) return o
    if (o instanceof Date) return new Date(o)
    if (Array.isArray(o)) return cloneArray(o, clone)
    if (o instanceof Map) return new Map(cloneArray(Array.from(o), clone))
    if (o instanceof Set) return new Set(cloneArray(Array.from(o), clone))
    var o2 = {};
    for (var k in o) {
      if (Object.hasOwnProperty.call(o, k) === false) continue
      var cur = o[k];
      if (typeof cur !== 'object' || cur === null) {
        o2[k] = cur;
      } else if (cur instanceof Date) {
        o2[k] = new Date(cur);
      } else if (cur instanceof Map) {
        o2[k] = new Map(cloneArray(Array.from(cur), clone));
      } else if (cur instanceof Set) {
        o2[k] = new Set(cloneArray(Array.from(cur), clone));
      } else if (ArrayBuffer.isView(cur)) {
        o2[k] = copyBuffer(cur);
      } else {
        o2[k] = clone(cur);
      }
    }
    return o2
  }

  function cloneProto (o) {
    if (typeof o !== 'object' || o === null) return o
    if (o instanceof Date) return new Date(o)
    if (Array.isArray(o)) return cloneArray(o, cloneProto)
    if (o instanceof Map) return new Map(cloneArray(Array.from(o), cloneProto))
    if (o instanceof Set) return new Set(cloneArray(Array.from(o), cloneProto))
    var o2 = {};
    for (var k in o) {
      var cur = o[k];
      if (typeof cur !== 'object' || cur === null) {
        o2[k] = cur;
      } else if (cur instanceof Date) {
        o2[k] = new Date(cur);
      } else if (cur instanceof Map) {
        o2[k] = new Map(cloneArray(Array.from(cur), cloneProto));
      } else if (cur instanceof Set) {
        o2[k] = new Set(cloneArray(Array.from(cur), cloneProto));
      } else if (ArrayBuffer.isView(cur)) {
        o2[k] = copyBuffer(cur);
      } else {
        o2[k] = cloneProto(cur);
      }
    }
    return o2
  }
}

function rfdcCircles (opts) {
  var refs = [];
  var refsNew = [];

  return opts.proto ? cloneProto : clone

  function cloneArray (a, fn) {
    var keys = Object.keys(a);
    var a2 = new Array(keys.length);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var cur = a[k];
      if (typeof cur !== 'object' || cur === null) {
        a2[k] = cur;
      } else if (cur instanceof Date) {
        a2[k] = new Date(cur);
      } else if (ArrayBuffer.isView(cur)) {
        a2[k] = copyBuffer(cur);
      } else {
        var index = refs.indexOf(cur);
        if (index !== -1) {
          a2[k] = refsNew[index];
        } else {
          a2[k] = fn(cur);
        }
      }
    }
    return a2
  }

  function clone (o) {
    if (typeof o !== 'object' || o === null) return o
    if (o instanceof Date) return new Date(o)
    if (Array.isArray(o)) return cloneArray(o, clone)
    if (o instanceof Map) return new Map(cloneArray(Array.from(o), clone))
    if (o instanceof Set) return new Set(cloneArray(Array.from(o), clone))
    var o2 = {};
    refs.push(o);
    refsNew.push(o2);
    for (var k in o) {
      if (Object.hasOwnProperty.call(o, k) === false) continue
      var cur = o[k];
      if (typeof cur !== 'object' || cur === null) {
        o2[k] = cur;
      } else if (cur instanceof Date) {
        o2[k] = new Date(cur);
      } else if (cur instanceof Map) {
        o2[k] = new Map(cloneArray(Array.from(cur), clone));
      } else if (cur instanceof Set) {
        o2[k] = new Set(cloneArray(Array.from(cur), clone));
      } else if (ArrayBuffer.isView(cur)) {
        o2[k] = copyBuffer(cur);
      } else {
        var i = refs.indexOf(cur);
        if (i !== -1) {
          o2[k] = refsNew[i];
        } else {
          o2[k] = clone(cur);
        }
      }
    }
    refs.pop();
    refsNew.pop();
    return o2
  }

  function cloneProto (o) {
    if (typeof o !== 'object' || o === null) return o
    if (o instanceof Date) return new Date(o)
    if (Array.isArray(o)) return cloneArray(o, cloneProto)
    if (o instanceof Map) return new Map(cloneArray(Array.from(o), cloneProto))
    if (o instanceof Set) return new Set(cloneArray(Array.from(o), cloneProto))
    var o2 = {};
    refs.push(o);
    refsNew.push(o2);
    for (var k in o) {
      var cur = o[k];
      if (typeof cur !== 'object' || cur === null) {
        o2[k] = cur;
      } else if (cur instanceof Date) {
        o2[k] = new Date(cur);
      } else if (cur instanceof Map) {
        o2[k] = new Map(cloneArray(Array.from(cur), cloneProto));
      } else if (cur instanceof Set) {
        o2[k] = new Set(cloneArray(Array.from(cur), cloneProto));
      } else if (ArrayBuffer.isView(cur)) {
        o2[k] = copyBuffer(cur);
      } else {
        var i = refs.indexOf(cur);
        if (i !== -1) {
          o2[k] = refsNew[i];
        } else {
          o2[k] = cloneProto(cur);
        }
      }
    }
    refs.pop();
    refsNew.pop();
    return o2
  }
}

const util$2 = require$$2__default$1["default"];
const debug$e = src.exports('log4js:configuration');

const preProcessingListeners = [];
const listeners$1 = [];

const not = thing => !thing;

const anObject = thing => thing && typeof thing === 'object' && !Array.isArray(thing);

const validIdentifier = thing => /^[A-Za-z][A-Za-z0-9_]*$/g.test(thing);

const anInteger = thing => thing && typeof thing === 'number' && Number.isInteger(thing);

const addListener = (fn) => {
  listeners$1.push(fn);
  debug$e(`Added listener, now ${listeners$1.length} listeners`);
};

const addPreProcessingListener = (fn) => {
  preProcessingListeners.push(fn);
  debug$e(`Added pre-processing listener, now ${preProcessingListeners.length} listeners`);
};

const throwExceptionIf = (config, checks, message) => {
  const tests = Array.isArray(checks) ? checks : [checks];
  tests.forEach((test) => {
    if (test) {
      throw new Error(`Problem with log4js configuration: (${util$2.inspect(config, { depth: 5 })})`
        + ` - ${message}`);
    }
  });
};

const configure$a = (candidate) => {
  debug$e('New configuration to be validated: ', candidate);
  throwExceptionIf(candidate, not(anObject(candidate)), 'must be an object.');

  debug$e(`Calling pre-processing listeners (${preProcessingListeners.length})`);
  preProcessingListeners.forEach(listener => listener(candidate));
  debug$e('Configuration pre-processing finished.');

  debug$e(`Calling configuration listeners (${listeners$1.length})`);
  listeners$1.forEach(listener => listener(candidate));
  debug$e('Configuration finished.');
};

var configuration$6 = {
  configure: configure$a,
  addListener,
  addPreProcessingListener,
  throwExceptionIf,
  anObject,
  anInteger,
  validIdentifier,
  not
};

var lib$3 = {exports: {}};

(function (module) {

function padWithZeros(vNumber, width) {
  var numAsString = vNumber.toString();
  while (numAsString.length < width) {
    numAsString = "0" + numAsString;
  }
  return numAsString;
}

function addZero(vNumber) {
  return padWithZeros(vNumber, 2);
}

/**
 * Formats the TimeOffset
 * Thanks to http://www.svendtofte.com/code/date_format/
 * @private
 */
function offset(timezoneOffset) {
  var os = Math.abs(timezoneOffset);
  var h = String(Math.floor(os / 60));
  var m = String(os % 60);
  if (h.length === 1) {
    h = "0" + h;
  }
  if (m.length === 1) {
    m = "0" + m;
  }
  return timezoneOffset < 0 ? "+" + h + m : "-" + h + m;
}

function asString(format, date) {
  if (typeof format !== "string") {
    date = format;
    format = module.exports.ISO8601_FORMAT;
  }
  if (!date) {
    date = module.exports.now();
  }

  // Issue # 14 - Per ISO8601 standard, the time string should be local time
  // with timezone info.
  // See https://en.wikipedia.org/wiki/ISO_8601 section "Time offsets from UTC"

  var vDay = addZero(date.getDate());
  var vMonth = addZero(date.getMonth() + 1);
  var vYearLong = addZero(date.getFullYear());
  var vYearShort = addZero(vYearLong.substring(2, 4));
  var vYear = format.indexOf("yyyy") > -1 ? vYearLong : vYearShort;
  var vHour = addZero(date.getHours());
  var vMinute = addZero(date.getMinutes());
  var vSecond = addZero(date.getSeconds());
  var vMillisecond = padWithZeros(date.getMilliseconds(), 3);
  var vTimeZone = offset(date.getTimezoneOffset());
  var formatted = format
    .replace(/dd/g, vDay)
    .replace(/MM/g, vMonth)
    .replace(/y{1,4}/g, vYear)
    .replace(/hh/g, vHour)
    .replace(/mm/g, vMinute)
    .replace(/ss/g, vSecond)
    .replace(/SSS/g, vMillisecond)
    .replace(/O/g, vTimeZone);
  return formatted;
}

function setDatePart(date, part, value, local) {
  date['set' + (local ? '' : 'UTC') + part](value);
}

function extractDateParts(pattern, str, missingValuesDate) {
  // Javascript Date object doesn't support custom timezone.  Sets all felds as
  // GMT based to begin with.  If the timezone offset is provided, then adjust
  // it using provided timezone, otherwise, adjust it with the system timezone.
  var local = pattern.indexOf('O') < 0;
  var matchers = [
    {
      pattern: /y{1,4}/,
      regexp: "\\d{1,4}",
      fn: function(date, value) {
        setDatePart(date, 'FullYear', value, local);
      }
    },
    {
      pattern: /MM/,
      regexp: "\\d{1,2}",
      fn: function(date, value) {
        setDatePart(date, 'Month', (value - 1), local);
      }
    },
    {
      pattern: /dd/,
      regexp: "\\d{1,2}",
      fn: function(date, value) {
        setDatePart(date, 'Date', value, local);
      }
    },
    {
      pattern: /hh/,
      regexp: "\\d{1,2}",
      fn: function(date, value) {
        setDatePart(date, 'Hours', value, local);
      }
    },
    {
      pattern: /mm/,
      regexp: "\\d\\d",
      fn: function(date, value) {
        setDatePart(date, 'Minutes', value, local);
      }
    },
    {
      pattern: /ss/,
      regexp: "\\d\\d",
      fn: function(date, value) {
        setDatePart(date, 'Seconds', value, local);
      }
    },
    {
      pattern: /SSS/,
      regexp: "\\d\\d\\d",
      fn: function(date, value) {
        setDatePart(date, 'Milliseconds', value, local);
      }
    },
    {
      pattern: /O/,
      regexp: "[+-]\\d{3,4}|Z",
      fn: function(date, value) {
        if (value === "Z") {
          value = 0;
        }
        var offset = Math.abs(value);
        var timezoneOffset = (value > 0 ? -1 :  1 ) * ((offset % 100) + Math.floor(offset / 100) * 60);
        // Per ISO8601 standard: UTC = local time - offset
        //
        // For example, 2000-01-01T01:00:00-0700
        //   local time: 2000-01-01T01:00:00
        //   ==> UTC   : 2000-01-01T08:00:00 ( 01 - (-7) = 8 )
        //
        // To make it even more confusing, the date.getTimezoneOffset() is
        // opposite sign of offset string in the ISO8601 standard.  So if offset
        // is '-0700' the getTimezoneOffset() would be (+)420. The line above
        // calculates timezoneOffset to matche Javascript's behavior.
        //
        // The date/time of the input is actually the local time, so the date
        // object that was constructed is actually local time even thought the
        // UTC setters are used.  This means the date object's internal UTC
        // representation was wrong.  It needs to be fixed by substracting the
        // offset (or adding the offset minutes as they are opposite sign).
        //
        // Note: the time zone has to be processed after all other fileds are
        // set.  The result would be incorrect if the offset was calculated
        // first then overriden by the other filed setters.
        date.setUTCMinutes(date.getUTCMinutes() + timezoneOffset);
      }
    }
  ];

  var parsedPattern = matchers.reduce(
    function(p, m) {
      if (m.pattern.test(p.regexp)) {
        m.index = p.regexp.match(m.pattern).index;
        p.regexp = p.regexp.replace(m.pattern, "(" + m.regexp + ")");
      } else {
        m.index = -1;
      }
      return p;
    },
    { regexp: pattern, index: [] }
  );

  var dateFns = matchers.filter(function(m) {
    return m.index > -1;
  });
  dateFns.sort(function(a, b) {
    return a.index - b.index;
  });

  var matcher = new RegExp(parsedPattern.regexp);
  var matches = matcher.exec(str);
  if (matches) {
    var date = missingValuesDate || module.exports.now();
    dateFns.forEach(function(f, i) {
      f.fn(date, matches[i + 1]);
    });

    return date;
  }

  throw new Error(
    "String '" + str + "' could not be parsed as '" + pattern + "'"
  );
}

function parse(pattern, str, missingValuesDate) {
  if (!pattern) {
    throw new Error("pattern must be supplied");
  }

  return extractDateParts(pattern, str, missingValuesDate);
}

/**
 * Used for testing - replace this function with a fixed date.
 */
function now() {
  return new Date();
}

module.exports = asString;
module.exports.asString = asString;
module.exports.parse = parse;
module.exports.now = now;
module.exports.ISO8601_FORMAT = "yyyy-MM-ddThh:mm:ss.SSS";
module.exports.ISO8601_WITH_TZ_OFFSET_FORMAT = "yyyy-MM-ddThh:mm:ss.SSSO";
module.exports.DATETIME_FORMAT = "dd MM yyyy hh:mm:ss.SSS";
module.exports.ABSOLUTETIME_FORMAT = "hh:mm:ss.SSS";
}(lib$3));

const dateFormat = lib$3.exports;
const os$5 = require$$1__default["default"];
const util$1 = require$$2__default$1["default"];
const path$r = require$$1__default$1["default"];

const styles = {
  // styles
  bold: [1, 22],
  italic: [3, 23],
  underline: [4, 24],
  inverse: [7, 27],
  // grayscale
  white: [37, 39],
  grey: [90, 39],
  black: [90, 39],
  // colors
  blue: [34, 39],
  cyan: [36, 39],
  green: [32, 39],
  magenta: [35, 39],
  red: [91, 39],
  yellow: [33, 39]
};

function colorizeStart(style) {
  return style ? `\x1B[${styles[style][0]}m` : '';
}

function colorizeEnd(style) {
  return style ? `\x1B[${styles[style][1]}m` : '';
}

/**
 * Taken from masylum's fork (https://github.com/masylum/log4js-node)
 */
function colorize(str, style) {
  return colorizeStart(style) + str + colorizeEnd(style);
}

function timestampLevelAndCategory(loggingEvent, colour) {
  return colorize(
    util$1.format(
      '[%s] [%s] %s - ',
      dateFormat.asString(loggingEvent.startTime),
      loggingEvent.level.toString(),
      loggingEvent.categoryName
    ),
    colour
  );
}

/**
 * BasicLayout is a simple layout for storing the logs. The logs are stored
 * in following format:
 * <pre>
 * [startTime] [logLevel] categoryName - message\n
 * </pre>
 *
 * @author Stephan Strittmatter
 */
function basicLayout(loggingEvent) {
  return timestampLevelAndCategory(loggingEvent) + util$1.format(...loggingEvent.data);
}

/**
 * colouredLayout - taken from masylum's fork.
 * same as basicLayout, but with colours.
 */
function colouredLayout(loggingEvent) {
  return timestampLevelAndCategory(loggingEvent, loggingEvent.level.colour) + util$1.format(...loggingEvent.data);
}

function messagePassThroughLayout(loggingEvent) {
  return util$1.format(...loggingEvent.data);
}

function dummyLayout(loggingEvent) {
  return loggingEvent.data[0];
}

/**
 * PatternLayout
 * Format for specifiers is %[padding].[truncation][field]{[format]}
 * e.g. %5.10p - left pad the log level by 5 characters, up to a max of 10
 * both padding and truncation can be negative.
 * Negative truncation = trunc from end of string
 * Positive truncation = trunc from start of string
 * Negative padding = pad right
 * Positive padding = pad left
 *
 * Fields can be any of:
 *  - %r time in toLocaleTimeString format
 *  - %p log level
 *  - %c log category
 *  - %h hostname
 *  - %m log data
 *  - %d date in constious formats
 *  - %% %
 *  - %n newline
 *  - %z pid
 *  - %f filename
 *  - %l line number
 *  - %o column postion
 *  - %s call stack
 *  - %x{<tokenname>} add dynamic tokens to your log. Tokens are specified in the tokens parameter
 *  - %X{<tokenname>} add dynamic tokens to your log. Tokens are specified in logger context
 * You can use %[ and %] to define a colored block.
 *
 * Tokens are specified as simple key:value objects.
 * The key represents the token name whereas the value can be a string or function
 * which is called to extract the value to put in the log message. If token is not
 * found, it doesn't replace the field.
 *
 * A sample token would be: { 'pid' : function() { return process.pid; } }
 *
 * Takes a pattern string, array of tokens and returns a layout function.
 * @return {Function}
 * @param pattern
 * @param tokens
 * @param timezoneOffset
 *
 * @authors ['Stephan Strittmatter', 'Jan Schmidle']
 */
function patternLayout(pattern, tokens) {
  const TTCC_CONVERSION_PATTERN = '%r %p %c - %m%n';
  const regex = /%(-?[0-9]+)?(\.?-?[0-9]+)?([[\]cdhmnprzxXyflos%])(\{([^}]+)\})?|([^%]+)/;

  pattern = pattern || TTCC_CONVERSION_PATTERN;

  function categoryName(loggingEvent, specifier) {
    let loggerName = loggingEvent.categoryName;
    if (specifier) {
      const precision = parseInt(specifier, 10);
      const loggerNameBits = loggerName.split('.');
      if (precision < loggerNameBits.length) {
        loggerName = loggerNameBits.slice(loggerNameBits.length - precision).join('.');
      }
    }
    return loggerName;
  }

  function formatAsDate(loggingEvent, specifier) {
    let format = dateFormat.ISO8601_FORMAT;
    if (specifier) {
      format = specifier;
      // Pick up special cases
      if (format === 'ISO8601') {
        format = dateFormat.ISO8601_FORMAT;
      } else if (format === 'ISO8601_WITH_TZ_OFFSET') {
        format = dateFormat.ISO8601_WITH_TZ_OFFSET_FORMAT;
      } else if (format === 'ABSOLUTE') {
        format = dateFormat.ABSOLUTETIME_FORMAT;
      } else if (format === 'DATE') {
        format = dateFormat.DATETIME_FORMAT;
      }
    }
    // Format the date
    return dateFormat.asString(format, loggingEvent.startTime);
  }

  function hostname() {
    return os$5.hostname().toString();
  }

  function formatMessage(loggingEvent) {
    return util$1.format(...loggingEvent.data);
  }

  function endOfLine() {
    return os$5.EOL;
  }

  function logLevel(loggingEvent) {
    return loggingEvent.level.toString();
  }

  function startTime(loggingEvent) {
    return dateFormat.asString('hh:mm:ss', loggingEvent.startTime);
  }

  function startColour(loggingEvent) {
    return colorizeStart(loggingEvent.level.colour);
  }

  function endColour(loggingEvent) {
    return colorizeEnd(loggingEvent.level.colour);
  }

  function percent() {
    return '%';
  }

  function pid(loggingEvent) {
    return loggingEvent && loggingEvent.pid ? loggingEvent.pid.toString() : process.pid.toString();
  }

  function clusterInfo() {
    // this used to try to return the master and worker pids,
    // but it would never have worked because master pid is not available to workers
    // leaving this here to maintain compatibility for patterns
    return pid();
  }

  function userDefined(loggingEvent, specifier) {
    if (typeof tokens[specifier] !== 'undefined') {
      return typeof tokens[specifier] === 'function' ? tokens[specifier](loggingEvent) : tokens[specifier];
    }

    return null;
  }

  function contextDefined(loggingEvent, specifier) {
    const resolver = loggingEvent.context[specifier];

    if (typeof resolver !== 'undefined') {
      return typeof resolver === 'function' ? resolver(loggingEvent) : resolver;
    }

    return null;
  }

  function fileName(loggingEvent, specifier) {
    let filename = loggingEvent.fileName || '';
    if (specifier) {
      const fileDepth = parseInt(specifier, 10);
      const fileList = filename.split(path$r.sep);
      if (fileList.length > fileDepth) {
        filename = fileList.slice(-fileDepth).join(path$r.sep);
      }
    }

    return filename;
  }

  function lineNumber(loggingEvent) {
    return loggingEvent.lineNumber ? `${loggingEvent.lineNumber}` : '';
  }

  function columnNumber(loggingEvent) {
    return loggingEvent.columnNumber ? `${loggingEvent.columnNumber}` : '';
  }

  function callStack(loggingEvent) {
    return loggingEvent.callStack || '';
  }

  /* eslint quote-props:0 */
  const replacers = {
    c: categoryName,
    d: formatAsDate,
    h: hostname,
    m: formatMessage,
    n: endOfLine,
    p: logLevel,
    r: startTime,
    '[': startColour,
    ']': endColour,
    y: clusterInfo,
    z: pid,
    '%': percent,
    x: userDefined,
    X: contextDefined,
    f: fileName,
    l: lineNumber,
    o: columnNumber,
    s: callStack
  };

  function replaceToken(conversionCharacter, loggingEvent, specifier) {
    return replacers[conversionCharacter](loggingEvent, specifier);
  }

  function truncate(truncation, toTruncate) {
    let len;
    if (truncation) {
      len = parseInt(truncation.substr(1), 10);
      // negative truncate length means truncate from end of string
      return len > 0 ? toTruncate.slice(0, len) : toTruncate.slice(len);
    }

    return toTruncate;
  }

  function pad(padding, toPad) {
    let len;
    if (padding) {
      if (padding.charAt(0) === '-') {
        len = parseInt(padding.substr(1), 10);
        // Right pad with spaces
        while (toPad.length < len) {
          toPad += ' ';
        }
      } else {
        len = parseInt(padding, 10);
        // Left pad with spaces
        while (toPad.length < len) {
          toPad = ` ${toPad}`;
        }
      }
    }
    return toPad;
  }

  function truncateAndPad(toTruncAndPad, truncation, padding) {
    let replacement = toTruncAndPad;
    replacement = truncate(truncation, replacement);
    replacement = pad(padding, replacement);
    return replacement;
  }

  return function (loggingEvent) {
    let formattedString = '';
    let result;
    let searchString = pattern;

    /* eslint no-cond-assign:0 */
    while ((result = regex.exec(searchString)) !== null) {
      // const matchedString = result[0];
      const padding = result[1];
      const truncation = result[2];
      const conversionCharacter = result[3];
      const specifier = result[5];
      const text = result[6];

      // Check if the pattern matched was just normal text
      if (text) {
        formattedString += text.toString();
      } else {
        // Create a raw replacement string based on the conversion
        // character and specifier
        const replacement = replaceToken(conversionCharacter, loggingEvent, specifier);
        formattedString += truncateAndPad(replacement, truncation, padding);
      }
      searchString = searchString.substr(result.index + result[0].length);
    }
    return formattedString;
  };
}

const layoutMakers = {
  messagePassThrough () {
    return messagePassThroughLayout;
  },
  basic () {
    return basicLayout;
  },
  colored () {
    return colouredLayout;
  },
  coloured () {
    return colouredLayout;
  },
  pattern (config) {
    return patternLayout(config && config.pattern, config && config.tokens);
  },
  dummy () {
    return dummyLayout;
  }
};

var layouts$2 = {
  basicLayout,
  messagePassThroughLayout,
  patternLayout,
  colouredLayout,
  coloredLayout: colouredLayout,
  dummyLayout,
  addLayout (name, serializerGenerator) {
    layoutMakers[name] = serializerGenerator;
  },
  layout (name, config) {
    return layoutMakers[name] && layoutMakers[name](config);
  }
};

const configuration$5 = configuration$6;

const validColours = [
  'white', 'grey', 'black',
  'blue', 'cyan', 'green',
  'magenta', 'red', 'yellow'
];

class Level {
  constructor(level, levelStr, colour) {
    this.level = level;
    this.levelStr = levelStr;
    this.colour = colour;
  }

  toString() {
    return this.levelStr;
  }

  /**
   * converts given String to corresponding Level
   * @param {(Level|string)} sArg -- String value of Level OR Log4js.Level
   * @param {Level} [defaultLevel] -- default Level, if no String representation
   * @return {Level}
   */
  static getLevel(sArg, defaultLevel) {
    if (!sArg) {
      return defaultLevel;
    }

    if (sArg instanceof Level) {
      return sArg;
    }

    // a json-serialised level won't be an instance of Level (see issue #768)
    if (sArg instanceof Object && sArg.levelStr) {
      sArg = sArg.levelStr;
    }

    return Level[sArg.toString().toUpperCase()] || defaultLevel;
  }

  static addLevels(customLevels) {
    if (customLevels) {
      const levels = Object.keys(customLevels);
      levels.forEach((l) => {
        const levelStr = l.toUpperCase();
        Level[levelStr] = new Level(
          customLevels[l].value,
          levelStr,
          customLevels[l].colour
        );
        const existingLevelIndex = Level.levels.findIndex(lvl => lvl.levelStr === levelStr);
        if (existingLevelIndex > -1) {
          Level.levels[existingLevelIndex] = Level[levelStr];
        } else {
          Level.levels.push(Level[levelStr]);
        }
      });
      Level.levels.sort((a, b) => a.level - b.level);
    }
  }


  isLessThanOrEqualTo(otherLevel) {
    if (typeof otherLevel === 'string') {
      otherLevel = Level.getLevel(otherLevel);
    }
    return this.level <= otherLevel.level;
  }

  isGreaterThanOrEqualTo(otherLevel) {
    if (typeof otherLevel === 'string') {
      otherLevel = Level.getLevel(otherLevel);
    }
    return this.level >= otherLevel.level;
  }

  isEqualTo(otherLevel) {
    if (typeof otherLevel === 'string') {
      otherLevel = Level.getLevel(otherLevel);
    }
    return this.level === otherLevel.level;
  }
}

Level.levels = [];
Level.addLevels({
  ALL: { value: Number.MIN_VALUE, colour: 'grey' },
  TRACE: { value: 5000, colour: 'blue' },
  DEBUG: { value: 10000, colour: 'cyan' },
  INFO: { value: 20000, colour: 'green' },
  WARN: { value: 30000, colour: 'yellow' },
  ERROR: { value: 40000, colour: 'red' },
  FATAL: { value: 50000, colour: 'magenta' },
  MARK: { value: 9007199254740992, colour: 'grey' }, // 2^53
  OFF: { value: Number.MAX_VALUE, colour: 'grey' }
});

configuration$5.addListener((config) => {
  const levelConfig = config.levels;
  if (levelConfig) {
    configuration$5.throwExceptionIf(
      config,
      configuration$5.not(configuration$5.anObject(levelConfig)),
      'levels must be an object'
    );
    const newLevels = Object.keys(levelConfig);
    newLevels.forEach((l) => {
      configuration$5.throwExceptionIf(
        config,
        configuration$5.not(configuration$5.validIdentifier(l)),
        `level name "${l}" is not a valid identifier (must start with a letter, only contain A-Z,a-z,0-9,_)`
      );
      configuration$5.throwExceptionIf(
        config,
        configuration$5.not(configuration$5.anObject(levelConfig[l])),
        `level "${l}" must be an object`
      );
      configuration$5.throwExceptionIf(
        config,
        configuration$5.not(levelConfig[l].value),
        `level "${l}" must have a 'value' property`
      );
      configuration$5.throwExceptionIf(
        config,
        configuration$5.not(configuration$5.anInteger(levelConfig[l].value)),
        `level "${l}".value must have an integer value`
      );
      configuration$5.throwExceptionIf(
        config,
        configuration$5.not(levelConfig[l].colour),
        `level "${l}" must have a 'colour' property`
      );
      configuration$5.throwExceptionIf(
        config,
        configuration$5.not(validColours.indexOf(levelConfig[l].colour) > -1),
        `level "${l}".colour must be one of ${validColours.join(', ')}`
      );
    });
  }
});

configuration$5.addListener((config) => {
  Level.addLevels(config.levels);
});

var levels$6 = Level;

var Flatted = (function (Primitive, primitive) {

  /*!
   * ISC License
   *
   * Copyright (c) 2018, Andrea Giammarchi, @WebReflection
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
   * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
   * AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
   * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
   * LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE
   * OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
   * PERFORMANCE OF THIS SOFTWARE.
   */

  var Flatted = {

    parse: function parse(text, reviver) {
      var input = JSON.parse(text, Primitives).map(primitives);
      var value = input[0];
      var $ = reviver || noop;
      var tmp = typeof value === 'object' && value ?
                  revive(input, new Set, value, $) :
                  value;
      return $.call({'': tmp}, '', tmp);
    },

    stringify: function stringify(value, replacer, space) {
      for (var
        firstRun,
        known = new Map,
        input = [],
        output = [],
        $ = replacer && typeof replacer === typeof input ?
              function (k, v) {
                if (k === '' || -1 < replacer.indexOf(k)) return v;
              } :
              (replacer || noop),
        i = +set(known, input, $.call({'': value}, '', value)),
        replace = function (key, value) {
          if (firstRun) {
            firstRun = !firstRun;
            return value;
          }
          var after = $.call(this, key, value);
          switch (typeof after) {
            case 'object':
              if (after === null) return after;
            case primitive:
              return known.get(after) || set(known, input, after);
          }
          return after;
        };
        i < input.length; i++
      ) {
        firstRun = true;
        output[i] = JSON.stringify(input[i], replace, space);
      }
      return '[' + output.join(',') + ']';
    }

  };

  return Flatted;

  function noop(key, value) {
    return value;
  }

  function revive(input, parsed, output, $) {
    return Object.keys(output).reduce(
      function (output, key) {
        var value = output[key];
        if (value instanceof Primitive) {
          var tmp = input[value];
          if (typeof tmp === 'object' && !parsed.has(tmp)) {
            parsed.add(tmp);
            output[key] = $.call(output, key, revive(input, parsed, tmp, $));
          } else {
            output[key] = $.call(output, key, tmp);
          }
        } else
          output[key] = $.call(output, key, value);
        return output;
      },
      output
    );
  }

  function set(known, input, value) {
    var index = Primitive(input.push(value) - 1);
    known.set(value, index);
    return index;
  }

  // the two kinds of primitives
  //  1. the real one
  //  2. the wrapped one

  function primitives(value) {
    return value instanceof Primitive ? Primitive(value) : value;
  }

  function Primitives(key, value) {
    return typeof value === primitive ? new Primitive(value) : value;
  }

}(String, 'string'));
var parse$2 = Flatted.parse;
var stringify$1 = Flatted.stringify;

var esm = /*#__PURE__*/Object.freeze({
	__proto__: null,
	'default': Flatted,
	parse: parse$2,
	stringify: stringify$1
});

var require$$0 = /*@__PURE__*/getAugmentedNamespace(esm);

const flatted = require$$0;
const levels$5 = levels$6;

/**
 * @name LoggingEvent
 * @namespace Log4js
 */
class LoggingEvent$2 {
  /**
   * Models a logging event.
   * @constructor
   * @param {string} categoryName name of category
   * @param {Log4js.Level} level level of message
   * @param {Array} data objects to log
   * @author Seth Chisamore
   */
  constructor(categoryName, level, data, context, location) {
    this.startTime = new Date();
    this.categoryName = categoryName;
    this.data = data;
    this.level = level;
    this.context = Object.assign({}, context);
    this.pid = process.pid;

    if (location) {
      this.functionName = location.functionName;
      this.fileName = location.fileName;
      this.lineNumber = location.lineNumber;
      this.columnNumber = location.columnNumber;
      this.callStack = location.callStack;
    }
  }

  serialise() {
    const logData = this.data.map((e) => {
      // JSON.stringify(new Error('test')) returns {}, which is not really useful for us.
      // The following allows us to serialize errors correctly.
      if (e && e.message && e.stack) {
        e = Object.assign({ message: e.message, stack: e.stack }, e);
      }
      return e;
    });
    this.data = logData;
    return flatted.stringify(this);
  }

  static deserialise(serialised) {
    let event;
    try {
      const rehydratedEvent = flatted.parse(serialised);
      rehydratedEvent.data = rehydratedEvent.data.map((e) => {
        if (e && e.message && e.stack) {
          const fakeError = new Error(e);
          Object.keys(e).forEach((key) => { fakeError[key] = e[key]; });
          e = fakeError;
        }
        return e;
      });
      event = new LoggingEvent$2(
        rehydratedEvent.categoryName,
        levels$5.getLevel(rehydratedEvent.level.levelStr),
        rehydratedEvent.data,
        rehydratedEvent.context
      );
      event.startTime = new Date(rehydratedEvent.startTime);
      event.pid = rehydratedEvent.pid;
      event.cluster = rehydratedEvent.cluster;
    } catch (e) {
      event = new LoggingEvent$2(
        'log4js',
        levels$5.ERROR,
        ['Unable to parse log:', serialised, 'because: ', e]
      );
    }

    return event;
  }
}

var LoggingEvent_1 = LoggingEvent$2;

const debug$d = src.exports("log4js:clustering");
const LoggingEvent$1 = LoggingEvent_1;
const configuration$4 = configuration$6;

let disabled = false;
let cluster = null;
try {
  cluster = require("cluster"); //eslint-disable-line
} catch (e) {
  debug$d("cluster module not present");
  disabled = true;
}

const listeners = [];

let pm2 = false;
let pm2InstanceVar = "NODE_APP_INSTANCE";

const isPM2Master = () => pm2 && process.env[pm2InstanceVar] === "0";
const isMaster = () => disabled || cluster.isMaster || isPM2Master();

const sendToListeners = logEvent => {
  listeners.forEach(l => l(logEvent));
};

// in a multi-process node environment, worker loggers will use
// process.send
const receiver = (worker, message) => {
  // prior to node v6, the worker parameter was not passed (args were message, handle)
  debug$d("cluster message received from worker ", worker, ": ", message);
  if (worker.topic && worker.data) {
    message = worker;
    worker = undefined;
  }
  if (message && message.topic && message.topic === "log4js:message") {
    debug$d("received message: ", message.data);
    const logEvent = LoggingEvent$1.deserialise(message.data);
    sendToListeners(logEvent);
  }
};

if (!disabled) {
  configuration$4.addListener(config => {
    // clear out the listeners, because configure has been called.
    listeners.length = 0;

    ({
      pm2,
      disableClustering: disabled,
      pm2InstanceVar = "NODE_APP_INSTANCE"
    } = config);

    debug$d(`clustering disabled ? ${disabled}`);
    debug$d(`cluster.isMaster ? ${cluster && cluster.isMaster}`);
    debug$d(`pm2 enabled ? ${pm2}`);
    debug$d(`pm2InstanceVar = ${pm2InstanceVar}`);
    debug$d(`process.env[${pm2InstanceVar}] = ${process.env[pm2InstanceVar]}`);

    // just in case configure is called after shutdown
    if (pm2) {
      process.removeListener("message", receiver);
    }
    if (cluster && cluster.removeListener) {
      cluster.removeListener("message", receiver);
    }

    if (disabled || config.disableClustering) {
      debug$d("Not listening for cluster messages, because clustering disabled.");
    } else if (isPM2Master()) {
      // PM2 cluster support
      // PM2 runs everything as workers - install pm2-intercom for this to work.
      // we only want one of the app instances to write logs
      debug$d("listening for PM2 broadcast messages");
      process.on("message", receiver);
    } else if (cluster.isMaster) {
      debug$d("listening for cluster messages");
      cluster.on("message", receiver);
    } else {
      debug$d("not listening for messages, because we are not a master process");
    }
  });
}

var clustering$3 = {
  onlyOnMaster: (fn, notMaster) => (isMaster() ? fn() : notMaster),
  isMaster,
  send: msg => {
    if (isMaster()) {
      sendToListeners(msg);
    } else {
      if (!pm2) {
        msg.cluster = {
          workerId: cluster.worker.id,
          worker: process.pid
        };
      }
      process.send({ topic: "log4js:message", data: msg.serialise() });
    }
  },
  onMessage: listener => {
    listeners.push(listener);
  }
};

var adapters$2 = {};

function maxFileSizeUnitTransform(maxLogSize) {
  if (typeof maxLogSize === 'number' && Number.isInteger(maxLogSize)) {
    return maxLogSize;
  }

  const units = {
    K: 1024,
    M: 1024 * 1024,
    G: 1024 * 1024 * 1024,
  };
  const validUnit = Object.keys(units);
  const unit = maxLogSize.substr(maxLogSize.length - 1).toLocaleUpperCase();
  const value = maxLogSize.substring(0, maxLogSize.length - 1).trim();

  if (validUnit.indexOf(unit) < 0 || !Number.isInteger(Number(value))) {
    throw Error(`maxLogSize: "${maxLogSize}" is invalid`);
  } else {
    return value * units[unit];
  }
}

function adapter(configAdapter, config) {
  const newConfig = Object.assign({}, config);
  Object.keys(configAdapter).forEach((key) => {
    if (newConfig[key]) {
      newConfig[key] = configAdapter[key](config[key]);
    }
  });
  return newConfig;
}

function fileAppenderAdapter(config) {
  const configAdapter = {
    maxLogSize: maxFileSizeUnitTransform
  };
  return adapter(configAdapter, config);
}

const adapters$1 = {
  file: fileAppenderAdapter,
  fileSync: fileAppenderAdapter
};

adapters$2.modifyConfig = config => (adapters$1[config.type] ? adapters$1[config.type](config) : config);

var console$1 = {};

// eslint-disable-next-line no-console
const consoleLog = console.log.bind(console);

function consoleAppender(layout, timezoneOffset) {
  return (loggingEvent) => {
    consoleLog(layout(loggingEvent, timezoneOffset));
  };
}

function configure$9(config, layouts) {
  let layout = layouts.colouredLayout;
  if (config.layout) {
    layout = layouts.layout(config.layout.type, config.layout);
  }
  return consoleAppender(layout, config.timezoneOffset);
}

console$1.configure = configure$9;

var stdout = {};

function stdoutAppender(layout, timezoneOffset) {
  return (loggingEvent) => {
    process.stdout.write(`${layout(loggingEvent, timezoneOffset)}\n`);
  };
}

function configure$8(config, layouts) {
  let layout = layouts.colouredLayout;
  if (config.layout) {
    layout = layouts.layout(config.layout.type, config.layout);
  }
  return stdoutAppender(layout, config.timezoneOffset);
}

stdout.configure = configure$8;

var stderr = {};

function stderrAppender(layout, timezoneOffset) {
  return (loggingEvent) => {
    process.stderr.write(`${layout(loggingEvent, timezoneOffset)}\n`);
  };
}

function configure$7(config, layouts) {
  let layout = layouts.colouredLayout;
  if (config.layout) {
    layout = layouts.layout(config.layout.type, config.layout);
  }
  return stderrAppender(layout, config.timezoneOffset);
}

stderr.configure = configure$7;

var logLevelFilter$1 = {};

function logLevelFilter(minLevelString, maxLevelString, appender, levels) {
  const minLevel = levels.getLevel(minLevelString);
  const maxLevel = levels.getLevel(maxLevelString, levels.FATAL);
  return (logEvent) => {
    const eventLevel = logEvent.level;
    if (eventLevel.isGreaterThanOrEqualTo(minLevel) && eventLevel.isLessThanOrEqualTo(maxLevel)) {
      appender(logEvent);
    }
  };
}

function configure$6(config, layouts, findAppender, levels) {
  const appender = findAppender(config.appender);
  return logLevelFilter(config.level, config.maxLevel, appender, levels);
}

logLevelFilter$1.configure = configure$6;

var categoryFilter$1 = {};

const debug$c = src.exports('log4js:categoryFilter');

function categoryFilter(excludes, appender) {
  if (typeof excludes === 'string') excludes = [excludes];
  return (logEvent) => {
    debug$c(`Checking ${logEvent.categoryName} against ${excludes}`);
    if (excludes.indexOf(logEvent.categoryName) === -1) {
      debug$c('Not excluded, sending to appender');
      appender(logEvent);
    }
  };
}

function configure$5(config, layouts, findAppender) {
  const appender = findAppender(config.appender);
  return categoryFilter(config.exclude, appender);
}

categoryFilter$1.configure = configure$5;

var noLogFilter$1 = {};

const debug$b = src.exports('log4js:noLogFilter');

/**
 * The function removes empty or null regexp from the array
 * @param {string[]} regexp
 * @returns {string[]} a filtered string array with not empty or null regexp
 */
function removeNullOrEmptyRegexp(regexp) {
  const filtered = regexp.filter(el => ((el != null) && (el !== '')));
  return filtered;
}

/**
 * Returns a function that will exclude the events in case they match
 * with the regular expressions provided
 * @param {(string|string[])} filters contains the regexp that will be used for the evaluation
 * @param {*} appender
 * @returns {function}
 */
function noLogFilter(filters, appender) {
  return (logEvent) => {
    debug$b(`Checking data: ${logEvent.data} against filters: ${filters}`);
    if (typeof filters === 'string') {
      filters = [filters];
    }
    filters = removeNullOrEmptyRegexp(filters);
    const regex = new RegExp(filters.join('|'), 'i');
    if (filters.length === 0
      || logEvent.data.findIndex(value => regex.test(value)) < 0) {
      debug$b('Not excluded, sending to appender');
      appender(logEvent);
    }
  };
}

function configure$4(config, layouts, findAppender) {
  const appender = findAppender(config.appender);
  return noLogFilter(config.exclude, appender);
}

noLogFilter$1.configure = configure$4;

var file$2 = {};

var lib$2 = {exports: {}};

var fs$q = {};

var universalify = {};

universalify.fromCallback = function (fn) {
  return Object.defineProperty(function () {
    if (typeof arguments[arguments.length - 1] === 'function') fn.apply(this, arguments);
    else {
      return new Promise((resolve, reject) => {
        arguments[arguments.length] = (err, res) => {
          if (err) return reject(err)
          resolve(res);
        };
        arguments.length++;
        fn.apply(this, arguments);
      })
    }
  }, 'name', { value: fn.name })
};

universalify.fromPromise = function (fn) {
  return Object.defineProperty(function () {
    const cb = arguments[arguments.length - 1];
    if (typeof cb !== 'function') return fn.apply(this, arguments)
    else fn.apply(this, arguments).then(r => cb(null, r), cb);
  }, 'name', { value: fn.name })
};

var constants = require$$0__default$4["default"];

var origCwd = process.cwd;
var cwd = null;

var platform = process.env.GRACEFUL_FS_PLATFORM || process.platform;

process.cwd = function() {
  if (!cwd)
    cwd = origCwd.call(process);
  return cwd
};
try {
  process.cwd();
} catch (er) {}

// This check is needed until node.js 12 is required
if (typeof process.chdir === 'function') {
  var chdir = process.chdir;
  process.chdir = function (d) {
    cwd = null;
    chdir.call(process, d);
  };
  if (Object.setPrototypeOf) Object.setPrototypeOf(process.chdir, chdir);
}

var polyfills$1 = patch$1;

function patch$1 (fs) {
  // (re-)implement some things that are known busted or missing.

  // lchmod, broken prior to 0.6.2
  // back-port the fix here.
  if (constants.hasOwnProperty('O_SYMLINK') &&
      process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
    patchLchmod(fs);
  }

  // lutimes implementation, or no-op
  if (!fs.lutimes) {
    patchLutimes(fs);
  }

  // https://github.com/isaacs/node-graceful-fs/issues/4
  // Chown should not fail on einval or eperm if non-root.
  // It should not fail on enosys ever, as this just indicates
  // that a fs doesn't support the intended operation.

  fs.chown = chownFix(fs.chown);
  fs.fchown = chownFix(fs.fchown);
  fs.lchown = chownFix(fs.lchown);

  fs.chmod = chmodFix(fs.chmod);
  fs.fchmod = chmodFix(fs.fchmod);
  fs.lchmod = chmodFix(fs.lchmod);

  fs.chownSync = chownFixSync(fs.chownSync);
  fs.fchownSync = chownFixSync(fs.fchownSync);
  fs.lchownSync = chownFixSync(fs.lchownSync);

  fs.chmodSync = chmodFixSync(fs.chmodSync);
  fs.fchmodSync = chmodFixSync(fs.fchmodSync);
  fs.lchmodSync = chmodFixSync(fs.lchmodSync);

  fs.stat = statFix(fs.stat);
  fs.fstat = statFix(fs.fstat);
  fs.lstat = statFix(fs.lstat);

  fs.statSync = statFixSync(fs.statSync);
  fs.fstatSync = statFixSync(fs.fstatSync);
  fs.lstatSync = statFixSync(fs.lstatSync);

  // if lchmod/lchown do not exist, then make them no-ops
  if (!fs.lchmod) {
    fs.lchmod = function (path, mode, cb) {
      if (cb) process.nextTick(cb);
    };
    fs.lchmodSync = function () {};
  }
  if (!fs.lchown) {
    fs.lchown = function (path, uid, gid, cb) {
      if (cb) process.nextTick(cb);
    };
    fs.lchownSync = function () {};
  }

  // on Windows, A/V software can lock the directory, causing this
  // to fail with an EACCES or EPERM if the directory contains newly
  // created files.  Try again on failure, for up to 60 seconds.

  // Set the timeout this long because some Windows Anti-Virus, such as Parity
  // bit9, may lock files for up to a minute, causing npm package install
  // failures. Also, take care to yield the scheduler. Windows scheduling gives
  // CPU to a busy looping process, which can cause the program causing the lock
  // contention to be starved of CPU by node, so the contention doesn't resolve.
  if (platform === "win32") {
    fs.rename = (function (fs$rename) { return function (from, to, cb) {
      var start = Date.now();
      var backoff = 0;
      fs$rename(from, to, function CB (er) {
        if (er
            && (er.code === "EACCES" || er.code === "EPERM")
            && Date.now() - start < 60000) {
          setTimeout(function() {
            fs.stat(to, function (stater, st) {
              if (stater && stater.code === "ENOENT")
                fs$rename(from, to, CB);
              else
                cb(er);
            });
          }, backoff);
          if (backoff < 100)
            backoff += 10;
          return;
        }
        if (cb) cb(er);
      });
    }})(fs.rename);
  }

  // if read() returns EAGAIN, then just try it again.
  fs.read = (function (fs$read) {
    function read (fd, buffer, offset, length, position, callback_) {
      var callback;
      if (callback_ && typeof callback_ === 'function') {
        var eagCounter = 0;
        callback = function (er, _, __) {
          if (er && er.code === 'EAGAIN' && eagCounter < 10) {
            eagCounter ++;
            return fs$read.call(fs, fd, buffer, offset, length, position, callback)
          }
          callback_.apply(this, arguments);
        };
      }
      return fs$read.call(fs, fd, buffer, offset, length, position, callback)
    }

    // This ensures `util.promisify` works as it does for native `fs.read`.
    if (Object.setPrototypeOf) Object.setPrototypeOf(read, fs$read);
    return read
  })(fs.read);

  fs.readSync = (function (fs$readSync) { return function (fd, buffer, offset, length, position) {
    var eagCounter = 0;
    while (true) {
      try {
        return fs$readSync.call(fs, fd, buffer, offset, length, position)
      } catch (er) {
        if (er.code === 'EAGAIN' && eagCounter < 10) {
          eagCounter ++;
          continue
        }
        throw er
      }
    }
  }})(fs.readSync);

  function patchLchmod (fs) {
    fs.lchmod = function (path, mode, callback) {
      fs.open( path
             , constants.O_WRONLY | constants.O_SYMLINK
             , mode
             , function (err, fd) {
        if (err) {
          if (callback) callback(err);
          return
        }
        // prefer to return the chmod error, if one occurs,
        // but still try to close, and report closing errors if they occur.
        fs.fchmod(fd, mode, function (err) {
          fs.close(fd, function(err2) {
            if (callback) callback(err || err2);
          });
        });
      });
    };

    fs.lchmodSync = function (path, mode) {
      var fd = fs.openSync(path, constants.O_WRONLY | constants.O_SYMLINK, mode);

      // prefer to return the chmod error, if one occurs,
      // but still try to close, and report closing errors if they occur.
      var threw = true;
      var ret;
      try {
        ret = fs.fchmodSync(fd, mode);
        threw = false;
      } finally {
        if (threw) {
          try {
            fs.closeSync(fd);
          } catch (er) {}
        } else {
          fs.closeSync(fd);
        }
      }
      return ret
    };
  }

  function patchLutimes (fs) {
    if (constants.hasOwnProperty("O_SYMLINK")) {
      fs.lutimes = function (path, at, mt, cb) {
        fs.open(path, constants.O_SYMLINK, function (er, fd) {
          if (er) {
            if (cb) cb(er);
            return
          }
          fs.futimes(fd, at, mt, function (er) {
            fs.close(fd, function (er2) {
              if (cb) cb(er || er2);
            });
          });
        });
      };

      fs.lutimesSync = function (path, at, mt) {
        var fd = fs.openSync(path, constants.O_SYMLINK);
        var ret;
        var threw = true;
        try {
          ret = fs.futimesSync(fd, at, mt);
          threw = false;
        } finally {
          if (threw) {
            try {
              fs.closeSync(fd);
            } catch (er) {}
          } else {
            fs.closeSync(fd);
          }
        }
        return ret
      };

    } else {
      fs.lutimes = function (_a, _b, _c, cb) { if (cb) process.nextTick(cb); };
      fs.lutimesSync = function () {};
    }
  }

  function chmodFix (orig) {
    if (!orig) return orig
    return function (target, mode, cb) {
      return orig.call(fs, target, mode, function (er) {
        if (chownErOk(er)) er = null;
        if (cb) cb.apply(this, arguments);
      })
    }
  }

  function chmodFixSync (orig) {
    if (!orig) return orig
    return function (target, mode) {
      try {
        return orig.call(fs, target, mode)
      } catch (er) {
        if (!chownErOk(er)) throw er
      }
    }
  }


  function chownFix (orig) {
    if (!orig) return orig
    return function (target, uid, gid, cb) {
      return orig.call(fs, target, uid, gid, function (er) {
        if (chownErOk(er)) er = null;
        if (cb) cb.apply(this, arguments);
      })
    }
  }

  function chownFixSync (orig) {
    if (!orig) return orig
    return function (target, uid, gid) {
      try {
        return orig.call(fs, target, uid, gid)
      } catch (er) {
        if (!chownErOk(er)) throw er
      }
    }
  }

  function statFix (orig) {
    if (!orig) return orig
    // Older versions of Node erroneously returned signed integers for
    // uid + gid.
    return function (target, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = null;
      }
      function callback (er, stats) {
        if (stats) {
          if (stats.uid < 0) stats.uid += 0x100000000;
          if (stats.gid < 0) stats.gid += 0x100000000;
        }
        if (cb) cb.apply(this, arguments);
      }
      return options ? orig.call(fs, target, options, callback)
        : orig.call(fs, target, callback)
    }
  }

  function statFixSync (orig) {
    if (!orig) return orig
    // Older versions of Node erroneously returned signed integers for
    // uid + gid.
    return function (target, options) {
      var stats = options ? orig.call(fs, target, options)
        : orig.call(fs, target);
      if (stats.uid < 0) stats.uid += 0x100000000;
      if (stats.gid < 0) stats.gid += 0x100000000;
      return stats;
    }
  }

  // ENOSYS means that the fs doesn't support the op. Just ignore
  // that, because it doesn't matter.
  //
  // if there's no getuid, or if getuid() is something other
  // than 0, and the error is EINVAL or EPERM, then just ignore
  // it.
  //
  // This specific case is a silent failure in cp, install, tar,
  // and most other unix tools that manage permissions.
  //
  // When running as root, or if other types of errors are
  // encountered, then it's strict.
  function chownErOk (er) {
    if (!er)
      return true

    if (er.code === "ENOSYS")
      return true

    var nonroot = !process.getuid || process.getuid() !== 0;
    if (nonroot) {
      if (er.code === "EINVAL" || er.code === "EPERM")
        return true
    }

    return false
  }
}

var Stream = require$$0__default$2["default"].Stream;

var legacyStreams = legacy$1;

function legacy$1 (fs) {
  return {
    ReadStream: ReadStream,
    WriteStream: WriteStream
  }

  function ReadStream (path, options) {
    if (!(this instanceof ReadStream)) return new ReadStream(path, options);

    Stream.call(this);

    var self = this;

    this.path = path;
    this.fd = null;
    this.readable = true;
    this.paused = false;

    this.flags = 'r';
    this.mode = 438; /*=0666*/
    this.bufferSize = 64 * 1024;

    options = options || {};

    // Mixin options into this
    var keys = Object.keys(options);
    for (var index = 0, length = keys.length; index < length; index++) {
      var key = keys[index];
      this[key] = options[key];
    }

    if (this.encoding) this.setEncoding(this.encoding);

    if (this.start !== undefined) {
      if ('number' !== typeof this.start) {
        throw TypeError('start must be a Number');
      }
      if (this.end === undefined) {
        this.end = Infinity;
      } else if ('number' !== typeof this.end) {
        throw TypeError('end must be a Number');
      }

      if (this.start > this.end) {
        throw new Error('start must be <= end');
      }

      this.pos = this.start;
    }

    if (this.fd !== null) {
      process.nextTick(function() {
        self._read();
      });
      return;
    }

    fs.open(this.path, this.flags, this.mode, function (err, fd) {
      if (err) {
        self.emit('error', err);
        self.readable = false;
        return;
      }

      self.fd = fd;
      self.emit('open', fd);
      self._read();
    });
  }

  function WriteStream (path, options) {
    if (!(this instanceof WriteStream)) return new WriteStream(path, options);

    Stream.call(this);

    this.path = path;
    this.fd = null;
    this.writable = true;

    this.flags = 'w';
    this.encoding = 'binary';
    this.mode = 438; /*=0666*/
    this.bytesWritten = 0;

    options = options || {};

    // Mixin options into this
    var keys = Object.keys(options);
    for (var index = 0, length = keys.length; index < length; index++) {
      var key = keys[index];
      this[key] = options[key];
    }

    if (this.start !== undefined) {
      if ('number' !== typeof this.start) {
        throw TypeError('start must be a Number');
      }
      if (this.start < 0) {
        throw new Error('start must be >= zero');
      }

      this.pos = this.start;
    }

    this.busy = false;
    this._queue = [];

    if (this.fd === null) {
      this._open = fs.open;
      this._queue.push([this._open, this.path, this.flags, this.mode, undefined]);
      this.flush();
    }
  }
}

var clone_1 = clone$1;

var getPrototypeOf = Object.getPrototypeOf || function (obj) {
  return obj.__proto__
};

function clone$1 (obj) {
  if (obj === null || typeof obj !== 'object')
    return obj

  if (obj instanceof Object)
    var copy = { __proto__: getPrototypeOf(obj) };
  else
    var copy = Object.create(null);

  Object.getOwnPropertyNames(obj).forEach(function (key) {
    Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key));
  });

  return copy
}

var fs$p = require$$0__default$5["default"];
var polyfills = polyfills$1;
var legacy = legacyStreams;
var clone = clone_1;

var util = require$$2__default$1["default"];

/* istanbul ignore next - node 0.x polyfill */
var gracefulQueue;
var previousSymbol;

/* istanbul ignore else - node 0.x polyfill */
if (typeof Symbol === 'function' && typeof Symbol.for === 'function') {
  gracefulQueue = Symbol.for('graceful-fs.queue');
  // This is used in testing by future versions
  previousSymbol = Symbol.for('graceful-fs.previous');
} else {
  gracefulQueue = '___graceful-fs.queue';
  previousSymbol = '___graceful-fs.previous';
}

function noop () {}

function publishQueue(context, queue) {
  Object.defineProperty(context, gracefulQueue, {
    get: function() {
      return queue
    }
  });
}

var debug$a = noop;
if (util.debuglog)
  debug$a = util.debuglog('gfs4');
else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ''))
  debug$a = function() {
    var m = util.format.apply(util, arguments);
    m = 'GFS4: ' + m.split(/\n/).join('\nGFS4: ');
    console.error(m);
  };

// Once time initialization
if (!fs$p[gracefulQueue]) {
  // This queue can be shared by multiple loaded instances
  var queue = commonjsGlobal[gracefulQueue] || [];
  publishQueue(fs$p, queue);

  // Patch fs.close/closeSync to shared queue version, because we need
  // to retry() whenever a close happens *anywhere* in the program.
  // This is essential when multiple graceful-fs instances are
  // in play at the same time.
  fs$p.close = (function (fs$close) {
    function close (fd, cb) {
      return fs$close.call(fs$p, fd, function (err) {
        // This function uses the graceful-fs shared queue
        if (!err) {
          resetQueue();
        }

        if (typeof cb === 'function')
          cb.apply(this, arguments);
      })
    }

    Object.defineProperty(close, previousSymbol, {
      value: fs$close
    });
    return close
  })(fs$p.close);

  fs$p.closeSync = (function (fs$closeSync) {
    function closeSync (fd) {
      // This function uses the graceful-fs shared queue
      fs$closeSync.apply(fs$p, arguments);
      resetQueue();
    }

    Object.defineProperty(closeSync, previousSymbol, {
      value: fs$closeSync
    });
    return closeSync
  })(fs$p.closeSync);

  if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || '')) {
    process.on('exit', function() {
      debug$a(fs$p[gracefulQueue]);
      require$$0__default["default"].equal(fs$p[gracefulQueue].length, 0);
    });
  }
}

if (!commonjsGlobal[gracefulQueue]) {
  publishQueue(commonjsGlobal, fs$p[gracefulQueue]);
}

var gracefulFs = patch(clone(fs$p));
if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs$p.__patched) {
    gracefulFs = patch(fs$p);
    fs$p.__patched = true;
}

function patch (fs) {
  // Everything that references the open() function needs to be in here
  polyfills(fs);
  fs.gracefulify = patch;

  fs.createReadStream = createReadStream;
  fs.createWriteStream = createWriteStream;
  var fs$readFile = fs.readFile;
  fs.readFile = readFile;
  function readFile (path, options, cb) {
    if (typeof options === 'function')
      cb = options, options = null;

    return go$readFile(path, options, cb)

    function go$readFile (path, options, cb, startTime) {
      return fs$readFile(path, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$readFile, [path, options, cb], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments);
        }
      })
    }
  }

  var fs$writeFile = fs.writeFile;
  fs.writeFile = writeFile;
  function writeFile (path, data, options, cb) {
    if (typeof options === 'function')
      cb = options, options = null;

    return go$writeFile(path, data, options, cb)

    function go$writeFile (path, data, options, cb, startTime) {
      return fs$writeFile(path, data, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$writeFile, [path, data, options, cb], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments);
        }
      })
    }
  }

  var fs$appendFile = fs.appendFile;
  if (fs$appendFile)
    fs.appendFile = appendFile;
  function appendFile (path, data, options, cb) {
    if (typeof options === 'function')
      cb = options, options = null;

    return go$appendFile(path, data, options, cb)

    function go$appendFile (path, data, options, cb, startTime) {
      return fs$appendFile(path, data, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$appendFile, [path, data, options, cb], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments);
        }
      })
    }
  }

  var fs$copyFile = fs.copyFile;
  if (fs$copyFile)
    fs.copyFile = copyFile;
  function copyFile (src, dest, flags, cb) {
    if (typeof flags === 'function') {
      cb = flags;
      flags = 0;
    }
    return go$copyFile(src, dest, flags, cb)

    function go$copyFile (src, dest, flags, cb, startTime) {
      return fs$copyFile(src, dest, flags, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$copyFile, [src, dest, flags, cb], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments);
        }
      })
    }
  }

  var fs$readdir = fs.readdir;
  fs.readdir = readdir;
  function readdir (path, options, cb) {
    if (typeof options === 'function')
      cb = options, options = null;

    return go$readdir(path, options, cb)

    function go$readdir (path, options, cb, startTime) {
      return fs$readdir(path, options, function (err, files) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$readdir, [path, options, cb], err, startTime || Date.now(), Date.now()]);
        else {
          if (files && files.sort)
            files.sort();

          if (typeof cb === 'function')
            cb.call(this, err, files);
        }
      })
    }
  }

  if (process.version.substr(0, 4) === 'v0.8') {
    var legStreams = legacy(fs);
    ReadStream = legStreams.ReadStream;
    WriteStream = legStreams.WriteStream;
  }

  var fs$ReadStream = fs.ReadStream;
  if (fs$ReadStream) {
    ReadStream.prototype = Object.create(fs$ReadStream.prototype);
    ReadStream.prototype.open = ReadStream$open;
  }

  var fs$WriteStream = fs.WriteStream;
  if (fs$WriteStream) {
    WriteStream.prototype = Object.create(fs$WriteStream.prototype);
    WriteStream.prototype.open = WriteStream$open;
  }

  Object.defineProperty(fs, 'ReadStream', {
    get: function () {
      return ReadStream
    },
    set: function (val) {
      ReadStream = val;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(fs, 'WriteStream', {
    get: function () {
      return WriteStream
    },
    set: function (val) {
      WriteStream = val;
    },
    enumerable: true,
    configurable: true
  });

  // legacy names
  var FileReadStream = ReadStream;
  Object.defineProperty(fs, 'FileReadStream', {
    get: function () {
      return FileReadStream
    },
    set: function (val) {
      FileReadStream = val;
    },
    enumerable: true,
    configurable: true
  });
  var FileWriteStream = WriteStream;
  Object.defineProperty(fs, 'FileWriteStream', {
    get: function () {
      return FileWriteStream
    },
    set: function (val) {
      FileWriteStream = val;
    },
    enumerable: true,
    configurable: true
  });

  function ReadStream (path, options) {
    if (this instanceof ReadStream)
      return fs$ReadStream.apply(this, arguments), this
    else
      return ReadStream.apply(Object.create(ReadStream.prototype), arguments)
  }

  function ReadStream$open () {
    var that = this;
    open(that.path, that.flags, that.mode, function (err, fd) {
      if (err) {
        if (that.autoClose)
          that.destroy();

        that.emit('error', err);
      } else {
        that.fd = fd;
        that.emit('open', fd);
        that.read();
      }
    });
  }

  function WriteStream (path, options) {
    if (this instanceof WriteStream)
      return fs$WriteStream.apply(this, arguments), this
    else
      return WriteStream.apply(Object.create(WriteStream.prototype), arguments)
  }

  function WriteStream$open () {
    var that = this;
    open(that.path, that.flags, that.mode, function (err, fd) {
      if (err) {
        that.destroy();
        that.emit('error', err);
      } else {
        that.fd = fd;
        that.emit('open', fd);
      }
    });
  }

  function createReadStream (path, options) {
    return new fs.ReadStream(path, options)
  }

  function createWriteStream (path, options) {
    return new fs.WriteStream(path, options)
  }

  var fs$open = fs.open;
  fs.open = open;
  function open (path, flags, mode, cb) {
    if (typeof mode === 'function')
      cb = mode, mode = null;

    return go$open(path, flags, mode, cb)

    function go$open (path, flags, mode, cb, startTime) {
      return fs$open(path, flags, mode, function (err, fd) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$open, [path, flags, mode, cb], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments);
        }
      })
    }
  }

  return fs
}

function enqueue (elem) {
  debug$a('ENQUEUE', elem[0].name, elem[1]);
  fs$p[gracefulQueue].push(elem);
  retry();
}

// keep track of the timeout between retry() calls
var retryTimer;

// reset the startTime and lastTime to now
// this resets the start of the 60 second overall timeout as well as the
// delay between attempts so that we'll retry these jobs sooner
function resetQueue () {
  var now = Date.now();
  for (var i = 0; i < fs$p[gracefulQueue].length; ++i) {
    // entries that are only a length of 2 are from an older version, don't
    // bother modifying those since they'll be retried anyway.
    if (fs$p[gracefulQueue][i].length > 2) {
      fs$p[gracefulQueue][i][3] = now; // startTime
      fs$p[gracefulQueue][i][4] = now; // lastTime
    }
  }
  // call retry to make sure we're actively processing the queue
  retry();
}

function retry () {
  // clear the timer and remove it to help prevent unintended concurrency
  clearTimeout(retryTimer);
  retryTimer = undefined;

  if (fs$p[gracefulQueue].length === 0)
    return

  var elem = fs$p[gracefulQueue].shift();
  var fn = elem[0];
  var args = elem[1];
  // these items may be unset if they were added by an older graceful-fs
  var err = elem[2];
  var startTime = elem[3];
  var lastTime = elem[4];

  // if we don't have a startTime we have no way of knowing if we've waited
  // long enough, so go ahead and retry this item now
  if (startTime === undefined) {
    debug$a('RETRY', fn.name, args);
    fn.apply(null, args);
  } else if (Date.now() - startTime >= 60000) {
    // it's been more than 60 seconds total, bail now
    debug$a('TIMEOUT', fn.name, args);
    var cb = args.pop();
    if (typeof cb === 'function')
      cb.call(null, err);
  } else {
    // the amount of time between the last attempt and right now
    var sinceAttempt = Date.now() - lastTime;
    // the amount of time between when we first tried, and when we last tried
    // rounded up to at least 1
    var sinceStart = Math.max(lastTime - startTime, 1);
    // backoff. wait longer than the total time we've been retrying, but only
    // up to a maximum of 100ms
    var desiredDelay = Math.min(sinceStart * 1.2, 100);
    // it's been long enough since the last retry, do it again
    if (sinceAttempt >= desiredDelay) {
      debug$a('RETRY', fn.name, args);
      fn.apply(null, args.concat([startTime]));
    } else {
      // if we can't do this job yet, push it to the end of the queue
      // and let the next iteration check again
      fs$p[gracefulQueue].push(elem);
    }
  }

  // schedule our next run if one isn't already scheduled
  if (retryTimer === undefined) {
    retryTimer = setTimeout(retry, 0);
  }
}

(function (exports) {
// This is adapted from https://github.com/normalize/mz
// Copyright (c) 2014-2016 Jonathan Ong me@jongleberry.com and Contributors
const u = universalify.fromCallback;
const fs = gracefulFs;

const api = [
  'access',
  'appendFile',
  'chmod',
  'chown',
  'close',
  'copyFile',
  'fchmod',
  'fchown',
  'fdatasync',
  'fstat',
  'fsync',
  'ftruncate',
  'futimes',
  'lchown',
  'lchmod',
  'link',
  'lstat',
  'mkdir',
  'mkdtemp',
  'open',
  'readFile',
  'readdir',
  'readlink',
  'realpath',
  'rename',
  'rmdir',
  'stat',
  'symlink',
  'truncate',
  'unlink',
  'utimes',
  'writeFile'
].filter(key => {
  // Some commands are not available on some systems. Ex:
  // fs.copyFile was added in Node.js v8.5.0
  // fs.mkdtemp was added in Node.js v5.10.0
  // fs.lchown is not available on at least some Linux
  return typeof fs[key] === 'function'
});

// Export all keys:
Object.keys(fs).forEach(key => {
  if (key === 'promises') {
    // fs.promises is a getter property that triggers ExperimentalWarning
    // Don't re-export it here, the getter is defined in "lib/index.js"
    return
  }
  exports[key] = fs[key];
});

// Universalify async methods:
api.forEach(method => {
  exports[method] = u(fs[method]);
});

// We differ from mz/fs in that we still ship the old, broken, fs.exists()
// since we are a drop-in replacement for the native module
exports.exists = function (filename, callback) {
  if (typeof callback === 'function') {
    return fs.exists(filename, callback)
  }
  return new Promise(resolve => {
    return fs.exists(filename, resolve)
  })
};

// fs.read() & fs.write need special treatment due to multiple callback args

exports.read = function (fd, buffer, offset, length, position, callback) {
  if (typeof callback === 'function') {
    return fs.read(fd, buffer, offset, length, position, callback)
  }
  return new Promise((resolve, reject) => {
    fs.read(fd, buffer, offset, length, position, (err, bytesRead, buffer) => {
      if (err) return reject(err)
      resolve({ bytesRead, buffer });
    });
  })
};

// Function signature can be
// fs.write(fd, buffer[, offset[, length[, position]]], callback)
// OR
// fs.write(fd, string[, position[, encoding]], callback)
// We need to handle both cases, so we use ...args
exports.write = function (fd, buffer, ...args) {
  if (typeof args[args.length - 1] === 'function') {
    return fs.write(fd, buffer, ...args)
  }

  return new Promise((resolve, reject) => {
    fs.write(fd, buffer, ...args, (err, bytesWritten, buffer) => {
      if (err) return reject(err)
      resolve({ bytesWritten, buffer });
    });
  })
};

// fs.realpath.native only available in Node v9.2+
if (typeof fs.realpath.native === 'function') {
  exports.realpath.native = u(fs.realpath.native);
}
}(fs$q));

const path$q = require$$1__default$1["default"];

// get drive on windows
function getRootPath (p) {
  p = path$q.normalize(path$q.resolve(p)).split(path$q.sep);
  if (p.length > 0) return p[0]
  return null
}

// http://stackoverflow.com/a/62888/10333 contains more accurate
// TODO: expand to include the rest
const INVALID_PATH_CHARS = /[<>:"|?*]/;

function invalidWin32Path$2 (p) {
  const rp = getRootPath(p);
  p = p.replace(rp, '');
  return INVALID_PATH_CHARS.test(p)
}

var win32 = {
  getRootPath,
  invalidWin32Path: invalidWin32Path$2
};

const fs$o = gracefulFs;
const path$p = require$$1__default$1["default"];
const invalidWin32Path$1 = win32.invalidWin32Path;

const o777$1 = parseInt('0777', 8);

function mkdirs$2 (p, opts, callback, made) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  } else if (!opts || typeof opts !== 'object') {
    opts = { mode: opts };
  }

  if (process.platform === 'win32' && invalidWin32Path$1(p)) {
    const errInval = new Error(p + ' contains invalid WIN32 path characters.');
    errInval.code = 'EINVAL';
    return callback(errInval)
  }

  let mode = opts.mode;
  const xfs = opts.fs || fs$o;

  if (mode === undefined) {
    mode = o777$1 & (~process.umask());
  }
  if (!made) made = null;

  callback = callback || function () {};
  p = path$p.resolve(p);

  xfs.mkdir(p, mode, er => {
    if (!er) {
      made = made || p;
      return callback(null, made)
    }
    switch (er.code) {
      case 'ENOENT':
        if (path$p.dirname(p) === p) return callback(er)
        mkdirs$2(path$p.dirname(p), opts, (er, made) => {
          if (er) callback(er, made);
          else mkdirs$2(p, opts, callback, made);
        });
        break

      // In the case of any other error, just see if there's a dir
      // there already.  If so, then hooray!  If not, then something
      // is borked.
      default:
        xfs.stat(p, (er2, stat) => {
          // if the stat fails, then that's super weird.
          // let the original error be the failure reason.
          if (er2 || !stat.isDirectory()) callback(er, made);
          else callback(null, made);
        });
        break
    }
  });
}

var mkdirs_1$1 = mkdirs$2;

const fs$n = gracefulFs;
const path$o = require$$1__default$1["default"];
const invalidWin32Path = win32.invalidWin32Path;

const o777 = parseInt('0777', 8);

function mkdirsSync$2 (p, opts, made) {
  if (!opts || typeof opts !== 'object') {
    opts = { mode: opts };
  }

  let mode = opts.mode;
  const xfs = opts.fs || fs$n;

  if (process.platform === 'win32' && invalidWin32Path(p)) {
    const errInval = new Error(p + ' contains invalid WIN32 path characters.');
    errInval.code = 'EINVAL';
    throw errInval
  }

  if (mode === undefined) {
    mode = o777 & (~process.umask());
  }
  if (!made) made = null;

  p = path$o.resolve(p);

  try {
    xfs.mkdirSync(p, mode);
    made = made || p;
  } catch (err0) {
    if (err0.code === 'ENOENT') {
      if (path$o.dirname(p) === p) throw err0
      made = mkdirsSync$2(path$o.dirname(p), opts, made);
      mkdirsSync$2(p, opts, made);
    } else {
      // In the case of any other error, just see if there's a dir there
      // already. If so, then hooray!  If not, then something is borked.
      let stat;
      try {
        stat = xfs.statSync(p);
      } catch (err1) {
        throw err0
      }
      if (!stat.isDirectory()) throw err0
    }
  }

  return made
}

var mkdirsSync_1 = mkdirsSync$2;

const u$b = universalify.fromCallback;
const mkdirs$1 = u$b(mkdirs_1$1);
const mkdirsSync$1 = mkdirsSync_1;

var mkdirs_1 = {
  mkdirs: mkdirs$1,
  mkdirsSync: mkdirsSync$1,
  // alias
  mkdirp: mkdirs$1,
  mkdirpSync: mkdirsSync$1,
  ensureDir: mkdirs$1,
  ensureDirSync: mkdirsSync$1
};

const fs$m = gracefulFs;
const os$4 = require$$1__default["default"];
const path$n = require$$1__default$1["default"];

// HFS, ext{2,3}, FAT do not, Node.js v0.10 does not
function hasMillisResSync () {
  let tmpfile = path$n.join('millis-test-sync' + Date.now().toString() + Math.random().toString().slice(2));
  tmpfile = path$n.join(os$4.tmpdir(), tmpfile);

  // 550 millis past UNIX epoch
  const d = new Date(1435410243862);
  fs$m.writeFileSync(tmpfile, 'https://github.com/jprichardson/node-fs-extra/pull/141');
  const fd = fs$m.openSync(tmpfile, 'r+');
  fs$m.futimesSync(fd, d, d);
  fs$m.closeSync(fd);
  return fs$m.statSync(tmpfile).mtime > 1435410243000
}

function hasMillisRes (callback) {
  let tmpfile = path$n.join('millis-test' + Date.now().toString() + Math.random().toString().slice(2));
  tmpfile = path$n.join(os$4.tmpdir(), tmpfile);

  // 550 millis past UNIX epoch
  const d = new Date(1435410243862);
  fs$m.writeFile(tmpfile, 'https://github.com/jprichardson/node-fs-extra/pull/141', err => {
    if (err) return callback(err)
    fs$m.open(tmpfile, 'r+', (err, fd) => {
      if (err) return callback(err)
      fs$m.futimes(fd, d, d, err => {
        if (err) return callback(err)
        fs$m.close(fd, err => {
          if (err) return callback(err)
          fs$m.stat(tmpfile, (err, stats) => {
            if (err) return callback(err)
            callback(null, stats.mtime > 1435410243000);
          });
        });
      });
    });
  });
}

function timeRemoveMillis (timestamp) {
  if (typeof timestamp === 'number') {
    return Math.floor(timestamp / 1000) * 1000
  } else if (timestamp instanceof Date) {
    return new Date(Math.floor(timestamp.getTime() / 1000) * 1000)
  } else {
    throw new Error('fs-extra: timeRemoveMillis() unknown parameter type')
  }
}

function utimesMillis (path, atime, mtime, callback) {
  // if (!HAS_MILLIS_RES) return fs.utimes(path, atime, mtime, callback)
  fs$m.open(path, 'r+', (err, fd) => {
    if (err) return callback(err)
    fs$m.futimes(fd, atime, mtime, futimesErr => {
      fs$m.close(fd, closeErr => {
        if (callback) callback(futimesErr || closeErr);
      });
    });
  });
}

function utimesMillisSync (path, atime, mtime) {
  const fd = fs$m.openSync(path, 'r+');
  fs$m.futimesSync(fd, atime, mtime);
  return fs$m.closeSync(fd)
}

var utimes$1 = {
  hasMillisRes,
  hasMillisResSync,
  timeRemoveMillis,
  utimesMillis,
  utimesMillisSync
};

const fs$l = gracefulFs;
const path$m = require$$1__default$1["default"];

const NODE_VERSION_MAJOR_WITH_BIGINT = 10;
const NODE_VERSION_MINOR_WITH_BIGINT = 5;
const NODE_VERSION_PATCH_WITH_BIGINT = 0;
const nodeVersion = process.versions.node.split('.');
const nodeVersionMajor = Number.parseInt(nodeVersion[0], 10);
const nodeVersionMinor = Number.parseInt(nodeVersion[1], 10);
const nodeVersionPatch = Number.parseInt(nodeVersion[2], 10);

function nodeSupportsBigInt () {
  if (nodeVersionMajor > NODE_VERSION_MAJOR_WITH_BIGINT) {
    return true
  } else if (nodeVersionMajor === NODE_VERSION_MAJOR_WITH_BIGINT) {
    if (nodeVersionMinor > NODE_VERSION_MINOR_WITH_BIGINT) {
      return true
    } else if (nodeVersionMinor === NODE_VERSION_MINOR_WITH_BIGINT) {
      if (nodeVersionPatch >= NODE_VERSION_PATCH_WITH_BIGINT) {
        return true
      }
    }
  }
  return false
}

function getStats$2 (src, dest, cb) {
  if (nodeSupportsBigInt()) {
    fs$l.stat(src, { bigint: true }, (err, srcStat) => {
      if (err) return cb(err)
      fs$l.stat(dest, { bigint: true }, (err, destStat) => {
        if (err) {
          if (err.code === 'ENOENT') return cb(null, { srcStat, destStat: null })
          return cb(err)
        }
        return cb(null, { srcStat, destStat })
      });
    });
  } else {
    fs$l.stat(src, (err, srcStat) => {
      if (err) return cb(err)
      fs$l.stat(dest, (err, destStat) => {
        if (err) {
          if (err.code === 'ENOENT') return cb(null, { srcStat, destStat: null })
          return cb(err)
        }
        return cb(null, { srcStat, destStat })
      });
    });
  }
}

function getStatsSync (src, dest) {
  let srcStat, destStat;
  if (nodeSupportsBigInt()) {
    srcStat = fs$l.statSync(src, { bigint: true });
  } else {
    srcStat = fs$l.statSync(src);
  }
  try {
    if (nodeSupportsBigInt()) {
      destStat = fs$l.statSync(dest, { bigint: true });
    } else {
      destStat = fs$l.statSync(dest);
    }
  } catch (err) {
    if (err.code === 'ENOENT') return { srcStat, destStat: null }
    throw err
  }
  return { srcStat, destStat }
}

function checkPaths (src, dest, funcName, cb) {
  getStats$2(src, dest, (err, stats) => {
    if (err) return cb(err)
    const { srcStat, destStat } = stats;
    if (destStat && destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev) {
      return cb(new Error('Source and destination must not be the same.'))
    }
    if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
      return cb(new Error(errMsg(src, dest, funcName)))
    }
    return cb(null, { srcStat, destStat })
  });
}

function checkPathsSync (src, dest, funcName) {
  const { srcStat, destStat } = getStatsSync(src, dest);
  if (destStat && destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev) {
    throw new Error('Source and destination must not be the same.')
  }
  if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
    throw new Error(errMsg(src, dest, funcName))
  }
  return { srcStat, destStat }
}

// recursively check if dest parent is a subdirectory of src.
// It works for all file types including symlinks since it
// checks the src and dest inodes. It starts from the deepest
// parent and stops once it reaches the src parent or the root path.
function checkParentPaths (src, srcStat, dest, funcName, cb) {
  const srcParent = path$m.resolve(path$m.dirname(src));
  const destParent = path$m.resolve(path$m.dirname(dest));
  if (destParent === srcParent || destParent === path$m.parse(destParent).root) return cb()
  if (nodeSupportsBigInt()) {
    fs$l.stat(destParent, { bigint: true }, (err, destStat) => {
      if (err) {
        if (err.code === 'ENOENT') return cb()
        return cb(err)
      }
      if (destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev) {
        return cb(new Error(errMsg(src, dest, funcName)))
      }
      return checkParentPaths(src, srcStat, destParent, funcName, cb)
    });
  } else {
    fs$l.stat(destParent, (err, destStat) => {
      if (err) {
        if (err.code === 'ENOENT') return cb()
        return cb(err)
      }
      if (destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev) {
        return cb(new Error(errMsg(src, dest, funcName)))
      }
      return checkParentPaths(src, srcStat, destParent, funcName, cb)
    });
  }
}

function checkParentPathsSync (src, srcStat, dest, funcName) {
  const srcParent = path$m.resolve(path$m.dirname(src));
  const destParent = path$m.resolve(path$m.dirname(dest));
  if (destParent === srcParent || destParent === path$m.parse(destParent).root) return
  let destStat;
  try {
    if (nodeSupportsBigInt()) {
      destStat = fs$l.statSync(destParent, { bigint: true });
    } else {
      destStat = fs$l.statSync(destParent);
    }
  } catch (err) {
    if (err.code === 'ENOENT') return
    throw err
  }
  if (destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev) {
    throw new Error(errMsg(src, dest, funcName))
  }
  return checkParentPathsSync(src, srcStat, destParent, funcName)
}

// return true if dest is a subdir of src, otherwise false.
// It only checks the path strings.
function isSrcSubdir (src, dest) {
  const srcArr = path$m.resolve(src).split(path$m.sep).filter(i => i);
  const destArr = path$m.resolve(dest).split(path$m.sep).filter(i => i);
  return srcArr.reduce((acc, cur, i) => acc && destArr[i] === cur, true)
}

function errMsg (src, dest, funcName) {
  return `Cannot ${funcName} '${src}' to a subdirectory of itself, '${dest}'.`
}

var stat$4 = {
  checkPaths,
  checkPathsSync,
  checkParentPaths,
  checkParentPathsSync,
  isSrcSubdir
};

/* eslint-disable node/no-deprecated-api */
var buffer = function (size) {
  if (typeof Buffer.allocUnsafe === 'function') {
    try {
      return Buffer.allocUnsafe(size)
    } catch (e) {
      return new Buffer(size)
    }
  }
  return new Buffer(size)
};

const fs$k = gracefulFs;
const path$l = require$$1__default$1["default"];
const mkdirpSync$1 = mkdirs_1.mkdirsSync;
const utimesSync = utimes$1.utimesMillisSync;
const stat$3 = stat$4;

function copySync$2 (src, dest, opts) {
  if (typeof opts === 'function') {
    opts = { filter: opts };
  }

  opts = opts || {};
  opts.clobber = 'clobber' in opts ? !!opts.clobber : true; // default to true for now
  opts.overwrite = 'overwrite' in opts ? !!opts.overwrite : opts.clobber; // overwrite falls back to clobber

  // Warn about using preserveTimestamps on 32-bit node
  if (opts.preserveTimestamps && process.arch === 'ia32') {
    console.warn(`fs-extra: Using the preserveTimestamps option in 32-bit node is not recommended;\n
    see https://github.com/jprichardson/node-fs-extra/issues/269`);
  }

  const { srcStat, destStat } = stat$3.checkPathsSync(src, dest, 'copy');
  stat$3.checkParentPathsSync(src, srcStat, dest, 'copy');
  return handleFilterAndCopy(destStat, src, dest, opts)
}

function handleFilterAndCopy (destStat, src, dest, opts) {
  if (opts.filter && !opts.filter(src, dest)) return
  const destParent = path$l.dirname(dest);
  if (!fs$k.existsSync(destParent)) mkdirpSync$1(destParent);
  return startCopy$1(destStat, src, dest, opts)
}

function startCopy$1 (destStat, src, dest, opts) {
  if (opts.filter && !opts.filter(src, dest)) return
  return getStats$1(destStat, src, dest, opts)
}

function getStats$1 (destStat, src, dest, opts) {
  const statSync = opts.dereference ? fs$k.statSync : fs$k.lstatSync;
  const srcStat = statSync(src);

  if (srcStat.isDirectory()) return onDir$1(srcStat, destStat, src, dest, opts)
  else if (srcStat.isFile() ||
           srcStat.isCharacterDevice() ||
           srcStat.isBlockDevice()) return onFile$1(srcStat, destStat, src, dest, opts)
  else if (srcStat.isSymbolicLink()) return onLink$1(destStat, src, dest, opts)
}

function onFile$1 (srcStat, destStat, src, dest, opts) {
  if (!destStat) return copyFile$1(srcStat, src, dest, opts)
  return mayCopyFile$1(srcStat, src, dest, opts)
}

function mayCopyFile$1 (srcStat, src, dest, opts) {
  if (opts.overwrite) {
    fs$k.unlinkSync(dest);
    return copyFile$1(srcStat, src, dest, opts)
  } else if (opts.errorOnExist) {
    throw new Error(`'${dest}' already exists`)
  }
}

function copyFile$1 (srcStat, src, dest, opts) {
  if (typeof fs$k.copyFileSync === 'function') {
    fs$k.copyFileSync(src, dest);
    fs$k.chmodSync(dest, srcStat.mode);
    if (opts.preserveTimestamps) {
      return utimesSync(dest, srcStat.atime, srcStat.mtime)
    }
    return
  }
  return copyFileFallback$1(srcStat, src, dest, opts)
}

function copyFileFallback$1 (srcStat, src, dest, opts) {
  const BUF_LENGTH = 64 * 1024;
  const _buff = buffer(BUF_LENGTH);

  const fdr = fs$k.openSync(src, 'r');
  const fdw = fs$k.openSync(dest, 'w', srcStat.mode);
  let pos = 0;

  while (pos < srcStat.size) {
    const bytesRead = fs$k.readSync(fdr, _buff, 0, BUF_LENGTH, pos);
    fs$k.writeSync(fdw, _buff, 0, bytesRead);
    pos += bytesRead;
  }

  if (opts.preserveTimestamps) fs$k.futimesSync(fdw, srcStat.atime, srcStat.mtime);

  fs$k.closeSync(fdr);
  fs$k.closeSync(fdw);
}

function onDir$1 (srcStat, destStat, src, dest, opts) {
  if (!destStat) return mkDirAndCopy$1(srcStat, src, dest, opts)
  if (destStat && !destStat.isDirectory()) {
    throw new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`)
  }
  return copyDir$1(src, dest, opts)
}

function mkDirAndCopy$1 (srcStat, src, dest, opts) {
  fs$k.mkdirSync(dest);
  copyDir$1(src, dest, opts);
  return fs$k.chmodSync(dest, srcStat.mode)
}

function copyDir$1 (src, dest, opts) {
  fs$k.readdirSync(src).forEach(item => copyDirItem$1(item, src, dest, opts));
}

function copyDirItem$1 (item, src, dest, opts) {
  const srcItem = path$l.join(src, item);
  const destItem = path$l.join(dest, item);
  const { destStat } = stat$3.checkPathsSync(srcItem, destItem, 'copy');
  return startCopy$1(destStat, srcItem, destItem, opts)
}

function onLink$1 (destStat, src, dest, opts) {
  let resolvedSrc = fs$k.readlinkSync(src);
  if (opts.dereference) {
    resolvedSrc = path$l.resolve(process.cwd(), resolvedSrc);
  }

  if (!destStat) {
    return fs$k.symlinkSync(resolvedSrc, dest)
  } else {
    let resolvedDest;
    try {
      resolvedDest = fs$k.readlinkSync(dest);
    } catch (err) {
      // dest exists and is a regular file or directory,
      // Windows may throw UNKNOWN error. If dest already exists,
      // fs throws error anyway, so no need to guard against it here.
      if (err.code === 'EINVAL' || err.code === 'UNKNOWN') return fs$k.symlinkSync(resolvedSrc, dest)
      throw err
    }
    if (opts.dereference) {
      resolvedDest = path$l.resolve(process.cwd(), resolvedDest);
    }
    if (stat$3.isSrcSubdir(resolvedSrc, resolvedDest)) {
      throw new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`)
    }

    // prevent copy if src is a subdir of dest since unlinking
    // dest in this case would result in removing src contents
    // and therefore a broken symlink would be created.
    if (fs$k.statSync(dest).isDirectory() && stat$3.isSrcSubdir(resolvedDest, resolvedSrc)) {
      throw new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`)
    }
    return copyLink$1(resolvedSrc, dest)
  }
}

function copyLink$1 (resolvedSrc, dest) {
  fs$k.unlinkSync(dest);
  return fs$k.symlinkSync(resolvedSrc, dest)
}

var copySync_1 = copySync$2;

var copySync$1 = {
  copySync: copySync_1
};

const u$a = universalify.fromPromise;
const fs$j = fs$q;

function pathExists$8 (path) {
  return fs$j.access(path).then(() => true).catch(() => false)
}

var pathExists_1 = {
  pathExists: u$a(pathExists$8),
  pathExistsSync: fs$j.existsSync
};

const fs$i = gracefulFs;
const path$k = require$$1__default$1["default"];
const mkdirp$1 = mkdirs_1.mkdirs;
const pathExists$7 = pathExists_1.pathExists;
const utimes = utimes$1.utimesMillis;
const stat$2 = stat$4;

function copy$2 (src, dest, opts, cb) {
  if (typeof opts === 'function' && !cb) {
    cb = opts;
    opts = {};
  } else if (typeof opts === 'function') {
    opts = { filter: opts };
  }

  cb = cb || function () {};
  opts = opts || {};

  opts.clobber = 'clobber' in opts ? !!opts.clobber : true; // default to true for now
  opts.overwrite = 'overwrite' in opts ? !!opts.overwrite : opts.clobber; // overwrite falls back to clobber

  // Warn about using preserveTimestamps on 32-bit node
  if (opts.preserveTimestamps && process.arch === 'ia32') {
    console.warn(`fs-extra: Using the preserveTimestamps option in 32-bit node is not recommended;\n
    see https://github.com/jprichardson/node-fs-extra/issues/269`);
  }

  stat$2.checkPaths(src, dest, 'copy', (err, stats) => {
    if (err) return cb(err)
    const { srcStat, destStat } = stats;
    stat$2.checkParentPaths(src, srcStat, dest, 'copy', err => {
      if (err) return cb(err)
      if (opts.filter) return handleFilter(checkParentDir, destStat, src, dest, opts, cb)
      return checkParentDir(destStat, src, dest, opts, cb)
    });
  });
}

function checkParentDir (destStat, src, dest, opts, cb) {
  const destParent = path$k.dirname(dest);
  pathExists$7(destParent, (err, dirExists) => {
    if (err) return cb(err)
    if (dirExists) return startCopy(destStat, src, dest, opts, cb)
    mkdirp$1(destParent, err => {
      if (err) return cb(err)
      return startCopy(destStat, src, dest, opts, cb)
    });
  });
}

function handleFilter (onInclude, destStat, src, dest, opts, cb) {
  Promise.resolve(opts.filter(src, dest)).then(include => {
    if (include) return onInclude(destStat, src, dest, opts, cb)
    return cb()
  }, error => cb(error));
}

function startCopy (destStat, src, dest, opts, cb) {
  if (opts.filter) return handleFilter(getStats, destStat, src, dest, opts, cb)
  return getStats(destStat, src, dest, opts, cb)
}

function getStats (destStat, src, dest, opts, cb) {
  const stat = opts.dereference ? fs$i.stat : fs$i.lstat;
  stat(src, (err, srcStat) => {
    if (err) return cb(err)

    if (srcStat.isDirectory()) return onDir(srcStat, destStat, src, dest, opts, cb)
    else if (srcStat.isFile() ||
             srcStat.isCharacterDevice() ||
             srcStat.isBlockDevice()) return onFile(srcStat, destStat, src, dest, opts, cb)
    else if (srcStat.isSymbolicLink()) return onLink(destStat, src, dest, opts, cb)
  });
}

function onFile (srcStat, destStat, src, dest, opts, cb) {
  if (!destStat) return copyFile(srcStat, src, dest, opts, cb)
  return mayCopyFile(srcStat, src, dest, opts, cb)
}

function mayCopyFile (srcStat, src, dest, opts, cb) {
  if (opts.overwrite) {
    fs$i.unlink(dest, err => {
      if (err) return cb(err)
      return copyFile(srcStat, src, dest, opts, cb)
    });
  } else if (opts.errorOnExist) {
    return cb(new Error(`'${dest}' already exists`))
  } else return cb()
}

function copyFile (srcStat, src, dest, opts, cb) {
  if (typeof fs$i.copyFile === 'function') {
    return fs$i.copyFile(src, dest, err => {
      if (err) return cb(err)
      return setDestModeAndTimestamps(srcStat, dest, opts, cb)
    })
  }
  return copyFileFallback(srcStat, src, dest, opts, cb)
}

function copyFileFallback (srcStat, src, dest, opts, cb) {
  const rs = fs$i.createReadStream(src);
  rs.on('error', err => cb(err)).once('open', () => {
    const ws = fs$i.createWriteStream(dest, { mode: srcStat.mode });
    ws.on('error', err => cb(err))
      .on('open', () => rs.pipe(ws))
      .once('close', () => setDestModeAndTimestamps(srcStat, dest, opts, cb));
  });
}

function setDestModeAndTimestamps (srcStat, dest, opts, cb) {
  fs$i.chmod(dest, srcStat.mode, err => {
    if (err) return cb(err)
    if (opts.preserveTimestamps) {
      return utimes(dest, srcStat.atime, srcStat.mtime, cb)
    }
    return cb()
  });
}

function onDir (srcStat, destStat, src, dest, opts, cb) {
  if (!destStat) return mkDirAndCopy(srcStat, src, dest, opts, cb)
  if (destStat && !destStat.isDirectory()) {
    return cb(new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`))
  }
  return copyDir(src, dest, opts, cb)
}

function mkDirAndCopy (srcStat, src, dest, opts, cb) {
  fs$i.mkdir(dest, err => {
    if (err) return cb(err)
    copyDir(src, dest, opts, err => {
      if (err) return cb(err)
      return fs$i.chmod(dest, srcStat.mode, cb)
    });
  });
}

function copyDir (src, dest, opts, cb) {
  fs$i.readdir(src, (err, items) => {
    if (err) return cb(err)
    return copyDirItems(items, src, dest, opts, cb)
  });
}

function copyDirItems (items, src, dest, opts, cb) {
  const item = items.pop();
  if (!item) return cb()
  return copyDirItem(items, item, src, dest, opts, cb)
}

function copyDirItem (items, item, src, dest, opts, cb) {
  const srcItem = path$k.join(src, item);
  const destItem = path$k.join(dest, item);
  stat$2.checkPaths(srcItem, destItem, 'copy', (err, stats) => {
    if (err) return cb(err)
    const { destStat } = stats;
    startCopy(destStat, srcItem, destItem, opts, err => {
      if (err) return cb(err)
      return copyDirItems(items, src, dest, opts, cb)
    });
  });
}

function onLink (destStat, src, dest, opts, cb) {
  fs$i.readlink(src, (err, resolvedSrc) => {
    if (err) return cb(err)
    if (opts.dereference) {
      resolvedSrc = path$k.resolve(process.cwd(), resolvedSrc);
    }

    if (!destStat) {
      return fs$i.symlink(resolvedSrc, dest, cb)
    } else {
      fs$i.readlink(dest, (err, resolvedDest) => {
        if (err) {
          // dest exists and is a regular file or directory,
          // Windows may throw UNKNOWN error. If dest already exists,
          // fs throws error anyway, so no need to guard against it here.
          if (err.code === 'EINVAL' || err.code === 'UNKNOWN') return fs$i.symlink(resolvedSrc, dest, cb)
          return cb(err)
        }
        if (opts.dereference) {
          resolvedDest = path$k.resolve(process.cwd(), resolvedDest);
        }
        if (stat$2.isSrcSubdir(resolvedSrc, resolvedDest)) {
          return cb(new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`))
        }

        // do not copy if src is a subdir of dest since unlinking
        // dest in this case would result in removing src contents
        // and therefore a broken symlink would be created.
        if (destStat.isDirectory() && stat$2.isSrcSubdir(resolvedDest, resolvedSrc)) {
          return cb(new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`))
        }
        return copyLink(resolvedSrc, dest, cb)
      });
    }
  });
}

function copyLink (resolvedSrc, dest, cb) {
  fs$i.unlink(dest, err => {
    if (err) return cb(err)
    return fs$i.symlink(resolvedSrc, dest, cb)
  });
}

var copy_1 = copy$2;

const u$9 = universalify.fromCallback;
var copy$1 = {
  copy: u$9(copy_1)
};

const fs$h = gracefulFs;
const path$j = require$$1__default$1["default"];
const assert = require$$0__default["default"];

const isWindows$1 = (process.platform === 'win32');

function defaults (options) {
  const methods = [
    'unlink',
    'chmod',
    'stat',
    'lstat',
    'rmdir',
    'readdir'
  ];
  methods.forEach(m => {
    options[m] = options[m] || fs$h[m];
    m = m + 'Sync';
    options[m] = options[m] || fs$h[m];
  });

  options.maxBusyTries = options.maxBusyTries || 3;
}

function rimraf$1 (p, options, cb) {
  let busyTries = 0;

  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  assert(p, 'rimraf: missing path');
  assert.strictEqual(typeof p, 'string', 'rimraf: path should be a string');
  assert.strictEqual(typeof cb, 'function', 'rimraf: callback function required');
  assert(options, 'rimraf: invalid options argument provided');
  assert.strictEqual(typeof options, 'object', 'rimraf: options should be object');

  defaults(options);

  rimraf_(p, options, function CB (er) {
    if (er) {
      if ((er.code === 'EBUSY' || er.code === 'ENOTEMPTY' || er.code === 'EPERM') &&
          busyTries < options.maxBusyTries) {
        busyTries++;
        const time = busyTries * 100;
        // try again, with the same exact callback as this one.
        return setTimeout(() => rimraf_(p, options, CB), time)
      }

      // already gone
      if (er.code === 'ENOENT') er = null;
    }

    cb(er);
  });
}

// Two possible strategies.
// 1. Assume it's a file.  unlink it, then do the dir stuff on EPERM or EISDIR
// 2. Assume it's a directory.  readdir, then do the file stuff on ENOTDIR
//
// Both result in an extra syscall when you guess wrong.  However, there
// are likely far more normal files in the world than directories.  This
// is based on the assumption that a the average number of files per
// directory is >= 1.
//
// If anyone ever complains about this, then I guess the strategy could
// be made configurable somehow.  But until then, YAGNI.
function rimraf_ (p, options, cb) {
  assert(p);
  assert(options);
  assert(typeof cb === 'function');

  // sunos lets the root user unlink directories, which is... weird.
  // so we have to lstat here and make sure it's not a dir.
  options.lstat(p, (er, st) => {
    if (er && er.code === 'ENOENT') {
      return cb(null)
    }

    // Windows can EPERM on stat.  Life is suffering.
    if (er && er.code === 'EPERM' && isWindows$1) {
      return fixWinEPERM(p, options, er, cb)
    }

    if (st && st.isDirectory()) {
      return rmdir(p, options, er, cb)
    }

    options.unlink(p, er => {
      if (er) {
        if (er.code === 'ENOENT') {
          return cb(null)
        }
        if (er.code === 'EPERM') {
          return (isWindows$1)
            ? fixWinEPERM(p, options, er, cb)
            : rmdir(p, options, er, cb)
        }
        if (er.code === 'EISDIR') {
          return rmdir(p, options, er, cb)
        }
      }
      return cb(er)
    });
  });
}

function fixWinEPERM (p, options, er, cb) {
  assert(p);
  assert(options);
  assert(typeof cb === 'function');
  if (er) {
    assert(er instanceof Error);
  }

  options.chmod(p, 0o666, er2 => {
    if (er2) {
      cb(er2.code === 'ENOENT' ? null : er);
    } else {
      options.stat(p, (er3, stats) => {
        if (er3) {
          cb(er3.code === 'ENOENT' ? null : er);
        } else if (stats.isDirectory()) {
          rmdir(p, options, er, cb);
        } else {
          options.unlink(p, cb);
        }
      });
    }
  });
}

function fixWinEPERMSync (p, options, er) {
  let stats;

  assert(p);
  assert(options);
  if (er) {
    assert(er instanceof Error);
  }

  try {
    options.chmodSync(p, 0o666);
  } catch (er2) {
    if (er2.code === 'ENOENT') {
      return
    } else {
      throw er
    }
  }

  try {
    stats = options.statSync(p);
  } catch (er3) {
    if (er3.code === 'ENOENT') {
      return
    } else {
      throw er
    }
  }

  if (stats.isDirectory()) {
    rmdirSync(p, options, er);
  } else {
    options.unlinkSync(p);
  }
}

function rmdir (p, options, originalEr, cb) {
  assert(p);
  assert(options);
  if (originalEr) {
    assert(originalEr instanceof Error);
  }
  assert(typeof cb === 'function');

  // try to rmdir first, and only readdir on ENOTEMPTY or EEXIST (SunOS)
  // if we guessed wrong, and it's not a directory, then
  // raise the original error.
  options.rmdir(p, er => {
    if (er && (er.code === 'ENOTEMPTY' || er.code === 'EEXIST' || er.code === 'EPERM')) {
      rmkids(p, options, cb);
    } else if (er && er.code === 'ENOTDIR') {
      cb(originalEr);
    } else {
      cb(er);
    }
  });
}

function rmkids (p, options, cb) {
  assert(p);
  assert(options);
  assert(typeof cb === 'function');

  options.readdir(p, (er, files) => {
    if (er) return cb(er)

    let n = files.length;
    let errState;

    if (n === 0) return options.rmdir(p, cb)

    files.forEach(f => {
      rimraf$1(path$j.join(p, f), options, er => {
        if (errState) {
          return
        }
        if (er) return cb(errState = er)
        if (--n === 0) {
          options.rmdir(p, cb);
        }
      });
    });
  });
}

// this looks simpler, and is strictly *faster*, but will
// tie up the JavaScript thread and fail on excessively
// deep directory trees.
function rimrafSync (p, options) {
  let st;

  options = options || {};
  defaults(options);

  assert(p, 'rimraf: missing path');
  assert.strictEqual(typeof p, 'string', 'rimraf: path should be a string');
  assert(options, 'rimraf: missing options');
  assert.strictEqual(typeof options, 'object', 'rimraf: options should be object');

  try {
    st = options.lstatSync(p);
  } catch (er) {
    if (er.code === 'ENOENT') {
      return
    }

    // Windows can EPERM on stat.  Life is suffering.
    if (er.code === 'EPERM' && isWindows$1) {
      fixWinEPERMSync(p, options, er);
    }
  }

  try {
    // sunos lets the root user unlink directories, which is... weird.
    if (st && st.isDirectory()) {
      rmdirSync(p, options, null);
    } else {
      options.unlinkSync(p);
    }
  } catch (er) {
    if (er.code === 'ENOENT') {
      return
    } else if (er.code === 'EPERM') {
      return isWindows$1 ? fixWinEPERMSync(p, options, er) : rmdirSync(p, options, er)
    } else if (er.code !== 'EISDIR') {
      throw er
    }
    rmdirSync(p, options, er);
  }
}

function rmdirSync (p, options, originalEr) {
  assert(p);
  assert(options);
  if (originalEr) {
    assert(originalEr instanceof Error);
  }

  try {
    options.rmdirSync(p);
  } catch (er) {
    if (er.code === 'ENOTDIR') {
      throw originalEr
    } else if (er.code === 'ENOTEMPTY' || er.code === 'EEXIST' || er.code === 'EPERM') {
      rmkidsSync(p, options);
    } else if (er.code !== 'ENOENT') {
      throw er
    }
  }
}

function rmkidsSync (p, options) {
  assert(p);
  assert(options);
  options.readdirSync(p).forEach(f => rimrafSync(path$j.join(p, f), options));

  if (isWindows$1) {
    // We only end up here once we got ENOTEMPTY at least once, and
    // at this point, we are guaranteed to have removed all the kids.
    // So, we know that it won't be ENOENT or ENOTDIR or anything else.
    // try really hard to delete stuff on windows, because it has a
    // PROFOUNDLY annoying habit of not closing handles promptly when
    // files are deleted, resulting in spurious ENOTEMPTY errors.
    const startTime = Date.now();
    do {
      try {
        const ret = options.rmdirSync(p, options);
        return ret
      } catch (er) { }
    } while (Date.now() - startTime < 500) // give up after 500ms
  } else {
    const ret = options.rmdirSync(p, options);
    return ret
  }
}

var rimraf_1 = rimraf$1;
rimraf$1.sync = rimrafSync;

const u$8 = universalify.fromCallback;
const rimraf = rimraf_1;

var remove$2 = {
  remove: u$8(rimraf),
  removeSync: rimraf.sync
};

const u$7 = universalify.fromCallback;
const fs$g = gracefulFs;
const path$i = require$$1__default$1["default"];
const mkdir$5 = mkdirs_1;
const remove$1 = remove$2;

const emptyDir = u$7(function emptyDir (dir, callback) {
  callback = callback || function () {};
  fs$g.readdir(dir, (err, items) => {
    if (err) return mkdir$5.mkdirs(dir, callback)

    items = items.map(item => path$i.join(dir, item));

    deleteItem();

    function deleteItem () {
      const item = items.pop();
      if (!item) return callback()
      remove$1.remove(item, err => {
        if (err) return callback(err)
        deleteItem();
      });
    }
  });
});

function emptyDirSync (dir) {
  let items;
  try {
    items = fs$g.readdirSync(dir);
  } catch (err) {
    return mkdir$5.mkdirsSync(dir)
  }

  items.forEach(item => {
    item = path$i.join(dir, item);
    remove$1.removeSync(item);
  });
}

var empty = {
  emptyDirSync,
  emptydirSync: emptyDirSync,
  emptyDir,
  emptydir: emptyDir
};

const u$6 = universalify.fromCallback;
const path$h = require$$1__default$1["default"];
const fs$f = gracefulFs;
const mkdir$4 = mkdirs_1;
const pathExists$6 = pathExists_1.pathExists;

function createFile (file, callback) {
  function makeFile () {
    fs$f.writeFile(file, '', err => {
      if (err) return callback(err)
      callback();
    });
  }

  fs$f.stat(file, (err, stats) => { // eslint-disable-line handle-callback-err
    if (!err && stats.isFile()) return callback()
    const dir = path$h.dirname(file);
    pathExists$6(dir, (err, dirExists) => {
      if (err) return callback(err)
      if (dirExists) return makeFile()
      mkdir$4.mkdirs(dir, err => {
        if (err) return callback(err)
        makeFile();
      });
    });
  });
}

function createFileSync (file) {
  let stats;
  try {
    stats = fs$f.statSync(file);
  } catch (e) {}
  if (stats && stats.isFile()) return

  const dir = path$h.dirname(file);
  if (!fs$f.existsSync(dir)) {
    mkdir$4.mkdirsSync(dir);
  }

  fs$f.writeFileSync(file, '');
}

var file$1 = {
  createFile: u$6(createFile),
  createFileSync
};

const u$5 = universalify.fromCallback;
const path$g = require$$1__default$1["default"];
const fs$e = gracefulFs;
const mkdir$3 = mkdirs_1;
const pathExists$5 = pathExists_1.pathExists;

function createLink (srcpath, dstpath, callback) {
  function makeLink (srcpath, dstpath) {
    fs$e.link(srcpath, dstpath, err => {
      if (err) return callback(err)
      callback(null);
    });
  }

  pathExists$5(dstpath, (err, destinationExists) => {
    if (err) return callback(err)
    if (destinationExists) return callback(null)
    fs$e.lstat(srcpath, (err) => {
      if (err) {
        err.message = err.message.replace('lstat', 'ensureLink');
        return callback(err)
      }

      const dir = path$g.dirname(dstpath);
      pathExists$5(dir, (err, dirExists) => {
        if (err) return callback(err)
        if (dirExists) return makeLink(srcpath, dstpath)
        mkdir$3.mkdirs(dir, err => {
          if (err) return callback(err)
          makeLink(srcpath, dstpath);
        });
      });
    });
  });
}

function createLinkSync (srcpath, dstpath) {
  const destinationExists = fs$e.existsSync(dstpath);
  if (destinationExists) return undefined

  try {
    fs$e.lstatSync(srcpath);
  } catch (err) {
    err.message = err.message.replace('lstat', 'ensureLink');
    throw err
  }

  const dir = path$g.dirname(dstpath);
  const dirExists = fs$e.existsSync(dir);
  if (dirExists) return fs$e.linkSync(srcpath, dstpath)
  mkdir$3.mkdirsSync(dir);

  return fs$e.linkSync(srcpath, dstpath)
}

var link$1 = {
  createLink: u$5(createLink),
  createLinkSync
};

const path$f = require$$1__default$1["default"];
const fs$d = gracefulFs;
const pathExists$4 = pathExists_1.pathExists;

/**
 * Function that returns two types of paths, one relative to symlink, and one
 * relative to the current working directory. Checks if path is absolute or
 * relative. If the path is relative, this function checks if the path is
 * relative to symlink or relative to current working directory. This is an
 * initiative to find a smarter `srcpath` to supply when building symlinks.
 * This allows you to determine which path to use out of one of three possible
 * types of source paths. The first is an absolute path. This is detected by
 * `path.isAbsolute()`. When an absolute path is provided, it is checked to
 * see if it exists. If it does it's used, if not an error is returned
 * (callback)/ thrown (sync). The other two options for `srcpath` are a
 * relative url. By default Node's `fs.symlink` works by creating a symlink
 * using `dstpath` and expects the `srcpath` to be relative to the newly
 * created symlink. If you provide a `srcpath` that does not exist on the file
 * system it results in a broken symlink. To minimize this, the function
 * checks to see if the 'relative to symlink' source file exists, and if it
 * does it will use it. If it does not, it checks if there's a file that
 * exists that is relative to the current working directory, if does its used.
 * This preserves the expectations of the original fs.symlink spec and adds
 * the ability to pass in `relative to current working direcotry` paths.
 */

function symlinkPaths$1 (srcpath, dstpath, callback) {
  if (path$f.isAbsolute(srcpath)) {
    return fs$d.lstat(srcpath, (err) => {
      if (err) {
        err.message = err.message.replace('lstat', 'ensureSymlink');
        return callback(err)
      }
      return callback(null, {
        'toCwd': srcpath,
        'toDst': srcpath
      })
    })
  } else {
    const dstdir = path$f.dirname(dstpath);
    const relativeToDst = path$f.join(dstdir, srcpath);
    return pathExists$4(relativeToDst, (err, exists) => {
      if (err) return callback(err)
      if (exists) {
        return callback(null, {
          'toCwd': relativeToDst,
          'toDst': srcpath
        })
      } else {
        return fs$d.lstat(srcpath, (err) => {
          if (err) {
            err.message = err.message.replace('lstat', 'ensureSymlink');
            return callback(err)
          }
          return callback(null, {
            'toCwd': srcpath,
            'toDst': path$f.relative(dstdir, srcpath)
          })
        })
      }
    })
  }
}

function symlinkPathsSync$1 (srcpath, dstpath) {
  let exists;
  if (path$f.isAbsolute(srcpath)) {
    exists = fs$d.existsSync(srcpath);
    if (!exists) throw new Error('absolute srcpath does not exist')
    return {
      'toCwd': srcpath,
      'toDst': srcpath
    }
  } else {
    const dstdir = path$f.dirname(dstpath);
    const relativeToDst = path$f.join(dstdir, srcpath);
    exists = fs$d.existsSync(relativeToDst);
    if (exists) {
      return {
        'toCwd': relativeToDst,
        'toDst': srcpath
      }
    } else {
      exists = fs$d.existsSync(srcpath);
      if (!exists) throw new Error('relative srcpath does not exist')
      return {
        'toCwd': srcpath,
        'toDst': path$f.relative(dstdir, srcpath)
      }
    }
  }
}

var symlinkPaths_1 = {
  symlinkPaths: symlinkPaths$1,
  symlinkPathsSync: symlinkPathsSync$1
};

const fs$c = gracefulFs;

function symlinkType$1 (srcpath, type, callback) {
  callback = (typeof type === 'function') ? type : callback;
  type = (typeof type === 'function') ? false : type;
  if (type) return callback(null, type)
  fs$c.lstat(srcpath, (err, stats) => {
    if (err) return callback(null, 'file')
    type = (stats && stats.isDirectory()) ? 'dir' : 'file';
    callback(null, type);
  });
}

function symlinkTypeSync$1 (srcpath, type) {
  let stats;

  if (type) return type
  try {
    stats = fs$c.lstatSync(srcpath);
  } catch (e) {
    return 'file'
  }
  return (stats && stats.isDirectory()) ? 'dir' : 'file'
}

var symlinkType_1 = {
  symlinkType: symlinkType$1,
  symlinkTypeSync: symlinkTypeSync$1
};

const u$4 = universalify.fromCallback;
const path$e = require$$1__default$1["default"];
const fs$b = gracefulFs;
const _mkdirs = mkdirs_1;
const mkdirs = _mkdirs.mkdirs;
const mkdirsSync = _mkdirs.mkdirsSync;

const _symlinkPaths = symlinkPaths_1;
const symlinkPaths = _symlinkPaths.symlinkPaths;
const symlinkPathsSync = _symlinkPaths.symlinkPathsSync;

const _symlinkType = symlinkType_1;
const symlinkType = _symlinkType.symlinkType;
const symlinkTypeSync = _symlinkType.symlinkTypeSync;

const pathExists$3 = pathExists_1.pathExists;

function createSymlink (srcpath, dstpath, type, callback) {
  callback = (typeof type === 'function') ? type : callback;
  type = (typeof type === 'function') ? false : type;

  pathExists$3(dstpath, (err, destinationExists) => {
    if (err) return callback(err)
    if (destinationExists) return callback(null)
    symlinkPaths(srcpath, dstpath, (err, relative) => {
      if (err) return callback(err)
      srcpath = relative.toDst;
      symlinkType(relative.toCwd, type, (err, type) => {
        if (err) return callback(err)
        const dir = path$e.dirname(dstpath);
        pathExists$3(dir, (err, dirExists) => {
          if (err) return callback(err)
          if (dirExists) return fs$b.symlink(srcpath, dstpath, type, callback)
          mkdirs(dir, err => {
            if (err) return callback(err)
            fs$b.symlink(srcpath, dstpath, type, callback);
          });
        });
      });
    });
  });
}

function createSymlinkSync (srcpath, dstpath, type) {
  const destinationExists = fs$b.existsSync(dstpath);
  if (destinationExists) return undefined

  const relative = symlinkPathsSync(srcpath, dstpath);
  srcpath = relative.toDst;
  type = symlinkTypeSync(relative.toCwd, type);
  const dir = path$e.dirname(dstpath);
  const exists = fs$b.existsSync(dir);
  if (exists) return fs$b.symlinkSync(srcpath, dstpath, type)
  mkdirsSync(dir);
  return fs$b.symlinkSync(srcpath, dstpath, type)
}

var symlink$1 = {
  createSymlink: u$4(createSymlink),
  createSymlinkSync
};

const file = file$1;
const link = link$1;
const symlink = symlink$1;

var ensure = {
  // file
  createFile: file.createFile,
  createFileSync: file.createFileSync,
  ensureFile: file.createFile,
  ensureFileSync: file.createFileSync,
  // link
  createLink: link.createLink,
  createLinkSync: link.createLinkSync,
  ensureLink: link.createLink,
  ensureLinkSync: link.createLinkSync,
  // symlink
  createSymlink: symlink.createSymlink,
  createSymlinkSync: symlink.createSymlinkSync,
  ensureSymlink: symlink.createSymlink,
  ensureSymlinkSync: symlink.createSymlinkSync
};

var _fs;
try {
  _fs = require('graceful-fs');
} catch (_) {
  _fs = require$$0__default$5["default"];
}

function readFile (file, options, callback) {
  if (callback == null) {
    callback = options;
    options = {};
  }

  if (typeof options === 'string') {
    options = {encoding: options};
  }

  options = options || {};
  var fs = options.fs || _fs;

  var shouldThrow = true;
  if ('throws' in options) {
    shouldThrow = options.throws;
  }

  fs.readFile(file, options, function (err, data) {
    if (err) return callback(err)

    data = stripBom(data);

    var obj;
    try {
      obj = JSON.parse(data, options ? options.reviver : null);
    } catch (err2) {
      if (shouldThrow) {
        err2.message = file + ': ' + err2.message;
        return callback(err2)
      } else {
        return callback(null, null)
      }
    }

    callback(null, obj);
  });
}

function readFileSync (file, options) {
  options = options || {};
  if (typeof options === 'string') {
    options = {encoding: options};
  }

  var fs = options.fs || _fs;

  var shouldThrow = true;
  if ('throws' in options) {
    shouldThrow = options.throws;
  }

  try {
    var content = fs.readFileSync(file, options);
    content = stripBom(content);
    return JSON.parse(content, options.reviver)
  } catch (err) {
    if (shouldThrow) {
      err.message = file + ': ' + err.message;
      throw err
    } else {
      return null
    }
  }
}

function stringify (obj, options) {
  var spaces;
  var EOL = '\n';
  if (typeof options === 'object' && options !== null) {
    if (options.spaces) {
      spaces = options.spaces;
    }
    if (options.EOL) {
      EOL = options.EOL;
    }
  }

  var str = JSON.stringify(obj, options ? options.replacer : null, spaces);

  return str.replace(/\n/g, EOL) + EOL
}

function writeFile (file, obj, options, callback) {
  if (callback == null) {
    callback = options;
    options = {};
  }
  options = options || {};
  var fs = options.fs || _fs;

  var str = '';
  try {
    str = stringify(obj, options);
  } catch (err) {
    // Need to return whether a callback was passed or not
    if (callback) callback(err, null);
    return
  }

  fs.writeFile(file, str, options, callback);
}

function writeFileSync (file, obj, options) {
  options = options || {};
  var fs = options.fs || _fs;

  var str = stringify(obj, options);
  // not sure if fs.writeFileSync returns anything, but just in case
  return fs.writeFileSync(file, str, options)
}

function stripBom (content) {
  // we do this because JSON.parse would convert it to a utf8 string if encoding wasn't specified
  if (Buffer.isBuffer(content)) content = content.toString('utf8');
  content = content.replace(/^\uFEFF/, '');
  return content
}

var jsonfile$1 = {
  readFile: readFile,
  readFileSync: readFileSync,
  writeFile: writeFile,
  writeFileSync: writeFileSync
};

var jsonfile_1 = jsonfile$1;

const u$3 = universalify.fromCallback;
const jsonFile$3 = jsonfile_1;

var jsonfile = {
  // jsonfile exports
  readJson: u$3(jsonFile$3.readFile),
  readJsonSync: jsonFile$3.readFileSync,
  writeJson: u$3(jsonFile$3.writeFile),
  writeJsonSync: jsonFile$3.writeFileSync
};

const path$d = require$$1__default$1["default"];
const mkdir$2 = mkdirs_1;
const pathExists$2 = pathExists_1.pathExists;
const jsonFile$2 = jsonfile;

function outputJson (file, data, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  const dir = path$d.dirname(file);

  pathExists$2(dir, (err, itDoes) => {
    if (err) return callback(err)
    if (itDoes) return jsonFile$2.writeJson(file, data, options, callback)

    mkdir$2.mkdirs(dir, err => {
      if (err) return callback(err)
      jsonFile$2.writeJson(file, data, options, callback);
    });
  });
}

var outputJson_1 = outputJson;

const fs$a = gracefulFs;
const path$c = require$$1__default$1["default"];
const mkdir$1 = mkdirs_1;
const jsonFile$1 = jsonfile;

function outputJsonSync (file, data, options) {
  const dir = path$c.dirname(file);

  if (!fs$a.existsSync(dir)) {
    mkdir$1.mkdirsSync(dir);
  }

  jsonFile$1.writeJsonSync(file, data, options);
}

var outputJsonSync_1 = outputJsonSync;

const u$2 = universalify.fromCallback;
const jsonFile = jsonfile;

jsonFile.outputJson = u$2(outputJson_1);
jsonFile.outputJsonSync = outputJsonSync_1;
// aliases
jsonFile.outputJSON = jsonFile.outputJson;
jsonFile.outputJSONSync = jsonFile.outputJsonSync;
jsonFile.writeJSON = jsonFile.writeJson;
jsonFile.writeJSONSync = jsonFile.writeJsonSync;
jsonFile.readJSON = jsonFile.readJson;
jsonFile.readJSONSync = jsonFile.readJsonSync;

var json = jsonFile;

const fs$9 = gracefulFs;
const path$b = require$$1__default$1["default"];
const copySync = copySync$1.copySync;
const removeSync = remove$2.removeSync;
const mkdirpSync = mkdirs_1.mkdirpSync;
const stat$1 = stat$4;

function moveSync$1 (src, dest, opts) {
  opts = opts || {};
  const overwrite = opts.overwrite || opts.clobber || false;

  const { srcStat } = stat$1.checkPathsSync(src, dest, 'move');
  stat$1.checkParentPathsSync(src, srcStat, dest, 'move');
  mkdirpSync(path$b.dirname(dest));
  return doRename$1(src, dest, overwrite)
}

function doRename$1 (src, dest, overwrite) {
  if (overwrite) {
    removeSync(dest);
    return rename$1(src, dest, overwrite)
  }
  if (fs$9.existsSync(dest)) throw new Error('dest already exists.')
  return rename$1(src, dest, overwrite)
}

function rename$1 (src, dest, overwrite) {
  try {
    fs$9.renameSync(src, dest);
  } catch (err) {
    if (err.code !== 'EXDEV') throw err
    return moveAcrossDevice$1(src, dest, overwrite)
  }
}

function moveAcrossDevice$1 (src, dest, overwrite) {
  const opts = {
    overwrite,
    errorOnExist: true
  };
  copySync(src, dest, opts);
  return removeSync(src)
}

var moveSync_1 = moveSync$1;

var moveSync = {
  moveSync: moveSync_1
};

const fs$8 = gracefulFs;
const path$a = require$$1__default$1["default"];
const copy = copy$1.copy;
const remove = remove$2.remove;
const mkdirp = mkdirs_1.mkdirp;
const pathExists$1 = pathExists_1.pathExists;
const stat = stat$4;

function move$1 (src, dest, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }

  const overwrite = opts.overwrite || opts.clobber || false;

  stat.checkPaths(src, dest, 'move', (err, stats) => {
    if (err) return cb(err)
    const { srcStat } = stats;
    stat.checkParentPaths(src, srcStat, dest, 'move', err => {
      if (err) return cb(err)
      mkdirp(path$a.dirname(dest), err => {
        if (err) return cb(err)
        return doRename(src, dest, overwrite, cb)
      });
    });
  });
}

function doRename (src, dest, overwrite, cb) {
  if (overwrite) {
    return remove(dest, err => {
      if (err) return cb(err)
      return rename(src, dest, overwrite, cb)
    })
  }
  pathExists$1(dest, (err, destExists) => {
    if (err) return cb(err)
    if (destExists) return cb(new Error('dest already exists.'))
    return rename(src, dest, overwrite, cb)
  });
}

function rename (src, dest, overwrite, cb) {
  fs$8.rename(src, dest, err => {
    if (!err) return cb()
    if (err.code !== 'EXDEV') return cb(err)
    return moveAcrossDevice(src, dest, overwrite, cb)
  });
}

function moveAcrossDevice (src, dest, overwrite, cb) {
  const opts = {
    overwrite,
    errorOnExist: true
  };
  copy(src, dest, opts, err => {
    if (err) return cb(err)
    return remove(src, cb)
  });
}

var move_1 = move$1;

const u$1 = universalify.fromCallback;
var move = {
  move: u$1(move_1)
};

const u = universalify.fromCallback;
const fs$7 = gracefulFs;
const path$9 = require$$1__default$1["default"];
const mkdir = mkdirs_1;
const pathExists = pathExists_1.pathExists;

function outputFile (file, data, encoding, callback) {
  if (typeof encoding === 'function') {
    callback = encoding;
    encoding = 'utf8';
  }

  const dir = path$9.dirname(file);
  pathExists(dir, (err, itDoes) => {
    if (err) return callback(err)
    if (itDoes) return fs$7.writeFile(file, data, encoding, callback)

    mkdir.mkdirs(dir, err => {
      if (err) return callback(err)

      fs$7.writeFile(file, data, encoding, callback);
    });
  });
}

function outputFileSync (file, ...args) {
  const dir = path$9.dirname(file);
  if (fs$7.existsSync(dir)) {
    return fs$7.writeFileSync(file, ...args)
  }
  mkdir.mkdirsSync(dir);
  fs$7.writeFileSync(file, ...args);
}

var output = {
  outputFile: u(outputFile),
  outputFileSync
};

(function (module) {

module.exports = Object.assign(
  {},
  // Export promiseified graceful-fs:
  fs$q,
  // Export extra methods:
  copySync$1,
  copy$1,
  empty,
  ensure,
  json,
  mkdirs_1,
  moveSync,
  move,
  output,
  pathExists_1,
  remove$2
);

// Export fs.promises as a getter property so that we don't trigger
// ExperimentalWarning before fs.promises is actually accessed.
const fs = require$$0__default$5["default"];
if (Object.getOwnPropertyDescriptor(fs, 'promises')) {
  Object.defineProperty(module.exports, 'promises', {
    get () { return fs.promises }
  });
}
}(lib$2));

// allows us to inject a mock date in tests
var now = () => new Date();

var lib$1 = {exports: {}};

(function (module) {

function padWithZeros(vNumber, width) {
  var numAsString = vNumber.toString();
  while (numAsString.length < width) {
    numAsString = "0" + numAsString;
  }
  return numAsString;
}

function addZero(vNumber) {
  return padWithZeros(vNumber, 2);
}

/**
 * Formats the TimeOffset
 * Thanks to http://www.svendtofte.com/code/date_format/
 * @private
 */
function offset(timezoneOffset) {
  var os = Math.abs(timezoneOffset);
  var h = String(Math.floor(os / 60));
  var m = String(os % 60);
  if (h.length === 1) {
    h = "0" + h;
  }
  if (m.length === 1) {
    m = "0" + m;
  }
  return timezoneOffset < 0 ? "+" + h + m : "-" + h + m;
}

function datePart(date, displayUTC, part) {
  return displayUTC ? date["getUTC" + part]() : date["get" + part]();
}

function asString(format, date) {
  if (typeof format !== "string") {
    date = format;
    format = module.exports.ISO8601_FORMAT;
  }
  if (!date) {
    date = module.exports.now();
  }

  var displayUTC = format.indexOf("O") > -1;

  var vDay = addZero(datePart(date, displayUTC, "Date"));
  var vMonth = addZero(datePart(date, displayUTC, "Month") + 1);
  var vYearLong = addZero(datePart(date, displayUTC, "FullYear"));
  var vYearShort = addZero(vYearLong.substring(2, 4));
  var vYear = format.indexOf("yyyy") > -1 ? vYearLong : vYearShort;
  var vHour = addZero(datePart(date, displayUTC, "Hours"));
  var vMinute = addZero(datePart(date, displayUTC, "Minutes"));
  var vSecond = addZero(datePart(date, displayUTC, "Seconds"));
  var vMillisecond = padWithZeros(
    datePart(date, displayUTC, "Milliseconds"),
    3
  );
  var vTimeZone = offset(date.getTimezoneOffset());
  var formatted = format
    .replace(/dd/g, vDay)
    .replace(/MM/g, vMonth)
    .replace(/y{1,4}/g, vYear)
    .replace(/hh/g, vHour)
    .replace(/mm/g, vMinute)
    .replace(/ss/g, vSecond)
    .replace(/SSS/g, vMillisecond)
    .replace(/O/g, vTimeZone);
  return formatted;
}

function extractDateParts(pattern, str, missingValuesDate) {
  var matchers = [
    {
      pattern: /y{1,4}/,
      regexp: "\\d{1,4}",
      fn: function(date, value) {
        date.setFullYear(value);
      }
    },
    {
      pattern: /MM/,
      regexp: "\\d{1,2}",
      fn: function(date, value) {
        date.setMonth(value - 1);
      }
    },
    {
      pattern: /dd/,
      regexp: "\\d{1,2}",
      fn: function(date, value) {
        date.setDate(value);
      }
    },
    {
      pattern: /hh/,
      regexp: "\\d{1,2}",
      fn: function(date, value) {
        date.setHours(value);
      }
    },
    {
      pattern: /mm/,
      regexp: "\\d\\d",
      fn: function(date, value) {
        date.setMinutes(value);
      }
    },
    {
      pattern: /ss/,
      regexp: "\\d\\d",
      fn: function(date, value) {
        date.setSeconds(value);
      }
    },
    {
      pattern: /SSS/,
      regexp: "\\d\\d\\d",
      fn: function(date, value) {
        date.setMilliseconds(value);
      }
    },
    {
      pattern: /O/,
      regexp: "[+-]\\d{3,4}|Z",
      fn: function(date, value) {
        if (value === "Z") {
          value = 0;
        }
        var offset = Math.abs(value);
        var minutes = (offset % 100) + Math.floor(offset / 100) * 60;
        date.setMinutes(date.getMinutes() + (value > 0 ? minutes : -minutes));
      }
    }
  ];

  var parsedPattern = matchers.reduce(
    function(p, m) {
      if (m.pattern.test(p.regexp)) {
        m.index = p.regexp.match(m.pattern).index;
        p.regexp = p.regexp.replace(m.pattern, "(" + m.regexp + ")");
      } else {
        m.index = -1;
      }
      return p;
    },
    { regexp: pattern, index: [] }
  );

  var dateFns = matchers.filter(function(m) {
    return m.index > -1;
  });
  dateFns.sort(function(a, b) {
    return a.index - b.index;
  });

  var matcher = new RegExp(parsedPattern.regexp);
  var matches = matcher.exec(str);
  if (matches) {
    var date = missingValuesDate || module.exports.now();
    dateFns.forEach(function(f, i) {
      f.fn(date, matches[i + 1]);
    });
    return date;
  }

  throw new Error(
    "String '" + str + "' could not be parsed as '" + pattern + "'"
  );
}

function parse(pattern, str, missingValuesDate) {
  if (!pattern) {
    throw new Error("pattern must be supplied");
  }

  return extractDateParts(pattern, str, missingValuesDate);
}

/**
 * Used for testing - replace this function with a fixed date.
 */
function now() {
  return new Date();
}

module.exports = asString;
module.exports.asString = asString;
module.exports.parse = parse;
module.exports.now = now;
module.exports.ISO8601_FORMAT = "yyyy-MM-ddThh:mm:ss.SSS";
module.exports.ISO8601_WITH_TZ_OFFSET_FORMAT = "yyyy-MM-ddThh:mm:ss.SSSO";
module.exports.DATETIME_FORMAT = "dd MM yyyy hh:mm:ss.SSS";
module.exports.ABSOLUTETIME_FORMAT = "hh:mm:ss.SSS";
}(lib$1));

const debug$9 = src.exports("streamroller:fileNameFormatter");
const path$8 = require$$1__default$1["default"];
const FILENAME_SEP$1 = ".";
const ZIP_EXT$1 = ".gz";

var fileNameFormatter$1 = ({
  file,
  keepFileExt,
  needsIndex,
  alwaysIncludeDate,
  compress
}) => {
  const dirAndName = path$8.join(file.dir, file.name);

  const ext = f => f + file.ext;

  const index = (f, i, d) =>
    (needsIndex || !d) && i ? f + FILENAME_SEP$1 + i : f;

  const date = (f, i, d) => {
    return (i > 0 || alwaysIncludeDate) && d ? f + FILENAME_SEP$1 + d : f;
  };

  const gzip = (f, i) => (i && compress ? f + ZIP_EXT$1 : f);

  const parts = keepFileExt
    ? [date, index, ext, gzip]
    : [ext, date, index, gzip];

  return ({ date, index }) => {
    debug$9(`_formatFileName: date=${date}, index=${index}`);
    return parts.reduce(
      (filename, part) => part(filename, index, date),
      dirAndName
    );
  };
};

const debug$8 = src.exports("streamroller:fileNameParser");
const FILENAME_SEP = ".";
const ZIP_EXT = ".gz";
const format$2 = lib$1.exports;

var fileNameParser$1 = ({ file, keepFileExt, pattern }) => {
  // All these functions take two arguments: f, the filename, and p, the result placeholder
  // They return the filename with any matching parts removed.
  // The "zip" function, for instance, removes the ".gz" part of the filename (if present)
  const zip = (f, p) => {
    if (f.endsWith(ZIP_EXT)) {
      debug$8("it is gzipped");
      p.isCompressed = true;
      return f.slice(0, -1 * ZIP_EXT.length);
    }
    return f;
  };

  const __NOT_MATCHING__ = "__NOT_MATCHING__";

  const extAtEnd = f => {
    if (f.startsWith(file.name) && f.endsWith(file.ext)) {
      debug$8("it starts and ends with the right things");
      return f.slice(file.name.length + 1, -1 * file.ext.length);
    }
    return __NOT_MATCHING__;
  };

  const extInMiddle = f => {
    if (f.startsWith(file.base)) {
      debug$8("it starts with the right things");
      return f.slice(file.base.length + 1);
    }
    return __NOT_MATCHING__;
  };

  const dateAndIndex = (f, p) => {
    const items = f.split(FILENAME_SEP);
    let indexStr = items[items.length - 1];
    debug$8("items: ", items, ", indexStr: ", indexStr);
    let dateStr = f;
    if (indexStr !== undefined && indexStr.match(/^\d+$/)) {
      dateStr = f.slice(0, -1 * (indexStr.length + 1));
      debug$8(`dateStr is ${dateStr}`);
      if (pattern && !dateStr) {
        dateStr = indexStr;
        indexStr = "0";
      }
    } else {
      indexStr = "0";
    }

    try {
      // Two arguments for new Date() are intentional. This will set other date
      // components to minimal values in the current timezone instead of UTC,
      // as new Date(0) will do.
      const date = format$2.parse(pattern, dateStr, new Date(0, 0));
      if (format$2.asString(pattern, date) !== dateStr) return f;
      p.index = parseInt(indexStr, 10);
      p.date = dateStr;
      p.timestamp = date.getTime();
      return "";
    } catch (e) {
      //not a valid date, don't panic.
      debug$8(`Problem parsing ${dateStr} as ${pattern}, error was: `, e);
      return f;
    }
  };

  const index = (f, p) => {
    if (f.match(/^\d+$/)) {
      debug$8("it has an index");
      p.index = parseInt(f, 10);
      return "";
    }
    return f;
  };

  let parts = [
    zip,
    keepFileExt ? extAtEnd : extInMiddle,
    pattern ? dateAndIndex : index
  ];

  return filename => {
    let result = { filename, index: 0, isCompressed: false };
    // pass the filename through each of the file part parsers
    let whatsLeftOver = parts.reduce(
      (remains, part) => part(remains, result),
      filename
    );
    // if there's anything left after parsing, then it wasn't a valid filename
    return whatsLeftOver ? null : result;
  };
};

const debug$7 = src.exports('streamroller:moveAndMaybeCompressFile');
const fs$6 = lib$2.exports;
const zlib = require$$2__default$2["default"];

const moveAndMaybeCompressFile$1 = async (
  sourceFilePath,
  targetFilePath,
  needCompress
) => {
  if (sourceFilePath === targetFilePath) {
    debug$7(
      `moveAndMaybeCompressFile: source and target are the same, not doing anything`
    );
    return;
  }
    if (await fs$6.pathExists(sourceFilePath)) {

      debug$7(
        `moveAndMaybeCompressFile: moving file from ${sourceFilePath} to ${targetFilePath} ${
          needCompress ? "with" : "without"
        } compress`
      );
      if (needCompress) {
        await new Promise((resolve, reject) => {
          fs$6.createReadStream(sourceFilePath)
            .pipe(zlib.createGzip())
            .pipe(fs$6.createWriteStream(targetFilePath))
            .on("finish", () => {
              debug$7(
                `moveAndMaybeCompressFile: finished compressing ${targetFilePath}, deleting ${sourceFilePath}`
              );
              fs$6.unlink(sourceFilePath)
                .then(resolve)
                .catch(() => {
                  debug$7(`Deleting ${sourceFilePath} failed, truncating instead`);
                  fs$6.truncate(sourceFilePath).then(resolve).catch(reject);
                });
            });
        });
      } else {
        debug$7(
          `moveAndMaybeCompressFile: deleting file=${targetFilePath}, renaming ${sourceFilePath} to ${targetFilePath}`
        );
        try {
          await fs$6.move(sourceFilePath, targetFilePath, { overwrite: true });
        } catch (e) {
          debug$7(
            `moveAndMaybeCompressFile: error moving ${sourceFilePath} to ${targetFilePath}`, e
          );
          debug$7(`Trying copy+truncate instead`);
          await fs$6.copy(sourceFilePath, targetFilePath, { overwrite: true });
          await fs$6.truncate(sourceFilePath);
        }
      }
    }
};

var moveAndMaybeCompressFile_1 = moveAndMaybeCompressFile$1;

const debug$6 = src.exports("streamroller:RollingFileWriteStream");
const fs$5 = lib$2.exports;
const path$7 = require$$1__default$1["default"];
const newNow = now;
const format$1 = lib$1.exports;
const { Writable } = require$$0__default$2["default"];
const fileNameFormatter = fileNameFormatter$1;
const fileNameParser = fileNameParser$1;
const moveAndMaybeCompressFile = moveAndMaybeCompressFile_1;

/**
 * RollingFileWriteStream is mainly used when writing to a file rolling by date or size.
 * RollingFileWriteStream inherits from stream.Writable
 */
class RollingFileWriteStream$2 extends Writable {
  /**
   * Create a RollingFileWriteStream
   * @constructor
   * @param {string} filePath - The file path to write.
   * @param {object} options - The extra options
   * @param {number} options.numToKeep - The max numbers of files to keep.
   * @param {number} options.maxSize - The maxSize one file can reach. Unit is Byte.
   *                                   This should be more than 1024. The default is Number.MAX_SAFE_INTEGER.
   * @param {string} options.mode - The mode of the files. The default is '0644'. Refer to stream.writable for more.
   * @param {string} options.flags - The default is 'a'. Refer to stream.flags for more.
   * @param {boolean} options.compress - Whether to compress backup files.
   * @param {boolean} options.keepFileExt - Whether to keep the file extension.
   * @param {string} options.pattern - The date string pattern in the file name.
   * @param {boolean} options.alwaysIncludePattern - Whether to add date to the name of the first file.
   */
  constructor(filePath, options) {
    debug$6(`constructor: creating RollingFileWriteStream. path=${filePath}`);
    super(options);
    this.options = this._parseOption(options);
    this.fileObject = path$7.parse(filePath);
    if (this.fileObject.dir === "") {
      this.fileObject = path$7.parse(path$7.join(process.cwd(), filePath));
    }
    this.fileFormatter = fileNameFormatter({
      file: this.fileObject,
      alwaysIncludeDate: this.options.alwaysIncludePattern,
      needsIndex: this.options.maxSize < Number.MAX_SAFE_INTEGER,
      compress: this.options.compress,
      keepFileExt: this.options.keepFileExt
    });

    this.fileNameParser = fileNameParser({
      file: this.fileObject,
      keepFileExt: this.options.keepFileExt,
      pattern: this.options.pattern
    });

    this.state = {
      currentSize: 0
    };

    if (this.options.pattern) {
      this.state.currentDate = format$1(this.options.pattern, newNow());
    }

    this.filename = this.fileFormatter({
      index: 0,
      date: this.state.currentDate
    });
    if (["a", "a+", "as", "as+"].includes(this.options.flags)) {
      this._setExistingSizeAndDate();
    }

    debug$6(
      `constructor: create new file ${this.filename}, state=${JSON.stringify(
        this.state
      )}`
    );
    this._renewWriteStream();
  }

  _setExistingSizeAndDate() {
    try {
      const stats = fs$5.statSync(this.filename);
      this.state.currentSize = stats.size;
      if (this.options.pattern) {
        this.state.currentDate = format$1(this.options.pattern, stats.mtime);
      }
    } catch (e) {
      //file does not exist, that's fine - move along
      return;
    }
  }

  _parseOption(rawOptions) {
    const defaultOptions = {
      maxSize: Number.MAX_SAFE_INTEGER,
      numToKeep: Number.MAX_SAFE_INTEGER,
      encoding: "utf8",
      mode: parseInt("0644", 8),
      flags: "a",
      compress: false,
      keepFileExt: false,
      alwaysIncludePattern: false
    };
    const options = Object.assign({}, defaultOptions, rawOptions);
    if (options.maxSize <= 0) {
      throw new Error(`options.maxSize (${options.maxSize}) should be > 0`);
    }
    if (options.numToKeep <= 0) {
      throw new Error(`options.numToKeep (${options.numToKeep}) should be > 0`);
    }
    debug$6(
      `_parseOption: creating stream with option=${JSON.stringify(options)}`
    );
    return options;
  }

  _final(callback) {
    this.currentFileStream.end("", this.options.encoding, callback);
  }

  _write(chunk, encoding, callback) {
    this._shouldRoll().then(() => {
      debug$6(
        `_write: writing chunk. ` +
          `file=${this.currentFileStream.path} ` +
          `state=${JSON.stringify(this.state)} ` +
          `chunk=${chunk}`
      );
      this.currentFileStream.write(chunk, encoding, e => {
        this.state.currentSize += chunk.length;
        callback(e);
      });
    });
  }

  async _shouldRoll() {
    if (this._dateChanged() || this._tooBig()) {
      debug$6(
        `_shouldRoll: rolling because dateChanged? ${this._dateChanged()} or tooBig? ${this._tooBig()}`
      );
      await this._roll();
    }
  }

  _dateChanged() {
    return (
      this.state.currentDate &&
      this.state.currentDate !== format$1(this.options.pattern, newNow())
    );
  }

  _tooBig() {
    return this.state.currentSize >= this.options.maxSize;
  }

  _roll() {
    debug$6(`_roll: closing the current stream`);
    return new Promise((resolve, reject) => {
      this.currentFileStream.end("", this.options.encoding, () => {
        this._moveOldFiles()
          .then(resolve)
          .catch(reject);
      });
    });
  }

  async _moveOldFiles() {
    const files = await this._getExistingFiles();
    const todaysFiles = this.state.currentDate
      ? files.filter(f => f.date === this.state.currentDate)
      : files;
    for (let i = todaysFiles.length; i >= 0; i--) {
      debug$6(`_moveOldFiles: i = ${i}`);
      const sourceFilePath = this.fileFormatter({
        date: this.state.currentDate,
        index: i
      });
      const targetFilePath = this.fileFormatter({
        date: this.state.currentDate,
        index: i + 1
      });

      await moveAndMaybeCompressFile(
        sourceFilePath,
        targetFilePath,
        this.options.compress && i === 0
      );
    }

    this.state.currentSize = 0;
    this.state.currentDate = this.state.currentDate
      ? format$1(this.options.pattern, newNow())
      : null;
    debug$6(
      `_moveOldFiles: finished rolling files. state=${JSON.stringify(
        this.state
      )}`
    );
    this._renewWriteStream();
    // wait for the file to be open before cleaning up old ones,
    // otherwise the daysToKeep calculations can be off
    await new Promise((resolve, reject) => {
      this.currentFileStream.write("", "utf8", () => {
        this._clean()
          .then(resolve)
          .catch(reject);
      });
    });
  }

  // Sorted from the oldest to the latest
  async _getExistingFiles() {
    const files = await fs$5.readdir(this.fileObject.dir).catch(() => []);

    debug$6(`_getExistingFiles: files=${files}`);
    const existingFileDetails = files
      .map(n => this.fileNameParser(n))
      .filter(n => n);

    const getKey = n =>
      (n.timestamp ? n.timestamp : newNow().getTime()) - n.index;
    existingFileDetails.sort((a, b) => getKey(a) - getKey(b));

    return existingFileDetails;
  }

  _renewWriteStream() {
    fs$5.ensureDirSync(this.fileObject.dir);
    const filePath = this.fileFormatter({
      date: this.state.currentDate,
      index: 0
    });
    const ops = {
      flags: this.options.flags,
      encoding: this.options.encoding,
      mode: this.options.mode
    };
    this.currentFileStream = fs$5.createWriteStream(filePath, ops);
    this.currentFileStream.on("error", e => {
      this.emit("error", e);
    });
  }

  async _clean() {
    const existingFileDetails = await this._getExistingFiles();
    debug$6(
      `_clean: numToKeep = ${this.options.numToKeep}, existingFiles = ${existingFileDetails.length}`
    );
    debug$6("_clean: existing files are: ", existingFileDetails);
    if (this._tooManyFiles(existingFileDetails.length)) {
      const fileNamesToRemove = existingFileDetails
        .slice(0, existingFileDetails.length - this.options.numToKeep - 1)
        .map(f => path$7.format({ dir: this.fileObject.dir, base: f.filename }));
      await deleteFiles(fileNamesToRemove);
    }
  }

  _tooManyFiles(numFiles) {
    return this.options.numToKeep > 0 && numFiles > this.options.numToKeep;
  }
}

const deleteFiles = fileNames => {
  debug$6(`deleteFiles: files to delete: ${fileNames}`);
  return Promise.all(fileNames.map(f => fs$5.unlink(f).catch((e) => {
    debug$6(`deleteFiles: error when unlinking ${f}, ignoring. Error was ${e}`);
  })));
};

var RollingFileWriteStream_1 = RollingFileWriteStream$2;

const RollingFileWriteStream$1 = RollingFileWriteStream_1;

// just to adapt the previous version
class RollingFileStream extends RollingFileWriteStream$1 {
  constructor(filename, size, backups, options) {
    if (!options) {
      options = {};
    }
    if (size) {
      options.maxSize = size;
    }
    if (!backups) {
      backups = 1;
    }
    options.numToKeep = backups;
    super(filename, options);
    this.backups = this.options.numToKeep;
    this.size = this.options.maxSize;
  }

  get theStream() {
    return this.currentFileStream;
  }

}

var RollingFileStream_1 = RollingFileStream;

const RollingFileWriteStream = RollingFileWriteStream_1;

// just to adapt the previous version
class DateRollingFileStream extends RollingFileWriteStream {
  constructor(filename, pattern, options) {
    if (pattern && typeof(pattern) === 'object') {
      options = pattern;
      pattern = null;
    }
    if (!options) {
      options = {};
    }
    if (!pattern) {
      pattern = 'yyyy-MM-dd';
    }
    if (options.daysToKeep) {
      options.numToKeep = options.daysToKeep;
    }
    if (pattern.startsWith('.')) {
      pattern = pattern.substring(1);
    }
    options.pattern = pattern;
    super(filename, options);
    this.mode = this.options.mode;
  }

  get theStream() {
    return this.currentFileStream;
  }

}

var DateRollingFileStream_1 = DateRollingFileStream;

var lib = {
  RollingFileWriteStream: RollingFileWriteStream_1,
  RollingFileStream: RollingFileStream_1,
  DateRollingFileStream: DateRollingFileStream_1
};

const debug$5 = src.exports('log4js:file');
const path$6 = require$$1__default$1["default"];
const streams$1 = lib;
const os$3 = require$$1__default["default"];

const eol$2 = os$3.EOL;

function openTheStream(file, fileSize, numFiles, options) {
  const stream = new streams$1.RollingFileStream(
    file,
    fileSize,
    numFiles,
    options
  );
  stream.on('error', (err) => {
    console.error('log4js.fileAppender - Writing to file %s, error happened ', file, err); //eslint-disable-line
  });
  stream.on('drain', () => {
    process.emit("log4js:pause", false);
  });
  return stream;
}


/**
 * File Appender writing the logs to a text file. Supports rolling of logs by size.
 *
 * @param file file log messages will be written to
 * @param layout a function that takes a logEvent and returns a string
 *   (defaults to basicLayout).
 * @param logSize - the maximum size (in bytes) for a log file,
 *   if not provided then logs won't be rotated.
 * @param numBackups - the number of log files to keep after logSize
 *   has been reached (default 5)
 * @param options - options to be passed to the underlying stream
 * @param timezoneOffset - optional timezone offset in minutes (default system local)
 */
function fileAppender$1(file, layout, logSize, numBackups, options, timezoneOffset) {
  file = path$6.normalize(file);
  numBackups = numBackups === undefined ? 5 : numBackups;
  // there has to be at least one backup if logSize has been specified
  numBackups = numBackups === 0 ? 1 : numBackups;

  debug$5(
    'Creating file appender (',
    file, ', ',
    logSize, ', ',
    numBackups, ', ',
    options, ', ',
    timezoneOffset, ')'
  );

  let writer = openTheStream(file, logSize, numBackups, options);

  const app = function (loggingEvent) {
    if (options.removeColor === true) {
      // eslint-disable-next-line no-control-regex
      const regex = /\x1b[[0-9;]*m/g;
      loggingEvent.data = loggingEvent.data.map(d => {
        if (typeof d === 'string') return d.replace(regex, '')
        return d
      });
    }
    if (!writer.write(layout(loggingEvent, timezoneOffset) + eol$2, "utf8")) {
      process.emit('log4js:pause', true);
    }
  };

  app.reopen = function () {
    writer.end(() => { writer = openTheStream(file, logSize, numBackups, options); });
  };

  app.sighupHandler = function () {
    debug$5('SIGHUP handler called.');
    app.reopen();
  };

  app.shutdown = function (complete) {
    process.removeListener('SIGHUP', app.sighupHandler);
    writer.end('', 'utf-8', complete);
  };

  // On SIGHUP, close and reopen all files. This allows this appender to work with
  // logrotate. Note that if you are using logrotate, you should not set
  // `logSize`.
  process.on('SIGHUP', app.sighupHandler);

  return app;
}

function configure$3(config, layouts) {
  let layout = layouts.basicLayout;
  if (config.layout) {
    layout = layouts.layout(config.layout.type, config.layout);
  }

  return fileAppender$1(
    config.filename,
    layout,
    config.maxLogSize,
    config.backups,
    config,
    config.timezoneOffset
  );
}

file$2.configure = configure$3;

var dateFile = {};

const streams = lib;
const os$2 = require$$1__default["default"];

const eol$1 = os$2.EOL;

/**
 * File appender that rolls files according to a date pattern.
 * @filename base filename.
 * @pattern the format that will be added to the end of filename when rolling,
 *          also used to check when to roll files - defaults to '.yyyy-MM-dd'
 * @layout layout function for log messages - defaults to basicLayout
 * @timezoneOffset optional timezone offset in minutes - defaults to system local
 */
function appender(
  filename,
  pattern,
  layout,
  options,
  timezoneOffset
) {
  // the options for file appender use maxLogSize, but the docs say any file appender
  // options should work for dateFile as well.
  options.maxSize = options.maxLogSize;

  const logFile = new streams.DateRollingFileStream(
    filename,
    pattern,
    options
  );

  logFile.on("drain", () => {
    process.emit("log4js:pause", false);
  });

  const app = function (logEvent) {
    if (!logFile.write(layout(logEvent, timezoneOffset) + eol$1, "utf8")) {
      process.emit("log4js:pause", true);
    }
  };

  app.shutdown = function (complete) {
    logFile.write('', 'utf-8', () => {
      logFile.end(complete);
    });
  };

  return app;
}

function configure$2(config, layouts) {
  let layout = layouts.basicLayout;

  if (config.layout) {
    layout = layouts.layout(config.layout.type, config.layout);
  }

  if (!config.alwaysIncludePattern) {
    config.alwaysIncludePattern = false;
  }

  return appender(
    config.filename,
    config.pattern,
    layout,
    config,
    config.timezoneOffset
  );
}

dateFile.configure = configure$2;

var fileSync = {};

const debug$4 = src.exports('log4js:fileSync');
const path$5 = require$$1__default$1["default"];
const fs$4 = require$$0__default$5["default"];
const os$1 = require$$1__default["default"];

const eol = os$1.EOL || '\n';

function touchFile(file, options) {
  // if the file exists, nothing to do
  if (fs$4.existsSync(file)) {
    return;
  }

  // touch the file to apply flags (like w to truncate the file)
  const id = fs$4.openSync(file, options.flags, options.mode);
  fs$4.closeSync(id);
}

class RollingFileSync {
  constructor(filename, size, backups, options) {
    debug$4('In RollingFileStream');

    function throwErrorIfArgumentsAreNotValid() {
      if (!filename || !size || size <= 0) {
        throw new Error('You must specify a filename and file size');
      }
    }

    throwErrorIfArgumentsAreNotValid();

    this.filename = filename;
    this.size = size;
    this.backups = backups || 1;
    this.options = options;
    this.currentSize = 0;

    function currentFileSize(file) {
      let fileSize = 0;

      try {
        fileSize = fs$4.statSync(file).size;
      } catch (e) {
        // file does not exist
        touchFile(file, options);
      }
      return fileSize;
    }

    this.currentSize = currentFileSize(this.filename);
  }

  shouldRoll() {
    debug$4('should roll with current size %d, and max size %d', this.currentSize, this.size);
    return this.currentSize >= this.size;
  }

  roll(filename) {
    const that = this;
    const nameMatcher = new RegExp(`^${path$5.basename(filename)}`);

    function justTheseFiles(item) {
      return nameMatcher.test(item);
    }

    function index(filename_) {
      return parseInt(filename_.substring((`${path$5.basename(filename)}.`).length), 10) || 0;
    }

    function byIndex(a, b) {
      if (index(a) > index(b)) {
        return 1;
      }
      if (index(a) < index(b)) {
        return -1;
      }

      return 0;
    }

    function increaseFileIndex(fileToRename) {
      const idx = index(fileToRename);
      debug$4(`Index of ${fileToRename} is ${idx}`);
      if (idx < that.backups) {
        // on windows, you can get a EEXIST error if you rename a file to an existing file
        // so, we'll try to delete the file we're renaming to first
        try {
          fs$4.unlinkSync(`${filename}.${idx + 1}`);
        } catch (e) {
          // ignore err: if we could not delete, it's most likely that it doesn't exist
        }

        debug$4(`Renaming ${fileToRename} -> ${filename}.${idx + 1}`);
        fs$4.renameSync(path$5.join(path$5.dirname(filename), fileToRename), `${filename}.${idx + 1}`);
      }
    }

    function renameTheFiles() {
      // roll the backups (rename file.n to file.n+1, where n <= numBackups)
      debug$4('Renaming the old files');

      const files = fs$4.readdirSync(path$5.dirname(filename));
      files.filter(justTheseFiles).sort(byIndex).reverse().forEach(increaseFileIndex);
    }

    debug$4('Rolling, rolling, rolling');
    renameTheFiles();
  }

  /* eslint no-unused-vars:0 */
  write(chunk, encoding) {
    const that = this;


    function writeTheChunk() {
      debug$4('writing the chunk to the file');
      that.currentSize += chunk.length;
      fs$4.appendFileSync(that.filename, chunk);
    }

    debug$4('in write');


    if (this.shouldRoll()) {
      this.currentSize = 0;
      this.roll(this.filename);
    }

    writeTheChunk();
  }
}

/**
 * File Appender writing the logs to a text file. Supports rolling of logs by size.
 *
 * @param file file log messages will be written to
 * @param layout a function that takes a logevent and returns a string
 *   (defaults to basicLayout).
 * @param logSize - the maximum size (in bytes) for a log file,
 *   if not provided then logs won't be rotated.
 * @param numBackups - the number of log files to keep after logSize
 *   has been reached (default 5)
 * @param timezoneOffset - optional timezone offset in minutes
 *   (default system local)
 * @param options - passed as is to fs options
 */
function fileAppender(file, layout, logSize, numBackups, timezoneOffset, options) {
  debug$4('fileSync appender created');
  file = path$5.normalize(file);
  numBackups = numBackups === undefined ? 5 : numBackups;
  // there has to be at least one backup if logSize has been specified
  numBackups = numBackups === 0 ? 1 : numBackups;

  function openTheStream(filePath, fileSize, numFiles) {
    let stream;

    if (fileSize) {
      stream = new RollingFileSync(
        filePath,
        fileSize,
        numFiles,
        options
      );
    } else {
      stream = (((f) => {
        // touch the file to apply flags (like w to truncate the file)
        touchFile(f, options);

        return {
          write(data) {
            fs$4.appendFileSync(f, data);
          }
        };
      }))(filePath);
    }

    return stream;
  }

  const logFile = openTheStream(file, logSize, numBackups);

  return (loggingEvent) => {
    logFile.write(layout(loggingEvent, timezoneOffset) + eol);
  };
}

function configure$1(config, layouts) {
  let layout = layouts.basicLayout;
  if (config.layout) {
    layout = layouts.layout(config.layout.type, config.layout);
  }

  const options = {
    flags: config.flags || 'a',
    encoding: config.encoding || 'utf8',
    mode: config.mode || 0o644
  };

  return fileAppender(
    config.filename,
    layout,
    config.maxLogSize,
    config.backups,
    config.timezoneOffset,
    options
  );
}

fileSync.configure = configure$1;

const path$4 = require$$1__default$1["default"];
const debug$3 = src.exports('log4js:appenders');
const configuration$3 = configuration$6;
const clustering$2 = clustering$3;
const levels$4 = levels$6;
const layouts$1 = layouts$2;
const adapters = adapters$2;

// pre-load the core appenders so that webpack can find them
const coreAppenders = new Map();
coreAppenders.set('console', console$1);
coreAppenders.set('stdout', stdout);
coreAppenders.set('stderr', stderr);
coreAppenders.set('logLevelFilter', logLevelFilter$1);
coreAppenders.set('categoryFilter', categoryFilter$1);
coreAppenders.set('noLogFilter', noLogFilter$1);
coreAppenders.set('file', file$2);
coreAppenders.set('dateFile', dateFile);
coreAppenders.set('fileSync', fileSync);

const appenders$2 = new Map();

const tryLoading = (modulePath, config) => {
  debug$3('Loading module from ', modulePath);
  try {
    return commonjsRequire(modulePath); //eslint-disable-line
  } catch (e) {
    // if the module was found, and we still got an error, then raise it
    configuration$3.throwExceptionIf(
      config,
      e.code !== 'MODULE_NOT_FOUND',
      `appender "${modulePath}" could not be loaded (error was: ${e})`
    );
    return undefined;
  }
};

const loadAppenderModule = (type, config) => coreAppenders.get(type)
  || tryLoading(`./${type}`, config)
  || tryLoading(type, config)
  || (require.main && tryLoading(path$4.join(path$4.dirname(require.main.filename), type), config))
  || tryLoading(path$4.join(process.cwd(), type), config);

const appendersLoading = new Set();

const getAppender = (name, config) => {
  if (appenders$2.has(name)) return appenders$2.get(name);
  if (!config.appenders[name]) return false;
  if (appendersLoading.has(name)) throw new Error(`Dependency loop detected for appender ${name}.`);
  appendersLoading.add(name);

  debug$3(`Creating appender ${name}`);
  // eslint-disable-next-line no-use-before-define
  const appender = createAppender(name, config);
  appendersLoading.delete(name);
  appenders$2.set(name, appender);
  return appender;
};

const createAppender = (name, config) => {
  const appenderConfig = config.appenders[name];
  const appenderModule = appenderConfig.type.configure
    ? appenderConfig.type : loadAppenderModule(appenderConfig.type, config);
  configuration$3.throwExceptionIf(
    config,
    configuration$3.not(appenderModule),
    `appender "${name}" is not valid (type "${appenderConfig.type}" could not be found)`
  );
  if (appenderModule.appender) {
    debug$3(`DEPRECATION: Appender ${appenderConfig.type} exports an appender function.`);
  }
  if (appenderModule.shutdown) {
    debug$3(`DEPRECATION: Appender ${appenderConfig.type} exports a shutdown function.`);
  }

  debug$3(`${name}: clustering.isMaster ? ${clustering$2.isMaster()}`);
  debug$3(`${name}: appenderModule is ${require$$2__default$1["default"].inspect(appenderModule)}`); // eslint-disable-line
  return clustering$2.onlyOnMaster(() => {
    debug$3(`calling appenderModule.configure for ${name} / ${appenderConfig.type}`);
    return appenderModule.configure(
      adapters.modifyConfig(appenderConfig),
      layouts$1,
      appender => getAppender(appender, config),
      levels$4
    );
  }, () => { });
};

const setup$1 = (config) => {
  appenders$2.clear();
  appendersLoading.clear();
  const usedAppenders = [];
  Object.values(config.categories).forEach(category => {
    usedAppenders.push(...category.appenders);
  });
  Object.keys(config.appenders).forEach((name) => {
    // dodgy hard-coding of special case for tcp-server which may not have
    // any categories associated with it, but needs to be started up anyway
    if (usedAppenders.includes(name) || config.appenders[name].type === 'tcp-server') {
      getAppender(name, config);
    }
  });
};

setup$1({ appenders: { out: { type: 'stdout' } }, categories: { default: { appenders: ['out'], level: 'trace' } } });

configuration$3.addListener((config) => {
  configuration$3.throwExceptionIf(
    config,
    configuration$3.not(configuration$3.anObject(config.appenders)),
    'must have a property "appenders" of type object.'
  );
  const appenderNames = Object.keys(config.appenders);
  configuration$3.throwExceptionIf(
    config,
    configuration$3.not(appenderNames.length),
    'must define at least one appender.'
  );

  appenderNames.forEach((name) => {
    configuration$3.throwExceptionIf(
      config,
      configuration$3.not(config.appenders[name].type),
      `appender "${name}" is not valid (must be an object with property "type")`
    );
  });
});

configuration$3.addListener(setup$1);

var appenders_1 = appenders$2;

const debug$2 = src.exports('log4js:categories');
const configuration$2 = configuration$6;
const levels$3 = levels$6;
const appenders$1 = appenders_1;

const categories$2 = new Map();

/**
 * Add inherited config to this category.  That includes extra appenders from parent,
 * and level, if none is set on this category.
 * This is recursive, so each parent also gets loaded with inherited appenders.
 * Inheritance is blocked if a category has inherit=false
 * @param  {*} config
 * @param  {*} category the child category
 * @param  {string} categoryName dotted path to category
 * @return {void}
 */
function inheritFromParent(config, category, categoryName) {
  if (category.inherit === false) return;
  const lastDotIndex = categoryName.lastIndexOf('.');
  if (lastDotIndex < 0) return; // category is not a child
  const parentCategoryName = categoryName.substring(0, lastDotIndex);
  let parentCategory = config.categories[parentCategoryName];


  if (!parentCategory) {
    // parent is missing, so implicitly create it, so that it can inherit from its parents
    parentCategory = { inherit: true, appenders: [] };
  }

  // make sure parent has had its inheritance taken care of before pulling its properties to this child
  inheritFromParent(config, parentCategory, parentCategoryName);

  // if the parent is not in the config (because we just created it above),
  // and it inherited a valid configuration, add it to config.categories
  if (!config.categories[parentCategoryName]
    && parentCategory.appenders
    && parentCategory.appenders.length
    && parentCategory.level) {
    config.categories[parentCategoryName] = parentCategory;
  }

  category.appenders = category.appenders || [];
  category.level = category.level || parentCategory.level;

  // merge in appenders from parent (parent is already holding its inherited appenders)
  parentCategory.appenders.forEach((ap) => {
    if (!category.appenders.includes(ap)) {
      category.appenders.push(ap);
    }
  });
  category.parent = parentCategory;
}


/**
 * Walk all categories in the config, and pull down any configuration from parent to child.
 * This includes inherited appenders, and level, where level is not set.
 * Inheritance is skipped where a category has inherit=false.
 * @param  {*} config
 */
function addCategoryInheritance(config) {
  if (!config.categories) return;
  const categoryNames = Object.keys(config.categories);
  categoryNames.forEach((name) => {
    const category = config.categories[name];
    // add inherited appenders and level to this category
    inheritFromParent(config, category, name);
  });
}

configuration$2.addPreProcessingListener(config => addCategoryInheritance(config));

configuration$2.addListener((config) => {
  configuration$2.throwExceptionIf(
    config,
    configuration$2.not(configuration$2.anObject(config.categories)),
    'must have a property "categories" of type object.'
  );

  const categoryNames = Object.keys(config.categories);
  configuration$2.throwExceptionIf(
    config,
    configuration$2.not(categoryNames.length),
    'must define at least one category.'
  );

  categoryNames.forEach((name) => {
    const category = config.categories[name];
    configuration$2.throwExceptionIf(
      config,
      [
        configuration$2.not(category.appenders),
        configuration$2.not(category.level)
      ],
      `category "${name}" is not valid (must be an object with properties "appenders" and "level")`
    );

    configuration$2.throwExceptionIf(
      config,
      configuration$2.not(Array.isArray(category.appenders)),
      `category "${name}" is not valid (appenders must be an array of appender names)`
    );

    configuration$2.throwExceptionIf(
      config,
      configuration$2.not(category.appenders.length),
      `category "${name}" is not valid (appenders must contain at least one appender name)`
    );

    if (Object.prototype.hasOwnProperty.call(category, 'enableCallStack')) {
      configuration$2.throwExceptionIf(
        config,
        typeof category.enableCallStack !== 'boolean',
        `category "${name}" is not valid (enableCallStack must be boolean type)`
      );
    }

    category.appenders.forEach((appender) => {
      configuration$2.throwExceptionIf(
        config,
        configuration$2.not(appenders$1.get(appender)),
        `category "${name}" is not valid (appender "${appender}" is not defined)`
      );
    });

    configuration$2.throwExceptionIf(
      config,
      configuration$2.not(levels$3.getLevel(category.level)),
      `category "${name}" is not valid (level "${category.level}" not recognised;`
      + ` valid levels are ${levels$3.levels.join(', ')})`
    );
  });

  configuration$2.throwExceptionIf(
    config,
    configuration$2.not(config.categories.default),
    'must define a "default" category.'
  );
});

const setup = (config) => {
  categories$2.clear();

  const categoryNames = Object.keys(config.categories);
  categoryNames.forEach((name) => {
    const category = config.categories[name];
    const categoryAppenders = [];
    category.appenders.forEach((appender) => {
      categoryAppenders.push(appenders$1.get(appender));
      debug$2(`Creating category ${name}`);
      categories$2.set(
        name,
        {
          appenders: categoryAppenders,
          level: levels$3.getLevel(category.level),
          enableCallStack: category.enableCallStack || false
        }
      );
    });
  });
};

setup({ categories: { default: { appenders: ['out'], level: 'OFF' } } });
configuration$2.addListener(setup);

const configForCategory = (category) => {
  debug$2(`configForCategory: searching for config for ${category}`);
  if (categories$2.has(category)) {
    debug$2(`configForCategory: ${category} exists in config, returning it`);
    return categories$2.get(category);
  }
  if (category.indexOf('.') > 0) {
    debug$2(`configForCategory: ${category} has hierarchy, searching for parents`);
    return configForCategory(category.substring(0, category.lastIndexOf('.')));
  }
  debug$2('configForCategory: returning config for default category');
  return configForCategory('default');
};

const appendersForCategory = category => configForCategory(category).appenders;
const getLevelForCategory = category => configForCategory(category).level;

const setLevelForCategory = (category, level) => {
  let categoryConfig = categories$2.get(category);
  debug$2(`setLevelForCategory: found ${categoryConfig} for ${category}`);
  if (!categoryConfig) {
    const sourceCategoryConfig = configForCategory(category);
    debug$2('setLevelForCategory: no config found for category, '
      + `found ${sourceCategoryConfig} for parents of ${category}`);
    categoryConfig = { appenders: sourceCategoryConfig.appenders };
  }
  categoryConfig.level = level;
  categories$2.set(category, categoryConfig);
};

const getEnableCallStackForCategory = category => configForCategory(category).enableCallStack === true;
const setEnableCallStackForCategory = (category, useCallStack) => {
  configForCategory(category).enableCallStack = useCallStack;
};

var categories_1 = {
  appendersForCategory,
  getLevelForCategory,
  setLevelForCategory,
  getEnableCallStackForCategory,
  setEnableCallStackForCategory,
};

/* eslint no-underscore-dangle:0 */

const debug$1 = src.exports("log4js:logger");
const LoggingEvent = LoggingEvent_1;
const levels$2 = levels$6;
const clustering$1 = clustering$3;
const categories$1 = categories_1;
const configuration$1 = configuration$6;

const stackReg = /at (?:(.+)\s+\()?(?:(.+?):(\d+)(?::(\d+))?|([^)]+))\)?/;
function defaultParseCallStack(data, skipIdx = 4) {
  const stacklines = data.stack.split("\n").slice(skipIdx);
  const lineMatch = stackReg.exec(stacklines[0]);
  if (lineMatch && lineMatch.length === 6) {
    return {
      functionName: lineMatch[1],
      fileName: lineMatch[2],
      lineNumber: parseInt(lineMatch[3], 10),
      columnNumber: parseInt(lineMatch[4], 10),
      callStack: stacklines.join("\n")
    };
  }
  return null;
}

/**
 * Logger to log messages.
 * use {@see log4js#getLogger(String)} to get an instance.
 *
 * @name Logger
 * @namespace Log4js
 * @param name name of category to log to
 * @param level - the loglevel for the category
 * @param dispatch - the function which will receive the logevents
 *
 * @author Stephan Strittmatter
 */
class Logger$1 {
  constructor(name) {
    if (!name) {
      throw new Error("No category provided.");
    }
    this.category = name;
    this.context = {};
    this.parseCallStack = defaultParseCallStack;
    debug$1(`Logger created (${this.category}, ${this.level})`);
  }

  get level() {
    return levels$2.getLevel(
      categories$1.getLevelForCategory(this.category),
      levels$2.TRACE
    );
  }

  set level(level) {
    categories$1.setLevelForCategory(
      this.category,
      levels$2.getLevel(level, this.level)
    );
  }

  get useCallStack() {
    return categories$1.getEnableCallStackForCategory(this.category);
  }

  set useCallStack(bool) {
    categories$1.setEnableCallStackForCategory(this.category, bool === true);
  }

  log(level, ...args) {
    const logLevel = levels$2.getLevel(level, levels$2.INFO);
    if (this.isLevelEnabled(logLevel)) {
      this._log(logLevel, args);
    }
  }

  isLevelEnabled(otherLevel) {
    return this.level.isLessThanOrEqualTo(otherLevel);
  }

  _log(level, data) {
    debug$1(`sending log data (${level}) to appenders`);
    const loggingEvent = new LoggingEvent(
      this.category,
      level,
      data,
      this.context,
      this.useCallStack && this.parseCallStack(new Error())
    );
    clustering$1.send(loggingEvent);
  }

  addContext(key, value) {
    this.context[key] = value;
  }

  removeContext(key) {
    delete this.context[key];
  }

  clearContext() {
    this.context = {};
  }

  setParseCallStackFunction(parseFunction) {
    this.parseCallStack = parseFunction;
  }
}

function addLevelMethods(target) {
  const level = levels$2.getLevel(target);

  const levelStrLower = level.toString().toLowerCase();
  const levelMethod = levelStrLower.replace(/_([a-z])/g, g =>
    g[1].toUpperCase()
  );
  const isLevelMethod = levelMethod[0].toUpperCase() + levelMethod.slice(1);

  Logger$1.prototype[`is${isLevelMethod}Enabled`] = function() {
    return this.isLevelEnabled(level);
  };

  Logger$1.prototype[levelMethod] = function(...args) {
    this.log(level, ...args);
  };
}

levels$2.levels.forEach(addLevelMethods);

configuration$1.addListener(() => {
  levels$2.levels.forEach(addLevelMethods);
});

var logger = Logger$1;

/* eslint-disable no-plusplus */

const levels$1 = levels$6;

const DEFAULT_FORMAT =
  ":remote-addr - -" +
  ' ":method :url HTTP/:http-version"' +
  ' :status :content-length ":referrer"' +
  ' ":user-agent"';

/**
 * Return request url path,
 * adding this function prevents the Cyclomatic Complexity,
 * for the assemble_tokens function at low, to pass the tests.
 *
 * @param  {IncomingMessage} req
 * @return {string}
 * @api private
 */
function getUrl(req) {
  return req.originalUrl || req.url;
}

/**
 * Adds custom {token, replacement} objects to defaults,
 * overwriting the defaults if any tokens clash
 *
 * @param  {IncomingMessage} req
 * @param  {ServerResponse} res
 * @param  {Array} customTokens
 *    [{ token: string-or-regexp, replacement: string-or-replace-function }]
 * @return {Array}
 */
function assembleTokens(req, res, customTokens) {
  const arrayUniqueTokens = array => {
    const a = array.concat();
    for (let i = 0; i < a.length; ++i) {
      for (let j = i + 1; j < a.length; ++j) {
        // not === because token can be regexp object
        /* eslint eqeqeq:0 */
        if (a[i].token == a[j].token) {
          a.splice(j--, 1);
        }
      }
    }
    return a;
  };

  const defaultTokens = [];
  defaultTokens.push({ token: ":url", replacement: getUrl(req) });
  defaultTokens.push({ token: ":protocol", replacement: req.protocol });
  defaultTokens.push({ token: ":hostname", replacement: req.hostname });
  defaultTokens.push({ token: ":method", replacement: req.method });
  defaultTokens.push({
    token: ":status",
    replacement: res.__statusCode || res.statusCode
  });
  defaultTokens.push({
    token: ":response-time",
    replacement: res.responseTime
  });
  defaultTokens.push({ token: ":date", replacement: new Date().toUTCString() });
  defaultTokens.push({
    token: ":referrer",
    replacement: req.headers.referer || req.headers.referrer || ""
  });
  defaultTokens.push({
    token: ":http-version",
    replacement: `${req.httpVersionMajor}.${req.httpVersionMinor}`
  });
  defaultTokens.push({
    token: ":remote-addr",
    replacement:
      req.headers["x-forwarded-for"] ||
      req.ip ||
      req._remoteAddress ||
      (req.socket &&
        (req.socket.remoteAddress ||
          (req.socket.socket && req.socket.socket.remoteAddress)))
  });
  defaultTokens.push({
    token: ":user-agent",
    replacement: req.headers["user-agent"]
  });
  defaultTokens.push({
    token: ":content-length",
    replacement:
      res.getHeader("content-length") ||
      (res.__headers && res.__headers["Content-Length"]) ||
      "-"
  });
  defaultTokens.push({
    token: /:req\[([^\]]+)]/g,
    replacement(_, field) {
      return req.headers[field.toLowerCase()];
    }
  });
  defaultTokens.push({
    token: /:res\[([^\]]+)]/g,
    replacement(_, field) {
      return (
        res.getHeader(field.toLowerCase()) ||
        (res.__headers && res.__headers[field])
      );
    }
  });

  return arrayUniqueTokens(customTokens.concat(defaultTokens));
}

/**
 * Return formatted log line.
 *
 * @param  {string} str
 * @param {Array} tokens
 * @return {string}
 * @api private
 */
function format(str, tokens) {
  for (let i = 0; i < tokens.length; i++) {
    str = str.replace(tokens[i].token, tokens[i].replacement);
  }
  return str;
}

/**
 * Return RegExp Object about nolog
 *
 * @param  {(string|Array)} nolog
 * @return {RegExp}
 * @api private
 *
 * syntax
 *  1. String
 *   1.1 "\\.gif"
 *         NOT LOGGING http://example.com/hoge.gif and http://example.com/hoge.gif?fuga
 *         LOGGING http://example.com/hoge.agif
 *   1.2 in "\\.gif|\\.jpg$"
 *         NOT LOGGING http://example.com/hoge.gif and
 *           http://example.com/hoge.gif?fuga and http://example.com/hoge.jpg?fuga
 *         LOGGING http://example.com/hoge.agif,
 *           http://example.com/hoge.ajpg and http://example.com/hoge.jpg?hoge
 *   1.3 in "\\.(gif|jpe?g|png)$"
 *         NOT LOGGING http://example.com/hoge.gif and http://example.com/hoge.jpeg
 *         LOGGING http://example.com/hoge.gif?uid=2 and http://example.com/hoge.jpg?pid=3
 *  2. RegExp
 *   2.1 in /\.(gif|jpe?g|png)$/
 *         SAME AS 1.3
 *  3. Array
 *   3.1 ["\\.jpg$", "\\.png", "\\.gif"]
 *         SAME AS "\\.jpg|\\.png|\\.gif"
 */
function createNoLogCondition(nolog) {
  let regexp = null;

  if (nolog instanceof RegExp) {
    regexp = nolog;
  }

  if (typeof nolog === "string") {
    regexp = new RegExp(nolog);
  }

  if (Array.isArray(nolog)) {
    // convert to strings
    const regexpsAsStrings = nolog.map(reg => (reg.source ? reg.source : reg));
    regexp = new RegExp(regexpsAsStrings.join("|"));
  }

  return regexp;
}

/**
 * Allows users to define rules around status codes to assign them to a specific
 * logging level.
 * There are two types of rules:
 *   - RANGE: matches a code within a certain range
 *     E.g. { 'from': 200, 'to': 299, 'level': 'info' }
 *   - CONTAINS: matches a code to a set of expected codes
 *     E.g. { 'codes': [200, 203], 'level': 'debug' }
 * Note*: Rules are respected only in order of prescendence.
 *
 * @param {Number} statusCode
 * @param {Level} currentLevel
 * @param {Object} ruleSet
 * @return {Level}
 * @api private
 */
function matchRules(statusCode, currentLevel, ruleSet) {
  let level = currentLevel;

  if (ruleSet) {
    const matchedRule = ruleSet.find(rule => {
      let ruleMatched = false;
      if (rule.from && rule.to) {
        ruleMatched = statusCode >= rule.from && statusCode <= rule.to;
      } else {
        ruleMatched = rule.codes.indexOf(statusCode) !== -1;
      }
      return ruleMatched;
    });
    if (matchedRule) {
      level = levels$1.getLevel(matchedRule.level, level);
    }
  }
  return level;
}

/**
 * Log requests with the given `options` or a `format` string.
 *
 * Options:
 *
 *   - `format`        Format string, see below for tokens
 *   - `level`         A log4js levels instance. Supports also 'auto'
 *   - `nolog`         A string or RegExp to exclude target logs
 *   - `statusRules`   A array of rules for setting specific logging levels base on status codes
 *   - `context`       Whether to add a response of express to the context
 *
 * Tokens:
 *
 *   - `:req[header]` ex: `:req[Accept]`
 *   - `:res[header]` ex: `:res[Content-Length]`
 *   - `:http-version`
 *   - `:response-time`
 *   - `:remote-addr`
 *   - `:date`
 *   - `:method`
 *   - `:url`
 *   - `:referrer`
 *   - `:user-agent`
 *   - `:status`
 *
 * @return {Function}
 * @param logger4js
 * @param options
 * @api public
 */
var connectLogger$1 = function getLogger(logger4js, options) {
  /* eslint no-underscore-dangle:0 */
  if (typeof options === "string" || typeof options === "function") {
    options = { format: options };
  } else {
    options = options || {};
  }

  const thisLogger = logger4js;
  let level = levels$1.getLevel(options.level, levels$1.INFO);
  const fmt = options.format || DEFAULT_FORMAT;
  const nolog = createNoLogCondition(options.nolog);

  return (req, res, next) => {
    // mount safety
    if (req._logging) return next();

    // nologs
    if (nolog && nolog.test(req.originalUrl)) return next();

    if (thisLogger.isLevelEnabled(level) || options.level === "auto") {
      const start = new Date();
      const { writeHead } = res;

      // flag as logging
      req._logging = true;

      // proxy for statusCode.
      res.writeHead = (code, headers) => {
        res.writeHead = writeHead;
        res.writeHead(code, headers);

        res.__statusCode = code;
        res.__headers = headers || {};
      };

      // hook on end request to emit the log entry of the HTTP request.
      res.on("finish", () => {
        res.responseTime = new Date() - start;
        // status code response level handling
        if (res.statusCode && options.level === "auto") {
          level = levels$1.INFO;
          if (res.statusCode >= 300) level = levels$1.WARN;
          if (res.statusCode >= 400) level = levels$1.ERROR;
        }
        level = matchRules(res.statusCode, level, options.statusRules);

        const combinedTokens = assembleTokens(req, res, options.tokens || []);

        if (options.context) thisLogger.addContext("res", res);
        if (typeof fmt === "function") {
          const line = fmt(req, res, str => format(str, combinedTokens));
          if (line) thisLogger.log(level, line);
        } else {
          thisLogger.log(level, format(fmt, combinedTokens));
        }
        if (options.context) thisLogger.removeContext("res");
      });
    }

    // ensure next gets always called
    return next();
  };
};

/**
 * @fileoverview log4js is a library to log in JavaScript in similar manner
 * than in log4j for Java (but not really).
 *
 * <h3>Example:</h3>
 * <pre>
 *  const logging = require('log4js');
 *  const log = logging.getLogger('some-category');
 *
 *  //call the log
 *  log.trace('trace me' );
 * </pre>
 *
 * NOTE: the authors below are the original browser-based log4js authors
 * don't try to contact them about bugs in this version :)
 * @author Stephan Strittmatter - http://jroller.com/page/stritti
 * @author Seth Chisamore - http://www.chisamore.com
 * @since 2005-05-20
 * Website: http://log4js.berlios.de
 */

const debug = src.exports("log4js:main");
const fs$3 = require$$0__default$5["default"];
const deepClone = rfdc_1({ proto: true });
const configuration = configuration$6;
const layouts = layouts$2;
const levels = levels$6;
const appenders = appenders_1;
const categories = categories_1;
const Logger = logger;
const clustering = clustering$3;
const connectLogger = connectLogger$1;

let enabled = false;

function sendLogEventToAppender(logEvent) {
  if (!enabled) return;
  debug("Received log event ", logEvent);
  const categoryAppenders = categories.appendersForCategory(
    logEvent.categoryName
  );
  categoryAppenders.forEach(appender => {
    appender(logEvent);
  });
}

function loadConfigurationFile(filename) {
  debug(`Loading configuration from ${filename}`);
  try {
    return JSON.parse(fs$3.readFileSync(filename, "utf8"));
  } catch (e) {
    throw new Error(
      `Problem reading config from file "${filename}". Error was ${e.message}`,
      e
    );
  }
}

function configure(configurationFileOrObject) {
  let configObject = configurationFileOrObject;

  if (typeof configObject === "string") {
    configObject = loadConfigurationFile(configurationFileOrObject);
  }
  debug(`Configuration is ${configObject}`);

  configuration.configure(deepClone(configObject));

  clustering.onMessage(sendLogEventToAppender);

  enabled = true;

  // eslint-disable-next-line no-use-before-define
  return log4js;
}

/**
 * Shutdown all log appenders. This will first disable all writing to appenders
 * and then call the shutdown function each appender.
 *
 * @params {Function} cb - The callback to be invoked once all appenders have
 *  shutdown. If an error occurs, the callback will be given the error object
 *  as the first argument.
 */
function shutdown(cb) {
  debug("Shutdown called. Disabling all log writing.");
  // First, disable all writing to appenders. This prevents appenders from
  // not being able to be drained because of run-away log writes.
  enabled = false;

  // Call each of the shutdown functions in parallel
  const appendersToCheck = Array.from(appenders.values());
  const shutdownFunctions = appendersToCheck.reduceRight(
    (accum, next) => (next.shutdown ? accum + 1 : accum),
    0
  );
  let completed = 0;
  let error;

  debug(`Found ${shutdownFunctions} appenders with shutdown functions.`);
  function complete(err) {
    error = error || err;
    completed += 1;
    debug(`Appender shutdowns complete: ${completed} / ${shutdownFunctions}`);
    if (completed >= shutdownFunctions) {
      debug("All shutdown functions completed.");
      if (cb) {
        cb(error);
      }
    }
  }

  if (shutdownFunctions === 0) {
    debug("No appenders with shutdown functions found.");
    return cb !== undefined && cb();
  }

  appendersToCheck.filter(a => a.shutdown).forEach(a => a.shutdown(complete));

  return null;
}

/**
 * Get a logger instance.
 * @static
 * @param loggerCategoryName
 * @return {Logger} instance of logger for the category
 */
function getLogger(category) {
  if (!enabled) {
    configure(
      process.env.LOG4JS_CONFIG || {
        appenders: { out: { type: "stdout" } },
        categories: { default: { appenders: ["out"], level: "OFF" } }
      }
    );
  }
  return new Logger(category || "default");
}

/**
 * @name log4js
 * @namespace Log4js
 * @property getLogger
 * @property configure
 * @property shutdown
 */
const log4js = {
  getLogger,
  configure,
  shutdown,
  connectLogger,
  levels,
  addLayout: layouts.addLayout
};

var log4js_1 = log4js;

var dayjs_min = {exports: {}};

(function (module, exports) {
!function(t,e){module.exports=e();}(commonjsGlobal,(function(){var t=1e3,e=6e4,n=36e5,r="millisecond",i="second",s="minute",u="hour",a="day",o="week",f="month",h="quarter",c="year",d="date",$="Invalid Date",l=/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,y=/\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,M={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_")},m=function(t,e,n){var r=String(t);return !r||r.length>=e?t:""+Array(e+1-r.length).join(n)+t},g={s:m,z:function(t){var e=-t.utcOffset(),n=Math.abs(e),r=Math.floor(n/60),i=n%60;return (e<=0?"+":"-")+m(r,2,"0")+":"+m(i,2,"0")},m:function t(e,n){if(e.date()<n.date())return -t(n,e);var r=12*(n.year()-e.year())+(n.month()-e.month()),i=e.clone().add(r,f),s=n-i<0,u=e.clone().add(r+(s?-1:1),f);return +(-(r+(n-i)/(s?i-u:u-i))||0)},a:function(t){return t<0?Math.ceil(t)||0:Math.floor(t)},p:function(t){return {M:f,y:c,w:o,d:a,D:d,h:u,m:s,s:i,ms:r,Q:h}[t]||String(t||"").toLowerCase().replace(/s$/,"")},u:function(t){return void 0===t}},D="en",v={};v[D]=M;var p=function(t){return t instanceof _},S=function(t,e,n){var r;if(!t)return D;if("string"==typeof t)v[t]&&(r=t),e&&(v[t]=e,r=t);else {var i=t.name;v[i]=t,r=i;}return !n&&r&&(D=r),r||!n&&D},w=function(t,e){if(p(t))return t.clone();var n="object"==typeof e?e:{};return n.date=t,n.args=arguments,new _(n)},O=g;O.l=S,O.i=p,O.w=function(t,e){return w(t,{locale:e.$L,utc:e.$u,x:e.$x,$offset:e.$offset})};var _=function(){function M(t){this.$L=S(t.locale,null,!0),this.parse(t);}var m=M.prototype;return m.parse=function(t){this.$d=function(t){var e=t.date,n=t.utc;if(null===e)return new Date(NaN);if(O.u(e))return new Date;if(e instanceof Date)return new Date(e);if("string"==typeof e&&!/Z$/i.test(e)){var r=e.match(l);if(r){var i=r[2]-1||0,s=(r[7]||"0").substring(0,3);return n?new Date(Date.UTC(r[1],i,r[3]||1,r[4]||0,r[5]||0,r[6]||0,s)):new Date(r[1],i,r[3]||1,r[4]||0,r[5]||0,r[6]||0,s)}}return new Date(e)}(t),this.$x=t.x||{},this.init();},m.init=function(){var t=this.$d;this.$y=t.getFullYear(),this.$M=t.getMonth(),this.$D=t.getDate(),this.$W=t.getDay(),this.$H=t.getHours(),this.$m=t.getMinutes(),this.$s=t.getSeconds(),this.$ms=t.getMilliseconds();},m.$utils=function(){return O},m.isValid=function(){return !(this.$d.toString()===$)},m.isSame=function(t,e){var n=w(t);return this.startOf(e)<=n&&n<=this.endOf(e)},m.isAfter=function(t,e){return w(t)<this.startOf(e)},m.isBefore=function(t,e){return this.endOf(e)<w(t)},m.$g=function(t,e,n){return O.u(t)?this[e]:this.set(n,t)},m.unix=function(){return Math.floor(this.valueOf()/1e3)},m.valueOf=function(){return this.$d.getTime()},m.startOf=function(t,e){var n=this,r=!!O.u(e)||e,h=O.p(t),$=function(t,e){var i=O.w(n.$u?Date.UTC(n.$y,e,t):new Date(n.$y,e,t),n);return r?i:i.endOf(a)},l=function(t,e){return O.w(n.toDate()[t].apply(n.toDate("s"),(r?[0,0,0,0]:[23,59,59,999]).slice(e)),n)},y=this.$W,M=this.$M,m=this.$D,g="set"+(this.$u?"UTC":"");switch(h){case c:return r?$(1,0):$(31,11);case f:return r?$(1,M):$(0,M+1);case o:var D=this.$locale().weekStart||0,v=(y<D?y+7:y)-D;return $(r?m-v:m+(6-v),M);case a:case d:return l(g+"Hours",0);case u:return l(g+"Minutes",1);case s:return l(g+"Seconds",2);case i:return l(g+"Milliseconds",3);default:return this.clone()}},m.endOf=function(t){return this.startOf(t,!1)},m.$set=function(t,e){var n,o=O.p(t),h="set"+(this.$u?"UTC":""),$=(n={},n[a]=h+"Date",n[d]=h+"Date",n[f]=h+"Month",n[c]=h+"FullYear",n[u]=h+"Hours",n[s]=h+"Minutes",n[i]=h+"Seconds",n[r]=h+"Milliseconds",n)[o],l=o===a?this.$D+(e-this.$W):e;if(o===f||o===c){var y=this.clone().set(d,1);y.$d[$](l),y.init(),this.$d=y.set(d,Math.min(this.$D,y.daysInMonth())).$d;}else $&&this.$d[$](l);return this.init(),this},m.set=function(t,e){return this.clone().$set(t,e)},m.get=function(t){return this[O.p(t)]()},m.add=function(r,h){var d,$=this;r=Number(r);var l=O.p(h),y=function(t){var e=w($);return O.w(e.date(e.date()+Math.round(t*r)),$)};if(l===f)return this.set(f,this.$M+r);if(l===c)return this.set(c,this.$y+r);if(l===a)return y(1);if(l===o)return y(7);var M=(d={},d[s]=e,d[u]=n,d[i]=t,d)[l]||1,m=this.$d.getTime()+r*M;return O.w(m,this)},m.subtract=function(t,e){return this.add(-1*t,e)},m.format=function(t){var e=this,n=this.$locale();if(!this.isValid())return n.invalidDate||$;var r=t||"YYYY-MM-DDTHH:mm:ssZ",i=O.z(this),s=this.$H,u=this.$m,a=this.$M,o=n.weekdays,f=n.months,h=function(t,n,i,s){return t&&(t[n]||t(e,r))||i[n].substr(0,s)},c=function(t){return O.s(s%12||12,t,"0")},d=n.meridiem||function(t,e,n){var r=t<12?"AM":"PM";return n?r.toLowerCase():r},l={YY:String(this.$y).slice(-2),YYYY:this.$y,M:a+1,MM:O.s(a+1,2,"0"),MMM:h(n.monthsShort,a,f,3),MMMM:h(f,a),D:this.$D,DD:O.s(this.$D,2,"0"),d:String(this.$W),dd:h(n.weekdaysMin,this.$W,o,2),ddd:h(n.weekdaysShort,this.$W,o,3),dddd:o[this.$W],H:String(s),HH:O.s(s,2,"0"),h:c(1),hh:c(2),a:d(s,u,!0),A:d(s,u,!1),m:String(u),mm:O.s(u,2,"0"),s:String(this.$s),ss:O.s(this.$s,2,"0"),SSS:O.s(this.$ms,3,"0"),Z:i};return r.replace(y,(function(t,e){return e||l[t]||i.replace(":","")}))},m.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},m.diff=function(r,d,$){var l,y=O.p(d),M=w(r),m=(M.utcOffset()-this.utcOffset())*e,g=this-M,D=O.m(this,M);return D=(l={},l[c]=D/12,l[f]=D,l[h]=D/3,l[o]=(g-m)/6048e5,l[a]=(g-m)/864e5,l[u]=g/n,l[s]=g/e,l[i]=g/t,l)[y]||g,$?D:O.a(D)},m.daysInMonth=function(){return this.endOf(f).$D},m.$locale=function(){return v[this.$L]},m.locale=function(t,e){if(!t)return this.$L;var n=this.clone(),r=S(t,e,!0);return r&&(n.$L=r),n},m.clone=function(){return O.w(this.$d,this)},m.toDate=function(){return new Date(this.valueOf())},m.toJSON=function(){return this.isValid()?this.toISOString():null},m.toISOString=function(){return this.$d.toISOString()},m.toString=function(){return this.$d.toUTCString()},M}(),b=_.prototype;return w.prototype=b,[["$ms",r],["$s",i],["$m",s],["$H",u],["$W",a],["$M",f],["$y",c],["$D",d]].forEach((function(t){b[t[1]]=function(e){return this.$g(e,t[0],t[1])};})),w.extend=function(t,e){return t.$i||(t(e,_,w),t.$i=!0),w},w.locale=S,w.isDayjs=p,w.unix=function(t){return w(1e3*t)},w.en=v[D],w.Ls=v,w.p={},w}));
}(dayjs_min));

var dayjs = dayjs_min.exports;

const timeNow = dayjs().format('YYYY-MM-DDTHHmmss');
const logFile = require$$1__default$1["default"].join(__dirname, `../logs/time-${timeNow}.log`);
const logConfigDefault = {
    appenders: {
        console: { type: 'console' },
        file: { type: 'file', filename: logFile }
    },
    categories: {
        default: { appenders: ['file', 'console'], level: 'debug' },
    }
};
log4js_1.configure(logConfigDefault);
const logx = log4js_1.getLogger();
function createLogProxy(logLevel, logger = logx) {
    return (messeage, ...arg) => {
        switch (logLevel) {
            case 'debug':
                return logger.debug(messeage, ...arg);
            case 'info':
                return logger.info(messeage, ...arg);
            case 'warn':
                return logger.warn(messeage, ...arg);
            case 'error':
                return logger.error(messeage, ...arg);
        }
    };
}
console.log = createLogProxy('debug');
console.info = createLogProxy('info');
console.warn = createLogProxy('warn');
console.error = createLogProxy('error');
logx.info(logFile);

var execa$2 = {exports: {}};

var crossSpawn$1 = {exports: {}};

var windows = isexe$3;
isexe$3.sync = sync$2;

var fs$2 = require$$0__default$5["default"];

function checkPathExt (path, options) {
  var pathext = options.pathExt !== undefined ?
    options.pathExt : process.env.PATHEXT;

  if (!pathext) {
    return true
  }

  pathext = pathext.split(';');
  if (pathext.indexOf('') !== -1) {
    return true
  }
  for (var i = 0; i < pathext.length; i++) {
    var p = pathext[i].toLowerCase();
    if (p && path.substr(-p.length).toLowerCase() === p) {
      return true
    }
  }
  return false
}

function checkStat$1 (stat, path, options) {
  if (!stat.isSymbolicLink() && !stat.isFile()) {
    return false
  }
  return checkPathExt(path, options)
}

function isexe$3 (path, options, cb) {
  fs$2.stat(path, function (er, stat) {
    cb(er, er ? false : checkStat$1(stat, path, options));
  });
}

function sync$2 (path, options) {
  return checkStat$1(fs$2.statSync(path), path, options)
}

var mode = isexe$2;
isexe$2.sync = sync$1;

var fs$1 = require$$0__default$5["default"];

function isexe$2 (path, options, cb) {
  fs$1.stat(path, function (er, stat) {
    cb(er, er ? false : checkStat(stat, options));
  });
}

function sync$1 (path, options) {
  return checkStat(fs$1.statSync(path), options)
}

function checkStat (stat, options) {
  return stat.isFile() && checkMode(stat, options)
}

function checkMode (stat, options) {
  var mod = stat.mode;
  var uid = stat.uid;
  var gid = stat.gid;

  var myUid = options.uid !== undefined ?
    options.uid : process.getuid && process.getuid();
  var myGid = options.gid !== undefined ?
    options.gid : process.getgid && process.getgid();

  var u = parseInt('100', 8);
  var g = parseInt('010', 8);
  var o = parseInt('001', 8);
  var ug = u | g;

  var ret = (mod & o) ||
    (mod & g) && gid === myGid ||
    (mod & u) && uid === myUid ||
    (mod & ug) && myUid === 0;

  return ret
}

var core$1;
if (process.platform === 'win32' || commonjsGlobal.TESTING_WINDOWS) {
  core$1 = windows;
} else {
  core$1 = mode;
}

var isexe_1 = isexe$1;
isexe$1.sync = sync;

function isexe$1 (path, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  if (!cb) {
    if (typeof Promise !== 'function') {
      throw new TypeError('callback not provided')
    }

    return new Promise(function (resolve, reject) {
      isexe$1(path, options || {}, function (er, is) {
        if (er) {
          reject(er);
        } else {
          resolve(is);
        }
      });
    })
  }

  core$1(path, options || {}, function (er, is) {
    // ignore EACCES because that just means we aren't allowed to run it
    if (er) {
      if (er.code === 'EACCES' || options && options.ignoreErrors) {
        er = null;
        is = false;
      }
    }
    cb(er, is);
  });
}

function sync (path, options) {
  // my kingdom for a filtered catch
  try {
    return core$1.sync(path, options || {})
  } catch (er) {
    if (options && options.ignoreErrors || er.code === 'EACCES') {
      return false
    } else {
      throw er
    }
  }
}

const isWindows = process.platform === 'win32' ||
    process.env.OSTYPE === 'cygwin' ||
    process.env.OSTYPE === 'msys';

const path$3 = require$$1__default$1["default"];
const COLON = isWindows ? ';' : ':';
const isexe = isexe_1;

const getNotFoundError = (cmd) =>
  Object.assign(new Error(`not found: ${cmd}`), { code: 'ENOENT' });

const getPathInfo = (cmd, opt) => {
  const colon = opt.colon || COLON;

  // If it has a slash, then we don't bother searching the pathenv.
  // just check the file itself, and that's it.
  const pathEnv = cmd.match(/\//) || isWindows && cmd.match(/\\/) ? ['']
    : (
      [
        // windows always checks the cwd first
        ...(isWindows ? [process.cwd()] : []),
        ...(opt.path || process.env.PATH ||
          /* istanbul ignore next: very unusual */ '').split(colon),
      ]
    );
  const pathExtExe = isWindows
    ? opt.pathExt || process.env.PATHEXT || '.EXE;.CMD;.BAT;.COM'
    : '';
  const pathExt = isWindows ? pathExtExe.split(colon) : [''];

  if (isWindows) {
    if (cmd.indexOf('.') !== -1 && pathExt[0] !== '')
      pathExt.unshift('');
  }

  return {
    pathEnv,
    pathExt,
    pathExtExe,
  }
};

const which$1 = (cmd, opt, cb) => {
  if (typeof opt === 'function') {
    cb = opt;
    opt = {};
  }
  if (!opt)
    opt = {};

  const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
  const found = [];

  const step = i => new Promise((resolve, reject) => {
    if (i === pathEnv.length)
      return opt.all && found.length ? resolve(found)
        : reject(getNotFoundError(cmd))

    const ppRaw = pathEnv[i];
    const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;

    const pCmd = path$3.join(pathPart, cmd);
    const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd
      : pCmd;

    resolve(subStep(p, i, 0));
  });

  const subStep = (p, i, ii) => new Promise((resolve, reject) => {
    if (ii === pathExt.length)
      return resolve(step(i + 1))
    const ext = pathExt[ii];
    isexe(p + ext, { pathExt: pathExtExe }, (er, is) => {
      if (!er && is) {
        if (opt.all)
          found.push(p + ext);
        else
          return resolve(p + ext)
      }
      return resolve(subStep(p, i, ii + 1))
    });
  });

  return cb ? step(0).then(res => cb(null, res), cb) : step(0)
};

const whichSync = (cmd, opt) => {
  opt = opt || {};

  const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
  const found = [];

  for (let i = 0; i < pathEnv.length; i ++) {
    const ppRaw = pathEnv[i];
    const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;

    const pCmd = path$3.join(pathPart, cmd);
    const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd
      : pCmd;

    for (let j = 0; j < pathExt.length; j ++) {
      const cur = p + pathExt[j];
      try {
        const is = isexe.sync(cur, { pathExt: pathExtExe });
        if (is) {
          if (opt.all)
            found.push(cur);
          else
            return cur
        }
      } catch (ex) {}
    }
  }

  if (opt.all && found.length)
    return found

  if (opt.nothrow)
    return null

  throw getNotFoundError(cmd)
};

var which_1 = which$1;
which$1.sync = whichSync;

var pathKey$1 = {exports: {}};

const pathKey = (options = {}) => {
	const environment = options.env || process.env;
	const platform = options.platform || process.platform;

	if (platform !== 'win32') {
		return 'PATH';
	}

	return Object.keys(environment).reverse().find(key => key.toUpperCase() === 'PATH') || 'Path';
};

pathKey$1.exports = pathKey;
// TODO: Remove this for the next major release
pathKey$1.exports.default = pathKey;

const path$2 = require$$1__default$1["default"];
const which = which_1;
const getPathKey = pathKey$1.exports;

function resolveCommandAttempt(parsed, withoutPathExt) {
    const env = parsed.options.env || process.env;
    const cwd = process.cwd();
    const hasCustomCwd = parsed.options.cwd != null;
    // Worker threads do not have process.chdir()
    const shouldSwitchCwd = hasCustomCwd && process.chdir !== undefined && !process.chdir.disabled;

    // If a custom `cwd` was specified, we need to change the process cwd
    // because `which` will do stat calls but does not support a custom cwd
    if (shouldSwitchCwd) {
        try {
            process.chdir(parsed.options.cwd);
        } catch (err) {
            /* Empty */
        }
    }

    let resolved;

    try {
        resolved = which.sync(parsed.command, {
            path: env[getPathKey({ env })],
            pathExt: withoutPathExt ? path$2.delimiter : undefined,
        });
    } catch (e) {
        /* Empty */
    } finally {
        if (shouldSwitchCwd) {
            process.chdir(cwd);
        }
    }

    // If we successfully resolved, ensure that an absolute path is returned
    // Note that when a custom `cwd` was used, we need to resolve to an absolute path based on it
    if (resolved) {
        resolved = path$2.resolve(hasCustomCwd ? parsed.options.cwd : '', resolved);
    }

    return resolved;
}

function resolveCommand$1(parsed) {
    return resolveCommandAttempt(parsed) || resolveCommandAttempt(parsed, true);
}

var resolveCommand_1 = resolveCommand$1;

var _escape = {};

// See http://www.robvanderwoude.com/escapechars.php
const metaCharsRegExp = /([()\][%!^"`<>&|;, *?])/g;

function escapeCommand(arg) {
    // Escape meta chars
    arg = arg.replace(metaCharsRegExp, '^$1');

    return arg;
}

function escapeArgument(arg, doubleEscapeMetaChars) {
    // Convert to string
    arg = `${arg}`;

    // Algorithm below is based on https://qntm.org/cmd

    // Sequence of backslashes followed by a double quote:
    // double up all the backslashes and escape the double quote
    arg = arg.replace(/(\\*)"/g, '$1$1\\"');

    // Sequence of backslashes followed by the end of the string
    // (which will become a double quote later):
    // double up all the backslashes
    arg = arg.replace(/(\\*)$/, '$1$1');

    // All other backslashes occur literally

    // Quote the whole thing:
    arg = `"${arg}"`;

    // Escape meta chars
    arg = arg.replace(metaCharsRegExp, '^$1');

    // Double escape meta chars if necessary
    if (doubleEscapeMetaChars) {
        arg = arg.replace(metaCharsRegExp, '^$1');
    }

    return arg;
}

_escape.command = escapeCommand;
_escape.argument = escapeArgument;

var shebangRegex$1 = /^#!(.*)/;

const shebangRegex = shebangRegex$1;

var shebangCommand$1 = (string = '') => {
	const match = string.match(shebangRegex);

	if (!match) {
		return null;
	}

	const [path, argument] = match[0].replace(/#! ?/, '').split(' ');
	const binary = path.split('/').pop();

	if (binary === 'env') {
		return argument;
	}

	return argument ? `${binary} ${argument}` : binary;
};

const fs = require$$0__default$5["default"];
const shebangCommand = shebangCommand$1;

function readShebang$1(command) {
    // Read the first 150 bytes from the file
    const size = 150;
    const buffer = Buffer.alloc(size);

    let fd;

    try {
        fd = fs.openSync(command, 'r');
        fs.readSync(fd, buffer, 0, size, 0);
        fs.closeSync(fd);
    } catch (e) { /* Empty */ }

    // Attempt to extract shebang (null is returned if not a shebang)
    return shebangCommand(buffer.toString());
}

var readShebang_1 = readShebang$1;

const path$1 = require$$1__default$1["default"];
const resolveCommand = resolveCommand_1;
const escape = _escape;
const readShebang = readShebang_1;

const isWin$1 = process.platform === 'win32';
const isExecutableRegExp = /\.(?:com|exe)$/i;
const isCmdShimRegExp = /node_modules[\\/].bin[\\/][^\\/]+\.cmd$/i;

function detectShebang(parsed) {
    parsed.file = resolveCommand(parsed);

    const shebang = parsed.file && readShebang(parsed.file);

    if (shebang) {
        parsed.args.unshift(parsed.file);
        parsed.command = shebang;

        return resolveCommand(parsed);
    }

    return parsed.file;
}

function parseNonShell(parsed) {
    if (!isWin$1) {
        return parsed;
    }

    // Detect & add support for shebangs
    const commandFile = detectShebang(parsed);

    // We don't need a shell if the command filename is an executable
    const needsShell = !isExecutableRegExp.test(commandFile);

    // If a shell is required, use cmd.exe and take care of escaping everything correctly
    // Note that `forceShell` is an hidden option used only in tests
    if (parsed.options.forceShell || needsShell) {
        // Need to double escape meta chars if the command is a cmd-shim located in `node_modules/.bin/`
        // The cmd-shim simply calls execute the package bin file with NodeJS, proxying any argument
        // Because the escape of metachars with ^ gets interpreted when the cmd.exe is first called,
        // we need to double escape them
        const needsDoubleEscapeMetaChars = isCmdShimRegExp.test(commandFile);

        // Normalize posix paths into OS compatible paths (e.g.: foo/bar -> foo\bar)
        // This is necessary otherwise it will always fail with ENOENT in those cases
        parsed.command = path$1.normalize(parsed.command);

        // Escape command & arguments
        parsed.command = escape.command(parsed.command);
        parsed.args = parsed.args.map((arg) => escape.argument(arg, needsDoubleEscapeMetaChars));

        const shellCommand = [parsed.command].concat(parsed.args).join(' ');

        parsed.args = ['/d', '/s', '/c', `"${shellCommand}"`];
        parsed.command = process.env.comspec || 'cmd.exe';
        parsed.options.windowsVerbatimArguments = true; // Tell node's spawn that the arguments are already escaped
    }

    return parsed;
}

function parse$1(command, args, options) {
    // Normalize arguments, similar to nodejs
    if (args && !Array.isArray(args)) {
        options = args;
        args = null;
    }

    args = args ? args.slice(0) : []; // Clone array to avoid changing the original
    options = Object.assign({}, options); // Clone object to avoid changing the original

    // Build our parsed object
    const parsed = {
        command,
        args,
        options,
        file: undefined,
        original: {
            command,
            args,
        },
    };

    // Delegate further parsing to shell or non-shell
    return options.shell ? parsed : parseNonShell(parsed);
}

var parse_1 = parse$1;

const isWin = process.platform === 'win32';

function notFoundError(original, syscall) {
    return Object.assign(new Error(`${syscall} ${original.command} ENOENT`), {
        code: 'ENOENT',
        errno: 'ENOENT',
        syscall: `${syscall} ${original.command}`,
        path: original.command,
        spawnargs: original.args,
    });
}

function hookChildProcess(cp, parsed) {
    if (!isWin) {
        return;
    }

    const originalEmit = cp.emit;

    cp.emit = function (name, arg1) {
        // If emitting "exit" event and exit code is 1, we need to check if
        // the command exists and emit an "error" instead
        // See https://github.com/IndigoUnited/node-cross-spawn/issues/16
        if (name === 'exit') {
            const err = verifyENOENT(arg1, parsed);

            if (err) {
                return originalEmit.call(cp, 'error', err);
            }
        }

        return originalEmit.apply(cp, arguments); // eslint-disable-line prefer-rest-params
    };
}

function verifyENOENT(status, parsed) {
    if (isWin && status === 1 && !parsed.file) {
        return notFoundError(parsed.original, 'spawn');
    }

    return null;
}

function verifyENOENTSync(status, parsed) {
    if (isWin && status === 1 && !parsed.file) {
        return notFoundError(parsed.original, 'spawnSync');
    }

    return null;
}

var enoent$1 = {
    hookChildProcess,
    verifyENOENT,
    verifyENOENTSync,
    notFoundError,
};

const cp = require$$0__default$6["default"];
const parse = parse_1;
const enoent = enoent$1;

function spawn(command, args, options) {
    // Parse the arguments
    const parsed = parse(command, args, options);

    // Spawn the child process
    const spawned = cp.spawn(parsed.command, parsed.args, parsed.options);

    // Hook into child process "exit" event to emit an error if the command
    // does not exists, see: https://github.com/IndigoUnited/node-cross-spawn/issues/16
    enoent.hookChildProcess(spawned, parsed);

    return spawned;
}

function spawnSync(command, args, options) {
    // Parse the arguments
    const parsed = parse(command, args, options);

    // Spawn the child process
    const result = cp.spawnSync(parsed.command, parsed.args, parsed.options);

    // Analyze if the command does not exist, see: https://github.com/IndigoUnited/node-cross-spawn/issues/16
    result.error = result.error || enoent.verifyENOENTSync(result.status, parsed);

    return result;
}

crossSpawn$1.exports = spawn;
crossSpawn$1.exports.spawn = spawn;
crossSpawn$1.exports.sync = spawnSync;

crossSpawn$1.exports._parse = parse;
crossSpawn$1.exports._enoent = enoent;

var stripFinalNewline$1 = input => {
	const LF = typeof input === 'string' ? '\n' : '\n'.charCodeAt();
	const CR = typeof input === 'string' ? '\r' : '\r'.charCodeAt();

	if (input[input.length - 1] === LF) {
		input = input.slice(0, input.length - 1);
	}

	if (input[input.length - 1] === CR) {
		input = input.slice(0, input.length - 1);
	}

	return input;
};

var npmRunPath$1 = {exports: {}};

(function (module) {
const path = require$$1__default$1["default"];
const pathKey = pathKey$1.exports;

const npmRunPath = options => {
	options = {
		cwd: process.cwd(),
		path: process.env[pathKey()],
		execPath: process.execPath,
		...options
	};

	let previous;
	let cwdPath = path.resolve(options.cwd);
	const result = [];

	while (previous !== cwdPath) {
		result.push(path.join(cwdPath, 'node_modules/.bin'));
		previous = cwdPath;
		cwdPath = path.resolve(cwdPath, '..');
	}

	// Ensure the running `node` binary is used
	const execPathDir = path.resolve(options.cwd, options.execPath, '..');
	result.push(execPathDir);

	return result.concat(options.path).join(path.delimiter);
};

module.exports = npmRunPath;
// TODO: Remove this for the next major release
module.exports.default = npmRunPath;

module.exports.env = options => {
	options = {
		env: process.env,
		...options
	};

	const env = {...options.env};
	const path = pathKey({env});

	options.path = env[path];
	env[path] = module.exports(options);

	return env;
};
}(npmRunPath$1));

var main = {};

var signals = {};

var core = {};

Object.defineProperty(core,"__esModule",{value:true});core.SIGNALS=void 0;

const SIGNALS=[
{
name:"SIGHUP",
number:1,
action:"terminate",
description:"Terminal closed",
standard:"posix"},

{
name:"SIGINT",
number:2,
action:"terminate",
description:"User interruption with CTRL-C",
standard:"ansi"},

{
name:"SIGQUIT",
number:3,
action:"core",
description:"User interruption with CTRL-\\",
standard:"posix"},

{
name:"SIGILL",
number:4,
action:"core",
description:"Invalid machine instruction",
standard:"ansi"},

{
name:"SIGTRAP",
number:5,
action:"core",
description:"Debugger breakpoint",
standard:"posix"},

{
name:"SIGABRT",
number:6,
action:"core",
description:"Aborted",
standard:"ansi"},

{
name:"SIGIOT",
number:6,
action:"core",
description:"Aborted",
standard:"bsd"},

{
name:"SIGBUS",
number:7,
action:"core",
description:
"Bus error due to misaligned, non-existing address or paging error",
standard:"bsd"},

{
name:"SIGEMT",
number:7,
action:"terminate",
description:"Command should be emulated but is not implemented",
standard:"other"},

{
name:"SIGFPE",
number:8,
action:"core",
description:"Floating point arithmetic error",
standard:"ansi"},

{
name:"SIGKILL",
number:9,
action:"terminate",
description:"Forced termination",
standard:"posix",
forced:true},

{
name:"SIGUSR1",
number:10,
action:"terminate",
description:"Application-specific signal",
standard:"posix"},

{
name:"SIGSEGV",
number:11,
action:"core",
description:"Segmentation fault",
standard:"ansi"},

{
name:"SIGUSR2",
number:12,
action:"terminate",
description:"Application-specific signal",
standard:"posix"},

{
name:"SIGPIPE",
number:13,
action:"terminate",
description:"Broken pipe or socket",
standard:"posix"},

{
name:"SIGALRM",
number:14,
action:"terminate",
description:"Timeout or timer",
standard:"posix"},

{
name:"SIGTERM",
number:15,
action:"terminate",
description:"Termination",
standard:"ansi"},

{
name:"SIGSTKFLT",
number:16,
action:"terminate",
description:"Stack is empty or overflowed",
standard:"other"},

{
name:"SIGCHLD",
number:17,
action:"ignore",
description:"Child process terminated, paused or unpaused",
standard:"posix"},

{
name:"SIGCLD",
number:17,
action:"ignore",
description:"Child process terminated, paused or unpaused",
standard:"other"},

{
name:"SIGCONT",
number:18,
action:"unpause",
description:"Unpaused",
standard:"posix",
forced:true},

{
name:"SIGSTOP",
number:19,
action:"pause",
description:"Paused",
standard:"posix",
forced:true},

{
name:"SIGTSTP",
number:20,
action:"pause",
description:"Paused using CTRL-Z or \"suspend\"",
standard:"posix"},

{
name:"SIGTTIN",
number:21,
action:"pause",
description:"Background process cannot read terminal input",
standard:"posix"},

{
name:"SIGBREAK",
number:21,
action:"terminate",
description:"User interruption with CTRL-BREAK",
standard:"other"},

{
name:"SIGTTOU",
number:22,
action:"pause",
description:"Background process cannot write to terminal output",
standard:"posix"},

{
name:"SIGURG",
number:23,
action:"ignore",
description:"Socket received out-of-band data",
standard:"bsd"},

{
name:"SIGXCPU",
number:24,
action:"core",
description:"Process timed out",
standard:"bsd"},

{
name:"SIGXFSZ",
number:25,
action:"core",
description:"File too big",
standard:"bsd"},

{
name:"SIGVTALRM",
number:26,
action:"terminate",
description:"Timeout or timer",
standard:"bsd"},

{
name:"SIGPROF",
number:27,
action:"terminate",
description:"Timeout or timer",
standard:"bsd"},

{
name:"SIGWINCH",
number:28,
action:"ignore",
description:"Terminal window size changed",
standard:"bsd"},

{
name:"SIGIO",
number:29,
action:"terminate",
description:"I/O is available",
standard:"other"},

{
name:"SIGPOLL",
number:29,
action:"terminate",
description:"Watched event",
standard:"other"},

{
name:"SIGINFO",
number:29,
action:"ignore",
description:"Request for process information",
standard:"other"},

{
name:"SIGPWR",
number:30,
action:"terminate",
description:"Device running out of power",
standard:"systemv"},

{
name:"SIGSYS",
number:31,
action:"core",
description:"Invalid system call",
standard:"other"},

{
name:"SIGUNUSED",
number:31,
action:"terminate",
description:"Invalid system call",
standard:"other"}];core.SIGNALS=SIGNALS;

var realtime = {};

Object.defineProperty(realtime,"__esModule",{value:true});realtime.SIGRTMAX=realtime.getRealtimeSignals=void 0;
const getRealtimeSignals=function(){
const length=SIGRTMAX-SIGRTMIN+1;
return Array.from({length},getRealtimeSignal);
};realtime.getRealtimeSignals=getRealtimeSignals;

const getRealtimeSignal=function(value,index){
return {
name:`SIGRT${index+1}`,
number:SIGRTMIN+index,
action:"terminate",
description:"Application-specific signal (realtime)",
standard:"posix"};

};

const SIGRTMIN=34;
const SIGRTMAX=64;realtime.SIGRTMAX=SIGRTMAX;

Object.defineProperty(signals,"__esModule",{value:true});signals.getSignals=void 0;var _os$1=require$$1__default["default"];

var _core=core;
var _realtime$1=realtime;



const getSignals=function(){
const realtimeSignals=(0, _realtime$1.getRealtimeSignals)();
const signals=[..._core.SIGNALS,...realtimeSignals].map(normalizeSignal);
return signals;
};signals.getSignals=getSignals;







const normalizeSignal=function({
name,
number:defaultNumber,
description,
action,
forced=false,
standard})
{
const{
signals:{[name]:constantSignal}}=
_os$1.constants;
const supported=constantSignal!==undefined;
const number=supported?constantSignal:defaultNumber;
return {name,number,description,supported,action,forced,standard};
};

Object.defineProperty(main,"__esModule",{value:true});main.signalsByNumber=main.signalsByName=void 0;var _os=require$$1__default["default"];

var _signals=signals;
var _realtime=realtime;



const getSignalsByName=function(){
const signals=(0, _signals.getSignals)();
return signals.reduce(getSignalByName,{});
};

const getSignalByName=function(
signalByNameMemo,
{name,number,description,supported,action,forced,standard})
{
return {
...signalByNameMemo,
[name]:{name,number,description,supported,action,forced,standard}};

};

const signalsByName$1=getSignalsByName();main.signalsByName=signalsByName$1;




const getSignalsByNumber=function(){
const signals=(0, _signals.getSignals)();
const length=_realtime.SIGRTMAX+1;
const signalsA=Array.from({length},(value,number)=>
getSignalByNumber(number,signals));

return Object.assign({},...signalsA);
};

const getSignalByNumber=function(number,signals){
const signal=findSignalByNumber(number,signals);

if(signal===undefined){
return {};
}

const{name,description,supported,action,forced,standard}=signal;
return {
[number]:{
name,
number,
description,
supported,
action,
forced,
standard}};


};



const findSignalByNumber=function(number,signals){
const signal=signals.find(({name})=>_os.constants.signals[name]===number);

if(signal!==undefined){
return signal;
}

return signals.find(signalA=>signalA.number===number);
};

const signalsByNumber=getSignalsByNumber();main.signalsByNumber=signalsByNumber;

const {signalsByName} = main;

const getErrorPrefix = ({timedOut, timeout, errorCode, signal, signalDescription, exitCode, isCanceled}) => {
	if (timedOut) {
		return `timed out after ${timeout} milliseconds`;
	}

	if (isCanceled) {
		return 'was canceled';
	}

	if (errorCode !== undefined) {
		return `failed with ${errorCode}`;
	}

	if (signal !== undefined) {
		return `was killed with ${signal} (${signalDescription})`;
	}

	if (exitCode !== undefined) {
		return `failed with exit code ${exitCode}`;
	}

	return 'failed';
};

const makeError$1 = ({
	stdout,
	stderr,
	all,
	error,
	signal,
	exitCode,
	command,
	escapedCommand,
	timedOut,
	isCanceled,
	killed,
	parsed: {options: {timeout}}
}) => {
	// `signal` and `exitCode` emitted on `spawned.on('exit')` event can be `null`.
	// We normalize them to `undefined`
	exitCode = exitCode === null ? undefined : exitCode;
	signal = signal === null ? undefined : signal;
	const signalDescription = signal === undefined ? undefined : signalsByName[signal].description;

	const errorCode = error && error.code;

	const prefix = getErrorPrefix({timedOut, timeout, errorCode, signal, signalDescription, exitCode, isCanceled});
	const execaMessage = `Command ${prefix}: ${command}`;
	const isError = Object.prototype.toString.call(error) === '[object Error]';
	const shortMessage = isError ? `${execaMessage}\n${error.message}` : execaMessage;
	const message = [shortMessage, stderr, stdout].filter(Boolean).join('\n');

	if (isError) {
		error.originalMessage = error.message;
		error.message = message;
	} else {
		error = new Error(message);
	}

	error.shortMessage = shortMessage;
	error.command = command;
	error.escapedCommand = escapedCommand;
	error.exitCode = exitCode;
	error.signal = signal;
	error.signalDescription = signalDescription;
	error.stdout = stdout;
	error.stderr = stderr;

	if (all !== undefined) {
		error.all = all;
	}

	if ('bufferedData' in error) {
		delete error.bufferedData;
	}

	error.failed = true;
	error.timedOut = Boolean(timedOut);
	error.isCanceled = isCanceled;
	error.killed = killed && !timedOut;

	return error;
};

var error = makeError$1;

var stdio = {exports: {}};

const aliases = ['stdin', 'stdout', 'stderr'];

const hasAlias = options => aliases.some(alias => options[alias] !== undefined);

const normalizeStdio$1 = options => {
	if (!options) {
		return;
	}

	const {stdio} = options;

	if (stdio === undefined) {
		return aliases.map(alias => options[alias]);
	}

	if (hasAlias(options)) {
		throw new Error(`It's not possible to provide \`stdio\` in combination with one of ${aliases.map(alias => `\`${alias}\``).join(', ')}`);
	}

	if (typeof stdio === 'string') {
		return stdio;
	}

	if (!Array.isArray(stdio)) {
		throw new TypeError(`Expected \`stdio\` to be of type \`string\` or \`Array\`, got \`${typeof stdio}\``);
	}

	const length = Math.max(stdio.length, aliases.length);
	return Array.from({length}, (value, index) => stdio[index]);
};

stdio.exports = normalizeStdio$1;

// `ipc` is pushed unless it is already present
stdio.exports.node = options => {
	const stdio = normalizeStdio$1(options);

	if (stdio === 'ipc') {
		return 'ipc';
	}

	if (stdio === undefined || typeof stdio === 'string') {
		return [stdio, stdio, stdio, 'ipc'];
	}

	if (stdio.includes('ipc')) {
		return stdio;
	}

	return [...stdio, 'ipc'];
};

const os = require$$1__default["default"];
const onExit = signalExit$1.exports;

const DEFAULT_FORCE_KILL_TIMEOUT = 1000 * 5;

// Monkey-patches `childProcess.kill()` to add `forceKillAfterTimeout` behavior
const spawnedKill$1 = (kill, signal = 'SIGTERM', options = {}) => {
	const killResult = kill(signal);
	setKillTimeout(kill, signal, options, killResult);
	return killResult;
};

const setKillTimeout = (kill, signal, options, killResult) => {
	if (!shouldForceKill(signal, options, killResult)) {
		return;
	}

	const timeout = getForceKillAfterTimeout(options);
	const t = setTimeout(() => {
		kill('SIGKILL');
	}, timeout);

	// Guarded because there's no `.unref()` when `execa` is used in the renderer
	// process in Electron. This cannot be tested since we don't run tests in
	// Electron.
	// istanbul ignore else
	if (t.unref) {
		t.unref();
	}
};

const shouldForceKill = (signal, {forceKillAfterTimeout}, killResult) => {
	return isSigterm(signal) && forceKillAfterTimeout !== false && killResult;
};

const isSigterm = signal => {
	return signal === os.constants.signals.SIGTERM ||
		(typeof signal === 'string' && signal.toUpperCase() === 'SIGTERM');
};

const getForceKillAfterTimeout = ({forceKillAfterTimeout = true}) => {
	if (forceKillAfterTimeout === true) {
		return DEFAULT_FORCE_KILL_TIMEOUT;
	}

	if (!Number.isFinite(forceKillAfterTimeout) || forceKillAfterTimeout < 0) {
		throw new TypeError(`Expected the \`forceKillAfterTimeout\` option to be a non-negative integer, got \`${forceKillAfterTimeout}\` (${typeof forceKillAfterTimeout})`);
	}

	return forceKillAfterTimeout;
};

// `childProcess.cancel()`
const spawnedCancel$1 = (spawned, context) => {
	const killResult = spawned.kill();

	if (killResult) {
		context.isCanceled = true;
	}
};

const timeoutKill = (spawned, signal, reject) => {
	spawned.kill(signal);
	reject(Object.assign(new Error('Timed out'), {timedOut: true, signal}));
};

// `timeout` option handling
const setupTimeout$1 = (spawned, {timeout, killSignal = 'SIGTERM'}, spawnedPromise) => {
	if (timeout === 0 || timeout === undefined) {
		return spawnedPromise;
	}

	let timeoutId;
	const timeoutPromise = new Promise((resolve, reject) => {
		timeoutId = setTimeout(() => {
			timeoutKill(spawned, killSignal, reject);
		}, timeout);
	});

	const safeSpawnedPromise = spawnedPromise.finally(() => {
		clearTimeout(timeoutId);
	});

	return Promise.race([timeoutPromise, safeSpawnedPromise]);
};

const validateTimeout$1 = ({timeout}) => {
	if (timeout !== undefined && (!Number.isFinite(timeout) || timeout < 0)) {
		throw new TypeError(`Expected the \`timeout\` option to be a non-negative integer, got \`${timeout}\` (${typeof timeout})`);
	}
};

// `cleanup` option handling
const setExitHandler$1 = async (spawned, {cleanup, detached}, timedPromise) => {
	if (!cleanup || detached) {
		return timedPromise;
	}

	const removeExitHandler = onExit(() => {
		spawned.kill();
	});

	return timedPromise.finally(() => {
		removeExitHandler();
	});
};

var kill = {
	spawnedKill: spawnedKill$1,
	spawnedCancel: spawnedCancel$1,
	setupTimeout: setupTimeout$1,
	validateTimeout: validateTimeout$1,
	setExitHandler: setExitHandler$1
};

const isStream$1 = stream =>
	stream !== null &&
	typeof stream === 'object' &&
	typeof stream.pipe === 'function';

isStream$1.writable = stream =>
	isStream$1(stream) &&
	stream.writable !== false &&
	typeof stream._write === 'function' &&
	typeof stream._writableState === 'object';

isStream$1.readable = stream =>
	isStream$1(stream) &&
	stream.readable !== false &&
	typeof stream._read === 'function' &&
	typeof stream._readableState === 'object';

isStream$1.duplex = stream =>
	isStream$1.writable(stream) &&
	isStream$1.readable(stream);

isStream$1.transform = stream =>
	isStream$1.duplex(stream) &&
	typeof stream._transform === 'function';

var isStream_1 = isStream$1;

var getStream$2 = {exports: {}};

const {PassThrough: PassThroughStream} = require$$0__default$2["default"];

var bufferStream$1 = options => {
	options = {...options};

	const {array} = options;
	let {encoding} = options;
	const isBuffer = encoding === 'buffer';
	let objectMode = false;

	if (array) {
		objectMode = !(encoding || isBuffer);
	} else {
		encoding = encoding || 'utf8';
	}

	if (isBuffer) {
		encoding = null;
	}

	const stream = new PassThroughStream({objectMode});

	if (encoding) {
		stream.setEncoding(encoding);
	}

	let length = 0;
	const chunks = [];

	stream.on('data', chunk => {
		chunks.push(chunk);

		if (objectMode) {
			length = chunks.length;
		} else {
			length += chunk.length;
		}
	});

	stream.getBufferedValue = () => {
		if (array) {
			return chunks;
		}

		return isBuffer ? Buffer.concat(chunks, length) : chunks.join('');
	};

	stream.getBufferedLength = () => length;

	return stream;
};

const {constants: BufferConstants} = require$$0__default$7["default"];
const stream$1 = require$$0__default$2["default"];
const {promisify} = require$$2__default$1["default"];
const bufferStream = bufferStream$1;

const streamPipelinePromisified = promisify(stream$1.pipeline);

class MaxBufferError extends Error {
	constructor() {
		super('maxBuffer exceeded');
		this.name = 'MaxBufferError';
	}
}

async function getStream$1(inputStream, options) {
	if (!inputStream) {
		throw new Error('Expected a stream');
	}

	options = {
		maxBuffer: Infinity,
		...options
	};

	const {maxBuffer} = options;
	const stream = bufferStream(options);

	await new Promise((resolve, reject) => {
		const rejectPromise = error => {
			// Don't retrieve an oversized buffer.
			if (error && stream.getBufferedLength() <= BufferConstants.MAX_LENGTH) {
				error.bufferedData = stream.getBufferedValue();
			}

			reject(error);
		};

		(async () => {
			try {
				await streamPipelinePromisified(inputStream, stream);
				resolve();
			} catch (error) {
				rejectPromise(error);
			}
		})();

		stream.on('data', () => {
			if (stream.getBufferedLength() > maxBuffer) {
				rejectPromise(new MaxBufferError());
			}
		});
	});

	return stream.getBufferedValue();
}

getStream$2.exports = getStream$1;
getStream$2.exports.buffer = (stream, options) => getStream$1(stream, {...options, encoding: 'buffer'});
getStream$2.exports.array = (stream, options) => getStream$1(stream, {...options, array: true});
getStream$2.exports.MaxBufferError = MaxBufferError;

const { PassThrough } = require$$0__default$2["default"];

var mergeStream$1 = function (/*streams...*/) {
  var sources = [];
  var output  = new PassThrough({objectMode: true});

  output.setMaxListeners(0);

  output.add = add;
  output.isEmpty = isEmpty;

  output.on('unpipe', remove);

  Array.prototype.slice.call(arguments).forEach(add);

  return output

  function add (source) {
    if (Array.isArray(source)) {
      source.forEach(add);
      return this
    }

    sources.push(source);
    source.once('end', remove.bind(null, source));
    source.once('error', output.emit.bind(output, 'error'));
    source.pipe(output, {end: false});
    return this
  }

  function isEmpty () {
    return sources.length == 0;
  }

  function remove (source) {
    sources = sources.filter(function (it) { return it !== source });
    if (!sources.length && output.readable) { output.end(); }
  }
};

const isStream = isStream_1;
const getStream = getStream$2.exports;
const mergeStream = mergeStream$1;

// `input` option
const handleInput$1 = (spawned, input) => {
	// Checking for stdin is workaround for https://github.com/nodejs/node/issues/26852
	// @todo remove `|| spawned.stdin === undefined` once we drop support for Node.js <=12.2.0
	if (input === undefined || spawned.stdin === undefined) {
		return;
	}

	if (isStream(input)) {
		input.pipe(spawned.stdin);
	} else {
		spawned.stdin.end(input);
	}
};

// `all` interleaves `stdout` and `stderr`
const makeAllStream$1 = (spawned, {all}) => {
	if (!all || (!spawned.stdout && !spawned.stderr)) {
		return;
	}

	const mixed = mergeStream();

	if (spawned.stdout) {
		mixed.add(spawned.stdout);
	}

	if (spawned.stderr) {
		mixed.add(spawned.stderr);
	}

	return mixed;
};

// On failure, `result.stdout|stderr|all` should contain the currently buffered stream
const getBufferedData = async (stream, streamPromise) => {
	if (!stream) {
		return;
	}

	stream.destroy();

	try {
		return await streamPromise;
	} catch (error) {
		return error.bufferedData;
	}
};

const getStreamPromise = (stream, {encoding, buffer, maxBuffer}) => {
	if (!stream || !buffer) {
		return;
	}

	if (encoding) {
		return getStream(stream, {encoding, maxBuffer});
	}

	return getStream.buffer(stream, {maxBuffer});
};

// Retrieve result of child process: exit code, signal, error, streams (stdout/stderr/all)
const getSpawnedResult$1 = async ({stdout, stderr, all}, {encoding, buffer, maxBuffer}, processDone) => {
	const stdoutPromise = getStreamPromise(stdout, {encoding, buffer, maxBuffer});
	const stderrPromise = getStreamPromise(stderr, {encoding, buffer, maxBuffer});
	const allPromise = getStreamPromise(all, {encoding, buffer, maxBuffer: maxBuffer * 2});

	try {
		return await Promise.all([processDone, stdoutPromise, stderrPromise, allPromise]);
	} catch (error) {
		return Promise.all([
			{error, signal: error.signal, timedOut: error.timedOut},
			getBufferedData(stdout, stdoutPromise),
			getBufferedData(stderr, stderrPromise),
			getBufferedData(all, allPromise)
		]);
	}
};

const validateInputSync$1 = ({input}) => {
	if (isStream(input)) {
		throw new TypeError('The `input` option cannot be a stream in sync mode');
	}
};

var stream = {
	handleInput: handleInput$1,
	makeAllStream: makeAllStream$1,
	getSpawnedResult: getSpawnedResult$1,
	validateInputSync: validateInputSync$1
};

const nativePromisePrototype = (async () => {})().constructor.prototype;
const descriptors = ['then', 'catch', 'finally'].map(property => [
	property,
	Reflect.getOwnPropertyDescriptor(nativePromisePrototype, property)
]);

// The return value is a mixin of `childProcess` and `Promise`
const mergePromise$1 = (spawned, promise) => {
	for (const [property, descriptor] of descriptors) {
		// Starting the main `promise` is deferred to avoid consuming streams
		const value = typeof promise === 'function' ?
			(...args) => Reflect.apply(descriptor.value, promise(), args) :
			descriptor.value.bind(promise);

		Reflect.defineProperty(spawned, property, {...descriptor, value});
	}

	return spawned;
};

// Use promises instead of `child_process` events
const getSpawnedPromise$1 = spawned => {
	return new Promise((resolve, reject) => {
		spawned.on('exit', (exitCode, signal) => {
			resolve({exitCode, signal});
		});

		spawned.on('error', error => {
			reject(error);
		});

		if (spawned.stdin) {
			spawned.stdin.on('error', error => {
				reject(error);
			});
		}
	});
};

var promise = {
	mergePromise: mergePromise$1,
	getSpawnedPromise: getSpawnedPromise$1
};

const normalizeArgs = (file, args = []) => {
	if (!Array.isArray(args)) {
		return [file];
	}

	return [file, ...args];
};

const NO_ESCAPE_REGEXP = /^[\w.-]+$/;
const DOUBLE_QUOTES_REGEXP = /"/g;

const escapeArg = arg => {
	if (typeof arg !== 'string' || NO_ESCAPE_REGEXP.test(arg)) {
		return arg;
	}

	return `"${arg.replace(DOUBLE_QUOTES_REGEXP, '\\"')}"`;
};

const joinCommand$1 = (file, args) => {
	return normalizeArgs(file, args).join(' ');
};

const getEscapedCommand$1 = (file, args) => {
	return normalizeArgs(file, args).map(arg => escapeArg(arg)).join(' ');
};

const SPACES_REGEXP = / +/g;

// Handle `execa.command()`
const parseCommand$1 = command => {
	const tokens = [];
	for (const token of command.trim().split(SPACES_REGEXP)) {
		// Allow spaces to be escaped by a backslash if not meant as a delimiter
		const previousToken = tokens[tokens.length - 1];
		if (previousToken && previousToken.endsWith('\\')) {
			// Merge previous token with current one
			tokens[tokens.length - 1] = `${previousToken.slice(0, -1)} ${token}`;
		} else {
			tokens.push(token);
		}
	}

	return tokens;
};

var command = {
	joinCommand: joinCommand$1,
	getEscapedCommand: getEscapedCommand$1,
	parseCommand: parseCommand$1
};

const path = require$$1__default$1["default"];
const childProcess = require$$0__default$6["default"];
const crossSpawn = crossSpawn$1.exports;
const stripFinalNewline = stripFinalNewline$1;
const npmRunPath = npmRunPath$1.exports;
const onetime = onetime$3.exports;
const makeError = error;
const normalizeStdio = stdio.exports;
const {spawnedKill, spawnedCancel, setupTimeout, validateTimeout, setExitHandler} = kill;
const {handleInput, getSpawnedResult, makeAllStream, validateInputSync} = stream;
const {mergePromise, getSpawnedPromise} = promise;
const {joinCommand, parseCommand, getEscapedCommand} = command;

const DEFAULT_MAX_BUFFER = 1000 * 1000 * 100;

const getEnv = ({env: envOption, extendEnv, preferLocal, localDir, execPath}) => {
	const env = extendEnv ? {...process.env, ...envOption} : envOption;

	if (preferLocal) {
		return npmRunPath.env({env, cwd: localDir, execPath});
	}

	return env;
};

const handleArguments = (file, args, options = {}) => {
	const parsed = crossSpawn._parse(file, args, options);
	file = parsed.command;
	args = parsed.args;
	options = parsed.options;

	options = {
		maxBuffer: DEFAULT_MAX_BUFFER,
		buffer: true,
		stripFinalNewline: true,
		extendEnv: true,
		preferLocal: false,
		localDir: options.cwd || process.cwd(),
		execPath: process.execPath,
		encoding: 'utf8',
		reject: true,
		cleanup: true,
		all: false,
		windowsHide: true,
		...options
	};

	options.env = getEnv(options);

	options.stdio = normalizeStdio(options);

	if (process.platform === 'win32' && path.basename(file, '.exe') === 'cmd') {
		// #116
		args.unshift('/q');
	}

	return {file, args, options, parsed};
};

const handleOutput = (options, value, error) => {
	if (typeof value !== 'string' && !Buffer.isBuffer(value)) {
		// When `execa.sync()` errors, we normalize it to '' to mimic `execa()`
		return error === undefined ? undefined : '';
	}

	if (options.stripFinalNewline) {
		return stripFinalNewline(value);
	}

	return value;
};

const execa = (file, args, options) => {
	const parsed = handleArguments(file, args, options);
	const command = joinCommand(file, args);
	const escapedCommand = getEscapedCommand(file, args);

	validateTimeout(parsed.options);

	let spawned;
	try {
		spawned = childProcess.spawn(parsed.file, parsed.args, parsed.options);
	} catch (error) {
		// Ensure the returned error is always both a promise and a child process
		const dummySpawned = new childProcess.ChildProcess();
		const errorPromise = Promise.reject(makeError({
			error,
			stdout: '',
			stderr: '',
			all: '',
			command,
			escapedCommand,
			parsed,
			timedOut: false,
			isCanceled: false,
			killed: false
		}));
		return mergePromise(dummySpawned, errorPromise);
	}

	const spawnedPromise = getSpawnedPromise(spawned);
	const timedPromise = setupTimeout(spawned, parsed.options, spawnedPromise);
	const processDone = setExitHandler(spawned, parsed.options, timedPromise);

	const context = {isCanceled: false};

	spawned.kill = spawnedKill.bind(null, spawned.kill.bind(spawned));
	spawned.cancel = spawnedCancel.bind(null, spawned, context);

	const handlePromise = async () => {
		const [{error, exitCode, signal, timedOut}, stdoutResult, stderrResult, allResult] = await getSpawnedResult(spawned, parsed.options, processDone);
		const stdout = handleOutput(parsed.options, stdoutResult);
		const stderr = handleOutput(parsed.options, stderrResult);
		const all = handleOutput(parsed.options, allResult);

		if (error || exitCode !== 0 || signal !== null) {
			const returnedError = makeError({
				error,
				exitCode,
				signal,
				stdout,
				stderr,
				all,
				command,
				escapedCommand,
				parsed,
				timedOut,
				isCanceled: context.isCanceled,
				killed: spawned.killed
			});

			if (!parsed.options.reject) {
				return returnedError;
			}

			throw returnedError;
		}

		return {
			command,
			escapedCommand,
			exitCode: 0,
			stdout,
			stderr,
			all,
			failed: false,
			timedOut: false,
			isCanceled: false,
			killed: false
		};
	};

	const handlePromiseOnce = onetime(handlePromise);

	handleInput(spawned, parsed.options.input);

	spawned.all = makeAllStream(spawned, parsed.options);

	return mergePromise(spawned, handlePromiseOnce);
};

execa$2.exports = execa;

execa$2.exports.sync = (file, args, options) => {
	const parsed = handleArguments(file, args, options);
	const command = joinCommand(file, args);
	const escapedCommand = getEscapedCommand(file, args);

	validateInputSync(parsed.options);

	let result;
	try {
		result = childProcess.spawnSync(parsed.file, parsed.args, parsed.options);
	} catch (error) {
		throw makeError({
			error,
			stdout: '',
			stderr: '',
			all: '',
			command,
			escapedCommand,
			parsed,
			timedOut: false,
			isCanceled: false,
			killed: false
		});
	}

	const stdout = handleOutput(parsed.options, result.stdout, result.error);
	const stderr = handleOutput(parsed.options, result.stderr, result.error);

	if (result.error || result.status !== 0 || result.signal !== null) {
		const error = makeError({
			stdout,
			stderr,
			error: result.error,
			signal: result.signal,
			exitCode: result.status,
			command,
			escapedCommand,
			parsed,
			timedOut: result.error && result.error.code === 'ETIMEDOUT',
			isCanceled: false,
			killed: result.signal !== null
		});

		if (!parsed.options.reject) {
			return error;
		}

		throw error;
	}

	return {
		command,
		escapedCommand,
		exitCode: 0,
		stdout,
		stderr,
		failed: false,
		timedOut: false,
		isCanceled: false,
		killed: false
	};
};

execa$2.exports.command = (command, options) => {
	const [file, ...args] = parseCommand(command);
	return execa(file, args, options);
};

execa$2.exports.commandSync = (command, options) => {
	const [file, ...args] = parseCommand(command);
	return execa.sync(file, args, options);
};

execa$2.exports.node = (scriptPath, args, options = {}) => {
	if (args && !Array.isArray(args) && typeof args === 'object') {
		options = args;
		args = [];
	}

	const stdio = normalizeStdio.node(options);
	const defaultExecArgv = process.execArgv.filter(arg => !arg.startsWith('--inspect'));

	const {
		nodePath = process.execPath,
		nodeOptions = defaultExecArgv
	} = options;

	return execa(
		nodePath,
		[
			...nodeOptions,
			scriptPath,
			...(Array.isArray(args) ? args : [])
		],
		{
			...options,
			stdin: undefined,
			stdout: undefined,
			stderr: undefined,
			stdio,
			shell: false
		}
	);
};

var execa$1 = execa$2.exports;

const showStr$1 = (str) => `=========================== ${str} ===========================`;
const log$1 = console.log;
const taskInstallItem = async (target, testCommond, installCommand) => {
    log$1(showStr$1(`环境开始初始化： ${target}`));
    try {
        await execa$1.command(testCommond);
        log$1(`${target} is ok!(no install)`);
    }
    catch (error) {
        try {
            await execa$1.command(installCommand);
            log$1(`${target} install ok`);
        }
        catch (error) {
            console.error(`${target} install error`);
            log$1(showStr$1(`${target} 环境初始化： 失败！`));
            return false;
        }
    }
    log$1(showStr$1(`${target} 环境初始化： 成功！`));
};
const installBase = async () => {
    try {
        log$1('nvm 配置源');
        await execa$1.command('nvm node_mirror https://npm.taobao.org/mirrors/node/');
        await execa$1.command('nvm npm_mirror https://npm.taobao.org/mirrors/npm/');
        log$1('npm 配置源');
        await execa$1.command('npm config set registry https://registry.npm.taobao.org --global');
        await execa$1.command('npm config set disturl https://npm.taobao.org/dist --global');
        await taskInstallItem('vue-cli', 'vue -V', 'npm install -g @vue/cli');
        await taskInstallItem('yarn', 'yarn -v', 'npm install -g yarn');
        log$1('yarn 配置源');
        await execa$1.command('yarn config set registry https://registry.npm.taobao.org --global');
        await execa$1.command('yarn config set disturl https://npm.taobao.org/dist --global');
        await taskInstallItem('nrm', 'nrm -V', 'npm install -g nrm');
        await taskInstallItem('lerna', 'lerna -v', 'npm install --global lerna');
        await taskInstallItem('rollup', 'rollup -v', 'npm install --global rollup');
    }
    catch (error) {
        console.error(error);
        throw new Error(' 环境安装异常 ');
    }
};

const showStr = (str) => `=========================== ${str} ===========================`;
const log = console.log;
const taskItem = async (target, command) => {
    log(showStr(`开始检测 ${target}`));
    log((await execa$1.command(command)).stdout);
    log(showStr(`${target} ok`));
};
const envTest = async () => {
    try {
        taskItem('nvm', 'nvm version');
    }
    catch (error) {
        console.error(error);
        throw new Error('基础环境异常，请检查');
    }
};

var runs = [
    {
        title: 'task: env test',
        task: envTest,
    },
    {
        title: 'task: install-Base',
        task: installBase
    },
];

logx.info('============= 开始运行 =============');
const tasks = new dist.Listr(runs, { concurrent: 1, exitOnError: true });
tasks
    .run()
    .then((subprocessRes) => {
    console.log(subprocessRes);
    logx.info('============= 运行结束（正常） =============');
})
    .catch(err => {
    console.error(err);
    logx.info('============= 运行结束（异常） =============');
});
