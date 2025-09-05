class ModalPopup extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.isOpen = false;
    }

    static get observedAttributes() {
        return ['title', 'error', 'all-center', 'icon', 'icon-type', 'footer', 'footer-type'];
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        // DOM이 준비된 후 초기 내용 설정
        this.updateContent();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue && this.shadowRoot) {
            this.updateContent();
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                .modal-dimmed-popup {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    z-index: 1000;
                    display: none;
                    align-items: center;
                    justify-content: center;
                }
                .modal-dimmed-popup.show {
                    display: flex;
                }
                .modal-container-box {
                    position: relative;
                    width: 90%;
                    max-width: 500px;
                    background-color: var(--white);
                    border-radius: var(--borderRadius-lg);
                    box-shadow: var(--shadows-lg);
                    padding: var(--spacing-xl);
                    margin: auto;
                }
                .modal-container-box.all-center {
                    text-align: center;
                }
                .modal-container-box.icon {
                    padding-left: 60px;
                }
                .modal-title {
                    font-size: var(--typography-fontSize-lg);
                    font-weight: var(--typography-fontWeight-semibold);
                    margin-bottom: var(--spacing-md);
                    color: var(--gray-800);
                }
                .modal-error {
                    color: var(--palette(new)-red-red-600);
                    font-size: var(--typography-fontSize-sm);
                    margin-bottom: var(--spacing-md);
                    display: none;
                }
                .modal-error.show {
                    display: block;
                }
                .modal-message {
                    margin-bottom: var(--spacing-xl);
                    color: var(--gray-600);
                    line-height: 1.5;
                }
                .modal-buttons-container {
                    display: flex;
                    justify-content: flex-end;
                    gap: var(--spacing-sm);
                    margin-bottom: var(--spacing-md);
                }
                .modal-footer {
                    border-top: 1px solid var(--gray-200);
                    padding-top: var(--spacing-md);
                    margin-top: var(--spacing-md);
                }
                .default-footer {
                    display: flex;
                    justify-content: center;
                }
                .dont-show-again {
                    background: none;
                    border: none;
                    color: var(--gray-600);
                    cursor: pointer;
                    font-size: var(--typography-fontSize-sm);
                    text-decoration: underline;
                }
                .dont-show-again:hover {
                    color: var(--gray-800);
                }
                .footer-type01 .custom-footer-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: var(--spacing-sm);
                }
                .footer-type02 .complex-footer-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: var(--spacing-lg);
                }
                .footer-type02 .complex-footer-content .footer-left,
                .footer-type02 .complex-footer-content .footer-right {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm);
                }
            </style>
            <div class="modal-dimmed-popup">
                <div class="modal-container-box">
                    <div class="modal-contents">
                        <div class="modal-title"></div>
                        <div class="modal-error"></div>
                        <div class="modal-message">
                            <slot name="message"></slot>
                        </div>
                        <div class="modal-buttons-container">
                            <slot name="buttons"></slot>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <slot name="footer">
                            <div class="default-footer">
                                <button class="dont-show-again">다시보지않기</button>
                            </div>
                        </slot>
                    </div>
                </div>
            </div>
        `;
    }

        setupEventListeners() {
        // 딤드 영역 클릭 시 모달 닫기
        const dimmedPopup = this.shadowRoot.querySelector('.modal-dimmed-popup');
        if (dimmedPopup) {
            dimmedPopup.addEventListener('click', (e) => {
                if (e.target === dimmedPopup) {
                    this.close();
                }
            });
        }

        // ESC 키로 모달 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // footer 이벤트 리스너 설정
        this.setupFooterEventListeners();
    }

    updateContent() {
        // shadowRoot가 준비되지 않았으면 리턴
        if (!this.shadowRoot) {
            return;
        }

        const title = this.getAttribute('title') || '';
        const error = this.getAttribute('error') || '';
        const allCenter = this.hasAttribute('all-center');
        const icon = this.hasAttribute('icon');
        const iconType = this.getAttribute('icon-type') || '';
        const footer = this.hasAttribute('footer');
        const footerType = this.getAttribute('footer-type') || '';

        const modalContainer = this.shadowRoot.querySelector('.modal-container-box');
        const titleEl = this.shadowRoot.querySelector('.modal-title');
        const errorEl = this.shadowRoot.querySelector('.modal-error');

        // DOM 요소들이 존재하는지 확인
        if (!modalContainer || !titleEl || !errorEl) {
            return;
        }

        // 타이틀 설정
        titleEl.textContent = title;

        // 에러 메시지 설정
        if (error) {
            errorEl.textContent = error;
            errorEl.classList.add('show');
        } else {
            errorEl.classList.remove('show');
        }

        // all-center 옵션
        if (allCenter) {
            modalContainer.classList.add('all-center');
        } else {
            modalContainer.classList.remove('all-center');
        }

        // icon 옵션 - icon 속성이 있으면 항상 icon 클래스 추가
        if (icon) {
            modalContainer.classList.add('icon');
        } else {
            modalContainer.classList.remove('icon');
        }

        // icon-type 설정 - 기존 icon-type 클래스들 제거 후 새로운 것 추가
        // 기존에 추가된 icon-type 클래스들 제거
        const existingClasses = Array.from(modalContainer.classList);
        existingClasses.forEach(className => {
            if (className.startsWith('icon-')) {
                modalContainer.classList.remove(className);
            }
        });

        // 새로운 icon-type 클래스 추가
        if (iconType) {
            modalContainer.classList.add(iconType);
        }

        // footer 옵션 처리
        const footerEl = this.shadowRoot.querySelector('.modal-footer');
        if (footerEl) {
            if (footer) {
                footerEl.classList.add('custom-footer');
            } else {
                footerEl.classList.remove('custom-footer');
            }

            // footer-type 클래스 추가
            if (footerType) {
                footerEl.classList.add(footerType);
            }
        }
    }

    open() {
        if (this.isOpen || !this.shadowRoot) return;
        
        this.isOpen = true;
        const dimmedPopup = this.shadowRoot.querySelector('.modal-dimmed-popup');
        if (dimmedPopup) {
            dimmedPopup.classList.add('show');
        }
        
        // body-wrap에 overflow-scroll 클래스 추가
        const bodyWrap = document.querySelector('.body-wrap');
        if (bodyWrap) {
            bodyWrap.classList.add('overflow-scroll');
        }
    }

    close() {
        if (!this.isOpen || !this.shadowRoot) return;
        
        this.isOpen = false;
        const dimmedPopup = this.shadowRoot.querySelector('.modal-dimmed-popup');
        if (dimmedPopup) {
            dimmedPopup.classList.remove('show');
        }
        
        // body-wrap에서 overflow-scroll 클래스 제거
        const bodyWrap = document.querySelector('.body-wrap');
        if (bodyWrap) {
            bodyWrap.classList.remove('overflow-scroll');
        }
    }

    // 외부에서 호출할 수 있는 메서드들
    setTitle(title) {
        this.setAttribute('title', title);
    }

    setError(error) {
        this.setAttribute('error', error);
    }

    setAllCenter(allCenter) {
        if (allCenter) {
            this.setAttribute('all-center', '');
        } else {
            this.removeAttribute('all-center');
        }
    }

    setIcon(icon) {
        if (icon) {
            this.setAttribute('icon', '');
        } else {
            this.removeAttribute('icon');
        }
    }

    setIconType(iconType) {
        if (iconType) {
            // icon-type을 설정할 때는 icon 속성도 자동으로 설정
            this.setAttribute('icon', '');
            this.setAttribute('icon-type', iconType);
        } else {
            // icon-type을 제거할 때는 icon 속성도 제거
            this.removeAttribute('icon');
            this.removeAttribute('icon-type');
        }
    }

    setFooter(footer) {
        if (footer) {
            this.setAttribute('footer', '');
        } else {
            this.removeAttribute('footer');
        }
    }

    setFooterType(footerType) {
        if (footerType) {
            this.setAttribute('footer-type', footerType);
        } else {
            this.removeAttribute('footer-type');
        }
    }

    // 버튼 이벤트 처리
    handleButtonClick(button, callback) {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            if (callback) {
                callback(e);
            }
            this.close();
        });
    }

            // slot의 버튼들을 찾는 메서드
        getSlotButtons() {
            const buttonSlot = this.shadowRoot.querySelector('slot[name="buttons"]');
            if (buttonSlot) {
                const assignedElements = buttonSlot.assignedElements();
                const buttons = [];
                assignedElements.forEach(element => {
                    // modal-box-button-group 내부의 버튼들 찾기
                    const buttonGroups = element.querySelectorAll('.modal-box-button-group');
                    buttonGroups.forEach(group => {
                        const groupButtons = group.querySelectorAll('button');
                        buttons.push(...groupButtons);
                    });
                });
                return buttons;
            }
            return [];
        }

        // footer slot의 내용을 가져오는 메서드
        getFooterContent() {
            const footerSlot = this.shadowRoot.querySelector('slot[name="footer"]');
            if (footerSlot) {
                const assignedElements = footerSlot.assignedElements();
                return assignedElements;
            }
            return [];
        }

        // 기본 footer의 "다시보지않기" 버튼 이벤트 처리
        setupFooterEventListeners() {
            const dontShowButton = this.shadowRoot.querySelector('.dont-show-again');
            if (dontShowButton) {
                dontShowButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    // 로컬 스토리지에 저장하여 다시보지않기 기능 구현
                    localStorage.setItem('modal-dont-show-again', 'true');
                    this.close();
                });
            }
        }
}

// 웹컴포넌트 등록
customElements.define('modal-popup', ModalPopup);
