

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
            // 생성자에서 이미 init() 호출됨. DOM 요소를 첫 인자로 넘기면 옵션이 깨지므로 옵션 객체만 전달.
            this.focusManager = new FocusManager({
                inputSelector: 'input, textarea, button.clear-button',
            });

            if (element.quertSelector("input-field")?.classList.contains("line") || element.querySelector(".input-field")?.classList.contains("no-animated")) {
                this.focusManager.options.onlyFocus = true;
                // init() 재호출 금지: document에 focusin 리스너가 중복 등록되면 같은 이벤트에서 handleFocus·onFocusChange가
                // 두 번 실행되고, Safari는 포커스 처리 중 동기 DOM 변경에 취약해 input 포커스가 끊길 수 있음.
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
        this.focusManager.setCallbacks({
            onFocusChange: (focusedEl, container) => {
                if (!focusedEl || !container) return;
                if (!focusedEl.matches?.('input, textarea, .clear-button')) return;

                const el = focusedEl;
                const root = container;
                // 포커스 이벤트 스택이 끝난 뒤에 클리어 버튼 표시를 맞춤 (Safari 포커스 안정화)
                requestAnimationFrame(() => {
                    if (!root.isConnected) return;
                    if (!root.contains(el) && document.activeElement !== el) return;

                    root.querySelectorAll('.clear-button').forEach((btn) => {
                        btn.classList.remove('active');
                    });

                    const clearBtn = el.matches('.clear-button')
                        ? el
                        : findNextElement(el, 'BUTTON', '.clear-button');
                    clearBtn?.classList.add('active');
                });
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
