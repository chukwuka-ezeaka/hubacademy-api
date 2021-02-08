const Sequelize = require('sequelize');
const Model = Sequelize.Model;
const db = require('../../config/db');

class Permission extends Model {}

Permission.init({
        name: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    },
    {
        sequelize: db,
        modelName: 'Permission',
        tableName: 'permissions',
        timestamps: true
    });

module.exports = Permission;