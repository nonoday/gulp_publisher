class PopoverComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._placement = 'bottom-center';
        this._content = '';
        this._open = false;
        this._autoClose = false;
        this._color = 'primary';
        this._isOpen = false;
        this._popoverId = `popover-${Math.random().toString(36).substr(2, 9)}`;
        this._autoCloseTimer = null;
        this._anchorElement = null;
        this._popoverElement = null;
        this._arrowElement = null;
        this._contentElement = null;
        
        // 이벤트 핸들러를 바인딩하여 동일한 참조 유지
        this._boundHandleAnchorClick = this.handleAnchorClick.bind(this);
        this._boundHandleAnchorKeydown = this.handleAnchorKeydown.bind(this);
        this._boundHandleClickOutside = this.handleClickOutside.bind(this);
        this._boundHandleEscapeKey = this.handleEscapeKey.bind(this);
        this._boundHandleTouchStart = this.handleTouchStart.bind(this);
        this._boundHandleTouchEnd = this.handleTouchEnd.bind(this);
        this._boundHandleResize = this.handleResize.bind(this);
        
        // 모바일 관련 속성
        this._isMobile = this.detectMobile();
        this._isIOS6 = this.detectIOS6();
        this._touchStartTime = 0;
        this._touchThreshold = 200; // 터치 시간 임계값 (ms)
        
        // iOS 6 폴백을 위한 속성들
        this._supportsCustomElements = typeof customElements !== 'undefined';
        this._supportsShadowDOM = typeof Element.prototype.attachShadow !== 'undefined';
        this._supportsES6 = this.checkES6Support();
    }

    static get observedAttributes() {
        return ['placement', 'content', 'open', 'auto-close', 'color'];
    }

    connectedCallback() {
        console.log('PopoverComponent connected, initial state:', {
            isOpen: this._isOpen,
            content: this._content,
            placement: this._placement,
            color: this._color
        });
        this.render();
        this.setupAccessibility();
        this.setupEventListeners();
        this.setupGlobalEventListeners();
        
        // 초기 렌더링 후 요소 참조 확인
        setTimeout(() => {
            console.log('Element references after render:', {
                anchorElement: !!this._anchorElement,
                popoverElement: !!this._popoverElement,
                arrowElement: !!this._arrowElement,
                contentElement: !!this._contentElement
            });
        }, 100);
    }

    disconnectedCallback() {
        this.removeEventListeners();
        this.removeGlobalEventListeners();
        this.clearAutoCloseTimer();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.updateAttribute(name, newValue);
            this.render();
            this.setupAccessibility();
        }
    }

    updateAttribute(name, value) {
        switch (name) {
            case 'placement':
                this._placement = value || 'bottom-center';
                break;
            case 'content':
                this._content = value || '';
                break;
            case 'open':
                this._open = value === 'true' || value === '';
                this._isOpen = this._open;
                break;
            case 'auto-close':
                this._autoClose = value === 'true' || value === '';
                break;
            case 'color':
                this._color = value || 'primary';
                break;
        }
    }

    render() {
        console.log('PopoverComponent render called');
        console.log('iOS 6:', this._isIOS6, 'Shadow DOM:', this._supportsShadowDOM);
        
        // iOS 6 폴백 처리
        if (this._isIOS6 || !this._supportsShadowDOM) {
            console.log('Using fallback render');
            this.renderFallback();
            return;
        }

        console.log('Using Shadow DOM render');
        this.shadowRoot.innerHTML = `
            <style>
                :host { display: inline-block; }
                
                .popover-wrapper {
                    display: inline-block;
                    position: relative;
                }

                .popover {
                    position: fixed;
                    z-index: 1000;
                    max-width: 260px;
                    padding: 8px 16px;
                    border-radius: 4px;
                    word-wrap: break-word;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    /* 모바일 접근성 개선 */
                    -webkit-tap-highlight-color: transparent;
                    touch-action: manipulation;
                }
                
                .popover[hidden] {
                    display: none !important;
                }

                /* 모바일 반응형 디자인 */
                @media (max-width: 768px) {
                    .popover {
                        max-width: calc(100vw - 32px);
                        padding: 12px 16px;
                        font-size: 16px; /* 모바일에서 최소 16px로 줌 방지 */
                        border-radius: 8px;
                        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
                    }
                }

                .popover--color-primary {
                    background: #005df9;
                    color: #ffffff;
                }

                .popover--color-gray {
                    background: #374151;
                    color: #ffffff;
                }

                .popover__anchor {
                    display: inline-block;
                    cursor: pointer;
                    /* 모바일 접근성 개선 */
                    min-height: 44px; /* 최소 터치 영역 44px */
                    min-width: 44px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    -webkit-tap-highlight-color: transparent;
                    touch-action: manipulation;
                }

                /* 모바일에서 터치 영역 확대 */
                @media (max-width: 768px) {
                    .popover__anchor {
                        min-height: 48px;
                        min-width: 48px;
                        padding: 8px;
                    }
                }

                .popover__arrow {
                    position: absolute;
                    width: 18px;
                    height: 8px;
                }

                .popover__arrow svg {
                    display: inline-block;
                    vertical-align: top;
                    width: 100%;
                    height: 100%;
                }

                .popover__content {
                    position: relative;
                    color: #ffffff;
                    font-size: 14px;
                    line-height: 1.4;
                    font-weight: 500;
                    white-space: nowrap;
                }

                /* 모바일에서 텍스트 크기 조정 */
                @media (max-width: 768px) {
                    .popover__content {
                        font-size: 16px;
                        line-height: 1.5;
                    }
                }

                .popover__content--wrap {
                    white-space: normal;
                    word-wrap: break-word;
                    word-break: break-word;
                }

                /* 접근성을 위한 포커스 스타일 */
                .popover__anchor:focus-visible {
                    outline: 2px solid #3b82f6;
                    outline-offset: 2px;
                    border-radius: 4px;
                }

                /* 고대비 모드 지원 */
                @media (prefers-contrast: high) {
                    .popover {
                        border: 2px solid currentColor !important;
                    }
                    .popover__anchor:focus-visible {
                        outline: 3px solid currentColor;
                        outline-offset: 3px;
                    }
                }

                /* 모션 감소 지원 */
                @media (prefers-reduced-motion: reduce) {
                    .popover {
                        transition: none;
                    }
                    .popover__anchor {
                        transition: none;
                    }
                }

                /* 다크 모드 지원 */
                @media (prefers-color-scheme: dark) {
                    .popover--color-primary {
                        background: #1e40af;
                    }
                    .popover--color-gray {
                        background: #1f2937;
                    }
                }

                /* 모바일 접근성 개선 */
                @media (max-width: 768px) {
                    .popover__anchor:focus-visible {
                        outline: 3px solid #3b82f6;
                        outline-offset: 3px;
                        border-radius: 6px;
                    }
                }

                /* 스크린 리더 전용 텍스트 */
                .sr-only {
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    padding: 0;
                    margin: -1px;
                    overflow: hidden;
                    clip: rect(0, 0, 0, 0);
                    white-space: nowrap;
                    border: 0;
                }
            </style>
            
            <div class="popover-wrapper">
                <div
                    class="popover__anchor"
                    role="button"
                    aria-expanded="${this._isOpen}"
                    aria-describedby="${this._isOpen ? this._popoverId : ''}"
                    tabindex="0"
                >
                    <slot></slot>
                </div>

                <div
                    id="${this._popoverId}"
                    class="popover ${this.getPopoverClasses()}"
                    role="tooltip"
                    aria-hidden="${!this._isOpen}"
                    ${this._isOpen ? '' : 'hidden'}
                    style="${this.getPopoverStyles()}"
                >
                    <div class="popover__arrow ${this.getArrowClasses()}" style="${this.getArrowStyles()}">
                        <svg width="18" height="8" viewBox="0 0 18 8" fill="none">
                            <path d="M9.76822 0.921865L14.7671 6.92055C15.3371 7.60453 16.1815 8 17.0718 8L0.928209 8C1.81855 8 2.66289 7.60453 3.23287 6.92055L8.23178 0.921865C8.63157 0.442111 9.36843 0.442111 9.76822 0.921865Z" fill="${this.getArrowFillColor()}"/>
                        </svg>
                    </div>
                    <div class="popover__content ${this.shouldWrapContent() ? 'popover__content--wrap' : ''}">
                        ${this._content}
                    </div>
                </div>
            </div>
        `;

        this._anchorElement = this.shadowRoot.querySelector('.popover__anchor');
        this._popoverElement = this.shadowRoot.querySelector('.popover');
        this._arrowElement = this.shadowRoot.querySelector('.popover__arrow');
        this._contentElement = this.shadowRoot.querySelector('.popover__content');
    }

    getPopoverClasses() {
        const classes = ['popover'];
        
        if (this._placement) {
            classes.push(`popover--placement-${this._placement}`);
        }
        
        if (this._color) {
            classes.push(`popover--color-${this._color}`);
        }
        
        return classes.join(' ');
    }

    getArrowClasses() {
        const classes = ['popover__arrow'];
        
        if (this._placement) {
            classes.push(`popover__arrow--placement-${this._placement}`);
        }
        
        if (this._color) {
            classes.push(`popover__arrow--color-${this._color}`);
        }
        
        return classes.join(' ');
    }

    getPopoverStyles() {
        const anchorRect = this._anchorElement?.getBoundingClientRect();
        if (!anchorRect) return '';

        const styles = this.calculatePosition(anchorRect);
        return Object.entries(styles)
            .map(([key, value]) => `${key}: ${value}`)
            .join('; ');
    }

    getArrowStyles() {
        const side = this._placement.split('-')[0];
        const staticSide = {
            top: 'bottom',
            right: 'left',
            bottom: 'top',
            left: 'right'
        }[side];

        if (!staticSide) return '';

        const transformOrigin = {
            top: '',
            right: '0 0',
            bottom: 'center 100%',
            left: '100% 0'
        }[staticSide];

        const transform = {
            top: 'translateY(-100%)',
            right: 'translateY(50%) rotate(90deg) translateX(-50%)',
            bottom: 'rotate(180deg)',
            left: 'translateY(50%) rotate(-90deg) translateX(50%)'
        }[staticSide];

        const arrowOffset = ['right', 'left'].includes(side) ? '-26px' : '0';

        return `
            ${staticSide}: ${arrowOffset};
            transform-origin: ${transformOrigin};
            transform: ${transform};
        `;
    }

    calculatePosition(anchorRect) {
        const popoverWidth = 260; // max-width
        const popoverHeight = 60; // 예상 높이
        const offset = 16;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let left, top;

        switch (this._placement) {
            case 'top-center':
                left = anchorRect.left + (anchorRect.width / 2) - (popoverWidth / 2);
                top = anchorRect.top - popoverHeight - offset;
                break;
            case 'top-left':
                left = anchorRect.left;
                top = anchorRect.top - popoverHeight - offset;
                break;
            case 'top-right':
                left = anchorRect.right - popoverWidth;
                top = anchorRect.top - popoverHeight - offset;
                break;
            case 'bottom-center':
                left = anchorRect.left + (anchorRect.width / 2) - (popoverWidth / 2);
                top = anchorRect.bottom + offset;
                break;
            case 'bottom-left':
                left = anchorRect.left;
                top = anchorRect.bottom + offset;
                break;
            case 'bottom-right':
                left = anchorRect.right - popoverWidth;
                top = anchorRect.bottom + offset;
                break;
            case 'left-top':
                left = anchorRect.left - popoverWidth - offset;
                top = anchorRect.top;
                break;
            case 'left-middle':
                left = anchorRect.left - popoverWidth - offset;
                top = anchorRect.top + (anchorRect.height / 2) - (popoverHeight / 2);
                break;
            case 'left-bottom':
                left = anchorRect.left - popoverWidth - offset;
                top = anchorRect.bottom - popoverHeight;
                break;
            case 'right-top':
                left = anchorRect.right + offset;
                top = anchorRect.top;
                break;
            case 'right-middle':
                left = anchorRect.right + offset;
                top = anchorRect.top + (anchorRect.height / 2) - (popoverHeight / 2);
                break;
            case 'right-bottom':
                left = anchorRect.right + offset;
                top = anchorRect.bottom - popoverHeight;
                break;
            default:
                left = anchorRect.left + (anchorRect.width / 2) - (popoverWidth / 2);
                top = anchorRect.bottom + offset;
        }

        // 뷰포트 경계 체크
        if (left < 8) left = 8;
        if (left + popoverWidth > viewportWidth - 8) left = viewportWidth - popoverWidth - 8;
        if (top < 8) top = 8;
        if (top + popoverHeight > viewportHeight - 8) top = viewportHeight - popoverHeight - 8;

        return {
            left: `${left}px`,
            top: `${top}px`
        };
    }

    getArrowFillColor() {
        return this._color === 'primary' ? '#005df9' : '#374151';
    }

    shouldWrapContent() {
        if (!this._contentElement) return false;
        
        const maxWidth = 260;
        const padding = 32; // 좌우 패딩
        const availableWidth = maxWidth - padding;
        
        // 임시로 nowrap 상태에서 텍스트 너비 측정
        const originalWhiteSpace = this._contentElement.style.whiteSpace;
        this._contentElement.style.whiteSpace = 'nowrap';
        const textWidth = this._contentElement.scrollWidth;
        this._contentElement.style.whiteSpace = originalWhiteSpace;
        
        return textWidth > availableWidth;
    }

    setupAccessibility() {
        if (this._anchorElement) {
            this._anchorElement.setAttribute('aria-expanded', this._isOpen.toString());
            if (this._isOpen) {
                this._anchorElement.setAttribute('aria-describedby', this._popoverId);
            } else {
                this._anchorElement.removeAttribute('aria-describedby');
            }
        }

        if (this._popoverElement) {
            this._popoverElement.setAttribute('aria-hidden', (!this._isOpen).toString());
            if (this._isOpen) {
                this._popoverElement.removeAttribute('hidden');
            } else {
                this._popoverElement.setAttribute('hidden', '');
            }
        }
    }

    setupEventListeners() {
        console.log('setupEventListeners called');
        // 기존 이벤트 리스너 제거
        this.removeEventListeners();
        
        if (this._anchorElement) {
            console.log('Setting up event listeners for anchor element');
            // iOS 6 폴백 이벤트 핸들링
            if (this._isIOS6) {
                console.log('Using iOS 6 fallback event listeners');
                this.setupFallbackEventListeners();
            } else {
                console.log('Adding modern event listeners');
                this._anchorElement.addEventListener('click', this._boundHandleAnchorClick);
                this._anchorElement.addEventListener('keydown', this._boundHandleAnchorKeydown);
                
                // 모바일 터치 이벤트 추가
                if (this._isMobile) {
                    console.log('Adding mobile touch event listeners');
                    this._anchorElement.addEventListener('touchstart', this._boundHandleTouchStart, { passive: true });
                    this._anchorElement.addEventListener('touchend', this._boundHandleTouchEnd, { passive: true });
                }
            }
        } else {
            console.log('No anchor element found');
        }
    }

    setupFallbackEventListeners() {
        var self = this;
        console.log('Setting up iOS 6 fallback event listeners');
        
        // iOS 6용 간단한 이벤트 핸들링
        this._anchorElement.onclick = function(e) {
            console.log('iOS 6 fallback click handler called, isOpen:', self._isOpen);
            e.preventDefault();
            if (self._isOpen) {
                console.log('iOS 6 fallback: closing popover');
                self.close();
            } else {
                console.log('iOS 6 fallback: opening popover');
                self.open();
            }
        };
        
        this._anchorElement.onkeydown = function(e) {
            if (e.keyCode === 13 || e.keyCode === 32) { // Enter or Space
                e.preventDefault();
                if (self._isOpen) {
                    self.close();
                } else {
                    self.open();
                }
            }
        };
        
        // iOS 6용 터치 이벤트
        if (this._isMobile) {
            this._anchorElement.ontouchstart = function(e) {
                self._touchStartTime = Date.now();
                // 간단한 터치 피드백
                this.style.opacity = '0.7';
            };
            
            this._anchorElement.ontouchend = function(e) {
                var touchDuration = Date.now() - self._touchStartTime;
                this.style.opacity = '';
                
                if (touchDuration < self._touchThreshold) {
                    e.preventDefault();
                    if (self._isOpen) {
                        self.close();
                    } else {
                        self.open();
                    }
                }
            };
        }
    }

    removeEventListeners() {
        console.log('removeEventListeners called');
        if (this._anchorElement) {
            console.log('Removing event listeners from anchor element');
            this._anchorElement.removeEventListener('click', this._boundHandleAnchorClick);
            this._anchorElement.removeEventListener('keydown', this._boundHandleAnchorKeydown);
            
            // 모바일 터치 이벤트 제거
            if (this._isMobile) {
                console.log('Removing mobile touch event listeners');
                this._anchorElement.removeEventListener('touchstart', this._boundHandleTouchStart);
                this._anchorElement.removeEventListener('touchend', this._boundHandleTouchEnd);
            }
        } else {
            console.log('No anchor element to remove listeners from');
        }
    }

    setupGlobalEventListeners() {
        document.addEventListener('click', this._boundHandleClickOutside);
        document.addEventListener('keydown', this._boundHandleEscapeKey);
        window.addEventListener('resize', this._boundHandleResize);
    }

    removeGlobalEventListeners() {
        document.removeEventListener('click', this._boundHandleClickOutside);
        document.removeEventListener('keydown', this._boundHandleEscapeKey);
        window.removeEventListener('resize', this._boundHandleResize);
    }

    handleAnchorClick(event) {
        console.log('handleAnchorClick called, isOpen:', this._isOpen);
        event.preventDefault();
        if (this._isOpen) {
            console.log('Closing popover');
            this.close();
        } else {
            console.log('Opening popover');
            this.open();
        }
    }

    handleAnchorKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.handleAnchorClick(event);
        }
    }

    handleClickOutside(event) {
        if (this._isOpen && !this.contains(event.target)) {
            this.close();
        }
    }

    handleEscapeKey(event) {
        if (event.key === 'Escape' && this._isOpen) {
            this.close();
            this._anchorElement?.focus();
        }
    }

    open() {
        console.log('Opening popover');
        this._isOpen = true;
        
        // 팝오버 표시/숨김만 업데이트 (전체 렌더링은 하지 않음)
        if (this._popoverElement) {
            console.log('Popover element found, showing popover');
            this._popoverElement.removeAttribute('hidden');
            this._popoverElement.style.display = '';
            // 위치 재계산
            this.updatePopoverPosition();
        } else {
            console.log('Popover element not found!');
        }
        
        this.setupAccessibility();
        
        // iOS 6 폴백 위치 업데이트
        if (this._isIOS6) {
            this.updateFallbackPosition();
        }
        
        if (this._autoClose) {
            this.startAutoCloseTimer();
        }

        // iOS 6 폴백 이벤트
        if (this._isIOS6) {
            this.dispatchFallbackEvent('popover-open', { isOpen: true });
        } else {
            this.dispatchEvent(new CustomEvent('popover-open', {
                detail: { isOpen: true }
            }));
        }
    }

    close() {
        console.log('Closing popover');
        this._isOpen = false;
        
        // 팝오버 숨김만 업데이트 (전체 렌더링은 하지 않음)
        if (this._popoverElement) {
            console.log('Popover element found, hiding popover');
            this._popoverElement.setAttribute('hidden', '');
            // display 스타일은 제거하지 않고 hidden 속성만 사용
        } else {
            console.log('Popover element not found!');
        }
        
        this.setupAccessibility();
        
        this.clearAutoCloseTimer();

        // iOS 6 폴백 이벤트
        if (this._isIOS6) {
            this.dispatchFallbackEvent('popover-close', { isOpen: false });
        } else {
            this.dispatchEvent(new CustomEvent('popover-close', {
                detail: { isOpen: false }
            }));
        }
    }

    updatePopoverPosition() {
        if (!this._anchorElement || !this._popoverElement) return;
        
        const anchorRect = this._anchorElement.getBoundingClientRect();
        const styles = this.calculatePosition(anchorRect);
        
        // 위치 스타일 적용
        Object.entries(styles).forEach(([key, value]) => {
            this._popoverElement.style[key] = value;
        });
        
        console.log('Popover position updated:', styles);
    }

    dispatchFallbackEvent(eventName, detail) {
        // iOS 6용 간단한 이벤트 디스패치
        var event = document.createEvent('Event');
        event.initEvent(eventName, true, true);
        event.detail = detail;
        this.dispatchEvent(event);
    }

    startAutoCloseTimer() {
        this.clearAutoCloseTimer();
        if (typeof this._autoClose === 'number') {
            this._autoCloseTimer = setTimeout(() => {
                this.close();
            }, this._autoClose);
        }
    }

    clearAutoCloseTimer() {
        if (this._autoCloseTimer) {
            clearTimeout(this._autoCloseTimer);
            this._autoCloseTimer = null;
        }
    }

    // Getters and setters
    get placement() { return this._placement; }
    set placement(value) { this._placement = value; this.setAttribute('placement', value); }
    
    get content() { return this._content; }
    set content(value) { this._content = value; this.setAttribute('content', value); }
    
    get isOpenByDefault() { return this._open; }
    set isOpenByDefault(value) { this._open = value; this.setAttribute('open', value); }
    
    get autoClose() { return this._autoClose; }
    set autoClose(value) { this._autoClose = value; this.setAttribute('auto-close', value); }
    
    get color() { return this._color; }
    set color(value) { this._color = value; this.setAttribute('color', value); }
    
    get isOpen() { return this._isOpen; }
    
    // open 속성에 대한 별도 접근자
    get openAttribute() { return this._open; }
    set openAttribute(value) { this._open = value; this.setAttribute('open', value); }

    // 모바일 관련 메서드들
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               ('ontouchstart' in window) ||
               (navigator.maxTouchPoints > 0);
    }

    detectIOS6() {
        const ua = navigator.userAgent;
        const match = ua.match(/OS (\d+)_(\d+)/);
        if (match) {
            const major = parseInt(match[1], 10);
            return major <= 6;
        }
        return false;
    }

    checkES6Support() {
        try {
            // ES6 기능들 체크
            eval('class Test {}');
            eval('const test = () => {}');
            eval('let test = 1');
            return true;
        } catch (e) {
            return false;
        }
    }

    handleTouchStart(event) {
        this._touchStartTime = Date.now();
        // 모바일에서 터치 피드백 제공
        if (this._anchorElement) {
            this._anchorElement.style.transform = 'scale(0.95)';
            this._anchorElement.style.transition = 'transform 0.1s ease';
        }
    }

    handleTouchEnd(event) {
        const touchDuration = Date.now() - this._touchStartTime;
        
        // 터치 피드백 제거
        if (this._anchorElement) {
            this._anchorElement.style.transform = '';
            setTimeout(() => {
                this._anchorElement.style.transition = '';
            }, 100);
        }

        // 짧은 터치만 팝오버 토글 (긴 터치는 무시)
        if (touchDuration < this._touchThreshold) {
            event.preventDefault();
            this.handleAnchorClick(event);
        }
    }

    handleResize() {
        // 화면 크기 변경 시 팝오버 위치 재계산
        if (this._isOpen) {
            this.render();
            this.setupAccessibility();
        }
    }

    // 모바일 최적화된 위치 계산
    calculatePosition(anchorRect) {
        const popoverWidth = this._isMobile ? Math.min(260, window.innerWidth - 32) : 260;
        const popoverHeight = 60;
        const offset = this._isMobile ? 12 : 16;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let left, top;

        // 모바일에서는 기본적으로 bottom-center 사용
        if (this._isMobile && !this._placement.includes('mobile')) {
            left = anchorRect.left + (anchorRect.width / 2) - (popoverWidth / 2);
            top = anchorRect.bottom + offset;
        } else {
            switch (this._placement) {
                case 'top-center':
                    left = anchorRect.left + (anchorRect.width / 2) - (popoverWidth / 2);
                    top = anchorRect.top - popoverHeight - offset;
                    break;
                case 'top-left':
                    left = anchorRect.left;
                    top = anchorRect.top - popoverHeight - offset;
                    break;
                case 'top-right':
                    left = anchorRect.right - popoverWidth;
                    top = anchorRect.top - popoverHeight - offset;
                    break;
                case 'bottom-center':
                    left = anchorRect.left + (anchorRect.width / 2) - (popoverWidth / 2);
                    top = anchorRect.bottom + offset;
                    break;
                case 'bottom-left':
                    left = anchorRect.left;
                    top = anchorRect.bottom + offset;
                    break;
                case 'bottom-right':
                    left = anchorRect.right - popoverWidth;
                    top = anchorRect.bottom + offset;
                    break;
                case 'left-top':
                    left = anchorRect.left - popoverWidth - offset;
                    top = anchorRect.top;
                    break;
                case 'left-middle':
                    left = anchorRect.left - popoverWidth - offset;
                    top = anchorRect.top + (anchorRect.height / 2) - (popoverHeight / 2);
                    break;
                case 'left-bottom':
                    left = anchorRect.left - popoverWidth - offset;
                    top = anchorRect.bottom - popoverHeight;
                    break;
                case 'right-top':
                    left = anchorRect.right + offset;
                    top = anchorRect.top;
                    break;
                case 'right-middle':
                    left = anchorRect.right + offset;
                    top = anchorRect.top + (anchorRect.height / 2) - (popoverHeight / 2);
                    break;
                case 'right-bottom':
                    left = anchorRect.right + offset;
                    top = anchorRect.bottom - popoverHeight;
                    break;
                default:
                    left = anchorRect.left + (anchorRect.width / 2) - (popoverWidth / 2);
                    top = anchorRect.bottom + offset;
            }
        }

        // 뷰포트 경계 체크 (모바일에서는 더 엄격)
        const margin = this._isMobile ? 16 : 8;
        if (left < margin) left = margin;
        if (left + popoverWidth > viewportWidth - margin) left = viewportWidth - popoverWidth - margin;
        if (top < margin) top = margin;
        if (top + popoverHeight > viewportHeight - margin) top = viewportHeight - popoverHeight - margin;

        return {
            left: `${left}px`,
            top: `${top}px`
        };
    }

    // iOS 6 폴백 렌더링
    renderFallback() {
        var self = this;
        
        // 기존 내용 제거
        while (this.firstChild) {
            this.removeChild(this.firstChild);
        }
        
        // 폴백 스타일 추가
        var style = document.createElement('style');
        style.textContent = this.getFallbackCSS();
        document.head.appendChild(style);
        
        // 래퍼 생성
        var wrapper = document.createElement('div');
        wrapper.className = 'popover-wrapper-fallback';
        
        // 앵커 생성
        var anchor = document.createElement('div');
        anchor.className = 'popover__anchor-fallback';
        anchor.setAttribute('role', 'button');
        anchor.setAttribute('tabindex', '0');
        
        // 슬롯 내용 복사
        var slotContent = this.innerHTML;
        anchor.innerHTML = slotContent;
        
        // 팝오버 생성
        var popover = document.createElement('div');
        popover.id = this._popoverId;
        popover.className = 'popover-fallback ' + this.getPopoverClasses().replace(/popover/g, 'popover-fallback');
        popover.setAttribute('role', 'tooltip');
        popover.style.display = this._isOpen ? 'block' : 'none';
        
        // 화살표 생성
        var arrow = document.createElement('div');
        arrow.className = 'popover__arrow-fallback';
        arrow.innerHTML = '<svg width="18" height="8" viewBox="0 0 18 8" fill="none"><path d="M9.76822 0.921865L14.7671 6.92055C15.3371 7.60453 16.1815 8 17.0718 8L0.928209 8C1.81855 8 2.66289 7.60453 3.23287 6.92055L8.23178 0.921865C8.63157 0.442111 9.36843 0.442111 9.76822 0.921865Z" fill="' + this.getArrowFillColor() + '"/></svg>';
        
        // 콘텐츠 생성
        var content = document.createElement('div');
        content.className = 'popover__content-fallback';
        content.textContent = this._content;
        
        // 구조 조립
        popover.appendChild(arrow);
        popover.appendChild(content);
        wrapper.appendChild(anchor);
        wrapper.appendChild(popover);
        this.appendChild(wrapper);
        
        // 요소 참조 저장
        this._anchorElement = anchor;
        this._popoverElement = popover;
        this._arrowElement = arrow;
        this._contentElement = content;
        
        // 위치 설정
        this.updateFallbackPosition();
    }

    getFallbackCSS() {
        return `
            .popover-wrapper-fallback {
                display: inline-block;
                position: relative;
            }
            
            .popover-fallback {
                position: absolute;
                z-index: 1000;
                max-width: 260px;
                padding: 8px 16px;
                border-radius: 4px;
                word-wrap: break-word;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                background: #005df9;
                color: #ffffff;
                font-size: 14px;
                line-height: 1.4;
                font-weight: 500;
            }
            
            .popover-fallback--color-primary {
                background: #005df9;
                color: #ffffff;
            }
            
            .popover-fallback--color-gray {
                background: #374151;
                color: #ffffff;
            }
            
            .popover__anchor-fallback {
                display: inline-block;
                cursor: pointer;
                min-height: 44px;
                min-width: 44px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            
            .popover__arrow-fallback {
                position: absolute;
                width: 18px;
                height: 8px;
                top: -8px;
                left: 50%;
                transform: translateX(-50%);
            }
            
            .popover__arrow-fallback svg {
                display: inline-block;
                vertical-align: top;
                width: 100%;
                height: 100%;
            }
            
            .popover__content-fallback {
                position: relative;
                color: #ffffff;
                font-size: 14px;
                line-height: 1.4;
                font-weight: 500;
                white-space: nowrap;
            }
            
            /* iOS 6 특별 처리 */
            .popover-fallback {
                -webkit-border-radius: 4px;
                -webkit-box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            .popover__anchor-fallback {
                -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
            }
        `;
    }

    updateFallbackPosition() {
        if (!this._anchorElement || !this._popoverElement) return;
        
        var anchorRect = this._anchorElement.getBoundingClientRect();
        var popover = this._popoverElement;
        
        // 간단한 위치 계산 (iOS 6용)
        popover.style.position = 'fixed';
        popover.style.left = (anchorRect.left + anchorRect.width / 2 - 130) + 'px';
        popover.style.top = (anchorRect.bottom + 10) + 'px';
        
        // 뷰포트 경계 체크
        var popoverRect = popover.getBoundingClientRect();
        if (popoverRect.left < 8) {
            popover.style.left = '8px';
        }
        if (popoverRect.right > window.innerWidth - 8) {
            popover.style.left = (window.innerWidth - popoverRect.width - 8) + 'px';
        }
    }

    // Public methods
    show() { this.open(); }
    hide() { this.close(); }
    toggle() { this._isOpen ? this.close() : this.open(); }
}

