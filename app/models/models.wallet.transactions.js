const Sequelize = require('sequelize');
const db = require('../../config/db');
const Model = Sequelize.Model;

class WalletTransaction extends Model {}

WalletTransaction.init({
    // attributes
    type: {
        type: Sequelize.ENUM('deposit', 'withdraw'),
        allowNull: false,
        defaultValue: 'deposit',
    },
    payable_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            // This is a reference to another model
            model: 'User',

            // This is the column name of the referenced model
            key: 'id'
        }
    },
    wallet_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            // This is a reference to another model
            model: 'Wallet',

            // This is the column name of the referenced model
            key: 'id'
        }
    },
    amount: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    confirmed: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    uuid: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    transRef: {
        type: Sequelize.TEXT,
        allowNull: true
    },
}, {
    sequelize: db,
    modelName: 'WalletTransaction',
    tableName: 'wallet_transactions',
    timestamps: true,
    paranoid:true
});


module.exports = WalletTransaction;
