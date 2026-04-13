const servicesData = {
    spa: {
        id: 1,
        title: "СПА",
        icon: "fas fa-spa",
        description: "Погрузитесь в мир релаксации и восстановления. Наши SPA-процедуры помогут снять стресс, расслабить мышцы и восстановить энергию после активного дня.",
        details: [
            { label: "Длительность", value: "от 60 минут" },
            { label: "Время работы", value: "10:00 - 22:00" },
            { label: "Включено", value: "Полотенца, чай, ароматерапия" }
        ],
        price: 2500,
        image: "https://i.ytimg.com/vi/IEAU3_rSNgQ/maxresdefault.jpg"
    },
    transfer: {
        id: 2,
        title: "Трансфер",
        icon: "fas fa-car",
        description: "Комфортабельные автомобили для ваших поездок. Встреча в аэропорту, трансфер до глэмпинга, экскурсии по окрестностям.",
        details: [
            { label: "Типы авто", value: "Business, Premium, Минивэн" },
            { label: "Время работы", value: "Круглосуточно" },
            { label: "Включено", value: "Вода, Wi-Fi, детское кресло" }
        ],
        price: 1500,
        image: "/images/photo_2026-04-10_09-41-17.jpg"
    },
    restaurant: {
        id: 3,
        title: "Ресторан",
        icon: "fas fa-utensils",
        description: "Изысканная кухня от шеф-повара. Блюда из свежих локальных продуктов, авторские десерты, винная карта.",
        details: [
            { label: "Часы работы", value: "08:00 - 23:00" },
            { label: "Кухня", value: "Европейская, Русская" },
            { label: "Особенности", value: "Детское меню, вегетарианское меню" }
        ],
        price: 1000,
        image: "https://avatars.mds.yandex.net/i?id=453e8b3abbcfcc77a9cc91e271ec1b61_l-5233341-images-thumbs&n=13"
    },
    events: {
        id: 4,
        title: "Мероприятия",
        icon: "fas fa-calendar-alt",
        description: "Организуем ваш праздник на высшем уровне. Дни рождения, свадьбы, корпоративы - мы создадим незабываемую атмосферу.",
        details: [
            { label: "Вместимость", value: "до 100 человек" },
            { label: "Длительность", value: "по запросу" },
            { label: "Включено", value: "Декор, ведущий, кейтеринг" }
        ],
        price: 15000,
        image: "https://avatars.mds.yandex.net/i?id=094dfda851be67a0658d9a0cba607037_l-4534759-images-thumbs&n=13"
    },
    animals: {
        id: 5,
        title: "Животные",
        icon: "fas fa-paw",
        description: "Конные прогулки по живописным местам, фотосессии с животными, кормление и уход. Отличное развлечение для детей и взрослых.",
        details: [
            { label: "Длительность", value: "от 30 минут" },
            { label: "Время работы", value: "10:00 - 18:00" },
            { label: "Животные", value: "Лошади, козы, кролики" }
        ],
        price: 1000,
        image: "https://avatars.mds.yandex.net/i?id=023e86e944e1739ee1177a359d726ae1_l-12422010-images-threads&n=13"
    },
    active: {
        id: 6,
        title: "Активный отдых",
        icon: "fas fa-bicycle",
        description: "Пешие и велосипедные экскурсии, квадроциклы, рыбалка, йога на свежем воздухе.",
        details: [
            { label: "Длительность", value: "от 1 часа" },
            { label: "Время работы", value: "09:00 - 19:00" },
            { label: "Снаряжение", value: "Предоставляется" }
        ],
        price: 1500,
        image: "https://avatars.mds.yandex.net/i?id=512c545ecc0235053225673ed68635d3_l-2447388-images-thumbs&n=13"
    }
};

// Функция открытия модального окна
function openModal(serviceId) {
    const service = servicesData[serviceId];
    if (!service) return;

    const modalContent = `
        <div class="modal-icon">
            <i class="${service.icon}"></i>
        </div>
        <h2 class="modal-title">${service.title}</h2>
        <div class="modal-description">
            ${service.description}
        </div>
        <div class="modal-details">
            ${service.details.map(detail => `
                <div class="modal-detail-item">
                    <span>${detail.label}</span>
                    <strong>${detail.value}</strong>
                </div>
            `).join('')}
        </div>
        <div class="modal-price">
            ${service.price.toLocaleString()} ₽
        </div>
        <button class="modal-btn" onclick="addServiceToBooking(${service.id}, '${service.title}', ${service.price})">
            Забронировать услугу
        </button>
    `;

    document.getElementById('modalContent').innerHTML = modalContent;
    document.getElementById('serviceModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('serviceModal').style.display = 'none';
}

// Добавление услуги в бронирование
function addServiceToBooking(serviceId, serviceName, servicePrice) {
    let selectedServices = JSON.parse(localStorage.getItem('selectedServices') || '[]');
    
    if (selectedServices.some(s => s.id === serviceId)) {
        alert('Эта услуга уже добавлена в бронирование');
        closeModal();
        return;
    }
    
    selectedServices.push({
        id: serviceId,
        name: serviceName,
        price: servicePrice,
        quantity: 1
    });
    
    localStorage.setItem('selectedServices', JSON.stringify(selectedServices));
    
    alert(` Услуга "${serviceName}" добавлена в бронирование!\n\nСтоимость: ${servicePrice.toLocaleString()} ₽\n\nПерейдите на страницу бронирования для оформления.`);
    
    closeModal();
}

document.getElementById('serviceModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});