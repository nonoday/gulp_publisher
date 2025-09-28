# Input Field Animated Border Script

여러 곳에서 사용할 수 있는 input-field 포커스 애니메이션 스크립트입니다.

## 🎯 기능

- **포커스 애니메이션**: input에 포커스 시 왼쪽 위에서 시작해서 한 바퀴 돌며 border가 채워지는 애니메이션
- **상태 구분**: 포커스/에러/비활성화 상태에 따른 다른 색상 적용
- **유연한 설정**: border-radius, 색상, 두께, 애니메이션 지속시간 등 커스터마이징 가능
- **자동 감지**: 동적으로 추가된 input-field도 자동으로 감지하여 애니메이션 적용
- **비활성화 처리**: disabled 상태일 때는 애니메이션 실행하지 않음

## 🚀 사용법

### 기본 사용법

```html
<!-- 스크립트 포함 -->
<script src="input-field-animation.js"></script>

<!-- input-field HTML 구조 -->
<div class="input-field">
    <input type="text" placeholder="입력하세요">
</div>
```

스크립트를 포함하면 자동으로 모든 input-field에 애니메이션이 적용됩니다.

### 옵션 설정

```javascript
// 기본 옵션으로 초기화
const animatedBorder = new AnimatedBorderInputField();

// 커스텀 옵션으로 초기화
const animatedBorder = new AnimatedBorderInputField({
    borderColor: '#005DF9',           // 기본 border 색상
    errorColor: '#E53838',            // 에러 상태 border 색상
    borderWidth: 2,                   // border 두께 (px)
    animationDuration: 1000,          // 애니메이션 지속 시간 (ms)
    borderRadius: 6,                  // 기본 border-radius (px)
    disabledClass: 'disabled',        // 비활성화 클래스
    errorClass: 'error',              // 에러 클래스
    containerSelector: '.input-field', // 컨테이너 셀렉터
    inputSelector: 'input'            // input 태그 셀렉터
});
```

### 옵션 업데이트

```javascript
// 런타임에 옵션 변경
animatedBorder.updateOptions({
    animationDuration: 1500,
    borderWidth: 3,
    borderColor: '#00FF00'
});
```

### 수동 제어

```javascript
// 모든 애니메이션 정리
animatedBorder.cleanup();

// 특정 컨테이너의 애니메이션 강제 중지
animatedBorder.forceStopAnimation(containerElement);
```

## 🎨 CSS 클래스 지원

### 상태 클래스

- `.disabled`: 비활성화 상태 (애니메이션 실행 안함)
- `.error`: 에러 상태 (빨간색 애니메이션)

## 📋 HTML 구조 요구사항

스크립트가 정상 작동하려면 다음 HTML 구조가 필요합니다:

```html
<div class="input-field [state-class]">
    <input type="text" placeholder="입력하세요">
    <!-- 추가 input들... -->
</div>
```

## 🔧 커스터마이징

### Border Radius 자동 감지

스크립트는 컨테이너의 `border-radius` CSS 속성을 자동으로 감지하여 애니메이션에 적용합니다.

```css
.custom-border-radius .input-field {
    border-radius: 20px; /* 자동으로 감지됨 */
}
```

### 색상 커스터마이징

```javascript
// 브랜드 색상으로 변경
const animatedBorder = new AnimatedBorderInputField({
    borderColor: '#FF6B35',    // 브랜드 오렌지
    errorColor: '#FF1744'      // 브랜드 레드
});
```

### 애니메이션 속도 조절

```javascript
// 빠른 애니메이션
const fastAnimation = new AnimatedBorderInputField({
    animationDuration: 500
});

// 느린 애니메이션
const slowAnimation = new AnimatedBorderInputField({
    animationDuration: 2000
});
```

## 🌟 특징

### 자동 감지
- DOM에 동적으로 추가된 input-field도 자동으로 감지
- MutationObserver를 사용하여 실시간 감지

### 성능 최적화
- SVG 기반 애니메이션으로 부드러운 성능
- 불필요한 애니메이션 중복 실행 방지
- 메모리 누수 방지를 위한 정리 기능

### 접근성 고려
- `prefers-reduced-motion` 미디어 쿼리 지원 가능
- 키보드 네비게이션과 호환
- 스크린 리더와 호환

## 📱 반응형 지원

스크립트는 반응형 레이아웃을 완전히 지원합니다:

- 컨테이너 크기 변경 시 자동으로 애니메이션 경로 조정
- 모바일/태블릿/데스크톱 모든 환경에서 동일하게 작동
- 터치 디바이스에서도 정상 작동

## 🐛 문제 해결

### 애니메이션이 실행되지 않는 경우

1. HTML 구조가 올바른지 확인
2. CSS 클래스명이 일치하는지 확인
3. 비활성화 상태가 아닌지 확인
4. 브라우저 개발자 도구에서 오류 메시지 확인

### 애니메이션이 중복 실행되는 경우

```javascript
// 기존 인스턴스 정리 후 새로 생성
if (window.animatedBorderInputField) {
    window.animatedBorderInputField.cleanup();
}
window.animatedBorderInputField = new AnimatedBorderInputField();
```

### 커스텀 셀렉터 사용

```javascript
// 다른 클래스명 사용 시
const animatedBorder = new AnimatedBorderInputField({
    containerSelector: '.my-custom-container',
    inputSelector: 'input.my-custom-input', // 태그와 클래스 조합
    disabledClass: 'my-disabled-class',
    errorClass: 'my-error-class'
});
```

## 📄 라이선스

이 스크립트는 프로젝트 내에서 자유롭게 사용할 수 있습니다.

## 🤝 기여

버그 리포트나 기능 제안은 언제든 환영합니다!
