let glamps = [];
        let bookings = [];
        let users = [];
        let settings = {};
        let bookingsChart, popularityChart;

        function loadData() {
            glamps = JSON.parse(localStorage.getItem('glamping_glamps') || JSON.stringify([
                { id: 1, name: "Шале у леса", description: "Уютный домик в лесу", price: 8900, max_guests: 2, amenities: ["Камин", "Терраса"], city: "Сочи", address: "ул. Лесная", type: "house", image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600" },
                { id: 2, name: "Сфера", description: "Современный купол", price: 12400, max_guests: 3, amenities: ["Панорамный вид"], city: "Сочи", address: "ул. Горная", type: "tent", image: "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=600" },
                { id: 3, name: "Домик у озера", description: "Вид на озеро", price: 6800, max_guests: 4, amenities: ["Кухня", "Мангал"], city: "Сочи", address: "ул. Озерная", type: "house", image: "https://images.unsplash.com/photo-1445308394109-4ec2920981b1?w=600" },
                { id: 4, name: "Лодж Горный", description: "Просторный лодж", price: 14500, max_guests: 6, amenities: ["Сауна", "Бильярд"], city: "Красная Поляна", address: "ул. Горная", type: "lodge", image: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600" }
            ]));
            
            bookings = JSON.parse(localStorage.getItem('glamping_bookings') || JSON.stringify([
                { id: 1, glamp_id: 1, user_name: "Иван Петров", user_email: "ivan@mail.com", check_in: "2025-04-10", check_out: "2025-04-12", guests: 2, total_price: 17800, status: "confirmed", created_at: "2025-04-01" },
                { id: 2, glamp_id: 2, user_name: "Мария Смирнова", user_email: "maria@mail.com", check_in: "2025-04-15", check_out: "2025-04-17", guests: 2, total_price: 24800, status: "pending", created_at: "2025-04-02" }
            ]));
            
            users = JSON.parse(localStorage.getItem('glamping_users') || JSON.stringify([
                { id: 1, name: "Admin", email: "admin@glamptime.ru", role: "admin", created_at: "2025-01-01" }
            ]));
            
            settings = JSON.parse(localStorage.getItem('glamping_settings') || JSON.stringify({
                siteName: "GlampTime",
                adminEmail: "admin@glamptime.ru",
                adminPhone: "+7 (123) 456-78-90"
            }));
        }

        function saveData() {
            localStorage.setItem('glamping_glamps', JSON.stringify(glamps));
            localStorage.setItem('glamping_bookings', JSON.stringify(bookings));
            localStorage.setItem('glamping_users', JSON.stringify(users));
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

        function initCharts() {
            const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
            const monthlyBookings = new Array(12).fill(0);
            bookings.forEach(booking => { const month = new Date(booking.created_at).getMonth(); monthlyBookings[month]++; });
            if (bookingsChart) bookingsChart.destroy();
            bookingsChart = new Chart(document.getElementById('bookingsChart'), {
                type: 'line', data: { labels: months, datasets: [{ label: 'Бронирования', data: monthlyBookings, borderColor: '#ffd700', backgroundColor: 'rgba(255,215,0,0.1)', tension: 0.4, fill: true }] },
                options: { responsive: true, maintainAspectRatio: true }
            });
            
            const glampBookings = {};
            glamps.forEach(glamp => { glampBookings[glamp.name] = 0; });
            bookings.forEach(booking => { const glamp = glamps.find(g => g.id === booking.glamp_id); if (glamp) glampBookings[glamp.name]++; });
            if (popularityChart) popularityChart.destroy();
            popularityChart = new Chart(document.getElementById('popularityChart'), {
                type: 'pie', data: { labels: Object.keys(glampBookings), datasets: [{ data: Object.values(glampBookings), backgroundColor: ['#ffd700', '#28a745', '#17a2b8', '#dc3545'] }] },
                options: { responsive: true, maintainAspectRatio: true }
            });
        }

        function renderGlampsTable() {
            document.getElementById('glampsTable').innerHTML = `
                <table class="table"><thead><tr><th>ID</th><th>Название</th><th>Цена</th><th>Гости</th><th>Город</th><th>Действия</th></tr></thead>
                <tbody>${glamps.map(g => `<tr><td>${g.id}</td><td><strong>${g.name}</strong></td><td>${g.price.toLocaleString()} ₽</td><td>до ${g.max_guests}</td><td>${g.city}</td>
                <td><button class="btn-action btn-edit" onclick="editGlamp(${g.id})"><i class="fas fa-edit"></i></button><button class="btn-action btn-delete" onclick="deleteGlamp(${g.id})"><i class="fas fa-trash"></i></button></td></tr>`).join('')}</tbody></table>
            `;
        }

        function renderBookingsTable() {
            const getGlampName = (id) => glamps.find(g => g.id === id)?.name || 'Неизвестно';
            document.getElementById('bookingsTable').innerHTML = `
                <table class="table"><thead><tr><th>ID</th><th>Домик</th><th>Гость</th><th>Даты</th><th>Гости</th><th>Сумма</th><th>Статус</th><th>Действия</th></tr></thead>
                <tbody>${bookings.map(b => `<tr><td>${b.id}</td><td><strong>${getGlampName(b.glamp_id)}</strong></td><td>${b.user_name}<br><small>${b.user_email}</small></td>
                <td>${b.check_in} → ${b.check_out}</td><td>${b.guests}</td><td>${(b.total_price || 0).toLocaleString()} ₽</td>
                <td><span class="badge badge-${b.status}">${b.status === 'pending' ? 'Ожидание' : 'Подтверждено'}</span></td>
                <td><select onchange="updateBookingStatus(${b.id}, this.value)"><option value="pending" ${b.status === 'pending' ? 'selected' : ''}>Ожидание</option><option value="confirmed" ${b.status === 'confirmed' ? 'selected' : ''}>Подтвердить</option><option value="cancelled" ${b.status === 'cancelled' ? 'selected' : ''}>Отменить</option></select>
                <button class="btn-action btn-view" onclick="viewBooking(${b.id})"><i class="fas fa-eye"></i></button><button class="btn-action btn-delete" onclick="deleteBooking(${b.id})"><i class="fas fa-trash"></i></button></td></tr>`).join('')}</tbody></table>
            `;
        }

        function renderUsersTable() {
            document.getElementById('usersTable').innerHTML = `
                <table class="table"><thead><tr><th>ID</th><th>Имя</th><th>Email</th><th>Роль</th><th>Дата</th><th>Действия</th></tr></thead>
                <tbody>${users.map(u => `<tr><td>${u.id}</td><td><strong>${u.name}</strong></td><td>${u.email}</td><td><span class="badge badge-approved">${u.role === 'admin' ? 'Админ' : 'Пользователь'}</span></td>
                <td>${u.created_at}</td><td>${u.role !== 'admin' ? `<button class="btn-action btn-delete" onclick="deleteUser(${u.id})"><i class="fas fa-trash"></i></button>` : '-'}</td></tr>`).join('')}</tbody></table>
            `;
        }

        function renderRecentBookings() {
            const recent = [...bookings].reverse().slice(0, 5);
            const getGlampName = (id) => glamps.find(g => g.id === id)?.name || 'Неизвестно';
            document.getElementById('recentBookings').innerHTML = `
                <table class="table"><thead><tr><th>Домик</th><th>Гость</th><th>Даты</th><th>Сумма</th><th>Статус</th></tr></thead>
                <tbody>${recent.map(b => `<tr><td>${getGlampName(b.glamp_id)}</td><td>${b.user_name}</td><td>${b.check_in} → ${b.check_out}</td><td>${(b.total_price || 0).toLocaleString()} ₽</td>
                <td><span class="badge badge-${b.status}">${b.status === 'pending' ? 'Ожидание' : 'Подтверждено'}</span></td></tr>`).join('')}</tbody></table>
            `;
        }

        async function loadReviewsForAdmin() {
            try {
                const response = await fetch('/api/admin/reviews');
                const result = await response.json();
                console.log('Загружено отзывов:', result.data?.length);
                if (result.success && result.data) {
                    renderReviewsTable(result.data);
                } else {
                    document.getElementById('reviewsTable').innerHTML = '<div style="padding: 2rem; text-align: center;">Нет отзывов в базе данных</div>';
                }
            } catch (error) {
                console.error('Ошибка загрузки отзывов:', error);
                document.getElementById('reviewsTable').innerHTML = '<div style="padding: 2rem; text-align: center;">Ошибка загрузки отзывов</div>';
            }
        }

        function renderReviewsTable(reviews) {
            const getStatusBadge = (status) => {
                switch(status) {
                    case 'approved': return '<span class="badge badge-approved">✓ Одобрен</span>';
                    case 'pending': return '<span class="badge badge-pending">⏳ На модерации</span>';
                    case 'rejected': return '<span class="badge badge-rejected">✗ Отклонен</span>';
                    default: return '<span class="badge badge-pending">⏳ На модерации</span>';
                }
            };
            
            const getRatingStars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating);
            
            const html = `
                <table class="table">
                    <thead><tr><th>ID</th><th>Автор</th><th>Оценка</th><th>Отзыв</th><th>Дата</th><th>Статус</th><th>Действия</th></tr></thead>
                    <tbody>
                        ${reviews.length === 0 ? `<tr><td colspan="7" style="text-align: center;">Нет отзывов</td></tr>` : 
                            reviews.map(review => `
                                <tr>
                                    <td>${review.id}</td>
                                    <td><strong>${escapeHtml(review.user_name)}</strong><br><small>${escapeHtml(review.user_email)}</small></td>
                                    <td><span style="color: #ffd700;">${getRatingStars(review.rating)}</span></td>
                                    <td>${escapeHtml(review.review_text.substring(0, 150))}${review.review_text.length > 150 ? '...' : ''}</td>
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
                    loadReviewsForAdmin();
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
                    loadReviewsForAdmin();
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

        function editGlamp(id) {
            const glamp = glamps.find(g => g.id === id);
            if (glamp) {
                document.getElementById('modalTitle').textContent = 'Редактировать домик';
                document.getElementById('glampId').value = glamp.id;
                document.getElementById('glampName').value = glamp.name;
                document.getElementById('glampDescription').value = glamp.description;
                document.getElementById('glampPrice').value = glamp.price;
                document.getElementById('glampMaxGuests').value = glamp.max_guests;
                document.getElementById('glampAmenities').value = glamp.amenities.join(', ');
                document.getElementById('glampCity').value = glamp.city;
                document.getElementById('glampAddress').value = glamp.address;
                document.getElementById('glampType').value = glamp.type;
                document.getElementById('glampImage').value = glamp.image || '';
                document.getElementById('glampModal').style.display = 'flex';
            }
        }

        function deleteGlamp(id) {
            if (confirm('Удалить этот домик?')) {
                glamps = glamps.filter(g => g.id !== id);
                bookings = bookings.filter(b => b.glamp_id !== id);
                saveData();
                refreshAll();
                showNotification('Домик удален');
            }
        }

        function deleteBooking(id) {
            if (confirm('Удалить бронирование?')) {
                bookings = bookings.filter(b => b.id !== id);
                saveData();
                refreshAll();
                showNotification('Бронирование удалено');
            }
        }

        function deleteUser(id) {
            if (confirm('Удалить пользователя?')) {
                users = users.filter(u => u.id !== id);
                saveData();
                refreshAll();
                showNotification('Пользователь удален');
            }
        }

        function updateBookingStatus(id, status) {
            const booking = bookings.find(b => b.id === id);
            if (booking) {
                booking.status = status;
                saveData();
                refreshAll();
                showNotification(`Статус изменен на ${status === 'confirmed' ? 'Подтверждено' : status === 'cancelled' ? 'Отменено' : 'Ожидание'}`);
            }
        }

        function viewBooking(id) {
            const booking = bookings.find(b => b.id === id);
            const glamp = glamps.find(g => g.id === booking.glamp_id);
            alert(`Детали бронирования #${booking.id}\n\nДомик: ${glamp?.name}\nГость: ${booking.user_name}\nEmail: ${booking.user_email}\nДаты: ${booking.check_in} — ${booking.check_out}\nГостей: ${booking.guests}\nСумма: ${(booking.total_price || 0).toLocaleString()} ₽`);
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

        function saveSettings() {
            settings.siteName = document.getElementById('siteName').value;
            settings.adminEmail = document.getElementById('adminEmail').value;
            settings.adminPhone = document.getElementById('adminPhone').value;
            localStorage.setItem('glamping_settings', JSON.stringify(settings));
            showNotification('Настройки сохранены');
        }

        function refreshAll() {
            updateStats();
            renderGlampsTable();
            renderBookingsTable();
            renderUsersTable();
            renderRecentBookings();
            initCharts();
        }

        document.getElementById('glampForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const id = parseInt(document.getElementById('glampId').value);
            const glampData = {
                id: id || Date.now(),
                name: document.getElementById('glampName').value,
                description: document.getElementById('glampDescription').value,
                price: parseInt(document.getElementById('glampPrice').value),
                max_guests: parseInt(document.getElementById('glampMaxGuests').value),
                amenities: document.getElementById('glampAmenities').value.split(',').map(a => a.trim()),
                city: document.getElementById('glampCity').value,
                address: document.getElementById('glampAddress').value,
                type: document.getElementById('glampType').value,
                image: document.getElementById('glampImage').value || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600'
            };
            if (id) {
                const index = glamps.findIndex(g => g.id === id);
                glamps[index] = glampData;
                showNotification('Домик обновлен');
            } else {
                glamps.push(glampData);
                showNotification('Домик добавлен');
            }
            saveData();
            refreshAll();
            closeModal();
        });

        document.querySelectorAll('.admin-menu a[data-tab]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = link.getAttribute('data-tab');
                document.querySelectorAll('.admin-menu a').forEach(a => a.classList.remove('active'));
                link.classList.add('active');
                document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
                document.getElementById(`${tab}Tab`).style.display = 'block';
                const titles = { dashboard: 'Панель управления', glamps: 'Управление домиками', bookings: 'Управление бронированиями', users: 'Пользователи', settings: 'Настройки', reviews: 'Управление отзывами' };
                document.getElementById('pageTitle').textContent = titles[tab];
                if (tab === 'dashboard') initCharts();
                if (tab === 'reviews') loadReviewsForAdmin();
            });
        });

        
        loadData();
        refreshAll();


        