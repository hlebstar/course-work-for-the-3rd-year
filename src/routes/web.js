const router = require('express').Router();
const path = require('path');

const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/index.html'));
});

router.get('/glamps.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/glamps.html'));
});

router.get('/glamp-detail.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/glamp-detail.html'));
});

router.get('/services.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/services.html'));
});

router.get('/rasvlichenia.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/rasvlichenia.html'));
});

router.get('/contact.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/contact.html'));
});

router.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/admin.html'));
});

router.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/login.html'));
});

router.get('/account.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/account.html'));
});

router.get('/booking.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/booking.html'));
});

router.get('/booking-success.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/booking-success.html'));
});

router.get('/js/booking.js', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/js/booking.js'));
});

router.get('/js/main.js', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/js/main.js'));
});

router.get('/css/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public', req.path));
});

router.get('/images/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public', req.path));
});

router.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/index.html'));
});


// Маршруты для JS файлов
app.get('/js/main.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'js', 'main.js'));
});

app.get('/js/contact.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'js', 'contact2.js'));
});

app.get('/js/glamps.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'js', 'glamps2.js'));
});

app.get('/js/admin.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'js', 'admin2.js'));
});

app.get('/js/booking.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'js', 'booking.js'));
});

app.get('/js/booking-succes2.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'js', 'booking-succes2.js'));
});

app.get('/js/services2.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'js', 'services2.js'));
});

module.exports = router;