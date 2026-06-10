class BaseComponent {
    constructor(element) {
        // 문자열 셀렉터로 들어오면 실제 DOM 요소로 변환.
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        this._element = element;
    }
}

class SolidAccordion extends BaseComponent {
    constructor(element) {
        element = getElement(element);
        
        if (!element) {
            return {};
        }

        // 이미 만든 인스턴스가 있으면 중복 이벤트 바인딩 방지.
        if(element.classList.contains("initiated")) {
            if (element._accordionInstance) {
                return element._accordionInstance;
            }

            element.classList.remove("initiated");
        }

        super(element);

        if(element.classList.contains("accordion-notice")) this._initNotice = true;

        if(getDataAttribute(element, "accordion-control")) this._isAccordionControl = true;

        this._element = element;
        this._accoTitleWrap = element.querySelector(".acco-title-wrap");
        this._accoContentWrap = element.querySelector(".acco-content-wrap");
        this._isActive = true;
        this._isScrollArmed = false;
        this._isScroll = true;
        this._accoContent = element.querySelector(".acco-content");
        this._heightTransitionCleanup = null;
        this._heightFrame = null;
        this._pendingToggle = null;
        element._accordionInstance = this;
        element.classList.add("initiated");

        // 처음부터 열린 상태인 경우 현재 콘텐츠 높이에 맞춰 세팅.
        if (element.classList.contains("on")) {
            this._setHeight();
        } 

        this._init();
        this._eventBind();
        this._bindResize();

    }

    _bindResize() {
        let timer = null;
        let prevWidth = window.innerWidth;

        // 가로폭 변경 시 열린 아코디언 높이 재계산.
        window.addEventListener("resize", () => {
            const currentWidth = window.innerWidth;
            if (currentWidth !== prevWidth) {
                clearTimeout(timer);
                timer = setTimeout(() => {
                    if (this._element.classList.contains("on")) {
                        this._setHeight();
                    }
                }, 100);
            }
        });
    }

