/** 
 * 범용 SVG Border 애니메이션 모듈
 * 
 * 기능:
 * - SVG 기반 border 애니메이션 실행
 * - 왼쪽 위에서 시작해서 한 바퀴 돌며 border 채우기
 * - border-radius 옵션 지원
 * - 다양한 상태별 색상 지원
 * - 재사용 가능한 독립적인 모듈
 */

class AnimatedBorder {
    constructor(options = {}) {
        this.options = {
            // 기본 옵션
            borderColor: '#005DF9',           // 기본 border 색상
            errorColor: '#E53838',            // 에러 상태 border 색상
            borderWidth: 2,                   // border 두께
            animationDuration: 1000,          // 애니메이션 지속 시간 (ms)
            errorAnimationDuration: 500,      // 에러 상태 애니메이션 지속 시간 (ms) - 더 빠르게
            borderRadius: 6,                  // 기본 border-radius (px)
            instanceId: null,                 // 인스턴스 ID (독립적인 처리용)
            ...options
        };
        
        this.activeAnimations = new Map(); // 활성 애니메이션 추적
        
        // 인스턴스 ID 생성 (없는 경우)
        if (!this.options.instanceId) {
            this.options.instanceId = `animated-border-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
        
        // 리사이즈 이벤트 리스너 등록
        this.setupResizeListener();
    }

    /**
     * 리사이즈 이벤트 리스너 설정
     */
    setupResizeListener() {
        let resizeTimeout;
        
        this.resizeHandler = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 100);
        };
        
        window.addEventListener('resize', this.resizeHandler);
    }

    /**
     * 리사이즈 이벤트 처리
     */
    handleResize() {
        // 활성 애니메이션이 있는 컨테이너들을 재계산
        this.activeAnimations.forEach((svg, container) => {
            if (svg && svg.parentNode) {
                // 현재 애니메이션 상태 저장
                const path = svg.querySelector('path');
                const currentDashOffset = path.style.strokeDashoffset;
                const isAnimating = currentDashOffset !== '0';
                
                // 컨테이너에서 이 인스턴스의 애니메이션 SVG 요소들만 제거
                const existingAnimationSvgs = container.querySelectorAll(`svg.animated-border-svg.instance-${this.options.instanceId}`);
                existingAnimationSvgs.forEach(existingSvg => {
                    if (existingSvg.parentNode) {
                        existingSvg.parentNode.removeChild(existingSvg);
                    }
                });
                
                // 새로운 SVG 생성
                const borderRadius = this.getBorderRadius(container, this.options.borderRadius);
                const newSvg = this.createAnimatedSVG(container, borderRadius, this.options);
                container.appendChild(newSvg);
                
                // 애니메이션이 진행 중이었다면 계속 진행
                if (isAnimating) {
                    this.executeAnimation(newSvg, this.options);
                } else {
                    // 애니메이션이 완료된 상태라면 완료된 상태로 설정
                    const newPath = newSvg.querySelector('path');
                    newPath.style.strokeDashoffset = '0';
                }
                
                this.activeAnimations.set(container, newSvg);
            }
        });
    }

    /**
     * 애니메이션 시작
     * @param {HTMLElement} container - 애니메이션을 적용할 컨테이너 요소
     * @param {Object} options - 애니메이션 옵션 (색상, 지속시간 등)
     * @returns {HTMLElement} 생성된 SVG 요소
     */
    startAnimation(container, options = {}) {
        const animationOptions = { ...this.options, ...options };
        
        // 이미 애니메이션이 실행 중인 경우 기존 애니메이션 제거
        if (this.activeAnimations.has(container)) {
            this.stopAnimation(container);
        }

        // 컨테이너에서 이 인스턴스의 애니메이션 SVG 요소들만 제거
        const existingAnimationSvgs = container.querySelectorAll(`svg.animated-border-svg.instance-${this.options.instanceId}`);
        existingAnimationSvgs.forEach(svg => {
            if (svg.parentNode) {
                svg.parentNode.removeChild(svg);
            }
        });

        const borderRadius = this.getBorderRadius(container, animationOptions.borderRadius);
        const svg = this.createAnimatedSVG(container, borderRadius, animationOptions);
        container.style.position = 'relative';
        container.appendChild(svg);

        // 애니메이션 시작
        this.executeAnimation(svg, animationOptions);

        // 활성 애니메이션으로 등록
        this.activeAnimations.set(container, svg);
        
        return svg;
    }

    /**
     * 에러 상태 SVG 추가 (포커스 상태에서 에러 발생 시)
     * @param {HTMLElement} container - 컨테이너 요소
     * @param {Object} options - 애니메이션 옵션
     * @returns {HTMLElement} 생성된 에러 SVG 요소
     */
    addErrorSVG(container, options = {}) {
        const { skipAnimation = false, ...restOptions } = options;
        const animationOptions = { ...this.options, ...restOptions };
        
        // 기존 에러 SVG가 있으면 제거
        this.removeErrorSVG(container);

        const borderRadius = this.getBorderRadius(container, animationOptions.borderRadius);
        const errorSvg = this.createAnimatedSVG(container, borderRadius, {
            ...animationOptions,
            borderColor: animationOptions.errorColor,
            isErrorSVG: true
        });
        
        // 에러 SVG는 포커스 SVG 위에 표시되도록 z-index 설정
        errorSvg.style.zIndex = '2';
        errorSvg.classList.add('error-border-svg');
        errorSvg.classList.add(`instance-${this.options.instanceId}`);
        errorSvg.dataset.instanceId = this.options.instanceId;
        
        container.appendChild(errorSvg);

        // 에러 SVG 애니메이션 시작 (에러 전용 속도 사용)
        if (skipAnimation) {
            const path = errorSvg.querySelector('path');
            const pathLength = path.getTotalLength();
            path.style.strokeDasharray = pathLength;
            path.style.strokeDashoffset = '0';
        } else {
            this.executeAnimation(errorSvg, {
                ...animationOptions,
                animationDuration: animationOptions.errorAnimationDuration || animationOptions.animationDuration
            });
        }

        return errorSvg;
    }

    addFocusMaintainSVG(container, options = {}) {
        const { skipAnimation = false, ...restOptions } = options;
        const animationOptions = { ...this.options, ...restOptions };

        // 기존 포커스 유지 SVG 제거
        this.removeFocusMaintainSVG(container);

        const borderRadius = this.getBorderRadius(container, animationOptions.borderRadius);
        const maintainSvg = this.createAnimatedSVG(container, borderRadius, {
            ...animationOptions,
            borderColor: animationOptions.borderColor
        });
        maintainSvg.style.zIndex = '2';
        maintainSvg.classList.add('focus-maintain-border-svg');
        maintainSvg.classList.add(`instance-${this.options.instanceId}`);
        maintainSvg.dataset.instanceId = this.options.instanceId;

        container.appendChild(maintainSvg);

        if (skipAnimation) {
            const path = maintainSvg.querySelector('path');
            const pathLength = path.getTotalLength();
            path.style.strokeDasharray = pathLength;
            path.style.strokeDashoffset = '0';
            path.style.transition = 'none';
        } else {
            this.executeAnimation(maintainSvg, animationOptions);
        }

        return maintainSvg;
    }

    removeFocusMaintainSVG(container) {
        const existingMaintainSvgs = container.querySelectorAll(`svg.focus-maintain-border-svg.instance-${this.options.instanceId}`);
        existingMaintainSvgs.forEach(svg => {
            if (svg.parentNode) {
                svg.parentNode.removeChild(svg);
            }
        });
    }

    /**
     * 에러 상태 SVG 제거
     * @param {HTMLElement} container - 컨테이너 요소
     */
    removeErrorSVG(container) {
        const existingErrorSvgs = container.querySelectorAll(`svg.error-border-svg.instance-${this.options.instanceId}`);
        existingErrorSvgs.forEach(svg => {
            if (svg.parentNode) {
                svg.parentNode.removeChild(svg);
            }
        });
    }

    /**
     * 애니메이션 중지
     * @param {HTMLElement} container - 애니메이션을 중지할 컨테이너 요소
     */
    stopAnimation(container) {
        const svg = this.activeAnimations.get(container);
        if (svg && svg.parentNode) {
            svg.parentNode.removeChild(svg);
        }
        this.activeAnimations.delete(container);
        
        // 에러 SVG도 함께 제거
        this.removeErrorSVG(container);
        // 포커스 유지 SVG도 함께 제거
        this.removeFocusMaintainSVG(container);
    }

    /**
     * 애니메이션 실행
     * @param {HTMLElement} svg - SVG 요소
     * @param {Object} options - 애니메이션 옵션
     */
    executeAnimation(svg, options) {
        const path = svg.querySelector('path');
        const pathLength = path.getTotalLength();
        
        // 초기 상태 설정 (선이 보이지 않는 상태)
        path.style.strokeDasharray = pathLength;
        path.style.strokeDashoffset = pathLength;
        path.style.transition = 'none'; // 초기 설정 시에는 transition 비활성화

        // 다음 프레임에서 애니메이션 시작
        requestAnimationFrame(() => {
            path.style.transition = `stroke-dashoffset ${options.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            path.style.strokeDashoffset = '0';
        });
    }

