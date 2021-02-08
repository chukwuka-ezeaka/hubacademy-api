const Sequelize = require('sequelize');
const db = require('../../config/db');
const User = require('./models.user');
const Model = Sequelize.Model;

class Message extends Model {}

Message.init({
    // attributes
    from_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
            // This is a reference to another model
            model: 'User',

            // This is the column name of the referenced model
            key: 'id'
        }
    },
    from_delete: {
        type: Sequelize.ENUM('0', '1'),
        defaultValue: '0',
    },
    to_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
            // This is a reference to another model
            model: 'User',

            // This is the column name of the referenced model
            key: 'id'
        }
    },
    to_delete: {
        type: Sequelize.ENUM('0', '1'),
        defaultValue: '0',
    },
    content: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    seen: {
        type: Sequelize.ENUM('1', '2', '3'),
        defaultValue: '1',
    },
    replay: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
            // This is a reference to another model
            model: 'Message',

            // This is the column name of the referenced model
            key: 'id'
        }
    },
}, {
    sequelize: db,
    modelName: 'Message',
    tableName: 'messages',
    timestamps: true
});


Message.belongsTo(User,{foreignKey:'from_id',as: 'from'})


module.exports = Message;