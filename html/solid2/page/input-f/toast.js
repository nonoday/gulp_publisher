
// 헬퍼 함수들
function appendHtml(element, html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    while (temp.firstChild) {
        element.appendChild(temp.firstChild);
    }
}

function generateRandomCode(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

class SolidToast {
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

        if (!document.body) {
            return;
        }
        
        appendHtml(document.body, html);
        this.toast = document.getElementById(id);
    }

    show() {
        if (!this.toast) {
            return;
        }
        
        setTimeout(() => {
            if (!this.toast) {
                return;
            }
            
            const align = this.config.align || "center";
            const topOffset = this.config.top ? `${this.config.top}px` : "12px";
            
            if (`${this.config.top}`) {
                // top 값이 있는 경우
                if (align === "center") {
                    this.toast.style.transform = `translateX(-50%) translateY(calc(-100% -${this.config.top}px))`;
                } else {
                    this.toast.style.transform = `translateY(calc(-100% -${this.config.top}px))`;
                }
            } else {
                // top 값이 없는 경우 (기본)
                if (align === "center") {
                    this.toast.style.transform = `translateX(-50%) translateY(calc(-100% - ${topOffset}))`;
                } else {
                    this.toast.style.transform = `translateY(calc(-100% - ${topOffset}))`;
                }
            }
        }, 10);
    }
    hide() {
        const align = this.config.align || "center";
        if (align === "center") {
            this.toast.style.transform = "translateX(-50%) translateY(0)";
        } else {
            this.toast.style.transform = "translateY(0)";
        }
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
        if (!this.toast) {
            return;
        }
        
        // DOM에서 요소가 여전히 존재하는지 확인
        if (!document.body.contains(this.toast)) {
            return;
        }
        
        const innerElement = this.toast.querySelector('.inner');
        if (innerElement) {
            innerElement.innerHTML = newMessage;
        }
    }
  
}
