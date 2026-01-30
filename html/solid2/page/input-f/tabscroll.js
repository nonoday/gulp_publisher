/**
 * SolidBasicTabs 사용법
 * 
 * 1. 인스턴스 가져오기
 *    const container = document.querySelector('.ui-basic-tab');
 *    const basicTabs = container._basicTabsInstance; // 자동 초기화된 경우
 *    // 또는 직접 생성:
 *    const basicTabs = new SolidBasicTabs(container);
 * 
 * 2. activateTab(tabElement, focus) - 탭을 활성화하고 선택적으로 포커스 설정
 *    예시:
 *    const tabElement = document.querySelector('#tab1-1');
 *    basicTabs.activateTab(tabElement); // 포커스 없이 활성화
 *    basicTabs.activateTab(tabElement, true); // 포커스와 함께 활성화
 * 
 * 3. setDefaultTab(id) - 기본적으로 보여지는 탭 설정 (id로 설정)
 *    예시:
 *    basicTabs.setDefaultTab('tab1-1'); // depth1 탭 설정
 *    basicTabs.setDefaultTab('sub-tab1-1'); // depth2 탭 설정 (해당 depth1도 자동 활성화)
 * 
 * 4. setTabsTitle(id, value) - 원하는 탭 버튼 텍스트 변경
 *    예시:
 *    basicTabs.setTabsTitle('tab1-1', '새로운 탭 이름');
 *    basicTabs.setTabsTitle('sub-tab1-1', '새로운 서브 탭 이름');
 * 
 * 5. setTabDisabled(id, isDisabled) - 원하는 탭 버튼 disabled 처리
 *    예시:
 *    basicTabs.setTabDisabled('tab1-1', true); // 탭 비활성화
 *    basicTabs.setTabDisabled('tab1-1', false); // 탭 활성화
 * 
 * 6. resetDepth2(targetId) - depth2 탭을 첫 번째 탭으로 초기화
 *    예시:
 *    basicTabs.resetDepth2(); // 현재 활성화된 depth2를 첫 번째 탭으로 초기화
 *    basicTabs.resetDepth2('sub1'); // 특정 depth2 그룹을 첫 번째 탭으로 초기화
 * 
 * 7. HTML에서 depth2 자동 초기화 옵션 설정
 *    <div class="ui-basic-tab" data-reset-depth2="true">
 *        <!-- depth1 탭 클릭 시 해당 depth2가 자동으로 첫 번째 탭으로 초기화됩니다 -->
 *    </div>
 */


class BaseComponent {
    constructor(element) {
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
        
        // .on 클래스가 있으면 열린 상태, 없으면 닫힌 상태로 초기화
        if (element.classList.contains("on")) {
            this._setHeight();
        } else {
            // .on 클래스가 없으면 닫힌 상태로 확실히 설정
            this._accoContentWrap.hidden = true;
            this._accoContentWrap.style.display = "none";
            this._accoContentWrap.style.height = "0px";
            this._accoContentWrap.style.overflow = "hidden";
            setAriaAttribute(this._accoTitleWrap, "expanded", false);
        }

        this._init();
        this._eventBind();
        this._bindResize();
        
        // 인스턴스를 요소에 저장 (재초기화 시 참조용)
        element._accordionInstance = this;
        element.classList.add("initiated");
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
        const wrap = this._accoContentWrap;
        if(!wrap) return;

        wrap.style.overflow = "hidden";
        wrap.style.display = "block";
        wrap.style.height = "0px";
        setAriaAttribute(this._accoTitleWrap, "expanded", true);
        wrap.removeAttribute("hidden");

        requestAnimationFrame(() => {
            const content = this._accoContent || wrap;
            const height = content.scrollHeight;

            wrap.style.height = height + "px";
            wrap.dispatchEvent(new CustomEvent("accordion:opened", { bubbles: true }));
        });


        wrap.addEventListener("transitionend", function onStart(e) {
            if (e.target !== wrap || e.propertyName !== "height") return;
            
            if (wrap.style.maxHeight !== "0px") {
                wrap.style.overflow = "auto";
            }
            
            // 아코디언이 열린 후 내부 탭 초기화 (패널이 hidden 상태가 아닐 때만)
            const panel = wrap.closest('[role="tabpanel"]');
            if (!panel || !panel.hidden) {
                requestAnimationFrame(() => {
                    const tabsContainers = wrap.querySelectorAll(".ui-basic-tab");
                    if (tabsContainers.length > 0) {
                        try {
                            SolidTabsUpdate(tabsContainers);
                        } catch (err) {
                            console.warn("Failed to update tabs in accordion:", err);
                        }
                    }
                });
            }
            
            wrap.removeEventListener("transitionend", onStart);
        });

        wrap.addEventListener('transitionstart', function() {
            element.classList.remove('is-animating')
        }, { once: true });
    }

    _setCloseHeight() {
        const element = this._element;
        const wrap = this._accoContentWrap;
        if(!wrap) return;

       setAriaAttribute(this._accoTitleWrap, "expanded", false);
       wrap.setAttribute("hidden", true);

       requestAnimationFrame(() => {
        wrap.style.height = "0px";
       });

       wrap.addEventListener("transitionend", function onEnd() {
        wrap.style.overflow = "hidden";
        wrap.style.display = "none";
        wrap.removeEventListener("transitionend", onEnd);
       });

       wrap.addEventListener('transitionsEnd', function() {
        element.classList.remove('is-animating')
       }, { once: true });
    }


    static get NAME() {
        return "SolidAccordion";
    }

    _eventBind() {
        if(!this._isAccordionControl) {
            this._accoTitleWrap.addEventListener("click", (e) => {
                e.preventDefault();
                this.openContent();
            });
        }

        this._accoContentWrap.addEventListener("transitionend", (e) => {
            if (e.target === this._accoContentWrap) return;
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
                    // 탭 패널이 활성화될 때 아코디언 상태 확인 및 재초기화
                    if (!tabpanel.hidden) {
                        // .on 클래스가 있으면 열린 상태로 설정
                        if (this._element.classList.contains("on")) {
                            if (this._accoContentWrap.hidden || this._accoContentWrap.style.display === "none") {
                                this._setHeight();
                            }
                            this._isActive = true;
                        } else {
                            // .on 클래스가 없으면 닫힌 상태로 설정
                            if (!this._accoContentWrap.hidden && this._accoContentWrap.style.display !== "none") {
                                this._setCloseHeight();
                            }
                            this._isActive = false;
                        }
                    }
                });
            });
        }
    }

    openContent(isOpen, isScroll = true) {
         if (!this._accoTitleWrap) return;
         
         const parentNode = this._accoTitleWrap.closest(".accordion-area");
         if (!parentNode) return;
         
         const willOpen = !parentNode.classList.contains("on");

         if(this._element.classList.contains("is-animating")) return;
         this._element.classList.add("is-animating");

         this._isScroll = isScroll;

         const  _closeFn = () => {
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
            if (parentNode.classList.contains("on")) {
                _closeFn();
            } else {
                _openFn();
            }
            return;
         }  else {
            if (!isOpen) {
                _closeFn();
            } else {
                _openFn();
            }
            return isOpen ? false : true;
         }    
    }
}

/**
 * 스크롤 네비게이션 버튼(이전/다음)을 자동으로 추가하는 독립적인 클래스
 * 특정 클래스를 가진 요소에 이전/다음 버튼을 추가하여 스크롤 기능을 제공합니다.
 */
class ScrollNavigation {
    constructor(container, options = {}) {
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }
        
        if (!container) {
            console.warn('ScrollNavigation: 컨테이너를 찾을 수 없습니다.');
            return;
        }

        // 이미 초기화된 경우 중복 방지
        if (container.dataset.scrollNavInit === "true") {
            return;
        }

        this.container = container;
        this.options = {
            wrapClass: options.wrapClass || this._getWrapClass(container),
            prevButtonClass: options.prevButtonClass || 'scroll-nav prev',
            nextButtonClass: options.nextButtonClass || 'scroll-nav next',
            scrollDistance: options.scrollDistance || 0.7, // 화면 너비의 비율
            ...options
        };

