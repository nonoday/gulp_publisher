# Solid2.0 Gulp Build System


## 📋 주요 기능

- **SCSS 컴파일**: SCSS 파일을 CSS로 변환
- **CSS 미니파이**: CSS 파일을 압축하여 최적화
- **토큰 관리**: 디자인 토큰을 CSS 변수로 변환
- **파일 정리**: 매칭되지 않는 CSS 파일 자동 삭제
- **실시간 감시**: 파일 변경 시 자동 빌드

## 🚀 설치

```bash
npm install
```

## 📖 사용법

### 기본 명령어

```bash
# 전체 빌드 실행
npx gulp

# 또는
npx gulp default
```

### 개별 작업 실행

```bash
# 토큰을 CSS로 변환
npx gulp tokens

# SCSS 파일을 solid2 CSS 폴더로 컴파일
npx gulp scssToSolid2


# CSS 파일과 _variables.scss 매칭 체크
npx gulp checkCss

# 토큰 CSS 파일들을 하나로 합치기
npx gulp combineTokens

# 매칭되지 않는 CSS 파일 정리
npx gulp cleanCSS

# 파일 변경 감시 모드
npx gulp watch
```

## 📁 프로젝트 구조

```
images/web/
├── scss/                    # SCSS 소스 파일
│   ├── all.scss
│   ├── component.scss
│   ├── demo.scss
│   └── test.scss
├── css/solid2/             # 컴파일된 CSS 파일
│   ├── minify/             # 미니파이된 CSS 파일
│   └── *.css
├── tokens/                 # 디자인 토큰
│    ├── css/                # 토큰 CSS 파일
│    └── scss/               # SCSS 변수 파일
└── img/                     # 이미지 파일
    └── solid2/              # 솔리드2.0 이미지 파일
        └── icons/           # 아이콘 폴더
  
html/solid2/page/           # 페이지별 폴더 구조
├── notification/           # 알림함
├── mypage/                # 마이페이지
├── common/                # 공통
├── inquiry-management/    # 조회/관리
├── utilities/             # 공과금
├── products/              # 상품
├── foreign-exchange/      # 외환
├── mydata/                # 마이데이터
├── lifestyle/             # 생활편의
└── benefits/              # 혜택
```

## 🔧 작업 설명

### 1. `tokens`
- 디자인 토큰을 CSS로 변환하는 작업
- 현재는 빈 함수로 구현되어 있음

### 2. `scssToSolid2`
- SCSS 파일들을 `./images/web/css/solid2/` 폴더로 컴파일
- 자동으로 미니파이 버전도 생성
- 폴더가 없으면 자동 생성


### 3. `checkCss`
- `common.css`와 `normal-typo.css`의 CSS 변수를 체크
- `_variables.scss` 파일에 새로운 변수 자동 추가

### 4. `combineTokens`
- 토큰 CSS 파일들을 하나의 `tokens.css` 파일로 합치기
- 다음 파일들을 순서대로 합침:
  - common.css
  - light-theme.css
  - dark-theme.css
  - normal-typo.css
  - large-typo.css

### 6. `cleanCSS`
- SCSS 파일과 매칭되지 않는 CSS 파일들을 자동 삭제
- 해당하는 minified 파일도 함께 삭제
- 불필요한 파일 정리로 프로젝트 깔끔하게 유지

### 7. `watch`
- 파일 변경을 실시간으로 감시
- 변경 시 자동으로 해당 작업 실행
- 개발 중 지속적으로 사용

## 🎯 개발 워크플로우

1. **개발 시작**: `npx gulp watch` 실행
2. **SCSS 수정**: `images/web/scss/` 폴더의 파일 수정
3. **자동 빌드**: 변경사항이 자동으로 CSS로 컴파일됨
4. **정리**: `npx gulp cleanCSS`로 불필요한 파일 정리

## ⚠️ 주의사항

- SCSS 파일명은 `_`로 시작하지 않는 파일만 컴파일됩니다
- `tokens.css` 파일은 `cleanCSS` 작업에서 삭제되지 않습니다
- 폴더가 없으면 자동으로 생성되므로 수동으로 만들 필요가 없습니다

## 📝 Git 관리

### .gitignore 설정
- `node_modules/` 폴더는 Git에 추가되지 않습니다
- `.gitignore` 파일에 필요한 제외 항목들이 설정되어 있습니다

