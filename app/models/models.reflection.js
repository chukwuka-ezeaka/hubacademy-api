const Sequelize = require('sequelize');
const Model = Sequelize.Model;
const db = require('../../config/db');

class Reflection extends Model {}

Reflection.init({
    // attributes
    title: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false
    },
    author: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false
    },
    content: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false
    },
    image_link: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    },
    audio_link: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    },
    postedBy: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false
    },
    date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        unique: false
    },
    slug: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
    },

}, {
    sequelize: db,
    modelName: 'Reflection',
    tableName: 'reflections',
    timestamps: true
});

module.exports = Reflection;