        this.prevBtn = null;
        this.nextBtn = null;
        this.wrap = null;

        this._init();
    }

    static get NAME() {
        return "ScrollNavigation";
    }

    /**
     * wrap 클래스 결정 (depth 구분 없이 통일)
     */
    _getWrapClass(container) {
        return "scroll-nav-wrap";
    }

    /**
     * 초기화
     */
    _init() {
        // wrap 생성 또는 찾기
        this._setupWrap();

        // scroll-nav-wrap에 is-arrow 클래스가 없으면 동작하지 않음
        if (!this.wrap) {
            return;
        }

        // 컨테이너를 relative로 설정 (wrap이 있을 때만)
        const containerStyle = getComputedStyle(this.container);
        if (containerStyle.position === "static") {
            this.container.style.position = "relative";
        }

        // 버튼 생성 및 추가
        this._setupButtons();

        // 이벤트 바인딩
        this._bindEvents();

        // 초기 상태 업데이트
        requestAnimationFrame(() => this._updateState());

        // 초기화 완료 표시 및 인스턴스 저장
        this.container.dataset.scrollNavInit = "true";
        this.container._scrollNavigation = this;
    }

    /**
     * wrap 요소 찾기 (생성하지 않음)
     */
    _setupWrap() {
        // 이미 wrap이 있는지 확인 (부모에서 찾기)
        this.wrap = this.container.closest("." + this.options.wrapClass);

        if (!this.wrap) {
            // wrap이 없으면 부모 요소를 wrap으로 사용
            this.wrap = this.container.parentElement;
            if (this.wrap && !this.wrap.classList.contains(this.options.wrapClass)) {
                // 부모가 wrap 클래스를 가지고 있지 않으면 null로 설정
                this.wrap = null;
            }
        }
        
        // scroll-nav-wrap에 is-arrow 클래스가 없으면 동작하지 않음
        if (this.wrap && !this.wrap.classList.contains("is-arrow")) {
            this.wrap = null;
        }
    }

    /**
     * 이전/다음 버튼 생성 및 추가
     */
    _setupButtons() {
        if (!this.wrap) return;
        
        // _setupWrap()에서 이미 is-arrow 체크를 했으므로 여기서는 불필요
        // prev/next 버튼이 이미 있는지 확인
        this.prevBtn = this.wrap.querySelector("." + this.options.prevButtonClass.split(' ')[0] + ".prev");
        this.nextBtn = this.wrap.querySelector("." + this.options.nextButtonClass.split(' ')[0] + ".next");

        // 버튼을 삽입할 기준 요소 찾기
        // - 우선: ScrollNavigation이 붙은 실제 컨테이너(대개 [role="tablist"])
        // - fallback: 기존 마크업(.ui-scroll-tab) 또는 wrap 내부 첫 tablist
        const depthElement =
            this.container ||
            this.wrap.querySelector(".ui-scroll-tab") ||
            this.wrap.querySelector("[role='tablist']");

        if (!depthElement) return;

        if (!this.prevBtn) {
            this.prevBtn = this._createButton("prev");
            // wrap에 직접 추가 (depth1/depth2 뒤에)
            if (depthElement.nextSibling) {
                this.wrap.insertBefore(this.prevBtn, depthElement.nextSibling);
            } else {
                this.wrap.appendChild(this.prevBtn);
            }
        }

        if (!this.nextBtn) {
            this.nextBtn = this._createButton("next");
            // prev 버튼이 있으면 그 뒤에, 없으면 depthElement 뒤에 추가
            if (this.prevBtn && this.prevBtn.nextSibling) {
                this.wrap.insertBefore(this.nextBtn, this.prevBtn.nextSibling);
            } else if (this.prevBtn) {
                this.wrap.appendChild(this.nextBtn);
            } else if (depthElement.nextSibling) {
                this.wrap.insertBefore(this.nextBtn, depthElement.nextSibling);
            } else {
                this.wrap.appendChild(this.nextBtn);
            }
        }
    }

    /**
     * 버튼 생성
     */
    _createButton(direction) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = direction === "prev" ? this.options.prevButtonClass : this.options.nextButtonClass;
        button.setAttribute("aria-hidden", "true");
        button.dataset.scrollNav = direction;
        button.textContent = direction === "prev" ? "이전" : "다음";
        return button;
    }

    /**
     * 이벤트 바인딩
     */
    _bindEvents() {
        // 버튼 클릭 이벤트
        if (this.prevBtn) {
            // 기존 이벤트 리스너 제거 후 추가 (중복 방지)
            const newPrevBtn = this.prevBtn.cloneNode(true);
            this.prevBtn.parentNode.replaceChild(newPrevBtn, this.prevBtn);
            this.prevBtn = newPrevBtn;
            this.prevBtn.addEventListener("click", () => this._scroll(-1));
        }

        if (this.nextBtn) {
            // 기존 이벤트 리스너 제거 후 추가 (중복 방지)
            const newNextBtn = this.nextBtn.cloneNode(true);
            this.nextBtn.parentNode.replaceChild(newNextBtn, this.nextBtn);
            this.nextBtn = newNextBtn;
            this.nextBtn.addEventListener("click", () => this._scroll(1));
        }

        // 스크롤 이벤트
        const update = () => this._updateState();
        const scrollHandler = this.container._scrollNavUpdateHandler;
        if (scrollHandler) {
            this.container.removeEventListener("scroll", scrollHandler, { passive: true });
        }
        this.container._scrollNavUpdateHandler = update;
        this.container.addEventListener("scroll", update, { passive: true });

        // 리사이즈 이벤트
        const resizeHandlers = window._scrollNavResizeHandlers || (window._scrollNavResizeHandlers = new Map());
        if (!resizeHandlers.has(this.container)) {
            const resizeUpdate = () => this._updateState();
            resizeHandlers.set(this.container, resizeUpdate);
            window.addEventListener("resize", resizeUpdate);
        }
    }

    /**
     * 스크롤 실행
     */
    _scroll(direction) {
        // 스크롤 가능한 영역이 없으면 동작하지 않음
        const max = this.container.scrollWidth - this.container.clientWidth;
        if (max <= 0) {
            return;
        }

        const distance = Math.round(window.innerWidth * this.options.scrollDistance);
        if (distance <= 0) return;

        const target = Math.max(0, Math.min(this.container.scrollLeft + direction * distance, max));
        // 실제로 스크롤할 필요가 없으면 동작하지 않음 (1px 이상 차이가 있어야 함)
        if (Math.abs(target - this.container.scrollLeft) < 1) {
            return;
        }

        // 스크롤 동작 중 클래스 추가
        this.container.classList.add("scroll-nav-active");

        requestAnimationFrame(() => {
            this.container.scrollTo({ left: target, behavior: "smooth" });
            // 스크롤 완료 후 클래스 제거
            setTimeout(() => {
                this.container.classList.remove("scroll-nav-active");
            }, 500);
        });
    }

    /**
     * 버튼 상태 업데이트
     */
    _updateState(force = false) {
        if (!this.prevBtn || !this.nextBtn) return;
        
        // wrap이 숨겨져 있으면 상태 업데이트하지 않음 (force가 true이면 강제 업데이트)
        if (!force && this.wrap && getComputedStyle(this.wrap).display === "none") {
            return;
        }

        const max = this.container.scrollWidth - this.container.clientWidth;
        if (max <= 0) {
            this.prevBtn.style.display = "none";
            this.nextBtn.style.display = "none";
            this.container.classList.remove("depth-prev", "depth-next", "scroll-nav-active");
            return;
        }

        const left = this.container.scrollLeft;
        const tolerance = 1; // 스크롤 위치 허용 오차

        // prev 버튼: 왼쪽 끝에 있으면 숨김
        if (left <= tolerance) {
            this.prevBtn.style.display = "none";
            this.container.classList.remove("depth-prev");
        } else {
            this.prevBtn.style.display = "block";
            this.container.classList.add("depth-prev");
        }

        // next 버튼: 오른쪽 끝에 있으면 숨김
        if (left >= max - tolerance) {
            this.nextBtn.style.display = "none";
            this.container.classList.remove("depth-next");
        } else {
            this.nextBtn.style.display = "block";
            this.container.classList.add("depth-next");
        }
    }

    /**
     * 스크롤 네비게이션이 동작 중인지 확인 (스크롤 가능한 상태인지)
     */
    isActive() {
        if (!this.container) return false;
        const max = this.container.scrollWidth - this.container.clientWidth;
        return max > 0;
    }

    /**
     * 네비게이션 버튼 숨김 처리
     */
    hideNavigation() {
        if (this.prevBtn) {
            this.prevBtn.style.display = "none";
        }
        if (this.nextBtn) {
            this.nextBtn.style.display = "none";
        }
    }

    /**
     * 네비게이션 버튼 표시 복원
     */
    showNavigation() {
        if (this.isActive()) {
            this._updateState();
        }
    }

    /**
     * 정적 메서드: 특정 클래스를 가진 모든 요소에 스크롤 네비게이션 추가
     */
    static init(selector, options = {}) {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
            if (element.dataset.scrollNavInit !== "true") {
                new ScrollNavigation(element, options);
            }
        });
    }
}


