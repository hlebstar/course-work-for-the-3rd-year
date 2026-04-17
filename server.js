const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;

// Секретный ключ для JWT
const JWT_SECRET = 'glamptime_secret_key_2026';

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'glamptime_db',
});

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Раздаём статические файлы
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

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(htmlPath, 'login.html'));
});

app.get('/account.html', (req, res) => {
    res.sendFile(path.join(htmlPath, 'account.html'));
});

app.get('/booking.html', (req, res) => {
    res.sendFile(path.join(htmlPath, 'booking.html'));
});

app.get('/booking-success.html', (req, res) => {
    res.sendFile(path.join(htmlPath, 'booking-success.html'));
});

// Маршруты для JS файлов
app.get('/js/booking.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'js', 'booking.js'));
});

app.get('/js/main.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'js', 'main.js'));
});

app.get('/js/services.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'js', 'services.js'));
});

// Статистика для графиков
app.get('/api/charts-data', async (req, res) => {
    try {
        // Бронирования по месяцам (текущий год)
        const bookingsByMonth = await pool.query(`
            SELECT 
                EXTRACT(MONTH FROM created_at) as month,
                COUNT(*) as count
            FROM bookings 
            WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
            GROUP BY EXTRACT(MONTH FROM created_at)
            ORDER BY month
        `);
        
        // Популярность домиков (топ 5)
        const popularGlamps = await pool.query(`
            SELECT 
                g.name,
                COUNT(b.id) as bookings_count
            FROM glamps g
            LEFT JOIN bookings b ON g.id = b.glamp_id
            GROUP BY g.id, g.name
            ORDER BY bookings_count DESC
            LIMIT 5
        `);
        
        res.json({ 
            success: true, 
            data: {
                bookingsByMonth: bookingsByMonth.rows,
                popularGlamps: popularGlamps.rows
            }
        });
    } catch (err) {
        console.error('Ошибка получения данных для графиков:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Удаление бронирования
app.delete('/api/bookings/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM bookings WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Удаление домика
app.delete('/api/glamps/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM glamps WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

//создание таблиц
async function initTables() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(100),
                phone VARCHAR(20),
                role VARCHAR(20) DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Таблица users создана');

        const adminCheck = await pool.query("SELECT * FROM users WHERE username = 'admin'");
        if (adminCheck.rows.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await pool.query(
                "INSERT INTO users (username, email, password_hash, full_name, role) VALUES ($1, $2, $3, $4, $5)",
                ['admin', 'admin@glamptime.ru', hashedPassword, 'Администратор', 'admin']
            );
            console.log(' Админ создан: admin / admin123');
        }

        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='user_id') THEN
                    ALTER TABLE bookings ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
                END IF;
            END $$;
        `);

        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='user_id') THEN
                    ALTER TABLE reviews ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
                END IF;
            END $$;
        `);

    } catch (err) {
        console.error('Ошибка создания таблиц:', err);
    }
}


app.post('/api/auth/register', async (req, res) => {
    const { username, email, password, full_name, phone } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ success: false, error: 'Заполните все обязательные поля' });
    }

    try {
        const existingUser = await pool.query(
            "SELECT * FROM users WHERE username = $1 OR email = $2",
            [username, email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ success: false, error: 'Пользователь с таким именем или email уже существует' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (username, email, password_hash, full_name, phone, role) 
             VALUES ($1, $2, $3, $4, $5, 'user') RETURNING id, username, email, full_name, role`,
            [username, email, hashedPassword, full_name || null, phone || null]
        );

        const token = jwt.sign(
            { id: result.rows[0].id, username: result.rows[0].username, role: result.rows[0].role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'strict'
        });

        res.json({
            success: true,
            message: 'Регистрация успешна',
            user: {
                id: result.rows[0].id,
                username: result.rows[0].username,
                email: result.rows[0].email,
                full_name: result.rows[0].full_name,
                role: result.rows[0].role
            }
        });

    } catch (err) {
        console.error('Ошибка регистрации:', err);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, error: 'Введите имя пользователя и пароль' });
    }

    try {
        const result = await pool.query(
            "SELECT * FROM users WHERE username = $1 OR email = $1",
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, error: 'Неверное имя пользователя или пароль' });
        }

        const user = result.rows[0];
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({ success: false, error: 'Неверное имя пользователя или пароль' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'strict'
        });

        res.json({
            success: true,
            message: 'Вход выполнен успешно',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (err) {
        console.error('Ошибка входа:', err);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});

app.get('/api/auth/me', async (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.json({ success: false, authenticated: false });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const result = await pool.query(
            "SELECT id, username, email, full_name, phone, role, created_at FROM users WHERE id = $1",
            [decoded.id]
        );

        if (result.rows.length === 0) {
            return res.json({ success: false, authenticated: false });
        }

        res.json({
            success: true,
            authenticated: true,
            user: result.rows[0]
        });

    } catch (err) {
        res.json({ success: false, authenticated: false });
    }
});

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true, message: 'Выход выполнен' });
});

app.put('/api/auth/profile', async (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ success: false, error: 'Не авторизован' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const { full_name, phone, email } = req.body;

        const result = await pool.query(
            `UPDATE users SET full_name = COALESCE($1, full_name), 
             phone = COALESCE($2, phone), 
             email = COALESCE($3, email),
             updated_at = CURRENT_TIMESTAMP
             WHERE id = $4 RETURNING id, username, email, full_name, phone, role`,
            [full_name, phone, email, decoded.id]
        );

        res.json({
            success: true,
            message: 'Профиль обновлен',
            user: result.rows[0]
        });

    } catch (err) {
        console.error('Ошибка обновления профиля:', err);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});

app.get('/api/my-bookings', async (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ success: false, error: 'Не авторизован' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const result = await pool.query(`
            SELECT b.*, g.name as glamp_name 
            FROM bookings b 
            LEFT JOIN glamps g ON b.glamp_id = g.id 
            WHERE b.user_id = $1 
            ORDER BY b.created_at DESC
        `, [decoded.id]);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/my-reviews', async (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ success: false, error: 'Не авторизован' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const result = await pool.query(`
            SELECT r.*, g.name as glamp_name 
            FROM reviews r 
            LEFT JOIN glamps g ON r.glamp_id = g.id 
            WHERE r.user_id = $1 
            ORDER BY r.created_at DESC
        `, [decoded.id]);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});


app.get('/api/glamps', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM glamps ORDER BY id');
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

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


app.post('/api/bookings', async (req, res) => {
    const token = req.cookies.token;
    let userId = null;

    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            userId = decoded.id;
        } catch (err) {}
    }

    const { glamp_id, user_name, user_email, user_phone, user_comment, check_in, check_out, guests, nights, total_price } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO bookings (glamp_id, user_id, user_name, user_email, user_phone, user_comment, check_in, check_out, guests, nights, total_price, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'confirmed') RETURNING *`,
            [glamp_id, userId, user_name, user_email, user_phone, user_comment, check_in, check_out, guests, nights, total_price]
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

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


app.get('/api/services', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM services ORDER BY id');
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

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

app.post('/api/reviews', async (req, res) => {
    console.log('Получен запрос на добавление отзыва:', req.body);
    
    const token = req.cookies.token;
    let userId = null;
    let userName = req.body.user_name;
    let userEmail = req.body.user_email;

    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            userId = decoded.id;
            const userResult = await pool.query("SELECT username, email FROM users WHERE id = $1", [userId]);
            if (userResult.rows.length > 0) {
                userName = userResult.rows[0].username;
                userEmail = userResult.rows[0].email;
            }
        } catch (err) {}
    }
    
    const { rating, review_text, glamp_id } = req.body;
    
    if (!userName || !userEmail || !rating || !review_text) {
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
            `INSERT INTO reviews (user_id, user_name, user_email, rating, review_text, glamp_id, status, created_at) 
             VALUES ($1, $2, $3, $4, $5, $6, 'approved', NOW()) RETURNING *`,
            [userId, userName, userEmail, rating, review_text, glamp_id || null]
        );
        
        console.log('Отзыв добавлен:', result.rows[0]);
        res.json({ 
            success: true, 
            message: 'Спасибо за отзыв!',
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

app.delete('/api/admin/reviews/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM reviews WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Ошибка при удалении отзыва:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

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

// Вход в админ-панель
app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    
    console.log('Попытка входа в админку:', username);
    
    if (!username || !password) {
        return res.status(400).json({ success: false, error: 'Введите логин и пароль' });
    }
    
    try {
        const result = await pool.query(
            "SELECT * FROM users WHERE username = $1 AND role = 'admin'",
            [username]
        );
        
        if (result.rows.length === 0) {
            console.log('Админ не найден:', username);
            return res.status(401).json({ success: false, error: 'Неверный логин или пароль' });
        }
        
        const admin = result.rows[0];
        const isValidPassword = await bcrypt.compare(password, admin.password_hash);
        
        if (!isValidPassword) {
            console.log('Неверный пароль для:', username);
            return res.status(401).json({ success: false, error: 'Неверный логин или пароль' });
        }
        
        const token = jwt.sign(
            { id: admin.id, username: admin.username, role: admin.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.cookie('adminToken', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'strict'
        });
        
        console.log('Админ вошел:', username);
        res.json({ 
            success: true, 
            message: 'Вход выполнен успешно',
            admin: { id: admin.id, username: admin.username, email: admin.email }
        });
        
    } catch (err) {
        console.error('Ошибка входа в админку:', err);
        res.status(500).json({ success: false, error: 'Ошибка сервера: ' + err.message });
    }
});

// Проверка сессии администратора
app.get('/api/admin/check', async (req, res) => {
    const token = req.cookies.adminToken;
    
    if (!token) {
        return res.json({ success: false, authenticated: false });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const result = await pool.query(
            "SELECT id, username, email FROM users WHERE id = $1 AND role = 'admin'",
            [decoded.id]
        );
        
        if (result.rows.length === 0) {
            return res.json({ success: false, authenticated: false });
        }
        
        res.json({ 
            success: true, 
            authenticated: true,
            admin: result.rows[0]
        });
        
    } catch (err) {
        console.error('Ошибка проверки сессии:', err);
        res.json({ success: false, authenticated: false });
    }
});

// Выход из админ-панели
app.post('/api/admin/logout', (req, res) => {
    res.clearCookie('adminToken');
    res.json({ success: true, message: 'Выход выполнен' });
});

app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(htmlPath, 'admin.html'));
});

app.get('/admin-login.html', (req, res) => {
    res.sendFile(path.join(htmlPath, 'admin-login.html'));
});

app.get('/glamp-detail.html', (req, res) => {
    res.sendFile(path.join(htmlPath, 'glamp-detail.html'));
});

app.listen(port, async () => {
    await initTables();
    console.log(`\n Сервер запущен на http://localhost:${port}`);
    console.log(` Статика из папки: ${path.join(__dirname, 'public')}`);
    console.log(` HTML файлы из: ${htmlPath}`);
    console.log(`\n Доступные страницы:`);
    console.log(`   http://localhost:${port}/ - главная`);
    console.log(`   http://localhost:${port}/glamps.html - домики`);
    console.log(`   http://localhost:${port}/services.html - услуги`);
    console.log(`   http://localhost:${port}/rasvlichenia.html - развлечения`);
    console.log(`   http://localhost:${port}/contact.html - контакты`);
    console.log(`   http://localhost:${port}/admin.html - админ-панель`);
    console.log(`   http://localhost:${port}/admin-login.html - вход/регистрация`);
    console.log(`   http://localhost:${port}/account.html - личный кабинет`);
    console.log(`   http://localhost:${port}/booking.html - бронирование`);
    console.log(`   http://localhost:${port}/booking-success.html - успешное бронирование`);
});