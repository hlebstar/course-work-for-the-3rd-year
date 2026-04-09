const router = require('express').Router();
const userRoutes = require('./userRoutes');
const glampRoutes = require('./glampRoutes');

router.use('/users', userRoutes);
router.use('/glamps', glampRoutes);

router.get('/', (req, res) => {
    res.json({
        message: 'GlampTime API v1',
        endpoints: {
            users: '/api/v1/users',
            glamps: '/api/v1/glamps'
        }
    });
});

module.exports = router;