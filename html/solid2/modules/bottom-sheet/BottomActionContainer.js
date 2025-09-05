/**
 * BottomActionContainer 웹컴포넌트
 * Bottom 영역에 고정되는 액션 컨테이너 컴포넌트
 */

class BottomActionContainer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        // render 완료 후 속성 설정
        this.$nextTick(() => {
            this.setupAttributes();
        });
    }

    // nextTick 구현 (Vue의 nextTick과 유사한 기능)
    $nextTick(callback) {
        if (typeof Promise !== 'undefined') {
            Promise.resolve().then(callback);
        } else {
            setTimeout(callback, 0);
        }
    }

    static get observedAttributes() {
        return ['scroll-dim'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue && this.shadowRoot) {
            // shadowRoot가 준비된 후에만 실행
            this.$nextTick(() => {
                this.updateComponent();
            });
        }
    }

    setupAttributes() {
        // scroll-dim 속성 처리
        const scrollDim = this.getAttribute('scroll-dim') === 'true';
        // render가 완료된 후에 updateScrollDim 실행
        this.updateScrollDim(scrollDim);
    }

    updateScrollDim(scrollDim) {
        // render가 완료된 후에만 실행되도록 보장
        if (this.shadowRoot) {
            const container = this.shadowRoot.querySelector('.sv-bottom-action-container');
            if (container) {
                if (scrollDim) {
                    container.classList.add('sv-bottom-action-container--scroll-dim');
                } else {
                    container.classList.remove('sv-bottom-action-container--scroll-dim');
                }
            }
        }
    }

    updateComponent() {
        if (this.shadowRoot) {
            const scrollDim = this.getAttribute('scroll-dim') === 'true';
            this.updateScrollDim(scrollDim);
        }
    }

    render() {
        const scrollDim = this.getAttribute('scroll-dim') === 'true';
        
        this.shadowRoot.innerHTML = `
            <style>
                /* CSS 변수 정의 - SCSS 변수와 동일한 값 사용 */
                :host {
                    /* Prefix */
                    --sv-prefix: 'sv';
                    
                    /* Spacing tokens */
                    --sv-spacing-none: 0px;
                    --sv-spacing-xs: 2px;
                    --sv-spacing-sm: 4px;
                    --sv-spacing-md: 8px;
                    --sv-spacing-lg: 12px;
                    --sv-spacing-xl: 16px;
                    --sv-spacing-2xl: 20px;
                    --sv-spacing-3xl: 24px;
                    --sv-spacing-4xl: 32px;
                    --sv-spacing-5xl: 40px;
                    --sv-spacing-6xl: 48px;
                    --sv-spacing-7xl: 80px;
                    
                    /* Z-index */
                    --sv-z-index-dropdown: 1000;
                    --sv-z-index-sticky: 1020;
                    --sv-z-index-fixed: 1030;
                    --sv-z-index-modal-backdrop: 1040;
                    --sv-z-index-offcanvas: 1050;
                    --sv-z-index-modal: 1060;
                    --sv-z-index-popover: 1070;
                    --sv-z-index-tooltip: 1080;
                    
                    /* Colors - Light theme (기본값) */
                    --sv-bg-canvas-white-elevated: #ffffff;
                    --sv-bg-canvas-white: #ffffff;
                    --sv-bg-canvas-gray-light: #f8f9fc;
                    --sv-bg-canvas-gray: #f0f4fa;
                    --sv-bg-transparent: transparent;
                }

                /* Dark theme */
                [data-theme="dark"] {
                    --sv-bg-canvas-white-elevated: #101828;
                    --sv-bg-canvas-white: #101828;
                    --sv-bg-canvas-gray-light: #101828;
                    --sv-bg-canvas-gray: #000000;
                }

                /* BottomActionContainer 스타일 */
                .sv-bottom-action-container {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    z-index: var(--sv-z-index-dropdown);
                    background-color: var(--sv-bg-transparent);
                    border-top: 0;
                    box-sizing: border-box;
                    padding: var(--sv-spacing-none) var(--sv-spacing-4xl) 34px;
                }

                .sv-bottom-action-container__gradient {
                    position: absolute;
                    top: calc(-1 * var(--sv-spacing-3xl));
                    left: 0;
                    right: 0;
                    height: var(--sv-spacing-3xl);
                    background: linear-gradient(to top, var(--sv-bg-canvas-white-elevated) calc(100% - 14px), transparent);
                    pointer-events: none;
                }

                .sv-bottom-action-container__content {
                    display: flex;
                    flex-direction: column;
                    gap: var(--sv-spacing-xl);
                    padding: var(--sv-spacing-none);
                    min-height: 0;
                }

                .sv-bottom-action-container--scroll-dim {
                    background-color: var(--sv-bg-canvas-white-elevated);
                }

                /* 숨김 처리 */
                .sv-bottom-action-container[hidden] {
                    display: none !important;
                }

                /* 슬롯 스타일 */
                ::slotted(*) {
                    box-sizing: border-box;
                }

                /* 반응형 디자인 */
                @media (max-width: 768px) {
                    .sv-bottom-action-container {
                        padding: var(--sv-spacing-none) var(--sv-spacing-xl) var(--sv-spacing-3xl);
                    }
                }
            </style>
            
            <div class="sv-bottom-action-container ${scrollDim ? 'sv-bottom-action-container--scroll-dim' : ''}" 
                 role="region" 
                 aria-label="Bottom action container">
                ${scrollDim ? '<div class="sv-bottom-action-container__gradient"></div>' : ''}
                <div class="sv-bottom-action-container__content">
                    <slot></slot>
                </div>
            </div>
        `;
    }

    // 공개 메서드들
    setScrollDim(value) {
        this.setAttribute('scroll-dim', value.toString());
    }

    getScrollDim() {
        return this.getAttribute('scroll-dim') === 'true';
    }

    show() {
        this.removeAttribute('hidden');
    }

    hide() {
        this.setAttribute('hidden', '');
    }
}

// 웹컴포넌트 등록
if (!customElements.get('bottom-action-container')) {
    customElements.define('bottom-action-container', BottomActionContainer);
}
