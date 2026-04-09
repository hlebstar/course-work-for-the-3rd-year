const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Настройка подключения к PostgreSQL
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres', // Замените на ваш пароль
    database: 'glamptime_db',
});

app.use(cors());
app.use(express.json());

// ============= ВАЖНО: РАЗДАЧА СТАТИЧЕСКИХ ФАЙЛОВ =============
// Раздаём ВСЮ папку public (здесь лежат images, css, js)
app.use(express.static(path.join(__dirname, 'public')));

// Путь к папке с HTML файлами
const htmlPath = path.join(__dirname, 'public', 'html');

// ============= МАРШРУТЫ ДЛЯ СТРАНИЦ =============
app.get('/', (req, res) => {
    res.sendFile(path.join(htmlPath, 'index.html'));
});

app.get('/glamps.html', (req, res) => {
    res.sendFile(path.join(htmlPath, 'glamps.html'));
});

app.get('/services.html', (req, res) => {
    res.sendFile(path.join(htmlPath, 'services.html'));
});

app.get('/rasvlichenia.html', (req, res) => {
    res.sendFile(path.join(htmlPath, 'rasvlichenia.html'));
});

app.get('/contact.html', (req, res) => {
    res.sendFile(path.join(htmlPath, 'contact.html'));
});

app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(htmlPath, 'admin.html'));
});

app.get('/glamp-detail.html', (req, res) => {
    res.sendFile(path.join(htmlPath, 'glamp-detail.html'));
});

// ============= API МАРШРУТЫ =============

