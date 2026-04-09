const router = require('express').Router();
const userController = require('../controllers/userController');

// GET /api/v1/users - получить всех пользователей
router.get('/', userController.getAllUsers);

// GET /api/v1/users/:id - получить пользователя по ID
router.get('/:id', userController.getUserById);

// POST /api/v1/users - создать пользователя
router.post('/', userController.createUser);

// PUT /api/v1/users/:id - обновить пользователя
router.put('/:id', userController.updateUser);

// DELETE /api/v1/users/:id - удалить пользователя
router.delete('/:id', userController.deleteUser);

module.exports = router;