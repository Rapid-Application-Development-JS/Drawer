(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(function () {
            return (root.Drawer = factory());
        });
    } else if (typeof module === "object" && module.exports) {
        module.exports = (root.Drawer = factory());
    } else {
        root.Drawer = factory();
    }
}(this, function () {
    function addVendorPrefix(property) {
        var arr = ["ms", "moz", "webkit", "o"], i, tmp = document.createElement("div"),
            result = property.toLowerCase(), arrayOfPrefixes = [];

        function capitalise(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        for (i = 0; i < arr.length; i += 1) {
            arrayOfPrefixes.push(arr[i] + capitalise(property));
        }

        for (i = 0; i < arrayOfPrefixes.length; i += 1) {
            if (tmp.style[arrayOfPrefixes[i]] !== undefined) {
                result = '-' + arr[i] + '-' + property;
                break;
            }
        }
        return result;
    }

    window.performance = window.performance || {};
    window.performance.now = (function () {
        return performance.now ||
            performance.mozNow ||
            performance.msNow ||
            performance.oNow ||
            performance.webkitNow ||
            function () {
                return new Date().getTime();
            };
    }());

    (function () {
        var lastTime = 0, x, currTime, timeToCall, id, vendors = ['ms', 'moz', 'webkit', 'o'];
        for (x = 0; x < vendors.length && !window.requestAnimationFrame; x += 1) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
            || window[vendors[x] + 'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function (callback) {
                currTime = window.performance.now();
                timeToCall = Math.max(0, 16 - (currTime - lastTime));
                id = window.setTimeout(function () {
                    callback(currTime + timeToCall);
                }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }

        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function (id) {
                clearTimeout(id);
            };
        }
    }());

    /**
     * Organize child HTML Elements of wrapper element as Drawer and Content Layers
     * @param {HTMLElement} wrapper Drawer  should contain two main elements. First element will be used as drawer layer, second element - as main content layer
     * @param {Object=} options Object with options fields. If options does not set Drawer will be initialized with default parameters, if options does not have one or more fields these fields will be initialized with default values
     * @constructor
     * @class Drawer
     */
    function Drawer(wrapper, options) {
        var scope = this;

        function Point(x, y) {
            this.x = x || 0;
            this.y = y || 0;

            this.setNewCoords = function (x, y) {
                this.x = x;
                this.y = y;
            }
        };

        var actions = {
            close: 'close',
            open: 'open'
        };

        var TRACKING_EVENTS = {
            tap: 'tap',
            up: 'pointerup',
            move: 'pointermove',
            down: 'pointerdown',
            chancel: 'pointercancel',
            fling: 'fling'
        };

        var orientationType = {
            vertical: 'vertical',
            horizontal: 'horizontal'
        };

        var _wrapper = wrapper,
            _navigation = _wrapper.firstElementChild,
            _content = _navigation.nextElementSibling,
            _overlay,
            _contentPosition = 0,
            _trackingWidth,
            _maxShift,
            _wrapperWidth,
            _currentShiftForRaf,
            _isClosed,
            _enabled,
            _resizeID,
            _gestureKind,
            event,
            _lastPoint = new Point(),
            _startPoint = new Point(),
            _inAnimation,
            _animationStep,
            _RafID,
            _tweatID,
            _onTheCSSEnd,
            handleEvent,
            _options = mix({
                align: 'left',
                overlay: true,
                overlayOpacity: true,
                overlayBackground: 'rgba(0, 0, 0, 0.4)',
                swipe: true,
                preventMove: true,
                resizeEvent: true,
                maxWidth: '70%',
                startTrackingZone: '20%',
                animationTime: 350,
                onActionEnd: function () {
                }
            }, options),
            _behavior = createBehavior();

        handleEvent = function(event) {
            switch (event.type) {
                case TRACKING_EVENTS.down:
                    _pointerDown(event);
                    break;
                case TRACKING_EVENTS.move:
                    _pointerMove(event);
                    //if (this._gestureKind === 'horizontal' && this._options.preventMove && !this.preventDefaultTags.test(event.target)) {
                    //    event.preventDefault();
                    //}
                    break;
                case TRACKING_EVENTS.chancel:
                case TRACKING_EVENTS.up:
                    _pointerUp(event);
                    break;
                case TRACKING_EVENTS.fling:
                    _pointerFling(event);
                    break;
                case 'resize':
                    clearTimeout(_resizeID);
                    _resizeID = setTimeout(function () {
                        this.refresh();
                    }.bind(scope), 150);
                    break;
                case TRACKING_EVENTS.tap:
                    var nodeName = event.target.nodeName.toUpperCase();
                    if (!scope.preventDefaultTags.test(nodeName)) {
                        _pointerTap();
                    }
                    break;
            }
        }.bind(scope);

        initialize();
        function initialize() {
            _enabled = _options.swipe;

            if (_options.overlay) {
                _overlay = document.createElement('div');
                _content.appendChild(_overlay);
            }

            _applyStyles();

            for (event in TRACKING_EVENTS) {
                if (TRACKING_EVENTS.hasOwnProperty(event)) {
                    _content.addEventListener(TRACKING_EVENTS[event], handleEvent, false);
                }
            }

            if (_options.resizeEvent) {
                window.addEventListener('resize', handleEvent, false);
            }

            scope.preventDefaultTags = /^(INPUT|TEXTAREA|BUTTON|SELECT)$/;
            scope._transformName = addVendorPrefix("transform");
            scope._transitionName = addVendorPrefix("transition");
            scope._transitionEndName = addVendorPrefix("transitionEnd") || 'transitionend';
        }

        /**
         * Call for correct clearing all dependencies
         * @function
         */
        this.destroy = function () {
            var event;
            for (event in TRACKING_EVENTS) {
                if (TRACKING_EVENTS.hasOwnProperty(event)) {
                    _content.removeEventListener(TRACKING_EVENTS[event], handleEvent);
                }
            }
            window.removeEventListener('resize', handleEvent);
            if (_onTheCSSEnd) {
                _onTheCSSEnd = null;
            }
            clearTimeout(_tweatID);
            window.cancelAnimationFrame(_RafID);
            _content.removeEventListener(scope._transitionEndName, _onTheCSSEnd);
            _onTheCSSEnd = null;
            _content.style[scope._transitionName] = 'none';

            if (_options.overlay) {
                _overlay.style[scope._transitionName] = 'none';
                _overlay.style.display = 'none';
                _content.removeChild(_overlay);
            }
            _navigation = null;
            _content = null;
            _overlay = null;
        };

        function createBehavior() {
            var behavior = {},
                _applyStylesHorizontal = function () {
                    _navigation.style.width = _options.maxWidth;
                    behavior.contentOffset = _content.offsetWidth;
                    behavior.wrapperOffset = _wrapper.offsetWidth;
                    behavior.navigationOffset = _navigation.offsetWidth;
                    behavior.trackingSize = parseInt(_options.startTrackingZone, 10) * _behavior.contentOffset / 100;
                },
                _applyStylesVertical = function () {
                    _navigation.style.height = _options.maxWidth;
                    behavior.navigationOffset = _navigation.offsetHeight;
                    behavior.contentOffset = _content.offsetHeight;
                    behavior.wrapperOffset = _wrapper.offsetHeight;
                    behavior.trackingSize = parseInt(_options.startTrackingZone, 10) * _behavior.contentOffset / 100;
                },
                getGestureKindLeft = function (touchPoint) {
                    if (touchPoint.x > behavior.trackingSize && _isClosed === true) {
                        return orientationType.vertical;//'vertical'; // don't track it
                    }
                    return null;
                },
                getGestureKindRight = function (touchPoint) {
                    if (touchPoint.x < behavior.wrapperOffset - behavior.trackingSize && _isClosed === true) {
                        return orientationType.vertical;//'vertical'; // don't track it
                    }
                    return null;
                },
                getGestureKindTop = function (touchPoint) {
                    if (touchPoint.y > behavior.trackingSize && _isClosed === true) {
                        return orientationType.horizontal;//'vertical'; // don't track it
                    }
                    return null;
                },
                getGestureKindBottom = function (touchPoint) {
                    if (touchPoint.y < behavior.wrapperOffset - behavior.trackingSize && _isClosed === true) {
                        return orientationType.horizontal;//'vertical'; // don't track it
                    }
                    return null;
                },
                changeContentPositionLeftTop = function (shift) {
                    if ((_contentPosition + shift >= 0) && (_contentPosition + shift <= behavior.wrapperOffset)) {
                        var position = _contentPosition + shift;
                        _content.style[scope._transformName] = _behavior.getTranslate3dString(position);
                        _contentPosition = position;
                        if (_options.overlay && _options.overlayOpacity) {
                            _overlay.style.opacity = Math.abs(position / _wrapperWidth);
                        }
                    }
                },
                changeContentPositionRightBottom = function (shift) {
                    if ((_contentPosition + shift >= -behavior.wrapperOffset) && (_contentPosition + shift <= 0)) {
                        var position = _contentPosition + shift;
                        _content.style[scope._transformName] = _behavior.getTranslate3dString(position);
                        _contentPosition = position;
                        if (_options.overlay && _options.overlayOpacity) {
                            _overlay.style.opacity = Math.abs(position / _wrapperWidth);
                        }
                    }
                    else {

                    }
                };

            behavior.isHorizontalOrientation = (_options.align === 'left' || _options.align === 'right') ? true : false

            behavior.getTranslate3dString = function (position) {
                if (behavior.isHorizontalOrientation) {
                    return "translate3d(" + position + "px, 0, 0)";

                } else {
                    return "translate3d(0, " + position + "px, 0)";
                }
            };

            switch (_options.align) {
                case 'left':
                    behavior.getOpenSpin = function () {
                        return _behavior.navigationOffset - _contentPosition;
                    };
                    behavior.getCloseSpin = function () {
                        return -_contentPosition;
                    };
                    behavior.getDirection = function (event) {
                        return (event.speedX < 0) ? "close" : "open";
                    };
                    behavior.applyStyles = _applyStylesHorizontal;
                    behavior.getGestureKind = getGestureKindLeft;
                    behavior.changeContentPosition = changeContentPositionLeftTop;
                    behavior.clearElement = function(element) {
                        element.style.left = 0;
                        element.style.top = 0;
                        element.style.bottom = 'auto';
                        element.style.right = 'auto';
                    };
                    break;
                case 'right':
                    behavior.getOpenSpin = function () {
                        return -(_behavior.navigationOffset - Math.abs(_contentPosition));
                    };
                    behavior.getCloseSpin = function () {
                        return -_contentPosition;
                    };
                    behavior.getDirection = function (event) {
                        return (event.speedX < 0) ? "open" : "close";
                    };
                    behavior.applyStyles = _applyStylesHorizontal;
                    behavior.getGestureKind = getGestureKindRight;
                    behavior.changeContentPosition = changeContentPositionRightBottom;
                    behavior.clearElement = function(element) {
                        element.style.right = 0;
                        element.style.top = 0;
                        element.style.left = 'auto';
                        element.style.bottom = 'auto';
                    };
                    break;
                case 'top':
                    behavior.getOpenSpin = function () {
                        return _behavior.navigationOffset - _contentPosition;
                    };
                    behavior.getCloseSpin = function () {
                        return -_contentPosition;
                    };
                    behavior.getDirection = function (event) {
                        return (event.speedY < 0) ? "close" : "open";
                    };
                    behavior.applyStyles = _applyStylesVertical;
                    behavior.getGestureKind = getGestureKindTop;
                    behavior.changeContentPosition = changeContentPositionLeftTop;
                    behavior.clearElement = function(element) {
                        element.style.top = 0;
                        element.style.left = 0;
                        element.style.bottom = 'auto';
                        element.style.right = 'auto';
                    };
                    break;
                case 'bottom':
                    behavior.getOpenSpin = function () {
                        return -(_behavior.navigationOffset - Math.abs(_contentPosition));
                    };
                    behavior.getCloseSpin = function () {
                        return -_contentPosition;
                    };
                    behavior.getDirection = function (event) {
                        return (event.speedY < 0) ? "close" : "open";
                    };
                    behavior.applyStyles = _applyStylesVertical;
                    behavior.getGestureKind = getGestureKindBottom;
                    behavior.changeContentPosition = changeContentPositionRightBottom;
                    behavior.clearElement = function(element) {
                        element.style.bottom = 0;
                        element.style.left = 0;
                        element.style.top = 'auto';
                        element.style.right = 'auto';
                    };
                    break;
            }
            return behavior;
        }

        function mix(obj, mixin) {
            var attr;
            for (attr in mixin) {
                if (mixin.hasOwnProperty(attr)) {
                    obj[attr] = mixin[attr];
                }
            }
            return obj;
        }

        function _applyStyles() {
            var validPosition = ['fixed', 'relative', 'absolute'],
                tmpVar = validPosition.indexOf(window.getComputedStyle(_wrapper, null).position);

            function clearElement(element) {
                element.style.position = 'absolute';
                element.style.margin = 0;
                element.style.padding = 0;
                element.style.width = '100%';
                element.style.height = '100%';
                _behavior.clearElement(element);
            }

            _wrapper.style.position = (tmpVar === -1) ? 'relative' : validPosition[tmpVar];
            _wrapper.style.overflow = 'hidden';

            clearElement(_content);
            clearElement(_navigation);

            _behavior.applyStyles();
            if (_options.overlay) {
                clearElement(_overlay);
                _overlay.style.display = 'none';

                if (_options.overlayOpacity) {
                    _overlay.style.backgroundColor = _options.overlayBackground;
                    _overlay.style.opacity = 0;
                }
            }

            _contentPosition = 0;
            _wrapperWidth = _behavior.wrapperOffset;
            _currentShiftForRaf = 0;
            _isClosed = true;
        };




        function _getCoordsInElement(event, element) {
            var x = event.pageX || event.clientX + document.body.scrollLeft,
                y = event.pageY || event.clientY + document.body.scrollTop,
                rect = element.getBoundingClientRect();

            x -= rect.left + document.body.scrollLeft;
            y -= rect.top + document.body.scrollTop;

            return {x: x, y: y};
        };

        function _pointerDown(event) {
            var touchPoint = _getCoordsInElement(event, _content);

            // stop all
            if (_onTheCSSEnd) {
                _onTheCSSEnd();
            }
            clearTimeout(_tweatID);
            window.cancelAnimationFrame(_RafID);

            _lastPoint.x = (event.originalEvent) ? event.originalEvent.clientX : event.clientX;
            _lastPoint.y = (event.originalEvent) ? event.originalEvent.clientY : event.clientY;
            _startPoint.x = _lastPoint.x;
            _startPoint.y = _lastPoint.y;

            _animationStep = function () {
                if (_inAnimation) {
                    _RafID = window.requestAnimationFrame(_animationStep);
                }
                if (_enabled) {
                    _behavior.changeContentPosition(_currentShiftForRaf);
                }
                _currentShiftForRaf = 0;
            };

            _gestureKind = _behavior.getGestureKind(touchPoint);
            _currentShiftForRaf = 0;
        };

        function _pointerMove(event) {
            var X = (event.originalEvent) ? event.originalEvent.clientX : event.clientX,
                Y = (event.originalEvent) ? event.originalEvent.clientY : event.clientY,
                shift,
                gestureKind;
            if (_behavior.isHorizontalOrientation) {
                _currentShiftForRaf += (X - _lastPoint.x)// this._lastX);
                shift = Y - _startPoint.y;
                if(Math.abs(X - _lastPoint.x)<Math.abs(Y - _startPoint.y)){
                    _lastPoint.setNewCoords(X, Y);
                    return;
                }
            } else {
                _currentShiftForRaf += (Y - _lastPoint.y)// this._lastY);
                shift = X - _startPoint.x;
                if(Math.abs(X - _lastPoint.x)>Math.abs(Y - _startPoint.y)){
                    _lastPoint.setNewCoords(X, Y);
                    return;
                }
            }

            var inhibition = Math.abs(_behavior.navigationOffset/_contentPosition);
            inhibition = (inhibition>1)?1 : inhibition;
            _currentShiftForRaf = _currentShiftForRaf *inhibition;

            _lastPoint.setNewCoords(X, Y);
            if (_gestureKind === null) {
                if (Math.abs(_currentShiftForRaf) > Math.abs(shift) / 2) {
                    gestureKind = orientationType.horizontal;
                }
                else {
                    gestureKind = orientationType.vertical;
                }
                if (_options.overlay) {
                    _overlay.style.display = 'block';
                }
                // this is horizontal moving
                _inAnimation = true;

                _RafID = window.requestAnimationFrame(_animationStep);
                _gestureKind = gestureKind;
            }
        };

        function _pointerUp() {

            _inAnimation = false;
            _tweatID = setTimeout(function () {
                _gestureKind = null;
                _action();
            }, 100);
        };

        function _pointerFling(event) {
            var event = event.originalEvent || event,
                horizontalFling = Math.abs(event.speedX) > Math.abs(event.speedY),
                verticalFling = Math.abs(event.speedY) > Math.abs(event.speedX),
                direction = _behavior.getDirection(event);

            if (((horizontalFling && Math.abs(event.speedX) > 0.2 && _enabled) && (_gestureKind === orientationType.horizontal)) ||
                ((verticalFling && Math.abs(event.speedY) > 0.2 && _enabled) && (_gestureKind === orientationType.vertical))) {
                clearTimeout(_tweatID);
                console.log("_pointerFling _gestureKind:"+_gestureKind);
                _action(direction);
            }
        };
        function _pointerTap() {
            if (!_isClosed) {
                clearTimeout(_tweatID);
                _action(actions.close);
            }
        };
        function _action(activity) {
            var shift,
                animTime = _options.animationTime;
            if (typeof activity !== 'string') {
                if (Math.abs(_contentPosition) > _behavior.navigationOffset / 2) {
                    activity = actions.open;
                } else {
                    activity = actions.close;
                }
            }
            if (activity === actions.open) {
                shift = _behavior.getOpenSpin();
                _isClosed = false;
            } else {
                shift = _behavior.getCloseSpin();
                _isClosed = true;
            }
            // stop all
            if (_onTheCSSEnd) {
                _onTheCSSEnd = null;
            }
            clearTimeout(_tweatID);
            window.cancelAnimationFrame(_RafID);

            //prepare css animation
            _content.style[scope._transitionName] = 'all ' + (animTime * Math.abs(shift) / _wrapperWidth) + 'ms ease-in-out';
            if (_options.overlay) {
                _overlay.style.opacity = Math.abs(_contentPosition / _wrapperWidth);
                _overlay.offsetWidth; //dog bone
                _overlay.style[scope._transitionName] = 'opacity ' + (animTime * Math.abs(shift) / _wrapperWidth) + 'ms ease-in-out';
                _overlay.style.opacity = (activity === actions.close) ? 0 : 1;
            }

            _onTheCSSEnd = function () {
                _content.removeEventListener(scope._transitionEndName, _onTheCSSEnd);
                _onTheCSSEnd = null;
                _content.style[scope._transitionName] = 'none';

                if (_options.overlay) {
                    _overlay.style[scope._transitionName] = 'none';
                    if (activity === 'close') {
                        _overlay.style.display = 'none';
                    } else {
                        _overlay.style.display = 'block';
                    }
                }

                _options.onActionEnd(_isClosed);
            };

            _content.addEventListener(scope._transitionEndName, _onTheCSSEnd, false);

            // set position
            _behavior.changeContentPosition(shift);
        };

        this.refresh = function () {
            // stop all
            if (_onTheCSSEnd) {
                _onTheCSSEnd();
            }
            clearTimeout(_tweatID);
            window.cancelAnimationFrame(_RafID);

            // close menu
            _isClosed = true;
            if (_options.overlay) {
                _overlay.style.display = 'none';
                if (_options.overlayOpacity) {
                    _overlay.style.opacity = 0;
                }
            }
            _content.style[this._transformName] = "translate3d(0, 0, 0)";
            _contentPosition = 0;
            //update parameters
            _behavior.applyStyles();

        };

        this.setState = function (close, onActionEnd) {

            if (_isClosed !== close) {
                if (_options.overlay) {
                    _overlay.style.display = 'block';
                }
                _options.onActionEnd = onActionEnd? onActionEnd: _options.onActionEnd;
                _action(close ? 'close' : 'open');
            }
        };

        this.isClosed = function(){
            return _isClosed;
        };
        this.setEnableSwipe = function (flag) {
            _enabled = flag;
        };
        this.isEnableSwipe = function () {
            return _enabled;
        };

    }

    return Drawer;
}));
