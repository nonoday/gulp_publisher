// 헬퍼 함수들
function appendHtml(element, html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    while (temp.firstChild) {
        element.appendChild(temp.firstChild);
    }
}

function getCoords(element) {
    const box = element.getBoundingClientRect();
    return {
        top: box.top + window.pageYOffset,
        left: box.left + window.pageXOffset
    };
}

function amountFormat(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function setAriaAttrubute(element, attr, value) {
    element.setAttribute(`aria-${attr}`, value);
}

function replaceAll(str, find, replace) {
    return str.split(find).join(replace);
}

// 간단한 EventHandler
const EventHandler = {
    on: function(element, event, handler) {
        if (element.addEventListener) {
            element.addEventListener(event, handler);
        }
    },
    off: function(element, event, handler) {
        if (element.removeEventListener) {
            element.removeEventListener(event, handler);
        }
    }
};

class BaseComponent {
    constructor(element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        this.element = element;
        this._element = element;
    }
}

class Slider extends BaseComponent {
    
    constructor(element, config) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (!element) {
            throw new Error('Slider element not found');
        }
        
        if(element.classList && element.classList.contains("initiated")) {
            return {};
        }

        super(element);
        
        this.config = {
            orientation:"horizontal",
            min:0,
            max:100,
            step:1,
            value:0,
            range:false,
            values:null,
            unit:"",
            showMinMax:false,
            showTooltip:false,
            tooltipRange:false,
            linkedFormID:null,
            valueArray:null,
            showAllValueArrayLabels:true,
            change:null,
            slide:null,
            start:null,
            stop:null,
            ...(typeof config === "object" ? config : {}),
        };
       
        this.numPages = 10;
        this.EVENT_KEY = 'slider';
        this.EVENT_CHANGE = `change${this.EVENT_KEY}`;
        
        // 터치 탭 감지를 위한 변수
        this.touchStartTime = null;
        this.touchStartPosition = null;
        this.lastTapTime = null;
        this.lastTapHandle = null;
        this.isDragging = false;
        this.pendingTapTimeout = null; // 탭 지연 처리용

        this.keys = {
            pgup:33,
            pgdn:34,
            end:35,
            home:36,
            left:37,
            up:38,
            right:39,
            down:40,
        };

        this.init();
    }

    static get NAME() {
        return "slider";
    }

    init() {
        if (this.hasValueArray()) {
            this.config.step =1;
            this.config.min = 0;
            this.config.max = this.config.valueArray.length -1 ;
        }
        this.detectOrientation();
        this.calculateNewMax();

        // 초기값 설정 (update 호출 전에 값이 확실히 저장되도록)
        if (this.isRange()) {
            if (this.config.values === null || !Array.isArray(this.config.values)){
                this.config.values = [this.valueMin(), this.valueMax()];
            } else {
                // 설정된 values 값이 범위를 벗어나지 않도록 제한
                let val0 = Math.max(this.valueMin(), Math.min(this.valueMax(), this.config.values[0]));
                let val1 = Math.max(this.valueMin(), Math.min(this.valueMax(), this.config.values[1]));
                // step에 맞춤 (초기값이므로 정확히 설정)
                val0 = this.trimAlignValue(val0);
                val1 = this.trimAlignValue(val1);
                this.config.values = [val0, val1];
            }
        } else {
            // 단일 슬라이더의 경우 value가 설정되지 않았으면 기본값 사용
            if (this.config.value === undefined || this.config.value === null) {
                this.config.value = this.valueMin();
            } else {
                // 설정된 value 값이 범위를 벗어나지 않도록 제한
                let val = Math.max(this.valueMin(), Math.min(this.valueMax(), this.config.value));
                // step에 맞춤 (초기값이므로 정확히 설정)
                val = this.trimAlignValue(val);
                this.config.value = val;
            }
        }

        this._linkedForm = document.querySelector(`#${this.config.linkedFormID}`);

        this.createHtml();
        this.eventBind();
        // update() 호출 시 값이 제대로 반영되도록
        // 초기값이 설정된 후 updateValue() 호출
        this.updateValue();
    }

    createHtml() {
        this._element.classList.add("ui-slider");
        if (this.isRange()){
            this._element.classList.add("multi-slider");
        }
        if(this.orientation === "vertical"){
            this._element.classList.add("vertical-slider");
        }

        // slider-inner div 생성
        appendHtml(this._element, `<div class="slider-inner"></div>`);
        this._inner = this._element.querySelector(".slider-inner");

        appendHtml(this._inner, `<div class="slider-container"></div>`);
        this._container = this._inner.querySelector(".slider-container");

        appendHtml(this._container, `<div class="slider-track-bar"></div>`);


        if (this.isRange()){
            appendHtml(this._container, `<div class="slider-handle start" tabindex="0" role="slider" aria-valuemin="${this.valueMin()}" aria-valuemax="${this.config.values[1]}" aria-valuenow="${this.config.values[0]}"></div>`);
            appendHtml(this._container, `<div class="slider-handle end" tabindex="0" role="slider" aria-valuemin="${this.config.values[0]}" aria-valuemax="${this.valueMax()}" aria-valuenow="${this.config.values[1]}"></div>`);
        } else {
            appendHtml(this._container, `<div class="slider-handle" tabindex="0" role="slider" aria-valuemin="${this.valueMin()}" aria-valuemax="${this.valueMax()}" aria-valuenow="${this.config.value}"></div>`);
        }

        this.handles = this._container.querySelectorAll(".slider-handle");

        //민맥
        if (this.config.showMinMax){
            if (!this.hasValueArray()) {
                appendHtml(this._inner, `<div class="slider-labels"><span class="min">${amountFormat(this.valueMin()) + this.config.unit}</span><span class="max">${amountFormat(this.valueMax()) + this.config.unit}</span></div>`);
            } else {
                // valueArray 라벨 생성
                let labelsHtml = '<div class="slider-labels slider-labels-array">';
                const arrayLength = this.config.valueArray.length;
                
                if (this.config.showAllValueArrayLabels) {
                    // 모든 값에 대해 라벨 생성
                    for (let i = 0; i < arrayLength; i++) {
                        const percent = arrayLength > 1 ? (i / (arrayLength - 1)) * 100 : 0;
                        const labelClass = i === 0 ? 'min' : (i === arrayLength - 1 ? 'max' : '');
                        labelsHtml += `<span class="slider-label-item ${labelClass}" style="left: ${percent}%; transform: translateX(-50%);">${this.config.valueArray[i] + this.config.unit}</span>`;
                    }
                } else {
                    // 첫 번째와 마지막만 표시
                    labelsHtml += `<span class="slider-label-item min" style="left: 0%; transform: translateX(0);">${this.config.valueArray[0] + this.config.unit}</span>`;
                    if (arrayLength > 1) {
                        labelsHtml += `<span class="slider-label-item max" style="left: 100%; transform: translateX(-100%);">${this.config.valueArray[arrayLength - 1] + this.config.unit}</span>`;
                    }
                }
                labelsHtml += '</div>';
                appendHtml(this._inner, labelsHtml);
            }
        }

        if (this.config.showTooltip){
            this._element.classList.add("has-tooltip");
            // tooltipRange 옵션에 따라 다른 구조로 생성
            if (this.config.tooltipRange) {
                // 범위값 모드
                appendHtml(this._element, `<div class="slider-tooltip"><span class="slider-tooltip-first"></span><span class="slider-tooltip-end"></span></div>`);
            } else {
                // 단일값 모드
                appendHtml(this._element, `<div class="slider-tooltip"><span class="slider-tooltip-end"></span></div>`);
            }
            this._tooltip = this._element.querySelector(".slider-tooltip");
            this._tooltipFirst = this._element.querySelector(".slider-tooltip-first");
            this._tooltipEnd = this._element.querySelector(".slider-tooltip-end");
        }

    }

    eventBind() {
        EventHandler.on(this._element, "slide", this.eventSlide.bind(this));
        EventHandler.on(this._element, "stop", this.eventStop.bind(this));
        Array.from(this.handles).forEach((handle) => {
            EventHandler.on(handle, "keydown", this.handleKeydown.bind(this));
            EventHandler.on(handle, "mousedown", this.handleTouchStart.bind(this));
            EventHandler.on(handle, "touchstart", this.handleTouchStart.bind(this));
        });
        if (this._linkedForm) {
            EventHandler.on(this._linkedForm, "change", () => {
                let changedValue = parseFloat(replaceAll(this._linkedForm.value, ",", ""));
                this.value(changedValue);
            });
        }
    }

    update() {
        this.updateValue();
    }
    detectOrientation() {
        this.orientation = this.config.orientation;
    }

    calculateNewMax() {
        let max = this.config.max;
        let min = this.valueMin();
        let step = this.config.step;
        let aboveMin = Math.round((max - min) / step) * step;
        max = aboveMin + min;
        if (max > this.config.max) {
            max -= step;
        }
        this.max = parseFloat(max.toFixed(this.precision()));
    }

    precision() {
        let precision = this.precisionOf(this.config.step);
        if (this.valueMin() !== null) {
            precision = Math.max(precision, this.precisionOf(this.valueMin()));
        }
        return precision;
    }


    precisionOf(num) {
        let str = num.toString();
        let decimal = str.indexOf(".");
        return decimal === -1 ? 0 : str.length - decimal - 1;
    }

    eventSlide(e) {
        if (this.config.slide !== null) {
            this.config.slide(e, {
                handle: this.handles[e.detail.index],
                handleIndex: e.detail.index,
                value: e.detail.value,
                values: e.detail.values || [e.detail.value, e.detail.value],
            });
        }
    }

    eventStop(e) {
        if (this.config.stop !== null) {
            this.config.stop(e, {
                handle: this.handles[e.detail.index],
                handleIndex: e.detail.index,
                value: e.detail.value,
                values: e.detail.values || [e.detail.value, e.detail.value],
            });
        }
    }

    handleKeydown(e) {
        const key = e.keyCode;
        let curVal, newVal, step = this.config.step;

        let index =  e.target.classList.contains("end") ? 1 : 0;

        if(this.isRange()) {
            curVal = newVal = this.values(index);
        } else {
            curVal = newVal = this.value();
        }

        switch (key) {
            case this.keys.right:
            case this.keys.up:
            case this.keys.left:
            case this.keys.down:
            case this.keys.pgup:
            case this.keys.pgdn:
            case this.keys.home:
            case this.keys.end:
                e.preventDefault();
                break;
        }
        

        switch (key) {
            case this.keys.right:
            case this.keys.up:
                if (curVal === this.valueMax()) {
                    return;
                }
                newVal = this.trimAlignValue(curVal + step);
                break;
            case this.keys.left:
            case this.keys.down:
                if (curVal === this.valueMin()) {
                    return;
                }
                newVal = this.trimAlignValue(curVal - step);
                break;
            case this.keys.pgup:
                newVal = this.trimAlignValue(curVal + (this.valueMax() - this.valueMin()) / this.numPages);
                break;
            case this.keys.pgdn:
                newVal = this.trimAlignValue(curVal - (this.valueMax() - this.valueMin()) / this.numPages);
                break;
            case this.keys.home:
                if (curVal === this.valueMin()) {
                    return;
                }
                newVal = this.valueMin();
                break;
            case this.keys.end:
                if (curVal === this.valueMax()) {
                    return;
                }
                newVal = this.valueMax();
                break;
        }
        this.slide(e, index, newVal);
    }
    
    handleTouchStart(e) {
        this.elementSize = {
            width: this._element.clientWidth,
            height: this._element.clientHeight,
        };
        this.elementOffset = getCoords(this._element);
        this.activeHandle = e.target;
        e.target.classList.add("pressed");
        Array.from(this.handles).forEach((handle) => {
            handle.classList.add("last");
        });
        e.target.classList.add("last");
        if (e.cancelable) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        // 터치 시작 시간과 위치 기록
        this.touchStartTime = Date.now();
        if (e.touches && e.touches[0]) {
            this.touchStartPosition = {x: e.touches[0].pageX, y: e.touches[0].pageY};
        } else {
            this.touchStartPosition = {x: e.pageX, y: e.pageY};
        }
        this.isDragging = false;
        
        // 전역 마우스/터치 이벤트 리스너 추가
        this._globalMoveHandler = (evt) => {
            if (this.activeHandle && this.activeHandle.classList.contains("pressed")) {
                this.handleTouchMove(evt);
            }
        };
        this._globalEndHandler = (evt) => {
            if (this.activeHandle && this.activeHandle.classList.contains("pressed")) {
                this.handleTouchEnd(evt);
                document.removeEventListener("mousemove", this._globalMoveHandler);
                document.removeEventListener("mouseup", this._globalEndHandler);
                document.removeEventListener("touchmove", this._globalMoveHandler);
                document.removeEventListener("touchend", this._globalEndHandler);
            }
        };
        
        document.addEventListener("mousemove", this._globalMoveHandler);
        document.addEventListener("mouseup", this._globalEndHandler);
        document.addEventListener("touchmove", this._globalMoveHandler);
        document.addEventListener("touchend", this._globalEndHandler);
    }

    handleTouchEnd(e) {
        if (!this.activeHandle) return;
        
        const touchEndTime = Date.now();
        const touchDuration = touchEndTime - this.touchStartTime;
        
        // 드래그가 아니고 짧은 탭인 경우 (300ms 이내, 5px 이내 이동)
        if (!this.isDragging && touchDuration < 300) {
            let currentPosition;
            if (e.changedTouches && e.changedTouches[0]) {
                currentPosition = {x: e.changedTouches[0].pageX, y: e.changedTouches[0].pageY};
            } else {
                currentPosition = {x: e.pageX, y: e.pageY};
            }
            
            const moveDistance = Math.sqrt(
                Math.pow(currentPosition.x - this.touchStartPosition.x, 2) + 
                Math.pow(currentPosition.y - this.touchStartPosition.y, 2)
            );
            
            if (moveDistance < 5) {
                // 더블터치 체크
                const timeSinceLastTap = this.lastTapTime ? touchEndTime - this.lastTapTime : Infinity;
                const isSameHandle = this.lastTapHandle === this.activeHandle;
                
                if (timeSinceLastTap < 300 && isSameHandle) {
                    // 더블터치: 대기 중인 탭 취소하고 값 -1
                    if (this.pendingTapTimeout) {
                        clearTimeout(this.pendingTapTimeout);
                        this.pendingTapTimeout = null;
                    }
                    // 더블터치: 값 -1 (원래 값에서 -1)
                    this.handleDoubleTap();
                    // 더블터치 처리 후 탭 시간 초기화
                    this.lastTapTime = null;
                    this.lastTapHandle = null;
                } else {
                    // 원터치: 지연 처리하여 더블터치 가능성 확인
                    // 대기 중인 탭이 있으면 취소
                    if (this.pendingTapTimeout) {
                        clearTimeout(this.pendingTapTimeout);
                    }
                    // 300ms 후에 원터치 실행 (더블터치가 아니면)
                    this.pendingTapTimeout = setTimeout(() => {
                        this.handleSingleTap();
                        this.pendingTapTimeout = null;
                    }, 300);
                    
                    this.lastTapTime = touchEndTime;
                    this.lastTapHandle = this.activeHandle;
                }
            }
        }
        
        // 드래그 종료 처리
        this.activeHandle.classList.remove("pressed");
        let index = this.activeHandle.classList.contains("end") ? 1 : 
                    (this.activeHandle.classList.contains("start") ? 0 : 0);
        this._element.dispatchEvent(
            new CustomEvent("stop", {
                detail: {
                    index: index,
                    value: this.isRange() ? this.config.values[index] : this.config.value,
                    values: this.isRange() ? this.config.values : [this.config.value],
                },
            })
        );
        this.activeHandle = null;
        this.isDragging = false;
        return true;
    }
    
    handleSingleTap() {
        // setTimeout으로 지연 호출되므로 activeHandle이 null일 수 있으므로 lastTapHandle 사용
        const handle = this.activeHandle || this.lastTapHandle;
        if (!handle) return;
        
        let index = handle.classList.contains("end") ? 1 : 
                    (handle.classList.contains("start") ? 0 : 0);
        
        let currentValue;
        if (this.isRange()) {
            currentValue = this.config.values[index];
        } else {
            currentValue = this.config.value;
        }
        
        // 값 +1 (최대값 초과 방지)
        const newValue = Math.min(this.valueMax(), currentValue + 1);
        
        if (this.isRange()) {
            this.config.values[index] = this.trimAlignValue(newValue);
        } else {
            this.config.value = this.trimAlignValue(newValue);
        }
        
        this.updateValue();
        this._element.dispatchEvent(
            new CustomEvent("change", {
                detail: {
                    index: index,
                    value: newValue,
                    values: this.isRange() ? this.config.values : [newValue],
                },
            })
        );
    }
    
    handleDoubleTap() {
        // 더블터치 시 activeHandle이 null일 수 있으므로 lastTapHandle 사용
        const handle = this.activeHandle || this.lastTapHandle;
        if (!handle) return;
        
        let index = handle.classList.contains("end") ? 1 : 
                    (handle.classList.contains("start") ? 0 : 0);
        
        let currentValue;
        if (this.isRange()) {
            currentValue = this.config.values[index];
        } else {
            currentValue = this.config.value;
        }
        
        // 값 -1 (최소값 미만 방지)
        const newValue = Math.max(this.valueMin(), currentValue - 1);
        
        if (this.isRange()) {
            this.config.values[index] = this.trimAlignValue(newValue);
        } else {
            this.config.value = this.trimAlignValue(newValue);
        }
        
        this.updateValue();
        this._element.dispatchEvent(
            new CustomEvent("change", {
                detail: {
                    index: index,
                    value: newValue,
                    values: this.isRange() ? this.config.values : [newValue],
                },
            })
        );
    }

    handleTouchMove(e) {
        if (!this.activeHandle) return;
        
        // 드래그 감지: 5px 이상 이동하면 드래그로 간주
        if (!this.isDragging) {
            let currentPosition;
            if (e.touches && e.touches[0]) {
                currentPosition = {x: e.touches[0].pageX, y: e.touches[0].pageY};
            } else {
                currentPosition = {x: e.pageX, y: e.pageY};
            }
            
            const moveDistance = Math.sqrt(
                Math.pow(currentPosition.x - this.touchStartPosition.x, 2) + 
                Math.pow(currentPosition.y - this.touchStartPosition.y, 2)
            );
            
            if (moveDistance > 5) {
                this.isDragging = true;
            }
        }
        
        // 드래그 중이면 슬라이더 값 업데이트
        if (this.isDragging) {
            let position;
            if (e.touches && e.touches[0]) {
                position = {x: e.touches[0].pageX, y: e.touches[0].pageY};
            } else {
                position = {x: e.pageX, y: e.pageY};
            }
            let normValue = this.normalizeValue(position);
            let index = this.activeHandle.classList.contains("end") ? 1 : 
                        (this.activeHandle.classList.contains("start") ? 0 : 0);

            this.slide(e, index, normValue);
            if (e.cancelable) {
                e.preventDefault();
            }
        }
        
        return true;
    }

    normalizeValue(position) {
        return this.normValueFromTouch(position);
    }

    normValueFromTouch(position) {
        let pixelTotal, pixelTouch, percentTouch, valuetotal, valueTouch;

        if (this.orientation === "horizontal") {
            pixelTotal = this.elementSize.width;
            pixelTouch = position.x - this.elementOffset.left;
        } else {
            pixelTotal = this.elementSize.height;
            pixelTouch = position.y - this.elementOffset.top;
        }

        percentTouch = pixelTouch / pixelTotal;

        if (percentTouch > 1) percentTouch = 1;
        if (percentTouch < 0) percentTouch = 0;

        if (this.orientation === "vertical") {
            percentTouch = 1 - percentTouch;
        }

        valuetotal = this.valueMax() - this.valueMin();
        valueTouch = this.valueMin() + valuetotal * percentTouch;

        return this.trimAlignValue(valueTouch);

    }

    slide(e, index, newVal) {
        let otherVal;
        let currentValue = this.value();
        let newValues = this.values();

        if (this.isRange()) {
            otherVal = this.values(index ? 0 : 1);
            currentValue = this.values(index);

            if (this.config.values.length === 2 && this.config.range === true) {
                newVal = index === 0 ? Math.min(otherVal, newVal) : Math.max(otherVal, newVal);
            }

            newValues[index] = newVal;
        }

        if (newVal === currentValue) return;

        if (this.isRange()) {
            this.values(index, newVal);
            this._element.dispatchEvent(
                new CustomEvent(this.EVENT_CHANGE, {
                    detail: {
                        val: newVal,
                        vals: this.values(),
                    }
                })
            );

        } else {
            this.value(newVal);
            this._element.dispatchEvent(
                new CustomEvent(this.EVENT_CHANGE, {
                    detail: {
                        val: newVal,
                    }
                })
            );
        }


        this._element.dispatchEvent(
            new CustomEvent("slide", {
                detail: {
                    index: index,
                    value: newVal,
                    values: this.values(),
                }
            })
        );
    }

    isRange() {
        return this.config.range === true;
    }

    hasValueArray() {
        return Array.isArray(this.config.valueArray);
    }

    value(newValue) {
        if (arguments.length) {
            this.config.value = this.trimAlignValue(newValue);
            this.updateValue();
            return;
        }
        return this.trimAlignValue(this.config.value);
    }

    values(index, newValue) {
        let vals, newValues, i;
        if (arguments.length > 1) {
            if (!this.config.values) {
                this.config.values = [this.valueMin(), this.valueMax()];
            }
            this.config.values[index] = this.trimAlignValue(newValue);
            this.updateValue();
            return;
        }

        if (arguments.length === 1) {
            if (Array.isArray(index)) {
                vals = this.config.values || [this.valueMin(), this.valueMax()];
                newValues = index;
                for (i = 0; i < vals.length && i < newValues.length; i++) {
                    vals[i] = this.trimAlignValue(newValues[i]);
                }
                this.updateValue();
            } else {
                if (this.isRange()) {
                    if (!this.config.values) {
                        this.config.values = [this.valueMin(), this.valueMax()];
                    }
                    return this.config.values[index];
                }
                return this.value();
            }
        } else {
            if (this.isRange()) {
                if (!this.config.values) {
                    this.config.values = [this.valueMin(), this.valueMax()];
                }
                return this.config.values;
            }
            return [this.value()];
        }
    }


    setValue(values) {
        this.values(0, values[0]);
        this.values(1, values[1]);
    }

    valueMin() {
        return this.config.min;
    }
    valueMax() {
        return this.max || this.config.max;
    }
    
    max() {
        return this.max || this.config.max;
    }

    updateValue() {
        let valPercent, value, valueMin, valueMax;

        if (this.isRange()) {
            // values 배열이 없거나 유효하지 않으면 초기화
            if (!this.config.values || !Array.isArray(this.config.values) || this.config.values.length < 2) {
                this.config.values = [this.valueMin(), this.valueMax()];
            }
            
            Array.from(this.handles).forEach((handle, i) => {
                value = this.config.values[i];
                valueMin = this.valueMin();
                valueMax = this.valueMax();
                valPercent = valueMax !== valueMin ? ((value - valueMin) / (valueMax - valueMin)) * 100 : 0;
                
                if (i === 0) {
                    this._element.style.setProperty("--fill-start-percent", `${valPercent}%`);
                    setAriaAttrubute(this.handles[1], "valuemin", value);
                }
                if (i === 1) {
                    this._element.style.setProperty("--fill-end-percent", `${valPercent}%`);
                    setAriaAttrubute(this.handles[0], "valuemax", value);
                }
                setAriaAttrubute(handle, "valuenow", value);
            });
        } else {
            // value가 설정되지 않았으면 기본값 사용
            if (this.config.value === undefined || this.config.value === null) {
                value = this.valueMin();
            } else {
                value = this.config.value;
            }
            
            valueMin = this.valueMin();
            valueMax = this.valueMax();
            valPercent = valueMax !== valueMin ? ((value - valueMin) / (valueMax - valueMin)) * 100 : 0;

            this._element.style.setProperty("--fill-percent", `${valPercent}%`);
            setAriaAttrubute(this.handles[0], "valuenow", value);

            this._element.style.setProperty("--fill-percent-min", `${(valueMin / valueMax) * 100}%`);
        }

        if (this.config.showTooltip) {
            if (this.config.tooltipRange) {
                // 범위값 모드
                let firstValue, endValue, endValuePercent;
                
                if (this.isRange()) {
                    // 범위 슬라이더인 경우
                    if (this.config.values && this.config.values.length >= 2) {
                        firstValue = this.config.values[0];
                        endValue = this.config.values[1];
                    } else {
                        firstValue = this.valueMin();
                        endValue = this.valueMax();
                    }
                    // tooltip 위치를 end 값의 위치로 설정
                    valueMin = this.valueMin();
                    valueMax = this.valueMax();
                    endValuePercent = valueMax !== valueMin ? ((endValue - valueMin) / (valueMax - valueMin)) * 100 : 0;
                    this._element.style.setProperty("--fill-percent", `${endValuePercent}%`);
                } else {
                    // 단일 슬라이더인데 tooltipRange가 true인 경우
                    // 첫번째 값은 0으로 고정
                    firstValue = 0;
                    endValue = value;
                    // tooltip 위치는 현재 value 위치 사용 (이미 위에서 설정됨)
                }
                
                // 첫번째 값 포맷팅
                let firstValueText;
                if (!this.hasValueArray()) {
                    firstValueText = amountFormat(firstValue) + this.config.unit + "  -";
                } else {
                    firstValueText = this.config.valueArray[firstValue] + this.config.unit + "  -";
                }
                
                // 마지막 값 포맷팅
                let endValueText;
                if (!this.hasValueArray()) {
                    endValueText = amountFormat(endValue) + this.config.unit;
                } else {
                    endValueText = this.config.valueArray[endValue] + this.config.unit;
                }
                
                if (this._tooltipFirst) {
                    this._tooltipFirst.textContent = firstValueText;
                }
                if (this._tooltipEnd) {
                    this._tooltipEnd.textContent = endValueText;
                }
            } else {
                // 단일값 모드
                let valueText;
                if (!this.hasValueArray()) {
                    valueText = amountFormat(value) + this.config.unit;
                } else {
                    valueText = this.config.valueArray[value] + this.config.unit;
                }
                
                if (this._tooltipEnd) {
                    this._tooltipEnd.textContent = valueText;
                }
            }
        }

        if (this._linkedForm !== null) {
            const formValue = this.isRange() ? this.config.values[0] : this.config.value;
            this._linkedForm.value = formValue;
            let uiForm = getParentsByClass(this._linkedForm, "ui-form");
            let uiFormInstance = null;
            if (uiForm !== null) {
                if(UIEvent.UIForm.getInstance("#testForm") !== null) {
                    setTimeout(() => {
                        uiFormInstance = UIEvent.UIForm.getInstance("#testForm");
                        uiFormInstance.update();
                    }, 500);
                }   else {
                    uiFormInstance = new UIEvent.UIForm("#testForm");
                    uiFormInstance.update();
                }
            }
        }
    }

    trimAlignValue(val) {
        if (val <= this.valueMin()) {
            return this.valueMin();
        }
        if (val >= this.valueMax()) {
            return this.valueMax();
        }
        let step = this.config.step > 0 ? this.config.step : 1,
            valModStep = (val - this.valueMin()) % step;
        let alignValue = val - valModStep;

        if (Math.abs(valModStep) * 2 >= step) {
            alignValue += valModStep > 0 ? step : -step;
        }
        return parseFloat(alignValue.toFixed(5));
    }
}

// UI 네임스페이스 생성 및 Slider 등록
if (typeof window.UI === 'undefined') {
    window.UI = {};
}

window.UI.Slider = Slider;

function SliderApply (elements) {

    let targetElements = null;

    if (typeof elements === "undefined") {
        targetElements = document.querySelectorAll(".ui-slider:not(.multi-slider):not(.ui-widget)");
    } else if (typeof elements === "object" && typeof elements.length === "number") {
        targetElements = elements;
    } else if (typeof elements === "string") {
        targetElements = document.querySelectorAll(elements);
    } else {
        return false;
    }
        
}


window.addEventListener("load", () => {
    // SliderApply();
});


const index  = {
    Slider,
    SliderApply
}
