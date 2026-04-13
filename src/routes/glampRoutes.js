const router = require('express').Router();
const glampController = require('../controllers/glampController');

router.get('/', glampController.getAllGlamps);

router.get('/:id', glampController.getGlampById);

router.post('/', glampController.createGlamp);

router.put('/:id', glampController.updateGlamp);

router.delete('/:id', glampController.deleteGlamp);

module.exports = router;