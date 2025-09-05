// 진행률 단계 아이템 컴포넌트
class HorizontalProgressStepItem extends HTMLElement {
    constructor() {
        super();
        console.log('HorizontalProgressStepItem 생성자 호출됨');
        this.render();
    }

    static get observedAttributes() {
        return ['status', 'step', 'title', 'date'];
    }

    connectedCallback() {
        console.log('HorizontalProgressStepItem connectedCallback 호출됨');
        this.render();
    }

    attributeChangedCallback() {
        console.log('HorizontalProgressStepItem attributeChangedCallback 호출됨');
        this.render();
    }

    render() {
        console.log('HorizontalProgressStepItem render 호출됨');
        const status = this.getAttribute('status') || 'pending';
        const step = this.getAttribute('step') || '';
        const title = this.getAttribute('title') || '';
        const date = this.getAttribute('date') || '';

        console.log('렌더링 데이터:', { status, step, title, date });

        // 기존 CSS 클래스 활용
        this.className = `horizontal-progress-step-item ${status}`;
        
        // number 상태일 때는 aria-label 제거
        const markerAriaLabel = status === 'number' ? '' : `aria-label="${this.getAriaLabel(status, step)}"`;
        const dateAriaLabel = status === 'number' ? '' : `aria-label="${this.getDateAriaLabel(status)}"`;
        
        this.innerHTML = `
            <div class="horizontal-progress-step-item-marker" ${markerAriaLabel}>
                ${this.getMarkerContent(status, step)}
            </div>
            <div class="horizontal-progress-step-item-content">
                <div class="horizontal-progress-step-item-content-title">${title}</div>
                <div class="horizontal-progress-step-item-content-date" ${dateAriaLabel}>${date}</div>
            </div>
        `;
        
        console.log('HorizontalProgressStepItem 렌더링 완료');
    }

    getAriaLabel(status, step) {
        const statusMap = {
            'completed': `${step}단계 완료`,
            'check': `${step}단계 완료`,
            'active': `${step}단계 진행 중`,
            'pending': `${step}단계 대기`,
            'error': `${step}단계 오류`,
            'hold': `${step}단계 중지`
        };
        return statusMap[status] || `${step}단계`;
    }

    getDateAriaLabel(status) {
        if (status === 'number') {
            return '';
        }
        
        const dateMap = {
            'completed': '완료일',
            'check': '완료일',
            'active': '진행일',
            'pending': '예정일',
            'error': '오류일',
            'hold': '중지일'
        };
        return dateMap[status] || '날짜';
    }

    getMarkerContent(status, step) {
        if (status === 'check') {
            // check 상태일 때만 SVG 아이콘 표시
            return `<img src="../../../../images/icon/icon_marker_check.svg" alt="완료" />`;
        } else if (status === 'error') {
            return `<img src="../../../../images/icon/icon_marker_error.svg" alt="오류" />`;
        } else if (status === 'hold') {
            return `<img src="../../../../images/icon/icon_marker_hold.svg" alt="중지" />`;
        } else if (status === 'number') {
            // number 상태일 때는 숫자 표시
            return step;
        } else {
            // completed, active, pending 등은 숫자 또는 빈 값 표시
            return step;
        }
    }
}

// 진행률 단계 컨테이너 컴포넌트
class HorizontalProgressStep extends HTMLElement {
    constructor() {
        super();
        console.log('HorizontalProgressStep 생성자 호출됨');
        this.render();
    }

    static get observedAttributes() {
        return ['size'];
    }

    connectedCallback() {
        console.log('HorizontalProgressStep connectedCallback 호출됨');
        this.render();
    }

    attributeChangedCallback() {
        console.log('HorizontalProgressStep attributeChangedCallback 호출됨');
        this.render();
    }

    render() {
        console.log('HorizontalProgressStep render 호출됨');
        
        const size = this.getAttribute('size') || 'small';
        
        console.log('컨테이너 크기:', size);
        
        // ✅ CSS 클래스와 인라인 스타일 모두 적용
        this.className = `horizontal-progress-step ${size}`;
        
        // ✅ 부모 요소에 기본 스타일 직접 적용
        this.style.cssText = `
            list-style: none;
            position: relative;
            display: flex;
            align-items: flex-start;
            gap: var(--spacing-lg, 16px);
            width: 100%;
            padding: 0;
            margin: 0;
        `;
        
        // 접근성 속성 추가
        this.setAttribute('role', 'list');
        this.setAttribute('aria-label', '진행 단계');
        
        console.log('HorizontalProgressStep 렌더링 완료, className:', this.className);
    }
}

// 커스텀 엘리먼트 등록
customElements.define('horizontal-progress-step', HorizontalProgressStep);
customElements.define('horizontal-progress-step-item', HorizontalProgressStepItem);
