const Sequelize = require('sequelize');
const Model = Sequelize.Model;
const db = require('../../config/db');

class Content extends Model {}

Content.init({
    // attributes
    title: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false
    },
    status: {
        primaryKey: false,
        type: Sequelize.ENUM('0', '1'),
        defaultValue: '1',
    },
    owner_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: false,
        references: {
            // This is a reference to another model
            model: 'User',

            // This is the column name of the referenced model
            key: 'id'
        }
    },
    category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: false,
        references: {
            // This is a reference to another model
            model: 'ContentCategory',

            // This is the column name of the referenced model
            key: 'id'
        }
    },
    contenttype_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: false,
        references: {
            // This is a reference to another model
            model: 'ContentType',

            // This is the column name of the referenced model
            key: 'id'
        }
    },
    content_media_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: false,
        references: {
            // This is a reference to another model
            model: 'MediaLink',

            // This is the column name of the referenced model
            key: 'id'
        }
    },
    art_id: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false,
        references: {
            // This is a reference to another model
            model: 'MediaLink',

            // This is the column name of the referenced model
            key: 'media_id'
        }
    },
    slug: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
    },
    free: {
        type: Sequelize.ENUM('0', '1'),
        allowNull: true,
        unique: false,
        defaultValue: '0',
    },
    sale: {
        type: Sequelize.ENUM('0', '1'),
        allowNull: true,
        unique: false,
        defaultValue: '0',

    },
    price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        unique: false
    },
    sale_price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        unique: false
    },
    currency: {
        type: Sequelize.ENUM('NGN', 'EUR', 'USD', 'PDN'),
        allowNull: true,
        unique: false,
        defaultValue: 'NGN',
    },

}, {
    sequelize: db,
    modelName: 'Content',
    tableName: 'content',
    timestamps: true,
    paranoid:true
});

module.exports = Content;