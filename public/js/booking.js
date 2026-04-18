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
    
    document.getElementById('summaryNights').textContent = nights;
    document.getElementById('summaryCheckIn').textContent = formatDate(bookingData.checkIn);
    document.getElementById('summaryCheckOut').textContent = formatDate(bookingData.checkOut);
    document.getElementById('glampName').textContent = glampData.name;
    document.getElementById('glampPrice').textContent = glampData.price_per_night.toLocaleString();
    document.getElementById('glampGuests').innerHTML = `${bookingData.guests} взрослых`;
    document.getElementById('basePrice').textContent = glampTotal.toLocaleString();
    document.getElementById('totalPrice').textContent = totalPrice.toLocaleString();
    
    updatePaymentText();
}
function updatePaymentText() {
    const selectedPayment = document.querySelector('input[name="paymentType"]:checked').value;
    const totalPrice = parseInt(document.getElementById('totalPrice').textContent);
    
    if (selectedPayment === 'prepayment') {
        document.getElementById('paymentStatusText').innerHTML = `К оплате сейчас <span class="total-amount" id="totalPay">${totalPrice.toLocaleString()}</span> ₽`;
    } else {
        document.getElementById('paymentStatusText').innerHTML = `К оплате при заселении <span class="total-amount" id="totalPay">${totalPrice.toLocaleString()}</span> ₽`;
    }
}

function getFormData() {
    const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
    const isSelf = activeTab === 'self';
    
    const lastName = isSelf ? document.getElementById('selfLastName').value.trim() : document.getElementById('otherLastName').value.trim();
    const firstName = isSelf ? document.getElementById('selfFirstName').value.trim() : document.getElementById('otherFirstName').value.trim();
    const middleName = isSelf ? document.getElementById('selfMiddleName').value.trim() : document.getElementById('otherMiddleName').value.trim();
    const phone = isSelf ? document.getElementById('selfPhone').value.trim() : document.getElementById('otherPhone').value.trim();
    const email = isSelf ? document.getElementById('selfEmail').value.trim() : document.getElementById('otherEmail').value.trim();
    const birthDate = isSelf ? document.getElementById('selfBirthDate').value : document.getElementById('otherBirthDate').value;
    const citizenship = isSelf ? document.getElementById('selfCitizenship').value : document.getElementById('otherCitizenship').value;
    const smsConfirm = document.getElementById('smsConfirm').checked;
    const offersAgree = document.getElementById('offersAgree').checked;
    const privacyAgree = document.getElementById('privacyAgree').checked;
    const paymentType = document.querySelector('input[name="paymentType"]:checked').value;
    const selectedCard = document.getElementById('selectedCard').value;
    
    return {
        lastName, firstName, middleName, phone, email, birthDate, citizenship,
        smsConfirm, offersAgree, privacyAgree, isSelf, paymentType, selectedCard
    };
}

