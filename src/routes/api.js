const router = require('express').Router();
const bookingController = require('../controllers/bookingController');

// Маршруты для бронирований
router.post('/bookings', bookingController.createBooking);
router.get('/bookings', bookingController.getAllBookings);
router.get('/bookings/:id', bookingController.getBookingById);
router.put('/bookings/:id/status', bookingController.updateBookingStatus);
router.delete('/bookings/:id', bookingController.deleteBooking);

module.exports = router;