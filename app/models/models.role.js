
const Sequelize = require('sequelize');
const Model = Sequelize.Model;
const db = require('../../config/db');

class Role extends Model {}

Role.init({
        name: {
            type: Sequelize.INTEGER,
            allowNull: false,
            unique:true
        }
    },
    {
        sequelize: db,
        modelName: 'Role',
        tableName: 'roles',
        timestamps: true
    });

module.exports = Role;