    /**
     * 애니메이션 SVG 생성
     * @param {HTMLElement} container - 컨테이너 요소
     * @param {number} borderRadius - border-radius 값
     * @param {Object} options - 애니메이션 옵션
     * @returns {HTMLElement} 생성된 SVG 요소
     */
    createAnimatedSVG(container, borderRadius, options) {
        const rect = container.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // SVG 요소 생성
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.classList.add('animated-border-svg'); // 애니메이션용 SVG 식별 클래스
        svg.classList.add(`instance-${this.options.instanceId}`); // 인스턴스별 클래스 추가
        svg.dataset.instanceId = this.options.instanceId; // 인스턴스 ID 데이터 속성
        svg.style.position = 'absolute';
        svg.style.top = '-1px';      // 내부로 1px 이동
        svg.style.left = '-1px';     // 내부로 1px 이동
        svg.style.width = 'calc(100% + 3px)';  // 크기 조정으로 경계 유지 (1px 추가)
        svg.style.height = 'calc(100% + 3px)'; // 크기 조정으로 경계 유지 (1px 추가)
        svg.style.pointerEvents = 'none';
        svg.style.zIndex = '1';

        // Path 요소 생성
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', options.borderColor);
        path.setAttribute('stroke-width', options.borderWidth);
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');

        // border path 생성
        const pathData = this.createBorderPath(width, height, borderRadius, options.borderWidth);
        path.setAttribute('d', pathData);

        svg.appendChild(path);
        return svg;
    }

