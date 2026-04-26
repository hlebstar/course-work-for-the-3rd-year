const { Booking, Glamp } = require('../models');

const bookingController = {
    // Создание бронирования
    async createBooking(req, res) {
        try {
            const {
                glamp_id,
                user_name,
                user_email,
                user_phone,
                check_in,
                check_out,
                guests,
                total_price
            } = req.body;

            console.log('📥 Получены данные:', req.body);

            // Проверяем, существует ли домик
            const glamp = await Glamp.findByPk(glamp_id);
            if (!glamp) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'Домик не найден' 
                });
            }

            // Создаём бронирование
            const booking = await Booking.create({
                glamp_id: glamp_id,
                user_name: user_name,
                user_email: user_email,
                user_phone: user_phone,
                check_in_date: check_in,
                check_out_date: check_out,
                guests_count: parseInt(guests),
                total_price: total_price,
                status: 'pending',
                payment_status: 'pending'
            });

            console.log('✅ Бронирование создано:', booking.id);

            res.status(201).json({ 
                success: true, 
                data: booking 
            });

        } catch (error) {
            console.error('❌ Ошибка при создании бронирования:', error);
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    },

    // Получить все бронирования
    async getAllBookings(req, res) {
        try {
            const bookings = await Booking.findAll({
                order: [['created_at', 'DESC']]
            });
            res.json({ success: true, data: bookings });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // Получить бронирование по ID
    async getBookingById(req, res) {
        try {
            const booking = await Booking.findByPk(req.params.id);
            if (!booking) {
                return res.status(404).json({ success: false, error: 'Бронирование не найдено' });
            }
            res.json({ success: true, data: booking });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // Обновить статус бронирования
    async updateBookingStatus(req, res) {
        try {
            const { status } = req.body;
            const booking = await Booking.findByPk(req.params.id);
            
            if (!booking) {
                return res.status(404).json({ success: false, error: 'Бронирование не найдено' });
            }
            
            await booking.update({ status });
            res.json({ success: true, data: booking });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // Удалить бронирование
    async deleteBooking(req, res) {
        try {
            const booking = await Booking.findByPk(req.params.id);
            if (!booking) {
                return res.status(404).json({ success: false, error: 'Бронирование не найдено' });
            }
            await booking.destroy();
            res.json({ success: true, message: 'Бронирование удалено' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
};

module.exports = bookingController;