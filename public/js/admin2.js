let glamps = [];
let bookings = [];
let users = [];
let settings = {};
let bookingsChart, popularityChart;

async function loadData() {
    try {
        // Загружаем домики из БД
        const glampsRes = await fetch('/api/glamps');
        const glampsResult = await glampsRes.json();
        if (glampsResult.success && glampsResult.data) {
            glamps = glampsResult.data;
        } else {
            glamps = [];
        }
        
        // Загружаем бронирования из БД
        const bookingsRes = await fetch('/api/bookings');
        const bookingsResult = await bookingsRes.json();
        if (bookingsResult.success && bookingsResult.data) {
            bookings = bookingsResult.data;
        } else {
            bookings = [];
        }
        
        // Загружаем настройки
        settings = JSON.parse(localStorage.getItem('glamping_settings') || JSON.stringify({
            siteName: "GlampTime",
            adminEmail: "admin@glamptime.ru",
            adminPhone: "+7 (123) 456-78-90"
        }));
        
        // Очищаем тестовых пользователей из localStorage
        const testUsers = JSON.parse(localStorage.getItem('glamping_users') || '[]');
        if (testUsers.length > 0) {
            const realUsers = testUsers.filter(u => u.role === 'admin' || u.name === 'Admin');
            localStorage.setItem('glamping_users', JSON.stringify(realUsers));
        }
        
        users = [{ id: 1, name: "Admin", email: "admin@glamptime.ru", role: "admin", created_at: new Date().toISOString() }];
        
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        glamps = [];
        bookings = [];
        users = [{ id: 1, name: "Admin", email: "admin@glamptime.ru", role: "admin", created_at: new Date().toISOString() }];
    }
}

