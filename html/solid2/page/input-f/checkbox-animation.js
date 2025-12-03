// BaseComponent 클래스 정의 (기존 구조와 호환) - 이미 선언되어 있으면 재사용
if (typeof BaseComponent === 'undefined') {
    class BaseComponent {
        constructor(element) {
            this.element = element;
        }
    }
    window.BaseComponent = BaseComponent;
}

// CheckboxAnimation 클래스 정의
class CheckboxAnimation extends BaseComponent {
    
    constructor(element) {
        if(element.classList.contains("checkbox-initiated")) {
            return {};
        }

        super(element);
        
        // 기본 속성 설정
        // label 안에 input이 있거나, label의 for 속성으로 연결된 input 찾기
        this._checkbox = element.querySelector('input[type="checkbox"]');
        if (!this._checkbox && element.hasAttribute('for')) {
            // label의 for 속성으로 연결된 input 찾기
            const forId = element.getAttribute('for');
            this._checkbox = document.getElementById(forId);
        }
        this._label = element;
        this._pathChecked = element.querySelector('.path-checked');
        this._svg = element.querySelector('svg');
        // clipRect 찾기: SVG 내부의 clipPath > rect 요소 찾기
        if (this._svg) {
            const clipPath = this._svg.querySelector('clipPath');
            this._clipRect = clipPath ? clipPath.querySelector('rect') : null;
            
            // clipPath ID 중복 문제 해결: 고유한 ID 생성
            if (clipPath && this._pathChecked) {
                const checkboxId = this._checkbox.id || `checkbox-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const uniqueClipId = `clip-${checkboxId}`;
                const uniqueRectId = `clip-rect-${checkboxId}`;
                
                // 기존 ID가 없거나 중복인 경우 새 ID로 변경
                if (!clipPath.id || clipPath.id === 'clip-checkbox' || document.querySelectorAll(`#${clipPath.id}`).length > 1) {
                    clipPath.id = uniqueClipId;
                    if (this._clipRect) {
                        this._clipRect.id = uniqueRectId;
                    }
                    // path-checked의 clip-path 속성도 업데이트
                    const currentClipPath = this._pathChecked.getAttribute('clip-path');
                    if (currentClipPath && (currentClipPath.includes('clip-checkbox') || document.querySelectorAll(`[clip-path="${currentClipPath}"]`).length > 1)) {
                        this._pathChecked.setAttribute('clip-path', `url(#${uniqueClipId})`);
                    }
                }
            }
        } else {
            this._clipRect = null;
        }
        this._isInitialized = false;
        
        // .select-area-wrap 내부의 체크박스인 경우 border 애니메이션도 처리
        this._isSelectAreaWrap = this._label.closest('.select-area-wrap') !== null;
        this._animatedBorder = null;
        if (this._isSelectAreaWrap && typeof AnimatedBorder !== 'undefined') {
            this._animatedBorder = new AnimatedBorder({
                borderColor: '#005DF9',
                borderWidth: 2,
                animationDuration: 1000,
                borderRadius: 12
            });
        }
        
        // SVG가 없는 체크박스는 border 애니메이션만 처리하고 종료
        if (!this._pathChecked) {
            // 체크박스가 없으면 초기화하지 않음
            if (!this._checkbox) {
                return;
            }
            // SVG가 없지만 체크박스가 있고 .select-area-wrap 내부인 경우 border 애니메이션만 처리
            if (this._isSelectAreaWrap) {
                element.classList.add("checkbox-initiated");
                // 초기 상태 설정
                this._updateCheckboxStateForBorderOnly(false);
                // 체크박스 상태 변경 감지
                this._checkbox.addEventListener('change', () => {
                    this._updateCheckboxStateForBorderOnly(true);
                });
            }
            return;
        }
        
        // 체크박스나 필수 요소가 없으면 초기화하지 않음
        if (!this._checkbox) {
            return;
        }
        
        // 초기화 표시
        element.classList.add("checkbox-initiated");
        
        // 초기 상태 설정
        this._updateCheckboxState(false);
        
        // 체크박스 상태 변경 감지
        this._checkbox.addEventListener('change', () => {
            this._updateCheckboxState(true);
        });
        
