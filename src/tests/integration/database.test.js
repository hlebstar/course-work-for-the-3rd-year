const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'glamptime_db',
});

describe('Интеграционные тесты базы данных', () => {
    
    test('Подключение к PostgreSQL работает', async () => {
        const result = await pool.query('SELECT 1 as test');
        expect(result.rows[0].test).toBe(1);
    });
    
    test('Таблица glamps существует и имеет правильную структуру', async () => {
        const result = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'glamps'
        `);
        
        const columns = result.rows.map(r => r.column_name);
        expect(columns).toContain('id');
        expect(columns).toContain('name');
        expect(columns).toContain('description');
        expect(columns).toContain('price_per_night');
        expect(columns).toContain('max_guests');
        expect(columns).toContain('created_at');
    });
    
    test('Таблица bookings существует и имеет правильную структуру', async () => {
        const result = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'bookings'
        `);
        
        const columns = result.rows.map(r => r.column_name);
        expect(columns).toContain('id');
        expect(columns).toContain('glamp_id');
        expect(columns).toContain('user_name');
        expect(columns).toContain('user_email');
        expect(columns).toContain('check_in');
        expect(columns).toContain('check_out');
        expect(columns).toContain('status');
    });
    
    test('Таблица reviews существует и имеет правильную структуру', async () => {
        const result = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'reviews'
        `);
        
        const columns = result.rows.map(r => r.column_name);
        expect(columns).toContain('id');
        expect(columns).toContain('user_name');
        expect(columns).toContain('rating');
        expect(columns).toContain('review_text');
        expect(columns).toContain('status');
        expect(columns).toContain('created_at');
    });
    
    test('В таблице glamps есть данные', async () => {
        const result = await pool.query('SELECT COUNT(*) FROM glamps');
        const count = parseInt(result.rows[0].count);
        expect(count).toBeGreaterThan(0);
    });
    
    test('Внешние ключи в таблице bookings работают корректно', async () => {
        const result = await pool.query(`
            SELECT b.* 
            FROM bookings b 
            LEFT JOIN glamps g ON b.glamp_id = g.id 
            WHERE b.glamp_id IS NOT NULL AND g.id IS NULL
        `);
        
        expect(result.rows.length).toBe(0);
    });
    
    afterAll(async () => {
        await pool.end();
    });
});