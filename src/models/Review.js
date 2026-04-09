const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [10, 1000]
    }
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  response: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'reviews',
  timestamps: true,
  underscored: true
});

module.exports = Review;