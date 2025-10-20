function toggleSlideIn(listId) {
    const list = document.getElementById(listId);
    if (list) {
        list.classList.toggle('active');
    }
}

function resetAllLists() {
    const allLists = document.querySelectorAll('.slide-in-list');
    allLists.forEach(list => {
        list.classList.remove('active');
    });
}

function activateSlideIn(listId) {
    const list = document.getElementById(listId);
    if (list) {
        list.classList.add('active');
    }
}

function deactivateSlideIn(listId) {
    const list = document.getElementById(listId);
    if (list) {
        list.classList.remove('active');
    }
}

function setCustomDelay(listId, delayStep = 0.1) {
    const list = document.getElementById(listId);
    if (!list) return;

    const listItems = list.querySelectorAll('li');
    listItems.forEach((item, index) => {
        const delay = delayStep * (index + 1);
        item.style.transitionDelay = `${delay}s`;
    });
}

function addAnimationClass(listId, className) {
    const list = document.getElementById(listId);
    if (!list) return;

    const animationClasses = ['fast', 'slow', 'bounce', 'ease-in', 'ease-out'];
    animationClasses.forEach(cls => list.classList.remove(cls));

    list.classList.add(className);
}

function removeAnimationClass(listId) {
    const list = document.getElementById(listId);
    if (!list) return;

    const animationClasses = ['fast', 'slow', 'bounce', 'ease-in', 'ease-out'];
    animationClasses.forEach(cls => list.classList.remove(cls));
}

function advancedSlideIn(listId, options = {}) {
    const list = document.getElementById(listId);
    if (!list) return;

    const {
        delay = 0.1,
        duration = 0.5,
        timing = 'ease-out'
    } = options;

    removeAnimationClass(listId);
    setCustomDelay(listId, delay);

    const listItems = list.querySelectorAll('li');
    listItems.forEach(item => {
        item.style.transitionDuration = `${duration}s`;
        item.style.transitionTimingFunction = timing;
    });

    list.classList.add('active');
}

function slideInWithConfig(listId, config = {}) {
    const list = document.getElementById(listId);
    if (!list) return;

    if (config.delay !== undefined) {
        setCustomDelay(listId, config.delay);
    }

    if (config.className) {
        addAnimationClass(listId, config.className);
    }

    if (config.duration !== undefined || config.timing !== undefined) {
        const listItems = list.querySelectorAll('li');
        listItems.forEach(item => {
            if (config.duration !== undefined) {
                item.style.transitionDuration = `${config.duration}s`;
            }
            if (config.timing !== undefined) {
                item.style.transitionTimingFunction = config.timing;
            }
        });
    }

    list.classList.add('active');
}

function initSlideInFromData(listId) {
    const list = document.getElementById(listId);
    if (!list) return;

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
}

function triggerManualSlide(listId) {
    const list = document.getElementById(listId);
    if (!list) return;

    initSlideInFromData(listId);
    list.classList.add('active');
}

function resetSlide(listId) {
    const list = document.getElementById(listId);
    if (!list) return;

    list.classList.remove('active');
}

function setLiSlideOptions(listId, liIndex, options = {}) {
    const list = document.getElementById(listId);
    if (!list) return;

    const li = list.querySelectorAll('li')[liIndex];
    if (!li) return;

    const { delay, duration, timing } = options;

    if (delay !== undefined) {
        li.dataset.slideDelay = delay.toString();
        li.style.transitionDelay = `${delay}s`;
    }

    if (duration !== undefined) {
        li.dataset.slideDuration = duration.toString();
        li.style.transitionDuration = `${duration}s`;
    }

    if (timing !== undefined) {
        li.dataset.slideTiming = timing;
        li.style.transitionTimingFunction = timing;
    }

}

function removeLiSlideOptions(listId, liIndex) {
    const list = document.getElementById(listId);
    if (!list) return;

    const li = list.querySelectorAll('li')[liIndex];
    if (!li) return;

    delete li.dataset.slideDelay;
    delete li.dataset.slideDuration;
    delete li.dataset.slideTiming;

    li.style.transitionDelay = '';
    li.style.transitionDuration = '';
    li.style.transitionTimingFunction = '';
}

function initAllDataSlideIns() {
    const allSlideLists = document.querySelectorAll('.slide-in-list[data-slide-delay]');
    allSlideLists.forEach(list => {
        initSlideInFromData(list.id);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    resetAllLists();
    initAllDataSlideIns();
});
