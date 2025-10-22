// BaseComponent 클래스 정의 (기존 구조와 호환)
class BaseComponent {
    constructor(element) {
        this.element = element;
    }
}

// SolidTooltip 클래스 정의
class SolidTooltip extends BaseComponent {
    // 정적 속성으로 전역 이벤트 관리
    static _globalClickHandler = null;
    static _globalKeydownHandler = null;
    static _activeTooltips = new Set();
    
    constructor(element) {
        super(element);
        
        // 기본 속성 설정
        this._isVisible = false;
        this._position = 'top-center';
        this._content = '';
        this._arrowOffsetX = 0;
        this._arrowOffsetY = 0;
        this._tooltipOffsetX = 0;
        this._tooltipOffsetY = 0;
        this._tooltipWidth = 163;
        this._tooltipHeight = 44;
        
        // DOM 요소 참조
        this._triggerElement = null;
        this._tooltipElement = null;
        this._arrowElement = null;
        
        // 이벤트 핸들러 바인딩
        this._boundHandleTriggerClick = this._handleTriggerClick.bind(this);
        this._boundHandleCloseClick = this._handleCloseClick.bind(this);
        
        // 전역 이벤트 핸들러 초기화
        this._initGlobalEvents();
        
        // 초기화
        this._init();
    }
    
    /**
     * 전역 이벤트 핸들러 초기화
     */
    _initGlobalEvents() {
        // 전역 클릭 핸들러가 없으면 생성
        if (!SolidTooltip._globalClickHandler) {
            SolidTooltip._globalClickHandler = (event) => {
                SolidTooltip._activeTooltips.forEach(tooltip => {
                    if (tooltip._isVisible) {
                        tooltip._handleClickOutside(event);
                    }
                });
            };
            document.addEventListener('click', SolidTooltip._globalClickHandler);
        }
        
        // 전역 키보드 핸들러가 없으면 생성
        if (!SolidTooltip._globalKeydownHandler) {
            SolidTooltip._globalKeydownHandler = (event) => {
                SolidTooltip._activeTooltips.forEach(tooltip => {
                    if (tooltip._isVisible) {
                        tooltip._handleEscapeKey(event);
                    }
                });
            };
            document.addEventListener('keydown', SolidTooltip._globalKeydownHandler);
        }
        
        // 현재 툴팁을 활성 툴팁 목록에 추가
        SolidTooltip._activeTooltips.add(this);
    }
    
    /**
     * 컴포넌트 초기화
     */
    _init() {
        try {
            this._triggerElement = this.element;
            
            // 트리거 요소 확인
            if (!this._triggerElement) {
                console.error('트리거 요소를 찾을 수 없습니다.');
                return;
            }
            
            this._createHtml();
            this._attachEvents();
            this._applyPosition();
        } catch (error) {
            console.error('SolidTooltip 초기화 중 오류:', error);
        }
    }
    