const SolidTabsUpdate = (elements) => {
    let scrollTabsElements = [];
    let scrollspyTabsElements = [];

    try {
        if(typeof elements == "undefined") {
            scrollTabsElements = Array.from(document.querySelectorAll(".ui-basic-tab"));
            scrollspyTabsElements = Array.from(document.querySelectorAll(".ui-scrollspy"));
        } else if(typeof elements == "object" && elements !== null) {
            // NodeList, HTMLCollection, 또는 배열인지 확인
            if (typeof elements.length == "number") {
                Array.from(elements).forEach((el) => {
                    if (el && el.classList) {
                        if (el.classList.contains("ui-basic-tab")) {
                            scrollTabsElements.push(el);
                        } else if (el.classList.contains("ui-scrollspy")) {
                            scrollspyTabsElements.push(el);
                        }
                    }
                });
            }
        } else if(typeof elements == "string") {
            const targets = document.querySelectorAll(elements);
            Array.from(targets).forEach((el) => {
                if (el && el.classList) {
                    if (el.classList.contains("ui-basic-tab")) {
                        scrollTabsElements.push(el);
                    } else if (el.classList.contains("ui-scrollspy")) {
                        scrollspyTabsElements.push(el);
                    }
                }
            });
        } else {
            return false;
        }
    } catch (e) {
        console.warn("SolidTabsUpdate: Error processing elements:", e);
        return false;
    }

    // scrollTabsElements 처리
    if (scrollTabsElements && scrollTabsElements.length > 0) {
        scrollTabsElements.forEach((tabElement) => {
            try {
                let scrollInstance = SolidBasicTabs.getInstance(tabElement);
                if(scrollInstance === null) {
                    tabElement.classList.remove("initiated");
                    scrollInstance = new SolidBasicTabs(tabElement);
                }
                if(scrollInstance && typeof scrollInstance._initDepth1 === "function") {
                    scrollInstance._initDepth1();
                }
            } catch (e) {
                console.warn("Failed to update basic tabs:", e);
            }
        });
    }
    // scrollspyTabsElements가 있고 scrollspyTabs가 정의되어 있을 때만 처리
    if (scrollspyTabsElements && scrollspyTabsElements.length > 0) {
        // scrollspyTabs가 정의되어 있는지 확인
        if (typeof scrollspyTabs === "undefined" || scrollspyTabs === null) {
            // scrollspyTabs가 없으면 경고만 출력하고 계속 진행
            console.warn("scrollspyTabs is not defined, skipping scrollspy tabs update");
        } else {
            Object.values(scrollspyTabsElements).forEach((tabElement) => {
                let scrollspyInstance = null;
                try {
                    if (typeof scrollspyTabs.getInstance === "function") {
                        scrollspyInstance = scrollspyTabs.getInstance(tabElement);
                    }
                    if(scrollspyInstance === null) {
                        tabElement.classList.remove("initiated");
                        scrollspyInstance = new scrollspyTabs(tabElement);
                    }
                    // _update 메서드가 있는지 확인 후 호출
                    if(scrollspyInstance && typeof scrollspyInstance._update === "function") {
                        scrollspyInstance._update();
                    } else if (scrollspyInstance) {
                        // _update 메서드가 없으면 경고만 출력하고 계속 진행
                        console.warn("scrollspyInstance._update is not a function, instance:", scrollspyInstance);
                    }
                } catch (e) {
                    console.warn("Failed to update scrollspy tabs:", e);
                }
            });
        }
    }
}

// getElement 헬퍼 함수
function getElement(element) {
    if (typeof element === 'string') {
        return document.querySelector(element);
    }
    return element;
}

class SolidBasicTabs extends BaseComponent {
    
    constructor(element) {
        const el = getElement(element);
        
        // 이미 초기화된 경우 중복 초기화 방지
        if(el && el.dataset.basicTabsInitialized === "true") {
            // 이미 저장된 인스턴스 반환
            return el._basicTabsInstance || {};
        }

        super(element);

        this._element = el || element;
        this._indicatorUpdateTimer = null; // indicator 업데이트 타이머 관리
        
        // HTML에서 옵션 읽기: data-reset-depth2 속성으로 depth2 탭 초기화 옵션 설정
        this._resetDepth2OnTabChange = this._element.dataset.resetDepth2 === "true";

        this._initDepth1();
        
    }

    static get NAME() {
        return "SolidBasicTabs";
    }

    static getInstance(element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        return element?._basicTabsInstance || null;
    }

