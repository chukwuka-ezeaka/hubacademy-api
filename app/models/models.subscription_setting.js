const Sequelize = require('sequelize');
const Model = Sequelize.Model;
const db = require('../../config/db');

class SubscriptionSetting extends Model {}

SubscriptionSetting.init({
    // attributes
    global_subscription_by: {
        type: Sequelize.ENUM('author', 'category','content'),
        allowNull: false,
        unique: false
    },
    global_subscription_promo_type: {
        type: Sequelize.ENUM('percentage', 'fixed'),
        allowNull: true,
        unique: false
    },
    global_subscription_interval: {
        type: Sequelize.ENUM('daily','weekly','semi_weekly','monthly','semi_monthly','quarterly','biyearly','yearly'),
        allowNull: false,
        unique: false
    },
    global_subscription_amount: {
        type: Sequelize.DECIMAL(15,2),
        allowNull: false,
        unique: false
    },
    global_subscription_promo_amount: {
        type: Sequelize.DECIMAL(15,2),
        allowNull: true,
        unique: false
    },
    global_subscription_status: {
        type: Sequelize.INTEGER,
        allowNull: true,
        unique: false
    },


}, {
    sequelize: db,
    modelName: 'SubscriptionSetting',
    tableName: 'subscription_settings',
    paranoid: true,
    timestamps:false
});

SubscriptionSetting.removeAttribute('id');

module.exports = SubscriptionSetting;
