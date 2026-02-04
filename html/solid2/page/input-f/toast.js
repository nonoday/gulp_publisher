
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
                shape: "", // 기본 모양, 옵션 주면 해당 클래스 추가 = 기본, rounded
                iconClass: "" // 아이콘 영역에 추가할 CSS 클래스명(예: "ic-check"), 없으면 아이콘 미노출
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
        // 아이콘 클래스 추가 (옵션)
        let iconClass = (typeof this.config.iconClass === "string" ? this.config.iconClass.trim() : "");

        html += `<div class="solid-toast-popup ${this.config.align}${colorClass}${shapeClass}" id="${id}">`;
        
        // 아이콘 영역: 로딩 또는 iconClass 옵션이 있을 때만 노출
        if (this.config.loading || iconClass) {
            const extraIconClass = iconClass ? ` ${iconClass}` : "";
            const loadingClass = this.config.loading ? " is-loading" : "";
            // 로딩 모드일 경우 CSS 스피너 마크업 삽입
            const iconContent = this.config.loading ? `<span class="solid-toast-spinner" aria-hidden="true"></span>` : "";
            html += `<div class="icon${loadingClass}${extraIconClass}">${iconContent}</div>`;
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
        if (!this.toast) {
            return;
        }

        // 이미 DOM에서 제거된 경우
        if (!document.body || !document.body.contains(this.toast)) {
            this.toast = null;
            return;
        }

        const toastEl = this.toast;
        const align = this.config.align || "center";

        // transitionend가 발생하지 않는 환경을 대비한 fallback 제거 타이머
        const fallbackMs = 500;
        const fallbackTimer = setTimeout(() => {
            try {
                toastEl.remove();
            } finally {
                if (this.toast === toastEl) {
                    this.toast = null;
                }
            }
        }, fallbackMs);

        const onEnd = () => {
            clearTimeout(fallbackTimer);
            try {
                toastEl.remove();
            } finally {
                if (this.toast === toastEl) {
                    this.toast = null;
                }
            }
        };

        if (align === "center") {
            toastEl.style.transform = "translateX(-50%) translateY(0)";
        } else {
            toastEl.style.transform = "translateY(0)";
        }

        toastEl.addEventListener("transitionend", onEnd, { once: true });
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
