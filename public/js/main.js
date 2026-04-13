const API_URL = '/api/v1';

// Загрузка популярных домов для главной страницы
async function loadPopularGlamps() {
    try {
        const response = await fetch(`${API_URL}/glamps?limit=3`);
        const data = await response.json();
        
        const container = document.getElementById('popular-glamps');
        if (!container) return;
        
        if (data.success && data.data && data.data.length > 0) {
            container.innerHTML = '';
            
            data.data.forEach(glamp => {
                container.innerHTML += `
                    <div class="col-md-4 mb-4">
                        <div class="card h-100">
                            <img src="${glamp.images && glamp.images[0] ? glamp.images[0] : 'https://via.placeholder.com/400x250'}" 
                                 class="card-img-top" alt="${glamp.name}">
                            <div class="card-body">
                                <h5 class="card-title">${glamp.name}</h5>
                                <p class="card-text">${glamp.description ? glamp.description.substring(0, 100) : 'Описание отсутствует'}...</p>
                                <p class="h5 text-success">${glamp.price_per_night || 0} ₽ <small class="text-muted">/ ночь</small></p>
                                <p><i class="fas fa-users"></i> до ${glamp.max_guests || 2} гостей</p>
                                <a href="/glamp-detail.html?id=${glamp.id}" class="btn btn-primary">Подробнее</a>
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            container.innerHTML = '<div class="col-12"><div class="alert alert-info">Нет доступных домов</div></div>';
        }
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        const container = document.getElementById('popular-glamps');
        if (container) {
            container.innerHTML = '<div class="col-12"><div class="alert alert-danger">Ошибка загрузки данных</div></div>';
        }
    }
}

// Загрузка всех домов
async function loadAllGlamps() {
    const container = document.getElementById('all-glamps');
    if (!container) return;
    
    try {
        const response = await fetch(`${API_URL}/glamps`);
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
            container.innerHTML = '';
            
            data.data.forEach(glamp => {
                container.innerHTML += `
                    <div class="col-md-4 mb-4">
                        <div class="card h-100">
                            <img src="${glamp.images && glamp.images[0] ? glamp.images[0] : 'https://via.placeholder.com/400x250'}" 
                                 class="card-img-top" alt="${glamp.name}">
                            <div class="card-body">
                                <h5 class="card-title">${glamp.name}</h5>
                                <p class="card-text">${glamp.description ? glamp.description.substring(0, 100) : 'Описание отсутствует'}...</p>
                                <div class="mb-2">
                                    <i class="fas fa-star text-warning"></i> ${glamp.rating || 0} 
                                    (${glamp.total_reviews || 0} отзывов)
                                </div>
                                <p class="h5 text-success">${glamp.price_per_night || 0} ₽ <small class="text-muted">/ ночь</small></p>
                                <p><i class="fas fa-users"></i> до ${glamp.max_guests || 2} гостей</p>
                                <a href="/glamp-detail.html?id=${glamp.id}" class="btn btn-primary w-100 mt-2">Подробнее</a>
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            container.innerHTML = '<div class="col-12"><div class="alert alert-info">Нет доступных домов</div></div>';
        }
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        container.innerHTML = '<div class="col-12"><div class="alert alert-danger">Ошибка загрузки данных</div></div>';
    }
}

// Фильтрация домов
async function filterGlamps(location, guests, maxPrice) {
    const container = document.getElementById('all-glamps');
    if (!container) return;
    
    try {
        let url = `${API_URL}/glamps?`;
        if (location) url += `location=${location}&`;
        if (guests) url += `guests=${guests}&`;
        if (maxPrice) url += `maxPrice=${maxPrice}&`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
            container.innerHTML = '';
            
            data.data.forEach(glamp => {
                container.innerHTML += `
                    <div class="col-md-4 mb-4">
                        <div class="card h-100">
                            <img src="${glamp.images && glamp.images[0] ? glamp.images[0] : 'https://via.placeholder.com/400x250'}" 
                                 class="card-img-top" alt="${glamp.name}">
                            <div class="card-body">
                                <h5 class="card-title">${glamp.name}</h5>
                                <p class="card-text">${glamp.description ? glamp.description.substring(0, 100) : 'Описание отсутствует'}...</p>
                                <p class="h5 text-success">${glamp.price_per_night || 0} ₽ <small class="text-muted">/ ночь</small></p>
                                <a href="/glamp-detail.html?id=${glamp.id}" class="btn btn-primary w-100 mt-2">Подробнее</a>
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            container.innerHTML = '<div class="col-12"><div class="alert alert-info">Дома не найдены</div></div>';
        }
    } catch (error) {
        console.error('Ошибка фильтрации:', error);
        container.innerHTML = '<div class="col-12"><div class="alert alert-danger">Ошибка загрузки данных</div></div>';
    }
}

// Загрузка деталей дома
async function loadGlampDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const glampId = urlParams.get('id');
    
    if (!glampId) return;
    
    try {
        const response = await fetch(`${API_URL}/glamps/${glampId}`);
        const data = await response.json();
        
        if (data.success && data.data) {
            const glamp = data.data;
            displayGlampDetails(glamp);
        }
    } catch (error) {
        console.error('Ошибка загрузки деталей:', error);
    }
}

// Отображение деталей дома
function displayGlampDetails(glamp) {
    const container = document.getElementById('glamp-details');
    if (!container) return;
    
    container.innerHTML = `
        <div class="row">
            <div class="col-lg-8">
                <img src="${glamp.images && glamp.images[0] ? glamp.images[0] : 'https://via.placeholder.com/800x500'}" 
                     class="img-fluid rounded mb-4" alt="${glamp.name}">
                <h1>${glamp.name}</h1>
                <p class="lead">${glamp.description}</p>
                
                <h3 class="mt-4">Удобства</h3>
                <ul class="list-unstyled">
                    ${glamp.amenities && glamp.amenities.length > 0 ? 
                        glamp.amenities.map(a => `<li><i class="fas fa-check text-success"></i> ${a}</li>`).join('') : 
                        '<li>Информация об удобствах отсутствует</li>'}
                </ul>
            </div>
            <div class="col-lg-4">
                <div class="booking-form">
                    <h3>${glamp.price_per_night || 0} ₽ <small class="text-muted">/ ночь</small></h3>
                    <form id="bookingForm">
                        <div class="mb-3">
                            <label class="form-label">Дата заезда</label>
                            <input type="date" class="form-control" id="checkIn" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Дата выезда</label>
                            <input type="date" class="form-control" id="checkOut" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Количество гостей</label>
                            <input type="number" class="form-control" id="guests" min="1" max="${glamp.max_guests || 10}" required>
                        </div>
                        <button type="submit" class="btn btn-primary w-100">Забронировать</button>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Обработчик бронирования
    document.getElementById('bookingForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Функция бронирования будет доступна после авторизации');
    });
}

// Загрузка отзывов
async function loadReviews() {
    const container = document.getElementById('reviews');
    if (!container) return;
    
    const reviews = [
        { name: 'Анна', rating: 5, text: 'Отличное место для отдыха! Домик чистый и уютный, природа прекрасная.' },
        { name: 'Михаил', rating: 4, text: 'Очень понравилось! Персонал приветливый, есть всё необходимое.' },
        { name: 'Екатерина', rating: 5, text: 'Шикарный вид из окна! Обязательно вернемся ещё!' }
    ];
    
    container.innerHTML = reviews.map(review => `
        <div class="col-md-4 mb-4">
            <div class="review-card">
                <i class="fas fa-quote-left text-success mb-2"></i>
                <p>${review.text}</p>
                <div class="mb-2">
                    ${Array(review.rating).fill('<i class="fas fa-star text-warning"></i>').join('')}
                    ${Array(5-review.rating).fill('<i class="far fa-star text-warning"></i>').join('')}
                </div>
                <strong>- ${review.name}</strong>
            </div>
        </div>
    `).join('');
}

async function submitContactForm(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('name')?.value,
        email: document.getElementById('email')?.value,
        message: document.getElementById('message')?.value
    };
    
    alert('Сообщение отправлено! Мы свяжемся с вами в ближайшее время.');
    event.target.reset();
}