const Sequelize = require('sequelize');
const Model = Sequelize.Model;
const db = require('../../config/db');

class LikeCounter extends Model {}

LikeCounter.init({
    // attributes
    userId: {
        primaryKey: false,
        type: Sequelize.INTEGER,
        unique:false
    }
    ,likeableId: {
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
    },
    count: {
        primaryKey: false,
        type: Sequelize.BIGINT,
        defaultValue: 0
    }


}, {
    sequelize: db,
    modelName: 'LikeCounter',
    tableName: 'likecounter',
    paranoid:false,
    timestamps:true
});

module.exports = LikeCounter;