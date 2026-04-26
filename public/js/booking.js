function getBookingDataFromStorage() {
    const data = localStorage.getItem('glampingBooking');
    if (data) {
        try {
            return JSON.parse(data);
        } catch(e) {
            return null;
        }
    }
    return null;
}

function getGlampDataFromStorage() {
    const data = localStorage.getItem('selectedGlamp');
    if (data) {
        try {
            return JSON.parse(data);
        } catch(e) {
            return null;
        }
    }
    return null;
}

function calculateNights(checkIn, checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function formatDate(dateString) {
    if (!dateString) return 'не выбрано';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function saveBookingToLocalStorage(booking) {
    let bookings = JSON.parse(localStorage.getItem('admin_bookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('admin_bookings', JSON.stringify(bookings));
}

function updateSummary() {
    const bookingData = getBookingDataFromStorage();
    const glampData = getGlampDataFromStorage();
    
    if (!bookingData || !glampData) {
        window.location.href = '/glamps.html';
        return;
    }
    
    const nights = calculateNights(bookingData.checkIn, bookingData.checkOut);
    const glampTotal = glampData.price_per_night * nights;
    const servicesTotal = displaySelectedServices();
    const totalPrice = glampTotal + servicesTotal;
    
    const summaryNights = document.getElementById('summaryNights');
    const summaryCheckIn = document.getElementById('summaryCheckIn');
    const summaryCheckOut = document.getElementById('summaryCheckOut');
    const glampName = document.getElementById('glampName');
    const glampPrice = document.getElementById('glampPrice');
    const glampGuests = document.getElementById('glampGuests');
    const basePrice = document.getElementById('basePrice');
    const totalPriceEl = document.getElementById('totalPrice');
    
    if (summaryNights) summaryNights.textContent = nights;
    if (summaryCheckIn) summaryCheckIn.textContent = formatDate(bookingData.checkIn);
    if (summaryCheckOut) summaryCheckOut.textContent = formatDate(bookingData.checkOut);
    if (glampName) glampName.textContent = glampData.name;
    if (glampPrice) glampPrice.textContent = glampData.price_per_night.toLocaleString();
    if (glampGuests) glampGuests.innerHTML = `${bookingData.guests} взрослых`;
    if (basePrice) basePrice.textContent = glampTotal.toLocaleString();
    if (totalPriceEl) totalPriceEl.textContent = totalPrice.toLocaleString();
    
    updatePaymentText();
}

function updatePaymentText() {
    const selectedPaymentRadio = document.querySelector('input[name="paymentType"]:checked');
    const totalPriceEl = document.getElementById('totalPrice');
    const paymentStatusText = document.getElementById('paymentStatusText');
    
    if (!selectedPaymentRadio || !totalPriceEl || !paymentStatusText) {
        console.warn('Элементы оплаты не найдены на странице');
        return;
    }
    
    const selectedPayment = selectedPaymentRadio.value;
    const totalPrice = parseInt(totalPriceEl.textContent) || 0;
    const totalPaySpan = document.querySelector('#paymentStatusText .total-amount');
    
    if (selectedPayment === 'prepayment') {
        paymentStatusText.innerHTML = `К оплате сейчас <span class="total-amount" id="totalPay">${totalPrice.toLocaleString()}</span> ₽`;
    } else {
        paymentStatusText.innerHTML = `К оплате при заселении <span class="total-amount" id="totalPay">${totalPrice.toLocaleString()}</span> ₽`;
    }
}

function getFormData() {
    const formData = {};
    
    const activeTab = document.querySelector('.tab-btn.active');
    const isSelfTab = activeTab && activeTab.getAttribute('data-tab') === 'self';
    
    // Получаем значения в зависимости от активной вкладки
    if (isSelfTab) {
        formData.lastName = document.getElementById('selfLastName')?.value || '';
        formData.firstName = document.getElementById('selfFirstName')?.value || '';
        formData.middleName = document.getElementById('selfMiddleName')?.value || '';
        formData.phone = document.getElementById('selfPhone')?.value || '';
        formData.email = document.getElementById('selfEmail')?.value || '';
        formData.birthDate = document.getElementById('selfBirthDate')?.value || '';
        formData.citizenship = document.getElementById('selfCitizenship')?.value || 'RU';
        formData.isSelf = true;
    } else {
        formData.lastName = document.getElementById('otherLastName')?.value || '';
        formData.firstName = document.getElementById('otherFirstName')?.value || '';
        formData.middleName = document.getElementById('otherMiddleName')?.value || '';
        formData.phone = document.getElementById('otherPhone')?.value || '';
        formData.email = document.getElementById('otherEmail')?.value || '';
        formData.birthDate = document.getElementById('otherBirthDate')?.value || '';
        formData.citizenship = document.getElementById('otherCitizenship')?.value || 'RU';
        formData.isSelf = false;
    }
    
    const paymentTypeRadio = document.querySelector('input[name="paymentType"]:checked');
    formData.paymentType = paymentTypeRadio ? paymentTypeRadio.value : 'prepayment';
    
    // Выбранная карта
    const selectedCardInput = document.getElementById('selectedCard');
    formData.selectedCard = selectedCardInput ? selectedCardInput.value : 'sber';
    
    // Согласия
    const privacyAgree = document.getElementById('privacyAgree');
    formData.privacyAgree = privacyAgree ? privacyAgree.checked : false;
    
    const offersAgree = document.getElementById('offersAgree');
    formData.offersAgree = offersAgree ? offersAgree.checked : false;
    
    console.log(' Собранные данные формы:', formData);
    return formData;
}

function validateForm(formData) {
    if (!formData.lastName || !formData.firstName || !formData.phone || !formData.email) {
        let missingFields = [];
        if (!formData.lastName) missingFields.push('Фамилия');
        if (!formData.firstName) missingFields.push('Имя');
        if (!formData.phone) missingFields.push('Телефон');
        if (!formData.email) missingFields.push('Email');
        alert(`Пожалуйста, заполните все обязательные поля: ${missingFields.join(', ')}`);
        return false;
    }
    
    if (!formData.email.includes('@')) {
        alert('Введите корректный email (например: name@mail.ru)');
        return false;
    }
    
    if (!formData.privacyAgree) {
        alert('Пожалуйста, подтвердите согласие на обработку персональных данных');
        return false;
    }
    
    return true;
}

function getCardName(cardValue) {
    const cards = {
        'sber': 'Сбербанк',
        'tinkoff': 'Тинькофф',
        'yandex': 'Яндекс.Деньги',
        'visa': 'Visa',
        'mastercard': 'Mastercard',
        'mir': 'МИР'
    };
    return cards[cardValue] || cardValue;
}

async function submitBooking() {
    console.log(' Начинаем отправку бронирования...');
    
    const formData = getFormData();
    
    if (!validateForm(formData)) {
        return;
    }
    
    const bookingData = getBookingDataFromStorage();
    const glampData = getGlampDataFromStorage();
    
    if (!bookingData || !glampData) {
        alert('Ошибка: данные о бронировании не найдены');
        window.location.href = '/glamps.html';
        return;
    }
    
    const nights = calculateNights(bookingData.checkIn, bookingData.checkOut);
    const totalPrice = glampData.price_per_night * nights;
    const fullName = `${formData.lastName} ${formData.firstName} ${formData.middleName || ''}`.trim();
   const bookingPayload = {
    user_name: fullName,
    user_email: formData.email,
    user_phone: formData.phone,
    glamp_name: glampData.name,
    glamp_price: glampData.price_per_night,
    check_in: bookingData.checkIn,
    check_out: bookingData.checkOut,
    guests: bookingData.guests,
    total_price: totalPrice
};
    
    console.log(' Отправляем запрос на сервер:', bookingPayload);
    
    try {
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingPayload)
        });
        
        const text = await response.text();
        console.log('Ответ сервера (текст):', text);
        
        let result;
        try {
            result = JSON.parse(text);
        } catch(e) {
            result = { success: false, error: text };
        }
        
        if (result.success) {
   const bookingInfo = {
        bookingId: result.data.id,
        glampName: glampData.name,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: bookingData.guests,
        nights: nights,
        totalPrice: totalPrice,
        userName: fullName
    };
    sessionStorage.setItem('lastBooking', JSON.stringify(bookingInfo));
    
    alert(' Бронирование успешно создано!');
    window.location.href = '/booking-success.html';
}else {
            alert(' Ошибка: ' + (result.error || 'Не удалось создать бронирование'));
        }
    } catch (error) {
        console.error(' Ошибка при отправке:', error);
        alert('Ошибка соединения с сервером. Попробуйте позже.');
    }
}

function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const tabId = tab.getAttribute('data-tab');
            const selfTab = document.getElementById('selfTab');
            const otherTab = document.getElementById('otherTab');
            
            if (selfTab) selfTab.classList.remove('active');
            if (otherTab) otherTab.classList.remove('active');
            
            if (tabId === 'self' && selfTab) selfTab.classList.add('active');
            if (tabId === 'other' && otherTab) otherTab.classList.add('active');
        });
    });
}