        // label 클릭 시 체크박스 토글 보장 (이미 label의 for 속성으로 연결되어 있지만 추가 보장)
        this._label.addEventListener('click', (e) => {
            // SVG나 다른 요소를 클릭한 경우에도 체크박스가 토글되도록
            if (e.target !== this._checkbox && e.target.closest('svg')) {
                // 체크박스의 기본 동작을 방해하지 않도록
                // change 이벤트는 자동으로 발생함
            }
        });
    }

    static get NAME() {
        return "checkbox-animation";
    }
    
    _updateCheckboxState(animate) {
        if (!this._pathChecked) return;

        // disabled 상태 처리
        if (this._checkbox.disabled) {
            this._label.classList.add('is-disabled');
        } else {
            this._label.classList.remove('is-disabled');
        }
        
        if (this._checkbox.checked) {
            if (this._checkbox.disabled) {
                // disabled + checked 상태
                this._pathChecked.setAttribute('stroke', 'none');
                this._pathChecked.setAttribute('fill', '#C2D3FF');
                this._pathChecked.style.fill = '#C2D3FF'; // 인라인 스타일로 CSS 오버라이드
                this._pathChecked.setAttribute('stroke-dashoffset', '0');
                this._pathChecked.setAttribute('stroke-width', '0');
                this._pathChecked.style.opacity = '1'; // opacity도 명시적으로 설정
                if (this._clipRect) {
                    this._clipRect.setAttribute('width', '24');
                }
                this._label.classList.add('is-checked');
            } else {
                // enabled + checked 상태 (애니메이션 적용)
                // 먼저 fill 색상을 설정 (파란색으로) - CSS보다 우선순위를 높이기 위해 style 사용
                this._pathChecked.setAttribute('stroke', 'none');
                this._pathChecked.setAttribute('fill', '#005DF9');
                this._pathChecked.style.fill = '#005DF9'; // 인라인 스타일로 CSS 오버라이드
                this._pathChecked.setAttribute('stroke-dashoffset', '0');
                this._pathChecked.setAttribute('stroke-width', '0');
                this._pathChecked.style.opacity = '1'; // opacity도 명시적으로 설정
                
                // clipPath를 사용하여 왼쪽에서부터 나타나게 함
                if (this._clipRect) {
                    // 애니메이션 실행 조건: animate가 true이고 이미 초기화된 상태이거나, 체크 상태가 변경된 경우
                    const shouldAnimate = animate && this._isInitialized;
                    
                    // .select-area-wrap 내부의 체크박스는 150ms 지연
                    const animationDelay = this._isSelectAreaWrap ? 150 : 0;
                    
                    if (shouldAnimate) {
                        // 애니메이션 시작: 너비를 0으로 설정
                        this._clipRect.setAttribute('width', '0');
                        
                        // 애니메이션 시작 함수
                        const startAnimation = () => {
                            // 다음 프레임에서 애니메이션 시작
                            requestAnimationFrame(() => {
                                // 애니메이션을 위해 requestAnimationFrame 사용
                                let startTime = null;
                                const duration = 250; // 0.25초
                                const startWidth = 0;
                                const endWidth = 24;
                                
                                const animateClip = (currentTime) => {
                                    if (!startTime) startTime = currentTime || performance.now();
                                    const elapsed = (currentTime || performance.now()) - startTime;
                                    const progress = Math.min(elapsed / duration, 1);
                                    
                                    // ease-out 함수
                                    const easeProgress = 1 - Math.pow(1 - progress, 3);
                                    const currentWidth = startWidth + (endWidth - startWidth) * easeProgress;
                                    
                                    this._clipRect.setAttribute('width', currentWidth);
                                    
                                    if (progress < 1) {
                                        requestAnimationFrame(animateClip);
                                    } else {
                                        this._clipRect.setAttribute('width', '24');
                                    }
                                };
                                
                                requestAnimationFrame(animateClip);
                            });
                        };
                        
                        // 지연이 있으면 setTimeout으로 지연, 없으면 즉시 실행
                        if (animationDelay > 0) {
                            setTimeout(startAnimation, animationDelay);
                        } else {
                            startAnimation();
                        }
                    } else {
                        // 애니메이션 없이 즉시 표시
                        this._clipRect.setAttribute('width', '24');
                    }
                }
                
                this._label.classList.add('is-checked');
                
                // .select-area-wrap 내부의 체크박스인 경우 border 애니메이션도 시작
                if (this._isSelectAreaWrap && this._animatedBorder && this._label) {
                    this._animatedBorder.startAnimation(this._label, {
                        borderColor: '#005DF9',
                        animationDuration: 1000,
                        borderRadius: 12
                    });
                }
            }
        } else {
            // unchecked 상태
            this._label.classList.remove('is-checked');
            this._pathChecked.setAttribute('stroke', 'none');
            this._pathChecked.setAttribute('fill', 'none');
            this._pathChecked.style.fill = 'none'; // 인라인 스타일로 CSS 오버라이드
            this._pathChecked.setAttribute('stroke-dashoffset', '1');
            if (this._clipRect) {
                this._clipRect.setAttribute('width', '0');
            }
            
            // .select-area-wrap 내부의 체크박스인 경우 border 애니메이션 중지
            if (this._isSelectAreaWrap && this._animatedBorder && this._label) {
                this._animatedBorder.stopAnimation(this._label);
            }
        }
        
        this._isInitialized = true;
    }
    
    // SVG가 없는 체크박스의 경우 border 애니메이션만 처리하는 메서드
    _updateCheckboxStateForBorderOnly(animate) {
        if (!this._checkbox) return;
        
        // disabled 상태 처리
        if (this._checkbox.disabled) {
            this._label.classList.add('is-disabled');
        } else {
            this._label.classList.remove('is-disabled');
        }
        
        if (this._checkbox.checked) {
            this._label.classList.add('is-checked');
            
            // .select-area-wrap 내부의 체크박스인 경우 border 애니메이션 시작
            if (this._isSelectAreaWrap && this._animatedBorder && this._label) {
                this._animatedBorder.startAnimation(this._label, {
                    borderColor: '#005DF9',
                    animationDuration: 1000,
                    borderRadius: 12
                });
            }
        } else {
            // unchecked 상태
            this._label.classList.remove('is-checked');
            
            // .select-area-wrap 내부의 체크박스인 경우 border 애니메이션 중지
            if (this._isSelectAreaWrap && this._animatedBorder && this._label) {
                this._animatedBorder.stopAnimation(this._label);
            }
        }
    }
}

