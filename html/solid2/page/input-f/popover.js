// BaseComponent 클래스 정의 (기존 구조와 호환)
class BaseComponent {
    constructor(element) {
        this.element = element;
    }
}

// SolidTooltip 클래스 정의
class Popover extends BaseComponent {
    
    constructor(element) {


        if(getElemnet(element).classList.contains("initiated")) {
            return {};
        }

        super(element);
        
   
        // 기본 속성 설정
        this._triggerBtnId = element.id;
        this._popverId = getAriaAttribute(element, "desribedby");
        this._tooltipText = element.dataset.tooltipText;
        this._tooltipPos = element.dataset.tooltipPos;
        this._tooltipType = element.dataset.tooltipType;
        this._popverClose = element.dataset.popverClose;
        
                
       this._createHtml();
    }

    static get NAME() {
        return "popover";
    }
    
    _createHtml() {
        const html = `
         <div class="tooltip type-${this._tooltipType} pos-${this._tooltipPos}" id="${this._popoverId}">
            <div class="tooltip-content">
                ${this._tooltipText}
                <button class="tooltip-btn-close" type="button" aria-label="툴팁 닫기">
                    <svg 
                        xmlns="http://www.w3.org/200/svg"
                        width="17"
                        height="16"
                        viewBox="0 0 17 16"
                        fill="none"
                    >
                        <path
                            d="M13.4979 12.3365L12.8377 12.9967L3.50445 3.66343L4.1646 3.00328L13.4979 12.3365Z"
                            fill="currentColor"
                        />
                        <path
                            d="M12.8362 3.00336L13.4963 3.66351L4.16308 12.9968L3.50293 12.3366L12.8362 3.00336Z"
                            fill="currentColor"
                        />
                    </svg>
                </button>
            </div>
            <div class="tooltip-arrow">
            </div>
        </div>
        `;

        appendHtml(document.body, html);
        this._popover = document.getElementById(this._popoverId);

        if (this._popverClose === "auto") {
            this._popover.classList.add("popover-close");
            this._popover.addEventListener("animationend", () => {
                this._popover.hidden = true;
            })
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
