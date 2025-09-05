// Tooltip 웹 컴포넌트 정의
class TooltipComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.isVisible = false;
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    // 정적 속성으로 사용 가능한 위치들 정의
    static get positions() {
        return [
            'top-left', 'top-center', 'top-right',
            'bottom-left', 'bottom-center', 'bottom-right',
            'left-top', 'left-middle', 'left-bottom',
            'right-top', 'right-middle', 'right-bottom'
        ];
    }

    // 속성 변경 감지
    static get observedAttributes() {
        return ['text', 'position'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'text' && oldValue !== newValue) {
            this.updateText(newValue);
        }
        if (name === 'position' && oldValue !== newValue) {
            this.updatePosition(newValue);
        }
    }

    render() {
        const style = document.createElement('style');
        style.textContent = `
            :host {
                display: inline-block;
                position: relative;
                font-family: Arial, sans-serif;
            }
            
            .tooltip-wrapper {
                display: inline-block;
                position: relative;
            }
            
            .tooltip-icon {
                width: 20px;
                height: 20px;
                background: #007bff;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: white;
                font-size: 12px;
                font-weight: bold;
                transition: background-color 0.2s ease;
            }
            
            .tooltip-icon:hover {
                background: #0056b3;
            }
            
            .tooltip-container {
                position: absolute;
                background: #333;
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 14px;
                max-width: 200px;
                word-wrap: break-word;
                z-index: 1000;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s ease;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            
            .tooltip-container::before {
                content: '';
                position: absolute;
                border: 6px solid transparent;
            }
            
            /* 위치별 화살표 스타일 */
            .top-left::before {
                border-top-color: #333;
                top: 100%;
                left: 10px;
            }
            
            .top-center::before {
                border-top-color: #333;
                top: 100%;
                left: 50%;
                transform: translateX(-50%);
            }
            
            .top-right::before {
                border-top-color: #333;
                top: 100%;
                right: 10px;
            }
            
            .bottom-left::before {
                border-bottom-color: #333;
                bottom: 100%;
                left: 10px;
            }
            
            .bottom-center::before {
                border-bottom-color: #333;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
            }
            
            .bottom-right::before {
                border-bottom-color: #333;
                bottom: 100%;
                right: 10px;
            }
            
            .left-top::before {
                border-left-color: #333;
                left: 100%;
                top: 10px;
            }
            
            .left-middle::before {
                border-left-color: #333;
                left: 100%;
                top: 50%;
                transform: translateY(-50%);
            }
            
            .left-bottom::before {
                border-left-color: #333;
                left: 100%;
                bottom: 10px;
            }
            
            .right-top::before {
                border-right-color: #333;
                right: 100%;
                top: 10px;
            }
            
            .right-middle::before {
                border-right-color: #333;
                right: 100%;
                top: 50%;
                transform: translateY(-50%);
            }
            
            .right-bottom::before {
                border-right-color: #333;
                right: 100%;
                bottom: 10px;
            }
            
            /* 위치별 컨테이너 위치 */
            .top-left {
                bottom: calc(100% + 10px);
                left: 0;
            }
            
            .top-center {
                bottom: calc(100% + 10px);
                left: 50%;
                transform: translateX(-50%);
            }
            
            .top-right {
                bottom: calc(100% + 10px);
                right: 0;
            }
            
            .bottom-left {
                top: calc(100% + 10px);
                left: 0;
            }
            
            .bottom-center {
                top: calc(100% + 10px);
                left: 50%;
                transform: translateX(-50%);
            }
            
            .bottom-right {
                top: calc(100% + 10px);
                right: 0;
            }
            
            .left-top {
                right: calc(100% + 10px);
                top: 0;
            }
            
            .left-middle {
                right: calc(100% + 10px);
                top: 50%;
                transform: translateY(-50%);
            }
            
            .left-bottom {
                right: calc(100% + 10px);
                bottom: 0;
            }
            
            .right-top {
                left: calc(100% + 10px);
                top: 0;
            }
            
            .right-middle {
                left: calc(100% + 10px);
                top: 50%;
                transform: translateY(-50%);
            }
            
            .right-bottom {
                left: calc(100% + 10px);
                bottom: 0;
            }
            
            .tooltip-container.show {
                opacity: 1;
                visibility: visible;
            }
            
            .tooltip-content {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .tooltip-text {
                flex: 1;
            }
            
            .tooltip-close-button {
                background: none;
                border: none;
                color: #ccc;
                cursor: pointer;
                padding: 2px;
                font-size: 12px;
                line-height: 1;
                transition: color 0.2s ease;
            }
            
            .tooltip-close-button:hover {
                color: white;
            }
        `;

        const wrapper = document.createElement('div');
        wrapper.className = 'tooltip-wrapper';
        
        const icon = document.createElement('div');
        icon.className = 'tooltip-icon';
        icon.textContent = '?';
        
        const container = document.createElement('div');
        container.className = 'tooltip-container';
        
        const content = document.createElement('div');
        content.className = 'tooltip-content';
        
        const text = document.createElement('span');
        text.className = 'tooltip-text';
        text.textContent = this.getAttribute('text') || '툴팁 텍스트';
        
        const closeButton = document.createElement('button');
        closeButton.className = 'tooltip-close-button';
        closeButton.textContent = '×';
        
        content.appendChild(text);
        content.appendChild(closeButton);
        container.appendChild(content);
        wrapper.appendChild(icon);
        wrapper.appendChild(container);
        
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(wrapper);
        
        // 위치 설정
        this.updatePosition(this.getAttribute('position') || 'top-center');
    }

    setupEventListeners() {
        const icon = this.shadowRoot.querySelector('.tooltip-icon');
        const container = this.shadowRoot.querySelector('.tooltip-container');
        const closeButton = this.shadowRoot.querySelector('.tooltip-close-button');
        
        // 아이콘 클릭 시 툴팁 표시/숨김
        icon.addEventListener('click', () => {
            this.toggleTooltip();
        });
        
        // 닫기 버튼 클릭 시 툴팁 숨김
        closeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.hideTooltip();
        });
        
        // 외부 클릭 시 툴팁 숨김
        document.addEventListener('click', (e) => {
            if (!this.shadowRoot.contains(e.target)) {
                this.hideTooltip();
            }
        });
    }

    toggleTooltip() {
        if (this.isVisible) {
            this.hideTooltip();
        } else {
            this.showTooltip();
        }
    }

    showTooltip() {
        const container = this.shadowRoot.querySelector('.tooltip-container');
        container.classList.add('show');
        this.isVisible = true;
        
        // 커스텀 이벤트 발생
        this.dispatchEvent(new CustomEvent('tooltipShown', {
            detail: { element: this },
            bubbles: true,
            composed: true
        }));
    }

    hideTooltip() {
        const container = this.shadowRoot.querySelector('.tooltip-container');
        container.classList.remove('show');
        this.isVisible = false;
        
        // 커스텀 이벤트 발생
        this.dispatchEvent(new CustomEvent('tooltipHidden', {
            detail: { element: this },
            bubbles: true,
            composed: true
        }));
    }

    updateText(text) {
        const textElement = this.shadowRoot.querySelector('.tooltip-text');
        if (textElement) {
            textElement.textContent = text || '툴팁 텍스트';
        }
    }

    updatePosition(position) {
        if (!TooltipComponent.positions.includes(position)) {
            position = 'top-center'; // 기본값
        }
        
        const container = this.shadowRoot.querySelector('.tooltip-container');
        if (container) {
            // 기존 위치 클래스 제거
            TooltipComponent.positions.forEach(pos => {
                container.classList.remove(pos);
            });
            // 새로운 위치 클래스 추가
            container.classList.add(position);
        }
    }

    // 공개 메서드들
    getText() {
        return this.getAttribute('text');
    }

    setText(text) {
        this.setAttribute('text', text);
    }

    getPosition() {
        return this.getAttribute('position') || 'top-center';
    }

    setPosition(position) {
        this.setAttribute('position', position);
    }

    isTooltipVisible() {
        return this.isVisible;
    }
}

// 웹 컴포넌트 등록
customElements.define('tooltip-component', TooltipComponent);

// 전역 함수들
window.TooltipComponent = TooltipComponent;
window.showAllTooltips = function() {
    const tooltips = document.querySelectorAll('tooltip-component');
    tooltips.forEach(tooltip => tooltip.showTooltip());
};
window.hideAllTooltips = function() {
    const tooltips = document.querySelectorAll('tooltip-component');
    tooltips.forEach(tooltip => tooltip.hideTooltip());
}; 