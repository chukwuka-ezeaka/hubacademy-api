const Sequelize = require('sequelize');
const Model = Sequelize.Model;
const db = require('../../config/db');

class ContentType extends Model {}

ContentType.init({
    // attributes
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    slug: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
    }

}, {
    sequelize: db,
    modelName: 'ContentType',
    tableName: 'contenttypes',
    timestamps: true
});

module.exports = ContentType;