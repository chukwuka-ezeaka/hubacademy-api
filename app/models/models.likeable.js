const Sequelize = require('sequelize');
const Model = Sequelize.Model;
const db = require('../../config/db');

class Likeable extends Model {}

Likeable.init({
    // attributes
    userId: {
        primaryKey: false,
        type: Sequelize.INTEGER,
        unique:false
    },
    likeableId: {
        primaryKey: false,
        type: Sequelize.INTEGER,
        unique:false
    },
    likeableType: {
        primaryKey: false,
        type: Sequelize.STRING,
        unique:false
    },
    typeId: {
        primaryKey: false,
        type: Sequelize.ENUM('like', 'dislike'),
        defaultValue:'like',
        unique:false
    }


}, {
    sequelize: db,
    modelName: 'Likeable',
    tableName: 'likeables',
    timestamps:true,
    paranoid:false
});

module.exports = Likeable;