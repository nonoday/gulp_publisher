class NavigationComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    static get observedAttributes() {
        return ['alarm-class'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'alarm-class' && oldValue !== newValue) {
            this.updateAlarmClass(newValue);
        }
    }

    updateAlarmClass(className) {
        const alarmButton = this.querySelector('button[aria-label="알림"]');
        if (alarmButton) {
            // 기존 클래스 제거
            alarmButton.classList.remove('alarm');
            // 새로운 클래스 추가
            if (className) {
                alarmButton.classList.add(className);
            }
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
                
                .navigation {
                    display: flex;
                    align-items: center;
                    height: 56px;
                    padding: 0 4px 0 8px;
                    background-color: #fff;
                }
                
                .navigation-header {
                    display: flex;
                    align-items: center;
                }
                
                .navigation-function {
                    display: flex;
                    align-items: center;
                    margin-left: auto;
                }
                
                /* 슬롯 스타일 - 더 구체적인 선택자 사용 */
                ::slotted([slot="header"]) {
                    display: flex;
                    align-items: center;
                }
                
                ::slotted([slot="function"]) {
                    display: flex;
                    align-items: center;
                }
                
            </style>
            
            <div class="navigation">
                <div class="navigation-header">
                    <slot name="header"></slot>
                </div>
                
                <div class="navigation-function">
                    <slot name="function"></slot>
                </div>
            </div>
        `;
    }
}

customElements.define('navigation-component', NavigationComponent);
