/** 
 * 범용 포커스 이벤트 처리 모듈
 * 
 * 기능:
 * - 다양한 컴포넌트에서 포커스 이벤트 처리
 * - 포커스 상태 추적 및 관리
 * - 포커스 콜백 함수 실행
 * - 동적 요소 감지 및 초기화
 */

class FocusManager {
    constructor(options = {}) {
        this.options = {
            // 기본 옵션
            containerSelector: '.focusable',     // 포커스 가능한 컨테이너 셀렉터
            inputSelector: 'input, select, textarea, button, label, [tabindex], [role="button"], [role="menuitem"]', // 포커스 가능한 요소 셀렉터
            disabledClass: 'disabled',           // 비활성화 클래스
            readonlyClass: 'readonly',          // 읽기전용 클래스
            errorClass: 'error',                // 에러 클래스
            focusDelay: 10,                     // 포커스 상태 확인 지연 시간 (ms)
            ...options
        };
        
        this.focusStates = new Map(); // 포커스 상태 추적
        this.callbacks = {
            onFocus: null,    // 포커스 시 콜백
            onBlur: null,    // 포커스 해제 시 콜백
            onFocusChange: null // 포커스 상태 변경 시 콜백
        };
        
        this.init();
    }

    /**
     * 스크립트 초기화
     */
    init() {
        this.setupGlobalEventListeners();
        this.initializeExistingElements();
    }

    /**
     * 전역 이벤트 리스너 설정
     */
    setupGlobalEventListeners() {
        // 포커스 이벤트 (컨테이너 레벨에서 처리)
        document.addEventListener('focusin', (e) => {
            if (this.isTargetElement(e.target)) {
                const container = e.target.closest(this.options.containerSelector);
                if (container) {
                    this.handleFocus(e.target, container);
                }
            }
        });

        // 포커스 해제 이벤트 (지연 처리로 정확한 포커스 상태 확인)
        document.addEventListener('focusout', (e) => {
            if (this.isTargetElement(e.target)) {
                const container = e.target.closest(this.options.containerSelector);
                if (container) {
                    // 약간의 지연을 두고 포커스 상태를 확인 (다른 요소로 포커스 이동 시간 고려)
                    setTimeout(() => {
                        this.handleBlur(e.target, container);
                    }, this.options.focusDelay);
                }
            }
        });

        // DOM 변경 감지 (동적으로 추가된 요소 처리)
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.initializeElement(node);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * 기존 요소 초기화
     */
    initializeExistingElements() {
        const elements = document.querySelectorAll(this.options.inputSelector);
        elements.forEach(element => {
            this.initializeElement(element);
        });
    }

    /**
     * 개별 요소 초기화
     */
    initializeElement(element) {
        if (!this.isTargetElement(element)) return;

        const container = element.closest(this.options.containerSelector);
        if (!container) return;

        // 이미 초기화된 경우 스킵
        if (container.dataset.focusManagerInitialized) return;

        // 초기화 마크
        container.dataset.focusManagerInitialized = 'true';
        
        // 초기 포커스 상태 설정
        this.focusStates.set(container, {
            hasFocus: false,
            focusedElement: null,
            lastFocusedElement: null
        });
    }

    /**
     * 타겟 요소인지 확인
     */
    isTargetElement(element) {
        return element.matches && element.matches(this.options.inputSelector);
    }

    /**
     * 포커스 이벤트 처리
     */
    handleFocus(element, container) {
        const focusState = this.focusStates.get(container) || { hasFocus: false, focusedElement: null, lastFocusedElement: null };
        
        // 비활성화 상태 확인
        if (this.isDisabled(container)) return;

        // 이미 포커스가 있는 경우 (컨테이너 내 다른 요소로 포커스 이동)
        if (focusState.hasFocus) {
            focusState.focusedElement = element;
            this.focusStates.set(container, focusState);
            
            // 포커스 변경 콜백 실행
            if (this.callbacks.onFocusChange) {
                this.callbacks.onFocusChange(element, container, 'focus-change');
            }
            return;
        }

        // 새로운 포커스 시작
        focusState.hasFocus = true;
        focusState.focusedElement = element;
        focusState.lastFocusedElement = element;
        this.focusStates.set(container, focusState);

        // 포커스 콜백 실행
        if (this.callbacks.onFocus) {
            this.callbacks.onFocus(element, container);
        }
    }

    /**
     * 포커스 해제 이벤트 처리
     */
    handleBlur(element, container) {
        const focusState = this.focusStates.get(container);
        if (!focusState) return;

        // 컨테이너 내 다른 요소에 포커스가 있는지 확인
        const otherElements = container.querySelectorAll(this.options.inputSelector);
        const hasFocus = Array.from(otherElements).some(el => 
            el === document.activeElement
        );
        
        // 다른 요소에 포커스가 없으면 포커스 해제
        if (!hasFocus) {
            focusState.hasFocus = false;
            focusState.lastFocusedElement = focusState.focusedElement;
            focusState.focusedElement = null;
            this.focusStates.set(container, focusState);

            // 포커스 해제 콜백 실행
            if (this.callbacks.onBlur) {
                this.callbacks.onBlur(element, container);
            }
        }
    }

    /**
     * 비활성화 상태 확인 (disabled 또는 readonly)
     */
    isDisabled(container) {
        return container.classList.contains(this.options.disabledClass) || 
               container.classList.contains(this.options.readonlyClass);
    }

    /**
     * 에러 상태 확인
     */
    isError(container) {
        return container.classList.contains(this.options.errorClass);
    }

    /**
     * 포커스 상태 확인
     */
    hasFocus(container) {
        const focusState = this.focusStates.get(container);
        return focusState ? focusState.hasFocus : false;
    }

    /**
     * 현재 포커스된 요소 가져오기
     */
    getFocusedElement(container) {
        const focusState = this.focusStates.get(container);
        return focusState ? focusState.focusedElement : null;
    }

    /**
     * 마지막으로 포커스된 요소 가져오기
     */
    getLastFocusedElement(container) {
        const focusState = this.focusStates.get(container);
        return focusState ? focusState.lastFocusedElement : null;
    }

    /**
     * 콜백 함수 설정
     */
    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    /**
     * 옵션 업데이트
     */
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
    }

    /**
     * 모든 포커스 상태 정리
     */
    cleanup() {
        this.focusStates.clear();
    }

    /**
     * 특정 컨테이너의 포커스 상태 강제 리셋
     */
    resetFocusState(container) {
        this.focusStates.delete(container);
    }
}

// 전역 인스턴스 생성
window.FocusManager = FocusManager;

// 모듈 내보내기 (ES6 모듈 환경에서)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FocusManager;
}
