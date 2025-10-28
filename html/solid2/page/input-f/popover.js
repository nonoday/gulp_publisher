// BaseComponent 클래스 정의 (기존 구조와 호환)
class BaseComponent {
    constructor(element) {
        this.element = element;
    }
}

// Helper functions
function getAriaAttribute(el, attribute) {
    return el.getAttribute(`aria-${attribute}`) || '';
}

// Popover 클래스 정의
class Popover extends BaseComponent {
    
    constructor(element) {
        if(element.classList.contains("initiated")) {
            return {};
        }

        super(element);
        
        // 기본 속성 설정
        this._triggerBtnId = element.id;
        this._popoverId = getAriaAttribute(element, "describedby");
        this._tooltipText = element.dataset.tooltipText || "";
        this._tooltipPos = element.dataset.tooltipPos || "top";
        this._tooltipType = element.dataset.tooltipType || "popover";
        this._popoverClose = element.dataset.popoverClose || element.dataset.popverClose || "auto";
        this._tooltipOffsetX = 0;
        this._tooltipOffsetY = 0;
        this._arrowOffsetX = 0;
        this._arrowOffsetY = 0;
        this._isVisible = false;
        
        this._triggerElement = element;
        this._popoverElement = document.getElementById(this._popoverId);
        this._arrowElement = this._popoverElement ? this._popoverElement.querySelector('.tooltip-arrow') : null;
        
        // 초기 상태 설정
        if (this._popoverElement) {
            this._popoverElement.style.position = 'fixed';
            this._popoverElement.style.display = 'none';
        }
        
        this._setupEventListeners();
    }

    static get NAME() {
        return "popover";
    }
    
