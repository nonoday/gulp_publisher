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
        
        if(getElement(element).classList.contains("initiated")) {
            return {};
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
        element.classList.add("initiated");

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
        if (ae && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA" || ae.isContentEditabled)) return;

        if(this._element.closest('[role="tabpanel"]')) {
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
            if (!this._element.classList.contains("on")) return;

            mutationObserver.disconnect();

            let needUpdate = false;
            for (const mutation of mutations) {
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

        this._cancelHeightTransition();

        const currentHeight = wrap.getBoundingClientRect().height;

        wrap.style.overflow = "hidden";
        wrap.style.display = "block";
        wrap.style.height = currentHeight > 0 ? currentHeight + "px" : "0px";
        setAriaAttribute(this._accoTitleWrap, "expanded", true);
        wrap.removeAttribute("hidden");

        // 탭 패널 상태 확인 (로깅용)
        const panel = wrap.closest('[role="tabpanel"]');
        const isPanelHidden = panel && panel.hidden;
        const panelComputedStyle = panel ? getComputedStyle(panel) : null;
        const isPanelDisplayNone = panelComputedStyle && panelComputedStyle.display === 'none';

        // 높이 계산 및 설정 (재시도 없음)
        requestAnimationFrame(() => {
            const content = this._accoContent || wrap;
            let height = content.scrollHeight;                
            wrap.style.height = height + "px";
            wrap.dispatchEvent(new CustomEvent("accordion:opened", { bubbles: true }));
        });


        wrap.addEventListener("transitionend", function onStart() {
            
            if (wrap.style.height !== "0px") {
                wrap.style.overflow = "auto"
            }
            wrap.removeEventListener("transitionend", onStart);          
        });

        this._onceHeightTransition(function() {
            element?.classList.remove('is-animating');
        });
    }

    _setCloseHeight() {
        const element = this._element;
        let wrap = this._accoContentWrap;
        if (!wrap) return;

       this._cancelHeightTransition();

       const currentHeight = wrap.getBoundingClientRect().height || wrap.scrollHeight;

       setAriaAttribute(this._accoTitleWrap, "expanded", false);
       wrap.style.overflow = "hidden";
       wrap.style.display = "block";
       wrap.removeAttribute("hidden");
       wrap.style.height = currentHeight + "px";
       
       wrap.offsetHeight;

       requestAnimationFrame(() => {
        wrap.style.height = "0px";
       });

       this._onceHeightTransition(function() {           
           wrap.style.overflow = "hidden";
           wrap.style.display = "none";
           wrap.setAttribute("hidden", true);
            element?.classList.remove('is-animating');
       });
    }

    _cancelHeightTransition() {
        if (this._heightTransitionCleanup) {
            this._heightTransitionCleanup();
            this._heightTransitionCleanup = null;
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
            if (event.target !== wrap) return;
            if (event.propertyName && event.propertyName !== "height") return;
            done();
        };

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
            this._handleTitleClick = () => this.openContent();
            this._accoTitleWrap.addEventListener("click", this._handleTitleClick);
        }

        this._accoContentWrap.addEventListener("transitionend", (e) => {
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
         const parentNode = this?._accoTitleWrap?.closest(".accordion-area")         
         const willOpen = !parentNode.classList.contains("on");

         this._element.classList.add("is-animating");

         this._isScroll = isScroll;

         const _closeFn = () => {
            parentNode.classList.remove("on");
            this._setCloseHeight();
            this._isScrollArmed = false;
         }

         const _openFn = () => {
            parentNode.classList.add("on");
            this._setHeight();
         }
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
