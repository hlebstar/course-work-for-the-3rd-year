const router = require('express').Router();
const path = require('path');

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

router.get('/glamps', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/glamps.html'));
});

router.get('/glamp-detail', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/glamp-detail.html'));
});

router.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/contact.html'));
});

module.exports = router;