    /**
     * depth1 탭 초기화 메서드
     * - 탭 목록, 패널 목록 설정
     * - 인디케이터 생성 (solid-text-tabs, solid-chip-tabs 제외)
     * - 스크롤 네비게이션 설정
     * - 초기 활성 탭 설정
     *   - 아코디언 안에 있는 경우: aria-selected='true'가 있는 탭만 활성화 (없으면 활성화하지 않음)
     *   - 아코디언 밖에 있는 경우: aria-selected='true'가 있으면 그것을, 없으면 첫 번째 탭 활성화
     *   - 아코디언이 닫혀있으면 transitionend 이벤트를 기다렸다가 활성화
     */
    _initDepth1() {
        this._scrollWrap = this._element.querySelector(":scope >.scroll-nav-wrap");
        this._depth1 = this._element.querySelector(":scope > [role='tablist'], :scope > .scroll-nav-wrap > [role='tablist']");
        this._depth2 = this._element.querySelector(".sub-tabs-list");

        if(!this._depth1) return;

        this._tabs = this._depth1.querySelectorAll(".solid-tab");
        // 1뎁스 패널만 선택 (panel-list의 직접 자식만, 2뎁스 패널은 제외)
        const panelList = this._element.querySelector(":scope > .panel-list");
        if (panelList) {
            // 직접 자식만 선택 (2뎁스 패널 제외)
            this._panels = Array.from(panelList.children).filter(child => 
                child.getAttribute("role") === "tabpanel"
            );
        } else {
            this._panels = [];
        }
        
        // solid-text-tabs 또는 solid-chip-tabs 클래스가 있으면 인디케이터 생성하지 않음
        const hasTextTabsClass = this._element.classList.contains("solid-text-tabs");
        const hasChipTabsClass = this._element.classList.contains("solid-chip-tabs");
        const shouldSkipIndicator = hasTextTabsClass || hasChipTabsClass;
        
        // tab-indicator가 없으면 자동으로 생성 (solid-text-tabs 또는 solid-chip-tabs가 아닌 경우만)
        if (!shouldSkipIndicator) {
            this._indicator = this._depth1.querySelector(".tab-indicator");
            if (!this._indicator) {
                this._indicator = document.createElement("span");
                this._indicator.className = "tab-indicator";
                this._depth1.appendChild(this._indicator);
            }
        } else {
            this._indicator = null;
        }

        if(!this._tabs.length) return;

        // 초기 상태: 모든 탭을 hidden 처리
        this._tabs.forEach((t) => {
            t.hidden = true;
        });

        // 스크롤 네비게이션은 항상 설정
        this._setupScrollNav(this._depth1);
        this._setupAllDepth2ScrollNav();
        if (this._scrollWrap?.classList.contains("is-extend")) {
            this._setupScrollExtend(this._depth1)
        }

        // indicator 기능 활성화 (solid-text-tabs 또는 solid-chip-tabs가 아닌 경우만)
        this._dept1EventBind();
        if (!shouldSkipIndicator) {
            this._bindResize();
            this._bindScroll();
        }
        
        //초기활성화
        // 아코디언 안에 있는지 확인
        const accordionContentWrap = this._element.closest('.acco-content-wrap');
        
        // 활성 탭 찾기: aria-selected='true'가 있으면 우선 사용, 없으면 아코디언이 아닌 경우에만 첫 번째 탭 사용
        let activeTab = this._element.querySelector(".solid-tab[aria-selected='true']") || (accordionContentWrap ? null : this._tabs[0]);

        
        if (activeTab) {
            if (accordionContentWrap) {
                // 아코디언이 열려있는지 확인
                const isAccordionOpen = () => {
                    const computedStyle = getComputedStyle(accordionContentWrap);
                    const display = computedStyle.display;
                    const height = computedStyle.height;
                    const inlineDisplay = accordionContentWrap.style.display;
                    const inlineHeight = accordionContentWrap.style.height;
                    
                    const finalDisplay = inlineDisplay || display;
                    const finalHeight = inlineHeight || height;
                    
                    return finalDisplay !== 'none' && 
                           finalHeight !== '0px' && 
                           finalHeight !== '0' &&
                           finalHeight !== '';
                };
                
                // 아코디언이 이미 열려있으면 바로 활성화
                if (isAccordionOpen()) {
                    if (!shouldSkipIndicator) {
                        this._initIndicator(activeTab);
                    }
                    this._activateDepth1Tab(activeTab);
                } else {
                    // 아코디언이 닫혀있으면 transitionend 이벤트를 기다림
                    const transitionEndHandler = (e) => {
                        if (e.propertyName === 'height' || e.propertyName === 'max-height') {
                            if (isAccordionOpen()) {
                                if (!shouldSkipIndicator) {
                                    this._initIndicator(activeTab);
                                }
                                this._activateDepth1Tab(activeTab);
                            }
                        }
                    };
                    accordionContentWrap.addEventListener('transitionend', transitionEndHandler, { once: true });
                }
            } else {
                // 아코디언 안에 없으면 바로 활성화
                if (!shouldSkipIndicator) {
                    this._initIndicator(activeTab);
                }
                this._activateDepth1Tab(activeTab);
            }
        } else {
            // 초기 활성 탭이 없어도 모든 scroll-nav-wrap은 숨김 처리
            const subTabsList = this._element.querySelector(".sub-tabs-list");
            const scrollNavWraps = subTabsList ? subTabsList.querySelectorAll(".scroll-nav-wrap") : [];
            scrollNavWraps.forEach((wrap) => {
                wrap.style.display = "none";
            });
            // 1뎁스 탭 케이스의 경우 모든 패널 숨김
            const panelList = this._element.querySelector(".panel-list");
            if (panelList && !this._depth2) {
                const allPanels = Array.from(panelList.children);
                allPanels.forEach((panel) => {
                    panel.hidden = true;
                });
            }
        }
    }

    _bindResize() {
        let timer = null;

        let prevWidth = window.innerWidth;

        window.addEventListener("resize", () => {
            if(!this._indicator) return;

            const currentWidth = window.innerWidth;

            if(currentWidth !== prevWidth) {
                clearTimeout(timer);
                timer = setTimeout(() => {
                    const tab = Array.from(this._tabs).find(
                        (t) => t.getAttribute("aria-selected") === "true"
                    ) || this._tabs[0];

                    if (!tab) return;

                    this._initIndicator(tab);
                }, 100);
                prevWidth = currentWidth;
            }
        });
    }

    _bindScroll() {
        if (!this._indicator || !this._depth1) return;

        this._depth1.addEventListener("scroll", () => {
            if (!this._indicator) return;

            // 스크롤 중에도 indicator 위치를 실시간으로 업데이트
            requestAnimationFrame(() => {
                const activeTab = Array.from(this._tabs).find(
                    (t) => t.getAttribute("aria-selected") === "true"
                );
                if (activeTab) {
                    this._moveDepth1Indicator(activeTab);                    // indicator 위치 업데이트
                    if (this._depth1 && this._depth1._scrollNavigation) {
                        this._depth1._scrollNavigation._updateState();
                    }                                                                  // 스크롤 네비게이션 상태 업데이트
                }
            });
        });
    }

    _initIndicator(tab) {
        if (!this._indicator || !tab) return;

        // transition을 임시로 제거하여 즉시 위치 설정
        this._indicator.style.transition = "none";

        requestAnimationFrame(() => {0
            if (!tab || !tab.parentNode) return;

            if(this._defaultTab) tab = this._defaultTab;
            
            // 리사이즈 시에는 즉시 위치 설정
            const tabRect = tab.getBoundingClientRect();
            const parentRect = tab.parentNode.getBoundingClientRect();
            const targetX = tabRect.left - parentRect.left + tab.parentNode.scrollLeft;
            const targetW = tab.offsetWidth;
            
            this._indicator.style.width = targetW + "px";
            this._indicator.style.transform = `translateX(${targetX}px)`;

            requestAnimationFrame(() => {
                if (this._indicator) {
                    // transition 복원 (CSS로 처리되므로 빈 문자열로 제거)
                    this._indicator.style.transition = "";
                }
            });
        });
    }


