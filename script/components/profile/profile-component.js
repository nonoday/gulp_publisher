class ProfileComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._count = 1;
        this._useButton = false;
        this._edit = false;
        this._alert = null;
        this._dot = false;
        this._editLabel = '편집';
        this._alertLabel = '알림';
        this._dotLabel = '새알림';
    }

    static get observedAttributes() {
        return ['count', 'use-button', 'edit', 'alert', 'dot', 'edit-label', 'alert-label', 'dot-label'];
    }

    connectedCallback() {
        this.render();
        this.setupAccessibility();
        this.setupEventListeners();
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
            case 'count':
                this._count = parseInt(value) || 1;
                break;
            case 'use-button':
                this._useButton = value === 'true' || value === '';
                break;
            case 'edit':
                this._edit = value === 'true' || value === '';
                break;
            case 'alert':
                this._alert = value === 'null' ? null : value;
                break;
            case 'dot':
                this._dot = value === 'true' || value === '';
                break;
            case 'edit-label':
                this._editLabel = value || '편집';
                break;
            case 'alert-label':
                this._alertLabel = value || '알림';
                break;
            case 'dot-label':
                this._dotLabel = value || '새알림';
                break;
        }
    }

    render() {
        const avatarCount = Math.min(this._count || 1, 4);
        const isButton = this._useButton;
        const tagName = isButton ? 'button' : 'div';
        const buttonAttrs = isButton ? 'type="button" tabindex="0"' : '';

        this.shadowRoot.innerHTML = `
            <style>
                :host { display: inline-block; }
                .profile {
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                }
                .profile--button {
                    cursor: pointer;
                }
                .profile__avatars {
                    position: relative;
                }
                .profile__avatars:is(button) {
                    cursor: pointer;
                }
                .profile__avatars-inner {
                    width: 64px;
                    height: 64px;
                    display: grid;
                    gap: 1px;
                    border-radius: 50%;
                    overflow: hidden;
                }
                .profile__avatars-inner[data-count="1"] {
                    grid-template-columns: 1fr;
                    grid-template-rows: 1fr;
                }
                .profile__avatars-inner[data-count="1"] .profile__avatar {
                    align-items: flex-end;
                }
                .profile__avatars-inner[data-count="1"] .profile__avatar .icon {
                    width: 46px;
                    height: 51px;
                    margin-bottom: -2px;
                }
                .profile__avatars-inner[data-count="2"] {
                    grid-template-columns: 1fr 1fr;
                    grid-template-rows: 1fr;
                }
                .profile__avatars-inner[data-count="2"] .profile__avatar .icon {
                    width: 22.76px;
                    height: 25.24px;
                }
                .profile__avatars-inner[data-count="2"] .profile__avatar:first-child {
                    justify-content: flex-end;
                }
                .profile__avatars-inner[data-count="2"] .profile__avatar:first-child .icon {
                    margin-right: 2.79px;
                }
                .profile__avatars-inner[data-count="2"] .profile__avatar:last-child {
                    justify-content: flex-start;
                }
                .profile__avatars-inner[data-count="2"] .profile__avatar:last-child .icon {
                    margin-left: 2.79px;
                }
                .profile__avatars-inner[data-count="3"] {
                    grid-template-columns: 1fr 1fr;
                    grid-template-rows: 1fr 1fr;
                }
                .profile__avatars-inner[data-count="3"] .profile__avatar .icon {
                    width: 17.01px;
                    height: 18.86px;
                }
                .profile__avatars-inner[data-count="3"] .profile__avatar:first-child {
                    justify-content: flex-end;
                    grid-column: 1;
                    grid-row: 1 / 3;
                }
                .profile__avatars-inner[data-count="3"] .profile__avatar:first-child .icon {
                    width: 22.76px;
                    height: 25.24px;
                    margin-right: 1.74px;
                }
                .profile__avatars-inner[data-count="3"] .profile__avatar:nth-child(2) {
                    justify-content: flex-start;
                    align-items: flex-end;
                }
                .profile__avatars-inner[data-count="3"] .profile__avatar:nth-child(2) .icon {
                    margin-left: 4.5px;
                    margin-bottom: 4.14px;
                }
                .profile__avatars-inner[data-count="3"] .profile__avatar:last-child {
                    justify-content: flex-start;
                    align-items: flex-start;
                }
                .profile__avatars-inner[data-count="3"] .profile__avatar:last-child .icon {
                    margin-left: 4.5px;
                    margin-top: 3.88px;
                }
                .profile__avatars-inner[data-count="4"] {
                    grid-template-columns: 1fr 1fr;
                    grid-template-rows: 1fr 1fr;
                }
                .profile__avatars-inner[data-count="4"] .profile__avatar .icon {
                    width: 17.01px;
                    height: 18.86px;
                }
                .profile__avatars-inner[data-count="4"] .profile__avatar:nth-child(1),
                .profile__avatars-inner[data-count="4"] .profile__avatar:nth-child(2) {
                    align-items: flex-end;
                }
                .profile__avatars-inner[data-count="4"] .profile__avatar:nth-child(1) .icon,
                .profile__avatars-inner[data-count="4"] .profile__avatar:nth-child(2) .icon {
                    margin-bottom: 4.14px;
                }
                .profile__avatars-inner[data-count="4"] .profile__avatar:nth-child(3),
                .profile__avatars-inner[data-count="4"] .profile__avatar:nth-child(4) {
                    align-items: flex-start;
                }
                .profile__avatars-inner[data-count="4"] .profile__avatar:nth-child(3) .icon,
                .profile__avatars-inner[data-count="4"] .profile__avatar:nth-child(4) .icon {
                    margin-top: 3.88px;
                }
                .profile__avatars-inner[data-count="4"] .profile__avatar:nth-child(1),
                .profile__avatars-inner[data-count="4"] .profile__avatar:nth-child(3) {
                    justify-content: flex-end;
                }
                .profile__avatars-inner[data-count="4"] .profile__avatar:nth-child(1) .icon,
                .profile__avatars-inner[data-count="4"] .profile__avatar:nth-child(3) .icon {
                    margin-right: 4.49px;
                }
                .profile__avatars-inner[data-count="4"] .profile__avatar:nth-child(2),
                .profile__avatars-inner[data-count="4"] .profile__avatar:nth-child(4) {
                    justify-content: flex-start;
                }
                .profile__avatars-inner[data-count="4"] .profile__avatar:nth-child(2) .icon,
                .profile__avatars-inner[data-count="4"] .profile__avatar:nth-child(4) .icon {
                    margin-left: 4.5px;
                }
                .profile__avatar {
                    background: #e5e7eb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .profile__avatar .icon {
                    display: block;
                    max-width: 46px;
                    max-height: 51px;
                }
                .profile__edit {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    width: 24px;
                    height: 24px;
                    background: #ffffff;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid #e5e7eb;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .profile__edit:hover {
                    background: #f9fafb;
                    border-color: #d1d5db;
                }
                .profile__edit:focus-visible {
                    outline: 2px solid #3b82f6;
                    outline-offset: 2px;
                }
                .profile__alert {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 24px;
                    height: 24px;
                    background: #374151;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 500;
                    color: #ffffff;
                    line-height: 1;
                }
                .profile__dot {
                    position: absolute;
                    right: 2px;
                    top: 2px;
                    width: 8px;
                    height: 8px;
                    background: #ef4444;
                    border-radius: 50%;
                    border: 2px solid #ffffff;
                }
                .profile__avatars:focus-visible {
                    outline: 2px solid #3b82f6;
                    outline-offset: 2px;
                    border-radius: 50%;
                }
                @media (prefers-contrast: high) {
                    .profile__edit {
                        border: 2px solid currentColor !important;
                    }
                    .profile__alert {
                        border: 2px solid currentColor !important;
                    }
                }
                @media (prefers-reduced-motion: reduce) {
                    .profile__edit {
                        transition: none;
                    }
                }
            </style>
            
            <div class="profile ${this._useButton ? 'profile--button' : ''}">
                <${tagName}
                    class="profile__avatars"
                    ${buttonAttrs}
                    ${this.getAccessibilityAttributes()}
                >
                    <div
                        class="profile__avatars-inner"
                        data-count="${avatarCount}"
                        role="img"
                        aria-label="${!this._count || this._count <= 1 ? '아바타' : `아바타(${this._count}명 참여중)`}"
                    >
                        ${this.renderAvatars(avatarCount)}
                    </div>

                    ${this._alert ? `
                        <div class="profile__alert" aria-label="${this._alertLabel} ${this._alert}건">
                            ${this._alert}
                        </div>
                    ` : ''}

                    ${this._dot ? `
                        <div class="profile__dot" aria-label="${this._dotLabel}"></div>
                    ` : ''}
                </${tagName}>

                ${this._edit ? `
                    <button
                        class="profile__edit"
                        aria-label="${this._editLabel}"
                        type="button"
                        tabindex="0"
                    >
                        ✏️
                    </button>
                ` : ''}
            </div>
        `;
    }

    renderAvatars(count) {
        let avatars = '';
        for (let i = 0; i < count; i++) {
            avatars += `
                <div class="profile__avatar">
                    <span class="icon">👤</span>
                </div>
            `;
        }
        return avatars;
    }

    getAccessibilityAttributes() {
        const attrs = [];
        
        if (this._useButton) {
            attrs.push('role="button"');
        }
        
        return attrs.join(' ');
    }

    setupAccessibility() {
        const avatarsElement = this.shadowRoot.querySelector('.profile__avatars');
        const editButton = this.shadowRoot.querySelector('.profile__edit');
        
        if (avatarsElement && this._useButton) {
            avatarsElement.setAttribute('role', 'button');
            avatarsElement.setAttribute('tabindex', '0');
        }
        
        if (editButton) {
            editButton.setAttribute('aria-label', this._editLabel);
        }
    }

    setupEventListeners() {
        const avatarsElement = this.shadowRoot.querySelector('.profile__avatars');
        const editButton = this.shadowRoot.querySelector('.profile__edit');
        
        if (avatarsElement && this._useButton) {
            avatarsElement.addEventListener('click', (e) => this.handleAvatarsClick(e));
            avatarsElement.addEventListener('keydown', (e) => this.handleAvatarsKeydown(e));
        }
        
        if (editButton) {
            editButton.addEventListener('click', (e) => this.handleEditClick(e));
            editButton.addEventListener('keydown', (e) => this.handleEditKeydown(e));
        }
    }

    handleAvatarsClick(event) {
        if (this._useButton) {
            this.dispatchEvent(new CustomEvent('profile-click', {
                detail: { count: this._count }
            }));
        }
    }

    handleAvatarsKeydown(event) {
        if (this._useButton && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            this.handleAvatarsClick(event);
        }
    }

    handleEditClick(event) {
        this.dispatchEvent(new CustomEvent('profile-edit-click', {
            detail: { count: this._count }
        }));
    }

    handleEditKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.handleEditClick(event);
        }
    }

    // Getters and setters
    get count() { return this._count; }
    set count(value) { this._count = parseInt(value) || 1; this.setAttribute('count', this._count); }
    
    get useButton() { return this._useButton; }
    set useButton(value) { this._useButton = value === 'true' || value === ''; this.setAttribute('use-button', this._useButton); }
    
    get edit() { return this._edit; }
    set edit(value) { this._edit = value === 'true' || value === ''; this.setAttribute('edit', this._edit); }
    
    get alert() { return this._alert; }
    set alert(value) { this._alert = value; this.setAttribute('alert', value); }
    
    get dot() { return this._dot; }
    set dot(value) { this._dot = value === 'true' || value === ''; this.setAttribute('dot', this._dot); }
    
    get editLabel() { return this._editLabel; }
    set editLabel(value) { this._editLabel = value; this.setAttribute('edit-label', value); }
    
    get alertLabel() { return this._alertLabel; }
    set alertLabel(value) { this._alertLabel = value; this.setAttribute('alert-label', value); }
    
    get dotLabel() { return this._dotLabel; }
    set dotLabel(value) { this._dotLabel = value; this.setAttribute('dot-label', value); }
}

customElements.define('profile-component', ProfileComponent);
