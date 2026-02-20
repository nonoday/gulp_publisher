// 헬퍼 함수들
function getElement(element) {
    if (typeof element === 'string') {
        return document.querySelector(element);
    }
    return element;
}

function getDataAttribute(element, attribute) {
    if (!element) return null;
    const attrName = `data-${attribute}`;
    return element.getAttribute(attrName);
}

function generateRandonCode(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

class BaseComponent {
    constructor(element) {
        this.element = element;
        this._element = element;
    }
    
    dispose() {
        // 기본 dispose 메서드
    }
}

class UISwiper extends BaseComponent {
    
    constructor(element) {
        const el = getElement(element);
        if (!el) {
            return {};
        }
        
        if(el.classList.contains("initiated")) {
            return {};
        }

        super(element);

        let options =  getDataAttribute(this._element, "swiper-options");
        if (typeof options === "string") {
            options = window[options];
        }

        this.options = {
            ... {
                pagination: {
                    el: ".swiper-pagination",
                    clickable: true,
                },
                scrollbar: {
                    el: ".swiper-scrollbar",
                },
                a11y: {
                    prevSlideMessage: "이전 슬라이드",
                    nextSlideMessage: "다음 슬라이드",
                    slideLabelMessage: "총 {{slidesLength}}장의 슬라이드 중 {{index}}번째 슬라이드 입니다.",
                },
                on: {
                    slideChangeTransitionEnd: function (swiper) {
                        const wrapperEl = swiper.el || swiper.wrapperEl?.parentElement || swiper.$wrapperEl?.[0];
                        if (!wrapperEl) return;
                        
                        let swiperSlides = wrapperEl.querySelectorAll(".swiper-slide");
                        let swiperSlideActive = wrapperEl.querySelector(".swiper-slide-active");
                        
                        if (swiperSlides !== null && swiperSlides.length > 0) {
                            swiperSlides.forEach((element) => {
                                element.setAttribute("aria-hidden", "true");
                            });
                        }
                        if (swiperSlideActive !== null) {
                            swiperSlideActive.removeAttribute("aria-hidden");
                        }
                    },
                    init : function (swiper) {
                        setPageNum(this);
                    },
                    slideChangeTransitionStart : function (swiper) {
                        setPageNum(this);
                    },
                }
            },
            ...(typeof options === "object" ? options : {}),
        };


        if (this._element.querySelectorAll(".swiper-slide").length <= 1) {
            const autoplayControl = this._element.querySelector(".autoplay-control-wrap");
            if (autoplayControl !== null) {
                delete this.options.loop;
                delete this.options.autoplay;
                autoplayControl.setAttribute("hidden", "hidden");
            }
        }

        this.instanceName = getDataAttribute(this._element, "swiper-instance");
        this.id = `swiper-${generateRandonCode(4)}`;
        this._element.id = this.id;
        this._swiper = null;

        this.swiperInit();
    }
    

    static get NAME() {
        return "uiSwiper";
    }

    swiperInit() {
        try {
            this.swiper = new Swiper(`#${this.id}`, this.options);
        } catch (error) {
            console.error('[swiperInit] Swiper 생성 오류:', error);
            return;
        }

        Object.values(this._element.querySelectorAll(".swiper-wrapper")).map((obj) => {
            obj.removeAttribute("aria-live");
        });

        Object.values(this._element.querySelectorAll(".swiper-slide")).map((obj) => {
            obj.removeAttribute("role");
        });

        if (typeof this.instanceName === "string") {
            window[this.instanceName] = this.swiper;
        }

        this.swiper.on("destroy", () => {
            this.dispose();
        });

        if (this.options.autoplay) {
            (() => {
                const thisSlide = this;
                const autoPlayBtn = this._element.querySelector(".autoplay-control-wrap > button");
                const pagination = this._element.querySelector(".swiper-pagination");

                if (autoPlayBtn === null) {
                    return;
                }
                
                const paginationDot = pagination ? pagination.querySelectorAll(".swiper-pagination-bullet") : [];

                autoPlayBtn.setAttribute("aria-label", "정지");
                autoPlayBtn.removeAttribute("aria-pressed");
                autoPlayBtn.setAttribute("data-aria-autoplay", "true");

                // 포커스가 체크해야 할 영역에 있는지 확인하는 함수
                // 현재 Swiper 인스턴스 내부의 요소만 체크
                const isFocusInTargetArea = (element) => {
                    if (!element) return false;
                    
                    // 현재 Swiper 인스턴스 내부에 있는지 먼저 확인
                    if (!thisSlide._element.contains(element)) {
                        return false;
                    }
                    
                    // 정지/재생 버튼은 포커스 타겟 영역에서 제외 (사용자가 명시적으로 제어하는 버튼)
                    if (element === autoPlayBtn || element.closest('.autoplay-control-wrap') === autoPlayBtn.closest('.autoplay-control-wrap')) {
                        return false;
                    }
                    
                    // swiper-slide 내부의 a, button 체크
                    const slide = element.closest('.swiper-slide');
                    if (slide && thisSlide._element.contains(slide)) {
                        const isLinkOrButton = element.tagName === 'A' || element.tagName === 'BUTTON';
                        if (isLinkOrButton && slide.contains(element)) {
                            return true;
                        }
                    }
                    
                    // control-box 내부의 button, a 체크 (정지/재생 버튼 제외)
                    const controlBox = element.closest('.control-box');
                    if (controlBox && thisSlide._element.contains(controlBox)) {
                        // 정지/재생 버튼이면 제외
                        if (element === autoPlayBtn || element.closest('.autoplay-control-wrap')) {
                            return false;
                        }
                        const isLinkOrButton = element.tagName === 'A' || element.tagName === 'BUTTON';
                        if (isLinkOrButton && controlBox.contains(element)) {
                            return true;
                        }
                    }
                    
                    return false;
                };

                // 포커스 상태 추적
                let hasFocusInTargetArea = false;
                let pausedByFocus = false;
                let userPaused = false; // 사용자가 명시적으로 정지한 경우를 추적
                let focusCheckTimeout = null;

                // 오토플레이 정지 함수 (포커스로 인한 정지)
                const stopAutoplay = () => {
                    const autoPlayState = autoPlayBtn.getAttribute("data-aria-autoplay");
                    const hasAutoplay = !!(thisSlide.swiper && thisSlide.swiper.autoplay);
                    const isRunning = hasAutoplay ? thisSlide.swiper.autoplay.running : false;
                    
                    // 포커스가 들어왔을 때는 항상 pausedByFocus를 true로 설정
                    if (hasFocusInTargetArea) {
                        pausedByFocus = true;
                    }
                    
                    if (autoPlayState === "true" && hasAutoplay && isRunning) {
                        pausedByFocus = true;
                        autoPlayBtn.setAttribute("aria-label", "재생");
                        autoPlayBtn.setAttribute("data-aria-autoplay", "false");
                        thisSlide.swiper.autoplay.stop();
                    }
                };

                // 오토플레이 재개 함수 (포커스가 나갔을 때)
                const resumeAutoplay = () => {
                    // 사용자가 명시적으로 정지한 경우에는 자동으로 재생하지 않음
                    if (userPaused) {
                        return;
                    }
                    
                    const autoPlayState = autoPlayBtn.getAttribute("data-aria-autoplay");
                    const hasAutoplay = !!(thisSlide.swiper && thisSlide.swiper.autoplay);
                    
                    // 현재 상태가 정지 상태("false")인 경우 재생하지 않음
                    if (autoPlayState === "false") {
                        return;
                    }
                    
                    // 포커스가 나갔고, 이전에 포커스로 인해 정지된 경우 재개
                    const shouldResume = !hasFocusInTargetArea && pausedByFocus;
                    
                    if (shouldResume) {
                        pausedByFocus = false;
                        autoPlayBtn.setAttribute("aria-label", "정지");
                        autoPlayBtn.setAttribute("data-aria-autoplay", "true");
                        
                        if (thisSlide.swiper && thisSlide.swiper.autoplay) {
                            try {
                                if (thisSlide.swiper.params && thisSlide.swiper.params.autoplay) {
                                    thisSlide.swiper.params.autoplay.disableOnInteraction = false;
                                }
                                
                                if (typeof thisSlide.swiper.autoplay.start === 'function') {
                                    thisSlide.swiper.autoplay.start();
                                }
                                
                                // autoplay가 실제로 시작되었는지 확인 및 재시도
                                setTimeout(() => {
                                    // 정지 상태인지 다시 확인 (사용자가 중간에 정지 버튼을 눌렀을 수 있음)
                                    const currentState = autoPlayBtn.getAttribute("data-aria-autoplay");
                                    if (currentState === "false" || userPaused) {
                                        return; // 정지 상태면 재시도하지 않음
                                    }
                                    
                                    const isRunning = thisSlide.swiper.autoplay ? thisSlide.swiper.autoplay.running : false;
                                    if (!isRunning) {
                                        // 재시도 전에도 상태 확인
                                        const retryState = autoPlayBtn.getAttribute("data-aria-autoplay");
                                        if (retryState === "false" || userPaused) {
                                            return; // 정지 상태면 재시도하지 않음
                                        }
                                        
                                        if (thisSlide.swiper.params && thisSlide.swiper.params.autoplay) {
                                            thisSlide.swiper.params.autoplay.disableOnInteraction = false;
                                            if (typeof thisSlide.swiper.autoplay.start === 'function') {
                                                thisSlide.swiper.autoplay.start();
                                            }
                                        }
                                    }
                                }, 100);
                                
                            } catch (e) {
                                console.error('[resumeAutoplay] 오류 발생:', e);
                            }
                        }
                    }
                };

                // 포커스 상태 확인 함수
                const checkFocusState = () => {
                    clearTimeout(focusCheckTimeout);
                    focusCheckTimeout = setTimeout(() => {
                        // 사용자가 명시적으로 정지한 경우에는 포커스 상태 확인을 건너뜀
                        if (userPaused) {
                            return;
                        }
                        
                        const activeElement = document.activeElement;
                        const isInTarget = isFocusInTargetArea(activeElement);
                        
                        if (isInTarget && !hasFocusInTargetArea) {
                            // 포커스가 타겟 영역으로 들어옴
                            hasFocusInTargetArea = true;
                            pausedByFocus = true;
                            stopAutoplay();
                        } else if (!isInTarget && hasFocusInTargetArea) {
                            // 포커스가 타겟 영역에서 나감
                            console.log('[포커스 체크] 포커스가 타겟 영역에서 나감', {
                                activeElement: activeElement ? {
                                    tagName: activeElement.tagName,
                                    className: activeElement.className
                                } : null
                            });
                            hasFocusInTargetArea = false;
                            resumeAutoplay();
                        } else if (!isInTarget) {
                            // 포커스가 스와이프 밖으로 나감
                            console.log('[포커스 체크] 포커스가 스와이프 밖으로 나갔습니다', {
                                activeElement: activeElement ? {
                                    tagName: activeElement.tagName,
                                    className: activeElement.className,
                                    id: activeElement.id
                                } : null
                            });
                        }
                    }, 50);
                };

                // 포커스가 있는 슬라이드가 현재 보이는 범위 안에 있는지 확인하는 함수
                const isSlideVisible = (slide, swiper) => {
                    if (!slide || !swiper) return false;
                    
                    // 실제 DOM에서 슬라이드가 보이는지 확인 (더 정확함)
                    const slideRect = slide.getBoundingClientRect();
                    const swiperRect = swiper.el.getBoundingClientRect();
                    
                    // 슬라이드가 Swiper 컨테이너 내부에 보이는지 확인
                    const isInViewport = slideRect.left >= swiperRect.left && 
                                        slideRect.right <= swiperRect.right &&
                                        slideRect.top >= swiperRect.top && 
                                        slideRect.bottom <= swiperRect.bottom;
                    
                    // 부분적으로라도 보이면 true
                    const isPartiallyVisible = slideRect.right > swiperRect.left && 
                                             slideRect.left < swiperRect.right &&
                                             slideRect.bottom > swiperRect.top && 
                                             slideRect.top < swiperRect.bottom;
                    
                    return isInViewport || isPartiallyVisible;
                };

                // swiper-slide 내부의 a, button 요소들
                const slideFocusableElements = this._element.querySelectorAll(
                    '.swiper-slide a, .swiper-slide button'
                );

                slideFocusableElements.forEach((element) => {
                    element.addEventListener("focusin", (e) => {
                        hasFocusInTargetArea = true;
                        pausedByFocus = true;
                        stopAutoplay();
                        
                        // 포커스가 들어온 요소가 속한 슬라이드를 활성화
                        const slide = element.closest('.swiper-slide');
                        if (slide && thisSlide.swiper) {
                            // 포커스가 있는 슬라이드가 이미 보이는 범위 안에 있으면 이동하지 않음
                            if (isSlideVisible(slide, thisSlide.swiper)) {
                                return;
                            }
                            
                            // 모든 슬라이드 찾기
                            const allSlides = Array.from(thisSlide._element.querySelectorAll('.swiper-slide'));
                            const slideIndex = allSlides.indexOf(slide);
                            
                            if (slideIndex !== -1) {
                                // loop 모드인지 확인
                                if (thisSlide.swiper.params && thisSlide.swiper.params.loop) {
                                    // loop 모드에서는 실제 인덱스를 계산해야 함
                                    const realIndex = thisSlide.swiper.slides.indexOf(slide);
                                    if (realIndex !== -1) {
                                        thisSlide.swiper.slideToLoop(realIndex);
                                    }
                                } else {
                                    // 일반 모드에서는 직접 인덱스 사용
                                    thisSlide.swiper.slideTo(slideIndex);
                                }
                            }
                        }
                    });
                    
                    element.addEventListener("focusout", (e) => {
                        checkFocusState();
                    });
                });

                // control-box 내부의 button, a 요소들 (정지/재생 버튼 제외)
                const controlBoxFocusableElements = Array.from(this._element.querySelectorAll(
                    '.control-box button, .control-box a'
                )).filter((element) => {
                    // 정지/재생 버튼은 제외
                    return element !== autoPlayBtn && !element.closest('.autoplay-control-wrap');
                });

                controlBoxFocusableElements.forEach((element) => {
                    element.addEventListener("focusin", (e) => {
                        hasFocusInTargetArea = true;
                        pausedByFocus = true;
                        stopAutoplay();
                    });
                    
                    element.addEventListener("focusout", (e) => {
                        checkFocusState();
                    });
                });

                // document 레벨에서 포커스 변경 감지
                // 현재 Swiper 인스턴스에만 적용되도록 체크
                const handleDocumentFocusIn = (e) => {
                    const target = e.target;
                    
                    // 현재 Swiper 인스턴스 내부의 요소인지 먼저 확인
                    if (!thisSlide._element.contains(target)) {
                        // 다른 Swiper의 요소이면 이 인스턴스의 포커스 상태만 확인
                        checkFocusState();
                        return;
                    }
                    
                    const isInTarget = isFocusInTargetArea(target);
                    
                    if (isInTarget) {
                        if (!hasFocusInTargetArea) {
                            hasFocusInTargetArea = true;
                            pausedByFocus = true;
                            stopAutoplay();
                        }
                        
                        // swiper-slide 내부 요소에 포커스가 들어온 경우 슬라이드 활성화
                        const slide = target.closest('.swiper-slide');
                        if (slide && thisSlide.swiper) {
                            // 포커스가 있는 슬라이드가 이미 보이는 범위 안에 있으면 이동하지 않음
                            if (isSlideVisible(slide, thisSlide.swiper)) {
                                return;
                            }
                            
                            // 모든 슬라이드 찾기
                            const allSlides = Array.from(thisSlide._element.querySelectorAll('.swiper-slide'));
                            const slideIndex = allSlides.indexOf(slide);
                            
                            if (slideIndex !== -1) {
                                // loop 모드인지 확인
                                if (thisSlide.swiper.params && thisSlide.swiper.params.loop) {
                                    // loop 모드에서는 실제 인덱스를 계산해야 함
                                    const realIndex = thisSlide.swiper.slides.indexOf(slide);
                                    if (realIndex !== -1) {
                                        thisSlide.swiper.slideToLoop(realIndex);
                                    }
                                } else {
                                    // 일반 모드에서는 직접 인덱스 사용
                                    thisSlide.swiper.slideTo(slideIndex);
                                    }
                            }
                        }
                    } else {
                        checkFocusState();
                    }
                };
                
                document.addEventListener("focusin", handleDocumentFocusIn, true);
                
                // dispose 시 이벤트 리스너 제거를 위해 저장
                this._documentFocusInHandler = handleDocumentFocusIn;

                // Swiper autoplay 이벤트 감지: 정지 상태에서 자동으로 시작되는 것을 방지
                if (thisSlide.swiper && thisSlide.swiper.autoplay) {
                    // autoplay가 시작될 때마다 상태 확인
                    const checkAutoplayState = () => {
                        const autoPlayState = autoPlayBtn.getAttribute("data-aria-autoplay");
                        // 정지 상태인데 autoplay가 실행 중이면 강제로 정지
                        if (autoPlayState === "false" || userPaused) {
                            const isRunning = thisSlide.swiper.autoplay ? thisSlide.swiper.autoplay.running : false;
                            if (isRunning) {
                                thisSlide.swiper.autoplay.stop();
                            }
                        }
                    };
                    
                    // 주기적으로 상태 확인 (autoplay 이벤트가 없는 경우를 대비)
                    const autoplayStateCheckInterval = setInterval(() => {
                        checkAutoplayState();
                    }, 200);
                    
                    // dispose 시 interval 제거를 위해 저장
                    thisSlide._autoplayStateCheckInterval = autoplayStateCheckInterval;
                }

                autoPlayBtn.addEventListener("click", (e) => {
                    let autoPlayState = autoPlayBtn.getAttribute("data-aria-autoplay");

                    if (autoPlayState === "true") {
                        // 사용자가 명시적으로 정지 버튼을 클릭한 경우
                        userPaused = true;
                        pausedByFocus = false; // 포커스로 인한 정지가 아님을 명시
                        // 정지/재생 버튼은 포커스 타겟 영역에서 제외되므로 hasFocusInTargetArea는 자동으로 false가 됨
                        autoPlayBtn.setAttribute("aria-label", "재생");
                        autoPlayBtn.setAttribute("data-aria-autoplay", "false");
                        
                        // autoplay 정지
                        if (thisSlide.swiper && thisSlide.swiper.autoplay) {
                            try {
                                if (typeof thisSlide.swiper.autoplay.stop === 'function') {
                                    thisSlide.swiper.autoplay.stop();
                                }
                                
                                // 정지가 제대로 되었는지 확인
                                setTimeout(() => {
                                    const isRunning = thisSlide.swiper.autoplay ? thisSlide.swiper.autoplay.running : false;
                                    if (isRunning) {
                                        // 여전히 실행 중이면 다시 정지 시도
                                        if (typeof thisSlide.swiper.autoplay.stop === 'function') {
                                            thisSlide.swiper.autoplay.stop();
                                        }
                                    }
                                }, 50);
                            } catch (error) {
                                console.error('[정지 버튼 클릭] autoplay.stop() 오류:', error);
                            }
                        }
                    } else if (autoPlayState === "false") {
                        // 사용자가 명시적으로 재생 버튼을 클릭한 경우
                        userPaused = false;
                        pausedByFocus = false; // 포커스로 인한 정지가 아님을 명시
                        // 정지/재생 버튼은 포커스 타겟 영역에서 제외되므로 hasFocusInTargetArea는 자동으로 false가 됨
                        autoPlayBtn.setAttribute("aria-label", "정지");
                        autoPlayBtn.setAttribute("data-aria-autoplay", "true");
                        
                        // autoplay 시작
                        if (thisSlide.swiper && thisSlide.swiper.autoplay) {
                            try {
                                if (thisSlide.swiper.params && thisSlide.swiper.params.autoplay) {
                                    thisSlide.swiper.params.autoplay.disableOnInteraction = false;
                                }
                                
                                if (typeof thisSlide.swiper.autoplay.start === 'function') {
                                    thisSlide.swiper.autoplay.start();
                                }
                            } catch (error) {
                                console.error('[재생 버튼 클릭] autoplay.start() 오류:', error);
                            }
                        }
                    }
                });
                if (pagination && paginationDot.length > 1) {
                    pagination.style.paddingRight = "22px";
                    pagination.style.boxSizing = "border-box";
                    const temp = (pagination.clientWidth - 24) / 2 + (paginationDot.length * 16 +14) / 2;
                    autoPlayBtn.style.left = temp + "px";
                }
                
            })();
        }
    }

    dispose() {
        // document 이벤트 리스너 제거
        if (this._documentFocusInHandler) {
            document.removeEventListener("focusin", this._documentFocusInHandler, true);
            this._documentFocusInHandler = null;
        }
        
        // autoplay 상태 확인 interval 제거
        if (this._autoplayStateCheckInterval) {
            clearInterval(this._autoplayStateCheckInterval);
            this._autoplayStateCheckInterval = null;
        }
        
        super.dispose();
    }

}

function setPageNum(swiper) {
    const pagination = swiper.el.querySelector(".swiper-pagination");

    if (pagination) {
        if (pagination.classList.contains("swiper-pagination-fraction")) {
            var nowNum = swiper.realIndex + 1;
            if (swiper.params.loop) {
                var loopNum = swiper.loopedSlides * 2;
            } else {
                var loopNum = 0;
            }
            var totalNum = swiper.slides.length + loopNum;
            pagination.setAttribute("role", "img")
            pagination.setAttribute("aria-label", "총" + totalNum + "개중" + nowNum + "번째 슬라이드 입니다.");
        } 
    }
}

function UISwiperApply(elements) {
    let targetElements = null;

    if (typeof elements === "undefined") {
        targetElements = document.querySelectorAll(".js-swiper");
    } else if (typeof elements === "object" && typeof elements.length === "number") {
        targetElements = elements;
    } else if (typeof elements === "string") {
        targetElements = document.querySelectorAll(elements);
    } else {
        return false;
    }

    Object.values(targetElements).map((element) => {
        try {
            new UISwiper(element);
        } catch (error) {
            console.error('[UISwiperApply] 초기화 오류:', error);
        }
    });
}

// UI 객체 생성 및 UISwiper 등록
if (typeof UI === 'undefined') {
    window.UI = {};
}

UI.UISwiper = UISwiper;

window.addEventListener("load", () => {
    UISwiperApply();
});

const index = {
    UISwiper,
    UISwiperApply,
}