class SolidButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._button = null;
    }

    static get observedAttributes() {
        return ['color', 'variant', 'size', 'rounded', 'disabled', 'loading', 'label'];
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        this.setupFocusManagement();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
            this.setupEventListeners();
            this.setupFocusManagement();
        }
    }

    get color() { return this.getAttribute('color') || 'primary'; }
    get variant() { return this.getAttribute('variant') || 'solid'; }
    get size() { return this.getAttribute('size') || 'm'; }
    get rounded() { return this.hasAttribute('rounded'); }
    get disabled() { return this.hasAttribute('disabled'); }
    get loading() { return this.hasAttribute('loading'); }
    get label() { return this.getAttribute('label') || ''; }
    get fullWidth() { return this.hasAttribute('full-width'); }

    getButtonClasses() {
        const classes = ['solid-button'];
        
        if (this.color) classes.push(`solid-button--color-${this.color}`);
        if (this.variant) classes.push(`solid-button--variant-${this.variant}`);
        if (this.size) classes.push(`solid-button--size-${this.size}`);
        if (this.rounded) classes.push('solid-button--rounded');
        if (this.disabled) classes.push('solid-button--disabled');
        if (this.loading) classes.push('solid-button--loading');
        if (this.fullWidth) classes.push('solid-button--full-width');

        return classes.join(' ');
    }

    render() {
        const buttonClasses = this.getButtonClasses();
        
        // 아이콘 슬롯 내용 확인
        const leftIconSlot = this.querySelector('[slot="leftIcon"]');
        const rightIconSlot = this.querySelector('[slot="rightIcon"]');
        
        this.shadowRoot.innerHTML = `
            <style>
                ${this.getStyles()}
            </style>
            <button class="${buttonClasses}" ${this.disabled ? 'disabled' : ''} type="button" tabindex="0">
                ${leftIconSlot ? '<span class="solid-button__left-icon"><slot name="leftIcon"></slot></span>' : ''}
                <span class="solid-button__label">${this.label}</span>
                ${rightIconSlot ? '<span class="solid-button__right-icon"><slot name="rightIcon"></slot></span>' : ''}
                ${this.loading ? '<div class="lottie-animation"></div>' : ''}
            </button>
        `;
    }

    setupFocusManagement() {
        // Shadow DOM 내부의 버튼에 포커스 전달
        this._button = this.shadowRoot.querySelector('button');
        
        if (this._button) {
            // 호스트 요소가 포커스를 받으면 내부 버튼에 전달
            this.addEventListener('focus', () => {
                if (this._button && !this.disabled) {
                    this._button.focus();
                }
            });

            // 키보드 이벤트 처리
            this._button.addEventListener('keydown', (event) => {
                if (this.disabled || this.loading) return;

                switch (event.key) {
                    case 'Enter':
                    case ' ':
                        event.preventDefault();
                        this._button.click();
                        break;
                    case 'Tab':
                        // 기본 탭 동작 허용
                        break;
                }
            });

            // 포커스 이벤트 처리
            this._button.addEventListener('focus', () => {
                this.setAttribute('focused', '');
            });

            this._button.addEventListener('blur', () => {
                this.removeAttribute('focused');
            });
        }
    }

    setupEventListeners() {
        const button = this.shadowRoot.querySelector('button');
        if (button) {
            button.addEventListener('click', (event) => {
                if (!this.disabled && !this.loading) {
                    this.dispatchEvent(new CustomEvent('click', {
                        detail: { event },
                        bubbles: true,
                        composed: true
                    }));
                }
            });
        }
    }

    // 포커스 메서드 추가
    focus() {
        if (this._button && !this.disabled) {
            this._button.focus();
        }
    }

    blur() {
        if (this._button) {
            this._button.blur();
        }
    }

    // 접근성 속성 추가
    get tabIndex() {
        return this._button ? this._button.tabIndex : 0;
    }

    set tabIndex(value) {
        if (this._button) {
            this._button.tabIndex = value;
        }
    }

    getStyles() {
        return `
            /* CSS 변수 정의 */
            :host {
                --ease: cubic-bezier(0.4, 0, 0.2, 1);
                --focus-color: #005df9;
                --bg-disabled: #f0f4fa;
                --text-disabled-same: #818da2;
                --border-brand: #005df9;
                --border-secondary: #d0d5dd;
                --border-disabled: #d0d5dd;
                --bg-dark-a20: rgba(12, 17, 29, 0.2);
                --bg-dark-a10: rgba(12, 17, 29, 0.1);
                --bg-brand-strong-same: #005df9;
                --text-ondark-primary-same: #ffffff;
                --bg-brand: #ebf0ff;
                --text-brand: #005df9;
                --bg-gray: #f0f4fa;
                --text-primary: #101828;
                --text-secondary: #667085;
                --fg-disabled: #f0f4fa;
                --spacing-lg: 12px;
                --spacing-md: 8px;
                --spacing-sm: 4px;
                --spacing-xs: 2px;
                --spacing-none: 0px;
                --radius-xl: 16px;
                --radius-md: 12px;
                --radius-sm: 10px;
                --radius-xs: 8px;
                --radius-xxs: 4px;
                --radius-full: 9999px;
                --font-size-body-l: 16px;
                --font-size-body-m: 14px;
                --font-size-body-s: 12px;
                --font-size-detail-l: 12px;
                --font-size-title-xl: 20px;
                --font-size-title-l: 18px;
                --font-size-title-m: 16px;
                --font-size-title-s: 14px;
                --lineheight-body-l: 24px;
                --lineheight-body-m: 20px;
                --lineheight-body-s: 16px;
                --lineheight-title-xl: 28px;
                --lineheight-title-l: 26px;
                --lineheight-title-m: 22px;
                --lineheight-title-s: 20px;
            }
            /* Button 기본 스타일 */
            /* Button component */
            .solid-button {
            position: relative;
            overflow: hidden;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 24px;
            border: 0;
            box-sizing: border-box;
            font-weight: 500;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.25s var(--ease);
            }

            .solid-button:focus-visible,
            .solid-button:focus {
            outline: 2px solid var(--focus-color);
            outline-offset: 2px;
            }

            /* 포커스 상태 스타일 */
            :host([focused]) .solid-button {
            outline: 2px solid var(--focus-color);
            outline-offset: 2px;
            }

            .solid-button.solid-button--disabled {
            background-color: var(--bg-disabled) !important;
            color: var(--text-disabled-same) !important;
            cursor: not-allowed;
            }

            /* Color modifiers */
            .solid-button.solid-button--color-primary {
            background-color: var(--bg-brand-strong-same);
            color: var(--text-ondark-primary-same);
            border-color: var(--border-brand);
            }

            .solid-button.solid-button--color-primary:active:not(:disabled) {
            background-color: var(--bg-dark-a20);
            }

            .solid-button.solid-button--color-primary.solid-button--disabled {
            color: var(--text-disabled-same) !important;
            background-color: var(--bg-disabled) !important;
            }

            .solid-button.solid-button--color-secondary {
            background-color: var(--bg-brand);
            color: var(--text-brand);
            border: 0;
            }

            .solid-button.solid-button--color-secondary:active:not(:disabled) {
            background-color: var(--bg-dark-a10);
            }

            .solid-button.solid-button--color-secondary.solid-button--disabled {
            background-color: var(--fg-disabled);
            border-color: var(--border-disabled);
            color: var(--text-ondark-primary-same);
            }

            .solid-button.solid-button--color-netural {
            background-color: var(--bg-gray);
            color: var(--text-primary);
            border: 0;
            }

            .solid-button.solid-button--color-netural:active:not(:disabled) {
            background-color: var(--bg-dark-a10);
            }

            .solid-button.solid-button--color-netural.solid-button--disabled {
            background-color: var(--fg-disabled);
            border-color: var(--border-disabled);
            color: var(--text-ondark-primary-same);
            }

            /* Size modifiers */
            .solid-button.solid-button--size-xl {
            padding: var(--spacing-lg);
            border-radius: var(--radius-xl);
            }

            .solid-button.solid-button--size-xl .solid-button__label {
            padding: var(--spacing-none) var(--spacing-sm);
            font-size: var(--font-size-title-l);
            line-height: var(--lineheight-title-l);
            }

            .solid-button.solid-button--size-xl .lottie-animation {
            width: 24px;
            height: 24px;
            }

            .solid-button.solid-button--size-xl .solid-button__left-icon {
            width: 24px;
            height: 24px;
            }

            .solid-button.solid-button--size-xl .solid-button__right-icon {
            width: 24px;
            height: 24px;
            }

            .solid-button.solid-button--size-xl.solid-button--variant-underline .solid-button__label {
            padding: 0;
            font-size: var(--font-size-title-xl);
            line-height: var(--lineheight-title-xl);
            }

            .solid-button.solid-button--size-l {
            padding: var(--spacing-md);
            border-radius: var(--radius-md);
            }

            .solid-button.solid-button--size-l .solid-button__label {
            padding: var(--spacing-none) var(--spacing-sm);
            font-size: var(--font-size-body-l);
            line-height: var(--lineheight-body-l);
            }

            .solid-button.solid-button--size-l .lottie-animation {
            width: 20px;
            height: 20px;
            }

            .solid-button.solid-button--size-l .solid-button__left-icon {
            width: 20px;
            height: 20px;
            }

            .solid-button.solid-button--size-l .solid-button__right-icon {
            width: 20px;
            height: 20px;
            }

            .solid-button.solid-button--size-l.solid-button--variant-underline .solid-button__label {
            padding: 0;
            font-size: var(--font-size-title-l);
            line-height: var(--lineheight-title-l);
            }

            .solid-button.solid-button--size-l.solid-button--variant-outline .solid-button__label {
            padding: var(--spacing-none) var(--spacing-sm);
            font-size: var(--font-size-body-l);
            line-height: var(--lineheight-body-l);
            }

            .solid-button.solid-button--size-m {
            padding: var(--spacing-md);
            border-radius: var(--radius-sm);
            }

            .solid-button.solid-button--size-m .solid-button__label {
            padding: var(--spacing-none) var(--spacing-sm);
            font-size: var(--font-size-body-m);
            line-height: var(--lineheight-body-m);
            }

            .solid-button.solid-button--size-m .lottie-animation {
            width: 16px;
            height: 16px;
            }

            .solid-button.solid-button--size-m .solid-button__left-icon {
            width: 16px;
            height: 16px;
            }

            .solid-button.solid-button--size-m .solid-button__right-icon {
            width: 16px;
            height: 16px;
            }

            .solid-button.solid-button--size-m.solid-button--variant-underline .solid-button__label {
            padding: 0;
            font-size: var(--font-size-title-m);
            line-height: var(--lineheight-title-m);
            }

            .solid-button.solid-button--size-s {
            padding: var(--spacing-sm);
            border-radius: var(--radius-sm);
            }

            .solid-button.solid-button--size-s .solid-button__label {
            padding: var(--spacing-none) var(--spacing-sm);
            font-size: var(--font-size-body-s);
            line-height: var(--lineheight-body-s);
            }

            .solid-button.solid-button--size-s .lottie-animation {
            width: 14px;
            height: 14px;
            }

            .solid-button.solid-button--size-s .solid-button__left-icon {
            width: 14px;
            height: 14px;
            }

            .solid-button.solid-button--size-s .solid-button__right-icon {
            width: 14px;
            height: 14px;
            }

            .solid-button.solid-button--size-s.solid-button--variant-underline .solid-button__label {
            padding: 0;
            font-size: var(--font-size-body-m);
            line-height: var(--lineheight-body-m);
            }

            .solid-button.solid-button--size-xs {
            border-radius: var(--radius-xs);
            padding: var(--spacing-xs) var(--spacing-xs);
            }

            .solid-button.solid-button--size-xs .solid-button__label {
            padding: var(--spacing-none) var(--spacing-xs);
            font-size: var(--font-size-detail-l);
            line-height: 20px;
            }

            .solid-button.solid-button--size-xs .lottie-animation {
            width: 12px;
            height: 12px;
            }

            .solid-button.solid-button--size-xs .solid-button__left-icon {
            width: 12px;
            height: 12px;
            }

            .solid-button.solid-button--size-xs .solid-button__right-icon {
            width: 12px;
            height: 12px;
            }

            .solid-button.solid-button--size-xs.solid-button--variant-underline .solid-button__label {
            padding: 0;
            font-size: var(--font-size-title-s);
            line-height: var(--lineheight-title-s);
            }

            /* Box Button_quaternary */
            .solid-button.solid-button--variant-outline {
            background-color: transparent;
            color: var(--text-primary);
            border: 1px solid var(--border-secondary);
            }

            .solid-button.solid-button--variant-outline.solid-button--disabled {
            background-color: var(--bg-disabled) !important;
            border-color: var(--border-disabled) !important;
            color: var(--text-disabled-same) !important;
            }

            /* Text Button_Basic */
            .solid-button.solid-button--variant-ghost {
            background-color: transparent;
            padding: var(--spacing-none);
            color: var(--text-brand);
            border-radius: var(--radius-xs);
            gap: var(--spacing-sm);
            border: none;
            }

            .solid-button.solid-button--variant-ghost:focus-visible {
            outline: 2px solid var(--focus-color);
            outline-offset: 2px;
            }

            .solid-button.solid-button--variant-ghost:active:not(:disabled) {
            background-color: var(--bg-dark-a10);
            }

            .solid-button.solid-button--variant-ghost.solid-button--disabled {
            background-color: transparent !important;
            }

            .solid-button.solid-button--variant-ghost.solid-button--color-primary {
            color: var(--text-brand);
            }

            .solid-button.solid-button--variant-ghost.solid-button--color-secondary {
            color: var(--text-secondary);
            }

            /* Text Button_Underline */
            .solid-button.solid-button--variant-underline {
            background-color: transparent;
            padding: 0 0 2px;
            color: var(--text-brand);
            border-radius: 0;
            border-bottom: 0;
            box-sizing: border-box;
            }

            .solid-button.solid-button--variant-underline:focus-visible {
            outline: 2px solid var(--focus-color);
            outline-offset: 2px;
            border-radius: var(--radius-xxs);
            }

            .solid-button.solid-button--variant-underline::before {
            content: "";
            position: absolute;
            left: 0;
            bottom: 0;
            display: block;
            clear: both;
            width: 100%;
            height: 2px;
            background-color: var(--text-brand);
            }

            .solid-button.solid-button--variant-underline.solid-button--disabled {
            color: var(--text-disabled-same) !important;
            background-color: transparent !important;
            border-color: transparent !important;
            }

            .solid-button.solid-button--variant-underline.solid-button--disabled::before {
            background-color: var(--text-disabled-same) !important;
            }

            .solid-button.solid-button--variant-underline:active:not(:disabled) {
            border-radius: var(--radius-xxs);
            }

            .solid-button.solid-button--variant-underline:active:not(:disabled) {
            background-color: var(--bg-dark-a10);
            border-radius: var(--radius-xxs);
            }

            .solid-button.solid-button--variant-underline.solid-button--color-primary {
            color: var(--text-brand);
            }

            .solid-button.solid-button--variant-underline.solid-button--color-primary::before {
            background-color: var(--text-brand);
            }

            .solid-button.solid-button--variant-underline.solid-button--color-secondary {
            color: var(--text-secondary);
            }

            .solid-button.solid-button--variant-underline.solid-button--color-secondary::before {
            background-color: var(--text-secondary);
            }

            /* Capsule Button */
            .solid-button.solid-button--rounded {
            border-radius: var(--radius-full) !important;
            background-color: var(--bg-gray);
            color: var(--text-secondary);
            }

            /* outline */
            .solid-button.solid-button--rounded.solid-button--variant-outline {
            border: 1px solid var(--border-secondary);
            background-color: transparent;
            color: var(--text-secondary);
            }

            /* disabled */
            .solid-button.solid-button--rounded.solid-button--variant-outline.solid-button--variant-outline {
            background-color: transparent !important;
            }

            /* Loading Button */
            .solid-button.solid-button--loading::after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: var(--bg-dark-a10);
            }

            .solid-button.solid-button--loading.solid-button--color-primary.solid-button--variant-solid::after {
            background-color: var(--bg-dark-a20);
            }

            /* Label Element */
            .solid-button .solid-button__label {
            position: relative;
            display: inline-block;
            }

            /* Full Width Option */
            .solid-button.solid-button--full-width {
            width: 100%;
            }

            /* icons */
            .solid-button .solid-button__left-icon {
            display: flex;
            align-items: center;
            justify-content: start;
            }

            .solid-button .solid-button__right-icon {
            display: flex;
            align-items: center;
            justify-content: end;
            }

        `;
    }
}

