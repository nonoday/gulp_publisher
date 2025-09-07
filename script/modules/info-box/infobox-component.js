class InfoboxComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return [
      'type', 
      'text', 
      'button-text', 
      'button-link', 
      'button-target', 
      'show-icon', 
      'show-button', 
      'show-content',
      'aria-label'
    ];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  getTypeClass() {
    const type = this.getAttribute('type') || 'info';
    return `infobox ${type}`;
  }

  getRole() {
    const type = this.getAttribute('type') || 'info';
    const roleMap = {
      'error': 'alert',
      'notice': 'alert', 
      'success': 'status',
      'info': 'region'
    };
    return roleMap[type] || 'region';
  }

  getAriaLive() {
    const type = this.getAttribute('type') || 'info';
    const liveMap = {
      'error': 'assertive',
      'notice': 'polite',
      'success': 'polite', 
      'info': 'polite'
    };
    return liveMap[type] || 'polite';
  }

  getIconSvg() {
    const type = this.getAttribute('type') || 'info';
    const iconMap = {
      'success': `<svg class="infobox-header-img" width="20" height="20" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M10 2.11523C14.489 2.11528 18.125 5.75124 18.125 10.2402C18.125 14.7292 14.489 18.3652 10 18.3652C5.511 18.3652 1.87504 14.7292 1.875 10.2402C1.875 5.75121 5.51098 2.11523 10 2.11523ZM9.09729 11.392L6.94153 9.23621L5.83679 10.3409L9.09729 13.6021L14.1638 8.53552L13.0591 7.43079L9.09729 11.392Z" fill="currentColor"/>
      </svg>`,
      'error': `<svg class="infobox-header-img" width="20" height="20" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M8 1.74023C11.5912 1.74027 14.5 4.64904 14.5 8.24023C14.5 11.8314 11.5912 14.7402 8 14.7402C4.4088 14.7402 1.50003 11.8314 1.5 8.24023C1.5 4.64902 4.40878 1.74023 8 1.74023ZM5.29492 6.41895L7.11621 8.24023L5.29492 10.0615L6.17969 10.9453L8 9.12402L9.82129 10.9443L10.7051 10.0605L8.88379 8.24023L10.7051 6.41992L9.82129 5.53613L8 7.35645L6.17969 5.53516L5.29492 6.41895Z" fill="currentColor"/>
      </svg>`,
      'notice': `<svg class="infobox-header-img" width="20" height="20" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M9.18032 3.53324C9.53751 2.89029 10.4625 2.89029 10.8197 3.53324L17.9065 16.2902C18.2536 16.915 17.8022 17.6829 17.0874 17.683H2.91262C2.19786 17.6829 1.74578 16.915 2.09292 16.2902L9.18032 3.53324ZM10 14.298C9.56855 14.298 9.21877 14.6478 9.21877 15.0793C9.21901 15.5105 9.56869 15.8605 10 15.8605C10.4312 15.8604 10.781 15.5104 10.7813 15.0793C10.7813 14.6479 10.4314 14.2981 10 14.298ZM9.21877 7.63114V13.048H10.7813V7.63114H9.21877Z" fill="currentColor"/>
      </svg>`,
      'info': `<svg class="infobox-header-img" width="20" height="20" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M10 2.11523C14.489 2.11528 18.125 5.75124 18.125 10.2402C18.125 14.7292 14.489 18.3652 10 18.3652C5.511 18.3652 1.87504 14.7292 1.875 10.2402C1.875 5.75121 5.51098 2.11523 10 2.11523ZM10.1495 13.1571C9.71806 13.1571 9.36829 13.5069 9.36829 13.9384C9.36841 14.3697 9.71814 14.7196 10.1495 14.7196C10.5808 14.7195 10.9307 14.3696 10.9308 13.9384C10.9308 13.507 10.5809 13.1572 10.1495 13.1571ZM9.36829 6.49023V11.9071H10.9308V6.49023H9.36829Z" fill="currentColor"/>
      </svg>`
    };
    return iconMap[type] || iconMap['info'];
  }

  getButtonElement() {
    const buttonText = this.getAttribute('button-text');
    const buttonLink = this.getAttribute('button-link');
    const buttonTarget = this.getAttribute('button-target') || '_self';
    const ariaLabel = this.getAttribute('aria-label') || buttonText;

    if (!buttonText) return '';

    const chevronSvg = `<svg width="20" height="20" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M9.14355 5.99512L15.1484 12L9.14355 18.0049L10.1338 18.9951L17.1289 12L10.1338 5.00488L9.14355 5.99512Z" fill="currentColor"/>
    </svg>`;

    if (buttonLink) {
      return `<a href="${buttonLink}" target="${buttonTarget}" class="infobox-header-button" aria-label="${ariaLabel}">
        <span class="blind">${buttonText}</span>${chevronSvg}
      </a>`;
    } else {
      return `<button type="button" class="infobox-header-button" aria-label="${ariaLabel}">
        <span class="blind">${buttonText}</span>${chevronSvg}
      </button>`;
    }
  }

  render() {
    const type = this.getAttribute('type') || 'info';
    const text = this.getAttribute('text') || '한줄짜리 메인텍스트';
    const showIcon = this.getAttribute('show-icon') !== 'false';
    const showButton = this.getAttribute('show-button') !== 'false';
    const showContent = this.getAttribute('show-content') !== 'false';

    const iconHtml = showIcon ? this.getIconSvg() : '';
    const buttonHtml = showButton ? this.getButtonElement() : '';
    const contentSlot = showContent ? '<slot name="content"></slot>' : '';

    this.shadowRoot.innerHTML = `
      <style>
        .infobox {
          width: 100%;
          min-height: 56px;
          border-radius: var(--radius-xl);
          padding: var(--spacing-xl);
        }
        .infobox-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }
        .infobox-header-img {
          width: 20px;
          height: 20px;
        }
        .infobox-header-text {
          font-size: var(--font-size-body-m);
          font-weight: var(--font-weight-500);
          line-height: var(--lineheight-body-m);
        }
        .infobox-header-button {
          height: 20px;
          margin-left: auto;
          border: none;
          background: none;
          cursor: pointer;
          text-decoration: none;
          color: inherit;
        }
        .infobox-header-button img {
          width: 20px;
          height: 20px;
        }
        .infobox.small {
          padding: var(--spacing-lg) var(--spacing-xl);
        }
        .infobox.error {
          background-color: var(--bg-negative);
        }
        .infobox.error .infobox-header-img {
          color: var(--text-negative-alt);
        }
        .infobox.notice {
          background-color: var(--bg-notice);
        }
        .infobox.notice .infobox-header-img {
          color: var(--fg-notice-same);
        }
        .infobox.success {
          background-color: var(--bg-success);
        }
        .infobox.success .infobox-header-img {
          color: var(--fg-brand-same);
        }
        .infobox.info {
          background-color: var(--bg-graylight);
        }
        .infobox.info .infobox-header-img {
          color: var(--fg-quaternary);
        }
        .blind {
          position: absolute;
          width: 1px;
          height: 1px;
          margin: -1px;
          padding: 0;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        ::slotted(*) {
          margin-top: var(--spacing-md);
        }
      </style>
      <div class="${this.getTypeClass()}" role="${this.getRole()}" aria-live="${this.getAriaLive()}">
        <div class="infobox-header">
          ${iconHtml}
          <p class="infobox-header-text">${text}</p>
          ${buttonHtml}
        </div>
        ${contentSlot}
      </div>
    `;
  }
}

customElements.define('infobox-component', InfoboxComponent);
