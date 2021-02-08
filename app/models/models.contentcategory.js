const Sequelize = require('sequelize');
const Model = Sequelize.Model;
const db = require('../../config/db');

class ContentCategory extends Model {}

ContentCategory.init({
    // attributes
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    },
    image_url: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    },
    slug: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
    },

}, {
    sequelize: db,
    modelName: 'ContentCategory',
    tableName: 'contentcategories',
    timestamps: true
});

module.exports = ContentCategory;