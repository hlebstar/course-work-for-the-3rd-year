 document.addEventListener('DOMContentLoaded', () => {
            const bookingData = sessionStorage.getItem('lastBooking');
            
            if (bookingData) {
                const data = JSON.parse(bookingData);
                
                if (data.paymentType === 'Оплата после заселения') {
                    document.getElementById('successMessage').innerHTML = 'Бронирование подтверждено! Ожидайте заселения';
                    document.getElementById('cashNotice').style.display = 'block';
                }
                
                document.getElementById('paymentInfo').innerHTML = `
                    <p><i class="fas fa-credit-card"></i> <strong>Способ оплаты: ${data.paymentType}</strong></p>
                    <p>${data.paymentType === 'Полная предоплата' ? `Карта: ${data.paymentCard}` : 'Оплата на месте при выезде'}</p>
                `;
                
                document.getElementById('bookingDetails').innerHTML = `
                    <p><strong>Номер бронирования:</strong> <span class="booking-id">#${data.bookingId}</span></p>
                    <p><strong>Домик:</strong> ${data.glampName}</p>
                    <p><strong>Даты:</strong> ${new Date(data.checkIn).toLocaleDateString('ru-RU')} — ${new Date(data.checkOut).toLocaleDateString('ru-RU')}</p>
                    <p><strong>Гостей:</strong> ${data.guests}</p>
                    <p><strong>Ночей:</strong> ${data.nights}</p>
                    <p><strong>Сумма:</strong> ${data.totalPrice.toLocaleString()} ₽</p>
                    <p><strong>Гость:</strong> ${data.userName}</p>
                `;
                sessionStorage.removeItem('lastBooking');
            } else {
                document.getElementById('bookingDetails').innerHTML = '<p>Данные о бронировании не найдены</p>';
            }
        });