function showNotification(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.background = type === 'success' ? '#28a745' : '#dc3545';
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function updateStats() {
    const totalGlamps = glamps.length;
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    
    document.getElementById('statsGrid').innerHTML = `
        <div class="stat-card"><div class="stat-header"><div class="stat-icon"><i class="fas fa-home"></i></div></div>
        <div class="stat-value">${totalGlamps}</div><div class="stat-label">Всего домиков</div></div>
        <div class="stat-card"><div class="stat-header"><div class="stat-icon"><i class="fas fa-calendar-check"></i></div></div>
        <div class="stat-value">${totalBookings}</div><div class="stat-label">Всего бронирований</div></div>
        <div class="stat-card"><div class="stat-header"><div class="stat-icon"><i class="fas fa-ruble-sign"></i></div></div>
        <div class="stat-value">${totalRevenue.toLocaleString()} ₽</div><div class="stat-label">Общая выручка</div></div>
        <div class="stat-card"><div class="stat-header"><div class="stat-icon"><i class="fas fa-clock"></i></div></div>
        <div class="stat-value">${pendingBookings}</div><div class="stat-label">Ожидают подтверждения</div>
        <div class="stat-change positive">Подтверждено: ${confirmedBookings}</div></div>
    `;
}

// Графики из API
async function initCharts() {
    const ctx1 = document.getElementById('bookingsChart')?.getContext('2d');
    const ctx2 = document.getElementById('popularityChart')?.getContext('2d');
    
    if (!ctx1 || !ctx2) return;
    
    try {
        const response = await fetch('/api/charts-data');
        const result = await response.json();
        
        if (result.success && result.data) {
            const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
            const monthlyData = new Array(12).fill(0);
            
            if (result.data.bookingsByMonth && result.data.bookingsByMonth.length > 0) {
                result.data.bookingsByMonth.forEach(item => {
                    const monthIndex = parseInt(item.month) - 1;
                    if (monthIndex >= 0 && monthIndex < 12) {
                        monthlyData[monthIndex] = parseInt(item.count);
                    }
                });
            }
            
            if (bookingsChart) bookingsChart.destroy();
            bookingsChart = new Chart(ctx1, {
                type: 'line',
                data: {
                    labels: months,
                    datasets: [{
                        label: 'Бронирования',
                        data: monthlyData,
                        borderColor: '#a3e635',
                        backgroundColor: 'rgba(163, 230, 53, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#a3e635',
                        pointBorderColor: '#fff',
                        pointRadius: 4
                    }]
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: true,
                    plugins: { legend: { labels: { color: '#fff' } } },
                    scales: {
                        y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#fff' } },
                        x: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#fff' } }
                    }
                }
            });
            
            let glampNames = [];
            let glampCounts = [];
            
            if (result.data.popularGlamps && result.data.popularGlamps.length > 0) {
                glampNames = result.data.popularGlamps.map(g => g.name);
                glampCounts = result.data.popularGlamps.map(g => parseInt(g.bookings_count));
            }
            
            if (popularityChart) popularityChart.destroy();
            popularityChart = new Chart(ctx2, {
                type: 'pie',
                data: {
                    labels: glampNames.length ? glampNames : ['Нет данных'],
                    datasets: [{
                        data: glampNames.length ? glampCounts : [1],
                        backgroundColor: ['#a3e635', '#84cc16', '#65a30d', '#4d7c0f', '#3f6212', '#22c55e', '#16a34a', '#15803d']
                    }]
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: true,
                    plugins: { legend: { position: 'right', labels: { color: '#fff', font: { size: 11 } } } }
                }
            });
        }
    } catch (error) {
        console.error('Ошибка загрузки графиков:', error);
    }
}

function renderGlampsTable() {
    const tableHtml = `
        <table class="table">
            <thead>
                <tr><th>ID</th><th>Название</th><th>Цена (₽/ночь)</th><th>Макс. гостей</th><th>Город</th><th>Действия</th></tr>
            </thead>
            <tbody>
                ${glamps.map(g => `
                    <tr>
                        <td>${g.id}</td>
                        <td><strong>${escapeHtml(g.name)}</strong></td>
                        <td>${(g.price_per_night || 0).toLocaleString()} ₽</td>
                        <td>${g.max_guests || 2}</td>
                        <td>${escapeHtml(g.city || '—')}</td>
                        <td>
                            <button class="btn-action btn-edit" onclick="editGlamp(${g.id})"><i class="fas fa-edit"></i> Редакт.</button>
                            <button class="btn-action btn-delete" onclick="deleteGlamp(${g.id})"><i class="fas fa-trash"></i> Удалить</button>
                        </td>
                    </tr>
                `).join('')}
                ${glamps.length === 0 ? '<tr><td colspan="6" style="text-align: center;">Нет домиков</td>' : ''}
            </tbody>
        </table>
    `;
    document.getElementById('glampsTable').innerHTML = tableHtml;
}

function renderBookingsTable() {
    const getGlampName = (id) => {
        const glamp = glamps.find(g => g.id === id);
        return glamp ? glamp.name : 'Неизвестно';
    };
    
    const tableHtml = `
        <table class="table">
            <thead>
                <tr><th>ID</th><th>Домик</th><th>Гость</th><th>Даты</th><th>Гостей</th><th>Сумма</th><th>Статус</th><th>Действия</th></tr>
            </thead>
            <tbody>
                ${bookings.map(b => `
                    <tr>
                        <td>${b.id}</td>
                        <td><strong>${escapeHtml(getGlampName(b.glamp_id))}</strong></td>
                        <td>${escapeHtml(b.user_name)}<br><small>${escapeHtml(b.user_email || '')}</small></td>
                        <td>${b.check_in || '—'} → ${b.check_out || '—'}</td>
                        <td>${b.guests || 1}</td>
                        <td>${(b.total_price || 0).toLocaleString()} ₽</td>
                        <td>
                            <select class="status-select" data-id="${b.id}" data-status="${b.status}">
                                <option value="pending" ${b.status === 'pending' ? 'selected' : ''}>⏳ Ожидание</option>
                                <option value="confirmed" ${b.status === 'confirmed' ? 'selected' : ''}>✓ Подтверждено</option>
                                <option value="cancelled" ${b.status === 'cancelled' ? 'selected' : ''}>✗ Отменено</option>
                            </select>
                        </td>
                        <td>
                            <button class="btn-action btn-view" onclick="viewBooking(${b.id})"><i class="fas fa-eye"></i></button>
                            <button class="btn-action btn-delete" onclick="deleteBooking(${b.id})"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `).join('')}
                ${bookings.length === 0 ? '<tr><td colspan="8" style="text-align: center;">Нет бронирований</td>' : ''}
            </tbody>
        </table>
    `;
    document.getElementById('bookingsTable').innerHTML = tableHtml;
    
    document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', async (e) => {
            const id = parseInt(select.dataset.id);
            const newStatus = select.value;
            await updateBookingStatus(id, newStatus);
        });
    });
}

