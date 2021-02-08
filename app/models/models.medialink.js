const Sequelize = require('sequelize');
const Model = Sequelize.Model;
const db = require('../../config/db');

class MediaLink extends Model {}

MediaLink.init({
    // attributes
    title: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    },
    description: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    },
    tags: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    },
    status: {
        primaryKey: false,
        type: Sequelize.INTEGER,
        defaultValue: 1,
    },
    url: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    owner_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
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
        allowNull: true,
        unique: false,
        references: {
            // This is a reference to another model
            model: 'ContentCategory',

            // This is the column name of the referenced model
            key: 'id'
        }
    },
    type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: false,
        references: {
            // This is a reference to another model
            model: 'ContentType',

            // This is the column name of the referenced model
            key: 'id'
        }
    }

}, {
    sequelize: db,
    modelName: 'MediaLink',
    tableName: 'medialinks',
    timestamps: true,
    paranoid: true
});

module.exports = MediaLink;