const http = require('http');

function makeRequest(method, path, data = null) {
    return new Promise((resolve) => {
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
        
        req.on('error', () => {
            resolve({ status: 500, data: {} });
        });
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

describe('Обработка ошибок', () => {
    
    test('Запрос несуществующего домика возвращает 404', async () => {
        const response = await makeRequest('GET', '/api/glamps/99999');
        expect(response.status).toBe(404);
    });
    
    test('Создание бронирования без данных возвращает ошибку', async () => {
        const response = await makeRequest('POST', '/api/bookings', {});
        expect([400, 500]).toContain(response.status);
    });
    
    test('DELETE на несуществующий эндпоинт', async () => {
        const response = await makeRequest('DELETE', '/api/wrong-endpoint');
        expect(response.status).toBe(404);
    });
});