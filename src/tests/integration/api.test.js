const http = require('http');

const API_URL = 'http://localhost:3000';

// Вспомогательная функция для запросов
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
                    const json = JSON.parse(body);
                    resolve({ status: res.statusCode, data: json });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });
        
        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

describe('Интеграционные тесты API', () => {
    
    test('GET /api/glamps - получение списка всех домиков', async () => {
        const response = await makeRequest('GET', '/api/glamps');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(Array.isArray(response.data.data)).toBe(true);
        expect(response.data.data.length).toBeGreaterThan(0);
        
        const firstGlamp = response.data.data[0];
        expect(firstGlamp).toHaveProperty('id');
        expect(firstGlamp).toHaveProperty('name');
        expect(firstGlamp).toHaveProperty('price_per_night');
        expect(firstGlamp).toHaveProperty('max_guests');
    });
    
    test('GET /api/glamps/:id - получение конкретного домика', async () => {
        const response = await makeRequest('GET', '/api/glamps/1');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('id', 1);
        expect(response.data.data).toHaveProperty('name');
        expect(response.data.data).toHaveProperty('description');
        expect(response.data.data).toHaveProperty('price_per_night');
        expect(response.data.data).toHaveProperty('amenities');
    });
    
    test('GET /api/glamps/:id - несуществующий домик возвращает 404', async () => {
        const response = await makeRequest('GET', '/api/glamps/999');
        
        expect(response.status).toBe(404);
        expect(response.data.success).toBe(false);
        expect(response.data.error).toBe('Домик не найден');
    });
    
    
    test('GET /api/services - получение списка всех услуг', async () => {
        const response = await makeRequest('GET', '/api/services');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(Array.isArray(response.data.data)).toBe(true);
        expect(response.data.data.length).toBeGreaterThan(0);
        
        const firstService = response.data.data[0];
        expect(firstService).toHaveProperty('id');
        expect(firstService).toHaveProperty('name');
        expect(firstService).toHaveProperty('price');
        expect(firstService).toHaveProperty('category');
    });
    
    test('GET /api/services/:id - получение конкретной услуги', async () => {
        const response = await makeRequest('GET', '/api/services/1');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('id');
        expect(response.data.data).toHaveProperty('name');
        expect(response.data.data).toHaveProperty('price');
    });
    
    
    test('GET /api/reviews - получение одобренных отзывов', async () => {
        const response = await makeRequest('GET', '/api/reviews');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(Array.isArray(response.data.data)).toBe(true);
        
        if (response.data.data.length > 0) {
            const firstReview = response.data.data[0];
            expect(firstReview).toHaveProperty('user_name');
            expect(firstReview).toHaveProperty('rating');
            expect(firstReview).toHaveProperty('review_text');
        }
    });
    
    test('GET /api/reviews/stats - получение статистики отзывов', async () => {
        const response = await makeRequest('GET', '/api/reviews/stats');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('total');
        expect(response.data.data).toHaveProperty('avgRating');
        expect(typeof response.data.data.total).toBe('number');
        expect(typeof response.data.data.avgRating).toBe('string');
    });
    
    
    test('GET /api/stats - получение общей статистики', async () => {
        const response = await makeRequest('GET', '/api/stats');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('totalGlamps');
        expect(response.data.data).toHaveProperty('totalBookings');
        expect(response.data.data).toHaveProperty('totalServices');
        expect(response.data.data).toHaveProperty('totalRevenue');
        expect(response.data.data).toHaveProperty('pendingBookings');
        
        expect(typeof response.data.data.totalGlamps).toBe('number');
        expect(typeof response.data.data.totalRevenue).toBe('number');
    });
    
    
    test('POST /api/bookings - создание нового бронирования', async () => {
        const bookingData = {
            glamp_id: 1,
            user_name: 'Интеграционный Тест',
            user_email: 'integration@test.com',
            user_phone: '+79991234567',
            check_in: '2025-06-01',
            check_out: '2025-06-03',
            guests: 2,
            nights: 2,
            total_price: 17800
        };
        
        const response = await makeRequest('POST', '/api/bookings', bookingData);
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('id');
        expect(response.data.data).toHaveProperty('glamp_id', 1);
        expect(response.data.data).toHaveProperty('user_name', 'Интеграционный Тест');
        expect(response.data.data).toHaveProperty('status', 'confirmed');
    });
    
    test('POST /api/bookings - валидация обязательных полей', async () => {
        const invalidData = {
            glamp_id: 1,
            user_name: 'Тест'
        };
        
        const response = await makeRequest('POST', '/api/bookings', invalidData);
        
        expect(response.status).toBe(500); 
    });
    
    
    test('POST /api/auth/register - регистрация нового пользователя', async () => {
        const uniqueEmail = `test_${Date.now()}@example.com`;
        const userData = {
            username: `testuser_${Date.now()}`,
            email: uniqueEmail,
            password: 'test123456',
            full_name: 'Тестовый Пользователь',
            phone: '+79991234567'
        };
        
        const response = await makeRequest('POST', '/api/auth/register', userData);
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.user).toHaveProperty('username', userData.username);
        expect(response.data.user).toHaveProperty('email', userData.email);
    });
    
    test('POST /api/auth/login - вход существующего пользователя', async () => {
        const loginData = {
            username: 'admin',
            password: 'admin123'
        };
        
        const response = await makeRequest('POST', '/api/auth/login', loginData);
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.user).toHaveProperty('username', 'admin');
        expect(response.data.user).toHaveProperty('role', 'admin');
    });
    
    test('POST /api/auth/login - неверные учетные данные', async () => {
        const loginData = {
            username: 'admin',
            password: 'wrongpassword'
        };
        
        const response = await makeRequest('POST', '/api/auth/login', loginData);
        
        expect(response.status).toBe(401);
        expect(response.data.success).toBe(false);
        expect(response.data.error).toBe('Неверное имя пользователя или пароль');
    });
});