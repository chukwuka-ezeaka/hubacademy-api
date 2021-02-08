const Sequelize = require('sequelize');
const Model = Sequelize.Model;
const db = require('../../config/db');

class Transaction extends Model {}

Transaction.init({
    // attributes
    user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: false
    },
    user_email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false
    },
    amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: false
    },
    currency: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    },
    status: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false
    },
    reference: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false
    },
    gateway_response: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    },
    message: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    },
    channel: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    },
    ip_address: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    },
    log: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    },
    customer: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    },
    plan: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    },
    fees: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    },
    authorization: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    }    ,
    order_id: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    }    ,
    paidAt: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    }
    ,transaction_date: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    }
    ,plan_object: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    }
    ,subaccount: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    }
    ,burnt: {
        type: Sequelize.INTEGER,
        allowNull: true,
        unique: false
    }
    ,createdAtPS: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    }

}, {
    sequelize: db,
    modelName: 'Transaction',
    tableName: 'transactions',
    timestamps: true,
    paranoid: true
});

module.exports = Transaction;
