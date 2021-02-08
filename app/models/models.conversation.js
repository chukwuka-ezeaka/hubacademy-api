const Sequelize = require('sequelize');
const db = require('../../config/db');
const User = require('./models.user');
const Message = require('./models.message');

const Model = Sequelize.Model;

class Conversation extends Model {}

Conversation.init({
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
    last_msg_id:{
        type: Sequelize.STRING,
        allowNull: true,
        references: {
            // This is a reference to another model
            model: 'Message',

            // This is the column name of the referenced model
            key: 'id'
        }
    }
}, {
    sequelize: db,
    modelName: 'Conversation',
    tableName: 'conversations',
    timestamps: true
});

Conversation.belongsTo(User,{foreignKey:'to_id',as: 'to'})
Conversation.belongsTo(Message,{foreignKey:'last_msg_id',as: 'last_msg'})



module.exports = Conversation;