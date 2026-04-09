const router = require('express').Router();
const glampController = require('../controllers/glampController');

// GET /api/v1/glamps - получить все дома
router.get('/', glampController.getAllGlamps);

// GET /api/v1/glamps/:id - получить дом по ID
router.get('/:id', glampController.getGlampById);

// POST /api/v1/glamps - создать новый дом
router.post('/', glampController.createGlamp);

// PUT /api/v1/glamps/:id - обновить дом
router.put('/:id', glampController.updateGlamp);

// DELETE /api/v1/glamps/:id - удалить дом
router.delete('/:id', glampController.deleteGlamp);

module.exports = router;