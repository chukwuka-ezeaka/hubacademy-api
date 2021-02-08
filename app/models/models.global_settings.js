const Sequelize = require('sequelize');
const db = require('../../config/db');
const Model = Sequelize.Model;

class GlobalSetting extends Model {}

GlobalSetting.init({
        collection_fee_percent: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        collection_fee_fixed: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        charge_fixed_fee_at: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        collection_fee_cap: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        payout_fee: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        payout_amount_min: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    },
    {
        sequelize: db,
        modelName: 'global_settings',
        timestamps: true
    });


module.exports = GlobalSetting;
