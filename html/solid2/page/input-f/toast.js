

class BaseComponent {
    constructor(element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        this._element = element;
    }
}

class SolidToast extends BaseComponent {
    constructor(config) {
        this.config = {
            ... {
                message: "",
                align: "center",
                top: "",
                loading: false,
                color: "black", // "black" (기본) 또는 "white"
                shape: "" // 기본 모양, 옵션 주면 해당 클래스 추가
            },
            ...(typeof config === "object" ? config : {}),
        };

        if (this.config.message === "") {
            throw new Error("message is required");
        }
    
        if (this.config.message.indexOf("<br>") > -1 || this.config.message.indexOf("<br />") > -1) {
            this.config.align = "left"; 
        }   
        
        this._createHtml();
        this.show();
    
        // 로딩 모드가 아닐 때만 자동으로 숨김
        if (!this.config.loading) {
            const delay = this.toast.clientHeight < 50 ? 2000 : 3500;
        
            this.toast.addEventListener(
                "transitionend",
                () => {
                    setTimeout(() => {
                        this.hide();
                    }, delay);
                },
                {once: true}
            )
        }

    }


    static get NAME() {
        return "toast";
    }

    _createHtml() {
        let id = `toast-${generateRandomCode(4)}`;
        let html = "";

        // 색상 클래스 추가
        let colorClass = this.config.color === "white" ? " white" : "";
        // 모양 클래스 추가
        let shapeClass = this.config.shape ? ` ${this.config.shape}` : "";

        html += `<div class="solid-toast-popup ${this.config.align}${colorClass}${shapeClass}" id="${id}">`;
        
        // 로딩 모드일 때 icon div 추가
        if (this.config.loading) {
            html += `<div class="icon">로띠</div>`;
        }
        
        html += `<div class="inner">${this.config.message}</div>`;
        html += `</div>`;

        appendHtml(document.body, html);
        this.toast = document.getElementById(id);
    }

    show() {
        setTimeout(() => {
            if (`${this.config.top}`) {
                this.toast.style.transform = `translateY(calc(-100% -${this.config.top}px))`;
            } else {
                this.toast.style.transform = "translateY(calc(-100% - 12px)) translateX(-50%)";
            }
        }, 10);
    }
    hide() {
        this.toast.style.transform = "translateY(0)";
        this.toast.addEventListener(
            "transitionend",
            () => {
                this.toast.remove();
            },
            {once: true}
        )
    }

    // 메시지 업데이트 함수
    updateMessage(newMessage) {
        if (this.toast) {
            const innerElement = this.toast.querySelector('.inner');
            if (innerElement) {
                innerElement.innerHTML = newMessage;
            }
        }
    }
  
}


const index  = {
    toast
}