// 웹 컴포넌트 등록
customElements.define('solid-button', SolidButton);

// AOS6 및 구형 브라우저를 위한 폴백 스크립트
(function() {
    // Web Components 지원 여부 확인
    if (!window.customElements) {
        // 폴백 구현: solid-button 태그를 일반 HTML 버튼으로 변환
        function createFallbackButton(element) {
            const label = element.getAttribute('label') || '';
            const color = element.getAttribute('color') || 'primary';
            const variant = element.getAttribute('variant') || 'solid';
            const size = element.getAttribute('size') || 'm';
            const rounded = element.hasAttribute('rounded');
            const disabled = element.hasAttribute('disabled');
            const loading = element.hasAttribute('loading');
            
            // 클래스명 생성
            const classes = ['solid-button'];
            if (color) classes.push(`solid-button--color-${color}`);
            if (variant) classes.push(`solid-button--variant-${variant}`);
            if (size) classes.push(`solid-button--size-${size}`);
            if (rounded) classes.push('solid-button--rounded');
            if (disabled) classes.push('solid-button--disabled');
            if (loading) classes.push('solid-button--loading');
            
            // 버튼 요소 생성
            const button = document.createElement('button');
            button.className = classes.join(' ');
            button.type = 'button';
            if (disabled) button.disabled = true;
            
            // 아이콘 슬롯 처리
            const leftIcon = element.querySelector('[slot="leftIcon"]');
            const rightIcon = element.querySelector('[slot="rightIcon"]');
            
            // HTML 구조 생성
            button.innerHTML = `
                <span class="solid-button__left-icon">
                    ${leftIcon ? leftIcon.outerHTML : ''}
                </span>
                <span class="solid-button__label">${label}</span>
                <span class="solid-button__right-icon">
                    ${rightIcon ? rightIcon.outerHTML : ''}
                </span>
                ${loading ? '<div class="lottie-animation"></div>' : ''}
            `;
            
            // 이벤트 리스너 추가
            button.addEventListener('click', function(event) {
                if (!disabled && !loading) {
                    // 커스텀 이벤트 발생
                    const customEvent = new CustomEvent('click', {
                        detail: { event },
                        bubbles: true
                    });
                    element.dispatchEvent(customEvent);
                }
            });

            // 키보드 이벤트 처리
            button.addEventListener('keydown', function(event) {
                if (disabled || loading) return;

                switch (event.key) {
                    case 'Enter':
                    case ' ':
                        event.preventDefault();
                        button.click();
                        break;
                }
            });

            // 포커스 이벤트 처리
            button.addEventListener('focus', function() {
                element.setAttribute('focused', '');
            });

            button.addEventListener('blur', function() {
                element.removeAttribute('focused');
            });
            
            return button;
        }
        
        // DOM이 로드된 후 폴백 구현 실행
        function initFallback() {
            const solidButtons = document.querySelectorAll('solid-button');
            solidButtons.forEach(function(element) {
                const fallbackButton = createFallbackButton(element);
                element.parentNode.insertBefore(fallbackButton, element);
                element.style.display = 'none'; // 원본 요소 숨김
            });
        }
        
        // DOMContentLoaded 또는 즉시 실행
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initFallback);
        } else {
            initFallback();
        }
        
        // 동적으로 추가되는 요소를 위한 MutationObserver
        if (window.MutationObserver) {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1 && node.tagName === 'SOLID-BUTTON') {
                            const fallbackButton = createFallbackButton(node);
                            node.parentNode.insertBefore(fallbackButton, node);
                            node.style.display = 'none';
                        }
                    });
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }
})();
