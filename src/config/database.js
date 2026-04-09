const { Sequelize } = require('sequelize');

// Создаем экземпляр Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME || 'glamptime',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Функция подключения к БД
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(' PostgreSQL connected successfully');
    
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log(' Database synchronized');
    }
  } catch (error) {
    console.error(' Unable to connect to PostgreSQL:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };