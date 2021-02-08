const Sequelize = require('sequelize');
const Model = Sequelize.Model;
const db = require('../../config/db');

class RolePermission extends Model {}

RolePermission.init({
        roleId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            unique:false
        },
        permissionId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            unique:false
        }
    },
    {
        sequelize: db,
        modelName: 'RolePermission',
        tableName: 'rolepermissions',
        freezeTableName:true,
        timestamps: true
    }
);


module.exports = RolePermission;