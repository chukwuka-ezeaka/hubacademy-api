const Sequelize = require('sequelize');
const Model = Sequelize.Model;
const db = require('../../config/db');

class Settlement extends Model {}

Settlement.init({
        reference: {
            type: Sequelize.STRING,
            allowNull: false,
            unique:true
        },
        integration: {
            type: Sequelize.STRING,
            allowNull: true,
            unique:false
        },
        amount: {
            type: Sequelize.STRING,
            allowNull: false,
            unique:false
        },
        currency: {
            type: Sequelize.STRING,
            allowNull: true,
            unique:false
        },
        source: {
            type: Sequelize.STRING,
            allowNull: true,
            unique:false
        },
        reason: {
            type: Sequelize.STRING,
            allowNull: true,
            unique:false
        },
        status: {
            type: Sequelize.STRING,
            allowNull: true,
            unique:false
        },
        transfer_code: {
            type: Sequelize.STRING,
            allowNull: false,
            unique:false
        },
        ps_id: {
            type: Sequelize.STRING,
            allowNull: true,
            unique:false
        },
        user_id: {
            type: Sequelize.STRING,
            allowNull: false,
            unique:false
        },
    },
    {
        sequelize: db,
        modelName: 'Settlement',
        tableName: 'settlement',
        timestamps: true
    });

module.exports = Settlement;
