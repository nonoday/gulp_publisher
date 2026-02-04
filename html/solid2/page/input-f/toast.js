
// 헬퍼 함수들
function appendHtml(element, html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    while (temp.firstChild) {
        element.appendChild(temp.firstChild);
    }
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
        
        // 기존 토스트가 있으면 제거 (토스트는 1개만 표시)
        // 단, 기존 토스트가 로딩 중이면 제거하지 않음 (로딩은 수동으로만 숨김)
        const existingToast = document.getElementById("solid-toast-popup");
        if (existingToast) {
            // 기존 토스트가 로딩 중인지 확인 (is-loading 클래스로 확인)
            const isExistingLoading = existingToast.querySelector('.icon.is-loading') !== null;
            if (!isExistingLoading) {
                existingToast.remove();
            } else {
                // 로딩 중인 토스트가 있으면 새로 생성하지 않고 기존 것을 유지
                // 생성은 완료하되, 실제 DOM 조작은 하지 않음
                this.toast = existingToast;
                return;
            }
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
        const id = "solid-toast-popup";
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
            const topOffset = 12;
            const hasTop = this.config.top !== "" && this.config.top !== null && this.config.top !== undefined;
            const topPx = hasTop ? Number(this.config.top) : null;
            
            if (hasTop && Number.isFinite(topPx)) {
                // top 값이 있는 경우
                if (align === "center") {
                    this.toast.style.transform = `translateX(-50%) translateY(calc(-100% - ${topPx}px))`;
                } else {
                    this.toast.style.transform = `translateY(calc(-100% - ${topPx}px))`;
                }
            } else {
                // top 값이 없는 경우 (기본)
                if (align === "center") {
                    this.toast.style.transform = `translateX(-50%) translateY(calc(-100% - ${topOffset}px))`;
                } else {
                    this.toast.style.transform = `translateY(calc(-100% - ${topOffset}px))`;
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
    updateMessage(newMessage, options = {}) {
        if (!this.toast) {
            return;
        }
        
        // DOM에서 요소가 여전히 존재하는지 확인
        if (!document.body.contains(this.toast)) {
            return;
        }
        
        // 메시지 업데이트
        const innerElement = this.toast.querySelector('.inner');
        if (innerElement) {
            innerElement.innerHTML = newMessage;
        }
        
        // 옵션이 있으면 아이콘 영역 업데이트
        if (options.iconClass !== undefined || options.loading !== undefined) {
            const iconElement = this.toast.querySelector('.icon');
            
            // config 업데이트
            if (options.loading !== undefined) {
                this.config.loading = options.loading;
            }
            if (options.iconClass !== undefined) {
                this.config.iconClass = options.iconClass;
            }
            
            const iconClass = (typeof this.config.iconClass === "string" ? this.config.iconClass.trim() : "");
            const shouldShowIcon = this.config.loading || iconClass;
            
            if (shouldShowIcon) {
                // 아이콘 영역이 없으면 생성
                if (!iconElement) {
                    const iconDiv = document.createElement('div');
                    iconDiv.className = 'icon';
                    if (innerElement && innerElement.parentNode) {
                        innerElement.parentNode.insertBefore(iconDiv, innerElement);
                    }
                }
                
                // 아이콘 영역 업데이트
                const iconEl = this.toast.querySelector('.icon');
                if (iconEl) {
                    // 클래스 초기화 및 재설정
                    iconEl.className = 'icon';
                    
                    if (this.config.loading) {
                        iconEl.classList.add('is-loading');
                        iconEl.innerHTML = '<span class="solid-toast-spinner" aria-hidden="true"></span>';
                    } else if (iconClass) {
                        iconEl.classList.add(iconClass);
                        iconEl.innerHTML = '';
                    } else {
                        iconEl.innerHTML = '';
                    }
                }
            } else {
                // 아이콘 영역 제거
                if (iconElement) {
                    iconElement.remove();
                }
            }
        }
    }
  
}
