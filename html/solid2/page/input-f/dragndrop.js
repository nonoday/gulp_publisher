class BaseComponent {
    constructor(element) {
        this.element = element;
    }
}

class DragNDrop extends BaseComponent {
    
    constructor(element) {
        if(element.classList.contains("initiated")) {
            return {};
        }

        super(element);
        
        this._element = element;
        this._setStyle();
        this._eventBind();

    }

    static get NAME() {
        return "dragNDrop";
    }

    _setStyle() {
        const handles = this._element.querySelectorAll(".ui-drag-btn-handle");

        Object.values(handles).map((handle) =>{
            handle.style.zIndex = 2;
        });

        const groups = this._element.querySelectorAll('.ui-drag-group');

        Object.values(groups).map((group) =>{
            group.style.minWidth = `${group.getBoundingClientRect()?.width ?? 0}px`
        });
    }

    _eventBind() {
        const $list = $(this._element);
        
        // jQuery와 jQuery UI 로드 확인
        if (typeof jQuery === 'undefined') {
            console.error("jQuery가 로드되지 않았습니다.");
            return;
        }
        if (typeof jQuery.ui === 'undefined' || typeof jQuery.ui.sortable === 'undefined') {
            console.error("jQuery UI sortable이 로드되지 않았습니다.");
            return;
        }
        
        // 핸들 링크의 기본 동작 방지
        $list.find(".ui-drag-btn-handle").on("click", function(e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
        
        // sortable 초기화 - 더 간단한 방식
        try {
            $list.sortable({
                handle: ".ui-drag-btn-handle",
                axis: "y",
                items: "li.ui-drag-item",
                cursor: "move",
                opacity: 0.8,
                scroll: true,
                tolerance: "pointer",
                placeholder: "ui-state-highlight",
                start: function(e, ui) {
                    ui.item.addClass("dragged");
                    ui.placeholder.height(ui.item.height());
                },
                stop: function(e, ui) {
                    ui.item.removeClass("dragged");
                }
            });
            
            console.log("sortable 초기화 완료");
        } catch (error) {
            console.error("sortable 초기화 오류:", error);
        }

        // 텍스트 선택 방지
        $list.disableSelection();


        this._element.querySelectorAll(".ui-drag-btn-up").forEach((el) => {
            el.addEventListener("click", function (e){
                const originalElement = this.closest("li");

                const previousElementSibling = originalElement.previousElementSibling;

                if (previousElementSibling) {
                    previousElementSibling.before(originalElement);
                }
            })
        });

        this._element.querySelectorAll(".ui-drag-btn-down").forEach((el) => {
            el.addEventListener("click", function (e){
                const originalElement = this.closest("li");

                const nextSiblingElement = originalElement.nextSiblingElement;

                if (nextSiblingElement) {
                    nextSiblingElement.after(originalElement);
                }
            })
        });
    }
}

const DragNDropApply = (elements)=> {
    let targetElements = null;

    if(typeof elements === "undefined") {
        targetElements = document.querySelectorAll(".ui-drag-list");
    } else if (typeof elements === "object" && typeof elements.length === "number") {
        targetElements = elements;
    } else if (typeof elements === "string") {
        targetElements = document.querySelectorAll(elements);            
    } else {
        return false;
    }

    Object.values(targetElements).map((element) =>{
        new DragNDrop(element)
    });
}


// jQuery가 로드된 후 초기화
(function() {
    function initDragNDrop() {
        if (typeof jQuery !== 'undefined' && typeof jQuery.ui !== 'undefined' && typeof jQuery.ui.sortable !== 'undefined') {
            DragNDropApply();
            console.log("DragNDrop 초기화 완료");
        } else {
            console.log("jQuery UI 로드 대기 중...");
            setTimeout(initDragNDrop, 100);
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDragNDrop);
    } else {
        $(document).ready(initDragNDrop);
    }
})();
