/**
 * 포커스 스크롤 조정 관리자
 * sticky 영역에 가려지지 않도록 포커스된 요소의 스크롤을 자동 조정
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

class FocusScrollManager extends BaseComponent {
    constructor(element, config) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (!element) {
            throw new Error('FocusScrollManager element not found');
        }
        
        if (element.classList && element.classList.contains("initiated")) {
            return {};
        }

        super(element);
        
        this.config = {
            // sticky 영역 선택자 (상단)
            stickyTopSelector: '.header-area',
            // sticky 영역 선택자 (하단)
            stickyBottomSelector: '.content-area-footer',
            // 포커스 가능한 요소 선택자
            focusableSelector: 'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])',
            // 여유 공간 (px)
            padding: 8,
            // 스크롤 애니메이션 사용 여부
            smoothScroll: true,
            // 포커스 이벤트 처리 지연 시간 (ms)
            focusDelay: 10,
            ...(typeof config === "object" ? config : {}),
        };
        
        this.init();
    }
    
    /**
     * 초기화
     */
    init() {
        this.setupEventListeners();
        if (this.element && this.element.classList) {
            this.element.classList.add("initiated");
        }
    }
    
    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 포커스 이벤트 처리
        document.addEventListener('focusin', (e) => {
            this.handleFocus(e);
        });
    }
    
    /**
     * 포커스 이벤트 처리
     */
    handleFocus(e) {
        const focusedElement = e.target;
        
        // 포커스 가능한 요소인지 확인
        if (!focusedElement.matches || !focusedElement.matches(this.config.focusableSelector)) {
            return;
        }
        
        // 약간의 지연을 두고 처리 (브라우저의 기본 스크롤 동작 후 실행)
        setTimeout(() => {
            this.adjustScrollForSticky(focusedElement);
        }, this.config.focusDelay);
    }
    
    /**
     * sticky 영역을 고려한 스크롤 조정
     */
    adjustScrollForSticky(element) {
        if (!element || !element.getBoundingClientRect) {
            return;
        }
        
        const elementRect = element.getBoundingClientRect();
        const elementTop = elementRect.top;
        const elementBottom = elementRect.bottom;
        const padding = this.config.padding;
        
        // 상단 sticky 영역 확인
        const stickyTop = document.querySelector(this.config.stickyTopSelector);
        if (stickyTop) {
            const stickyTopRect = stickyTop.getBoundingClientRect();
            const stickyTopHeight = stickyTopRect.height;
            const stickyTopBottom = stickyTopRect.bottom;
            
            // 포커스된 요소가 sticky 영역에 가려지는지 확인 (viewport 기준)
            if (elementTop < stickyTopBottom) {
                // 스크롤을 조정해서 포커스된 요소가 sticky 영역 아래에 보이도록
                const targetScrollTop = window.scrollY + elementTop - stickyTopHeight - padding;
                window.scrollTo({
                    top: Math.max(0, targetScrollTop), // 음수 방지
                    behavior: this.config.smoothScroll ? 'smooth' : 'auto'
                });
                return; // 상단 처리 후 종료
            }
        }
        
        // 하단 sticky 영역 확인
        const stickyBottom = document.querySelector(this.config.stickyBottomSelector);
        if (stickyBottom) {
            const stickyBottomRect = stickyBottom.getBoundingClientRect();
            const stickyBottomTop = stickyBottomRect.top;
            
            // 포커스된 요소가 sticky 영역에 가려지는지 확인
            if (elementBottom > stickyBottomTop) {
                // 스크롤을 조정해서 포커스된 요소가 sticky 영역 위에 보이도록
                const scrollOffset = elementBottom - stickyBottomTop + padding;
                window.scrollTo({
                    top: window.scrollY + scrollOffset,
                    behavior: this.config.smoothScroll ? 'smooth' : 'auto'
                });
            }
        }
    }
    
    /**
     * 옵션 업데이트
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    
    /**
     * 정리 (이벤트 리스너 제거 등)
     */
    destroy() {
        // 필요시 이벤트 리스너 제거 로직 추가
        if (this.element && this.element.classList) {
            this.element.classList.remove("initiated");
        }
    }
}

// UI 네임스페이스 생성 및 FocusScrollManager 등록
if (typeof window.UI === 'undefined') {
    window.UI = {};
}

window.UI.FocusScrollManager = FocusScrollManager;

// 전역 클래스 등록
window.FocusScrollManager = FocusScrollManager;

function FocusScrollManagerApply(element, config) {
    let targetElement = null;
    
    if (typeof element === "undefined") {
        // 기본값: body 요소 사용
        targetElement = document.body;
    } else if (typeof element === "string") {
        targetElement = document.querySelector(element);
    } else if (element instanceof Element) {
        targetElement = element;
    } else {
        return false;
    }
    
    if (!targetElement) {
        return false;
    }
    
    // FocusScrollManager 인스턴스 생성
    const defaultConfig = {
        stickyTopSelector: '.header-area',
        stickyBottomSelector: '.content-area-footer',
        focusableSelector: 'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])',
        padding: 8,
        smoothScroll: true,
        focusDelay: 10
    };
    
    const finalConfig = { ...defaultConfig, ...(typeof config === "object" ? config : {}) };
    
    try {
        new FocusScrollManager(targetElement, finalConfig);
        return true;
    } catch (error) {
        console.error('FocusScrollManagerApply error:', error);
        return false;
    }
}

const index = {
    FocusScrollManager,
    FocusScrollManagerApply
}

// 모듈 내보내기 (ES6 모듈 환경에서)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = index;
}
 