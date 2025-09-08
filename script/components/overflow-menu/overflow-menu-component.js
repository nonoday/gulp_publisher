class OverflowMenuComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._placement = 'bottom-right';
        this._maxWidth = false;
        this._visible = false;
        this._triggerElement = null;
        this._menuItems = [];
        this._triggerClickHandler = null;
        this._onDocumentClick = this.handleDocumentClick.bind(this);
        this._onDocumentKeydown = this.handleDocumentKeydown.bind(this);
    }

    static get observedAttributes() {
        return ['placement', 'max-width', 'visible'];
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        this.setupAccessibility();
    }

    disconnectedCallback() {
        this.removeEventListeners();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.updateAttribute(name, newValue);
            this.render();
        }
    }

    updateAttribute(name, value) {
        switch (name) {
            case 'placement':
                this._placement = value || 'bottom-right';
                break;
            case 'max-width':
                this._maxWidth = value === 'true' || value === '';
                break;
            case 'visible':
                this._visible = value === 'true' || value === '';
                break;
        }
    }

    render() {
        const placementClass = `overflow-menu--${this._placement}`;
        const maxWidthClass = this._maxWidth ? 'overflow-menu--max-width' : '';
        const displayStyle = this._visible ? 'block' : 'none';

        this.shadowRoot.innerHTML = `
            <style>
                :host { 
                    display: inline-block; 
                    position: relative;
                }
                
                /* CSS Variables */
                :host {
                    --spacing-xs: 2px;
                    --spacing-sm: 4px;
                    --spacing-md: 8px;
                    --spacing-lg: 12px;
                    --spacing-xl: 16px;
                    --spacing-2xl: 20px;
                    --spacing-3xl: 24px;
                    --spacing-4xl: 32px;
                    --spacing-5xl: 40px;
                    --spacing-6xl: 48px;
                    --spacing-7xl: 80px;
                    --radius-xs: 8px;
                    --radius-sm: 10px;
                    --radius-md: 12px;
                    --radius-lg: 14px;
                    --radius-xl: 16px;
                    --radius-2xl: 24px;
                    --radius-full: 9999px;
                    --bg-canvas-white-elevated: #ffffff;
                    --ease: cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .overflow-menu {
                    background: var(--bg-canvas-white-elevated);
                    border-radius: var(--radius-xl);
                    box-shadow: 0px 4px 16px 0px rgba(12, 17, 29, 0.1);
                    min-width: 128px;
                    max-width: 250px;
                    overflow: hidden;
                    position: fixed;
                    z-index: 1000;
                }

                .overflow-menu__content {
                    padding: var(--spacing-sm) 0;
                    display: flex;
                    flex-direction: column;
                }

                .overflow-menu__item {
                    white-space: nowrap;
                    padding: 8px 16px;
                    cursor: pointer;
                    font-size: 14px;
                    color: #333;
                    border: none;
                    background: none;
                    text-align: left;
                    width: 100%;
                    transition: background-color 0.15s ease;
                    display: flex;
                    align-items: center;
                }

                .overflow-menu__item:hover {
                    background-color: #f8f9fa;
                }

                .overflow-menu__item:active {
                    background-color: #e9ecef;
                }

                .overflow-menu__item--danger {
                    color: #dc3545;
                }

                .overflow-menu__item--danger:hover {
                    background-color: #f8d7da;
                }

                .overflow-menu__item--disabled {
                    color: #6c757d;
                    cursor: not-allowed;
                }

                .overflow-menu__item--disabled:hover {
                    background-color: transparent;
                }

                .overflow-menu__divider {
                    height: 1px;
                    background-color: #e9ecef;
                    margin: 4px 0;
                }

                .overflow-menu__item-icon {
                    width: 16px;
                    height: 16px;
                    margin-right: 8px;
                    vertical-align: middle;
                }

                /* Placement variants */
                .overflow-menu--top-left {
                    transform-origin: bottom left;
                }

                .overflow-menu--top-center {
                    transform-origin: bottom center;
                }

                .overflow-menu--top-right {
                    transform-origin: bottom right;
                }

                .overflow-menu--bottom-left {
                    transform-origin: top left;
                }

                .overflow-menu--bottom-center {
                    transform-origin: top center;
                }

                .overflow-menu--bottom-right {
                    transform-origin: top right;
                }

                .overflow-menu--left-top {
                    transform-origin: right top;
                }

                .overflow-menu--left-middle {
                    transform-origin: right center;
                }

                .overflow-menu--left-bottom {
                    transform-origin: right bottom;
                }

                .overflow-menu--right-top {
                    transform-origin: left top;
                }

                .overflow-menu--right-middle {
                    transform-origin: left center;
                }

                .overflow-menu--right-bottom {
                    transform-origin: left bottom;
                }

                .overflow-menu--max-width .overflow-menu__item {
                    white-space: normal;
                    word-break: break-all;
                }

                /* Transition animations */
                .overflow-menu-enter-active,
                .overflow-menu-leave-active {
                    transition: all 0.15s ease;
                }

                .overflow-menu-enter-from {
                    opacity: 0;
                    transform: translateY(-4px) scale(0.98);
                }

                .overflow-menu-leave-to {
                    opacity: 0;
                    transform: translateY(-4px) scale(0.98);
                }

                /* Responsive adjustments */
                @media (max-width: 768px) {
                    .overflow-menu {
                        max-width: 200px;
                        min-width: 100px;
                    }
                }
            </style>
            
            <div class="overflow-menu ${placementClass} ${maxWidthClass}" style="display: ${displayStyle};">
                <div class="overflow-menu__content">
                    ${this.renderMenuItems()}
                </div>
            </div>
        `;
    }

    renderMenuItems() {
        if (this._menuItems.length === 0) {
            // 기본 메뉴 아이템들
            return `
                <button class="overflow-menu__item">
                    <span class="overflow-menu__item-icon">📝</span>
                    편집
                </button>
                <button class="overflow-menu__item">
                    <span class="overflow-menu__item-icon">📋</span>
                    복사
                </button>
                <button class="overflow-menu__item">
                    <span class="overflow-menu__item-icon">🔗</span>
                    링크 공유
                </button>
                <div class="overflow-menu__divider"></div>
                <button class="overflow-menu__item overflow-menu__item--danger">
                    <span class="overflow-menu__item-icon">🗑️</span>
                    삭제
                </button>
            `;
        }

        return this._menuItems.map(item => {
            if (item.type === 'divider') {
                return '<div class="overflow-menu__divider"></div>';
            }
            
            const iconHtml = item.icon ? `<span class="overflow-menu__item-icon">${item.icon}</span>` : '';
            const classes = ['overflow-menu__item'];
            
            if (item.danger) classes.push('overflow-menu__item--danger');
            if (item.disabled) classes.push('overflow-menu__item--disabled');
            
            return `
                <button class="${classes.join(' ')}" ${item.disabled ? 'disabled' : ''}>
                    ${iconHtml}
                    ${item.text}
                </button>
            `;
        }).join('');
    }

    setupEventListeners() {
        // 메뉴 아이템 클릭 이벤트
        this.shadowRoot.addEventListener('click', (e) => {
            if (e.target.classList.contains('overflow-menu__item') && !e.target.disabled) {
                const text = e.target.textContent.trim();
                this.dispatchEvent(new CustomEvent('menu-item-click', {
                    detail: { text, element: e.target }
                }));
                this.hide();
            }
        });

        // 외부 클릭으로 메뉴 닫기
        document.addEventListener('click', this._onDocumentClick);
        
        // ESC 키로 메뉴 닫기
        document.addEventListener('keydown', this._onDocumentKeydown);
    }

    removeEventListeners() {
        document.removeEventListener('click', this._onDocumentClick);
        document.removeEventListener('keydown', this._onDocumentKeydown);
    }

    handleDocumentClick(event) {
        if (!this.contains(event.target) && !this._triggerElement?.contains(event.target)) {
            this.hide();
        }
    }

    handleDocumentKeydown(event) {
        if (event.key === 'Escape') {
            this.hide();
        }
    }

    setupAccessibility() {
        const menu = this.shadowRoot.querySelector('.overflow-menu');
        if (menu) {
            menu.setAttribute('role', 'menu');
            menu.setAttribute('aria-hidden', !this._visible);
        }
    }

    show() {
        this._visible = true;
        this.setAttribute('visible', 'true');
        this.updatePosition();
        this.render();
    }

    hide() {
        this._visible = false;
        this.setAttribute('visible', 'false');
        this.render();
    }

    toggle() {
        console.log('OverflowMenu toggle 호출됨, 현재 visible:', this._visible);
        if (this._visible) {
            this.hide();
        } else {
            this.show();
        }
    }

    updatePosition() {
        if (!this._triggerElement) return;

        const menu = this.shadowRoot.querySelector('.overflow-menu');
        if (!menu) return;

        const triggerRect = this._triggerElement.getBoundingClientRect();
        
        let top, left, right, bottom, transform = '';

        switch (this._placement) {
            case 'top-left':
                bottom = window.innerHeight - triggerRect.top + 4;
                left = triggerRect.left;
                break;
            case 'top-center':
                bottom = window.innerHeight - triggerRect.top + 4;
                left = triggerRect.left + triggerRect.width / 2;
                transform = 'translateX(-50%)';
                break;
            case 'top-right':
                bottom = window.innerHeight - triggerRect.top + 4;
                right = window.innerWidth - triggerRect.right;
                break;
            case 'bottom-left':
                top = triggerRect.bottom + 4;
                left = triggerRect.left;
                break;
            case 'bottom-center':
                top = triggerRect.bottom + 4;
                left = triggerRect.left + triggerRect.width / 2;
                transform = 'translateX(-50%)';
                break;
            case 'bottom-right':
                top = triggerRect.bottom + 4;
                right = window.innerWidth - triggerRect.right;
                break;
            case 'left-top':
                top = triggerRect.top;
                right = window.innerWidth - triggerRect.left + 4;
                break;
            case 'left-middle':
                top = triggerRect.top + triggerRect.height / 2;
                right = window.innerWidth - triggerRect.left + 4;
                transform = 'translateY(-50%)';
                break;
            case 'left-bottom':
                bottom = window.innerHeight - triggerRect.bottom;
                right = window.innerWidth - triggerRect.left + 4;
                break;
            case 'right-top':
                top = triggerRect.top;
                left = triggerRect.right + 4;
                break;
            case 'right-middle':
                top = triggerRect.top + triggerRect.height / 2;
                left = triggerRect.right + 4;
                transform = 'translateY(-50%)';
                break;
            case 'right-bottom':
                bottom = window.innerHeight - triggerRect.bottom;
                left = triggerRect.right + 4;
                break;
        }

        // 위치 설정
        if (top !== undefined) menu.style.top = `${top}px`;
        if (left !== undefined) menu.style.left = `${left}px`;
        if (right !== undefined) menu.style.right = `${right}px`;
        if (bottom !== undefined) menu.style.bottom = `${bottom}px`;
        if (transform) menu.style.transform = transform;
    }

    setTriggerElement(element) {
        console.log('setTriggerElement 호출됨, element:', element);
        
        // 기존 이벤트 리스너 제거
        if (this._triggerElement) {
            this._triggerElement.removeEventListener('click', this._triggerClickHandler);
        }
        
        this._triggerElement = element;
        if (element) {
            this._triggerClickHandler = () => this.toggle();
            element.addEventListener('click', this._triggerClickHandler);
            console.log('트리거 이벤트 리스너 추가됨');
        }
    }

    setMenuItems(items) {
        this._menuItems = items;
        this.render();
    }

    // Getters and setters
    get placement() { return this._placement; }
    set placement(value) { this._placement = value; this.setAttribute('placement', value); }
    
    get maxWidth() { return this._maxWidth; }
    set maxWidth(value) { this._maxWidth = value; this.setAttribute('max-width', value); }
    
    get visible() { return this._visible; }
    set visible(value) { this._visible = value; this.setAttribute('visible', value); }
}

console.log('OverflowMenuComponent 클래스 정의됨');
customElements.define('overflow-menu-component', OverflowMenuComponent);
console.log('OverflowMenuComponent 웹컴포넌트 등록 완료');