    _scroll() {
        if (!this._isScroll) return;

        const ae = document.activeElement;
        // 입력 중에는 자동 스크롤 생략.
        if (ae && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA" || ae.isContentEditabled)) return;

        if(this._element.closest('[role="tabpanel"]')) {
            // 탭 활성화 직후 첫 스크롤 방지.
            if(this._isActive) {
                this._isActive = false;
                return;
            }
        }

        const rect = this._accoTitleWrap.getBoundingClientRect();
        const targetY = rect.top + window.pageYOffset;

        window.scrollTo({
            top: targetY,
            behavior: "smooth"
        });

    }

    _init() {

        const mutationObserver = new MutationObserver(mutations => {
            // 닫힌 상태나 애니메이션 중에는 높이 보정 생략.
            if (!this._element.classList.contains("on")) return;
            if (this._element.classList.contains("is-animating")) return;

            mutationObserver.disconnect();

            let needUpdate = false;
            for (const mutation of mutations) {
                // 스크립트가 wrapper에 직접 쓰는 style 변경은 observer 루프 방지용으로 제외.
                if (
                    mutation.type === "attributes" &&
                    mutation.attributeName === "style" &&
                    mutation.target === this._accoContentWrap
                ) {
                    continue;
                }

                if (
                    mutation.type === "childList" ||
                    mutation.type === "characterData" ||
                    mutation.type === "attributes" && mutation.attributeName === "style"
                ) {
                    needUpdate = true;
                    break;
                }
            }

            if (needUpdate) {
                // 콘텐츠 변경으로 높이가 달라진 경우 열린 높이 보정.
                this._setHeight();
            }

            setTimeout(() => {
                mutationObserver.observe(this._element, this._observeConfig);
            }, 100);
        });

        this._observeConfig = {
            childList: true,
            attributes: true,
            characterData: true,
            subtree: true
        };
        
        mutationObserver.observe(this._element, this._observeConfig);

        this.mutationObserver = mutationObserver;
    }

    _setHeight() {
        const element = this._element;
        let wrap = this._accoContentWrap;
        if (!wrap) return;

        // 이전 높이 transition/frame 정리 후 새 열림 애니메이션 시작.
        this._cancelHeightTransition();

        const currentHeight = wrap.getBoundingClientRect().height;

        wrap.style.overflow = "hidden";
        wrap.style.display = "block";
        wrap.style.height = currentHeight > 0 ? currentHeight + "px" : "0px";
        setAriaAttribute(this._accoTitleWrap, "expanded", true);
        wrap.removeAttribute("hidden");

        this._heightFrame = requestAnimationFrame(() => {
            this._heightFrame = null;
            const content = this._accoContent || wrap;
            // 다음 프레임에서 실제 콘텐츠 높이로 변경해 height transition 유도.
            let height = content.scrollHeight;                
            wrap.style.height = height + "px";
            wrap.dispatchEvent(new CustomEvent("accordion:opened", { bubbles: true }));
        });

        this._onceHeightTransition(function() {
            // 열림 완료 후 내부 스크롤 가능 상태로 복구.
            if (wrap.style.height !== "0px") {
                wrap.style.overflow = "auto";
            }

            element?.classList.remove('is-animating');
        });
    }

    _setCloseHeight() {
        const element = this._element;
        let wrap = this._accoContentWrap;
        if (!wrap) return;

       // 현재 보이는 높이를 시작점으로 닫힘 애니메이션 구성.
       this._cancelHeightTransition();

       const currentHeight = wrap.getBoundingClientRect().height || wrap.scrollHeight;

       setAriaAttribute(this._accoTitleWrap, "expanded", false);
       wrap.style.overflow = "hidden";
       wrap.style.display = "block";
       wrap.removeAttribute("hidden");
       wrap.style.height = currentHeight + "px";
       
       wrap.offsetHeight;

       this._heightFrame = requestAnimationFrame(() => {
        this._heightFrame = null;
        // 다음 프레임에서 0px로 변경해 닫힘 transition 실행.
        wrap.style.height = "0px";
       });

       this._onceHeightTransition(function() {           
           // 닫힘 완료 후 레이아웃과 접근성 트리에서 제외.
           wrap.style.overflow = "hidden";
           wrap.style.display = "none";
           wrap.setAttribute("hidden", true);
            element?.classList.remove('is-animating');
       });
    }

    _cancelHeightTransition() {
        // 빠른 클릭 시 이전 transition 완료 대기와 예약 frame 정리.
        if (this._heightTransitionCleanup) {
            this._heightTransitionCleanup();
            this._heightTransitionCleanup = null;
        }

        if (this._heightFrame) {
            cancelAnimationFrame(this._heightFrame);
            this._heightFrame = null;
        }
    }

    _onceHeightTransition(callback) {
        const wrap = this._accoContentWrap;
        if (!wrap) {
            callback();
            return;
        }

        let completed = false;
        const done = () => {
            if (completed) return;
            completed = true;
            wrap.removeEventListener("transitionend", onEnd);
            clearTimeout(timer);
            this._heightTransitionCleanup = null;
            callback();
        };

        const onEnd = (event) => {
            // 자식 transition 이벤트는 무시하고 wrapper height transition만 처리.
            if (event.target !== wrap) return;
            if (event.propertyName && event.propertyName !== "height") return;
            done();
        };

        // transitionend 누락 대비 fallback timer.
        const timer = setTimeout(done, this._getHeightTransitionTime(wrap) + 50);
        wrap.addEventListener("transitionend", onEnd);

        this._heightTransitionCleanup = () => {
            if (completed) return;
            completed = true;
            wrap.removeEventListener("transitionend", onEnd);
            clearTimeout(timer);
        };
    }

    _getHeightTransitionTime(element) {
        // CSS transition-duration / delay 기준으로 fallback 시간 계산.
        const style = window.getComputedStyle(element);
        const durations = style.transitionDuration.split(",").map(this._toMilliseconds);
        const delays = style.transitionDelay.split(",").map(this._toMilliseconds);
        const times = durations.map((duration, index) => duration + (delays[index] || delays[0] || 0));
        return Math.max(...times, 0);
    }

    _toMilliseconds(value) {
        value = value.trim();
        if (value.endsWith("ms")) return parseFloat(value) || 0;
        if (value.endsWith("s")) return (parseFloat(value) || 0) * 1000;
        return 0;
    }


    static get NAME() {
        return "SolidAccordion";
    }

    _eventBind() {
        if(!this._isAccordionControl) {
            // 일반 아코디언은 타이틀 클릭으로 열림/닫힘 토글.
            this._handleTitleClick = () => this.openContent();
            this._accoTitleWrap.addEventListener("click", this._handleTitleClick);
        }

        this._accoContentWrap.addEventListener("transitionend", (e) => {
            // notice 타입에서 열림 완료 후 스크롤 처리.
            if (e.target !== this._accoContentWrap) return;
            if (e.propertyName !== "height") return;

            if (!this._isNotice) return;
            if (!this._isScrollArmed) return;
            if (!this._isScroll) return;

            this._isScrollArmed = false;

            this._scroll();
        });

        if(this._element.closest('[role="tabpanel"]')) {
            const tabpanel = this._element.closest('[role="tabpanel"]');

            tabpanel?.addEventListener("tabActivated", (e) => {
                // 탭 재활성화 시 열린 아코디언의 첫 스크롤 생략 플래그 복구.
                requestAnimationFrame(() => {
                    tabpanel?.querySelectorAll('.accordion-area').forEach((el) => {
                        if (el.classList.contains("on")) {
                            this._isActive = true;
                        }
                    })
                });
            });
        }
    }

    openContent(isOpen, isScroll = true) {
        const parentNode = this?._accoTitleWrap?.closest(".accordion-area");
        if (!parentNode) return;

        const willOpen = !parentNode.classList.contains("on");

        this._element.classList.add("is-animating");
        this._isScroll = isScroll;

        const _closeFn = () => {
            // 상태 클래스를 먼저 닫힘으로 바꾸고 현재 높이에서 0px로 transition.
            parentNode.classList.remove("on");
            this._setCloseHeight();
            this._isScrollArmed = false;
        };

        const _openFn = () => {
            // 상태 클래스를 먼저 열림으로 바꾸고 콘텐츠 높이까지 transition.
            parentNode.classList.add("on");
            this._setHeight();
        };

        if(!this._isAccordionControl) {
            if(willOpen && this._isNotice) {
                this._isScrollArmed = true;
            }

            if (parentNode.classList.contains("on")) {
                _closeFn();
            } else {
                _openFn();
            }
        } else {
            if(!isOpen) {
                _closeFn();
            } else {
                _openFn();
            }

            return isOpen ? false : true;
        }
    }
}
