/**
 * Input Field Animated Border Script
 * 여러 곳에서 사용할 수 있는 input-field 포커스 애니메이션 스크립트
 * 
 * 기능:
 * - 포커스 시 SVG 기반 border 애니메이션 실행
 * - 왼쪽 위에서 시작해서 한 바퀴 돌며 border 채우기
 * - border-radius 옵션 지원
 * - 포커스/에러/비활성화 상태 구분
 * - 포커스 해제 시 SVG 제거
 */

class AnimatedBorderInputField {
    constructor(options = {}) {
        this.options = {
            // 기본 옵션
            borderColor: '#005DF9',           // 기본 border 색상
            errorColor: '#E53838',            // 에러 상태 border 색상
            borderWidth: 2,                   // border 두께
            animationDuration: 1000,          // 애니메이션 지속 시간 (ms)
            borderRadius: 6,                  // 기본 border-radius (px)
            disabledClass: 'disabled',        // 비활성화 클래스
            errorClass: 'error',              // 에러 클래스
            readonlyClass: 'readonly',        // 읽기전용 클래스
            containerSelector: '.input-field', // 컨테이너 셀렉터
            inputSelector: 'input',           // input 태그 셀렉터
            ...options
        };
        
        this.activeAnimations = new Map(); // 활성 애니메이션 추적
        this.init();
    }

    /**
     * 스크립트 초기화
     */
    init() {
        this.setupGlobalEventListeners();
        this.initializeExistingInputFields();
    }

