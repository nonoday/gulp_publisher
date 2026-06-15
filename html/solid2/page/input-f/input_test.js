(function () {
    var config = {
        mode: 'log',
        selector: '.input-field.readonly, .input-textarea-from.readonly',
        eventTypes: [
            'touchstart',
            'touchmove',
            'touchend',
            'pointerdown',
            'pointermove',
            'pointerup',
            'mousedown',
            'mousemove',
            'mouseup',
            'wheel',
            'click',
            'focusin',
            'focusout'
        ],
        showPanel: true
    };

    var logCount = 0;
    var panel = null;
    var lastScroll = {
        x: window.scrollX,
        y: window.scrollY
    };
    var recentEvents = [];

    function getField(target) {
        return target && target.closest ? target.closest(config.selector) : null;
    }

    function isReadonlyTarget(target, field) {
        if (!target || !field) return false;

        if (target.matches && target.matches('input[readonly], textarea[readonly], label')) {
            return true;
        }

        return !!target.closest('input[readonly], textarea[readonly], label');
    }

    function getTargetInfo(target, field) {
        var active = document.activeElement;
        var labelFor = target && target.getAttribute ? target.getAttribute('for') : null;
        var input = field ? field.querySelector('input, textarea, select') : null;

        return {
            tag: target ? target.tagName : null,
            id: target ? target.id || '' : '',
            className: target ? String(target.className || '') : '',
            labelFor: labelFor || '',
            fieldId: field ? field.id || '' : '',
            fieldClass: field ? String(field.className || '') : '',
            inputId: input ? input.id || '' : '',
            inputReadonly: !!(input && (input.readOnly || input.hasAttribute('readonly'))),
            activeTag: active ? active.tagName : null,
            activeId: active ? active.id || '' : '',
            scrollX: window.scrollX,
            scrollY: window.scrollY,
            viewportOffsetTop: window.visualViewport ? window.visualViewport.offsetTop : null,
            viewportHeight: window.visualViewport ? window.visualViewport.height : null
        };
    }

    function createPanel() {
        if (!config.showPanel || panel) return;

        panel = document.createElement('div');
        panel.id = 'input-test-debug-panel';
        panel.style.cssText = [
            'position:fixed',
            'left:8px',
            'right:8px',
            'bottom:8px',
            'z-index:2147483647',
            'max-height:34vh',
            'overflow:auto',
            'padding:8px',
            'background:rgba(18,22,25,.92)',
            'color:#fff',
            'font:12px/1.45 monospace',
            'border-radius:6px',
            'white-space:pre-wrap',
            'pointer-events:none'
        ].join(';');
        panel.textContent = 'input_test.js ready | mode: ' + config.mode;
        document.documentElement.appendChild(panel);
    }

    function writePanel(message) {
        if (!panel) return;

        panel.textContent = message + '\n' + panel.textContent;
        panel.textContent = panel.textContent.split('\n').slice(0, 40).join('\n');
    }

    function log(type, event, extra) {
        var field = getField(event.target);
        if (!field) return;

        logCount += 1;

        var info = getTargetInfo(event.target, field);
        var payload = {
            count: logCount,
            type: type,
            mode: config.mode,
            defaultPrevented: event.defaultPrevented,
            cancelable: event.cancelable,
            detail: event.detail,
            info: info,
            extra: extra || null
        };

        recentEvents.unshift({
            type: type,
            time: Date.now(),
            target: info.tag + (info.id ? '#' + info.id : ''),
            scrollX: info.scrollX,
            scrollY: info.scrollY,
            extra: extra || ''
        });
        recentEvents = recentEvents.slice(0, 12);

        console.log('[input-test]', payload);
        writePanel(
            '#' + logCount + ' ' + type +
            ' | mode=' + config.mode +
            ' | target=' + info.tag + (info.id ? '#' + info.id : '') +
            ' | field=' + (info.fieldId || info.fieldClass) +
            ' | active=' + info.activeTag + (info.activeId ? '#' + info.activeId : '') +
            ' | scroll=' + info.scrollX + ',' + info.scrollY +
            (extra ? ' | ' + extra : '')
        );
    }

    function writeMethodLog(name, target, args) {
        var field = target === window || target === document || target === document.documentElement || target === document.body
            ? document.querySelector(config.selector)
            : getField(target);

        var payload = {
            method: name,
            target: target,
            args: Array.prototype.slice.call(args || []),
            scrollX: window.scrollX,
            scrollY: window.scrollY,
            active: document.activeElement,
            recentEvents: recentEvents.slice(),
            stack: new Error().stack
        };

        console.log('[input-test] scroll method', payload);
        writePanel(
            name +
            ' | scroll=' + payload.scrollX + ',' + payload.scrollY +
            ' | recent=' + (recentEvents[0] ? recentEvents[0].type + ' ' + recentEvents[0].target : 'none')
        );
    }

    function shouldPrevent(event, field) {
        if (config.mode === 'log') return false;
        if (!field) return false;

        if (config.mode === 'field') {
            return true;
        }

        if (config.mode === 'input') {
            return !!(event.target.closest && event.target.closest('input[readonly], textarea[readonly]'));
        }

        if (config.mode === 'label') {
            return !!(event.target.closest && event.target.closest('label'));
        }

        if (config.mode === 'input-label') {
            return isReadonlyTarget(event.target, field);
        }

        return false;
    }

    function bindEventLogs() {
        config.eventTypes.forEach(function (type) {
            document.addEventListener(type, function (event) {
                var field = getField(event.target);
                if (!field) return;

                if ((type === 'pointerdown' || type === 'touchstart' || type === 'mousedown') && shouldPrevent(event, field)) {
                    event.preventDefault();
                    log(type, event, 'preventDefault');
                    return;
                }

                log(type, event);
            }, true);
        });
    }

    function bindScrollLogs() {
        window.addEventListener('scroll', function () {
            var next = {
                x: window.scrollX,
                y: window.scrollY
            };

            if (next.x !== lastScroll.x || next.y !== lastScroll.y) {
                console.log('[input-test] document scroll', {
                    before: lastScroll,
                    after: next,
                    active: document.activeElement,
                    recentEvents: recentEvents.slice()
                });
                writePanel(
                    'document scroll | ' +
                    lastScroll.x + ',' + lastScroll.y +
                    ' -> ' + next.x + ',' + next.y +
                    ' | recent=' + (recentEvents[0] ? recentEvents[0].type + ' ' + recentEvents[0].target : 'none')
                );
                lastScroll = next;
            }
        }, true);

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', function () {
                console.log('[input-test] visualViewport resize', {
                    offsetTop: window.visualViewport.offsetTop,
                    height: window.visualViewport.height
                });
                writePanel('visualViewport resize | offsetTop=' + window.visualViewport.offsetTop + ' height=' + window.visualViewport.height);
            });

            window.visualViewport.addEventListener('scroll', function () {
                console.log('[input-test] visualViewport scroll', {
                    offsetTop: window.visualViewport.offsetTop,
                    offsetLeft: window.visualViewport.offsetLeft
                });
                writePanel('visualViewport scroll | offsetTop=' + window.visualViewport.offsetTop);
            });
        }
    }

    function patchScrollMethods() {
        if (window.__inputTestScrollPatched) return;

        var nativeScrollTo = window.scrollTo;
        var nativeScrollBy = window.scrollBy;
        var nativeElementScrollIntoView = Element.prototype.scrollIntoView;
        var nativeElementScrollTo = Element.prototype.scrollTo;
        var nativeElementScrollBy = Element.prototype.scrollBy;

        window.scrollTo = function () {
            writeMethodLog('window.scrollTo', window, arguments);
            return nativeScrollTo.apply(this, arguments);
        };

        window.scrollBy = function () {
            writeMethodLog('window.scrollBy', window, arguments);
            return nativeScrollBy.apply(this, arguments);
        };

        Element.prototype.scrollIntoView = function () {
            writeMethodLog('Element.scrollIntoView', this, arguments);
            return nativeElementScrollIntoView.apply(this, arguments);
        };

        if (nativeElementScrollTo) {
            Element.prototype.scrollTo = function () {
                writeMethodLog('Element.scrollTo', this, arguments);
                return nativeElementScrollTo.apply(this, arguments);
            };
        }

        if (nativeElementScrollBy) {
            Element.prototype.scrollBy = function () {
                writeMethodLog('Element.scrollBy', this, arguments);
                return nativeElementScrollBy.apply(this, arguments);
            };
        }

        window.__inputTestScrollPatched = true;
    }

    function bindClassObserver() {
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type !== 'attributes') return;
                if (mutation.attributeName !== 'class' && mutation.attributeName !== 'style') return;

                var field = getField(mutation.target);
                if (!field) return;

                console.log('[input-test] mutation', {
                    attribute: mutation.attributeName,
                    target: mutation.target,
                    className: mutation.target.className,
                    style: mutation.target.getAttribute('style')
                });
                writePanel('mutation | ' + mutation.attributeName + ' | ' + String(mutation.target.className || ''));
            });
        });

        observer.observe(document.documentElement, {
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style']
        });
    }

    function patchFocusLogger() {
        if (HTMLElement.prototype.__inputTestFocusPatched) return;

        var nativeFocus = HTMLElement.prototype.focus;
        HTMLElement.prototype.focus = function () {
            var field = getField(this);
            if (field) {
                console.log('[input-test] focus() called', {
                    target: this,
                    field: field,
                    readonly: this.readOnly || this.hasAttribute('readonly'),
                    args: Array.prototype.slice.call(arguments || []),
                    scrollX: window.scrollX,
                    scrollY: window.scrollY,
                    recentEvents: recentEvents.slice(),
                    stack: new Error().stack
                });
                writePanel('focus() called | ' + this.tagName + (this.id ? '#' + this.id : ''));
            }

            return nativeFocus.apply(this, arguments);
        };

        HTMLElement.prototype.__inputTestFocusPatched = true;
    }

    window.InputReadonlyTouchTest = {
        setMode: function (mode) {
            config.mode = mode || 'log';
            console.log('[input-test] mode changed:', config.mode);
            writePanel('mode changed: ' + config.mode);
        },
        getMode: function () {
            return config.mode;
        },
        setSelector: function (selector) {
            config.selector = selector || config.selector;
            console.log('[input-test] selector changed:', config.selector);
            writePanel('selector changed: ' + config.selector);
        },
        help: function () {
            var message = [
                'InputReadonlyTouchTest modes:',
                'log         : log only',
                'input       : prevent pointer/touch/mouse down on readonly input/textarea',
                'label       : prevent pointer/touch/mouse down on label',
                'input-label : prevent on readonly input/textarea and label',
                'field       : prevent on entire readonly field',
                '',
                'Example:',
                'InputReadonlyTouchTest.setMode("input-label")'
            ].join('\n');
            console.log(message);
            writePanel(message);
        }
    };

    createPanel();
    bindEventLogs();
    bindScrollLogs();
    bindClassObserver();
    patchScrollMethods();
    patchFocusLogger();
    window.InputReadonlyTouchTest.help();
})();


//InputReadonlyTouchTest.setMode('log')
//InputReadonlyTouchTest.setMode('input-label')
//InputReadonlyTouchTest.setMode('field')