function renderRecentBookings() {
    const recent = [...bookings].reverse().slice(0, 5);
    const getGlampName = (id) => {
        const glamp = glamps.find(g => g.id === id);
        return glamp ? glamp.name : 'Неизвестно';
    };
    
    const getStatusBadge = (status) => {
        switch(status) {
            case 'confirmed': return '<span class="badge badge-confirmed">✓ Подтверждено</span>';
            case 'pending': return '<span class="badge badge-pending"> Ожидание</span>';
            case 'cancelled': return '<span class="badge badge-cancelled">✗ Отменено</span>';
            default: return '<span class="badge badge-pending"> Ожидание</span>';
        }
    };
    
    const tableHtml = `
        <table class="table">
            <thead><tr><th>Домик</th><th>Гость</th><th>Даты</th><th>Сумма</th><th>Статус</th></tr></thead>
            <tbody>
                ${recent.map(b => `
                    <tr>
                        <td><strong>${escapeHtml(getGlampName(b.glamp_id))}</strong></td>
                        <td>${escapeHtml(b.user_name)}</td>
                        <td>${b.check_in || '—'} → ${b.check_out || '—'}</td>
                        <td>${(b.total_price || 0).toLocaleString()} ₽</td>
                        <td>${getStatusBadge(b.status)}</td>
                    </tr>
                `).join('')}
                ${recent.length === 0 ? '<tr><td colspan="5" style="text-align: center;">Нет бронирований</td>' : ''}
            </tbody>
        </table>
    `;
    document.getElementById('recentBookings').innerHTML = tableHtml;
}

