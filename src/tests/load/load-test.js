const http = require('http');

const config = {
    host: 'localhost',
    port: 3000,
    totalRequests: 50,
    concurrency: 10
};

const endpoints = [
    { method: 'GET', path: '/api/glamps' },
    { method: 'GET', path: '/api/services' },
    { method: 'GET', path: '/api/reviews' }
];

let results = {
    total: 0,
    success: 0,
    failed: 0,
    times: []
};

function makeRequest(endpoint, callback) {
    const start = Date.now();
    
    const options = {
        hostname: config.host,
        port: config.port,
        path: endpoint.path,
        method: endpoint.method
    };
    
    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            const duration = Date.now() - start;
            results.total++;
            results.times.push(duration);
            
            if (res.statusCode === 200) {
                results.success++;
                console.log(` ${endpoint.method} ${endpoint.path} - ${duration}ms`);
            } else {
                results.failed++;
                console.log(` ${endpoint.method} ${endpoint.path} - ${res.statusCode} - ${duration}ms`);
            }
            if (callback) callback();
        });
    });
    
    req.on('error', (err) => {
        results.total++;
        results.failed++;
        console.log(` ${endpoint.method} ${endpoint.path} - Ошибка: ${err.message}`);
        if (callback) callback();
    });
    
    req.end();
}

function runTest() {
    console.log(`\n Запуск нагрузочного теста`);
    console.log(` ${config.totalRequests} запросов, ${config.concurrency} параллельно\n`);
    
    let completed = 0;
    let requestCount = 0;
    
    function sendRequest() {
        if (requestCount >= config.totalRequests) return;
        const endpoint = endpoints[requestCount % endpoints.length];
        requestCount++;
        
        makeRequest(endpoint, () => {
            completed++;
            if (completed === config.totalRequests) {
                const avgTime = results.times.reduce((a,b) => a + b, 0) / results.times.length;
                const successRate = (results.success / results.total * 100).toFixed(1);
                
                console.log(`\n${'='.repeat(50)}`);
                console.log(` РЕЗУЛЬТАТЫ НАГРУЗОЧНОГО ТЕСТА`);
                console.log(`${'='.repeat(50)}`);
                console.log(` Успешных: ${results.success}`);
                console.log(`Ошибок: ${results.failed}`);
                console.log(`Процент успеха: ${successRate}%`);
                console.log(`Среднее время: ${Math.round(avgTime)}ms`);
                console.log(`Минимальное: ${Math.min(...results.times)}ms`);
                console.log(` Максимальное: ${Math.max(...results.times)}ms`);
                console.log(`${'='.repeat(50)}`);
                
                if (successRate >= 95) {
                    console.log(` РЕЗУЛЬТАТ: ОТЛИЧНО!`);
                } else if (successRate >= 90) {
                    console.log(` РЕЗУЛЬТАТ: ХОРОШО!`);
                } else {
                    console.log(` РЕЗУЛЬТАТ: ТРЕБУЕТ УЛУЧШЕНИЯ!`);
                }
                console.log(`${'='.repeat(50)}\n`);
            }
        });
        
        setTimeout(sendRequest, 100);
    }
    
    for (let i = 0; i < config.concurrency; i++) {
        sendRequest();
    }
}

function checkServer(callback) {
    console.log(' Проверка доступности сервера...');
    const req = http.request({ hostname: config.host, port: config.port, path: '/api/glamps', method: 'GET' }, (res) => {
        console.log(' Сервер доступен!\n');
        callback(true);
    });
    req.on('error', () => {
        console.log(' Сервер НЕ ДОСТУПЕН!');
        console.log('Запустите сервер: node server.js\n');
        callback(false);
    });
    req.end();
}

checkServer((available) => {
    if (available) {
        runTest();
    }
});