// Получить все домики
app.get('/api/glamps', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM glamps ORDER BY id');
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Получить домик по ID
app.get('/api/glamps/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM glamps WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Домик не найден' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Создать бронирование домика
app.post('/api/bookings', async (req, res) => {
    const { glamp_id, user_name, user_email, user_phone, user_comment, check_in, check_out, guests, nights, total_price } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO bookings (glamp_id, user_name, user_email, user_phone, user_comment, check_in, check_out, guests, nights, total_price, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending') RETURNING *`,
            [glamp_id, user_name, user_email, user_phone, user_comment, check_in, check_out, guests, nights, total_price]
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Получить все бронирования
app.get('/api/bookings', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT b.*, g.name as glamp_name 
            FROM bookings b 
            LEFT JOIN glamps g ON b.glamp_id = g.id 
            ORDER BY b.created_at DESC
        `);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Обновить статус бронирования
app.put('/api/bookings/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
            [status, req.params.id]
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Получить все услуги
app.get('/api/services', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM services ORDER BY id');
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Получить услугу по ID
app.get('/api/services/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM services WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Услуга не найдена' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Создать заказ услуги
app.post('/api/service-orders', async (req, res) => {
    const { service_id, user_name, user_email, user_phone, service_date, quantity, total_price } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO service_orders (service_id, user_name, user_email, user_phone, service_date, quantity, total_price, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending') RETURNING *`,
            [service_id, user_name, user_email, user_phone, service_date, quantity, total_price]
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Получить все заказы услуг
app.get('/api/service-orders', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT so.*, s.name as service_name 
            FROM service_orders so 
            LEFT JOIN services s ON so.service_id = s.id 
            ORDER BY so.created_at DESC
        `);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Статистика
app.get('/api/stats', async (req, res) => {
    try {
        const totalGlamps = await pool.query('SELECT COUNT(*) FROM glamps');
        const totalBookings = await pool.query('SELECT COUNT(*) FROM bookings');
        const totalServices = await pool.query('SELECT COUNT(*) FROM services');
        const totalOrders = await pool.query('SELECT COUNT(*) FROM service_orders');
        
        const revenue = await pool.query('SELECT COALESCE(SUM(total_price), 0) as total FROM bookings');
        const pendingBookings = await pool.query("SELECT COUNT(*) FROM bookings WHERE status = 'pending'");
        
        res.json({
            success: true,
            data: {
                totalGlamps: parseInt(totalGlamps.rows[0].count),
                totalBookings: parseInt(totalBookings.rows[0].count),
                totalServices: parseInt(totalServices.rows[0].count),
                totalOrders: parseInt(totalOrders.rows[0].count),
                totalRevenue: parseInt(revenue.rows[0].total),
                pendingBookings: parseInt(pendingBookings.rows[0].count)
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ============= API ДЛЯ ОТЗЫВОВ =============

// Получить все одобренные отзывы (для главной страницы)
app.get('/api/reviews', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT r.*, g.name as glamp_name 
            FROM reviews r 
            LEFT JOIN glamps g ON r.glamp_id = g.id 
            WHERE r.status = 'approved' 
            ORDER BY r.created_at DESC
            LIMIT 10
        `);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error('Ошибка GET /api/reviews:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Добавить новый отзыв
app.post('/api/reviews', async (req, res) => {
    console.log('Получен запрос на добавление отзыва:', req.body);
    
    const { user_name, user_email, rating, review_text, glamp_id } = req.body;
    
    if (!user_name || !user_email || !rating || !review_text) {
        return res.status(400).json({ 
            success: false, 
            error: 'Заполните все обязательные поля' 
        });
    }
    
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ 
            success: false, 
            error: 'Оценка должна быть от 1 до 5' 
        });
    }
    
    try {
        const result = await pool.query(
            `INSERT INTO reviews (user_name, user_email, rating, review_text, glamp_id, status) 
             VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`,
            [user_name, user_email, rating, review_text, glamp_id || null]
        );
        
        console.log('Отзыв добавлен:', result.rows[0]);
        res.json({ 
            success: true, 
            message: 'Спасибо за отзыв! Он появится после проверки администратором.',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Ошибка при добавлении отзыва:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Ошибка базы данных: ' + err.message 
        });
    }
});

// Получить все отзывы для админки
app.get('/api/admin/reviews', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT r.*, g.name as glamp_name 
            FROM reviews r 
            LEFT JOIN glamps g ON r.glamp_id = g.id 
            ORDER BY r.created_at DESC
        `);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error('Ошибка GET /api/admin/reviews:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Обновить статус отзыва
app.put('/api/admin/reviews/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
        await pool.query(
            'UPDATE reviews SET status = $1 WHERE id = $2',
            [status, req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Ошибка при обновлении статуса:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Удалить отзыв
app.delete('/api/admin/reviews/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM reviews WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Ошибка при удалении отзыва:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Получить статистику отзывов
app.get('/api/reviews/stats', async (req, res) => {
    try {
        const total = await pool.query("SELECT COUNT(*) FROM reviews WHERE status = 'approved'");
        const avgRating = await pool.query("SELECT COALESCE(AVG(rating), 0) as avg FROM reviews WHERE status = 'approved'");
        
        res.json({
            success: true,
            data: {
                total: parseInt(total.rows[0].count),
                avgRating: parseFloat(avgRating.rows[0].avg).toFixed(1)
            }
        });
    } catch (err) {
        console.error('Ошибка GET /api/reviews/stats:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ============= ЗАПУСК СЕРВЕРА =============
app.listen(port, () => {
    console.log(`\n🚀 Сервер запущен на http://localhost:${port}`);
    console.log(`📁 Статика из папки: ${path.join(__dirname, 'public')}`);
    console.log(`📁 HTML файлы из: ${htmlPath}`);
    console.log(`\n📋 Доступные страницы:`);
    console.log(`   http://localhost:${port}/ - главная`);
    console.log(`   http://localhost:${port}/glamps.html - домики`);
    console.log(`   http://localhost:${port}/services.html - услуги`);
    console.log(`   http://localhost:${port}/rasvlichenia.html - развлечения`);
    console.log(`   http://localhost:${port}/contact.html - контакты`);
    console.log(`   http://localhost:${port}/admin.html - админ-панель`);
});