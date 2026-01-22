

class BaseComponent {
    constructor(element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        this.element = element;
        this._element = element;
    }
}


const SolidTabsUpdate = (elements) => {
    let basicTabsElements = null;
    let scrollTabsElements = null;
    let scrollspyTabsElements = null;

    if(typeof elements == "undefined") {
        basicTabsElements = document.querySelectorAll(".tabs-container");
        scrollTabsElements = document.querySelectorAll(".scroll-tabs-container");
        scrollspyTabsElements = document.querySelectorAll(".ui-scrollspy");
    } else if(typeof elements == "object" && typeof elements.length == "number") {
       Object.values(element ?? []).map((el) => {
        if (el.classList.contains("tabs-container")) {
            basicTabsElements = [...(basicTabsElements ?? []), el];
        } else if (el.classList.contains("scroll-tabs-container")) {
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
            } else if (el.classList.contains("scroll-tabs-container")) {
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
        let scrollInstance = scrollTabs.getInstance(tabElement);
        if(scrollInstance === null) {
            tabElement.classList.remove("initiated");
            scrollInstance = new scrollTabs(tabElement);
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

class ScrollTabs extends BaseComponent {
    
    constructor(element) {
        const el = getElement(element);
        
        // 이미 초기화된 경우 중복 초기화 방지
        if(el && el.dataset.scrollTabsInitialized === "true") {
            return {};
        }

        super(element);

        this._element = el || element;

        this._initDepth1();
        
    }

    static get NAME() {
        return "scrollTabs";
    }

    _initDepth1() {
        this._depth1 = this._element.querySelector(".scroll-tabs.depth1");
        this._depth2 = this._element.querySelector(".sub-tabs-list");

        if(!this._depth1) return;

        this._tabs = this._depth1.querySelectorAll(".tab");
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
        this._indicator = this._depth1.querySelector(".tab-indicator");

        if(!this._tabs.length) return;

        // 초기 상태: 모든 탭을 hidden 처리
        this._tabs.forEach((t) => {
            t.hidden = true;
        });

        // 스크롤 네비게이션은 항상 설정
        this._setupScrollNav(this._depth1);
        this._setupAllDepth2ScrollNav();

        // indicator가 있는 경우에만 관련 기능 활성화
        if(this._indicator) {
            this._dept1EventBind();
            this._bindResize();
            
            //초기활성화
            const activeTab = this._element.querySelector(".tab[aria-selected='true']") || this._tabs[0]
            if (activeTab) {
                this._initIndicator(activeTab);
                this._activateDepth1Tab(activeTab);
            }
        } else {
            // indicator가 없어도 탭 클릭 이벤트는 동작하도록
            this._dept1EventBind();
            const activeTab = this._element.querySelector(".tab[aria-selected='true']") || this._tabs[0]
            if(activeTab) {
                this._activateDepth1Tab(activeTab);
            } else {
                // 초기 활성 탭이 없어도 모든 depth2-wrap은 숨김 처리
                const depth2Wraps = this._element.querySelectorAll(".depth2-wrap");
                depth2Wraps.forEach((wrap) => {
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
    }

    _bindResize() {
        let timer = null;

        let prevWidth = window.innerWidth;

        window.addEventListener("resize", () => {
            if(!this._indicator) return;

            const currentWidth = window.innerWidth;

            if(currentWidth === prevWidth)  {
                clearTumeout(timer);
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

    _initIndicator(tab) {
        if (!this._indicator || !tab) return;

        const prevTransition = this._indicator.style.transition;
        this._indicator.style.transition = "none";

        window.addEventListener("load", () => {
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
        });
    }


    _moveDepth1Indicator(tab) {
        const tabRect = tab.getBoundingClientRect();
        const parentRect = tab.parentNode.getBoundingClientRect();
        const x = tabRect.left - parentRect.left;
        const w = tabRect.width ;
        this._indicator.style.width = w + "px";
        this._indicator.style.transform = `translateX(${x + tab.parentNode.scrollLeft}px)`;
    }

    _activateDepth1Tab(tab) {
        if(tab) {
            const targetId = tab.dataset.target;
            
            // fixed-width-tab 클래스가 있는 경우 depth1 탭 상태 변경 없이 depth2만 활성화
            const isFixedWidth = this._element.classList.contains("fixed-width-tab");

            if (!isFixedWidth) {
                this._tabs.forEach((t) => {
                    t.setAttribute("aria-selected", "false");
                    t.classList.remove("active");
                    t.hidden = true;
                });
                tab.setAttribute("aria-selected", "true");
                tab.classList.add("active");
                tab.hidden = false;
            }

            const depth2Group = this._element.querySelectorAll(".depth2");
            const depth2Wraps = this._element.querySelectorAll(".depth2-wrap");

            // 모든 depth2-wrap을 display:none 처리
            depth2Wraps.forEach((wrap) => {
                wrap.style.display = "none";
            });

            depth2Group.forEach((group) => {
                group.classList.remove("active");
                if (group.id === targetId){
                    group.classList.add("active");
                    // 활성화된 depth2의 wrap만 display:block 처리
                    const wrap = group.closest(".depth2-wrap");
                    if (wrap) {
                        wrap.style.display = "block";
                    }
                }            
            });


            // fixed-width-tab이 아닌 경우에만 1뎁스 패널 컨테이너 숨김 처리
            if (!isFixedWidth) {
                const panelList = this._element.querySelector(".panel-list");
                if (panelList) {
                    const allDepth1Panels = Array.from(panelList.children);
                    allDepth1Panels.forEach((panel) => {
                        panel.hidden = true;
                    });
                }
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
                            const tabsContainers = panel.querySelectorAll(".tabs-container");
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
                
                this._initDepth2(targetId);
            }

            let timer = null;
            clearTimeout(timer);
            if (this._indicator) {
                timer = setTimeout(() => {
                    this._initIndicator(tab);
                }, 150);
            }

            // active 탭을 화면 중앙으로 스크롤
            requestAnimationFrame(() => {
                this._scrollTabIntoViewCenter(tab);
            });
        }
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

        this._subTabs = this._subDetp2Tabs.querySelectorAll(".tab");
        
        if (!this._subTabs || this._subTabs.length === 0) {
            return;
        }
        
        // 초기 상태: 모든 탭을 hidden 처리
        this._subTabs.forEach((t) => {
            t.hidden = true;
        });

        this._setupScrollNav(this._subDetp2Tabs);

        this._dept2EventBind();

        const activeTab = this._subDetp2Tabs.querySelector(".tab[aria-selected='true']") || this._subTabs[0];

        if (activeTab) {
            this._activateDepth2Tab(activeTab);
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
        requestAnimationFrame(() => {
            this._scrollTabIntoViewCenter(tab);
        });
    }

    _dept1EventBind() {
        this._tabs.forEach((tab) =>  tab.addEventListener("click", () => {
            this._activateDepth1Tab(tab);
            this._scrollTabIntoViewCenter(tab);
        }));
    }


    _dept2EventBind() {
        if (!this._subTabs) return;
        this._subTabs.forEach((tab) =>  tab.addEventListener("click", () => {
            this._activateDepth2Tab(tab);
            this._scrollTabIntoViewCenter(tab);
        }));
    }

    _dept2EventBindForContainer(container) {
        const subTabs = container.querySelectorAll(".tab");
        if (!subTabs.length) return;
        
        subTabs.forEach((tab) => {
            tab.addEventListener("click", () => {
                const allTabs = container.querySelectorAll(".tab");
                allTabs.forEach((t) => {
                    t.setAttribute("aria-selected", "false");
                    t.classList.remove("active");
                    t.hidden = true;
                });
                tab.setAttribute("aria-selected", "true");
                tab.classList.add("active");
                tab.hidden = false;
                this._scrollTabIntoViewCenter(tab);
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
            const tabs = list.querySelectorAll(".tab");
            tabs.forEach((t) => {
                t.hidden = true;
            });
            
            this._setupScrollNav(list);
            this._dept2EventBindForContainer(list);
            
            // depth2-wrap 초기 상태: display:none 처리
            const wrap = list.closest(".depth2-wrap");
            if (wrap) {
                wrap.style.display = "none";
            }
        });
    }

    _setupScrollNav(container) {
        if (!container) return;

        // 컨테이너를 relative로 설정
        const containerStyle = getComputedStyle(container);
        if (containerStyle.position === "static") {
            container.style.position = "relative";
        }

        // depth1-wrap / depth2-wrap으로 컨테이너(depth1·depth2)를 밖에서 감싸고, prev·next를 래퍼 안에 배치
        const wrapClass = container.classList.contains("depth1") ? "depth1-wrap" : "depth2-wrap";
        
        // 이미 wrap이 있는지 확인
        let wrap = container.closest("." + wrapClass);
        
        if (!wrap) {
            // wrap이 없으면 새로 생성
            wrap = document.createElement("div");
            wrap.className = wrapClass;
            
            const parent = container.parentElement;
            if (parent) {
                parent.insertBefore(wrap, container);
                wrap.appendChild(container);
            } else {
                wrap.appendChild(container);
            }
        }
        
        // prev/next 버튼이 이미 있는지 확인
        let prevBtn = wrap.querySelector(".scroll-nav.prev");
        let nextBtn = wrap.querySelector(".scroll-nav.next");
        
        if (!prevBtn) {
            prevBtn = this._createScrollNavButton("prev");
            wrap.insertBefore(prevBtn, wrap.firstChild);
            // 이벤트 리스너는 한 번만 추가
            prevBtn.addEventListener("click", () => this._scrollByDevice(container, -1));
        }
        
        if (!nextBtn) {
            nextBtn = this._createScrollNavButton("next");
            wrap.appendChild(nextBtn);
            // 이벤트 리스너는 한 번만 추가
            nextBtn.addEventListener("click", () => this._scrollByDevice(container, 1));
        }

        // 스크롤 상태 업데이트는 항상 설정 (중복 방지를 위해 이벤트 리스너 제거 후 추가)
        const update = () => this._updateScrollNavState(container, prevBtn, nextBtn, wrap);
        
        // 기존 이벤트 리스너 제거 후 추가 (중복 방지)
        const scrollHandler = container._scrollNavUpdateHandler;
        if (scrollHandler) {
            container.removeEventListener("scroll", scrollHandler, { passive: true });
        }
        container._scrollNavUpdateHandler = update;
        container.addEventListener("scroll", update, { passive: true });
        
        const resizeHandler = window._scrollNavResizeHandlers || (window._scrollNavResizeHandlers = new Map());
        if (!resizeHandler.has(container)) {
            const resizeUpdate = () => update();
            resizeHandler.set(container, resizeUpdate);
            window.addEventListener("resize", resizeUpdate);
        }
        
        requestAnimationFrame(update);
        
        // 초기화 완료 표시
        container.dataset.scrollNavInit = "true";
    }

    _createScrollNavButton(direction) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `scroll-nav ${direction}`;
        button.setAttribute("aria-hidden", "true");

        button.dataset.scrollNav = direction;
        button.textContent = direction === "prev" ? "이전" : "다음";
        return button;
    }

    _scrollByDevice(container, direction) {
        const distance = Math.round(window.innerWidth * 0.7);
        if (distance <= 0) return;

        // CSS scroll-behavior 적용
        const originalScrollBehavior = container.style.scrollBehavior;
        container.style.scrollBehavior = "smooth";

        const max = container.scrollWidth - container.clientWidth;
        if (max <= 0) {
            container.style.scrollBehavior = originalScrollBehavior;
            return;
        }

        const target = Math.max(0, Math.min(container.scrollLeft + direction * distance, max));
        if (Math.abs(target - container.scrollLeft) < 1) {
            container.style.scrollBehavior = originalScrollBehavior;
            return;
        }

        requestAnimationFrame(() => {
            container.scrollTo({ left: target, behavior: "smooth" });
            // 스크롤 완료 후 원래 scroll-behavior 복원
            setTimeout(() => {
                container.style.scrollBehavior = originalScrollBehavior;
            }, 500);
        });
    }

    _updateScrollNavState(container, prevBtn, nextBtn, wrap) {
        const max = container.scrollWidth - container.clientWidth;
        if (max <= 0) {
            prevBtn.style.display = "none";
            nextBtn.style.display = "none";
            container.classList.remove("depth-prev", "depth-next");
            return;
        }

        const left = container.scrollLeft;
        const tolerance = 1; // 스크롤 위치 허용 오차
        
        // prev 버튼: 왼쪽 끝에 있으면 숨김
        if (left <= tolerance) {
            prevBtn.style.display = "none";
            container.classList.remove("depth-prev");
        } else {
            prevBtn.style.display = "block";
            container.classList.add("depth-prev");
        }
        
        // next 버튼: 오른쪽 끝에 있으면 숨김
        if (left >= max - tolerance) {
            nextBtn.style.display = "none";
            container.classList.remove("depth-next");
        } else {
            nextBtn.style.display = "block";
            container.classList.add("depth-next");
        }
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

}


window.addEventListener("load", () => {
    // ScrollTabs 초기화
    const scrollTabsContainers = document.querySelectorAll(".scroll-tabs-container");
    scrollTabsContainers.forEach((container) => {
        // initiated 클래스가 있어도 초기화 (이미 있는 경우 재초기화 방지)
        if (!container.dataset.scrollTabsInitialized) {
            new ScrollTabs(container);
            container.dataset.scrollTabsInitialized = "true";
        }
    });
});

// DOMContentLoaded에서도 초기화 시도
document.addEventListener("DOMContentLoaded", () => {
    const scrollTabsContainers = document.querySelectorAll(".scroll-tabs-container");
    scrollTabsContainers.forEach((container) => {
        if (!container.dataset.scrollTabsInitialized) {
            new ScrollTabs(container);
            container.dataset.scrollTabsInitialized = "true";
        }
    });
});


const index  = {
    ScrollTabs,
    SolidTabsUpdate
}
