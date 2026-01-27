/**
 * BasicTabs 사용법
 * 
 * 1. 인스턴스 가져오기
 *    const container = document.querySelector('.ui-basic-tab');
 *    const basicTabs = container._basicTabsInstance; // 자동 초기화된 경우
 *    // 또는 직접 생성:
 *    const basicTabs = new BasicTabs(container);
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
        this.element = element;
        this._element = element;
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
        // 컨테이너를 relative로 설정
        const containerStyle = getComputedStyle(this.container);
        if (containerStyle.position === "static") {
            this.container.style.position = "relative";
        }

        // wrap 생성 또는 찾기
        this._setupWrap();

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
    }

    /**
     * 이전/다음 버튼 생성 및 추가
     */
    _setupButtons() {
        if (!this.wrap) return;
        
        // prev/next 버튼이 이미 있는지 확인
        this.prevBtn = this.wrap.querySelector("." + this.options.prevButtonClass.split(' ')[0] + ".prev");
        this.nextBtn = this.wrap.querySelector("." + this.options.nextButtonClass.split(' ')[0] + ".next");

        // ui-scroll-tab 요소 찾기
        const depthElement = this.wrap.querySelector(".ui-scroll-tab");
        
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
        const distance = Math.round(window.innerWidth * this.options.scrollDistance);
        if (distance <= 0) return;

        // CSS scroll-behavior 적용
        const originalScrollBehavior = this.container.style.scrollBehavior;
        this.container.style.scrollBehavior = "smooth";

        const max = this.container.scrollWidth - this.container.clientWidth;
        if (max <= 0) {
            this.container.style.scrollBehavior = originalScrollBehavior;
            return;
        }

        const target = Math.max(0, Math.min(this.container.scrollLeft + direction * distance, max));
        if (Math.abs(target - this.container.scrollLeft) < 1) {
            this.container.style.scrollBehavior = originalScrollBehavior;
            return;
        }

        // 스크롤 동작 중 클래스 추가
        this.container.classList.add("scroll-nav-active");

        requestAnimationFrame(() => {
            this.container.scrollTo({ left: target, behavior: "smooth" });
            // 스크롤 완료 후 원래 scroll-behavior 복원 및 클래스 제거
            setTimeout(() => {
                this.container.style.scrollBehavior = originalScrollBehavior;
                this.container.classList.remove("scroll-nav-active");
            }, 500);
        });
    }

    /**
     * 버튼 상태 업데이트
     */
    _updateState() {
        if (!this.prevBtn || !this.nextBtn) return;
        
        // wrap이 숨겨져 있으면 상태 업데이트하지 않음
        if (this.wrap && getComputedStyle(this.wrap).display === "none") {
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
    let basicTabsElements = null;
    let scrollTabsElements = null;
    let scrollspyTabsElements = null;

    if(typeof elements == "undefined") {
        basicTabsElements = document.querySelectorAll(".tabs-container");
        scrollTabsElements = document.querySelectorAll(".ui-basic-tab");
        scrollspyTabsElements = document.querySelectorAll(".ui-scrollspy");
    } else if(typeof elements == "object" && typeof elements.length == "number") {
       Object.values(elements ?? []).map((el) => {
        if (el.classList.contains("tabs-container")) {
            basicTabsElements = [...(basicTabsElements ?? []), el];
        } else if (el.classList.contains("ui-basic-tab")) {
            scrollTabsElements = [...(scrollTabsElements ?? []), el];
        } else if (el.classList.contains("ui-scrollspy")) {
            scrollspyTabsElements = [...(scrollspyTabsElements ?? []), el];
        }
       })
    } else if(typeof elements == "string") {
        const targets = document.querySelectorAll(elements);
        Object.values(targets ?? []).map((el) => {
            if (el.classList.contains("tabs-container")) {
                basicTabsElements = [...(basicTabsElements ?? []), el];
            } else if (el.classList.contains("ui-basic-tab")) {
                scrollTabsElements = [...(scrollTabsElements ?? []), el];
            } else if (el.classList.contains("ui-scrollspy")) {
                scrollspyTabsElements = [...(scrollspyTabsElements ?? []), el];
            }
        });
    } else {
        return false;
    }

    Object.values(basicTabsElements ?? []).map((tabElement) => {
        let instance = BasicTabs.getInstance(tabElement);
        if (instance === null) {
            tabElement.classList.remove("initiated");
            instance = new BasicTabs(tabElement);
        }
        instance._update();
    });
    Object.values(scrollTabsElements ?? []).map((tabElement) => {
        let scrollInstance = BasicTabs.getInstance(tabElement);
        if(scrollInstance === null) {
            tabElement.classList.remove("initiated");
            scrollInstance = new BasicTabs(tabElement);
        }
        scrollInstance._initDepth1();
    });
    Object.values(scrollspyTabsElements ?? []).map((tabElement) => {
        let scrollspyInstance = scrollspyTabs.getInstance(tabElement);
        if(scrollspyInstance === null) {
            tabElement.classList.remove("initiated");
            scrollspyInstance = new scrollspyTabs(tabElement);
        }
        scrollspyInstance._update();
    });
}

// getElement 헬퍼 함수
function getElement(element) {
    if (typeof element === 'string') {
        return document.querySelector(element);
    }
    return element;
}

class BasicTabs extends BaseComponent {
    
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
        return "basicTabs";
    }

    static getInstance(element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        return element?._basicTabsInstance || null;
    }

    _initDepth1() {
        this._depth1 = this._element.querySelector(".scroll-tabs.depth1");
        this._depth2 = this._element.querySelector(".sub-tabs-list");

        if(!this._depth1) return;

        this._tabs = this._depth1.querySelectorAll(".ui-basic-tab");
        // 1뎁스 패널만 선택 (panel-list의 직접 자식만, 2뎁스 패널은 제외)
        const panelList = this._element.querySelector(".panel-list");
        if (panelList) {
            // 직접 자식만 선택 (2뎁스 패널 제외)
            this._panels = Array.from(panelList.children).filter(child => 
                child.getAttribute("role") === "tabpanel"
            );
        } else {
            this._panels = [];
        }
        
        // tab-indicator가 없으면 자동으로 생성
        this._indicator = this._depth1.querySelector(".tab-indicator");
        if (!this._indicator) {
            this._indicator = document.createElement("span");
            this._indicator.className = "tab-indicator";
            this._indicator.style.transition = "transform 0.3s ease, width 0.3s ease";
            this._depth1.appendChild(this._indicator);
        } else {
            // 기존 indicator가 있으면 transition 설정
            if (!this._indicator.style.transition) {
                this._indicator.style.transition = "transform 0.3s ease, width 0.3s ease";
            }
        }

        if(!this._tabs.length) return;

        // 초기 상태: 모든 탭을 hidden 처리
        this._tabs.forEach((t) => {
            t.hidden = true;
        });

        // 스크롤 네비게이션은 항상 설정
        this._setupScrollNav(this._depth1);
        this._setupAllDepth2ScrollNav();

        // indicator 기능 활성화
        this._dept1EventBind();
        this._bindResize();
        this._bindScroll();
        
        //초기활성화
        const activeTab = this._element.querySelector(".ui-basic-tab[aria-selected='true']") || this._tabs[0]
        if (activeTab) {
            this._initIndicator(activeTab);
            this._activateDepth1Tab(activeTab);
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

            if(currentWidth === prevWidth)  {
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

        const prevTransition = this._indicator.style.transition;
        this._indicator.style.transition = "none";

        requestAnimationFrame(() => {
            if (!tab || !tab.parentNode) return;
            
            tab.parentNode.scrollLeft = tab.parentNode.scrollLeft || 0;

            if(this._defaultTab) tab = this._defaultTab;
            this._moveDepth1Indicator(tab);

            requestAnimationFrame(() => {
                if (this._indicator) {
                    this._indicator.style.transition = prevTransition || '';
                }
            });
        });
    }


    _moveDepth1Indicator(tab) {
        if (!this._indicator || !tab) return;
        
        const tabRect = tab.getBoundingClientRect();
        const parentRect = tab.parentNode.getBoundingClientRect();
        const x = tabRect.left - parentRect.left;
        const w = tabRect.width;
        
        // transition이 설정되어 있지 않으면 설정
        if (!this._indicator.style.transition || this._indicator.style.transition === "none") {
            this._indicator.style.transition = "transform 0.3s ease, width 0.3s ease";
        }
        
        this._indicator.style.width = w + "px";
        this._indicator.style.transform = `translateX(${x + tab.parentNode.scrollLeft}px)`;
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
                        // scroll-nav-wrap이 표시된 후 depth2의 네비게이션 상태 업데이트
                        // 약간의 지연을 두어 DOM이 완전히 렌더링된 후 상태 업데이트
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
                        // 패널을 먼저 보여주기
                        panel.hidden = false;
                        requestAnimationFrame(() => {
                            panel.dispatchEvent(new CustomEvent("tabActivated", {bubbles: true}));
                        });
                        try {
                            const tabsContainers = panel.querySelectorAll(".tabs-container, .ui-basic-tab");
                            if (tabsContainers.length > 0) {
                                SolidTabsUpdate(tabsContainers);
                            }
                        } catch (e) {
                            console.warn("Failed to update tabs:", e);
                        }
                    }
                }
            } else {
                // 1뎁스 패널 컨테이너 먼저 보여주기
                const depth1PanelId = targetId + "-panel";
                const depth1Panel = this._element.querySelector("#" + depth1PanelId);
                if (depth1Panel) {
                    depth1Panel.hidden = false;
                }
                
                // depth2 초기화 옵션이 활성화되어 있으면 첫 번째 탭으로 리셋
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
        
        const tabs = depth2Group.querySelectorAll(".ui-basic-tab");
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

        this._subTabs = this._subDetp2Tabs.querySelectorAll(".ui-basic-tab");
        
        if (!this._subTabs || this._subTabs.length === 0) {
            return;
        }
        
        // 초기 상태: 모든 탭을 hidden 처리
        this._subTabs.forEach((t) => {
            t.hidden = true;
        });

        this._setupScrollNav(this._subDetp2Tabs);

        this._dept2EventBind();

        const activeTab = this._subDetp2Tabs.querySelector(".ui-basic-tab[aria-selected='true']") || this._subTabs[0];

        if (activeTab) {
            this._activateDepth2Tab(activeTab);
            // depth2 활성화 후 네비게이션 상태 업데이트
            // 약간의 지연을 두어 DOM이 완전히 렌더링된 후 상태 업데이트
            setTimeout(() => {
                if (this._subDetp2Tabs._scrollNavigation) {
                    this._subDetp2Tabs._scrollNavigation._updateState();
                }
            }, 50);
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
                try {
                    const tabsContainers = panel.querySelectorAll(".tabs-container");
                    if (tabsContainers.length > 0) {
                        SolidTabsUpdate(tabsContainers);
                    }
                } catch (e) {
                    console.warn("Failed to update tabs:", e);
                }
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
        const subTabs = container.querySelectorAll(".ui-basic-tab");
        if (!subTabs.length) return;
        
        subTabs.forEach((tab) => {
            tab.addEventListener("click", () => {
                const allTabs = container.querySelectorAll(".ui-basic-tab");
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
                            try {
                                const tabsContainers = panel.querySelectorAll(".tabs-container, .ui-basic-tab");
                                if (tabsContainers.length > 0) {
                                    SolidTabsUpdate(tabsContainers);
                                }
                            } catch (e) {
                                console.warn("Failed to update tabs:", e);
                            }
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
            const canScroll = p.scrollWidth > p.clientWidth && cs.overflowX !== "visible";
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

        // CSS scroll-behavior 적용
        const originalScrollBehavior = container.style.scrollBehavior;
        container.style.scrollBehavior = "smooth";

        const padLeft = parseInt(getComputedStyle(container).paddingLeft) || 0;
        const deviceWidth = window.innerWidth;

        const tabLeft = this._offsetLeftWithin(tab, container);
        const targetLeft = (tabLeft + tab.offsetWidth / 2) - (deviceWidth / 2) + padLeft;

        const max = container.scrollWidth - container.clientWidth;
        if (max <= 0) {
            container.style.scrollBehavior = originalScrollBehavior;
            return;
        }
        const clamped = Math.max(0, Math.min(targetLeft, max));
        if (Math.abs(clamped - container.scrollLeft) < 1) {
            container.style.scrollBehavior = originalScrollBehavior;
            return;
        }

        requestAnimationFrame(() => {
            container.scrollTo({ left: clamped, behavior: "smooth" });
            // 스크롤 완료 후 원래 scroll-behavior 복원
            setTimeout(() => {
                container.style.scrollBehavior = originalScrollBehavior;
            }, 500);
        });
    }

    _setupAllDepth2ScrollNav() {
        const depth2Lists = this._element.querySelectorAll(".sub-tabs.depth2");
        depth2Lists.forEach((list) => {
            // 초기 상태: 모든 탭을 hidden 처리
            const tabs = list.querySelectorAll(".ui-basic-tab");
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
        
        // ui-basic-tab 클래스를 가진 요소만 동작
        if (!tab.classList.contains("ui-basic-tab")) {
            console.warn("activateTab: ui-basic-tab 클래스를 가진 요소만 활성화할 수 있습니다.");
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
     * 탭 버튼의 텍스트 변경
     * @param {string} id - 탭 버튼의 id
     * @param {string} value - 변경할 텍스트
     */
    setTabsTitle(id, value) {
        if (!id || value === undefined) return;

        // depth1과 depth2 모두에서 찾기
        let tab = this._depth1?.querySelector(`#${id}`);
        if (!tab) {
            const depth2Lists = this._element.querySelectorAll(".depth2");
            for (const depth2 of depth2Lists) {
                tab = depth2.querySelector(`#${id}`);
                if (tab) break;
            }
        }

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

        // depth1과 depth2 모두에서 찾기
        let tab = this._depth1?.querySelector(`#${id}`);
        if (!tab) {
            const depth2Lists = this._element.querySelectorAll(".depth2");
            for (const depth2 of depth2Lists) {
                tab = depth2.querySelector(`#${id}`);
                if (tab) break;
            }
        }

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
            const instance = new BasicTabs(container);
            container._basicTabsInstance = instance; // 인스턴스 저장
            container.dataset.basicTabsInitialized = "true";
        }
    });

    // 특정 클래스를 가진 요소에 자동으로 스크롤 네비게이션 추가
    ScrollNavigation.init(".scroll-nav-target");
}

// DOMContentLoaded와 load 이벤트에서 초기화
document.addEventListener("DOMContentLoaded", initBasicTabs);
window.addEventListener("load", initBasicTabs);


const index  = {
    BasicTabs,
    SolidTabsUpdate,
    ScrollNavigation
}
