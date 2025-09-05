class LabelComponent extends HTMLElement {
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
        this.fallbackElement = document.createElement('span');
        this.fallbackElement.className = 'label-fallback';
        this.appendChild(this.fallbackElement);
    }

    static get observedAttributes() {
        return ['type', 'variant'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    getType() {
        return this.getAttribute('type') || 'solid';
    }

    getVariant() {
        return this.getAttribute('variant') || 'blue';
    }

    getText() {
        return this.textContent || this.getAttribute('text') || '텍스트';
    }

    render() {
        const type = this.getType();
        const variant = this.getVariant();
        const text = this.getText();

        if (this.fallbackMode) {
            // AOS6 이하 폴백 렌더링
            this.renderFallback(type, variant, text);
        } else {
            // 일반 Shadow DOM 렌더링
            this.renderShadowDOM(type, variant, text);
        }
    }

    // AOS6 이하 폴백 렌더링
    renderFallback(type, variant, text) {
        const fallbackElement = this.fallbackElement;
        
        // 기본 스타일 적용
        fallbackElement.style.display = 'inline-flex';
        fallbackElement.style.alignItems = 'center';
        fallbackElement.style.justifyContent = 'center';
        fallbackElement.style.height = '22px';
        fallbackElement.style.padding = 'var(--spacing-xs) var(--spacing-md)';
        fallbackElement.style.borderRadius = 'var(--radius-xxs)';
        fallbackElement.style.borderWidth = '1px';
        fallbackElement.style.borderStyle = 'solid';
        fallbackElement.style.fontFamily = 'var(--font-family-pretendard)';
        fallbackElement.style.fontSize = 'var(--font-size-body-s)';
        fallbackElement.style.lineHeight = 'var(--lineheight-body-s)';
        fallbackElement.style.fontWeight = 'var(--typography-fontWeight-medium)';
        fallbackElement.textContent = text;

        // Solid 타입 스타일 적용
        if (type === 'solid') {
            if (variant === 'blue') {
                fallbackElement.style.borderColor = 'var(--palette-new-blue-500)';
                fallbackElement.style.backgroundColor = 'var(--palette-new-blue-500)';
                fallbackElement.style.color = 'var(--white)';
            } else if (variant === 'cyan') {
                fallbackElement.style.borderColor = 'var(--palette-new-cyan-500)';
                fallbackElement.style.backgroundColor = 'var(--palette-new-cyan-500)';
                fallbackElement.style.color = 'var(--white)';
            } else if (variant === 'green') {
                fallbackElement.style.borderColor = 'var(--palette-new-green-500)';
                fallbackElement.style.backgroundColor = 'var(--palette-new-green-500)';
                fallbackElement.style.color = 'var(--white)';
            } else if (variant === 'yellow') {
                fallbackElement.style.borderColor = 'var(--palette-new-yellow-500)';
                fallbackElement.style.backgroundColor = 'var(--palette-new-yellow-500)';
                fallbackElement.style.color = 'var(--gray-900)';
            } else if (variant === 'orange') {
                fallbackElement.style.borderColor = 'var(--palette-new-orange-500)';
                fallbackElement.style.backgroundColor = 'var(--palette-new-orange-500)';
                fallbackElement.style.color = 'var(--white)';
            } else if (variant === 'red') {
                fallbackElement.style.borderColor = 'var(--palette-new-red-500)';
                fallbackElement.style.backgroundColor = 'var(--palette-new-red-500)';
                fallbackElement.style.color = 'var(--white)';
            } else if (variant === 'gray') {
                fallbackElement.style.borderColor = 'var(--gray-500)';
                fallbackElement.style.backgroundColor = 'var(--gray-500)';
                fallbackElement.style.color = 'var(--white)';
            }
        }
        // Line 타입 스타일 적용
        else if (type === 'line') {
            fallbackElement.style.backgroundColor = 'transparent';
            if (variant === 'red') {
                fallbackElement.style.borderColor = 'var(--palette-new-red-500)';
                fallbackElement.style.color = 'var(--palette-new-red-500)';
            } else if (variant === 'orange') {
                fallbackElement.style.borderColor = 'var(--palette-new-orange-500)';
                fallbackElement.style.color = 'var(--palette-new-orange-500)';
            } else if (variant === 'yellow') {
                fallbackElement.style.borderColor = 'var(--palette-new-yellow-500)';
                fallbackElement.style.color = 'var(--palette-new-yellow-500)';
            } else if (variant === 'olive') {
                fallbackElement.style.borderColor = 'var(--palette-new-olive-500)';
                fallbackElement.style.color = 'var(--palette-new-olive-500)';
            } else if (variant === 'celery') {
                fallbackElement.style.borderColor = 'var(--palette-new-celery-500)';
                fallbackElement.style.color = 'var(--palette-new-celery-500)';
            } else if (variant === 'green') {
                fallbackElement.style.borderColor = 'var(--palette-new-green-500)';
                fallbackElement.style.color = 'var(--palette-new-green-500)';
            } else if (variant === 'seaform') {
                fallbackElement.style.borderColor = 'var(--palette-new-seaform-seafoam-500)';
                fallbackElement.style.color = 'var(--palette-new-seaform-seafoam-500)';
            } else if (variant === 'cyan') {
                fallbackElement.style.borderColor = 'var(--palette-new-cyan-500)';
                fallbackElement.style.color = 'var(--palette-new-cyan-500)';
            } else if (variant === 'gray') {
                fallbackElement.style.borderColor = 'var(--gray-500)';
                fallbackElement.style.color = 'var(--gray-500)';
            } else if (variant === 'blue') {
                fallbackElement.style.borderColor = 'var(--palette-new-blue-500)';
                fallbackElement.style.color = 'var(--palette-new-blue-500)';
            } else if (variant === 'indigo') {
                fallbackElement.style.borderColor = 'var(--palette-new-indigo-500)';
                fallbackElement.style.color = 'var(--palette-new-indigo-500)';
            } else if (variant === 'purple') {
                fallbackElement.style.borderColor = 'var(--palette-new-purple-500)';
                fallbackElement.style.color = 'var(--palette-new-purple-500)';
            } else if (variant === 'fushia') {
                fallbackElement.style.borderColor = 'var(--palette-new-fushia-500)';
                fallbackElement.style.color = 'var(--palette-new-fushia-500)';
            } else if (variant === 'magenta') {
                fallbackElement.style.borderColor = 'var(--palette-new-magenta-500)';
                fallbackElement.style.color = 'var(--palette-new-magenta-500)';
            }
        }
        // Tint 타입 스타일 적용
        else if (type === 'tint') {
            if (variant === 'blue') {
                fallbackElement.style.borderColor = 'var(--palette-new-blue-200)';
                fallbackElement.style.backgroundColor = 'var(--palette-new-blue-200)';
                fallbackElement.style.color = 'var(--palette-new-blue-800)';
            } else if (variant === 'cyan') {
                fallbackElement.style.borderColor = 'var(--palette-new-cyan-200)';
                fallbackElement.style.backgroundColor = 'var(--palette-new-cyan-200)';
                fallbackElement.style.color = 'var(--palette-new-cyan-800)';
            } else if (variant === 'green') {
                fallbackElement.style.borderColor = 'var(--palette-new-green-200)';
                fallbackElement.style.backgroundColor = 'var(--palette-new-green-200)';
                fallbackElement.style.color = 'var(--palette-new-green-800)';
            } else if (variant === 'yellow') {
                fallbackElement.style.borderColor = 'var(--palette-new-yellow-200)';
                fallbackElement.style.backgroundColor = 'var(--palette-new-yellow-200)';
                fallbackElement.style.color = 'var(--palette-new-yellow-800)';
            } else if (variant === 'orange') {
                fallbackElement.style.borderColor = 'var(--palette-new-orange-200)';
                fallbackElement.style.backgroundColor = 'var(--palette-new-orange-200)';
                fallbackElement.style.color = 'var(--palette-new-orange-800)';
            } else if (variant === 'red') {
                fallbackElement.style.borderColor = 'var(--palette-new-red-200)';
                fallbackElement.style.backgroundColor = 'var(--palette-new-red-200)';
                fallbackElement.style.color = 'var(--palette-new-red-800)';
            }
        }
    }

    // Shadow DOM 렌더링
    renderShadowDOM(type, variant, text) {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    height: 22px;
                    padding: var(--spacing-xs) var(--spacing-md);
                    border-radius: var(--radius-xxs);
                    border-width: 1px;
                    border-style: solid;
                    font-family: var(--font-family-pretendard);
                    font-size: var(--font-size-body-s);
                    line-height: var(--lineheight-body-s);
                    font-weight: var(--typography-fontWeight-medium);
                }

                /* Solid 타입 */
                :host([type="solid"][variant="blue"]) {
                    border-color: var(--palette-new-blue-500);
                    background-color: var(--palette-new-blue-500);
                    color: var(--white);
                }
                :host([type="solid"][variant="cyan"]) {
                    border-color: var(--palette-new-cyan-500);
                    background-color: var(--palette-new-cyan-500);
                    color: var(--white);
                }
                :host([type="solid"][variant="green"]) {
                    border-color: var(--palette-new-green-500);
                    background-color: var(--palette-new-green-500);
                    color: var(--white);
                }
                :host([type="solid"][variant="yellow"]) {
                    border-color: var(--palette-new-yellow-500);
                    background-color: var(--palette-new-yellow-500);
                    color: var(--gray-900);
                }
                :host([type="solid"][variant="orange"]) {
                    border-color: var(--palette-new-orange-500);
                    background-color: var(--palette-new-orange-500);
                    color: var(--white);
                }
                :host([type="solid"][variant="red"]) {
                    border-color: var(--palette-new-red-500);
                    background-color: var(--palette-new-red-500);
                    color: var(--white);
                }
                :host([type="solid"][variant="gray"]) {
                    border-color: var(--gray-500);
                    background-color: var(--gray-500);
                    color: var(--white);
                }

                /* Line 타입 */
                :host([type="line"][variant="red"]) {
                    border-color: var(--palette-new-red-500);
                    color: var(--palette-new-red-500);
                }
                :host([type="line"][variant="orange"]) {
                    border-color: var(--palette-new-orange-500);
                    color: var(--palette-new-orange-500);
                }
                :host([type="line"][variant="yellow"]) {
                    border-color: var(--palette-new-yellow-500);
                    color: var(--palette-new-yellow-500);
                }
                :host([type="line"][variant="olive"]) {
                    border-color: var(--palette-new-olive-500);
                    color: var(--palette-new-olive-500);
                }
                :host([type="line"][variant="celery"]) {
                    border-color: var(--palette-new-celery-500);
                    color: var(--palette-new-celery-500);
                }
                :host([type="line"][variant="green"]) {
                    border-color: var(--palette-new-green-500);
                    color: var(--palette-new-green-500);
                }
                :host([type="line"][variant="seaform"]) {
                    border-color: var(--palette-new-seaform-seafoam-500);
                    color: var(--palette-new-seaform-seafoam-500);
                }
                :host([type="line"][variant="cyan"]) {
                    border-color: var(--palette-new-cyan-500);
                    color: var(--palette-new-cyan-500);
                }
                :host([type="line"][variant="gray"]) {
                    border-color: var(--gray-500);
                    color: var(--gray-500);
                }
                :host([type="line"][variant="blue"]) {
                    border-color: var(--palette-new-blue-500);
                    color: var(--palette-new-blue-500);
                }
                :host([type="line"][variant="indigo"]) {
                    border-color: var(--palette-new-indigo-500);
                    color: var(--palette-new-indigo-500);
                }
                :host([type="line"][variant="purple"]) {
                    border-color: var(--palette-new-purple-500);
                    color: var(--palette-new-purple-500);
                }
                :host([type="line"][variant="fushia"]) {
                    border-color: var(--palette-new-fushia-500);
                    color: var(--palette-new-fushia-500);
                }
                :host([type="line"][variant="magenta"]) {
                    border-color: var(--palette-new-magenta-500);
                    color: var(--palette-new-magenta-500);
                }

                /* Tint 타입 */
                :host([type="tint"][variant="blue"]) {
                    border-color: var(--palette-new-blue-200);
                    background-color: var(--palette-new-blue-200);
                    color: var(--palette-new-blue-800);
                }
                :host([type="tint"][variant="cyan"]) {
                    border-color: var(--palette-new-cyan-200);
                    background-color: var(--palette-new-cyan-200);
                    color: var(--palette-new-cyan-800);
                }
                :host([type="tint"][variant="green"]) {
                    border-color: var(--palette-new-green-200);
                    background-color: var(--palette-new-green-200);
                    color: var(--palette-new-green-800);
                }
                :host([type="tint"][variant="yellow"]) {
                    border-color: var(--palette-new-yellow-200);
                    background-color: var(--palette-new-yellow-200);
                    color: var(--palette-new-yellow-800);
                }
                :host([type="tint"][variant="orange"]) {
                    border-color: var(--palette-new-orange-200);
                    background-color: var(--palette-new-orange-200);
                    color: var(--palette-new-orange-800);
                }
                :host([type="tint"][variant="red"]) {
                    border-color: var(--palette-new-red-200);
                    background-color: var(--palette-new-red-200);
                    color: var(--palette-new-red-800);
                }
            </style>
            <slot>${text}</slot>
        `;
    }
}

// AOS6 대응을 위한 Custom Elements 폴백
if (typeof customElements !== 'undefined') {
    customElements.define('label-component', LabelComponent);
} else {
    // AOS6 이하 폴백: 일반 클래스로 동작
    window.LabelComponent = LabelComponent;
}