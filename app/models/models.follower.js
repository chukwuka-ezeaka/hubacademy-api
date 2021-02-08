const Sequelize = require('sequelize');
const Model = Sequelize.Model;
const db = require('../../config/db');

class Follower extends Model {}

Follower.init({
    followerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: false,
        references: {
            model: 'User',
            key: 'id'
        }
    },
    followableId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: false
    },
    followableType: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false
    }
}, {
    sequelize: db,
    modelName: 'Follower',
    tableName:'followers',
    timestamps: true
});

module.exports = Follower;
