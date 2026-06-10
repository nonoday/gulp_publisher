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

        // 이미 초기화된 아코디언이면 이벤트가 중복 바인딩되지 않도록 중단.
        if(!element || element.classList.contains("initiated")) {
            return element?._accordionInstance || {};
        }

        if (element._accordionPendingInstance) {
            return element._accordionPendingInstance;
        }

        super(element);

        // 공지형 아코디언은 열림 완료 후 타이틀 위치로 스크롤하는 옵션이 필요하다.
        if(element.classList.contains("accordion-notice")) this._isNotice = true;

        // 외부에서 openContent(true/false)를 직접 호출하는 제어형 아코디언 여부.
        if(getDataAttribute(element, "accordion-control")) this._isAccordionControl = true;

        this._element = element;
        this._isInitialized = false;

        // 탭 패널 안에서 처음 활성화될 때는 자동 스크롤을 한 번 건너뛰기 위한 플래그.
        this._isActive = true;

        // notice 타입에서 열림 transition이 끝난 뒤 스크롤할지 여부.
        this._isScrollArmed = false;

        // openContent 호출 시점에 스크롤 기능을 끄고 켤 수 있는 옵션값.
        this._isScroll = true;

        this._heightUpdateFrame = null;

        if (!this._resolveElements()) {
            this._waitForStructure();
            return;
        }

        this._completeInit();
    }

    _resolveElements() {
        this._accoTitleWrap = this._element.querySelector(".acco-title-wrap");
        this._accoContentWrap = this._element.querySelector(".acco-content-wrap");

        // 실제 높이 계산 기준이 되는 내부 콘텐츠. 없으면 wrap 자체를 기준으로 사용.
        this._accoContent = this._element.querySelector(".acco-content");

        return !!(this._accoTitleWrap && this._accoContentWrap);
    }

    _waitForStructure() {
        if (this._element._accordionPendingInstance) return;

        this._element._accordionPendingInstance = this;

        // 개발/앱 환경에서 아코디언 뼈대가 비동기로 늦게 들어오면 최초 호출 시점에는
        // .acco-title-wrap 또는 .acco-content-wrap이 없을 수 있어 준비될 때까지 대기.
        this._structureObserver = new MutationObserver(() => {
            if (!this._resolveElements()) return;

            this._structureObserver.disconnect();
            this._structureObserver = null;
            this._element._accordionPendingInstance = null;
            this._completeInit();
        });

        this._structureObserver.observe(this._element, {
            childList: true,
            subtree: true
        });
    }

    _completeInit() {
        if (this._isInitialized || this._element.classList.contains("initiated")) return;

        this._isInitialized = true;
        this._element._accordionInstance = this;
        this._element.classList.add("initiated");

        // 처음부터 on 클래스가 있으면 현재 콘텐츠 높이로 펼쳐진 상태를 맞춘다.
        if (this._element.classList.contains("on")) {
            this._setHeight({ animate: false });
        }

        this._init();
        this._eventBind();
        this._bindResize();
    }

    _bindResize() {
        let timer = null;
        let prevWidth = window.innerWidth;

        // 모바일 주소창 변화처럼 높이만 바뀌는 resize는 무시하고, 실제 가로폭 변경 때만 재계산.
        window.addEventListener("resize", () => {
            const currentWidth = window.innerWidth;
            if (currentWidth !== prevWidth) {
                clearTimeout(timer);
                timer = setTimeout(() => {
                    // 열린 아코디언은 줄바꿈/반응형 변화로 콘텐츠 높이가 달라질 수 있어 다시 맞춘다.
                    if (this._element.classList.contains("on")) {
                        this._setHeight({ animate: false });
                    }
                    prevWidth = currentWidth;
                }, 100);
            }
        });
    }

    _scroll() {
        if (!this._isScroll) return;

        const ae = document.activeElement;

        // 입력 중 스크롤이 발생하면 키보드/커서 위치가 흔들릴 수 있어 스크롤하지 않는다.
        if (ae && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA" || ae.isContentEditable)) return;

        if(this._element.closest('[role="tabpanel"]')) {
            // 탭 패널이 활성화되며 열린 아코디언을 세팅하는 최초 동작은 스크롤 생략.
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
            // 닫힌 상태에서는 콘텐츠 높이를 맞출 필요가 없다.
            if (!this._element.classList.contains("on")) return;

            let needUpdate = false;
            for (const mutation of mutations) {
                // 중요: MutationObserver는 .acco-content-wrap 자체의 style 변경도 감지.
                // 그런데 _setHeight() / _setCloseHeight()가 이 wrapper에 height, overflow, display를 직접 쓰기 때문에,
                // observer가 스크립트가 만든 style 변경을 다시 보고 _setHeight()를 반복 호출하는 루프가 생길 수 있다.
                // 따라서 wrapper 자체의 style mutation은 콘텐츠 변경이 아니라 내부 제어용 변경으로 보고 제외.
                if (mutation.type === "attributes" &&
                    mutation.attributeName === "style" &&
                    mutation.target === this._accoContentWrap) {
                    continue;
                }

                // 내부 콘텐츠가 바뀌거나 style 변경으로 높이가 달라질 수 있는 경우만 갱신.
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
                // 동적으로 콘텐츠가 추가/변경된 경우에는 클릭 열림 애니메이션을 다시 타지 않고
                // 최종 높이만 보정. 여러 mutation이 한 번에 들어오면 한 프레임에 한 번만 처리해
                // scrollHeight 읽기와 style 쓰기가 반복되며 반응이 느려지는 상황을 줄인다.
                this._scheduleHeightUpdate();
            }

            // wrapper 자체 style mutation은 위에서 제외하므로 observer를 끊지 않는다.
            // disconnect/reconnect 방식을 쓰면 여러 태그가 짧은 시간에 연속 추가될 때
            // 재연결 전 들어온 mutation을 놓쳐 최종 높이가 덜 반영될 수 있다.
        });

        this._observeConfig = {
            childList: true,
            attributes: true,
            attributeFilter: ["style"],
            characterData: true,
            subtree: true
        };

        // 동적 렌더링에서 .acco-content 자체가 새 노드로 교체될 수 있으므로 wrapper 관찰.
        // 대신 wrapper 자신에게 스크립트가 쓰는 style 변경은 위 mutation 루프에서 제외해 반복 호출을 막는다.
        mutationObserver.observe(this._accoContentWrap, this._observeConfig);

        this.mutationObserver = mutationObserver;

        if (window.ResizeObserver) {
            this._resizeObserver = new ResizeObserver(() => {
                // 이미지 로딩, 폰트 반영, 비동기 컴포넌트 렌더링처럼 DOM mutation 이후 실제 박스 크기가
                // 달라지는 경우는 ResizeObserver가 더 정확하게 잡아준다.
                this._scheduleHeightUpdate();
            });
            this._observeContentResize();
        }
    }

    _observeContentResize() {
        if (!this._resizeObserver) return;

        const content = this._getContentElement();
        if (!content || content === this._resizeObserverTarget) return;

        if (this._resizeObserverTarget) {
            this._resizeObserver.unobserve(this._resizeObserverTarget);
        }

        this._resizeObserverTarget = content;
        this._resizeObserver.observe(content);
    }

    _scheduleHeightUpdate() {
        // 닫힌 상태에서는 다음 열림 때 새 높이를 계산하면 되므로 예약된 보정 제거.
        if (!this._element.classList.contains("on")) {
            if (this._heightUpdateFrame) {
                cancelAnimationFrame(this._heightUpdateFrame);
                this._heightUpdateFrame = null;
            }
            return;
        }

        // 동적 태그가 여러 개 연속으로 붙어도 같은 frame 안에서는 높이 보정을 한 번만 실행.
        if (this._heightUpdateFrame) return;

        this._heightUpdateFrame = requestAnimationFrame(() => {
            this._heightUpdateFrame = null;

            if (!this._element.classList.contains("on")) return;

            this._observeContentResize();

            if (this._element.classList.contains("is-animating")) {
                // 열리는 중에 동적 콘텐츠가 붙으면 transition을 취소하지 않고 목표 height만 새로 맞춘다.
                // 이렇게 하면 애니메이션 완료까지 기다리는 지연 없이 현재 transition이 새 높이로 이어진다.
                this._accoContentWrap.style.height = this._getContentHeight() + "px";
                return;
            }

            this._setHeight({ animate: false });
        });
    }

    _setHeight(options = {}) {
        const element = this._element;
        let wrap = this._accoContentWrap;
        if (!wrap) return;

        // 빠른 연속 클릭으로 진행 중인 transition이 있으면 이전 완료 콜백을 먼저 제거.
        this._cancelHeightTransition();

        const animate = options.animate !== false;

        if (!animate) {
            const previousTransition = wrap.style.transition;

            // 초기 열린 상태, resize, 동적 콘텐츠 추가는 사용자 클릭이 아니므로
            // transition을 잠시 꺼서 깜빡임 없이 최종 높이로 바로 맞춘다.
            wrap.style.transition = "none";
            wrap.style.overflow = "auto";
            wrap.style.display = "block";
            setAriaAttribute(this._accoTitleWrap, "expanded", true);
            wrap.removeAttribute("hidden");
            wrap.style.height = this._getContentHeight() + "px";
            wrap.offsetHeight;
            wrap.style.transition = previousTransition;
            element?.classList.remove('is-animating');
            return;
        }

        // 열리던 중 다시 열기 요청이 들어올 수도 있으므로 현재 보이는 높이에서 새 transition 시작.
        const currentHeight = wrap.getBoundingClientRect().height;

        wrap.style.overflow = "hidden";
        wrap.style.display = "block";
        wrap.style.height = currentHeight > 0 ? currentHeight + "px" : "0px";
        setAriaAttribute(this._accoTitleWrap, "expanded", true);
        wrap.removeAttribute("hidden");

        // 현재 height 값을 브라우저에 강제로 반영해 다음 frame의 height 변경이 transition으로 잡히게 설정.
        wrap.offsetHeight;

        // 다음 frame에서 실제 콘텐츠 높이로 변경해야 0px/currentHeight -> scrollHeight 애니메이션 동작.
        requestAnimationFrame(() => {
            let height = this._getContentHeight();
            wrap.style.height = height + "px";
            wrap.dispatchEvent(new CustomEvent("accordion:opened", { bubbles: true }));
        });

        this._onceHeightTransition(() => {
            // 열림이 끝난 뒤 내부 스크롤이 필요한 긴 콘텐츠는 스크롤 가능하게 되돌린다.
            if (wrap.style.height !== "0px") {
                wrap.style.overflow = "auto";
            }

            // transition 완료 후 다음 클릭을 받을 수 있도록 애니메이션 상태 해제.
            element?.classList.remove('is-animating');
        });
    }

    _getContentHeight() {
        const wrap = this._accoContentWrap;
        const content = this._getContentElement() || wrap;

        // wrapper에는 이전 높이가 inline height로 남아있을 수 있다.
        // 이때 wrap.scrollHeight를 함께 쓰면 콘텐츠가 줄어든 뒤에도 이전 큰 높이를 유지하므로
        // 실제 현재 콘텐츠 요소의 scrollHeight를 우선 기준으로 삼는다.
        return content === wrap ? wrap.scrollHeight : content.scrollHeight;
    }

    _getContentElement() {
        const content = this._element.querySelector(".acco-content");

        if (content && content !== this._accoContent) {
            this._accoContent = content;
        }

        return this._accoContent;
    }

    _setCloseHeight() {
        const element = this._element;
        let wrap = this._accoContentWrap;
        if (!wrap) return;

        // 빠른 연속 클릭으로 열림 transition 중 닫기가 들어오면 이전 transition 완료 처리 취소.
        this._cancelHeightTransition();

        // 현재 화면에 보이는 높이를 시작점으로 삼아 자연스럽게 반대로 접히도록 설정.
        const currentHeight = wrap.getBoundingClientRect().height || wrap.scrollHeight;

        setAriaAttribute(this._accoTitleWrap, "expanded", false);
        wrap.style.overflow = "hidden";
        wrap.style.display = "block";
        wrap.removeAttribute("hidden");
        wrap.style.height = currentHeight + "px";

        // 시작 높이를 브라우저에 먼저 확정시킨 뒤 0px로 바꿔야 닫힘 transition 발생.
        wrap.offsetHeight;

        requestAnimationFrame(() => {
            wrap.style.height = "0px";
        });

        this._onceHeightTransition(() => {
            // 닫힘 완료 후에는 포커스/접근성/레이아웃에서 제외되도록 hidden과 display none 적용.
            wrap.style.overflow = "hidden";
            wrap.style.display = "none";
            wrap.setAttribute("hidden", true);

            // transition 완료 후 다음 클릭을 받을 수 있도록 애니메이션 상태 해제.
            element?.classList.remove('is-animating');
        });
    }

    _cancelHeightTransition() {
        // 이전 transition의 transitionend/timer 콜백이 뒤늦게 실행되어 상태를 덮어쓰는 것을 방지.
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
            // transitionend와 fallback timer가 모두 들어올 수 있으므로 완료 처리는 한 번만 실행.
            if (completed) return;
            completed = true;
            wrap.removeEventListener("transitionend", onEnd);
            clearTimeout(timer);
            this._heightTransitionCleanup = null;
            callback();
        };

        const onEnd = (event) => {
            // 자식 요소 transition이 버블링될 수 있으므로 실제 wrap의 height transition만 처리.
            if (event.target !== wrap) return;
            if (event.propertyName && event.propertyName !== "height") return;
            done();
        };

        // 일부 환경에서는 hidden/display 변경, 0초 transition, 빠른 클릭 때문에 transitionend가 누락될 수 있다.
        // CSS transition 시간보다 조금 늦게 fallback을 걸어 is-animating이 영구히 남지 않게 설정.
        const timer = setTimeout(done, this._getHeightTransitionTime(wrap) + 50);
        wrap.addEventListener("transitionend", onEnd);

        // 빠른 연속 클릭 시 새 transition을 시작하기 전에 이전 완료 대기 로직을 취소하기 위한 cleanup.
        this._heightTransitionCleanup = () => {
            if (completed) return;
            completed = true;
            wrap.removeEventListener("transitionend", onEnd);
            clearTimeout(timer);
        };
    }

    _getHeightTransitionTime(element) {
        // CSS transition-duration/delay를 읽어 fallback timer 시간 계산.
        // 여러 transition이 선언되어 있으면 가장 긴 시간을 기준으로 사용.
        const style = window.getComputedStyle(element);
        const durations = style.transitionDuration.split(",").map(this._toMilliseconds);
        const delays = style.transitionDelay.split(",").map(this._toMilliseconds);
        const times = durations.map((duration, index) => duration + (delays[index] || delays[0] || 0));
        return Math.max(...times, 0);
    }

    _toMilliseconds(value) {
        // CSS 시간 단위(s/ms)를 setTimeout에서 쓸 millisecond 값으로 변환.
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
            // 일반 아코디언은 타이틀 버튼 클릭으로 열고 닫는다.
            this._handleTitleClick = () => this.openContent();
            this._accoTitleWrap.addEventListener("click", this._handleTitleClick);
        }

        this._accoContentWrap.addEventListener("transitionend", (e) => {
            // notice 타입에서 열림 완료 후 스크롤하기 위한 transition 감지.
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

            // 탭이 다시 활성화될 때, 이미 열린 아코디언의 최초 스크롤 생략 상태 복구.
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
        const parentNode = this?._accoTitleWrap?.closest(".accordion-area");
        if (!parentNode) return;
        const willOpen = !parentNode.classList.contains("on");

        // 클릭이 들어온 시점부터 애니메이션 상태로 표시.
        // 빠른 연속 클릭도 허용해야 하므로 여기서 return으로 막지 않는다.
        this._element.classList.add("is-animating");

        // 제어형 호출에서 스크롤을 끌 수 있도록 호출값 보관.
        this._isScroll = isScroll;

        const _closeFn = () => {
            // 상태 클래스는 먼저 닫힘으로 바꾸고, 현재 높이에서 0px로 접는다.
            parentNode.classList.remove("on");
            this._setCloseHeight();
            this._isScrollArmed = false;
        }

        const _openFn = () => {
            // 상태 클래스는 먼저 열림으로 바꾸고, 현재 높이에서 콘텐츠 높이까지 펼친다.
            parentNode.classList.add("on");
            this._setHeight();
        }
        if(!this._isAccordionControl) {
            // notice 타입은 열릴 때만 transition 완료 후 스크롤하도록 준비.
            if(willOpen && this._isNotice) {
                this._isScrollArmed = true;
            }

            // 일반 클릭형 아코디언은 현재 on 상태를 기준으로 토글.
            if (parentNode.classList.contains("on")) {
                _closeFn();
            } else {
                _openFn();
            }
        } else {
            // 제어형 아코디언은 외부에서 넘긴 isOpen 값을 명시적인 목표 상태로 사용.
            if(!isOpen) {
                _closeFn();
            } else {
                _openFn();
            }
            return isOpen ? false : true;
        }
    }
}
