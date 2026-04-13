const http = require('http');

function makeRequest(method, path) {
    return new Promise((resolve) => {
        const start = Date.now();
        const req = http.request({ hostname: 'localhost', port: 3000, path, method }, (res) => {
            const duration = Date.now() - start;
            resolve({ duration, status: res.statusCode });
        });
        req.on('error', () => resolve({ duration: -1, status: 500 }));
        req.end();
    });
}

describe('Тесты производительности', () => {
    
    test('Время ответа GET /api/glamps не более 100ms', async () => {
        const { duration, status } = await makeRequest('GET', '/api/glamps');
        
        expect(status).toBe(200);
        expect(duration).toBeLessThan(100);
    });
    
    test('Время ответа GET /api/services не более 100ms', async () => {
        const { duration, status } = await makeRequest('GET', '/api/services');
        
        expect(status).toBe(200);
        expect(duration).toBeLessThan(100);
    });
    
    test('Время ответа GET /api/reviews не более 100ms', async () => {
        const { duration, status } = await makeRequest('GET', '/api/reviews');
        
        expect(status).toBe(200);
        expect(duration).toBeLessThan(100);
    });
    
    test('Обработка 10 параллельных запросов', async () => {
        const requests = Array(10).fill().map(() => makeRequest('GET', '/api/glamps'));
        const results = await Promise.all(requests);
        
        const allSuccess = results.every(r => r.status === 200);
        const avgTime = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
        
        expect(allSuccess).toBe(true);
        expect(avgTime).toBeLessThan(200);
    });
});