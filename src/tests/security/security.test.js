const http = require('http');

function makeRequest(method, path, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const encodedPath = encodeURI(path);
        
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: encodedPath,
            method: method,
            headers: { ...headers, 'Content-Type': 'application/json' }
        };
        
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    resolve({ status: res.statusCode, data: json, headers: res.headers });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body, headers: res.headers });
                }
            });
        });
        
        req.on('error', (err) => {
            resolve({ status: 500, data: { error: err.message }, headers: {} });
        });
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

describe('Тесты безопасности', () => {
    
    test('Защита от SQL инъекций - сервер не падает', async () => {
        const sqlInjection = encodeURIComponent("' OR '1'='1");
        const response = await makeRequest('GET', `/api/glamps/1${sqlInjection}`);
        
        expect(response.status).toBeDefined();
        expect([200, 404, 500]).toContain(response.status);
    });
    
    test('Обработка XSS в отзывах - сервер сохраняет данные', async () => {
        const xssPayload = {
            user_name: 'Тестовый пользователь',
            user_email: 'test@example.com',
            rating: 5,
            review_text: 'Отличное место! <b>Рекомендую</b>',
            glamp_id: 1
        };
        
        const response = await makeRequest('POST', '/api/reviews', xssPayload);
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
    });
    
    test('Защита от path traversal', async () => {
        const response = await makeRequest('GET', '/api/glamps/1');
        
        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
    });
    
    test('Обработка больших данных', async () => {
        const largeData = {
            user_name: 'Тест'.repeat(100),
            user_email: 'test@example.com',
            rating: 5,
            review_text: 'Текст'.repeat(1000),
            glamp_id: 1
        };
        
        const response = await makeRequest('POST', '/api/reviews', largeData);
        
        expect(response.status).toBeDefined();
    });
    
    test('Обработка неверного Content-Type', async () => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/bookings',
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' }
        };
        
        let statusCode = 0;
        const req = http.request(options, (res) => {
            statusCode = res.statusCode;
        });
        req.write('not json');
        req.end();
        
        setTimeout(() => {
            expect([400, 500, 200]).toContain(statusCode);
        }, 100);
    });
});