function initCardSelector() {
    const cardItems = document.querySelectorAll('.card-item');
    const selectedCardInput = document.getElementById('selectedCard');
    
    cardItems.forEach(card => {
        card.addEventListener('click', () => {
            cardItems.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            if (selectedCardInput) {
                selectedCardInput.value = card.getAttribute('data-card');
            }
        });
    });
}

function initPaymentOptions() {
    const prepaymentOption = document.getElementById('prepaymentOption');
    const afterStayOption = document.getElementById('afterStayOption');
    const onlinePaymentBlock = document.getElementById('onlinePaymentBlock');
    const afterStayBlock = document.getElementById('afterStayBlock');
    
    if (prepaymentOption) {
        prepaymentOption.addEventListener('click', () => {
            prepaymentOption.classList.add('selected');
            if (afterStayOption) afterStayOption.classList.remove('selected');
            const radio = prepaymentOption.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
            if (onlinePaymentBlock) onlinePaymentBlock.style.display = 'block';
            if (afterStayBlock) afterStayBlock.style.display = 'none';
            updatePaymentText();
        });
    }
    
    if (afterStayOption) {
        afterStayOption.addEventListener('click', () => {
            afterStayOption.classList.add('selected');
            if (prepaymentOption) prepaymentOption.classList.remove('selected');
            const radio = afterStayOption.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
            if (onlinePaymentBlock) onlinePaymentBlock.style.display = 'none';
            if (afterStayBlock) afterStayBlock.style.display = 'block';
            updatePaymentText();
        });
    }
}

