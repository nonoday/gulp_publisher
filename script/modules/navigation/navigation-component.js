class NavigationComponent extends HTMLElement {
    constructor() {
        super();
        // AOS6 폴백: Shadow DOM 지원 여부 확인
        if (typeof this.attachShadow === 'function') {
            this.shadowRoot = this.attachShadow({ mode: 'open' });
        } else {
            // AOS6 폴백: Shadow DOM이 지원되지 않는 경우 일반 DOM 사용
            this.shadowRoot = this;
        }
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
        // AOS6 폴백: Shadow DOM 지원 여부에 따른 렌더링
        if (this.shadowRoot === this) {
            // Shadow DOM이 지원되지 않는 경우 (AOS6)
            this.innerHTML = `
                <style>
                    navigation-component {
                        display: block;
                        position: fixed;
                        top:0;
                        left:0;
                        right:0;
                        height:56px;
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
                    
                    /* AOS6 폴백: 슬롯 대신 직접 스타일링 */
                    .navigation-header > * {
                        display: flex;
                        align-items: center;
                    }
                    
                    .navigation-function > * {
                        display: flex;
                        align-items: center;
                    }
                </style>
                
                <div class="navigation">
                    <div class="navigation-header">
                        <div class="header-content"></div>
                    </div>
                    
                    <div class="navigation-function">
                        <div class="function-content"></div>
                    </div>
                </div>
            `;
            
            // AOS6 폴백: 슬롯 내용을 직접 이동
            this.moveSlotContent();
        } else {
            // Shadow DOM이 지원되는 경우 (최신 브라우저)
            this.shadowRoot.innerHTML = `
                <style>
                    :host {
                        display: block;
                        position: fixed;
                        top:0;
                        left:0;
                        right:0;
                        height:56px;
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
    
    // AOS6 폴백: 슬롯 내용을 직접 이동하는 메서드
    moveSlotContent() {
        const headerSlot = this.querySelector('[slot="header"]');
        const functionSlot = this.querySelector('[slot="function"]');
        const headerContent = this.querySelector('.header-content');
        const functionContent = this.querySelector('.function-content');
        
        if (headerSlot && headerContent) {
            while (headerSlot.firstChild) {
                headerContent.appendChild(headerSlot.firstChild);
            }
        }
        
        if (functionSlot && functionContent) {
            while (functionSlot.firstChild) {
                functionContent.appendChild(functionSlot.firstChild);
            }
        }
    }
}

// AOS6 폴백: Custom Elements 지원 여부 확인
if (typeof customElements !== 'undefined' && customElements.define) {
    customElements.define('navigation-component', NavigationComponent);
} else {
    // AOS6 폴백: Custom Elements가 지원되지 않는 경우
    // DOMContentLoaded 이벤트 후에 수동으로 컴포넌트 초기화
    document.addEventListener('DOMContentLoaded', function() {
        const navigationElements = document.querySelectorAll('navigation-component');
        navigationElements.forEach(function(element) {
            if (!element.initialized) {
                element.initialized = true;
                // 수동으로 컴포넌트 기능 초기화
                element.style.display = 'block';
                element.style.position = 'fixed';
                element.style.top = '0';
                element.style.left = '0';
                element.style.right = '0';
                element.style.height = '56px';
                
                // 내부 구조 생성
                if (!element.querySelector('.navigation')) {
                    element.innerHTML = `
                        <div class="navigation" style="display: flex; align-items: center; height: 56px; padding: 0 4px 0 8px; background-color: #fff;">
                            <div class="navigation-header" style="display: flex; align-items: center;">
                                <div class="header-content"></div>
                            </div>
                            <div class="navigation-function" style="display: flex; align-items: center; margin-left: auto;">
                                <div class="function-content"></div>
                            </div>
                        </div>
                    `;
                    
                    // 슬롯 내용 이동
                    const headerSlot = element.querySelector('[slot="header"]');
                    const functionSlot = element.querySelector('[slot="function"]');
                    const headerContent = element.querySelector('.header-content');
                    const functionContent = element.querySelector('.function-content');
                    
                    if (headerSlot && headerContent) {
                        while (headerSlot.firstChild) {
                            headerContent.appendChild(headerSlot.firstChild);
                        }
                    }
                    
                    if (functionSlot && functionContent) {
                        while (functionSlot.firstChild) {
                            functionContent.appendChild(functionSlot.firstChild);
                        }
                    }
                }
            }
        });
    });
}
