const Sequelize = require('sequelize');
const db = require('../../config/db');
const Model = Sequelize.Model;

class Notification extends Model {}

Notification.init({
    userId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
            // This is a reference to another model
            model: 'User',

            // This is the column name of the referenced model
            key: 'id'
        }
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    message: {
        type: Sequelize.STRING,
        allowNull: false
    },
    readAt: {
        type: Sequelize.DATE,
        allowNull: true
    },
}, {
    sequelize: db,
    modelName: 'Notification',
    tableName: 'notifications',
    timestamps: true
});


module.exports = Notification;