function validateForm(formData) {
    if (!formData.lastName || !formData.firstName || !formData.phone || !formData.email) {
        alert('Пожалуйста, заполните все обязательные поля (Фамилия, Имя, Телефон, Email)');
        return false;
    }
    
    if (!formData.email.includes('@')) {
        alert('Введите корректный email');
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
    console.log('🚀 Начинаем отправку бронирования...');
    
    const formData = getFormData();
    
    if (!validateForm(formData)) {
        return;
    }
    
    const bookingData = getBookingDataFromStorage();
    const glampData = getGlampDataFromStorage();
    const selectedServices = loadSelectedServices();
    
    if (!bookingData || !glampData) {
        alert('Ошибка: данные о бронировании не найдены');
        window.location.href = '/glamps.html';
        return;
    }
    
    const nights = calculateNights(bookingData.checkIn, bookingData.checkOut);
    const glampTotal = glampData.price_per_night * nights;
    const servicesTotal = selectedServices.reduce((sum, s) => sum + s.price, 0);
    const totalPrice = glampTotal + servicesTotal;
    
    const fullName = `${formData.lastName} ${formData.firstName} ${formData.middleName}`.trim();
    
    const paymentTypeText = formData.paymentType === 'prepayment' ? 'Полная предоплата' : 'Оплата после заселения';
    const paymentCard = formData.paymentType === 'prepayment' ? getCardName(formData.selectedCard) : 'Наличные/Карта при заселении';
    
    // Данные для отправки на сервер
    const bookingPayload = {
        glamp_id: glampData.id,
        user_name: fullName,
        user_email: formData.email,
        user_phone: formData.phone,
        user_comment: `Бронирование для ${formData.isSelf ? 'себя' : 'другого'}. Оплата: ${paymentTypeText}. ${formData.paymentType === 'prepayment' ? `Карта: ${paymentCard}` : 'Оплата на месте'}`,
        check_in: bookingData.checkIn,
        check_out: bookingData.checkOut,
        guests: bookingData.guests,
        nights: nights,
        total_price: totalPrice
    };
    
    console.log(' Отправляем запрос на сервер:', bookingPayload);
    
    try {
        // Отправляем запрос на сервер
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingPayload)
        });
        
        const result = await response.json();
        console.log('Ответ сервера:', result);
        
        if (result.success) {
            // Сохраняем в sessionStorage для страницы успеха
            sessionStorage.setItem('lastBooking', JSON.stringify({
                bookingId: result.data.id,
                glampName: glampData.name,
                checkIn: bookingData.checkIn,
                checkOut: bookingData.checkOut,
                guests: bookingData.guests,
                nights: nights,
                totalPrice: totalPrice,
                userName: fullName,
                paymentCard: paymentCard,
                paymentType: paymentTypeText
            }));
            
            // Очищаем временные данные
            localStorage.removeItem('glampingBooking');
            localStorage.removeItem('selectedGlamp');
            localStorage.removeItem('selectedServices');
            
            alert(' Бронирование успешно создано!');
            window.location.href = '/booking-success.html';
        } else {
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
            document.getElementById('selfTab').classList.remove('active');
            document.getElementById('otherTab').classList.remove('active');
            document.getElementById(`${tabId}Tab`).classList.add('active');
        });
    });
}

function initCardSelector() {
    const cardItems = document.querySelectorAll('.card-item');
    cardItems.forEach(card => {
        card.addEventListener('click', () => {
            cardItems.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            document.getElementById('selectedCard').value = card.getAttribute('data-card');
        });
    });
}

function initPaymentOptions() {
    const prepaymentOption = document.getElementById('prepaymentOption');
    const afterStayOption = document.getElementById('afterStayOption');
    const onlinePaymentBlock = document.getElementById('onlinePaymentBlock');
    const afterStayBlock = document.getElementById('afterStayBlock');
    
    prepaymentOption.addEventListener('click', () => {
        prepaymentOption.classList.add('selected');
        afterStayOption.classList.remove('selected');
        const radio = prepaymentOption.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
        onlinePaymentBlock.style.display = 'block';
        afterStayBlock.style.display = 'none';
        updatePaymentText();
    });
    
    afterStayOption.addEventListener('click', () => {
        afterStayOption.classList.add('selected');
        prepaymentOption.classList.remove('selected');
        const radio = afterStayOption.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
        onlinePaymentBlock.style.display = 'none';
        afterStayBlock.style.display = 'block';
        updatePaymentText();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    updateSummary();
    initTabs();
    initCardSelector();
    initPaymentOptions();
    document.getElementById('submitBookingBtn').addEventListener('click', submitBooking);
    
    const paymentRadios = document.querySelectorAll('input[name="paymentType"]');
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', updatePaymentText);
    });
});

function loadSelectedServices() {
    const selectedServices = JSON.parse(localStorage.getItem('selectedServices') || '[]');
    return selectedServices;
}

function displaySelectedServices() {
    const selectedServices = loadSelectedServices();
    const servicesContainer = document.getElementById('selectedServicesList');
    
    if (!servicesContainer) return;
    
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
    
    document.getElementById('basePrice').textContent = glampTotal.toLocaleString();
    document.getElementById('totalPrice').textContent = totalPrice.toLocaleString();
    document.getElementById('totalPay').textContent = totalPrice.toLocaleString();
    
    return totalPrice;
}