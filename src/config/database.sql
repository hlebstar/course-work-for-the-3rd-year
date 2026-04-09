CREATE DATABASE glamptime_db;
\c glamptime_db;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица домиков
CREATE TABLE IF NOT EXISTS glamps (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_per_night INTEGER NOT NULL,
    max_guests INTEGER NOT NULL,
    amenities TEXT[],
    city VARCHAR(100),
    address TEXT,
    type VARCHAR(50),
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица услуг
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    price INTEGER NOT NULL,
    duration VARCHAR(50),
    features TEXT[],
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица бронирований домиков
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    glamp_id INTEGER REFERENCES glamps(id) ON DELETE CASCADE,
    user_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(100) NOT NULL,
    user_phone VARCHAR(20),
    user_comment TEXT,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests INTEGER NOT NULL,
    nights INTEGER,
    total_price INTEGER,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица заказов услуг
CREATE TABLE IF NOT EXISTS service_orders (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    user_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(100) NOT NULL,
    user_phone VARCHAR(20),
    service_date DATE,
    quantity INTEGER DEFAULT 1,
    total_price INTEGER,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--  тестовых данных
INSERT INTO glamps (name, description, price_per_night, max_guests, amenities, city, address, type, image_url) VALUES
('Шале у леса', 'Уютный домик в лесу', 8900, 2, ARRAY['Камин', 'Терраса', 'WiFi'], 'Сочи', 'ул. Лесная, 15', 'house', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600'),
('Сфера', 'Современный купол', 12400, 3, ARRAY['Панорамный вид', 'Кондиционер', 'WiFi'], 'Сочи', 'ул. Горная, 7', 'tent', 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=600'),
('Домик у озера', 'Вид на озеро', 6800, 4, ARRAY['Кухня', 'Мангал', 'Парковка'], 'Сочи', 'ул. Озерная, 3', 'house', 'https://images.unsplash.com/photo-1445308394109-4ec2920981b1?w=600');

INSERT INTO services (name, description, category, price, duration, features, image_url) VALUES
('СПА', 'Релакс и восстановление', 'spa', 2500, '60 мин', ARRAY['Массаж', 'Сауна', 'Ароматерапия'], 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600'),
('Трансфер', 'Комфортные поездки', 'transfer', 1500, 'поездка', ARRAY['Встреча', 'WiFi', 'Вода'], 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600'),
('Ресторан', 'Изысканная кухня', 'restaurant', 1000, 'от 1000₽', ARRAY['Завтрак', 'Ужин', 'Барбекю'], 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600');