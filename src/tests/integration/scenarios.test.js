const http = require('http');

function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: data ? { 'Content-Type': 'application/json' } : {}
        };
        
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

describe('Сценарии использования API', () => {
    
    test('Сценарий: Пользователь бронирует домик', async () => {
        const glampsRes = await makeRequest('GET', '/api/glamps');
        expect(glampsRes.status).toBe(200);
        const glampId = glampsRes.data.data[0].id;
        
        const booking = {
            glamp_id: glampId,
            user_name: 'Сценарий Тест',
            user_email: 'scenario@test.com',
            user_phone: '+79991234567',
            check_in: '2025-08-01',
            check_out: '2025-08-03',
            guests: 2,
            nights: 2,
            total_price: 17800
        };
        const bookingRes = await makeRequest('POST', '/api/bookings', booking);
        expect(bookingRes.status).toBe(200);
        const bookingId = bookingRes.data.data.id;
        
        const allBookings = await makeRequest('GET', '/api/bookings');
        const found = allBookings.data.data.find(b => b.id === bookingId);
        expect(found).toBeDefined();
    });
    
    test('Сценарий: Пользователь оставляет отзыв после проживания', async () => {
        const review = {
            user_name: 'Сценарий Отзыв',
            user_email: 'review@test.com',
            rating: 5,
            review_text: 'Отличный отдых! Всё понравилось!',
            glamp_id: 1
        };
        
        const reviewRes = await makeRequest('POST', '/api/reviews', review);
        expect(reviewRes.status).toBe(200);
        expect(reviewRes.data.success).toBe(true);
    });
    
    test('Сценарий: Админ просматривает статистику', async () => {
        const statsRes = await makeRequest('GET', '/api/stats');
        
        expect(statsRes.status).toBe(200);
        expect(statsRes.data.data).toHaveProperty('totalGlamps');
        expect(statsRes.data.data).toHaveProperty('totalBookings');
        expect(statsRes.data.data).toHaveProperty('totalRevenue');
    });
});