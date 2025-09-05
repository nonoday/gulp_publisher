class KeywordChip extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.isPressed = false;
    }

    static get observedAttributes() {
        return ['type', 'color', 'class', 'disabled', 'selected', 'removable'];
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        this.setupAccessibility();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
            if (name === 'disabled' || name === 'selected') {
                this.setupAccessibility();
            }
        }
    }

    setupEventListeners() {
        this.addEventListener('click', this.handleClick.bind(this));
        this.addEventListener('keydown', this.handleKeydown.bind(this));
        this.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        this.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    }

    setupAccessibility() {
        const isDisabled = this.hasAttribute('disabled');
        const isSelected = this.hasAttribute('selected');
        const isRemovable = this.hasAttribute('removable');
        
        this.setAttribute('role', 'button');
        this.setAttribute('tabindex', isDisabled ? '-1' : '0');
        
        if (isDisabled) {
            this.setAttribute('aria-disabled', 'true');
        } else {
            this.removeAttribute('aria-disabled');
        }
        
        if (isSelected) {
            this.setAttribute('aria-pressed', 'true');
        } else {
            this.setAttribute('aria-pressed', 'false');
        }

        if (isRemovable) {
            this.setAttribute('aria-label', `${this.textContent} 삭제 가능한 키워드`);
        }
    }

    handleClick(event) {
        if (this.hasAttribute('disabled')) {
            event.preventDefault();
            return;
        }

        // X 버튼 클릭 확인
        const target = event.target;
        if (target.classList.contains('remove-button') || target.closest('.remove-button')) {
            this.handleRemove();
            return;
        }
        
        this.toggleSelected();
        this.dispatchEvent(new CustomEvent('chip-click', {
            detail: {
                text: this.textContent,
                selected: this.hasAttribute('selected'),
                type: this.getAttribute('type'),
                color: this.getAttribute('color')
            },
            bubbles: true
        }));
    }

    handleRemove() {
        this.dispatchEvent(new CustomEvent('chip-remove', {
            detail: {
                text: this.textContent,
                type: this.getAttribute('type'),
                color: this.getAttribute('color')
            },
            bubbles: true
        }));
        
        // 부모 요소에서 칩 제거
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    }

    handleKeydown(event) {
        if (this.hasAttribute('disabled')) return;
        
        switch (event.key) {
            case 'Enter':
            case ' ':
                event.preventDefault();
                this.handleClick(event);
                break;
            case 'Escape':
                this.blur();
                break;
            case 'Delete':
            case 'Backspace':
                if (this.hasAttribute('removable')) {
                    event.preventDefault();
                    this.handleRemove();
                }
                break;
        }
    }

    handleTouchStart(event) {
        if (this.hasAttribute('disabled')) return;
        this.isPressed = true;
        this.classList.add('touch-pressed');
    }

    handleTouchEnd(event) {
        if (this.hasAttribute('disabled')) return;
        this.isPressed = false;
        this.classList.remove('touch-pressed');
    }

    toggleSelected() {
        if (this.hasAttribute('selected')) {
            this.removeAttribute('selected');
        } else {
            this.setAttribute('selected', '');
        }
    }

    render() {
        const type = this.getAttribute('type') || 'tonal';
        const color = this.getAttribute('color') || 'gray';
        const customClass = this.getAttribute('class') || '';
        const isDisabled = this.hasAttribute('disabled');
        const isSelected = this.hasAttribute('selected');
        const isRemovable = this.hasAttribute('removable');

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                }

                .keyword-chip {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 44px;
                    min-width: 44px;
                    padding: 12px 20px;
                    border-radius: 22px;
                    font-size: 16px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    user-select: none;
                    position: relative;
                    outline: none;
                    -webkit-tap-highlight-color: transparent;
                }

                /* 모바일 최적화 */
                @media (max-width: 768px) {
                    .keyword-chip {
                        min-height: 48px;
                        min-width: 48px;
                        padding: 14px 24px;
                        font-size: 15px;
                        border-radius: 24px;
                    }
                }

                /* 작은 화면 최적화 */
                @media (max-width: 480px) {
                    .keyword-chip {
                        min-height: 52px;
                        min-width: 52px;
                        padding: 16px 28px;
                        font-size: 16px;
                        border-radius: 26px;
                    }
                }

                .keyword-chip-label-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    width: 100%;
                }

                .keyword-chip-label {
                    white-space: nowrap;
                    text-align: center;
                }

                /* Remove button styles */
                .remove-button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background-color: rgba(0, 0, 0, 0.1);
                    border: none;
                    cursor: pointer;
                    margin-left: 8px;
                    transition: all 0.2s ease;
                    flex-shrink: 0;
                }

                .remove-button:hover {
                    background-color: rgba(0, 0, 0, 0.2);
                    transform: scale(1.1);
                }

                .remove-button:active {
                    transform: scale(0.95);
                }

                .remove-button::before,
                .remove-button::after {
                    content: '';
                    position: absolute;
                    width: 10px;
                    height: 2px;
                    background-color: currentColor;
                    border-radius: 1px;
                }

                .remove-button::before {
                    transform: rotate(45deg);
                }

                .remove-button::after {
                    transform: rotate(-45deg);
                }

                /* 모바일에서 remove 버튼 크기 조정 */
                @media (max-width: 768px) {
                    .remove-button {
                        width: 24px;
                        height: 24px;
                    }
                    
                    .remove-button::before,
                    .remove-button::after {
                        width: 12px;
                        height: 2px;
                    }
                }

                @media (max-width: 480px) {
                    .remove-button {
                        width: 28px;
                        height: 28px;
                    }
                    
                    .remove-button::before,
                    .remove-button::after {
                        width: 14px;
                        height: 2px;
                    }
                }

                /* Type styles */
                .keyword-chip.type-tonal {
                    background-color: var(--tonal-bg);
                    color: var(--tonal-text);
                    border: none;
                }

                .keyword-chip.type-line {
                    background-color: transparent;
                    color: var(--line-text);
                    border: 2px solid var(--line-border);
                }

                /* Color styles */
                .keyword-chip.color-gray {
                    --tonal-bg: #f5f5f5;
                    --tonal-text: #666666;
                    --line-text: #666666;
                    --line-border: #e0e0e0;
                }

                .keyword-chip.color-blue {
                    --tonal-bg: #e3f2fd;
                    --tonal-text: #1976d2;
                    --line-text: #1976d2;
                    --line-border: #2196f3;
                }

                .keyword-chip.color-red {
                    --tonal-bg: #ffebee;
                    --tonal-text: #d32f2f;
                    --line-text: #d32f2f;
                    --line-border: #f44336;
                }

                /* Selected state */
                .keyword-chip[selected] {
                    background-color: var(--selected-bg, #1976d2);
                    color: var(--selected-text, white);
                    border-color: var(--selected-bg, #1976d2);
                }

                .keyword-chip[selected].color-gray {
                    --selected-bg: #666666;
                    --selected-text: white;
                }

                .keyword-chip[selected].color-blue {
                    --selected-bg: #1565c0;
                    --selected-text: white;
                }

                .keyword-chip[selected].color-red {
                    --selected-bg: #c62828;
                    --selected-text: white;
                }

                /* Disabled state */
                .keyword-chip[disabled] {
                    opacity: 0.5;
                    cursor: not-allowed;
                    pointer-events: none;
                }

                /* Focus state */
                .keyword-chip:focus-visible {
                    outline: 2px solid #1976d2;
                    outline-offset: 2px;
                }

                /* Hover effects (데스크톱에서만) */
                @media (hover: hover) {
                    .keyword-chip:hover:not([disabled]) {
                        transform: translateY(-1px);
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    }

                    .keyword-chip.type-tonal:hover:not([disabled]) {
                        filter: brightness(0.95);
                    }

                    .keyword-chip.type-line:hover:not([disabled]) {
                        background-color: rgba(0, 0, 0, 0.05);
                    }
                }

                /* Active state */
                .keyword-chip:active:not([disabled]) {
                    transform: translateY(0);
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
                }

                /* Touch pressed state */
                .keyword-chip.touch-pressed {
                    transform: scale(0.98);
                    transition: transform 0.1s ease;
                }

                /* Ripple effect for mobile */
                .keyword-chip::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.3);
                    transform: translate(-50%, -50%);
                    transition: width 0.3s, height 0.3s;
                }

                .keyword-chip:active::before {
                    width: 100px;
                    height: 100px;
                }
            </style>
            <div class="keyword-chip type-${type} color-${color} ${customClass}" 
                 ${isDisabled ? 'disabled' : ''} 
                 ${isSelected ? 'selected' : ''}>
                <div class="keyword-chip-label-container">
                    <span class="keyword-chip-label">
                        <slot></slot>
                    </span>
                    ${isRemovable ? '<button class="remove-button" aria-label="삭제" title="삭제"></button>' : ''}
                </div>
            </div>
        `;
    }
}

// 웹컴포넌트 등록
customElements.define('keyword-chip', KeywordChip); 