    _setupEventListeners() {
        // 트리거 클릭 이벤트
        if (this._triggerElement) {
            this._triggerElement.addEventListener('click', () => {
                this.toggle();
            });
        }
        
        // 닫기 버튼 이벤트
        const closeBtn = this._popoverElement ? this._popoverElement.querySelector('.tooltip-btn-close') : null;
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide();
            });
        }
        
        // 외부 클릭 이벤트
        document.addEventListener('click', (e) => {
            if (this._isVisible && 
                !this._popoverElement.contains(e.target) && 
                this._triggerElement !== e.target) {
                this.hide();
            }
        });
    }
    
    _calculateAndApplyPosition() {
        if (!this._popoverElement || !this._triggerElement) return;
        
        const [basePosition, alignment] = this._tooltipPos.split('-');
        
        // 툴팁 위치 계산
        this._positionTooltip(basePosition);
        
        // 화살표 위치 계산
        this._positionArrow(basePosition, alignment);
    }
    
    _positionTooltip(basePosition) {
        const triggerRect = this._triggerElement.getBoundingClientRect();
        const popoverRect = this._popoverElement.getBoundingClientRect();
        
        // viewport 기준으로 계산 (popover가 body 바로 아래에 있으므로)
        const triggerSize = 20;
        const triggerCenterX = triggerRect.left + triggerRect.width / 2;
        const triggerCenterY = triggerRect.top + triggerRect.height / 2;
        
        let top, left;
        
        // 정렬 정보 가져오기
        const [, alignment] = this._tooltipPos.split('-');
        
        switch (basePosition) {
            case 'top':
                // popover는 trigger 아래에 표시
                top = triggerRect.bottom + 10 + this._tooltipOffsetY;
                
                if (alignment === 'left') {
                    left = triggerRect.left + this._tooltipOffsetX;
                } else if (alignment === 'center' || alignment === 'middle') {
                    left = triggerCenterX - popoverRect.width / 2 + this._tooltipOffsetX;
                } else if (alignment === 'right') {
                    left = triggerRect.right - popoverRect.width + this._tooltipOffsetX;
                }
                break;
                
            case 'bottom':
                // popover는 trigger 위에 표시
                top = triggerRect.top - popoverRect.height - 24 + this._tooltipOffsetY;
                
                if (alignment === 'left') {
                    left = triggerRect.left + this._tooltipOffsetX;
                } else if (alignment === 'center' || alignment === 'middle') {
                    left = triggerCenterX - popoverRect.width / 2 + this._tooltipOffsetX;
                } else if (alignment === 'right') {
                    left = triggerRect.right - popoverRect.width + this._tooltipOffsetX;
                }
                break;
                
            case 'right':
                // popover는 trigger 왼쪽에 표시
                left = triggerRect.left - popoverRect.width - triggerSize * 2;
                
                if (alignment === 'top') {
                    top = triggerRect.top + this._tooltipOffsetY;
                } else if (alignment === 'center' || alignment === 'middle') {
                    top = triggerCenterY - popoverRect.height / 2 + this._tooltipOffsetY;
                } else if (alignment === 'bottom') {
                    top = triggerRect.bottom - popoverRect.height + this._tooltipOffsetY;
                }
                break;
                
            case 'left':
                // popover는 trigger 오른쪽에 표시
                left = triggerRect.right + triggerSize + this._tooltipOffsetX;
                
                if (alignment === 'top') {
                    top = triggerRect.top + this._tooltipOffsetY;
                } else if (alignment === 'center' || alignment === 'middle') {
                    top = triggerCenterY - popoverRect.height / 2 + this._tooltipOffsetY;
                } else if (alignment === 'bottom') {
                    top = triggerRect.bottom - popoverRect.height + this._tooltipOffsetY;
                }
                break;
        }
        
        this._popoverElement.style.top = `${top}px`;
        this._popoverElement.style.left = `${left}px`;
    }
    
    _positionArrow(basePosition, alignment) {
        if (!this._arrowElement) return;
        
        const svgElement = this._arrowElement.querySelector('svg');
        if (!svgElement) return;
        
        // 화살표 컨테이너 스타일 초기화
        this._arrowElement.style.cssText = `
            position: absolute;
            width: 18px;
            height: 9px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        // SVG 스타일 초기화
        svgElement.style.cssText = `
            width: 18px;
            height: 9px;
            transition: transform 0.2s ease;
        `;
        
        // 화살표 방향에 따른 스타일 설정
        switch (basePosition) {
            case 'top':
                svgElement.style.transform = `rotate(0deg)`;
                this._arrowElement.style.top = '-9px';
                
                if (alignment === 'left') {
                    this._arrowElement.style.left = `${16 + this._arrowOffsetX}px`;
                    this._arrowElement.style.transform = `translateX(0)`;
                } else if (alignment === 'center' || alignment === 'middle') {
                    this._arrowElement.style.left = `50%`;
                    this._arrowElement.style.transform = `translateX(calc(-50% + ${this._arrowOffsetX}px))`;
                } else if (alignment === 'right') {
                    this._arrowElement.style.right = `${16 - this._arrowOffsetX}px`;
                    this._arrowElement.style.transform = `translateX(0)`;
                }
                break;
                
            case 'bottom':
                svgElement.style.transform = `rotate(180deg)`;
                this._arrowElement.style.bottom = '-9px';
                
                if (alignment === 'left') {
                    this._arrowElement.style.left = `${16 + this._arrowOffsetX}px`;
                    this._arrowElement.style.transform = `translateX(0)`;
                } else if (alignment === 'center' || alignment === 'middle') {
                    this._arrowElement.style.left = `50%`;
                    this._arrowElement.style.transform = `translateX(calc(-50% + ${this._arrowOffsetX}px))`;
                } else if (alignment === 'right') {
                    this._arrowElement.style.right = `${16 - this._arrowOffsetX}px`;
                    this._arrowElement.style.transform = `translateX(0)`;
                }
                break;
                
            case 'left':
                svgElement.style.transform = `rotate(270deg)`;
                this._arrowElement.style.left = '-13px';
                
                if (alignment === 'top') {
                    this._arrowElement.style.top = `${16 - this._arrowOffsetY}px`;
                    this._arrowElement.style.transform = `translateY(0)`;
                } else if (alignment === 'center' || alignment === 'middle') {
                    this._arrowElement.style.top = `50%`;
                    this._arrowElement.style.transform = `translateY(calc(-50% + ${this._arrowOffsetY}px))`;
                } else if (alignment === 'bottom') {
                    this._arrowElement.style.bottom = `${16 + this._arrowOffsetY}px`;
                    this._arrowElement.style.transform = `translateY(0)`;
                }
                break;
                
            case 'right':
                svgElement.style.transform = `rotate(90deg)`;
                this._arrowElement.style.right = '-13px';
                
                if (alignment === 'top') {
                    this._arrowElement.style.top = `${16 - this._arrowOffsetY}px`;
                    this._arrowElement.style.transform = `translateY(0)`;
                } else if (alignment === 'center' || alignment === 'middle') {
                    this._arrowElement.style.top = `50%`;
                    this._arrowElement.style.transform = `translateY(calc(-50% + ${this._arrowOffsetY}px))`;
                } else if (alignment === 'bottom') {
                    this._arrowElement.style.bottom = `${16 + this._arrowOffsetY}px`;
                    this._arrowElement.style.transform = `translateY(0)`;
                }
                break;
        }
    }
    
    show() {
        if (!this._popoverElement) return;
        
        this._isVisible = true;
        this._popoverElement.style.display = 'block';
        this._popoverElement.classList.remove('popover-close');
        
        // 위치 계산
        this._calculateAndApplyPosition();
    }
    
    hide() {
        if (!this._popoverElement || !this._isVisible) return;
        
        this._isVisible = false;
        this._popoverElement.classList.add('popover-close');
        
        setTimeout(() => {
            if (!this._isVisible) {
                this._popoverElement.style.display = 'none';
            }
        }, 200);
    }
    
    toggle() {
        if (this._isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
}

const PopoverApply = (elements) => {
    let targetElements = null;

    if (typeof elements == "undefined") {
        targetElements = document.querySelectorAll("[data-tooltip-type='popover']");
    } else if (typeof elements === "object" && typeof elements.length === "number") {
        targetElements = elements;
    } else if (typeof elements === "string") {
        targetElements = document.querySelectorAll(elements);
    } else {
        return false;
    }

    Object.values(targetElements).map((element) => {
        new Popover(element);
    });
};

window.addEventListener("load", () => {
    PopoverApply();
})
