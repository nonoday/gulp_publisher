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
        this._heightActionId = 0;
        element._accordionInstance = this;
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
            if (this._element.classList.contains("is-animating")) return;

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
        const actionId = ++this._heightActionId;

        const currentHeight = wrap.getBoundingClientRect().height;

        wrap.style.overflow = "hidden";
        wrap.style.display = "block";
        wrap.style.height = currentHeight > 0 ? currentHeight + "px" : "0px";
        setAriaAttribute(this._accoTitleWrap, "expanded", true);
        wrap.removeAttribute("hidden");

        this._heightFrame = requestAnimationFrame(() => {
            if (actionId !== this._heightActionId) return;

            this._heightFrame = null;
            const content = this._accoContent || wrap;
            let height = content.scrollHeight;                
            wrap.style.height = height + "px";
            wrap.dispatchEvent(new CustomEvent("accordion:opened", { bubbles: true }));
        });

        this._onceHeightTransition(function() {
            if (actionId !== element._accordionInstance._heightActionId) return;
            if (!element.classList.contains("on")) return;

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

       this._cancelHeightTransition();
       const actionId = ++this._heightActionId;

       const currentHeight = wrap.getBoundingClientRect().height || wrap.scrollHeight;

       setAriaAttribute(this._accoTitleWrap, "expanded", false);
       wrap.style.overflow = "hidden";
       wrap.style.display = "block";
       wrap.removeAttribute("hidden");
       wrap.style.height = currentHeight + "px";
       
       wrap.offsetHeight;

       this._heightFrame = requestAnimationFrame(() => {
        if (actionId !== this._heightActionId) return;

        this._heightFrame = null;
        wrap.style.height = "0px";
       });

       this._onceHeightTransition(function() {           
           if (actionId !== element._accordionInstance._heightActionId) return;
           if (element.classList.contains("on")) return;

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
        const parentNode = this._element;
        if (!parentNode) return;

        const willOpen = this._isAccordionControl ? !!isOpen : !parentNode.classList.contains("on");

        this._element.classList.add("is-animating");
        this._isScroll = isScroll;

        const _closeFn = () => {
            parentNode.classList.remove("on");
            this._setCloseHeight();
            this._isScrollArmed = false;
        };

        const _openFn = () => {
            parentNode.classList.add("on");
            this._setHeight();
        };

        if(!this._isAccordionControl) {
            if(willOpen && this._isNotice) {
                this._isScrollArmed = true;
            }

            if (willOpen) {
                _openFn();
            } else {
                _closeFn();
            }
        } else {
            if(willOpen) {
                _openFn();
            } else {
                _closeFn();
            }

            return willOpen ? false : true;
        }
    }
}
