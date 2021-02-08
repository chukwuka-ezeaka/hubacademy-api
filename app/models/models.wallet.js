const Sequelize = require('sequelize');
const db = require('../../config/db');
const Model = Sequelize.Model;

class Wallet extends Model {}

Wallet.init({
    // attributes
    holder_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            // This is a reference to another model
            model: 'User',

            // This is the column name of the referenced model
            key: 'id'
        }
    },
    balance: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    decimal_places: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    name: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    slug: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: true
    }
}, {
    sequelize: db,
    modelName: 'Wallet',
    tableName: 'wallets',
    timestamps: true,
    paranoid:true
});


module.exports = Wallet;