    /**
     * border path 데이터 생성
     * @param {number} width - 컨테이너 너비
     * @param {number} height - 컨테이너 높이
     * @param {number} borderRadius - border-radius 값
     * @param {number} borderWidth - border 두께
     * @returns {string} SVG path 데이터
     */
    createBorderPath(width, height, borderRadius, borderWidth) {
        // SVG가 내부로 1px 이동하고 크기가 3px 더 크므로 좌표 조정
        const x = borderWidth / 2 + 1;  // 내부로 1px 이동
        const y = borderWidth / 2 + 1;  // 내부로 1px 이동
        const w = width - borderWidth - 1;  // 크기 조정 (1px 추가)
        const h = height - borderWidth - 1;  // 크기 조정 (1px 추가)
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
     * border-radius 값 가져오기
     * @param {HTMLElement} container - 컨테이너 요소
     * @param {number} defaultRadius - 기본 border-radius 값
     * @returns {number} border-radius 값
     */
    getBorderRadius(container, defaultRadius) {
        // CSS에서 실제 border-radius 값을 읽어서 사용
        const computedStyle = window.getComputedStyle(container);
        const borderRadius = computedStyle.borderRadius;
        
        // border-radius 값이 있는 경우 (예: "12px", "12px 8px", "12px 8px 12px 8px" 등)
        if (borderRadius && borderRadius !== '0px' && borderRadius !== 'none') {
            // 첫 번째 값을 사용 (모든 모서리가 같지 않은 경우에도 첫 번째 값 사용)
            const firstValue = borderRadius.split(/\s+/)[0];
            const parsedValue = parseFloat(firstValue);
            
            // 유효한 숫자 값인 경우 사용
            if (!isNaN(parsedValue) && parsedValue > 0) {
                return parsedValue;
            }
        }
        
        // CSS 값이 없거나 유효하지 않은 경우 기본값 사용
        return defaultRadius;
    }

    /**
     * 옵션 업데이트
     * @param {Object} newOptions - 새로운 옵션
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
        
        // 리사이즈 이벤트 리스너 제거
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
    }

    /**
     * 특정 컨테이너의 애니메이션 강제 중지
     * @param {HTMLElement} container - 컨테이너 요소
     */
    forceStopAnimation(container) {
        this.stopAnimation(container);
    }

    /**
     * 활성 애니메이션 확인
     * @param {HTMLElement} container - 컨테이너 요소
     * @returns {boolean} 애니메이션 활성 상태
     */
    isAnimationActive(container) {
        return this.activeAnimations.has(container);
    }
}

// 전역 클래스 등록
window.AnimatedBorder = AnimatedBorder;

// 모듈 내보내기 (ES6 모듈 환경에서)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimatedBorder;
}
