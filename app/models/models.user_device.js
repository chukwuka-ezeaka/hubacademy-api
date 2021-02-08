const Sequelize = require('sequelize');
const db = require('../../config/db');
const Model = Sequelize.Model;

class UserDevice extends Model {}

UserDevice.init({
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
    deviceId: {
        type: Sequelize.STRING,
        allowNull: false
    },
    fcmToken: {
        type: Sequelize.STRING,
        allowNull: false
    },
    active: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
}, {
    sequelize: db,
    modelName: 'UserDevice',
    tableName: 'user_devices',
    timestamps: true
});


module.exports = UserDevice;