    /**
     * 전역 이벤트 리스너 설정
     */
    setupGlobalEventListeners() {
        // 포커스 이벤트 (컨테이너 레벨에서 처리)
        document.addEventListener('focusin', (e) => {
            if (this.isTargetInputField(e.target)) {
                const container = e.target.closest(this.options.containerSelector);
                if (container) {
                    if (!container.dataset.focusHandled || container.dataset.focusHandled === 'false') {
                        container.dataset.focusHandled = 'true';
                        console.log('컨테이너 첫 포커스 - 애니메이션 시작', e.target.placeholder || 'input');
                        this.handleFocus(e.target);
                    } else if (container.dataset.focusHandled === 'true') {
                        console.log('컨테이너 내부 input 포커스 이동 - 애니메이션 유지', e.target.placeholder || 'input');
                    }
                }
            }
        });

        // 포커스 해제 이벤트 (지연 처리로 정확한 포커스 상태 확인)
        document.addEventListener('focusout', (e) => {
            if (this.isTargetInputField(e.target)) {
                const container = e.target.closest(this.options.containerSelector);
                if (container) {
                    // 약간의 지연을 두고 포커스 상태를 확인 (다른 input으로 포커스 이동 시간 고려)
                    setTimeout(() => {
                        const otherInputs = container.querySelectorAll(this.options.inputSelector);
                        const hasFocus = Array.from(otherInputs).some(inputEl => 
                            inputEl === document.activeElement
                        );
                        
                        // 다른 input에 포커스가 없으면 플래그 리셋 및 애니메이션 제거
                        if (!hasFocus) {
                            container.dataset.focusHandled = 'false';
                            console.log('컨테이너 포커스 완전 해제 - 플래그 리셋 및 애니메이션 제거', e.target.placeholder || 'input');
                            this.stopAnimation(container);
                        } else {
                            console.log('컨테이너 내 다른 input에 포커스 유지 - 애니메이션 유지', e.target.placeholder || 'input');
                        }
                    }, 10); // 10ms 지연
                }
            }
        });

        // DOM 변경 감지 (동적으로 추가된 input-field 처리)
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.initializeInputField(node);
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
     * 기존 input-field 초기화
     */
    initializeExistingInputFields() {
        const inputFields = document.querySelectorAll(this.options.inputSelector);
        inputFields.forEach(input => {
            this.initializeInputField(input);
        });
    }

    /**
     * 개별 input-field 초기화
     */
    initializeInputField(input) {
        if (!this.isTargetInputField(input)) return;

        const container = input.closest(this.options.containerSelector);
        if (!container) return;

        // 이미 초기화된 경우 스킵
        if (container.dataset.animatedBorderInitialized) return;

        // 초기화 마크
        container.dataset.animatedBorderInitialized = 'true';
        
        // border-radius 값 가져오기
        const borderRadius = this.getBorderRadius(container);
        container.dataset.borderRadius = borderRadius;
    }

    /**
     * 타겟 input-field인지 확인
     */
    isTargetInputField(element) {
        return element.matches && element.matches(this.options.inputSelector);
    }

    /**
     * 포커스 이벤트 처리
     */
    handleFocus(input) {
        const container = input.closest(this.options.containerSelector);
        if (!container) return;

        // 비활성화 상태 확인
        if (this.isDisabled(container)) return;

        // 이미 애니메이션이 실행 중인 경우 스킵 (컨테이너당 1번만 실행)
        if (this.activeAnimations.has(container) || container.dataset.animationActive === 'true') {
            console.log('애니메이션 이미 실행 중 - 스킵', input.placeholder || 'input');
            return;
        }

        console.log('handleFocus 호출 - 애니메이션 시작', input.placeholder || 'input');
        // 애니메이션 실행 (컨테이너당 1번만)
        this.startAnimation(container, input);
    }

    /**
     * 포커스 해제 이벤트 처리 (현재는 focusout 이벤트에서 직접 처리)
     */
    handleBlur(input) {
        // 이 함수는 현재 사용되지 않음 - focusout 이벤트에서 직접 처리
        // 필요시 나중에 사용할 수 있도록 유지
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
     * border-radius 값 가져오기
     */
    getBorderRadius(container) {
        const computedStyle = window.getComputedStyle(container);
        const borderRadius = computedStyle.borderRadius;
        
        // px 단위로 변환
        if (borderRadius && borderRadius !== '0px') {
            return parseFloat(borderRadius);
        }
        
        return this.options.borderRadius;
    }

    /**
     * 애니메이션 시작
     */
    startAnimation(container, input) {
        const borderRadius = container.dataset.borderRadius || this.options.borderRadius;
        const isError = this.isError(container);
        const color = isError ? this.options.errorColor : this.options.borderColor;

        // SVG 생성
        const svg = this.createAnimatedSVG(container, borderRadius, color);
        
        // 컨테이너에 SVG 추가
        container.style.position = 'relative';
        container.appendChild(svg);

        // 애니메이션 시작
        const path = svg.querySelector('path');
        const pathLength = path.getTotalLength();
        
        // 초기 상태 설정 (선이 보이지 않는 상태)
        path.style.strokeDasharray = pathLength;
        path.style.strokeDashoffset = pathLength;
        path.style.transition = 'none'; // 초기 설정 시에는 transition 비활성화

        // 다음 프레임에서 애니메이션 시작
        requestAnimationFrame(() => {
            // 애니메이션 실행 (선이 그려지는 상태)
            path.style.transition = `stroke-dashoffset ${this.options.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            path.style.strokeDashoffset = '0';
        });

        // 활성 애니메이션 추적
        this.activeAnimations.set(container, svg);
        container.dataset.animationActive = 'true'; // 중복 실행 방지 플래그

        // 애니메이션 완료 후에도 선은 유지 (포커스 해제 시에만 제거)
        // 시간 기반 자동 제거는 하지 않음 - 오직 포커스 해제 시에만 제거
        console.log('애니메이션 시작됨 - 컨테이너당 1번만 실행, 포커스 해제 시에만 제거됩니다');
    }

    /**
     * 애니메이션 중지
     */
    stopAnimation(container) {
        const svg = this.activeAnimations.get(container);
        if (svg && svg.parentNode) {
            svg.parentNode.removeChild(svg);
            console.log('애니메이션 제거됨 - 포커스 해제로 인한 제거');
        }
        this.activeAnimations.delete(container);
        container.dataset.animationActive = 'false'; // 중복 실행 방지 플래그 제거
        console.log('stopAnimation 완료 - 플래그 리셋됨, 다음 포커스에서 새 애니메이션 가능');
    }

    /**
     * 애니메이션 SVG 생성
     */
    createAnimatedSVG(container, borderRadius, color) {
        const rect = container.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // SVG 요소 생성
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.position = 'absolute';
        svg.style.top = '-1px';      // 내부로 1px 이동
        svg.style.left = '-1px';     // 내부로 1px 이동
        svg.style.width = 'calc(100% + 2px)';  // 크기 조정으로 경계 유지
        svg.style.height = 'calc(100% + 2px)'; // 크기 조정으로 경계 유지
        svg.style.pointerEvents = 'none';
        svg.style.zIndex = '1';

        // Path 요소 생성
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', this.options.borderWidth);
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');

        // border path 생성
        const pathData = this.createBorderPath(width, height, borderRadius);
        path.setAttribute('d', pathData);

        svg.appendChild(path);
        return svg;
    }

    /**
     * border path 데이터 생성
     */
    createBorderPath(width, height, borderRadius) {
        // SVG가 내부로 1px 이동했으므로 좌표 조정
        const x = this.options.borderWidth / 2 + 1;  // 내부로 1px 이동
        const y = this.options.borderWidth / 2 + 1;  // 내부로 1px 이동
        const w = width - this.options.borderWidth - 2;  // 크기 조정
        const h = height - this.options.borderWidth - 2;  // 크기 조정
        const r = Math.min(borderRadius, w / 2, h / 2);

        // 왼쪽 위 모서리에서 시작해서 시계방향으로 그리기
        const path = [
            `M ${x + r} ${y}`,                    // 시작점 (왼쪽 위 모서리)
            `L ${x + w - r} ${y}`,                // 위쪽 선
            `A ${r} ${r} 0 0 1 ${x + w} ${y + r}`, // 오른쪽 위 모서리
            `L ${x + w} ${y + h - r}`,           // 오른쪽 선
            `A ${r} ${r} 0 0 1 ${x + w - r} ${y + h}`, // 오른쪽 아래 모서리
            `L ${x + r} ${y + h}`,               // 아래쪽 선
            `A ${r} ${r} 0 0 1 ${x} ${y + h - r}`, // 왼쪽 아래 모서리
            `L ${x} ${y + r}`,                   // 왼쪽 선
            `A ${r} ${r} 0 0 1 ${x + r} ${y}`    // 왼쪽 위 모서리 (닫기)
        ];

        return path.join(' ');
    }

    /**
     * 옵션 업데이트
     */
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
    }

    /**
     * 모든 활성 애니메이션 정리
     */
    cleanup() {
        this.activeAnimations.forEach((svg, container) => {
            this.stopAnimation(container);
        });
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
