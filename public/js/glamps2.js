const glampsData = [
    {
        id: '1',
        name: "Шале у леса",
        description: "Ваш уединенный уголок на опушке. Идеальное место, чтобы отключиться от суеты и насладиться тишиной и покоем.",
        price_per_night: 8900,
        max_guests: 2,
        amenities: ["wifi", "parking", "fireplace"],
        images: ["/images/chaley-forest.jpg"],
        location: { city: "Красный двор" },
        type: "house"
    },
    {
        id: '2',
        name: "Сфера",
        description: "Ваш современный уголок с панорамным видом на звездное небо. Этот геодезический купол сочетает футуристичный дизайн и полное единение с природой.",
        price_per_night: 12400,
        max_guests: 3,
        amenities: ["wifi", "fireplace"],
        images: ["/images/sfera.jpg"],
        location: { city: "Красный двор" },
        type: "tent"
    },
    {
        id: '3',
        name: "Шатёр",
        description: "Настоящее приключение с комфортом. Отличный выбор для тех, кто ищет легкий и атмосферный формат глэмпинга.",
        price_per_night: 6800,
        max_guests: 4,
        amenities: ["wifi", "parking"],
        images: ["/images/chater.jpg"],
        location: { city: "Красный двор" },
        type: "house"
    },
    {
        id: '4',
        name: "Листовый покой",
        description: "Ваше убежище в глубине леса. Этот домик создан для тех, кто хочет полностью отключиться от забот и раствориться в природе.",
        price_per_night: 14500,
        max_guests: 6,
        amenities: ["wifi", "parking", "kitchen", "fireplace"],
        images: ["/images/listoviu-pokoy.jpg"],
        location: { city: "Красный двор" },
        type: "lodge"
    },
    {
        id: '5',
        name: "Лесная гавань",
        description: "Ваше убежище в глубине леса. Этот домик создан для тех, кто хочет полностью отключиться от забот и раствориться в природе.",
        price_per_night: 5200,
        max_guests: 2,
        amenities: ["wifi", "parking"],
        images: ["/images/lesnai-gavani.jpg"],
        location: { city: "Красный двор" },
        type: "tent"
    },
    {
        id: '6',
        name: "Избушка на опушке",
        description: "Сказочный домик из дерева с настоящей печкой или камином. Почувствуйте себя героем старой доброй сказки, где современный комфорт гармонично сочетается с духом традиции.",
        price_per_night: 4800,
        max_guests: 3,
        amenities: ["wifi", "fireplace", "kitchen"],
        images: ["/images/izbicka-na-opyske.jpg"],
        location: { city: "Красный двор" },
        type: "house"
    }
];

let bookingData = null;
let bookingNights = 0;

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

function displayBookingInfo() {
    bookingData = getBookingDataFromStorage();
    const infoBar = document.getElementById('bookingInfoBar');
    const infoContent = document.getElementById('bookingInfoContent');
    
    if (bookingData && bookingData.checkIn && bookingData.checkOut) {
        bookingNights = calculateNights(bookingData.checkIn, bookingData.checkOut);
        infoContent.innerHTML = `
            <div class="booking-info-item">
                <i class="fas fa-calendar-check"></i>
                <span>Заезд: <strong>${formatDate(bookingData.checkIn)}</strong></span>
            </div>
            <div class="booking-info-item">
                <i class="fas fa-calendar-times"></i>
                <span>Выезд: <strong>${formatDate(bookingData.checkOut)}</strong></span>
            </div>
            <div class="booking-info-item">
                <i class="fas fa-users"></i>
                <span>Гостей: <strong>${bookingData.guests || 2}</strong></span>
            </div>
            <div class="booking-info-item">
                <i class="fas fa-moon"></i>
                <span>Ночей: <strong>${bookingNights}</strong></span>
            </div>
            <div class="booking-info-item">
                <i class="fas fa-arrow-right"></i>
                <span>Показаны домики на <strong>${bookingData.guests || 2} гостей</strong></span>
            </div>
        `;
        infoBar.style.display = 'block';
    } else {
        infoBar.style.display = 'none';
    }
}