async function updateBookingStatus(id, status) {
    try {
        const response = await fetch(`/api/bookings/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        
        if (response.ok) {
            showNotification(`Статус изменен на ${status === 'confirmed' ? 'Подтверждено' : status === 'cancelled' ? 'Отменено' : 'Ожидание'}`, 'success');
            await refreshAll();
        } else {
            showNotification('Ошибка при изменении статуса', 'error');
        }
    } catch (error) {
        showNotification('Ошибка соединения', 'error');
    }
}

async function deleteBooking(id) {
    if (!confirm('Удалить это бронирование?')) return;
    try {
        const response = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
        if (response.ok) {
            showNotification('Бронирование удалено', 'success');
            await refreshAll();
        } else {
            showNotification('Ошибка при удалении', 'error');
        }
    } catch (error) {
        showNotification('Ошибка соединения', 'error');
    }
}

async function deleteGlamp(id) {
    if (!confirm('Удалить этот домик?')) return;
    try {
        const response = await fetch(`/api/glamps/${id}`, { method: 'DELETE' });
        if (response.ok) {
            showNotification('Домик удален', 'success');
            await refreshAll();
        } else {
            showNotification('Ошибка при удалении', 'error');
        }
    } catch (error) {
        showNotification('Ошибка соединения', 'error');
    }
}

function editGlamp(id) {
    const glamp = glamps.find(g => g.id === id);
    if (glamp) {
        document.getElementById('modalTitle').textContent = 'Редактировать домик';
        document.getElementById('glampId').value = glamp.id;
        document.getElementById('glampName').value = glamp.name || '';
        document.getElementById('glampDescription').value = glamp.description || '';
        document.getElementById('glampPrice').value = glamp.price_per_night || '';
        document.getElementById('glampMaxGuests').value = glamp.max_guests || 2;
        document.getElementById('glampAmenities').value = (glamp.amenities || []).join(', ');
        document.getElementById('glampCity').value = glamp.city || '';
        document.getElementById('glampAddress').value = glamp.address || '';
        document.getElementById('glampType').value = glamp.type || 'house';
        document.getElementById('glampImage').value = glamp.image_url || glamp.image || '';
        document.getElementById('glampModal').style.display = 'flex';
    }
}

function viewBooking(id) {
    const booking = bookings.find(b => b.id === id);
    if (!booking) {
        showNotification('Бронирование не найдено', 'error');
        return;
    }
    const glamp = glamps.find(g => g.id === booking.glamp_id);
    alert(` Детали бронирования #${booking.id}\n\n 
        Домик: ${glamp?.name || 'Неизвестно'}\n
         Гость: ${booking.user_name}\n
         Email: ${booking.user_email || '—'}
         \nЗаезд: ${booking.check_in}\n
         Выезд: ${booking.check_out}\n
         Гостей: ${booking.guests}\n
         Сумма: ${(booking.total_price || 0).toLocaleString()} ₽\n
          Статус: ${booking.status === 'confirmed' ? 'Подтверждено' : booking.status === 'cancelled' ? 'Отменено' : 'Ожидание'}`);
}

function openGlampModal() {
    document.getElementById('modalTitle').textContent = 'Добавить домик';
    document.getElementById('glampForm').reset();
    document.getElementById('glampId').value = '';
    document.getElementById('glampModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('glampModal').style.display = 'none';
}

async function loadReviewsForAdmin() {
    try {
        const response = await fetch('/api/admin/reviews');
        const result = await response.json();
        if (result.success && result.data) {
            renderReviewsTable(result.data);
        } else {
            document.getElementById('reviewsTable').innerHTML = '<div style="padding: 2rem; text-align: center;">Нет отзывов в базе данных</div>';
        }
    } catch (error) {
        console.error('Ошибка загрузки отзывов:', error);
        document.getElementById('reviewsTable').innerHTML = '<div style="padding: 2rem; text-align: center;"> Ошибка загрузки отзывов</div>';
    }
}

function renderReviewsTable(reviews) {
    const getStatusBadge = (status) => {
        switch(status) {
            case 'approved': return '<span class="badge badge-confirmed">✓ Одобрен</span>';
            case 'pending': return '<span class="badge badge-pending"> На модерации</span>';
            case 'rejected': return '<span class="badge badge-cancelled">✗ Отклонен</span>';
            default: return '<span class="badge badge-pending"> На модерации</span>';
        }
    };
    
    const getRatingStars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating);
    
    const html = `
        <table class="table">
            <thead>
                <tr><th>ID</th><th>Автор</th><th>Оценка</th><th>Отзыв</th><th>Дата</th><th>Статус</th><th>Действия</th></tr>
            </thead>
            <tbody>
                ${reviews.length === 0 ? 
                    `<tr><td colspan="7" style="text-align: center;">Нет отзывов</td>` : 
                    reviews.map(review => `
                        <tr>
                            <td>${review.id}</td>
                            <td><strong>${escapeHtml(review.user_name)}</strong><br><small>${escapeHtml(review.user_email)}</small></td>
                            <td><span style="color: #ffd700;">${getRatingStars(review.rating)}</span></td>
                            <td>${escapeHtml((review.review_text || '').substring(0, 150))}${(review.review_text || '').length > 150 ? '...' : ''}</td>
                            <td>${new Date(review.created_at).toLocaleDateString('ru-RU')}</td>
                            <td>${getStatusBadge(review.status)}</td>
                            <td>
                                ${review.status !== 'rejected' ? `<button class="btn-action btn-view" onclick="rejectReview(${review.id})">✗ Отклонить</button>` : ''}
                                <button class="btn-action btn-delete" onclick="deleteReview(${review.id})">🗑 Удалить</button>
                            </td>
                        </tr>
                    `).join('')
                }
            </tbody>
        </table>
    `;
    document.getElementById('reviewsTable').innerHTML = html;
}

async function rejectReview(id) {
    try {
        const response = await fetch(`/api/admin/reviews/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'rejected' })
        });
        if (response.ok) {
            showNotification('Отзыв отклонен', 'success');
            await loadReviewsForAdmin();
        } else {
            showNotification('Ошибка при отклонении', 'error');
        }
    } catch (error) {
        showNotification('Ошибка соединения', 'error');
    }
}

