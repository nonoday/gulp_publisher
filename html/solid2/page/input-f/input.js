

class BaseComponent {
    constructor(element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        this._element = element;
    }
}

let inputTimer = null;

class Input extends BaseComponent {
    constructor(element) {
        
        if(getElement(element).classList.contains("initiated")) {
            return {};
        }
        super(element);

        this._element = element;

        const containers = element.querySelectorAll(".svg-animated, .no-animated, .line");

        if (containers.length > 0) {
            this.focusManager = new FocusManager(element, {
                inputSelector: 'input, textarea, button.clear-button, .clear-button'
            });

            if (element.querySelector(".input-field")?.classList.contains("line") || element.querySelector(".input-field")?.classList.contains("no-animated")) {
                this.focusManager.options.onlyFocus = true;
                this.focusManager.registerContainer(element);
             }
        }

        this._init();
        this.timerInit();

    }


    static get NAME() {
        return "input";
    }

    init() {

        const _orgHelpText = this._element.querySelector(".input-function-message");
        this.helpText = _orgHelpText?.innerText ?? "";

        this._countInit();

        const cellList = document.querySelectorAll(".input-container .cell");
        Object.values(cellList)?.map((cell) => {
            const authCodeInputs = cell.querySelectorAll("input");
            this.cellEventBind(authCodeInputs);
        })

        Object.values(_inputFields)?.map((inputField) => {
            const inputEl = inputField.querySelector("input, textarea");
            inputEl.forEach((input) => {
                const inputInner = input.closest('.input-field-inner, .input-field-sub-text');
                const clearBtn = findNextElement(input, 'BUTTON', '.clear-button');

                if (input.value && input.value.length) {
                    inputInner?.classList.add("has-value");
                    input.classList.add("value");
                } else {
                    inputInner?.classList.remove("has-value");
                    input.classList.remove("value");
                }
                clearBtn?.classList.remove("active");
            });
        });
        let _inputMsgDiv = this._element.querySelector(".input-function-message");
        if(_inputMsgDiv) {
            const firstInputEl = this._element.querySelector(".input-field input, .input-field textarea");
            _inputMsgDiv.id - `ui-input-msg-${generateRandomCode(4)}`;
            _inputMsgDiv.setAttribute("role", "alert");
            setAriaAttribute(firstInputEl, "describedby", _inputMsgDiv.id);
        }

        this.eventBind();
        this.initClearButton();
    }

    _countInit() {
        const _inputs = this._element.querySelectorAll(".input-field input, .input-field textarea");
       
        if (_inputs.length && _inputs.length === 1) { 

            if(!_inputs[0].hasAttribute("data-max-length")) return 

            const _maxLength = getDataAttribute(_inputs[0], "max-length");

            let _inputFuncDiv = this._element.querySelector(".input-function");
            if(!_inputFuncDiv) {
                _inputFuncDiv = document.createElement("div");
                _inputFuncDiv.classList.add("input-function");
                this._element.append(_inputFuncDiv);
            }

            let _countText = this._element.querySelector(".input-function-count");

            if(!_countText) {
                _countText = document.createElement("div");
                _countText.classList.add("input-function-count");
                _inputFuncDiv.append(_countText);
            }

            _countText.innerHTML = `<span class="input-function-number">0</span>/${_maxLength}자`;
        }
    }

    timerInit() {
        const timer = this._element.querySelector(".certification-timer, .input-timer");

        if (!timer) return;

        const init = 1000 * 60 * 3;
        this._timerElement = timer;
        this.setTimer(init);
    }

    initClearButton() {
        // 포커스 매니저가 넘기는 container가 버튼보다 앞쪽 노드만 가리키는 경우가 있어,
        // 실제 포커스 요소(focusedEl)로 필드 루트를 잡는다. 클릭으로 클리어에 들어온 경우에만 짝 input으로 포커스 이동.
        this._clearBtnFromPointer = false;
        const markClearFromPointer = (e) => {
            if (e.target?.closest?.('.clear-button')) this._clearBtnFromPointer = true;
        };
        this._element.addEventListener('mousedown', markClearFromPointer, true);
        this._element.addEventListener('touchstart', markClearFromPointer, { capture: true, passive: true });

        this._element.addEventListener('click', (e) => {
            const clearBtn = e.target?.closest?.('.clear-button');
            if (!clearBtn) return;
            const fieldRoot =
                clearBtn.closest('.input-field') ||
                clearBtn.closest('.svg-animated, .no-animated, .line') ||
                this._element;
            const inputEl = fieldRoot.querySelector('input, textarea');
            if (!inputEl) return;

            // Safari에서 버튼 포커스가 남아 입력 포커스가 끊기는 케이스 방지
            setTimeout(() => {
                inputEl.focus();
            }, 0);
        }, true);

        this.focusManager.setCallbacks({
            onFocusChange: (focusedEl, container) => {
                if (!focusedEl || !container) return;
                if (!focusedEl.matches?.('.clear-button')) {
                    this._clearBtnFromPointer = false;
                }
                if (!focusedEl.matches?.('input, textarea, .clear-button')) return;

                const fieldRoot =
                    focusedEl.closest('.input-field') ||
                    focusedEl.closest('.svg-animated, .no-animated, .line') ||
                    container;

                fieldRoot.querySelectorAll('.clear-button').forEach((btn) => {
                    btn.classList.remove('active');
                });

                let clearBtn = null;
                if (focusedEl.matches?.('.clear-button')) {
                    clearBtn = focusedEl;
                    clearBtn.classList.add('active');

                    if (this._clearBtnFromPointer) {
                        this._clearBtnFromPointer = false;
                        const inputBeforeClear = [...fieldRoot.querySelectorAll('input, textarea')].filter(
                            (el) => focusedEl.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING
                        );
                        const inputEl =
                            inputBeforeClear.length > 0
                                ? inputBeforeClear[inputBeforeClear.length - 1]
                                : fieldRoot.querySelector('input, textarea');

                        requestAnimationFrame(() => {
                            inputEl?.focus?.();
                        });
                    }
                } else {
                    clearBtn =
                        typeof findNextElement === 'function'
                            ? findNextElement(focusedEl, 'BUTTON', '.clear-button')
                            : fieldRoot.querySelector('.clear-button');
                    clearBtn?.classList.add('active');
                }
            },
            onFocus: (target) => {
                const clearBtn = findNextElement(target, 'BUTTON', '.clear-button');
                if (!target.value?.length) return;
                if (!clearBtn?.classList.contains("active")) clearBtn?.classList.add("active");
            },
            onBlur: (_, container) => {
                const clearBtns = container.querySelectorAll('.clear-button');
                clearBtns?.forEach((clearBtn) => {
                    clearBtn.classList.remove("active");
                });
            }
        });
    }
    
}



const index  = {
    input
}
