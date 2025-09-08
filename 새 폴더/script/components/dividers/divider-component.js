class DividerComponent extends HTMLElement {
    constructor() {
        super();
        // AOS6 대응 폴백 스크립트
        this.initShadowDOM();
    }

    // AOS6 대응을 위한 Shadow DOM 초기화
    initShadowDOM() {
        try {
            // Shadow DOM 지원 확인
            if (this.attachShadow) {
                this.attachShadow({ mode: 'open' });
            } else {
                // AOS6 이하 폴백: 일반 DOM 요소로 대체
                this.createFallbackElement();
            }
        } catch (error) {
            this.createFallbackElement();
        }
    }

    // AOS6 이하 폴백 요소 생성
    createFallbackElement() {
        this.fallbackMode = true;
        this.fallbackElement = document.createElement('div');
        this.fallbackElement.className = 'divider-fallback';
        this.appendChild(this.fallbackElement);
    }

    static get observedAttributes() {
        return ['type', 'orientation', 'color', 'size'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    getType() {
        return this.getAttribute('type') || 'basic';
    }

    getOrientation() {
        return this.getAttribute('orientation') || 'horizontal';
    }

    getColor() {
        return this.getAttribute('color') || '';
    }

    getSize() {
        return this.getAttribute('size') || '';
    }

    getAriaLabel() {
        const type = this.getType();
        const orientation = this.getOrientation();
        const color = this.getColor();
        const size = this.getSize();
        
        let label = '';
        
        // Type 설명
        if (type === 'basic') {
            label += '기본 구분선';
        } else if (type === 'group') {
            label += '그룹 구분선';
        }
        
        // Orientation 설명
        if (orientation === 'horizontal') {
            label += ' - 수평';
        } else if (orientation === 'vertical') {
            label += ' - 수직';
        }
        
        // Color 설명
        if (color === 'accent') {
            label += ' - 강조 색상';
        } else if (color === 'secondary') {
            label += ' - 보조 색상';
        } else if (color === 'tertiary') {
            label += ' - 3차 색상';
        } else if (color === 'brand') {
            label += ' - 브랜드 색상';
        }
        
        // Size 설명
        if (size === 'inset') {
            label += ' - 여백 있음';
        }
        
        return label || '구분선';
    }

    render() {
        const type = this.getType();
        const orientation = this.getOrientation();
        const color = this.getColor();
        const size = this.getSize();
        const ariaLabel = this.getAriaLabel();

        if (this.fallbackMode) {
            // AOS6 이하 폴백 렌더링
            this.renderFallback(type, orientation, color, size, ariaLabel);
        } else {
            // 일반 Shadow DOM 렌더링
            this.renderShadowDOM(type, orientation, color, size, ariaLabel);
        }
    }

    // AOS6 이하 폴백 렌더링
    renderFallback(type, orientation, color, size, ariaLabel) {
        const fallbackElement = this.fallbackElement;
        
        // 기본 스타일 적용
        fallbackElement.style.display = 'block';
        fallbackElement.style.width = '100%';
        fallbackElement.style.height = '100%';
        fallbackElement.style.boxSizing = 'border-box';
        fallbackElement.style.backgroundColor = 'var(--border-secondary)';
        fallbackElement.style.border = '0';
        fallbackElement.style.minHeight = '1px';
        fallbackElement.style.minWidth = '1px';

        // Type modifiers (thickness)
        if (type === 'basic' && orientation === 'horizontal') {
            fallbackElement.style.height = '1px';
            fallbackElement.style.minHeight = '1px';
        } else if (type === 'basic' && orientation === 'vertical') {
            fallbackElement.style.width = '1px';
            fallbackElement.style.minWidth = '1px';
        } else if (type === 'group' && orientation === 'horizontal') {
            fallbackElement.style.height = '10px';
            fallbackElement.style.minHeight = '10px';
        } else if (type === 'group' && orientation === 'vertical') {
            fallbackElement.style.width = '10px';
            fallbackElement.style.minWidth = '10px';
        }

        // Size modifiers
        if (size === 'inset') {
            if (orientation === 'vertical') {
                fallbackElement.style.paddingTop = 'var(--spacing-md)';
                fallbackElement.style.paddingBottom = 'var(--spacing-md)';
            } else {
                fallbackElement.style.paddingLeft = 'var(--spacing-2xl)';
                fallbackElement.style.paddingRight = 'var(--spacing-2xl)';
            }
        }

        // Color modifiers
        if (color === 'accent') {
            fallbackElement.style.backgroundColor = 'var(--border-primary-heavy)';
        } else if (color === 'secondary') {
            fallbackElement.style.backgroundColor = 'var(--border-secondary)';
        } else if (color === 'tertiary') {
            fallbackElement.style.backgroundColor = 'var(--border-tertiary)';
        } else if (color === 'brand') {
            fallbackElement.style.backgroundColor = 'var(--border-brand-disabled)';
        }

        // 모바일 접근성 개선
        if (window.innerWidth <= 768) {
            fallbackElement.style.webkitTapHighlightColor = 'transparent';
            
            if (color === 'accent') {
                fallbackElement.style.backgroundColor = 'var(--border-primary-heavy)';
                fallbackElement.style.opacity = '1';
            } else if (color === 'secondary') {
                fallbackElement.style.backgroundColor = 'var(--border-secondary)';
                fallbackElement.style.opacity = '0.8';
            } else if (color === 'tertiary') {
                fallbackElement.style.backgroundColor = 'var(--border-tertiary)';
                fallbackElement.style.opacity = '0.6';
            }
        }

        // 접근성 속성 설정
        this.setAttribute('role', 'separator');
        this.setAttribute('aria-label', ariaLabel);
        this.setAttribute('aria-hidden', 'false');
        this.setAttribute('tabindex', '-1');
    }

    // Shadow DOM 렌더링
    renderShadowDOM(type, orientation, color, size, ariaLabel) {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    height: 100%;
                    box-sizing: border-box;
                    background-color: var(--border-secondary);
                    border: 0;
                    min-height: 1px;
                    min-width: 1px;
                }

                /* Type modifiers (thickness) */
                :host([type="basic"][orientation="horizontal"]) {
                    height: 1px;
                    min-height: 1px;
                }
                :host([type="basic"][orientation="vertical"]) {
                    width: 1px;
                    min-width: 1px;
                }
                :host([type="group"][orientation="horizontal"]) {
                    height: 10px;
                    min-height: 10px;
                }
                :host([type="group"][orientation="vertical"]) {
                    width: 10px;
                    min-width: 10px;
                }

                /* Size modifiers */
                :host([size="inset"]) {
                    padding-left: var(--spacing-2xl);
                    padding-right: var(--spacing-2xl);
                }
                :host([orientation="vertical"][size="inset"]) {
                    padding-top: var(--spacing-md);
                    padding-bottom: var(--spacing-md);
                }

                /* Color modifiers */
                :host([color="accent"]) {
                    background-color: var(--border-primary-heavy);
                }
                :host([color="secondary"]) {
                    background-color: var(--border-secondary);
                }
                :host([color="tertiary"]) {
                    background-color: var(--border-tertiary);
                }
                :host([color="brand"]) {
                    background-color: var(--border-brand-disabled);
                }

                /* 모바일 접근성 개선 */
                @media (max-width: 768px) {
                    :host {
                        -webkit-tap-highlight-color: transparent;
                    }
                    
                    :host([color="accent"]) {
                        background-color: var(--border-primary-heavy);
                        opacity: 1;
                    }
                    
                    :host([color="secondary"]) {
                        background-color: var(--border-secondary);
                        opacity: 0.8;
                    }
                    
                    :host([color="tertiary"]) {
                        background-color: var(--border-tertiary);
                        opacity: 0.6;
                    }
                }
            </style>
        `;

        // 접근성 속성 설정
        this.setAttribute('role', 'separator');
        this.setAttribute('aria-label', ariaLabel);
        this.setAttribute('aria-hidden', 'false');
        this.setAttribute('tabindex', '-1');
    }
}

// AOS6 대응을 위한 Custom Elements 폴백
if (typeof customElements !== 'undefined') {
    customElements.define('divider-component', DividerComponent);
} else {
    // AOS6 이하 폴백: 일반 클래스로 동작
    window.DividerComponent = DividerComponent;
}
