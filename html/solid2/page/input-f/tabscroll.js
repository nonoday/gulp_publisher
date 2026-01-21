

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
        this._panels = this._depth1.querySelectorAll("[role='tabpanel']:not(.ui-tab-inner [role='tabpanel'])");
        this._indicator = this._depth1.querySelector(".tab-indicator");

        if(!this._tabs.length) return;

        // 스크롤 네비게이션은 항상 설정
        this._setupScrollNav(this._depth1);
        this._setupAllDepth2ScrollNav();

        // indicator가 있는 경우에만 관련 기능 활성화
        if(this._indicator) {
            this._dept1EventBind();
            this._bindResize();
            
            //초기활성화
            const activeTab = this._element.querySelector(".tab[aria-selected='true']") || this._tabs[0]
            this._initIndicator(activeTab);
            this._activateDepth1Tab(activeTab);
        } else {
            // indicator가 없어도 탭 클릭 이벤트는 동작하도록
            this._dept1EventBind();
            const activeTab = this._element.querySelector(".tab[aria-selected='true']") || this._tabs[0]
            if(activeTab) this._activateDepth1Tab(activeTab);
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

        const prevTransition = this._indicator.style.transition;
        this._indicator.style.transition = "none";

        window.addEventListener("load", () => {
            requestAnimationFrame(() => {
                tab.parentNode.scrollLeft = tab.parentNode.scrollLeft || 0;

                if(this._defaultTab) tab = this._defaultTab;
                this._moveDepth1Indicator(tab);

                requestAnimationFrame(() => {
                    this._indicator.style.transition = prevTransition || '';
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

            this._tabs.forEach((t) => {
                t.setAttribute("aria-selected", "false");
                t.classList.remove("active");
            });
            tab.setAttribute("aria-selected", "true");
            tab.classList.add("active");

            const depth2Group = this._element.querySelectorAll(".depth2");

            depth2Group.forEach((group) => {
                group.classList.remove("active");
                if (group.id === targetId){
                    group.classList.add("active");
                }            
            });


            if (!targetId) {
                this._panels.forEach((p) => (p.hidden = true));
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
            } else {
                this._initDepth2(targetId);
            }

            let timer = null;
            clearTimeout(timer);
            timer = setTimeout(() => {
                this._initIndicator(tab);
            }, 150);

            // active 탭을 화면 중앙으로 스크롤
            requestAnimationFrame(() => {
                this._scrollTabIntoViewCenter(tab);
            });
        }
    }

    _initDepth2(targetId) {
        if (!this._element) return;

        this._subDetp2Tabs = this._element.querySelector("#" + targetId);
        this._subPanels = this._element.querySelectorAll("[role='tabpanel']");
        
        if(!this._subDetp2Tabs) {
            this._subPanels.forEach((p) => (p.hidden = true));
            return;
        }

        this._subTabs = this._subDetp2Tabs.querySelectorAll(".tab");
        this._setupScrollNav(this._subDetp2Tabs);

        this._dept2EventBind();

        const activeTab = this._subDetp2Tabs.querySelector(".tab[aria-selected='true']") || this._subTabs[0];

        if (activeTab) this._activateDepth2Tab(activeTab);

    }


    _activateDepth2Tab(tab) {
        this._subTabs.forEach((t) => {
            t.setAttribute("aria-selected", "false");
            t.classList.remove("active");
        });
        tab.setAttribute("aria-selected", "true");
        tab.classList.add("active");

        this._subPanels.forEach((p) => (p.hidden = true));
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
                });
                tab.setAttribute("aria-selected", "true");
                tab.classList.add("active");
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
            this._setupScrollNav(list);
            this._dept2EventBindForContainer(list);
        });
    }

    _setupScrollNav(container) {
        if (!container || container.dataset.scrollNavInit === "true") return;

        container.dataset.scrollNavInit = "true";

        // 컨테이너를 relative로 설정
        const containerStyle = getComputedStyle(container);
        if (containerStyle.position === "static") {
            container.style.position = "relative";
        }

        const prevBtn = this._createScrollNavButton("prev");
        const nextBtn = this._createScrollNavButton("next");

        // depth1-wrap / depth2-wrap으로 컨테이너(depth1·depth2)를 밖에서 감싸고, prev·next를 래퍼 안에 배치
        const wrapClass = container.classList.contains("depth1") ? "depth1-wrap" : "depth2-wrap";
        const wrap = document.createElement("div");
        wrap.className = wrapClass;

        const parent = container.parentElement;
        if (parent) {
            parent.insertBefore(wrap, container);
            wrap.appendChild(container);
            wrap.insertBefore(prevBtn, wrap.firstChild);
            wrap.appendChild(nextBtn);
        } else {
            wrap.appendChild(prevBtn);
            wrap.appendChild(container);
            wrap.appendChild(nextBtn);
        }

        prevBtn.addEventListener("click", () => this._scrollByDevice(container, -1));
        nextBtn.addEventListener("click", () => this._scrollByDevice(container, 1));

        const update = () => this._updateScrollNavState(container, prevBtn, nextBtn, wrap);
        container.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
        requestAnimationFrame(update);
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