async function deleteReview(id) {
    if (!confirm('Удалить этот отзыв?')) return;
    try {
        const response = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
        if (response.ok) {
            showNotification('Отзыв удален', 'success');
            await loadReviewsForAdmin();
        } else {
            showNotification('Ошибка при удалении', 'error');
        }
    } catch (error) {
        showNotification('Ошибка соединения', 'error');
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function refreshAll() {
    await loadData();
    updateStats();
    renderGlampsTable();
    renderBookingsTable();
    renderRecentBookings();
    await initCharts();
}


document.getElementById('glampForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const glampData = {
        name: document.getElementById('glampName').value.trim(),
        description: document.getElementById('glampDescription').value.trim(),
        price_per_night: parseInt(document.getElementById('glampPrice').value),
        max_guests: parseInt(document.getElementById('glampMaxGuests').value),
        amenities: document.getElementById('glampAmenities').value.split(',').map(a => a.trim()).filter(a => a),
        city: document.getElementById('glampCity').value.trim(),
        address: document.getElementById('glampAddress').value.trim(),
        type: document.getElementById('glampType').value,
        image_url: document.getElementById('glampImage').value.trim() || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600'
    };
    
    if (!glampData.name || !glampData.price_per_night || !glampData.max_guests) {
        showNotification('Заполните все обязательные поля', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/glamps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(glampData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Домик успешно добавлен!', 'success');
            await refreshAll();
            closeModal();
        } else {
            showNotification('Ошибка: ' + (result.error || 'Не удалось добавить домик'), 'error');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('Ошибка соединения с сервером', 'error');
    }
});


// ДОБАВЛЕНИЕ ДОМИКА В БАЗУ ДАННЫХ 
const glampForm = document.getElementById('glampForm');
if (glampForm) {
    glampForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Проверяем существование полей с защитой от null
        const nameInput = document.getElementById('glampName');
        const priceInput = document.getElementById('glampPrice');
        const maxGuestsInput = document.getElementById('glampMaxGuests');
        const descriptionInput = document.getElementById('glampDescription');
        const amenitiesInput = document.getElementById('glampAmenities');
        const cityInput = document.getElementById('glampCity');
        const addressInput = document.getElementById('glampAddress');
        const typeSelect = document.getElementById('glampType');
        const imageInput = document.getElementById('glampImage');
        const glampIdInput = document.getElementById('glampId');
        
        if (!nameInput || !priceInput || !maxGuestsInput) {
            showNotification('Ошибка: не найдены поля формы', 'error');
            return;
        }
        
        const glampData = {
            name: nameInput.value?.trim() || '',
            description: descriptionInput?.value?.trim() || '',
            price_per_night: parseInt(priceInput.value) || 0,
            max_guests: parseInt(maxGuestsInput.value) || 0,
            amenities: amenitiesInput?.value?.split(',').map(a => a.trim()).filter(a => a) || [],
            city: cityInput?.value?.trim() || '',
            address: addressInput?.value?.trim() || '',
            type: typeSelect?.value || 'house',
            image_url: imageInput?.value?.trim() || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600'
        };
        
        // Валидация
        if (!glampData.name) {
            showNotification('Введите название домика', 'error');
            return;
        }
        
        if (!glampData.price_per_night || glampData.price_per_night <= 0) {
            showNotification('Введите корректную цену', 'error');
            return;
        }
        
        if (!glampData.max_guests || glampData.max_guests <= 0) {
            showNotification('Введите корректное количество гостей', 'error');
            return;
        }
        
        try {
            showNotification('Сохранение домика...', 'success');
            
            const response = await fetch('/api/glamps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(glampData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('Домик успешно добавлен!', 'success');
                await refreshAll();
                closeModal();
                if (glampForm) glampForm.reset();
                if (glampIdInput) glampIdInput.value = '';
            } else {
                showNotification('Ошибка: ' + (result.error || 'Не удалось добавить домик'), 'error');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            showNotification('Ошибка соединения с сервером', 'error');
        }
    });
}


// Навигация по вкладкам
document.querySelectorAll('.admin-menu a[data-tab]').forEach(link => {
    link.addEventListener('click', async (e) => {
        e.preventDefault();
        const tab = link.getAttribute('data-tab');
        document.querySelectorAll('.admin-menu a').forEach(a => a.classList.remove('active'));
        link.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
        const tabElement = document.getElementById(`${tab}Tab`);
        if (tabElement) tabElement.style.display = 'block';
        
        const titles = { dashboard: 'Панель управления', glamps: 'Управление домиками', bookings: 'Управление бронированиями', settings: 'Настройки', reviews: 'Управление отзывами' };
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) pageTitle.textContent = titles[tab] || tab;
        
        if (tab === 'dashboard') await initCharts();
        if (tab === 'reviews') await loadReviewsForAdmin();
    });
});

refreshAll();