function loadSelectedServices() {
    const selectedServices = JSON.parse(localStorage.getItem('selectedServices') || '[]');
    return selectedServices;
}

function displaySelectedServices() {
    const selectedServices = loadSelectedServices();
    const servicesContainer = document.getElementById('selectedServicesList');
    
    if (!servicesContainer) return 0;
    
    if (selectedServices.length === 0) {
        servicesContainer.innerHTML = '<p style="color: rgba(255,255,255,0.5);">Нет добавленных услуг</p>';
        return 0;
    }
    
    let servicesTotal = 0;
    servicesContainer.innerHTML = selectedServices.map(service => {
        servicesTotal += service.price;
        return `
            <div class="date-info" style="margin-bottom: 0.5rem;">
                <span><i class="fas fa-spa"></i> ${service.name}</span>
                <strong>${service.price.toLocaleString()} ₽</strong>
            </div>
        `;
    }).join('');
    
    return servicesTotal;
}

function updateTotalWithServices() {
    const bookingData = getBookingDataFromStorage();
    const glampData = getGlampDataFromStorage();
    
    if (!bookingData || !glampData) return;
    
    const nights = calculateNights(bookingData.checkIn, bookingData.checkOut);
    const glampTotal = glampData.price_per_night * nights;
    const servicesTotal = displaySelectedServices();
    const totalPrice = glampTotal + (servicesTotal || 0);
    
    const basePrice = document.getElementById('basePrice');
    const totalPriceEl = document.getElementById('totalPrice');
    const totalPay = document.getElementById('totalPay');
    
    if (basePrice) basePrice.textContent = glampTotal.toLocaleString();
    if (totalPriceEl) totalPriceEl.textContent = totalPrice.toLocaleString();
    if (totalPay) totalPay.textContent = totalPrice.toLocaleString();
    
    return totalPrice;
}

// Инициализация страницы
document.addEventListener('DOMContentLoaded', () => {
    updateSummary();
    initTabs();
    initCardSelector();
    initPaymentOptions();
    
    const submitBtn = document.getElementById('submitBookingBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitBooking);
    }
    
    const paymentRadios = document.querySelectorAll('input[name="paymentType"]');
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', updatePaymentText);
    });
});