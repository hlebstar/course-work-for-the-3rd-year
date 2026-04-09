const User = require('./User');
const Glamp = require('./Glamp');
const Booking = require('./Booking');
const Review = require('./Review');
const { sequelize } = require('../config/database');

User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Glamp.hasMany(Booking, { foreignKey: 'glampId', as: 'bookings' });
Booking.belongsTo(Glamp, { foreignKey: 'glampId', as: 'glamp' });

Glamp.hasMany(Review, { foreignKey: 'glampId', as: 'reviews' });
Review.belongsTo(Glamp, { foreignKey: 'glampId', as: 'glamp' });

module.exports = {
  sequelize,
  User,
  Glamp,
  Booking,
  Review
};