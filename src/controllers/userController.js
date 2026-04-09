const { User } = require('../models');

const userController = {
    // Получить всех пользователей
    async getAllUsers(req, res) {
        try {
            const users = await User.findAll({
                attributes: { exclude: ['password'] }
            });
            
            res.json({
                success: true,
                count: users.length,
                data: users
            });
        } catch (error) {
            console.error('Error getting users:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    
    // Получить пользователя по ID
    async getUserById(req, res) {
        try {
            const user = await User.findByPk(req.params.id, {
                attributes: { exclude: ['password'] }
            });
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'Пользователь не найден'
                });
            }
            
            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error('Error getting user:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    
    // Создать пользователя
    async createUser(req, res) {
        try {
            const { name, email, password, role } = req.body;
            
            const user = await User.create({
                name,
                email,
                password,
                role: role || 'user'
            });
            
            // Убираем пароль из ответа
            user.password = undefined;
            
            res.status(201).json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error('Error creating user:', error);
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({
                    success: false,
                    error: 'Email уже существует'
                });
            }
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    
    // Обновить пользователя
    async updateUser(req, res) {
        try {
            const user = await User.findByPk(req.params.id);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'Пользователь не найден'
                });
            }
            
            await user.update(req.body);
            
            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    
    // Удалить пользователя
    async deleteUser(req, res) {
        try {
            const user = await User.findByPk(req.params.id);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'Пользователь не найден'
                });
            }
            
            await user.destroy();
            
            res.json({
                success: true,
                message: 'Пользователь успешно удален'
            });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
};

module.exports = userController;