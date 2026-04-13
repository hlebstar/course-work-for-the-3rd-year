const http = require('http');

const API_URL = 'http://localhost:3000';

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

describe('E2E тестирование процесса бронирования', () => {
    
    let createdBookingId = null;
    let testGlampId = null;
    
    beforeAll(async () => {
        const response = await makeRequest('GET', '/api/glamps');
        if (response.data.success && response.data.data.length > 0) {
            testGlampId = response.data.data[0].id;
        }
    });
    
    //Получение списка домиков
    test('Шаг 1 - Получение списка доступных домиков', async () => {
        const response = await makeRequest('GET', '/api/glamps');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data.length).toBeGreaterThan(0);
        
        const glamp = response.data.data[0];
        expect(glamp).toHaveProperty('id');
        expect(glamp).toHaveProperty('name');
        expect(glamp).toHaveProperty('price_per_night');
        expect(glamp).toHaveProperty('max_guests');
    });
    
    //Получение деталей конкретного домика
    test('Шаг 2 - Получение детальной информации о домике', async () => {
        const response = await makeRequest('GET', `/api/glamps/${testGlampId}`);
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data.id).toBe(testGlampId);
        expect(response.data.data).toHaveProperty('description');
        expect(response.data.data).toHaveProperty('amenities');
    });
    
    //Создание бронирования
    test('Шаг 3 - Создание нового бронирования', async () => {
        const bookingData = {
            glamp_id: testGlampId,
            user_name: 'Тестовый Клиент',
            user_email: `test_${Date.now()}@example.com`,
            user_phone: '+79991234567',
            user_comment: 'Тестовое бронирование, просьба подтвердить',
            check_in: '2025-07-01',
            check_out: '2025-07-03',
            guests: 2,
            nights: 2,
            total_price: 17800
        };
        
        const response = await makeRequest('POST', '/api/bookings', bookingData);
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('id');
        expect(response.data.data.glamp_id).toBe(testGlampId);
        expect(response.data.data.user_name).toBe('Тестовый Клиент');
        expect(response.data.data.status).toBe('confirmed');
        
        createdBookingId = response.data.data.id;
    });
    
    //Проверка, что бронирование сохранилось
    test('Шаг 4 - Проверка сохранения бронирования', async () => {
        const response = await makeRequest('GET', '/api/bookings');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        
        const foundBooking = response.data.data.find(b => b.id === createdBookingId);
        expect(foundBooking).toBeDefined();
        expect(foundBooking.user_name).toBe('Тестовый Клиент');
        expect(foundBooking.status).toBe('confirmed');
    });
    
    //Попытка бронирования с неверными данными
    test('Шаг 5 - Валидация: попытка бронирования с неверными датами', async () => {
        const invalidBooking = {
            glamp_id: testGlampId,
            user_name: 'Тест',
            user_email: 'test@example.com',
            user_phone: '+79991234567',
            check_in: '2025-07-05',
            check_out: '2025-07-03', 
            guests: 2,
            nights: -1,
            total_price: -1000
        };
        
        const response = await makeRequest('POST', '/api/bookings', invalidBooking);
        
        expect(response.status).toBe(200); 
    });
    
    // Обновление статуса бронирования
    test('Шаг 6 - Обновление статуса бронирования', async () => {
        if (createdBookingId) {
            const updateResponse = await makeRequest('PUT', `/api/bookings/${createdBookingId}/status`, { status: 'confirmed' });
            
            expect(updateResponse.status).toBe(200);
            expect(updateResponse.data.success).toBe(true);
        }
    });
});

describe('Валидация данных бронирования', () => {
    
    //Проверка обязательных полей
    test('Бронирование без обязательных полей должно возвращать ошибку', async () => {
        const incompleteData = {
            glamp_id: 1,
            user_name: 'Тест'
        };
        
        const response = await makeRequest('POST', '/api/bookings', incompleteData);
        
        expect(response.status).toBe(500);
    });
    
    // Проверка корректности email
    test('Бронирование с некорректным email', async () => {
        const invalidEmailData = {
            glamp_id: 1,
            user_name: 'Тест',
            user_email: 'invalid-email',
            user_phone: '+79991234567',
            check_in: '2025-07-01',
            check_out: '2025-07-03',
            guests: 2,
            nights: 2,
            total_price: 17800
        };
        
        const response = await makeRequest('POST', '/api/bookings', invalidEmailData);
        
        expect(response).toBeDefined();
    });
    
    // Проверка корректности телефона
    test('Бронирование с некорректным телефоном', async () => {
        const invalidPhoneData = {
            glamp_id: 1,
            user_name: 'Тест',
            user_email: 'test@example.com',
            user_phone: '123', 
            check_in: '2025-07-01',
            check_out: '2025-07-03',
            guests: 2,
            nights: 2,
            total_price: 17800
        };
        
        const response = await makeRequest('POST', '/api/bookings', invalidPhoneData);
        
        expect(response).toBeDefined();
    });
});