    /**
     * HTML 구조 생성
     */
    _createHtml() {
        try {
            // 기존 툴팁 요소가 있다면 제거 (이벤트도 함께 정리)
            if (this._tooltipElement && this._tooltipElement.parentNode) {
                this._detachEvents();
                this._tooltipElement.parentNode.removeChild(this._tooltipElement);
            }
            
            // tooltip-wrap이 이미 있는지 확인
            let tooltipWrap = this._triggerElement.parentElement;
            if (!tooltipWrap || !tooltipWrap.classList.contains('tooltip-wrap')) {
                // tooltip-wrap 컨테이너 생성
                tooltipWrap = document.createElement('div');
                tooltipWrap.className = 'tooltip-wrap';
                
                // 기존 트리거 요소를 tooltip-wrap으로 이동
                const parentElement = this._triggerElement.parentElement;
                parentElement.insertBefore(tooltipWrap, this._triggerElement);
                tooltipWrap.appendChild(this._triggerElement);
            }
            
            // 툴팁 컨테이너 생성
            this._tooltipElement = document.createElement('div');
            this._tooltipElement.className = 'solid-tooltip';
            this._tooltipElement.setAttribute('role', 'tooltip');
            this._tooltipElement.setAttribute('aria-hidden', 'true');
            this._tooltipElement.id = `tooltip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            // 툴팁 크기 설정
            this._tooltipElement.style.width = `${this._tooltipWidth}px`;
            this._tooltipElement.style.height = `${this._tooltipHeight}px`;
            
            // 툴팁 콘텐츠 생성
            const contentElement = document.createElement('div');
            contentElement.className = 'solid-tooltip-content';
            
            // 툴팁 콘텐츠 클릭 시 이벤트 전파 방지
            contentElement.addEventListener('click', (event) => {
                event.stopPropagation();
            });
            
            // 텍스트 영역
            const textElement = document.createElement('div');
            textElement.className = 'solid-tooltip-text';
            textElement.textContent = this._content || '툴팁 텍스트';
            
            // 닫기 버튼
            const closeButton = document.createElement('button');
            closeButton.className = 'solid-tooltip-close';
            closeButton.setAttribute('aria-label', '툴팁 닫기');
            closeButton.innerHTML = `
                <svg width="11" height="10" viewBox="0 0 11 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.4979 9.33652L9.83771 9.99667L0.504449 0.663416L1.1646 0.00326538L10.4979 9.33652Z" fill="#818DA2"/>
                    <path d="M9.83619 0.00334207L10.4963 0.663493L1.16308 9.99675L0.50293 9.3366L9.83619 0.00334207Z" fill="#818DA2"/>
                </svg>                        
            `;
            
            // 화살표 요소 생성 (SVG)
            this._arrowElement = document.createElement('div');
            this._arrowElement.className = 'solid-tooltip-arrow';
            this._arrowElement.innerHTML = `
                <svg width="18" height="8" viewBox="0 0 18 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.83984 1.05005C8.43995 0.316654 9.56191 0.316734 10.1621 1.05005L16.9443 9.33716L1.05469 9.34106L7.83984 1.05005Z" fill="white" stroke="#D0D5DD"/>
                </svg>
            `;
            
            // 구조 조립
            contentElement.appendChild(textElement);
            contentElement.appendChild(closeButton);
            this._tooltipElement.appendChild(contentElement);
            this._tooltipElement.appendChild(this._arrowElement);
            
            // 툴팁 자체 클릭 시 이벤트 전파 방지
            this._tooltipElement.addEventListener('click', (event) => {
                event.stopPropagation();
            });
            
            // tooltip-wrap에 툴팁 추가
            tooltipWrap.appendChild(this._tooltipElement);
            
            // 트리거 요소에 속성 추가
            this._triggerElement.setAttribute('aria-describedby', this._tooltipElement.id);
            this._triggerElement.setAttribute('aria-expanded', 'false');
            
            // 이벤트 리스너 등록
            this._attachEvents();
        } catch (error) {
            console.error('툴팁 HTML 생성 중 오류:', error);
        }
    }
    
    /**
     * 이벤트 리스너 등록
     */
    _attachEvents() {
        // 트리거 클릭 이벤트 (중복 방지를 위해 먼저 제거)
        this._triggerElement.removeEventListener('click', this._boundHandleTriggerClick);
        this._triggerElement.addEventListener('click', this._boundHandleTriggerClick);
        
        // 닫기 버튼 클릭 이벤트
        const closeButton = this._tooltipElement.querySelector('.solid-tooltip-close');
        if (closeButton) {
            closeButton.removeEventListener('click', this._boundHandleCloseClick);
            closeButton.addEventListener('click', this._boundHandleCloseClick);
        }
        
        // 전역 이벤트는 정적 메서드에서 관리하므로 여기서는 등록하지 않음
    }
    
    /**
     * 이벤트 리스너 제거
     */
    _detachEvents() {
        if (this._triggerElement) {
            this._triggerElement.removeEventListener('click', this._boundHandleTriggerClick);
        }
        
        if (this._tooltipElement) {
            const closeButton = this._tooltipElement.querySelector('.solid-tooltip-close');
            if (closeButton) {
                closeButton.removeEventListener('click', this._boundHandleCloseClick);
            }
        }
        
        // 전역 이벤트는 정적 메서드에서 관리하므로 여기서는 제거하지 않음
    }
    
    /**
     * 트리거 클릭 핸들러
     */
    _handleTriggerClick(event) {
        event.stopPropagation();
        this.toggle();
    }
    
    /**
     * 닫기 버튼 클릭 핸들러
     */
    _handleCloseClick(event) {
        event.stopPropagation();
        this.hide();
    }
    
    /**
     * 외부 클릭 핸들러
     */
    _handleClickOutside(event) {
        // 툴팁 요소나 트리거 요소를 클릭한 경우는 무시
        if (this._tooltipElement && this._tooltipElement.contains(event.target)) {
            return;
        }
        if (this._triggerElement && this._triggerElement.contains(event.target)) {
            return;
        }
        
        // 외부 클릭인 경우 툴팁 숨김
        this.hide();
    }
    
    /**
     * ESC 키 핸들러
     */
    _handleEscapeKey(event) {
        if (event.key === 'Escape' && this._isVisible) {
            this.hide();
        }
    }
    
    /**
     * 툴팁 표시
     */
    show() {
        try {
            if (this._isVisible) return;
            
            // 툴팁 요소가 없으면 생성
            if (!this._tooltipElement) {
                this._createHtml();
                if (!this._tooltipElement) {
                    console.error('툴팁 요소 생성에 실패했습니다.');
                    return;
                }
            }
            
            this._isVisible = true;
            this._tooltipElement.classList.add('solid-tooltip-show');
            this._tooltipElement.setAttribute('aria-hidden', 'false');
            this._triggerElement.setAttribute('aria-expanded', 'true');
            
            // 툴팁 내부 요소들의 포커스 복원
            const focusableElements = this._tooltipElement.querySelectorAll('button, input, select, textarea, a[href], [tabindex="-1"]');
            focusableElements.forEach(element => {
                element.removeAttribute('tabindex');
            });
            
            // 위치 계산 및 적용
            this._applyPosition();
            
            // 표시 상태로 변경
            this._tooltipElement.style.opacity = '1';
            this._tooltipElement.style.visibility = 'visible';
            this._tooltipElement.style.transform = 'scale(1)';
        } catch (error) {
            console.error('툴팁 표시 중 오류:', error);
        }
    }
    
    /**
     * 툴팁 숨김
     */
    hide() {
        if (!this._isVisible) return;
        
        this._isVisible = false;
        this._tooltipElement.classList.remove('solid-tooltip-show');
        this._tooltipElement.setAttribute('aria-hidden', 'true');
        this._triggerElement.setAttribute('aria-expanded', 'false');
        
        // 툴팁 내부 요소들의 포커스 차단
        const focusableElements = this._tooltipElement.querySelectorAll('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])');
        focusableElements.forEach(element => {
            element.setAttribute('tabindex', '-1');
        });
        
        // 애니메이션 효과
        this._tooltipElement.style.opacity = '0';
        this._tooltipElement.style.transform = 'scale(0.95)';
        this._tooltipElement.style.visibility = 'hidden';
        
        // display: none을 제거하여 다시 클릭 가능하도록 함
        setTimeout(() => {
            if (!this._isVisible) {
                this._tooltipElement.style.display = 'block';
            }
        }, 200);
    }
    
    /**
     * 툴팁 토글
     */
    toggle() {
        if (this._isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    /**
     * 위치 설정
     * @param {string} position - 위치 (예: 'top-center', 'right-top' 등)
     */
    setPosition(position) {
        this._position = position;
        
        // 기존 위치 클래스 제거
        this._tooltipElement.className = this._tooltipElement.className.replace(/solid-tooltip-\w+-\w+/g, '');
        
        // 새 위치 클래스 추가
        this._tooltipElement.classList.add(`solid-tooltip-${position}`);
        
        // 항상 위치 적용 (표시 여부와 관계없이)
        this._applyPosition();
    }
    
    /**
     * 콘텐츠 설정
     * @param {string} content - 툴팁 텍스트
     */
    setContent(content) {
        this._content = content;
        const textElement = this._tooltipElement.querySelector('.solid-tooltip-text');
        if (textElement) {
            textElement.textContent = content;
        }
    }
    
    /**
     * 화살표 오프셋 설정
     * @param {number} x - X축 오프셋
     * @param {number} y - Y축 오프셋
     */
    setArrowOffset(x, y) {
        this._arrowOffsetX = x;
        this._arrowOffsetY = y;
        
        // 오프셋이 변경되면 항상 위치 재계산
        this._applyPosition();
    }
    
    /**
     * 툴팁 오프셋 설정
     * @param {number} x - X축 오프셋
     * @param {number} y - Y축 오프셋
     */
    setTooltipOffset(x, y) {
        this._tooltipOffsetX = x;
        this._tooltipOffsetY = y;
        
        // 오프셋이 변경되면 항상 위치 재계산
        this._applyPosition();
    }
    
    /**
     * 툴팁 크기 설정
     * @param {number} width - 넓이
     * @param {number} height - 높이
     */
    setSize(width, height) {
        this._tooltipWidth = width;
        this._tooltipHeight = height;
        
        if (this._tooltipElement) {
            this._tooltipElement.style.width = `${width}px`;
            this._tooltipElement.style.height = `${height}px`;
            
            // 크기가 변경되면 항상 위치 재계산
            this._applyPosition();
        }
    }
    
    /**
     * 위치 적용
     */
    _applyPosition() {
        try {
            if (!this._tooltipElement) {
                this._createHtml();
                if (!this._tooltipElement) {
                    console.error('툴팁 요소 생성에 실패했습니다.');
                    return;
                }
            }
            
            const [basePosition, alignment] = this._position.split('-');
            
            // 툴팁 위치 계산
            this._positionTooltip(basePosition);
            
            // 화살표 위치 계산
            this._positionArrow(basePosition, alignment);
            
            // 표시 (숨겨진 상태에서도 위치 계산을 위해)
            if (!this._isVisible) {
                this._tooltipElement.style.display = 'block';
                this._tooltipElement.style.opacity = '0';
                this._tooltipElement.style.visibility = 'hidden';
                
                // 위치 계산 후 다시 숨김 상태로 복원
                setTimeout(() => {
                    if (!this._isVisible) {
                        this._tooltipElement.style.display = 'block';
                        this._tooltipElement.style.opacity = '0';
                        this._tooltipElement.style.visibility = 'hidden';
                    }
                }, 0);
            }
        } catch (error) {
            console.error('툴팁 위치 적용 중 오류:', error);
        }
    }
    
    /**
     * 툴팁 위치 계산
     * @param {string} basePosition - 기본 위치
     */
    _positionTooltip(basePosition) {
        const triggerRect = this._triggerElement.getBoundingClientRect();
        const tooltipRect = this._tooltipElement.getBoundingClientRect();
        const parentRect = this._triggerElement.parentElement.getBoundingClientRect();
        
        // 부모 요소 기준으로 상대 위치 계산
        const triggerRelativeX = triggerRect.left - parentRect.left;
        const triggerRelativeY = triggerRect.top - parentRect.top;
        
        // 20px 정사각형 트리거 기준으로 계산
        const triggerSize = 20;
        const triggerCenterX = triggerRelativeX + triggerSize / 2;
        const triggerCenterY = triggerRelativeY + triggerSize / 2;
        
        let top, left;
        
        // 정렬 정보 가져오기
        const [, alignment] = this._position.split('-');
        
        switch (basePosition) {
            case 'top':
                top = triggerCenterY + triggerSize / 2 + 10 + this._tooltipOffsetY;
                

                if (alignment === 'left') {
                    left = triggerCenterX + this._tooltipOffsetX + -26;
                } else if (alignment === 'center' || alignment === 'middle') {
                    left = triggerCenterX - tooltipRect.width / 2 + this._tooltipOffsetX + -4;
                } else if (alignment === 'right') {
                    left = triggerCenterX - tooltipRect.width + this._tooltipOffsetX + 16;
                }
                break;
                
            case 'bottom':
                top = triggerCenterY - tooltipRect.height - 24 + this._tooltipOffsetY;
                
                if (alignment === 'left') {
                    left = triggerCenterX + this._tooltipOffsetX + -26;
                } else if (alignment === 'center' || alignment === 'middle') {
                    left = triggerCenterX - tooltipRect.width / 2 + this._tooltipOffsetX + -4;
                } else if (alignment === 'right') {
                    left = triggerCenterX - tooltipRect.width + this._tooltipOffsetX + 16;
                }
                break;
                
            case 'right':
                left = triggerCenterX - tooltipRect.width - triggerSize * 2 ;
                
                if (alignment === 'top') {
                    top = triggerCenterY + this._tooltipOffsetY - triggerSize;
                } else if (alignment === 'center' || alignment === 'middle') {
                    top = triggerCenterY - tooltipRect.height / 2 + this._tooltipOffsetY - 4;
                } else if (alignment === 'bottom') {
                    top = triggerCenterY - tooltipRect.height + triggerSize;
                }
                break;
                
            case 'left':
                left = triggerCenterX * 2 + triggerSize ;

                
                if (alignment === 'top') {
                    top = triggerCenterY + this._tooltipOffsetY - triggerSize -3;
                } else if (alignment === 'center' || alignment === 'middle') {
                    top = triggerCenterY - tooltipRect.height / 2 + this._tooltipOffsetY -3;
                } else if (alignment === 'bottom') {
                    top = triggerCenterY - tooltipRect.height + this._tooltipOffsetY + triggerSize -3;
                }
                break;
        }
        
        this._tooltipElement.style.top = `${top}px`;
        this._tooltipElement.style.left = `${left}px`;
    }
    
    /**
     * 화살표 위치 계산
     * @param {string} basePosition - 기본 위치
     * @param {string} alignment - 정렬
     */
    _positionArrow(basePosition, alignment) {
        if (!this._arrowElement) return;
        
        const svgElement = this._arrowElement.querySelector('svg');
        if (!svgElement) return;
        
        // 화살표 컨테이너 스타일 초기화
        this._arrowElement.style.cssText = `
            position: absolute;
            width: 18px;
            height: 9px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        // SVG 스타일 초기화
        svgElement.style.cssText = `
            width: 18px;
            height: 9px;
            transition: transform 0.2s ease;
        `;
        
        // 화살표 방향에 따른 스타일 설정
        switch (basePosition) {
            case 'top':
                // top 명칭이지만 실제로는 툴팁이 트리거 아래에 있으므로 화살표가 위쪽을 가리킴
                svgElement.style.transform = `rotate(0deg)`;
                this._arrowElement.style.top = '-9px';
                
                if (alignment === 'left') {
                    this._arrowElement.style.left = `${16 + this._arrowOffsetX}px`;
                    this._arrowElement.style.transform = `translateX(0)`;
                } else if (alignment === 'center' || alignment === 'middle') {
                    this._arrowElement.style.left = `50%`;
                    this._arrowElement.style.transform = `translateX(calc(-50% + ${this._arrowOffsetX}px))`;
                } else if (alignment === 'right') {
                    this._arrowElement.style.right = `${16 - this._arrowOffsetX}px`;
                    this._arrowElement.style.transform = `translateX(0)`;
                }
                break;
                
            case 'bottom':
                // bottom 명칭이지만 실제로는 툴팁이 트리거 위에 있으므로 화살표가 아래쪽을 가리킴
                svgElement.style.transform = `rotate(180deg)`;
                this._arrowElement.style.bottom = '-9px';
                
                if (alignment === 'left') {
                    this._arrowElement.style.left = `${16 + this._arrowOffsetX}px`;
                    this._arrowElement.style.transform = `translateX(0)`;
                } else if (alignment === 'center' || alignment === 'middle') {
                    this._arrowElement.style.left = `50%`;
                    this._arrowElement.style.transform = `translateX(calc(-50% + ${this._arrowOffsetX}px))`;
                } else if (alignment === 'right') {
                    this._arrowElement.style.right = `${16 - this._arrowOffsetX}px`;
                    this._arrowElement.style.transform = `translateX(0)`;
                }
                break;
                
            case 'left':
                svgElement.style.transform = `rotate(270deg)`;
                this._arrowElement.style.left = '-13px';
                
                if (alignment === 'top') {
                    this._arrowElement.style.top = `${16 - this._arrowOffsetY}px`;
                    this._arrowElement.style.transform = `translateY(0)`;
                } else if (alignment === 'center' || alignment === 'middle') {
                    this._arrowElement.style.top = `50%`;
                    this._arrowElement.style.transform = `translateY(calc(-50% + ${this._arrowOffsetY}px))`;
                } else if (alignment === 'bottom') {
                    this._arrowElement.style.bottom = `${16 + this._arrowOffsetY}px`;
                    this._arrowElement.style.transform = `translateY(0)`;
                }
                break;
                
            case 'right':

                svgElement.style.transform = `rotate(90deg)`;
                this._arrowElement.style.right = '-13px';
                
                if (alignment === 'top') {
                    this._arrowElement.style.top = `${16 - this._arrowOffsetY}px`;
                    this._arrowElement.style.transform = `translateY(0)`;
                } else if (alignment === 'center' || alignment === 'middle') {
                    this._arrowElement.style.top = `50%`;
                    this._arrowElement.style.transform = `translateY(calc(-50% + ${this._arrowOffsetY}px))`;
                } else if (alignment === 'bottom') {
                    this._arrowElement.style.bottom = `${16 + this._arrowOffsetY}px`;
                    this._arrowElement.style.transform = `translateY(0)`;
                }
                break;
        }
    }
    
    /**
     * 컴포넌트 파괴
     */
    destroy() {
        this._detachEvents();
        
        // 활성 툴팁 목록에서 제거
        SolidTooltip._activeTooltips.delete(this);
        
        // tooltip-wrap 전체 제거
        const tooltipWrap = this._triggerElement.parentElement;
        if (tooltipWrap && tooltipWrap.classList.contains('tooltip-wrap')) {
            const grandParent = tooltipWrap.parentElement;
            if (grandParent) {
                // 트리거 요소를 원래 부모로 이동
                grandParent.insertBefore(this._triggerElement, tooltipWrap);
                // tooltip-wrap 제거
                grandParent.removeChild(tooltipWrap);
            }
        } else if (this._tooltipElement && this._tooltipElement.parentNode) {
            // 일반적인 경우 툴팁만 제거
            this._tooltipElement.parentNode.removeChild(this._tooltipElement);
        }
        
        // 트리거 요소 속성 정리
        this._triggerElement.removeAttribute('aria-describedby');
        this._triggerElement.removeAttribute('aria-expanded');
        
        // 모든 툴팁이 제거되었으면 전역 이벤트 리스너도 제거
        if (SolidTooltip._activeTooltips.size === 0) {
            if (SolidTooltip._globalClickHandler) {
                document.removeEventListener('click', SolidTooltip._globalClickHandler);
                SolidTooltip._globalClickHandler = null;
            }
            if (SolidTooltip._globalKeydownHandler) {
                document.removeEventListener('keydown', SolidTooltip._globalKeydownHandler);
                SolidTooltip._globalKeydownHandler = null;
            }
        }
    }
    
    /**
     * 현재 상태 반환
     */
    get isVisible() {
        return this._isVisible;
    }
    
    /**
     * 현재 위치 반환
     */
    get position() {
        return this._position;
    }
    
    /**
     * 현재 콘텐츠 반환
     */
    get content() {
        return this._content;
    }
    
    /**
     * 현재 넓이 반환
     */
    get width() {
        return this._tooltipWidth;
    }
    
    /**
     * 현재 높이 반환
     */
    get height() {
        return this._tooltipHeight;
    }
    
    /**
     * 자동 초기화 함수 (정적 메서드)
     * .tooltip-trigger 클래스를 가진 모든 요소에 툴팁을 자동으로 적용
     */
    static initTooltips() {
        // .tooltip-trigger 클래스를 가진 모든 요소에 툴팁 적용
        document.querySelectorAll('.tooltip-trigger').forEach(element => {
            if (!element.hasAttribute('data-tooltip-initialized')) {
                const tooltip = new SolidTooltip(element);
                
                // data 속성으로부터 설정 적용
                const content = element.dataset.content || '툴팁';
                const position = element.dataset.position || 'top-center';
                const width = parseInt(element.dataset.width) || 163;
                const height = parseInt(element.dataset.height) || 44;
                const offsetX = parseInt(element.dataset.offsetX) || 0;
                const offsetY = parseInt(element.dataset.offsetY) || 0;
                
                tooltip.setContent(content);
                tooltip.setPosition(position);
                tooltip.setSize(width, height);
                tooltip.setTooltipOffset(offsetX, offsetY);
                
                // 초기화 완료 표시
                element.setAttribute('data-tooltip-initialized', 'true');
            }
        });
    }
    
    /**
     * DOM이 로드되면 자동으로 툴팁 초기화 (정적 메서드)
     */
    static autoInit() {
        if (typeof document !== 'undefined') {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    SolidTooltip.initTooltips();
                });
            } else {
                SolidTooltip.initTooltips();
            }
        }
    }
}

// 자동 초기화 실행 (선택적)
SolidTooltip.autoInit();