function renderGlamps(glamps) {
    const container = document.getElementById('glampsList');
    
    if (!glamps || glamps.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-tent"></i>
                <h3>Нет доступных домиков</h3>
                <p>Попробуйте изменить параметры поиска</p>
                <a href="/" class="btn btn-outline-warning mt-3">Вернуться на главную</a>
            </div>
        `;
        return;
    }

    container.innerHTML = glamps.map((glamp, index) => {
        return `
            <div class="chalet-card-wrapper" style="animation-delay: ${index * 0.1}s">
                <div class="chalet-image-side" style="background-image: url('${glamp.images[0]}'); background-size: cover; background-position: center;">
                </div>
                <div class="chalet-content-side">
                    <h2>${glamp.name}</h2>
                    <div class="chalet-description">
                        <p>${glamp.description}</p>
                    </div>
                    <div class="price-button-row">
                        <div class="price-per-night">
                            ${glamp.price_per_night.toLocaleString()} ₽ <small>/ночь</small>
                        </div>
                        <button class="chalet-button" onclick="bookNow('${glamp.id}')">Подробнее</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    setTimeout(() => {
        document.querySelectorAll('.chalet-card-wrapper').forEach(card => {
            card.classList.add('visible');
        });
    }, 100);
}

function bookNow(id) {
    const selectedGlamp = glampsData.find(g => g.id == id);
    if (selectedGlamp) {
        localStorage.setItem('selectedGlamp', JSON.stringify(selectedGlamp));
    }
    if (bookingData) {
        localStorage.setItem('glampingBooking', JSON.stringify(bookingData));
    }
   window.location.href = `/glamp-detail.html?id=${id}`;
}

function filterGlamps() {
    const type = document.getElementById('typeFilter').value;
    const guestsSelect = document.getElementById('guestsFilter').value;
    const priceSelect = document.getElementById('priceFilter').value;
    const amenitiesFilter = document.getElementById('amenitiesFilter').value;
    
    let filtered = [...glampsData];
    
    if (type !== 'all') {
        filtered = filtered.filter(g => g.type === type);
    }
    
    if (guestsSelect !== 'any') {
        const maxGuests = parseInt(guestsSelect);
        filtered = filtered.filter(g => g.max_guests <= maxGuests);
    } else if (bookingData && bookingData.guests) {
        filtered = filtered.filter(g => g.max_guests >= bookingData.guests);
    }
    
    if (priceSelect !== 'any') {
        const maxPrice = parseInt(priceSelect);
        filtered = filtered.filter(g => g.price_per_night <= maxPrice);
    }
    
    if (amenitiesFilter !== 'all') {
        filtered = filtered.filter(g => g.amenities && g.amenities.includes(amenitiesFilter));
    }
    
    renderGlamps(filtered);
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 Страница проживания загружена');
    
    displayBookingInfo();
    
    const typeFilter = document.getElementById('typeFilter');
    const guestsFilter = document.getElementById('guestsFilter');
    const priceFilter = document.getElementById('priceFilter');
    const amenitiesFilter = document.getElementById('amenitiesFilter');
    
    if (typeFilter) typeFilter.addEventListener('change', filterGlamps);
    if (guestsFilter) guestsFilter.addEventListener('change', filterGlamps);
    if (priceFilter) priceFilter.addEventListener('change', filterGlamps);
    if (amenitiesFilter) amenitiesFilter.addEventListener('change', filterGlamps);
    
    // Применяем фильтр при загрузке (если есть данные бронирования)
    if (bookingData && bookingData.guests) {
        filterGlamps();
    } else {
        renderGlamps(glampsData);
    }
    
    setTimeout(() => {
        document.querySelectorAll('.chalet-card-wrapper').forEach(card => {
            card.classList.add('visible');
        });
    }, 200);
});