const CheckboxAnimationApply = (elements) => {
    let targetElements = null;

    if (typeof elements == "undefined") {
        // .checkbox-label 클래스를 가진 label 또는 .select-area 안의 label 요소 중 input[type="checkbox"]를 포함하고 svg를 가진 요소 찾기
        const allLabels = document.querySelectorAll('.checkbox-label, .select-area label');
        const labels = [];
        allLabels.forEach(label => {
            // label 안에 input이 있거나, label의 for 속성으로 연결된 input 찾기
            let checkbox = label.querySelector('input[type="checkbox"]');
            if (!checkbox && label.hasAttribute('for')) {
                const forId = label.getAttribute('for');
                checkbox = document.getElementById(forId);
            }
            const svg = label.querySelector('svg');
            // 체크박스가 있고, 체크박스 타입이 맞고, 아직 초기화되지 않은 경우 추가
            // SVG가 있거나 없거나 상관없이 처리 (SVG가 없으면 border 애니메이션만 처리)
            if (checkbox && checkbox.type === 'checkbox' && !label.classList.contains('checkbox-initiated')) {
                labels.push(label);
            }
        });
        targetElements = labels;
    } else if (typeof elements === "object" && typeof elements.length === "number") {
        targetElements = elements;
    } else if (typeof elements === "string") {
        targetElements = document.querySelectorAll(elements);
    } else {
        return false;
    }

    Object.values(targetElements).forEach((element) => {
        try {
            new CheckboxAnimation(element);
        } catch (error) {
            // 초기화 오류는 조용히 처리
        }
    });
};

// DOM이 로드되면 즉시 실행
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        CheckboxAnimationApply();
    });
} else {
    // DOM이 이미 로드된 경우
    CheckboxAnimationApply();
}

// 추가로 window.load 이벤트에서도 실행 (동적으로 추가된 체크박스 처리)
window.addEventListener("load", () => {
    CheckboxAnimationApply();
})

