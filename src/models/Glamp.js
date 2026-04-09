const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Glamp = sequelize.define('Glamp', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  pricePerNight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  maxGuests: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 2,
    validate: {
      min: 1,
      max: 20
    }
  },
  bedrooms: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  beds: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  bathrooms: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  amenities: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  location: {
    type: DataTypes.JSONB,
    defaultValue: {
      address: '',
      city: '',
      country: '',
      coordinates: { lat: 0, lng: 0 }
    }
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    }
  },
  totalReviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'glamps',
  timestamps: true,
  underscored: true
});

module.exports = Glamp;