    _moveDepth1Indicator(tab) {
        if (!this._indicator || !tab) return;
        
        const tabRect = tab.getBoundingClientRect();
        const parentRect = tab.parentNode.getBoundingClientRect();
        const targetX = tabRect.left - parentRect.left + tab.parentNode.scrollLeft;
        const targetW = tab.offsetWidth;
        
        // transition이 비활성화된 경우 (초기화 시) 바로 설정
        if (this._indicator.style.transition === 'none') {
            this._indicator.style.width = targetW + "px";
            this._indicator.style.transform = `translateX(${targetX}px)`;
            return;
        }
        
        // 현재 인디케이터의 위치와 너비 계산
        const currentTransform = getComputedStyle(this._indicator).transform;
        let currentX = 0;
        if (currentTransform && currentTransform !== 'none') {
            const matrix = currentTransform.match(/matrix.*\((.+)\)/);
            if (matrix) {
                currentX = parseFloat(matrix[1].split(',')[4]) || 0;
            }
        } else {
            // transform이 없으면 offsetLeft 사용
            const indicatorRect = this._indicator.getBoundingClientRect();
            const parentRect2 = this._indicator.parentElement.getBoundingClientRect();
            currentX = indicatorRect.left - parentRect2.left + tab.parentNode.scrollLeft;
        }
        const currentW = this._indicator.offsetWidth || targetW;
        
        // 리사이즈 시 위치 차이가 거의 없으면 애니메이션 없이 바로 설정
        const positionDiff = Math.abs(targetX - currentX);
        if (positionDiff < 1 && Math.abs(targetW - currentW) < 1) {
            this._indicator.style.width = targetW + "px";
            this._indicator.style.transform = `translateX(${targetX}px)`;
            return;
        }
        
        // 늘어났다가 줄어드는 애니메이션
        // 1단계: transition을 비활성화하고 넓이를 1.5배로 증가
        const originalTransition = this._indicator.style.transition || getComputedStyle(this._indicator).transition;
        this._indicator.style.transition = 'none';
        
        const expandedWidth = currentW * 1.5;
        
        // 현재 위치에서 넓이를 1.5배로 증가 (즉시 적용)
        this._indicator.style.width = expandedWidth + "px";
        this._indicator.style.transform = `translateX(${currentX}px)`;
        
        // 브라우저가 첫 번째 변경사항을 렌더링한 후 transition으로 이동
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // transition 복원하여 부드럽게 애니메이션
                this._indicator.style.transition = originalTransition || '';
                
                // 목표 위치로 이동하고 목표 넓이로 축소 (transition으로 애니메이션)
                this._indicator.style.width = targetW + "px";
                this._indicator.style.transform = `translateX(${targetX}px)`;
            });
        });
    }

    _activateDepth1Tab(tab) {
        if(tab) {
            const targetId = tab.dataset.target;
            
            // depth1 탭 상태 변경
            this._tabs.forEach((t) => {
                t.setAttribute("aria-selected", "false");
                t.classList.remove("active");
                t.hidden = true;
            });
            tab.setAttribute("aria-selected", "true");
            tab.classList.add("active");
            tab.hidden = false;

            const depth2Group = this._element.querySelectorAll(".depth2");
            // sub-tabs-list 안의 모든 scroll-nav-wrap 찾기
            const subTabsList = this._element.querySelector(".sub-tabs-list");
            const scrollNavWraps = subTabsList ? subTabsList.querySelectorAll(".scroll-nav-wrap") : [];

            // 모든 scroll-nav-wrap을 display:none 처리
            scrollNavWraps.forEach((wrap) => {
                wrap.style.display = "none";
            });

            depth2Group.forEach((group) => {
                group.classList.remove("active");
                if (group.id === targetId){
                    group.classList.add("active");
                    // 활성화된 depth2의 scroll-nav-wrap만 display:block 처리
                    const wrap = group.closest(".scroll-nav-wrap");
                    if (wrap) {
                        wrap.style.display = "block";
                        // height 초기화 (아코디언 효과를 위한 height:0이 설정되어 있을 수 있음)
                        
                        setTimeout(() => {
                            if (group._scrollNavigation) {
                                group._scrollNavigation._updateState();
                            }
                        }, 50);
                        
                    }
                }            
            });


            // 1뎁스 패널 컨테이너 숨김 처리
            const panelList = this._element.querySelector(".panel-list");
            if (panelList) {
                const allDepth1Panels = Array.from(panelList.children);
                allDepth1Panels.forEach((panel) => {
                    panel.hidden = true;
                });
            }

            if (!targetId) {
                const panelId = tab.getAttribute("aria-controls");

                if (panelId) {
                    const panel = this._element.querySelector("#" + panelId);
                    if (panel) {
                        // 아코디언이 열릴 때까지 기다렸다가 패널 표시
                        this._waitForAccordionAndShowPanel(panel, () => {
                            // 패널을 먼저 보여주기
                            panel.hidden = false;
                            requestAnimationFrame(() => {
                                panel.dispatchEvent(new CustomEvent("tabActivated", {bubbles: true}));
                            });
                            // 패널이 표시된 후 아코디언 재초기화
                            requestAnimationFrame(() => {
                                requestAnimationFrame(() => {
                                    panel.querySelectorAll(".accordion-area").forEach((accordionArea) => {
                                        // .accordion-item이 있으면 그것을 사용, 없으면 .accordion-area 자체를 사용
                                        let accordionElement = accordionArea.querySelector(".accordion-item");
                                        if (!accordionElement) {
                                            accordionElement = accordionArea;
                                        }
                                        
                                        // 아코디언 인스턴스 찾기 또는 재초기화
                                        let accordionInstance = accordionElement._accordionInstance;
                                        
                                        if (!accordionInstance || !accordionElement.classList.contains("initiated")) {
                                            try {
                                                accordionElement.classList.remove("initiated");
                                                accordionInstance = new SolidAccordion(accordionElement);
                                            } catch (e) {
                                                console.warn("Failed to initialize accordion:", e);
                                                return;
                                            }
                                        }
                                        
                                        // 이벤트가 제대로 바인딩되었는지 확인하고 필요시 재바인딩
                                        if (accordionInstance && accordionInstance._accoTitleWrap) {
                                            const titleWrap = accordionInstance._accoTitleWrap;
                                            if (!accordionInstance._isAccordionControl) {
                                                const hasListener = titleWrap._hasAccordionListener;
                                                if (!hasListener) {
                                                    titleWrap.addEventListener("click", (e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        if (accordionInstance && accordionInstance.openContent) {
                                                            accordionInstance.openContent();
                                                        }
                                                    });
                                                    titleWrap._hasAccordionListener = true;
                                                }
                                            }
                                        }
                                    });
                                });
                            });
                            // 패널 내부의 모든 탭 초기화 (아코디언 내부 포함)
                            try {
                                const tabsContainers = panel.querySelectorAll(".ui-basic-tab");
                                if (tabsContainers.length > 0) {
                                    SolidTabsUpdate(tabsContainers);
                                }
                            } catch (e) {
                                console.warn("Failed to update tabs:", e);
                            }
                            // 패널 내부의 아코디언 탭 초기화 (hidden 상태가 아닐 때)
                            this._initTabsInAccordions(panel);
                        });
                    }
                }
            } else {
                // 1뎁스 패널 컨테이너 먼저 보여주기
                const depth1PanelId = targetId + "-panel";
                const depth1Panel = this._element.querySelector("#" + depth1PanelId);

                if (depth1Panel) {
                  depth1Panel.hidden = false;
                  // 패널이 표시될 때 tabActivated 이벤트 발생
                  requestAnimationFrame(() => {
                      depth1Panel.dispatchEvent(new CustomEvent("tabActivated", {bubbles: true}));
                  });
                  // 패널이 표시된 후 아코디언 재초기화
                  requestAnimationFrame(() => {
                      requestAnimationFrame(() => {
                          depth1Panel.querySelectorAll(".accordion-area").forEach((accordionArea) => {
                              let accordionElement = accordionArea.querySelector(".accordion-item");
                              if (!accordionElement) {
                                  accordionElement = accordionArea;
                              }
                              
                              // 아코디언 인스턴스 찾기 또는 재초기화
                              let accordionInstance = accordionElement._accordionInstance;
                              
                              if (!accordionInstance || !accordionElement.classList.contains("initiated")) {
                                  try {
                                      accordionElement.classList.remove("initiated");
                                      accordionInstance = new SolidAccordion(accordionElement);
                                  } catch (e) {
                                      console.warn("Failed to initialize accordion:", e);
                                      return;
                                  }
                              }
                              
                              // 이벤트가 제대로 바인딩되었는지 확인하고 필요시 재바인딩
                              if (accordionInstance && accordionInstance._accoTitleWrap) {
                                  const titleWrap = accordionInstance._accoTitleWrap;
                                  if (!accordionInstance._isAccordionControl) {
                                      const hasListener = titleWrap._hasAccordionListener;
                                      if (!hasListener) {
                                          titleWrap.addEventListener("click", (e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              if (accordionInstance && accordionInstance.openContent) {
                                                  accordionInstance.openContent();
                                              }
                                          });
                                          titleWrap._hasAccordionListener = true;
                                      }
                                  }
                              }
                          });
                      });
                  });
                  // 패널 내부의 아코디언 탭 초기화
                  this._initTabsInAccordions(depth1Panel);
                }

                if (this._resetDepth2OnTabChange) {
                    this._resetDepth2Tabs(targetId);
                }

                this._initDepth2(targetId);
            }

            // 이전 indicator 업데이트 타이머 취소
            if (this._indicatorUpdateTimer) {
                clearTimeout(this._indicatorUpdateTimer);
                this._indicatorUpdateTimer = null;
            }
            
            // 초기 indicator 위치 설정 (스크롤 전)
            if (this._indicator) {
                requestAnimationFrame(() => {
                    this._moveDepth1Indicator(tab);
                });
            }
            
            // active 탭을 화면 중앙으로 스크롤
            // DOM 변경이 완료된 후 스크롤 실행
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    this._scrollTabIntoViewCenter(tab);
                    // 스크롤 완료 후 네비게이션 상태 업데이트 및 indicator 위치 업데이트 (smooth scroll 완료 대기)
                    if (this._depth1 && this._depth1._scrollNavigation) {
                        this._indicatorUpdateTimer = setTimeout(() => {
                            this._depth1._scrollNavigation._updateState();
                            // 스크롤 완료 후 indicator 위치 업데이트 (현재 활성 탭으로)
                            if (this._indicator) {
                                const currentActiveTab = Array.from(this._tabs).find(
                                    (t) => t.getAttribute("aria-selected") === "true"
                                );
                                if (currentActiveTab) {
                                    this._moveDepth1Indicator(currentActiveTab);
                                }
                            }
                            this._indicatorUpdateTimer = null;
                        }, 600); // 스크롤 완료 후 상태 업데이트
                    } else {
                        // 스크롤 네비게이션이 없어도 indicator는 업데이트
                        if (this._indicator) {
                            this._indicatorUpdateTimer = setTimeout(() => {
                                const currentActiveTab = Array.from(this._tabs).find(
                                    (t) => t.getAttribute("aria-selected") === "true"
                                );
                                if (currentActiveTab) {
                                    this._moveDepth1Indicator(currentActiveTab);
                                }
                                this._indicatorUpdateTimer = null;
                            }, 100);
                        }
                    }
                });
            });
        }
    }

    /**
     * 특정 depth2 그룹의 탭들을 첫 번째 탭으로 초기화
     * @param {string} targetId - depth2 그룹의 id
     */
    _resetDepth2Tabs(targetId) {
        if (!targetId) return;
        
        const depth2Group = this._element.querySelector("#" + targetId);
        if (!depth2Group) return;
        
        const tabs = depth2Group.querySelectorAll(".solid-tab");
        if (!tabs || tabs.length === 0) return;
        
        // 모든 탭을 비활성화 상태로 리셋
        tabs.forEach((t) => {
            t.setAttribute("aria-selected", "false");
            t.classList.remove("active");
            t.hidden = true;
        });
        
        // 첫 번째 탭을 활성화 상태로 설정 (나중에 _initDepth2에서 처리됨)
        // 여기서는 단순히 상태만 리셋
    }

    _initDepth2(targetId) {
        if (!this._element) return;

        this._subDetp2Tabs = this._element.querySelector("#" + targetId);
        
        if(!this._subDetp2Tabs) {
            return;
        }

        // 1뎁스 패널 컨테이너는 그대로 유지 (숨기지 않음)
        const depth1PanelId = targetId + "-panel";
        const depth1Panel = this._element.querySelector("#" + depth1PanelId);
        
        if (!depth1Panel) {
            console.warn("Depth1 panel not found:", depth1PanelId);
            return;
        }
        
        // 해당 1뎁스 패널 안의 2뎁스 패널들만 찾기
        const subPanelsInContainer = depth1Panel.querySelectorAll("[role='tabpanel']");
        
        // 2뎁스 패널들만 hidden 처리
        subPanelsInContainer.forEach((p) => (p.hidden = true));
        
        this._subPanels = subPanelsInContainer;

        this._subTabs = this._subDetp2Tabs.querySelectorAll(".solid-tab");
        
        if (!this._subTabs || this._subTabs.length === 0) {
            return;
        }
        
        // 초기 상태: 모든 탭을 hidden 처리
        this._subTabs.forEach((t) => {
            t.hidden = true;
        });

        this._setupScrollNav(this._subDetp2Tabs);

        this._dept2EventBind();

        const activeTab = this._subDetp2Tabs.querySelector(".solid-tab[aria-selected='true']") || this._subTabs[0];

        if (activeTab) {
            this._activateDepth2Tab(activeTab);
            // depth2 활성화 후 네비게이션 상태 업데이트
            // 약간의 지연을 두어 DOM이 완전히 렌더링된 후 상태 업데이트
            // requestAnimationFrame을 사용하여 DOM이 완전히 렌더링된 후 상태 업데이트
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (this._subDetp2Tabs._scrollNavigation) {
                        this._subDetp2Tabs._scrollNavigation._updateState();
                    }
                });
            });
        }

    }


    _activateDepth2Tab(tab) {
        this._subTabs.forEach((t) => {
            t.setAttribute("aria-selected", "false");
            t.classList.remove("active");
            t.hidden = true;
        });
        tab.setAttribute("aria-selected", "true");
        tab.classList.add("active");
        tab.hidden = false;

        // 2뎁스 패널들만 숨김 처리
        if (this._subPanels && this._subPanels.length > 0) {
            this._subPanels.forEach((p) => (p.hidden = true));
        }
        
        const panelId = tab.getAttribute("aria-controls");
        if (panelId) {
            const panel = this._element.querySelector("#" + panelId);
            if (panel) {
                requestAnimationFrame(() => {
                    panel.dispatchEvent(new CustomEvent("tabActivated", {bubbles: true}));
                    panel.hidden = false;
                });
                // 패널이 표시된 후 아코디언 재초기화 (hidden 상태에서 표시 상태로 변경될 때 이벤트가 제대로 바인딩되도록)
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        // .accordion-area 내부의 .accordion-item 찾기 (없으면 .accordion-area 자체 사용)
                        panel.querySelectorAll(".accordion-area").forEach((accordionArea) => {
                            let accordionElement = accordionArea.querySelector(".accordion-item");
                            if (!accordionElement) {
                                accordionElement = accordionArea;
                            }
                            
                            // 아코디언 인스턴스 찾기 또는 재초기화
                            let accordionInstance = accordionElement._accordionInstance;
                            
                            if (!accordionInstance || !accordionElement.classList.contains("initiated")) {
                                // 인스턴스가 없거나 초기화되지 않은 경우 재초기화
                                try {
                                    accordionElement.classList.remove("initiated");
                                    accordionInstance = new SolidAccordion(accordionElement);
                                } catch (e) {
                                    console.warn("Failed to initialize accordion:", e);
                                    return;
                                }
                            }
                            
                            // 이벤트가 제대로 바인딩되었는지 확인하고 필요시 재바인딩
                            if (accordionInstance && accordionInstance._accoTitleWrap) {
                                const titleWrap = accordionInstance._accoTitleWrap;
                                // 기존 이벤트 리스너가 있는지 확인 (간단한 방법: 이벤트를 다시 바인딩)
                                // 클릭 이벤트가 제대로 동작하도록 보장
                                if (!accordionInstance._isAccordionControl) {
                                    // 기존 이벤트 제거를 위해 클론 후 교체
                                    const hasListener = titleWrap._hasAccordionListener;
                                    if (!hasListener) {
                                        titleWrap.addEventListener("click", (e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (accordionInstance && accordionInstance.openContent) {
                                                accordionInstance.openContent();
                                            }
                                        });
                                        titleWrap._hasAccordionListener = true;
                                    }
                                }
                            }
                        });
                    });
                });
                // 패널 내부의 모든 탭 초기화 (아코디언 내부 포함)
                try {
                    const tabsContainers = panel.querySelectorAll(".ui-basic-tab");
                    if (tabsContainers.length > 0) {
                        SolidTabsUpdate(tabsContainers);
                    }
                } catch (e) {
                    console.warn("Failed to update tabs:", e);
                }
                // 패널 내부의 열려있는 아코디언 탭 초기화 (아코디언이 닫혀있으면 초기화되지 않을 수 있으므로 보완)
                this._initTabsInAccordions(panel);
            }
        }

        // active 탭을 화면 중앙으로 스크롤
        // DOM 변경이 완료된 후 스크롤 실행
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this._scrollTabIntoViewCenter(tab);
                // 스크롤 완료 후 네비게이션 상태 업데이트
                if (this._subDetp2Tabs && this._subDetp2Tabs._scrollNavigation) {
                    setTimeout(() => {
                        this._subDetp2Tabs._scrollNavigation._updateState();
                    }, 600); // 스크롤 완료 후 상태 업데이트
                }
            });
        });
    }

    _dept1EventBind() {
        this._tabs.forEach((tab) =>  tab.addEventListener("click", () => {
            this._activateDepth1Tab(tab);
            // _activateDepth1Tab 내부에서 스크롤 처리하므로 중복 호출 제거
        }));
    }


    _dept2EventBind() {
        if (!this._subTabs) return;
        this._subTabs.forEach((tab) =>  tab.addEventListener("click", () => {
            this._activateDepth2Tab(tab);
            // _activateDepth2Tab 내부에서 스크롤 처리하므로 중복 호출 제거
        }));
    }

    _dept2EventBindForContainer(container) {
        const subTabs = container.querySelectorAll(".solid-tab");
        if (!subTabs.length) return;
        
        subTabs.forEach((tab) => {
            tab.addEventListener("click", () => {
                const allTabs = container.querySelectorAll(".solid-tab");
                allTabs.forEach((t) => {
                    t.setAttribute("aria-selected", "false");
                    t.classList.remove("active");
                    t.hidden = true;
                });
                tab.setAttribute("aria-selected", "true");
                tab.classList.add("active");
                tab.hidden = false;
                
                // 패널 활성화 로직 추가
                const panelId = tab.getAttribute("aria-controls");
                if (panelId) {
                    // 같은 1뎁스 패널 컨테이너 내에서 패널 찾기
                    const subTabsId = container.getAttribute("id");
                    const depth1PanelId = subTabsId + "-panel";
                    const depth1Panel = this._element.querySelector("#" + depth1PanelId);
                    
                    if (depth1Panel) {
                        // 같은 컨테이너 내의 모든 패널 숨김
                        const allPanels = depth1Panel.querySelectorAll("[role='tabpanel']");
                        allPanels.forEach((p) => {
                            p.hidden = true;
                        });
                        
                        // 선택된 패널 활성화
                        const panel = this._element.querySelector("#" + panelId);
                        if (panel) {
                            requestAnimationFrame(() => {
                                panel.dispatchEvent(new CustomEvent("tabActivated", {bubbles: true}));
                                panel.hidden = false;
                            });
                            // 패널이 표시된 후 아코디언 재초기화
                            requestAnimationFrame(() => {
                                requestAnimationFrame(() => {
                                    panel.querySelectorAll(".accordion-area").forEach((accordionArea) => {
                                        // .accordion-item이 있으면 그것을 사용, 없으면 .accordion-area 자체를 사용
                                        let accordionElement = accordionArea.querySelector(".accordion-item");
                                        if (!accordionElement) {
                                            accordionElement = accordionArea;
                                        }
                                        
                                        // 아코디언 인스턴스 찾기 또는 재초기화
                                        let accordionInstance = accordionElement._accordionInstance;
                                        
                                        if (!accordionInstance || !accordionElement.classList.contains("initiated")) {
                                            try {
                                                accordionElement.classList.remove("initiated");
                                                accordionInstance = new SolidAccordion(accordionElement);
                                            } catch (e) {
                                                console.warn("Failed to initialize accordion:", e);
                                                return;
                                            }
                                        }
                                        
                                        // 이벤트가 제대로 바인딩되었는지 확인하고 필요시 재바인딩
                                        if (accordionInstance && accordionInstance._accoTitleWrap) {
                                            const titleWrap = accordionInstance._accoTitleWrap;
                                            if (!accordionInstance._isAccordionControl) {
                                                const hasListener = titleWrap._hasAccordionListener;
                                                if (!hasListener) {
                                                    titleWrap.addEventListener("click", (e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        if (accordionInstance && accordionInstance.openContent) {
                                                            accordionInstance.openContent();
                                                        }
                                                    });
                                                    titleWrap._hasAccordionListener = true;
                                                }
                                            }
                                        }
                                    });
                                });
                            });
                            // 패널 내부의 모든 탭 초기화 (아코디언 내부 포함)
                            try {
                                const tabsContainers = panel.querySelectorAll(".ui-basic-tab");
                                if (tabsContainers.length > 0) {
                                    SolidTabsUpdate(tabsContainers);
                                }
                            } catch (e) {
                                console.warn("Failed to update tabs:", e);
                            }
                            // 패널 내부의 아코디언 탭 초기화 (hidden 상태가 아닐 때)
                            this._initTabsInAccordions(panel);
                        }
                    }
                }
                
                // DOM 변경이 완료된 후 스크롤 실행
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        this._scrollTabIntoViewCenter(tab);
                        // 스크롤 완료 후 네비게이션 상태 업데이트
                        if (container._scrollNavigation) {
                            setTimeout(() => {
                                container._scrollNavigation._updateState();
                            }, 600); // 스크롤 완료 후 상태 업데이트
                        }
                    });
                });
            });
        });
    }

    _getHScrollContainer(tab) {
        let p = tab.parentElement;

        while(p) {
            const cs = getComputedStyle(p);
            // 실제로 스크롤 가능한 영역이 있는지 정확히 체크
            const scrollableWidth = p.scrollWidth - p.clientWidth;
            const canScroll = scrollableWidth > 1 && cs.overflowX !== "visible";
            if (canScroll) return p;
            p = p.parentElement;
        }
        return null;
    }

    _offsetLeftWithin(el, ancestor) {
        let x = 0
        let node = el;
        while (node && node !== ancestor) {
            x += node.offsetLeft;
            node = node.parentElement;
        }
        return x;
    }

    _scrollTabIntoViewCenter(tab) {
        const container = this._getHScrollContainer(tab);
        if (!container) return;

        // 스크롤 가능한 영역이 없으면 동작하지 않음 (1px 이상의 여유 공간이 있어야 함)
        const max = container.scrollWidth - container.clientWidth;
        if (max <= 1) {
            return;
        }

        const padLeft = parseInt(getComputedStyle(container).paddingLeft) || 0;
        const deviceWidth = window.innerWidth;

        const tabLeft = this._offsetLeftWithin(tab, container);
        const targetLeft = (tabLeft + tab.offsetWidth / 2) - (deviceWidth / 2) + padLeft;
        const clamped = Math.max(0, Math.min(targetLeft, max));
        
        // 현재 위치와 목표 위치가 거의 같으면 스크롤하지 않음 (5px 이상 차이가 있어야 함)
        const scrollDiff = Math.abs(clamped - container.scrollLeft);
        if (scrollDiff < 5) {
            return;
        }

        // 실제로 스크롤할 수 있는지 최종 확인
        requestAnimationFrame(() => {
            // 다시 한번 체크 (DOM 변경 후 상태가 바뀔 수 있음)
            const currentMax = container.scrollWidth - container.clientWidth;
            if (currentMax <= 1) {
                return;
            }
            
            const currentClamped = Math.max(0, Math.min(targetLeft, currentMax));
            const currentScrollDiff = Math.abs(currentClamped - container.scrollLeft);
            if (currentScrollDiff < 5) {
                return;
            }
            
            container.scrollTo({ left: currentClamped, behavior: "smooth" });
        });
    }

    /**
     * 패널 내부의 열려있는 아코디언에서 탭 초기화
     * SolidTabsUpdate가 아코디언이 닫혀있을 때 내부 탭을 제대로 초기화하지 못할 수 있으므로,
     * 열려있는 아코디언의 탭만 별도로 초기화
     * @param {HTMLElement} panel - 패널 요소
     */
    _initTabsInAccordions(panel) {
        if (!panel || panel.hidden) return;
        
        // 패널이 표시된 후 아코디언 상태를 확인하기 위해 이중 requestAnimationFrame 사용
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const allAccordionAreas = panel.querySelectorAll(".accordion-area");
                
                allAccordionAreas.forEach((accordionArea) => {
                    const accordionContentWrap = accordionArea.querySelector(".acco-content-wrap");
                    if (!accordionContentWrap) return;
                    
                    // 아코디언이 열려있는지 확인 (.on 클래스 또는 실제 높이 확인)
                    const hasOnClass = accordionArea.classList.contains("on");
                    const computedStyle = getComputedStyle(accordionContentWrap);
                    const finalDisplay = accordionContentWrap.style.display || computedStyle.display;
                    const finalHeight = accordionContentWrap.style.height || computedStyle.height;
                    
                    const isOpen = (hasOnClass || (finalDisplay !== 'none' && 
                                  finalHeight !== '0px' && 
                                  finalHeight !== '0' &&
                                  finalHeight !== '')) &&
                                  !accordionContentWrap.hidden;
                    
                    if (isOpen) {
                        // 아코디언이 열려있으면 내부 탭 초기화
                        const tabsContainers = accordionContentWrap.querySelectorAll(".ui-basic-tab");
                        if (tabsContainers.length > 0) {
                            try {
                                SolidTabsUpdate(tabsContainers);
                            } catch (e) {
                                console.warn("Failed to update tabs in accordion:", e);
                            }
                        }
                    }
                });
            });
        });
    }

    /**
     * 아코디언이 열릴 때까지 기다렸다가 패널을 표시하는 메서드
     * @param {HTMLElement} panel - 표시할 패널 요소
     * @param {Function} callback - 아코디언이 열린 후 실행할 콜백
     */
    _waitForAccordionAndShowPanel(panel, callback) {
        // acco-content-wrap 찾기 (panel의 부모 중에서 찾기)
        let accordionContentWrap = panel;
        let foundAccordion = false;
        
        while (accordionContentWrap && accordionContentWrap.parentElement) {
            accordionContentWrap = accordionContentWrap.parentElement;
            if (accordionContentWrap.classList.contains('acco-content-wrap')) {
                foundAccordion = true;
                break;
            }
            if (accordionContentWrap === document.body) {
                accordionContentWrap = null;
                break;
            }
        }
        
        // 아코디언이 없으면 바로 콜백 실행
        if (!foundAccordion || !accordionContentWrap) {
            if (callback) callback();
            return;
        }
        
        // 아코디언이 열려있는지 확인
        const isAccordionOpen = () => {
            if (!accordionContentWrap) return true;
            const computedStyle = getComputedStyle(accordionContentWrap);
            const finalDisplay = accordionContentWrap.style.display || computedStyle.display;
            const finalHeight = accordionContentWrap.style.height || computedStyle.height;
            return finalDisplay !== 'none' && 
                   finalHeight !== '0px' && 
                   finalHeight !== '0' &&
                   finalHeight !== '';
        };
        
        // 아코디언이 이미 열려있으면 바로 콜백 실행
        if (isAccordionOpen()) {
            if (callback) callback();
            return;
        }
        
        // 아코디언이 닫혀있으면 transitionend 이벤트를 기다림
        if (accordionContentWrap) {
            const transitionEndHandler = (e) => {
                if (e.propertyName === 'height' || e.propertyName === 'max-height') {
                    if (callback) callback();
                }
            };
            accordionContentWrap.addEventListener('transitionend', transitionEndHandler, { once: true });
        }
    }

    _setupAllDepth2ScrollNav() {
        const depth2Lists = this._element.querySelectorAll(".sub-tabs.depth2");
        depth2Lists.forEach((list) => {
            // 초기 상태: 모든 탭을 hidden 처리
            const tabs = list.querySelectorAll(".solid-tab");
            tabs.forEach((t) => {
                t.hidden = true;
            });
            
            this._setupScrollNav(list);
            this._dept2EventBindForContainer(list);
            
            // scroll-nav-wrap 초기 상태: display:none 처리
            const wrap = list.closest(".scroll-nav-wrap");
            if (wrap) {
                wrap.style.display = "none";
            }
        });
    }

    _setupScrollNav(container) {
        if (!container) return;
        // ScrollNavigation 클래스를 사용하여 스크롤 네비게이션 설정
        new ScrollNavigation(container);
    }

    _setupScrollExtend(container) {
        if (!container) return;
        new ScrollNavigation(container);
    }


    setDefaultTab(id) {
        let el = this._depth2?.querySelector(`#${id}`);

        if (el) {
            const subId = el.closest(".sub-tabs").getAttribute("id");
            const tabBtn = document.querySelector(`[data-target="${subId}"]`);
            this._activateDepth1Tab(tabBtn);
            this._defaultTab = tabBtn;
            this._activateDepth2Tab(el);
        } else {
            el = this._depth1.querySelector(`#${id}`);
            this._activateDepth1Tab(el);
            this._defaultTab = el;
            if (el?.dataset?.target) {
                const target = el.dataset.target;
                this._activateDepth2Tab(document.getElementById(target).children[0]);
            }
        }
    }

    /**
     * 탭을 활성화하고 선택적으로 포커스 설정
     * @param {HTMLElement} tab - 활성화할 탭 요소
     * @param {boolean} focus - 포커스를 설정할지 여부 (기본값: false)
     */
    activateTab(tab, focus = false) {
        if (!tab) return;
        
        // 외부 컨테이너에 ui-basic-tab 클래스가 있는지 확인
        const container = tab.closest(".ui-basic-tab");
        if (!container) {
            console.warn("activateTab: ui-basic-tab 컨테이너 내부의 탭만 활성화할 수 있습니다.");
            return;
        }

        // 탭이 depth1인지 depth2인지 확인
        const isDepth1 = tab.closest(".depth1") !== null;
        const isDepth2 = tab.closest(".depth2") !== null;

        if (isDepth1) {
            this._activateDepth1Tab(tab);
        } else if (isDepth2) {
            this._activateDepth2Tab(tab);
        }

        // 포커스 설정
        if (focus) {
            requestAnimationFrame(() => {
                tab.focus();
            });
        }
    }

    /**
     * depth1과 depth2에서 탭 요소 찾기 (헬퍼 함수)
     * @param {string} id - 탭 버튼의 id
     * @returns {HTMLElement|null} 찾은 탭 요소 또는 null
     */
    _findTabById(id) {
        if (!id) return null;

        // depth1에서 먼저 찾기
        let tab = this._depth1?.querySelector(`#${id}`);
        if (tab) return tab;

        // depth2에서 찾기
        const depth2Lists = this._element.querySelectorAll(".depth2");
        for (const depth2 of depth2Lists) {
            tab = depth2.querySelector(`#${id}`);
            if (tab) return tab;
        }

        return null;
    }

    /**
     * 탭 버튼의 텍스트 변경
     * @param {string} id - 탭 버튼의 id
     * @param {string} value - 변경할 텍스트
     */
    setTabsTitle(id, value) {
        if (!id || value === undefined) return;

        const tab = this._findTabById(id);
        if (tab) {
            tab.textContent = value;
        }
    }

    /**
     * 탭 버튼의 disabled 상태 설정
     * @param {string} id - 탭 버튼의 id
     * @param {boolean} isDisabled - disabled 상태 (기본값: true)
     */
    setTabDisabled(id, isDisabled = true) {
        if (!id) return;

        const tab = this._findTabById(id);
        if (tab) {
            if (isDisabled) {
                tab.setAttribute("disabled", "true");
                tab.setAttribute("aria-disabled", "true");
            } else {
                tab.removeAttribute("disabled");
                tab.setAttribute("aria-disabled", "false");
            }
        }
    }

    /**
     * 특정 depth2 그룹의 탭들을 첫 번째 탭으로 초기화하는 공개 메서드
     * @param {string} targetId - depth2 그룹의 id (선택사항, 없으면 현재 활성화된 depth2)
     */
    resetDepth2(targetId = null) {
        if (!targetId) {
            // 현재 활성화된 depth1 탭의 targetId 사용
            const activeDepth1Tab = Array.from(this._tabs).find(
                (t) => t.getAttribute("aria-selected") === "true"
            );
            if (activeDepth1Tab && activeDepth1Tab.dataset.target) {
                targetId = activeDepth1Tab.dataset.target;
            } else {
                console.warn("resetDepth2: 활성화된 depth1 탭을 찾을 수 없습니다.");
                return;
            }
        }
        
        this._resetDepth2Tabs(targetId);
        
        // depth2를 다시 초기화하여 첫 번째 탭 활성화
        this._initDepth2(targetId);
    }

}


// 초기화 함수
function initBasicTabs() {
    const basicTabsContainers = document.querySelectorAll(".ui-basic-tab");
    basicTabsContainers.forEach((container) => {
        if (!container.dataset.basicTabsInitialized) {
            const instance = new SolidBasicTabs(container);
            container._basicTabsInstance = instance; // 인스턴스 저장
            container.dataset.basicTabsInitialized = "true";
        }
    });

    // 특정 클래스를 가진 요소에 자동으로 스크롤 네비게이션 추가
    ScrollNavigation.init(".scroll-nav-target");
}

// DOMContentLoaded 이벤트에서 초기화
document.addEventListener("DOMContentLoaded", initBasicTabs);


const index  = {
    SolidBasicTabs,
    SolidTabsUpdate,
    ScrollNavigation
}
