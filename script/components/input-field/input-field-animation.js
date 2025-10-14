/** 
 * Input Field 전용 애니메이션 관리자
 * 
 * 기능:
 * - 포커스 시 SVG 기반 border 애니메이션 실행
 * - 왼쪽 위에서 시작해서 한 바퀴 돌며 border 채우기
 * - border-radius 옵션 지원 - 옵션값 변경을 대비
 * - 포커스/에러/비활성화 상태 구분
 * - 포커스 해제 시 SVG 제거 - css로 애니메이션 불가능(AOS6 지원이 안됨)
 * - FocusManager와 AnimatedBorder 모듈을 활용한 분리된 구조
 */

class AnimatedBorderInputField {
    constructor(options = {}) {
        this.options = {
            // 기본 옵션
            borderColor: '#005DF9',           // 기본 border 색상
            errorColor: '#E53838',            // 에러 상태 border 색상
            borderWidth: 2,                   // border 두께
            animationDuration: 1000,          // 애니메이션 지속 시간 (ms)
            borderRadius: 12,                  // 기본 border-radius (px)
            disabledClass: 'disabled',        // 비활성화 클래스
            errorClass: 'error',              // 에러 클래스
            readonlyClass: 'readonly',        // 읽기전용 클래스
            containerSelector: '.svg-animated, .input-textarea-from', // 컨테이너 셀렉터
            inputSelector: 'input, select, textarea, button, label, [tabindex], [role="button"], [role="menuitem"]',           // 포커스 가능한 요소 셀렉터
            focusedClass: 'focus',            // 포커스 상태 클래스
            ...options
        };
        
        // 모듈 인스턴스 생성
        this.focusManager = new FocusManager({
            containerSelector: this.options.containerSelector,
            inputSelector: this.options.inputSelector,
            disabledClass: this.options.disabledClass,
            readonlyClass: this.options.readonlyClass,
            errorClass: this.options.errorClass,
            focusedClass: this.options.focusedClass
        });
        
        this.animatedBorder = new AnimatedBorder({
            borderColor: this.options.borderColor,
            errorColor: this.options.errorColor,
            borderWidth: this.options.borderWidth,
            animationDuration: this.options.animationDuration,
            borderRadius: this.options.borderRadius
        });
        
        this.init();
    }

    /**
     * 스크립트 초기화
     */
    init() {
        this.setupCallbacks();
    }

    /**
     * 콜백 함수 설정
     */
    setupCallbacks() {
        this.focusManager.setCallbacks({
            onFocus: (element, container) => {
                console.log('컨테이너 첫 포커스 - 애니메이션 시작', element.placeholder || 'input');
                this.startAnimation(container);
            },
            onBlur: (element, container) => {
                console.log('컨테이너 포커스 완전 해제 - 애니메이션 제거', element.placeholder || 'input');
                this.stopAnimation(container);
            },
            onFocusChange: (element, container, type) => {
                console.log('컨테이너 내부 input 포커스 이동 - 애니메이션 유지', element.placeholder || 'input');
            }
        });
    }

    /**
     * 애니메이션 시작
     */
    startAnimation(container) {
        // 이미 애니메이션이 실행 중인 경우 스킵
        if (this.animatedBorder.isAnimationActive(container)) {
            console.log('애니메이션 이미 실행 중 - 스킵');
            return;
        }

        // 에러 상태 확인
        const isError = this.focusManager.isError(container);
        const color = isError ? this.options.errorColor : this.options.borderColor;

        // 애니메이션 실행
        this.animatedBorder.startAnimation(container, {
            borderColor: color,
            animationDuration: this.options.animationDuration
        });
    }

    /**
     * 애니메이션 중지
     */
    stopAnimation(container) {
        this.animatedBorder.stopAnimation(container);
    }

    /**
     * 옵션 업데이트
     */
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
        
        // 하위 모듈 옵션도 업데이트
        this.focusManager.updateOptions({
            containerSelector: this.options.containerSelector,
            inputSelector: this.options.inputSelector,
            disabledClass: this.options.disabledClass,
            readonlyClass: this.options.readonlyClass,
            errorClass: this.options.errorClass,
            focusedClass: this.options.focusedClass
        });
        
        this.animatedBorder.updateOptions({
            borderColor: this.options.borderColor,
            errorColor: this.options.errorColor,
            borderWidth: this.options.borderWidth,
            animationDuration: this.options.animationDuration,
            borderRadius: this.options.borderRadius
        });
    }

    /**
     * 모든 활성 애니메이션 정리
     */
    cleanup() {
        this.animatedBorder.cleanup();
        this.focusManager.cleanup();
    }

    /**
     * 특정 컨테이너의 애니메이션 강제 중지
     */
    forceStopAnimation(container) {
        this.stopAnimation(container);
    }
}

// 전역 인스턴스 생성
window.AnimatedBorderInputField = AnimatedBorderInputField;

// 자동 초기화 (DOM 로드 완료 후)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.animatedBorderInputField = new AnimatedBorderInputField();
    });
} else {
    window.animatedBorderInputField = new AnimatedBorderInputField();
}

// 모듈 내보내기 (ES6 모듈 환경에서)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimatedBorderInputField;
}
