document.addEventListener('DOMContentLoaded', () => {
    // TABS
    const tabs = document.querySelectorAll('.tabheader__item'),
        tabsContent = document.querySelectorAll('.tabcontent'),
        tabsParent = document.querySelector('div.tabheader__items');

    function hideTabConent() {
        tabsContent.forEach(item => {
            item.classList.add('hide');
            item.classList.remove('show', 'fade');
        });

        tabs.forEach(tab => {
            tab.classList.remove('tabheader__item_active');
        });
    }

    function showTabContent(active = 0) {
        tabsContent[active].classList.add('show', 'fade');
        tabsContent[active].classList.remove('hide');
        tabs[active].classList.add('tabheader__item_active');
    }

    hideTabConent();
    showTabContent();

    tabsParent.addEventListener('click', (event) => {
        const target = event.target;

        if (target && target.classList.contains('tabheader__item')) {
            tabs.forEach((tab, i) => {
                if (tab == target) {
                    hideTabConent();
                    showTabContent(i);
                }
            });
        }
    });



    //TIMER

    const deadline = '2021-05-31';

    function getTimeRemaning(endtime) {
        const t = Date.parse(endtime) - Date.parse(new Date()),
            days = Math.floor(t / (1000 * 60 * 60 * 24)),
            hours = Math.floor((t / (1000 * 60 * 60) % 24)),
            minutes = Math.floor(t / (1000 * 60) % 60),
            seconds = Math.floor(t / (1000) % 60);

        return {
            'total': t,
            'days': days,
            'hours': hours,
            'minutes': minutes,
            'seconds': seconds
        };
    }

    function getZero(number) {
        if (number >= 0 && number < 10) {
            number = '0' + number;
            return number;
        } else {
            return number;
        }

    }

    function setCloack(selector, endtime) {
        const timer = document.querySelector(selector),
            days = document.querySelector('#days'),
            hours = document.querySelector('#hours'),
            minutes = document.querySelector('#minutes'),
            seconds = document.querySelector('#seconds'),
            timeInterval = setInterval(updateCloack, 1000);

        updateCloack();

        function updateCloack() {
            const t = getTimeRemaning(endtime);

            days.innerHTML = getZero(t.days);
            hours.innerHTML = getZero(t.hours);
            minutes.innerHTML = getZero(t.minutes);
            seconds.innerHTML = getZero(t.seconds);

            if (t.total <= 0) {
                clearInterval(timeInterval);
            }
        }
    }

    setCloack('.timer', deadline);

    // Modal
    const modal = document.querySelector('.modal'),
        modalOpen = document.querySelectorAll('button[data-modal]');


    function fadeModal() {
        modal.classList.add('show', 'fade');
        document.body.style.overflow = 'hidden';
        clearInterval(modalTimerId);
    }

    function openModal() {
        clearInterval(modalTimerId);
        window.removeEventListener('scroll', showModalByScroll);
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function hideModal() {
        modal.classList.remove('show', 'fade');
        modal.classList.add('fadeOut');
        document.body.style.overflow = '';
        setTimeout(() => {
            modal.classList.remove('fadeOut');
        }, 1500);
    }

    function closeModal() {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    function modalWindow() {
        modalOpen.forEach(item => {
            item.addEventListener('click', () => {
                // fadeModal();
                openModal();
            });
        });




        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.getAttribute('data-close') == '') {
                // hideModal();
                closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && modal.classList.contains('show')) {
                // hideModal();
                closeModal();
            }
        });
    }

    function showModalByScroll() {
        if (window.pageYOffset + document.documentElement.clientHeight >= document.documentElement.scrollHeight) {
            // fadeModal();
            openModal();
            window.removeEventListener('scroll', showModalByScroll);
        }
    }
    // const modalTimerId = setTimeout(fadeModal, 300000);
    const modalTimerId = setTimeout(openModal, 300000);

    window.addEventListener('scroll', showModalByScroll);
    modalWindow();

    //Cards

    class MenuCard {
        constructor(src, alt, title, desc, price, parentSelector, ...classes) {
            this.src = src;
            this.alt = alt;
            this.title = title;
            this.desc = desc;
            this.price = price;
            this.classes = classes;
            this.parent = document.querySelector(parentSelector);
            this.transfer = 27;
            this.changeToUAH();
        }

        changeToUAH() {
            this.price = this.price * this.transfer;
        }

        render() {
            const element = document.createElement('div');
            if (this.classes.length === 0) {
                this.classes.push('menu__item');
                element.classList.add(this.classes);
            } else {
                this.classes.forEach(className => element.classList.add(className));
            }
            element.innerHTML = `
                <img src=${this.src} alt=${this.alt}>
                <h3 class="menu__item-subtitle">${this.title}</h3>
                <div class="menu__item-descr">${this.desc}</div>
                <div class="menu__item-divider"></div>
                <div class="menu__item-price">
                    <div class="menu__item-cost">Цена:</div>
                    <div class="menu__item-total"><span>${this.price}</span> грн/день</div>
                </div>
        `;
            this.parent.append(element);
        }
    }

    const getResource = async (url) => {
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(`Could not fetch ${url}, status: ${res.status}`);
        }

        return await res.json();
    };

    getResource('http://localhost:3000/menu')
        .then(data => {
            data.forEach(({
                img,
                altimg,
                title,
                descr,
                price
            }) => {
                new MenuCard(img, altimg, title, descr, price, '.menu .container')
                    .render();
            });
        });

    // Forms

    const forms = document.querySelectorAll('form');

    const messages = {
        loading: 'img/form/spinner.svg',
        success: 'Спасибо! Скоро мы с вами свяжемся =)',
        error: 'Что-то пошло не так...'
    };

    forms.forEach(form => {
        bindPostData(form);
    });

    const postData = async (url, data) => {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                'Content-type': 'application/json'
            },
            body: data
        });

        return await res.json();
    };

    function bindPostData(form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const statusMessage = document.createElement('img');
            statusMessage.src = messages.loading;
            statusMessage.style.cssText = `
            display: block;
            margin: 0 auto;
            `;
            // form.append(statusMessage);
            form.insertAdjacentElement('afterend', statusMessage);
            // const request = new XMLHttpRequest();
            // request.open('POST', 'server.php');

            const formData = new FormData(form);

            const json = JSON.stringify(Object.fromEntries(formData.entries()));

            postData('http://localhost:3000/requests', json)
                .then(data => {
                    console.log(data);
                    showThanksModal(messages.success);
                    statusMessage.remove();
                }).catch(() => {
                    showThanksModal(messages.error);
                }).finally(() => {
                    form.reset();
                });
        });
    }

    function showThanksModal(message) {
        const prevModalDialog = document.querySelector('.modal__dialog');
        prevModalDialog.classList.add('hide');
        // fadeModal();
        openModal();
        const thanksModal = document.createElement('div');
        thanksModal.classList.add('modal__dialog');
        thanksModal.innerHTML = `
        <div class="modal__content">
            <div class="modal__close" data-close>&times;</div>
            <div class="modal__title">${message}</div>
        </div>
        `;

        document.querySelector('.modal').append(thanksModal);
        setTimeout(() => {
            thanksModal.remove();
            prevModalDialog.classList.add('show');
            prevModalDialog.classList.remove('hide');
            closeModal();
        }, 4000);
    }

    fetch('http://localhost:3000/menu')
        .then(data => data.json())
        .then(res => console.log(res));



    // Slider

    const slides = document.querySelectorAll('.offer__slide'),
        slider = document.querySelector('.offer__slider'),
        prev = document.querySelector('.offer__slider-prev'),
        next = document.querySelector('.offer__slider-next'),
        totalSlides = document.querySelector('#total'),
        currentSlide = document.querySelector('#current'),
        slidesWrapper = document.querySelector('.offer__slider-wrapper'),
        slidesField = document.querySelector('.offer__slider-inner'),
        width = window.getComputedStyle(slidesWrapper).width;
    let slideIndex = 1;
    let offset = 0;


    // FULL WIDTH

    if (slides.length < 10) {
        totalSlides.textContent = `0${slides.length}`;
    } else {
        totalSlides.textContent = slides.length;
    }
    slideIndexAddZero();

    slidesField.style.width = 100 * slides.length + '%';
    slidesField.style.display = 'flex';
    slidesField.style.transition = '0.5s all';

    slidesWrapper.style.overflow = 'hidden';

    slides.forEach(slide => {
        slide.style.width = width;
    });
    slider.style.position = 'relative';

    const dots = document.createElement('ol'),
        dotsArray = [];
    dots.classList.add('carousel-dots');
    slider.append(dots);

    for (let i = 0; i < slides.length; i++) {
        const dot = document.createElement('li');
        dot.classList.add('dot');
        dot.setAttribute('data-slide-to', i + 1);
        if (i == 0) {
            dot.classList.add('dot-active');
        }
        dots.append(dot);
        dotsArray.push(dot);
    }

    next.addEventListener('click', () => {
        slideSwitch('+');
        slideIndexAddZero();
        dotsSwitch();
    });

    prev.addEventListener('click', () => {
        slideSwitch('-');
        slideIndexAddZero();
        dotsSwitch();
    });

    dotsArray.forEach(dot => {
        dot.addEventListener('click', (e) => {
            const slideTo = e.target.getAttribute('data-slide-to');
            slideIndex = slideTo;
            offset = +width.slice(0, width.length - 2) * (slideTo - 1);
            slideIndexAddZero();
            dotsSwitch();
            slidesField.style.transform = `translateX(-${offset}px)`;

        });
    });

    function dotsSwitch() {
        dotsArray.forEach(dot => dot.classList.remove('dot-active'));
        dotsArray[slideIndex - 1].classList.add('dot-active');
    }

    function slideIndexAddZero() {
        if (slideIndex < 10) {
            currentSlide.textContent = `0${slideIndex}`;
        } else {
            currentSlide.textContent = slideIndex;
        }
    }

    function slideSwitch(symbol) {
        const offsetEnd = +deleteNotDigits(width) * (slides.length - 1);
        const offsetStep = +deleteNotDigits(width);

        if (symbol === '+') {
            if (offset == offsetEnd) {
                offset = 0;
            } else {
                offset += offsetStep;
            }
            if (slideIndex == slides.length) {
                slideIndex = 1;
            } else {
                slideIndex++;
            }
        } else if (symbol === '-') {
            if (offset == 0) {
                offset = offsetEnd;
            } else {
                offset -= offsetStep;
            }
            if (slideIndex == 1) {
                slideIndex = slides.length;
            } else {
                slideIndex--;
            }
        }
        slidesField.style.transform = `translateX(-${offset}px)`;
    }

    function deleteNotDigits(str) {
        return str.replace(/\D/g, '');
    }

    // END FULL WIDTH

    // ONE SLIDE

    // showSlides(slideIndex);
    // if (slides.length < 10) {
    //     totalSlides.textContent = `0${slides.length}`;
    // } else {
    //     totalSlides.textContent = slides.length;
    // }

    // function showSlides(n) {




    //     if (n > slides.length) {
    //         slideIndex = 1;
    //     }

    //     if (n < 1) {
    //         slideIndex = slides.length;
    //     }

    //     slides.forEach(item => {
    //         item.classList.add('hide');
    //     });
    //     slides[slideIndex - 1].classList.remove('hide');
    //     slides[slideIndex - 1].classList.add('show');

    //     if (n < 10) {
    //         currentSlide.textContent = `0${slideIndex}`;
    //     } else {
    //         currentSlide.textContent = slideIndex;
    //     }
    // }

    // function plusSlides(n) {
    //     showSlides(slideIndex += n);
    // }

    // prev.addEventListener('click', () => {
    //     plusSlides(-1);
    // });

    // next.addEventListener('click', () => {
    //     plusSlides(1);
    // });


    // END ONE SLIDE


    // Calculator

    const result = document.querySelector('.calculating__result span');

    let sex, height, weight, age, ratio;

    if (localStorage.getItem('sex')) {
        sex = localStorage.getItem('sex');
    } else {
        sex = 'female';
        localStorage.setItem('sex', 'female');
    }

    if (localStorage.getItem('ratio')) {
        ratio = localStorage.getItem('ratio');
    } else {
        ratio = 1.375;
        localStorage.setItem('ratio', 1.375);
    }

    function initLocalSettings(selector, activeClass) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(elem => {
            elem.classList.remove(activeClass);
            if (elem.getAttribute('data-ratio') === localStorage.getItem('ratio')) {
                elem.classList.add(activeClass);
            }
            if (elem.getAttribute('id') === localStorage.getItem('sex')) {
                elem.classList.add(activeClass);
            }
        });
    }
    initLocalSettings('#gender div', 'calculating__choose-item_active');
    initLocalSettings('.calculating__choose_big div', 'calculating__choose-item_active');

    function calcTotal() {
        if (!sex || !height || !weight || !age || !ratio) {
            result.textContent = '_____';
            return result;
        }

        if (sex === 'female') {
            result.textContent = Math.round((447.6 + (9.2 * weight) + (3.1 * height) - (4.3 * age)) * ratio);
        } else {
            result.textContent = Math.round((88.36 + (13.4 * weight) + (4.8 * height) - (5.7 * age)) * ratio);
        }
    }

    calcTotal();

    function getStaticInformation(selector, activeClass) {
        const elements = document.querySelectorAll(selector);

        elements.forEach(elem => {
            elem.addEventListener('click', (e) => {
                if (e.target.getAttribute('data-ratio')) {
                    ratio = +e.target.getAttribute('data-ratio');
                    localStorage.setItem('ratio', +e.target.getAttribute('data-ratio'));
                } else {
                    sex = e.target.getAttribute('id');
                    localStorage.setItem('sex', e.target.getAttribute('id'));
                }

                elements.forEach(el => {
                    el.classList.remove(activeClass);
                });

                e.target.classList.add(activeClass);
                calcTotal();
            });
        });
    }

    getStaticInformation('#gender div', 'calculating__choose-item_active');
    getStaticInformation('.calculating__choose_big div', 'calculating__choose-item_active');

    function getDynamicInformation(selector) {
        const input = document.querySelector(selector);
        input.addEventListener('input', () => {
            if (input.value.match(/\D/ig)) {
                input.classList.add('input__error');
            } else {
                input.classList.remove('input__error');
            }
            switch (input.getAttribute('id')) {
                case 'weight':
                    weight = +input.value;
                    break;
                case 'height':
                    height = +input.value;
                    break;
                case 'age':
                    age = +input.value;
                    break;
            }
            calcTotal();
        });
    }
    getDynamicInformation('#height');
    getDynamicInformation('#weight');
    getDynamicInformation('#age');
});