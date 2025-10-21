/**
 * SlideInAnimation 모듈
 * 
 * 동작 방식:
 * 1. 페이지 로드 시 자동으로 모든 .slide-in-list[data-slide-delay] 요소를 찾아서 초기화
 * 2. 각 리스트의 data 속성을 읽어서 li 요소들에 개별 딜레이와 애니메이션 설정 적용
 * 3. data-slide-auto="true"인 경우 자동으로 active 클래스 추가하여 애니메이션 실행
 * 4. data-slide-auto="false"인 경우 수동으로 triggerSlide() 함수 호출 필요
 * 
 * 사용법:
 * - 자동 실행: <ul class="slide-in-list" data-slide-auto="true" data-slide-delay="0.1">
 * - 수동 실행: SlideInAnimation.triggerSlide('listId')
 * - 리셋: SlideInAnimation.resetSlide('listId')
 * 
 * 데이터 속성:
 * - data-slide-delay: 각 li의 딜레이 간격 (기본값: 0.1)
 * - data-slide-duration: 애니메이션 지속시간 (기본값: 0.5)
 * - data-slide-timing: 애니메이션 타이밍 함수 (기본값: ease-out)
 * - data-slide-auto: 자동 실행 여부 (true/false)
 * 
 * 개별 li 옵션:
 * - data-slide-delay: 해당 li만의 딜레이
 * - data-slide-duration: 해당 li만의 지속시간
 * - data-slide-timing: 해당 li만의 타이밍 함수
 */
const SlideInAnimation = {
    // 클래스가 있는 리스트에 딜레이 적용
    initSlideInFromData: function(listId) {
        const list = document.getElementById(listId);
        if (!list) return;

        // 클래스가 있는지 확인
        if (!list.classList.contains('slide-in-list')) return;

        const listDelay = parseFloat(list.dataset.slideDelay) || 0.1;
        const listDuration = parseFloat(list.dataset.slideDuration) || 0.5;
        const listTiming = list.dataset.slideTiming || 'ease-out';
        const auto = list.dataset.slideAuto === 'true';

        const listItems = list.querySelectorAll('li');
        listItems.forEach((item, index) => {
            const itemDelay = parseFloat(item.dataset.slideDelay) || (listDelay * (index + 1));
            const itemDuration = parseFloat(item.dataset.slideDuration) || listDuration;
            const itemTiming = item.dataset.slideTiming || listTiming;

            item.style.transitionDelay = `${itemDelay}s`;
            item.style.transitionDuration = `${itemDuration}s`;
            item.style.transitionTimingFunction = itemTiming;
        });

        if (auto) {
            setTimeout(() => {
                list.classList.add('active');
            }, 100);
        }
    },

    // 모든 슬라이드 리스트 초기화
    initAllDataSlideIns: function() {
        const allSlideLists = document.querySelectorAll('.slide-in-list[data-slide-delay]');
        allSlideLists.forEach(list => {
            this.initSlideInFromData(list.id);
        });
    },

    // 수동으로 슬라이드 트리거
    triggerSlide: function(listId) {
        const list = document.getElementById(listId);
        if (!list || !list.classList.contains('slide-in-list')) return;

        this.initSlideInFromData(listId);
        list.classList.add('active');
    },

    // 슬라이드 리셋
    resetSlide: function(listId) {
        const list = document.getElementById(listId);
        if (!list || !list.classList.contains('slide-in-list')) return;

        list.classList.remove('active');
    },

    // 자동 초기화
    init: function() {
        this.initAllDataSlideIns();
    }
};

// DOM 로드 시 자동 초기화
document.addEventListener('DOMContentLoaded', function() {
    SlideInAnimation.init();
});

// 전역 접근을 위한 별칭 (기존 함수명과 호환성 유지)
window.triggerSlide = SlideInAnimation.triggerSlide.bind(SlideInAnimation);
window.resetSlide = SlideInAnimation.resetSlide.bind(SlideInAnimation);
window.initSlideInFromData = SlideInAnimation.initSlideInFromData.bind(SlideInAnimation);
