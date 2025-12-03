// BaseComponent 클래스 정의 (기존 구조와 호환)
class BaseComponent {
    constructor(element) {
        this.element = element;
    }
}

// RadioInput 클래스 정의
class RadioInput extends BaseComponent {
    
    constructor(element) {
        if(element.classList.contains("initiated")) {
            return {};
        }

        super(element);
        
        // 기본 속성 설정 - 체크박스는 checkbox-animation.js에서 처리하므로 제외
        this._inputElement = element.querySelector('input[type="radio"]');
        this._labelElement = element.querySelector('label');
        
        // AnimatedBorder 인스턴스 생성
        this._animatedBorder = new AnimatedBorder({
            borderColor: '#005DF9',
            borderWidth: 2,
            animationDuration: 1000,
            borderRadius: 12
        });
        
        // 초기화 표시
        element.classList.add("initiated");
        
        this._setupEventListeners();
    }

    static get NAME() {
        return "radio-input";
    }
    
    _setupEventListeners() {
        // 체크박스/라디오 변경 이벤트
        if (this._inputElement) {
            this._inputElement.addEventListener('change', () => {
                this._handleChange();
            });
            
            // 라디오 버튼의 경우, 같은 name을 가진 다른 라디오 버튼의 변경도 감지
            if (this._inputElement.type === 'radio' && this._inputElement.name) {
                const radioGroup = document.querySelectorAll(`input[type="radio"][name="${this._inputElement.name}"]`);
                radioGroup.forEach(radio => {
                    radio.addEventListener('change', () => {
                        this._handleRadioGroupChange();
                    });
                });
            }
        }
    }
    
    _handleChange() {
        if (this._inputElement && this._labelElement) {
            if (this._inputElement.checked) {
                // 선택되었을 때 애니메이션 시작
                this._animatedBorder.startAnimation(this._labelElement, {
                    borderColor: '#005DF9',
                    animationDuration: 1000,
                    borderRadius: 12
                });
            } else {
                // 선택 해제되었을 때 애니메이션 중지
                this._animatedBorder.stopAnimation(this._labelElement);
            }
        }
    }
    
    _handleRadioGroupChange() {
        // 라디오 버튼 그룹에서 선택 상태 확인
        if (this._inputElement && this._labelElement) {
            if (this._inputElement.checked) {
                // 선택되었을 때 애니메이션 시작
                this._animatedBorder.startAnimation(this._labelElement, {
                    borderColor: '#005DF9',
                    animationDuration: 1000,
                    borderRadius: 12
                });
            } else {
                // 선택 해제되었을 때 애니메이션 중지
                this._animatedBorder.stopAnimation(this._labelElement);
            }
        }
    }
}

const RadioInputApply = (elements) => {
    let targetElements = null;

    if (typeof elements == "undefined") {
        // 체크박스가 아닌 라디오 버튼만 있는 .select-area만 선택
        const allSelectAreas = document.querySelectorAll(".select-area");
        const radioSelectAreas = [];
        allSelectAreas.forEach(area => {
            const input = area.querySelector('input[type="radio"], input[type="checkbox"]');
            // 라디오 버튼만 있는 경우만 처리 (체크박스는 checkbox-animation.js에서 처리)
            if (input && input.type === 'radio') {
                radioSelectAreas.push(area);
            }
        });
        targetElements = radioSelectAreas;
    } else if (typeof elements === "object" && typeof elements.length === "number") {
        targetElements = elements;
    } else if (typeof elements === "string") {
        targetElements = document.querySelectorAll(elements);
    } else {
        return false;
    }

    Object.values(targetElements).map((element) => {
        new RadioInput(element);
    });
};

window.addEventListener("load", () => {
    RadioInputApply();
})

