/*! AOS6 fallback for <progress-step> / <progress-step-item>
 *  - Shadow DOM/Custom Elements/CSS Vars 미지원 환경에서 Light DOM으로 변환
 *  - 전역 CSS(.progress-step, .progress-step-item-*)와 아이콘 경로는 네 소스 규칙 그대로 사용
 *  - 강제 테스트: URL에 ?force-fallback 또는 window.__PS_FORCE_FALLBACK__=true 후 reload
 */
(function () {
  var supportsCE = !!(window.customElements && customElements.define);
  var supportsSD = !!(Element.prototype && Element.prototype.attachShadow);
  var supportsCSSVars = !!(window.CSS && CSS.supports && (CSS.supports('(--a:0)') || CSS.supports('color', 'var(--a)')));
  var force = !!(window.__PS_FORCE_FALLBACK__ || /[?#]force-fallback\b/.test(location.href));
  var supportsModern = !force && supportsCE && supportsSD && supportsCSSVars;

  if (supportsModern) return; // 현대 브라우저는 폴백 불필요

  // 1) 여기서 전역 스타일 삽입
  (function injectLegacyCSS(){
    var css = `
     <style>
        /* 접근성용 css */
        .blind {
            display: block;
            margin: 0;
            position: absolute;
            z-index: -1;
            width: 1px;
            height: 1px;
            font-size: 1px;
            line-height: 1px;
            color: transparent;
            border: none;
            padding: 0;
            overflow: hidden;
            background: none;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .progress-step {
            list-style: none;
            position: relative;
            display: flex;
            align-items: flex-start;
            gap: var(--spacing-lg);
            width: 100%;
            padding: 0;
            margin: 0;
        }

        .progress-step-item {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            flex: 1;
            min-width: 90px;
        }
        /* 진행률 단계 아이템 번호 */
        .progress-step-item-marker {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            margin-bottom: var(--spacing-sm);
            border-radius: var(--borderRadius-full);
            background-color: var(--background-bg-gray);
            color: var(--text-text-quaternary);
            font-weight: var(--typography-fontWeight-medium);
            font-size: var(--typography-fontSize-sm);
            z-index: 2;
        }
        .progress-step-item-content {
            text-align: center;
            width: 100%;
        }

        /* 진행률 단계 제목 */
        .progress-step-item-content-title {
            margin-bottom: var(--spacing-sm);
            color: var(--text-text-secondary);
            font-size: var(--typography-fontSize-base);
            font-weight: var(--typography-fontWeight-medium);
        }

        /* 진행률 단계 날짜 */
        .progress-step-item-content-date {
            color: var(--colors-text-tertiary);
            font-size: var(--typography-fontSize-sm);
            font-weight: var(--typography-fontWeight-light);
        }

        /* 활성화된 단계 -  디자인에는 없으나 추가될때 대비  */
        .progress-step-item.active .progress-step-item-marker {
            background: var(--background-bg-brand_strong-same);
            /* 텍스트에 흰색이 없음 --colors-text-primary */
            color: var(--white);
        }
        .progress-step-item.active .progress-step-item-content-title {
            color: var(--text-text-brand);
        }

        /* 완료된 단계 */
        .progress-step-item.completed .progress-step-item-marker {
            background: var(--background-bg-brand_strong-same);  
            color: var(--white);
        }

        /* 완료된 단계 스타일 */
        .progress-step-item.completed .progress-step-item-content-title {
            color: var(--text-text-secondary);
        }

        /* 연결선 */
        .progress-step-item:not(:last-child)::after {
            content: '';
            position: absolute;
            top: 12px;
            left: 50%;
            width: calc(100% + var(--spacing-lg));
            height: 1px;
            background: var(--border-border-secondary);
            z-index: 1;
            pointer-events: none;
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
        }

        /* 완료된 연결선 */
        .progress-step-item.completed:not(:last-child)::after {
            background:var(--brand-500);
        }

        /* 진행 중인 연결선 */
        .progress-step-item.active:not(:last-child)::after {
            background: var(--border-border-secondary)
        }


        .progress-step-item.error .progress-step-item-marker {
            background: var(--foreground-fg-negative-same);
            color: var(--white);
        }
        .progress-step-item.hold .progress-step-item-marker {
            background: var(--foreground-fg-steady);
            color: var(--white);
        }
        .progress-step-item.check .progress-step-item-marker {
            background: var(--foreground-fg-brand-same);
            color: var(--white);
        }
        
        .number .progress-step-item-marker {
            background: var(--background-bg-brand);
            color: var(--text-text-brand);
        }
        
        .icon .progress-step-item-marker {
            width: 48px;
            height: 48px;
        }
        .icon .progress-step-item-marker img {
            width: 25px;
        }
        .icon .progress-step-item:not(:last-child)::after {
            top: 24px;
        }
        .large .progress-step-item-marker {
            width: 32px;
            height: 32px;
        }
        .large .progress-step-item-marker img {
            width: 20px;
        }
        .large .progress-step-item:not(:last-child)::after {
            top: 17px;
        }

        .small .progress-step-item-marker {
            width: 24px;
            min-width: 24px;
            height: 24px;
        }
        .small .progress-step-item-marker img {
            width: 15px;
        }
        .small .progress-step-item:not(:last-child)::after {
            top: 12px;
        }

        .progress-step.vertical {
            position: relative;
            display: flex;
            align-items: flex-start;
            flex-direction: column;
            gap: 0;
        }

        .progress-step.vertical  .progress-step-item {
            flex-direction: row;
            align-items: flex-start;
            flex:auto;
            min-width:auto;
            gap:var(--spacing-sm);
            margin-top:var(--spacing-sm);
        }

        .progress-step.vertical .progress-step-item::after {
            display: none;
        }
        .progress-step.vertical .progress-step-item:first-child {
            margin-top:0;
        }
        .progress-step.vertical .progress-step-item-content {
            width: auto;
            text-align: left;
        }
        .progress-step.vertical .progress-step-item:last-child .progress-step-item-content::after {
            display: none;
        } 
        .progress-step.vertical .progress-step-item-content::after {
            content: '';
            position: absolute;
            top: 40px;
            bottom:0;
            left: 16px;
            width: 1px;
            background: var(--border-border-secondary);
            z-index: 1;
            pointer-events: none;
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
        }
        .progress-step.vertical .progress-step-item.completed .progress-step-item-content::after {
            background: var(--brand-500);
        }
        .progress-step.vertical .progress-step-item-content-title {
            display: flex;
            align-items: center;
            min-height: 32px;
            color: var(--text-text-secondary);
            font-size: var(--typography-fontSize-lg);
            font-weight: var(--typography-fontWeight-medium);
        }
        .progress-step.vertical .progress-step-item-content-description {
            color: var(--text-text-quaternary);
            font-size: var(--typography-fontSize-sm);
            font-weight: var(--typography-fontWeight-light);
        }
        .progress-step.vertical .progress-step-item-content-date {
            margin-top:var(--spacing-xs);
        }
        .progress-step.vertical .progress-step-item-content-link-container {
            margin-top:var(--spacing-xs);
        }
        .progress-step.vertical .progress-step-item-content-link {
            display: inline-flex;
            align-items: center;
            color: var(--text-text-brand);
            font-size: var(--typography-fontSize-sm);
            font-weight: var(--typography-fontWeight-light);
            text-decoration: none;
        }
        .progress-step.vertical .progress-step-item-content-link:focus {
            text-decoration: underline;
        }
    </style>
    `;
    var style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  })();


  var FLAG = 'data-ps-fallback-applied';
  function attr(el, name, def) { var v = el.getAttribute(name); return (v==null ? (def||'') : v); }
  function setText(el, txt){ el.textContent = (txt==null ? '' : txt); }

  function buildItem(itemEl) {
    var status = attr(itemEl, 'status');                 // completed|active|error|hold|check|number|pending|...
    var step   = attr(itemEl, 'step') || '';             // number 텍스트
    var title  = attr(itemEl, 'title') || '';
    var desc   = attr(itemEl, 'description') || '';
    var date   = attr(itemEl, 'date') || '';
    var link   = attr(itemEl, 'link') || '';
    var linkText  = attr(itemEl, 'linkText') || '';
    var linkLabel = attr(itemEl, 'linkLabel') || '';
    var type   = attr(itemEl, 'type') || '';             // 'icon'이면 아이콘 마커
    var size   = attr(itemEl, 'size') || '';
    var orient = attr(itemEl, 'orientation') || '';      // '' | 'vertical'

    // <li class="progress-step-item [status] [size] [vertical?]">
    var li = document.createElement('li');
    li.className = 'progress-step-item' + (status ? (' ' + status) : '');
    if (size) li.classList.add(size);
    if (orient === 'vertical') li.classList.add('vertical');

    // marker
    var marker = document.createElement('div');
    marker.className = 'progress-step-item-marker';

    if (type === 'icon' && status && status !== 'number') {
      var img = document.createElement('img');
      img.alt = (status === 'check') ? '완료' :
                (status === 'error') ? '오류' :
                (status === 'hold')  ? '중지' : '';
      // ✅ 네 소스 규칙 그대로
      var map = {
        check: "../../../../images/icon/icon_marker_check.svg",
        error: "../../../../images/icon/icon_marker_error.svg",
        hold:  "../../../../images/icon/icon_marker_hold.svg"
      };
      img.src = map[status] || "/../../../../images/icon/icon_marker_check.svg";
      img.setAttribute('aria-hidden','true');
      marker.appendChild(img);
    } else {
      setText(marker, step);
      marker.setAttribute('aria-label', title ? ('단계: ' + title) : '단계');
    }

    // content
    var content = document.createElement('div');
    content.className = 'progress-step-item-content';

    var elTitle = document.createElement('div');
    elTitle.className = 'progress-step-item-content-title';
    setText(elTitle, title);

    var elDesc = document.createElement('div');
    elDesc.className = 'progress-step-item-content-description';
    setText(elDesc, desc);
    if (!desc) elDesc.style.display = 'none';

    var elDate = document.createElement('div');
    elDate.className = 'progress-step-item-content-date';
    setText(elDate, date);

    var linkBox = document.createElement('div');
    linkBox.className = 'progress-step-item-content-link-container';
    if (link && linkText) {
      var a = document.createElement('a');
      a.className = 'progress-step-item-content-link';
      a.href = link;
      a.setAttribute('aria-label', linkLabel || (linkText + ' 상세보기'));
      // ✅ 링크 아이콘 규칙 그대로
      a.innerHTML = linkText + ' <img src="../../../../images/icon/icon_chevron_right.svg" alt="더보기" aria-hidden="true"/>';
      linkBox.appendChild(a);
    } else {
      linkBox.style.display = 'none';
    }

    content.appendChild(elTitle);
    content.appendChild(elDesc);
    content.appendChild(elDate);
    content.appendChild(linkBox);

    li.appendChild(marker);
    li.appendChild(content);
    return li;
  }

  function upgradeOne(ps) {
    if (ps.hasAttribute(FLAG)) return;
    ps.setAttribute(FLAG, '1');

    var size   = attr(ps, 'size');                // small|default|large|icon
    var orient = attr(ps, 'orientation');         // '' | 'vertical'
    var type   = attr(ps, 'type') || '';          // number|icon
    var auton  = ps.hasAttribute('autonumber');

    // <ul class="progress-step [vertical?] [size?]">
    var ul = document.createElement('ul');
    ul.className = 'progress-step' + (orient ? (' ' + orient) : '') + (size ? (' ' + size) : '');

    // 자식 <progress-step-item>들을 Light DOM <li>로 변환
    var items = Array.prototype.slice.call(ps.querySelectorAll('progress-step-item'));
    items.forEach(function (it, idx) {
      // 아이템 속성 보정(부모 값 전파)
      if (size && !it.hasAttribute('size')) it.setAttribute('size', size);
      if (orient && !it.hasAttribute('orientation')) it.setAttribute('orientation', orient);
      if (type && !it.hasAttribute('type')) it.setAttribute('type', type);
      if (auton && type !== 'icon' && !it.getAttribute('step')) it.setAttribute('step', String(idx + 1));

      ul.appendChild(buildItem(it));
    });

    ps.parentNode.replaceChild(ul, ps);
  }

  function run() {
    var all = document.querySelectorAll('progress-step');
    (all.forEach ? all.forEach(upgradeOne) : Array.prototype.forEach.call(all, upgradeOne));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();

/* ======== 아래부터는 네가 준 원본 코드 (변경 없음) ======== */
/* (인용: 업로드한 progress-step.js 원본을 그대로 반영)  */ // :contentReference[oaicite:1]{index=1}
class ProgressStep extends HTMLElement {
    
    constructor() { 
        super();

        this.attachShadow({mode:'open'})
        
        this.render();
        
    }

    static get observedAttributes() {
        return ['type'];
    }


    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }
   
    
    render() {

        const size = this.getAttribute('size') || '';
        const vertical = this.getAttribute('orientation') || '';
        

        this.shadowRoot.innerHTML = `
               <style>
                /* 접근성용 css */
                .blind {
                    display: block;
                    margin: 0;
                    position: absolute;
                    z-index: -1;
                    width: 1px;
                    height: 1px;
                    font-size: 1px;
                    line-height: 1px;
                    color: transparent;
                    border: none;
                    padding: 0;
                    overflow: hidden;
                    background: none;
                }

                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                .progress-step {
                    list-style: none;
                    position: relative;
                    display: flex;
                    align-items: flex-start;
                    gap: var(--spacing-lg);
                    width: 100%;
                    padding: 0;
                    margin: 0;
                }
                
                .progress-step.vertical {
                    flex-direction: column;
                    gap: 0;
                }

                ::slotted(progress-step-item){
                    flex:1;
                    min-width:90px;
                }

            </style>
            <ul class="progress-step ${vertical} ${size}">
                <slot></slot>
            </ul>
        `;

        const type = this.getAttribute('type') === 'icon' && size == '' ?  this.getAttribute('type') : '';
        const items = this.querySelectorAll('progress-step-item');
        items.forEach(item => {
            item.setAttribute('type', type);
            item.setAttribute('size', size);
            item.setAttribute('orientation', vertical);
        })
    }

}

customElements.define('progress-step', ProgressStep);


class ProgressStepItem extends HTMLElement {

    static get observedAttributes() {
        return ['status', 'step', 'title', 'description', 'date', 'linkLabel', 'link', 'linkText'];
    }

     constructor() { 
        super();
    
        this.attachShadow({mode:'open'})

        this.render();
    }
    

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
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

    render() {
        
        const description = this.getAttribute('description') || '';
        const linkLabel = this.getAttribute('linkLabel') || '';
        const link = this.getAttribute('link') || '';
        const linkText = this.getAttribute('linkText') || '';

        const status = this.getAttribute('status') || '';
        const step = this.getAttribute('step') || '';
        const title = this.getAttribute('title') || '';
        const date = this.getAttribute('date') || '';

        const markerAriaLabel = status === 'number' ? '' : `aria-label="${this.getAriaLabel(status, step)}"`;
        const dateAriaLabel = status === 'number' ? '' : `aria-label="${this.getDateAriaLabel(status)}"`;

        this.shadowRoot.innerHTML = `
            <style>

                :host{
                    display:list-item; /* host는 컨테이너의 flex 아이템(부모 ::slotted 로도 보장) */
                }
                .progress-step-item{
                    position:relative; display:flex; flex-direction:column; align-items:center;
                    /* flex/min-width는 host에서 처리되므로 내부엔 굳이 필요 없음 */
                    list-style:none;
                }

                 /* 진행률 단계 아이템 번호 */
                .progress-step-item-marker {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    margin-bottom: var(--spacing-sm);
                    border-radius: var(--borderRadius-full);
                    background-color: var(--background-bg-gray);
                    color: var(--text-text-quaternary);
                    font-weight: var(--typography-fontWeight-medium);
                    font-size: var(--typography-fontSize-sm);
                    z-index: 2;
                }

                .progress-step-item-content {
                    text-align: center;
                    width: 100%;
                }

                /* 진행률 단계 제목 */
                .progress-step-item-content-title {
                    margin-bottom: var(--spacing-sm);
                    color: var(--text-text-secondary);
                    font-size: var(--typography-fontSize-base);
                    font-weight: var(--typography-fontWeight-medium);
                }

                /* 진행률 단계 날짜 */
                .progress-step-item-content-date {
                    color: var(--colors-text-tertiary);
                    font-size: var(--typography-fontSize-sm);
                    font-weight: var(--typography-fontWeight-light);
                }

                /* 활성화된 단계 */
                .progress-step-item.active .progress-step-item-marker {
                    background: var(--background-bg-brand_strong-same);
                    color: var(--white);
                }
                .progress-step-item.active .progress-step-item-content-title {
                    color: var(--text-text-brand);
                }

                /* 완료된 단계 */
                .progress-step-item.completed .progress-step-item-marker {
                    background: var(--background-bg-brand_strong-same);
                    color: var(--white);
                }
                .progress-step-item.completed .progress-step-item-content-title {
                    color: var(--text-text-secondary);
                }

                /* 연결선 (마지막 제외) — Shadow에서는 host 기준 */
                :host(:not(:last-of-type)) .progress-step-item::after {
                    content: '';
                    position: absolute;
                    top: 12px;
                    left: 50%;
                    width: calc(100% + var(--spacing-lg));
                    height: 1px;
                    background: var(--border-border-secondary);
                    z-index: 1;
                    pointer-events: none;
                    user-select: none;
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                }
                :host(:not(:last-of-type)) .progress-step-item.completed::after {
                    background: var(--brand-500);
                }
                :host(:not(:last-of-type)) .progress-step-item.active::after {
                    background: var(--border-border-secondary);
                }

                .error .progress-step-item-marker {
                    background: var(--foreground-fg-negative-same);
                    color: var(--white);
                }
                .hold .progress-step-item-marker {
                    background: var(--foreground-fg-steady);
                    color: var(--white);
                }
                .check .progress-step-item-marker {
                    background: var(--foreground-fg-brand-same);
                    color: var(--white);
                }

                .number .progress-step-item-marker {
                    background: var(--background-bg-brand);
                    color: var(--text-text-brand);
                }

                /* size 클래스 → host 속성으로 매핑 */
                :host([type="icon"]) .progress-step-item-marker { width: 48px; height: 48px; }
                :host([type="icon"]) .progress-step-item-marker img { width: 25px; }
                :host([type="icon"]):not(:last-of-type) .progress-step-item::after { top: 24px; }

                :host([size="large"]) .progress-step-item-marker { width: 32px; height: 32px; }
                :host([size="large"]) .progress-step-item-marker img { width: 20px; }
                :host([size="large"]):not(:last-of-type) .progress-step-item::after { top: 17px; }

                :host([size="small"]) .progress-step-item-marker { width: 24px; min-width: 24px; height: 24px; }
                :host([size="small"]) .progress-step-item-marker img { width: 15px; }
                :host([size="small"]):not(:last-of-type) .progress-step-item::after { top: 12px; }

                /* vertical — 컨테이너의 .progress-step.vertical 대응 */
                :host([orientation="vertical"]) .progress-step-item {
                    flex-direction: row;
                    align-items: flex-start;
                    flex: auto;
                    min-width: auto;
                    gap: var(--spacing-sm);
                    margin-top: var(--spacing-sm);
                }
                :host([orientation="vertical"]) .progress-step-item::after { display: none; }
                :host([orientation="vertical"][first]) .progress-step-item { margin-top: 0; }

                :host([orientation="vertical"]) .progress-step-item-content {
                    width: auto;
                    text-align: left;
                }

                :host([orientation="vertical"]) .progress-step-item-content::after {
                    content: '';
                    position: absolute;
                    top: 40px;
                    bottom: 0;
                    left: 16px;
                    width: 1px;
                    background: var(--border-border-secondary);
                    z-index: 1;
                    pointer-events: none;
                    user-select: none;
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                }
                :host([orientation="vertical"]:last-of-type) .progress-step-item-content::after { display: none; }
                :host([orientation="vertical"]) .progress-step-item.completed .progress-step-item-content::after {
                    background: var(--brand-500);
                }

                :host([orientation="vertical"]) .progress-step-item-content-title {
                    display: flex;
                    align-items: center;
                    min-height: 32px;
                    color: var(--text-text-secondary);
                    font-size: var(--typography-fontSize-lg);
                    font-weight: var(--typography-fontWeight-medium);
                }
                :host([orientation="vertical"]) .progress-step-item-content-description {
                    color: var(--text-text-quaternary);
                    font-size: var(--typography-fontSize-sm);
                    font-weight: var(--typography-fontWeight-light);
                }
                :host([orientation="vertical"]) .progress-step-item-content-date {
                    margin-top: var(--spacing-xs);
                }
                :host([orientation="vertical"]) .progress-step-item-content-link-container {
                    margin-top: var(--spacing-xs);
                }
                :host([orientation="vertical"]) .progress-step-item-content-link {
                    display: inline-flex;
                    align-items: center;
                    color: var(--text-text-brand);
                    font-size: var(--typography-fontSize-sm);
                    font-weight: var(--typTypography-fontWeight-light);
                    text-decoration: none;
                }
                :host([orientation="vertical"]) .progress-step-item-content-link:focus {
                    text-decoration: underline;
  }
    </style>
    
             <li class="progress-step-item ${status}">
                <div class="progress-step-item-marker" ${markerAriaLabel}></div>
                <div class="progress-step-item-content">
                    <div class="progress-step-item-content-title">${title}</div>
                    <div class="progress-step-item-content-description" style="display:none;"></div>
                    <div class="progress-step-item-content-date" ${dateAriaLabel}>${date}</div>
                    <div class="progress-step-item-content-link-container" style="display:none;"></div> 
                </div>
            </li>
        `;

        this.markerDiv = this.shadowRoot.querySelector('.progress-step-item-marker');
        this.linkDiv = this.shadowRoot.querySelector('.progress-step-item-content-link-container');
        this.desDiv = this.shadowRoot.querySelector('.progress-step-item-content-description');

        if(this.hasAttribute('type')) {
            this.markerDiv.innerHTML = this.getMarkerContent(status, step);
        } else {
            this.markerDiv.textContent = step;
        }

        if(description && description.trim()) {
            this.desDiv.textContent = description;
            this.desDiv.style.display = '';
        } 

        if(link && link.trim()) {
            this.linkDiv.innerHTML = `<a href="${link}" class="progress-step-item-content-link" aria-label="${linkLabel}">${linkText} <img src="../../../../images/icon/icon_chevron_right.svg" alt="더보기" aria-hidden="true" /></a>`;
            this.linkDiv.style.display = '';
        } 
        
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

customElements.define('progress-step-item', ProgressStepItem);
