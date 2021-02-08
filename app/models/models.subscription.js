const Sequelize = require('sequelize');
const Model = Sequelize.Model;
const db = require('../../config/db');

class Subscription extends Model {}

Subscription.init({
    // attributes
    subscription_genus: {
        type: Sequelize.ENUM('author', 'category','content'),
        allowNull: false,
        unique: false
    },
    subscription_type: {
        type: Sequelize.ENUM('purchase', 'subscription'),
        allowNull: true,
        unique: false
    },
    subscription_interval: {
        type: Sequelize.ENUM('daily','weekly','semi_weekly','monthly','semi_monthly','quarterly','biyearly','yearly'),
        allowNull: true,
        unique: false
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            // This is a reference to another model
            model: 'User',

            // This is the column name of the referenced model
            key: 'id'
        }
    },
    authorId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            // This is a reference to another model
            model: 'User',

            // This is the column name of the referenced model
            key: 'id'
        }
    },
    categoryId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            // This is a reference to another model
            model: 'Category',

            // This is the column name of the referenced model
            key: 'id'
        }
    },
    contentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            // This is a reference to another model
            model: 'Content',

            // This is the column name of the referenced model
            key: 'id'
        }
    },
    expiresAt:{
        type:Sequelize.DATE,
        allowNull:true
    }


}, {
    sequelize: db,
    modelName: 'Subscription',
    tableName: 'subscriptions',
    paranoid: true,
    timestamps:true
});

module.exports = Subscription;