// iOS 6 폴백 커스텀 엘리먼트 등록
console.log('Registering PopoverComponent...');
console.log('customElements available:', typeof customElements !== 'undefined');

try {
    if (typeof customElements !== 'undefined') {
        console.log('Using modern customElements.define');
        customElements.define('popover-component', PopoverComponent);
        console.log('PopoverComponent registered successfully');
    } else {
        console.log('Using fallback registerElement');
    // iOS 6 폴백: 간단한 폴리필
    document.registerElement = document.registerElement || function(name, options) {
        var element = function() {
            return document.createElement(name);
        };
        element.prototype = Object.create(HTMLElement.prototype);
        return element;
    };
    
    // 폴백 등록
    var PopoverFallback = document.registerElement('popover-component', {
        prototype: Object.create(HTMLElement.prototype)
    });
    
    // 폴백 초기화
    document.addEventListener('DOMContentLoaded', function() {
        var elements = document.querySelectorAll('popover-component');
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            var popover = new PopoverComponent();
            
            // 속성 복사
            for (var j = 0; j < element.attributes.length; j++) {
                var attr = element.attributes[j];
                popover.setAttribute(attr.name, attr.value);
            }
            
            // 내용 복사
            popover.innerHTML = element.innerHTML;
            
            // 교체
            element.parentNode.replaceChild(popover, element);
        }
    });
}
} catch (error) {
    console.error('Error registering PopoverComponent:', error);
}
