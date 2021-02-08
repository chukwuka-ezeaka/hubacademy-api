const Sequelize = require('sequelize');
const Model = Sequelize.Model;
const db = require('../../config/db');

class UserRole extends Model {}

UserRole.init({
        roleId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            unique:true
        } ,
        userRoleId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            unique:false
        }
    },
    {
        sequelize: db,
        modelName: 'UserRole',
        tableName: 'userrole',
        timestamps: true
    }
);

module.exports = UserRole;